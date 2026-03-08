"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { usePathname } from "next/navigation";

const appBaseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function AuthPage() {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AuthView pathname={pathname} redirectTo={`${appBaseURL}/dashboard`} />
    </main>
  );
}
