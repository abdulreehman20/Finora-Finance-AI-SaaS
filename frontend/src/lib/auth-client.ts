import { usernameClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

export const authClient = createAuthClient({
  baseURL: backendURL,
  plugins: [
    usernameClient(),
    // stripeClient({
    //   subscription: true //if you want to enable subscription management
    // })
  ],
});
