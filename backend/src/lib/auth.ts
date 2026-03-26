import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "../db";
import { account, session, subscription, user, verification } from "../db/schema/index";
import {
  deleteAccountEmailTemplate,
  passwordResetSuccessTemplate,
  resetPasswordEmailTemplate,
  verifyEmailTemplate,
} from "../mailers/templates/reset.password";
import { eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", // Latest API version as of Stripe SDK v20.0.0
});

// ── Resend Client ────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const appName = process.env.BETTER_AUTH_APP_NAME ?? "Finora AI";

const schema = {
  user,
  session,
  account,
  verification,
  subscription,
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  appName,
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL! ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_BACKEND_URL! ?? "http://localhost:7000",
  ],

  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, _request) => {
      await resend.emails.send({
        from: process.env.MAILER_SENDER!,
        to: user.email,
        subject: "Reset your password",
        html: resetPasswordEmailTemplate(url),
      });
    },
    onPasswordReset: async ({ user }, _request) => {
      await resend.emails.send({
        from: process.env.MAILER_SENDER!,
        to: user.email,
        subject: "Password reset successfully",
        html: passwordResetSuccessTemplate(),
      });
    },
  },

  user: {
    changeEmail: { enabled: true, updateEmailWithoutVerification: false },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }, _request) => {
        await resend.emails.send({
          from: process.env.MAILER_SENDER!,
          to: user.email,
          subject: "Confirm account deletion",
          html: deleteAccountEmailTemplate(url),
        });
      },
    },
  },

  rateLimit: { enabled: true, window: 60, max: 120 },
  // trustedProxies: ["loopback"],
  // trustedProxies: true,

  // advanced: {
  //   disableOriginCheck: true,
  //   disableCSRFCheck: true, // Add this to keep CSRF disabled as per the log hint
  //   useProxyHeaders: true
  // },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    username(),
    openAPI(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_PRICE_ID!,
            // $10/mo — set up in Stripe Dashboard
          },
        ],
        /**
         * Called when a subscription is updated via webhook
         * (e.g. renewal, status change, plan change)
         */
        onSubscriptionComplete: async ({ subscription: sub }) => {
          // After successful checkout, mark user as pro
          const isPro =
            sub.status === "active" || sub.status === "trialing";
          await db
            .update(user)
            .set({ plan: isPro ? "pro" : "free" })
            .where(eq(user.id, sub.referenceId));
        },
        onSubscriptionUpdate: async ({ subscription: sub }) => {
          // When a subscription updates (renewal, plan change, etc.)
          const isPro =
            sub.status === "active" || sub.status === "trialing";
          await db
            .update(user)
            .set({ plan: isPro ? "pro" : "free" })
            .where(eq(user.id, sub.referenceId));
        },
        onSubscriptionCancel: async () => {
          // Subscription set to cancel at period end — access continues until deleted
        },
        onSubscriptionDeleted: async ({ subscription: sub }) => {
          // Subscription is fully gone — revert to free
          await db
            .update(user)
            .set({ plan: "free" })
            .where(eq(user.id, sub.referenceId));
        },
      },
    }),
  ],

  emailVerification: {
    sendVerificationEmail: async ({ user, url }, _request) => {
      await resend.emails.send({
        from: process.env.MAILER_SENDER!,
        to: user.email,
        subject: "Verify your email address",
        html: verifyEmailTemplate(url),
      });
    },
  },

  advanced: { disableOriginCheck: true },
});
