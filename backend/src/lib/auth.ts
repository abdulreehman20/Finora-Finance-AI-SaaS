import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "../db";
import { account, session, user, verification } from "../db/schema/index";
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
  apiVersion: "2026-02-25.clover",
});
// ── Resend Client ────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const appName = process.env.BETTER_AUTH_APP_NAME ?? "Finora AI";

const schema = {
  user,
  session,
  account,
  verification,
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
            name: "free",
            priceId: "free", // Placeholder since free plan doesn't usually have a stripe price in a typical implementation, or we just leave it out
          },
          {
            name: "pro",
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
          },
        ],
        onSubscriptionUpdate: async ({ event, subscription }) => {
          // When a user upgrades or cancels, update their plan in the `user` table
          const isPro = subscription.status === "active" || subscription.status === "trialing";
          
          await db
            .update(user)
            .set({ plan: isPro ? "pro" : "free" })
            .where(eq(user.id, subscription.referenceId));
        },
        onSubscriptionDeleted: async ({ event, subscription }) => {
          // On deletion, revert to free
          await db
            .update(user)
            .set({ plan: "free" })
            .where(eq(user.id, subscription.referenceId));
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
