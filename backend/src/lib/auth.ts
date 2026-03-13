import Stripe from "stripe"
import { stripe } from "@better-auth/stripe"
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

const schema = {
  user,
  session,
  account,
  verification,
};


// // ── Stripe Client ───────────────────────────────────────────────────────────
// const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2026-02-25.clover", // Updated to match the expected Stripe API version
// })

// ── Resend Client ───────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const appName = process.env.BETTER_AUTH_APP_NAME ?? "Finora AI";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  appName,
  // Base URL of this Express server; used for callbacks & redirects
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL! ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_BACKEND_URL! ?? "http://localhost:7000",
  ],

  database: drizzleAdapter(db, { provider: "pg", schema }),

  /**
   * Email + password authentication with:
   * - required email verification for sign-in
   * - reset password emails
   * - change / update password endpoint
   */

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
      console.log(`Password for user ${user.email} has been reset.`);

      await resend.emails.send({
        from: process.env.MAILER_SENDER!,
        to: user.email,
        subject: "Password reset successfully",
        html: passwordResetSuccessTemplate(),
      });
    },
  },

  /**
   * User management:
   * - change email with verification
   * - hard delete user with optional email confirmation
   */
  user: {
    // Allow updating unverified emails without verification only when current email is not verified
    changeEmail: { enabled: true, updateEmailWithoutVerification: false },
    deleteUser: {
      enabled: true,
      // Optional verification email before deletion; follows Better Auth docs
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

  /**
   * Built-in rate limiter: 120 requests per 60 seconds.
   * Note: only applies to client-initiated Better Auth HTTP endpoints.
   */
  rateLimit: { enabled: true, window: 60, max: 120 },

  /**
   * Social sign-on providers. Client IDs and secrets are required
   * and should be configured via environment variables.
   */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  /**
   * Core + plugins:
   * - username: username support on top of email/password
   * - twoFactor: TOTP/OTP two factor authentication
   * - openAPI: interactive OpenAPI reference at /api/auth/reference
   */

  // Use appName as issuer in authenticator apps
  plugins: [
    username(),
    openAPI(),
    // stripe({
    //   stripeClient,
    //   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    //   createCustomerOnSignUp: true,
    // })

  ],

  /* Email verification for sign-up and sign-in flows. */
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
