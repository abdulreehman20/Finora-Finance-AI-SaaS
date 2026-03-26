import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

export const authClient = createAuthClient({
  baseURL: backendURL,
  plugins: [
    usernameClient(),
    // Official Better Auth Stripe client plugin — enables authClient.subscription.*
    stripeClient({
      subscription: true, // enable subscription management
    }),
  ],
});
