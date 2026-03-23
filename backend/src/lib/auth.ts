import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
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

// ── Resend Client ────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const appName = process.env.BETTER_AUTH_APP_NAME ?? "Finora AI";

// ── Polar Client ─────────────────────────────────────────────────────────────
// server: "sandbox" for testing, "production" for live
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") ?? "sandbox",
});

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

    // ── Polar Plugin (official @polar-sh/better-auth) ───────────────────────
    polar({
      client: polarClient,

      // Automatically create a Polar customer when a new user signs up
      createCustomerOnSignUp: true,

      use: [
        // ── Checkout Plugin ──────────────────────────────────────────────────
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!,
              slug: "pro", // /api/auth/checkout/pro
            },
          ],
          // Frontend success page — {CHECKOUT_ID} is replaced by Polar
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/settings?tab=billing&checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),

        // ── Portal Plugin ────────────────────────────────────────────────────
        // Exposes authClient.customer.state(), .portal(), .subscriptions.list()
        portal(),

        // ── Webhooks Plugin ──────────────────────────────────────────────────
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,

          // Fires when a subscription becomes active (new purchase or renewal)
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data?.customerId;
            if (!customerId) return;

            // Look up user by their Polar customerId stored as externalAccountId
            // Better Auth stores the Polar customer ID in the account table
            try {
              const accounts = await db
                .select()
                .from(account)
                .where(eq(account.accountId, customerId));

              const userId = accounts[0]?.userId;
              if (userId) {
                await db
                  .update(user)
                  .set({ plan: "pro" } as any)
                  .where(eq(user.id, userId));
                console.log(`[Polar] User ${userId} upgraded to pro`);
              }
            } catch (err) {
              console.error("[Polar] onSubscriptionActive error:", err);
            }
          },

          // Fires when a subscription is canceled or revoked
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data?.customerId;
            if (!customerId) return;

            try {
              const accounts = await db
                .select()
                .from(account)
                .where(eq(account.accountId, customerId));

              const userId = accounts[0]?.userId;
              if (userId) {
                await db
                  .update(user)
                  .set({ plan: "free" } as any)
                  .where(eq(user.id, userId));
                console.log(`[Polar] User ${userId} downgraded to free`);
              }
            } catch (err) {
              console.error("[Polar] onSubscriptionCanceled error:", err);
            }
          },

          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data?.customerId;
            if (!customerId) return;

            try {
              const accounts = await db
                .select()
                .from(account)
                .where(eq(account.accountId, customerId));

              const userId = accounts[0]?.userId;
              if (userId) {
                await db
                  .update(user)
                  .set({ plan: "free" } as any)
                  .where(eq(user.id, userId));
                console.log(`[Polar] User ${userId} revoked to free`);
              }
            } catch (err) {
              console.error("[Polar] onSubscriptionRevoked error:", err);
            }
          },
        }),
      ],
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
