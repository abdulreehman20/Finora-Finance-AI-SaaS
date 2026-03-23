import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

export const authClient = createAuthClient({
  baseURL: backendURL,
  plugins: [
    usernameClient(),
    // Official Polar client plugin — enables authClient.checkout(), authClient.customer.*
    polarClient(),
  ],
});
