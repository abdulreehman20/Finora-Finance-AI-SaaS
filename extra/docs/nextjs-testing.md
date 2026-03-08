
## 3️⃣ Next.js Integration Guide


Below is a **frontend-only guide** for each feature using `better-auth/client` exactly as in the docs.

### 3.1 Setup: Next.js Auth Client

Install the client (if not already):

```bash
npm install better-auth
# or
bun add better-auth
```

Create `lib/auth-client.ts` in your Next.js app:

```ts
// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/auth",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        // global handler when Better Auth says 2FA is required
        window.location.href = "/2fa";
      },
    }),
  ],
});
```

Set `NEXT_PUBLIC_API_URL` in your Next.js `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/auth
```

All examples below import `authClient` from this file.

---

### 3.2 Change / Set New Password

#### a) Change password (user-initiated)

```ts
// app/settings/security/change-password-action.ts
"use server";

import { authClient } from "@/lib/auth-client";

export async function changePasswordAction(prevState: any, formData: FormData) {
  "use server";

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const { data, error } = await authClient.changePassword({
    currentPassword,
    newPassword,
    revokeOtherSessions: true,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
```

Use this in a form component and show success/error messages.

#### b) Request password reset (forgot password)

```ts
// app/forgot-password/actions.ts
"use server";

import { authClient } from "@/lib/auth-client";

export async function requestResetAction(prev: any, formData: FormData) {
  "use server";

  const email = formData.get("email") as string;

  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
```

On your `reset-password` page:

```tsx
// app/reset-password/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset successfully");
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <button type="submit">Reset password</button>
    </form>
  );
}
```

#### c) Set password for OAuth user (server side)

Per docs, this is **server-only**:

```ts
// app/api/set-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth"; // your backend auth instance

export async function POST(req: NextRequest) {
  const { newPassword } = await req.json();

  const headers = Object.fromEntries(req.headers.entries());

  await auth.api.setPassword({
    body: { newPassword },
    headers,
  });

  return NextResponse.json({ success: true });
}
```

---

### 3.3 Change / Update Email

```tsx
// app/settings/account/change-email-form.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/dashboard",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Check your new email inbox for a verification link.");
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="New email"
      />
      <button type="submit">Change email</button>
    </form>
  );
}
```

---

### 3.4 Two-Factor Authentication (2FA)

#### a) Enable 2FA and show QR

```tsx
// app/settings/security/enable-2fa.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import QRCode from "react-qr-code";

export function Enable2FA() {
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  async function onEnable(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await authClient.twoFactor.enable({
      password,
      issuer: "Finora AI",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTotpURI(data?.totpURI ?? null);
    setBackupCodes(data?.backupCodes ?? null);
  }

  return (
    <div>
      <form onSubmit={onEnable}>
        <input
          type="password"
          placeholder="Current password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Enable 2FA</button>
      </form>

      {totpURI && (
        <div>
          <h3>Scan this QR with your Authenticator app</h3>
          <QRCode value={totpURI} />
        </div>
      )}

      {backupCodes && (
        <div>
          <h3>Backup Codes</h3>
          <ul>
            {backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

#### b) Verify TOTP code after user scans QR

```tsx
// app/2fa/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TwoFAPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit code"
      />
      <button type="submit">Verify</button>
    </form>
  );
}
```

#### c) Sign-in handling when 2FA is enabled

```ts
// somewhere in login flow
await authClient.signIn.email(
  { email, password },
  {
    async onSuccess(ctx) {
      if ("twoFactorRedirect" in ctx.data && ctx.data.twoFactorRedirect) {
        // redirect to /2fa page
        window.location.href = "/2fa";
      } else {
        window.location.href = "/dashboard";
      }
    },
  },
);
```

---

### 3.5 Update User Information

```tsx
// app/settings/profile/profile-form.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

export function ProfileForm() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setImage(session.user.image ?? "");
    }
  }, [session]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await authClient.updateUser({
      name,
      image,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated");
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={image} onChange={(e) => setImage(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### 3.6 Delete User

```tsx
// app/settings/account/delete-account.tsx
"use client";

import { authClient } from "@/lib/auth-client";

export function DeleteAccountButton() {
  async function onClick() {
    const password = prompt("Type your password to confirm deletion (leave empty for email-based confirmation):");

    const { error } = await authClient.deleteUser(
      password ? { password } : {},
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Check your email (if configured) or you have been deleted.");
    window.location.href = "/";
  }

  return (
    <button onClick={onClick} className="text-red-600">
      Delete my account
    </button>
  );
}
```

---

### 3.7 Session Management (list & revoke)

```tsx
// app/settings/security/sessions.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type DeviceSession = Awaited<
  ReturnType<typeof authClient.listSessions>
>;

export function SessionsList() {
  const [sessions, setSessions] = useState<DeviceSession | null>(null);

  useEffect(() => {
    authClient.listSessions().then(setSessions);
  }, []);

  async function revoke(token: string) {
    await authClient.revokeSession({ token });
    setSessions(await authClient.listSessions());
  }

  async function revokeOthers() {
    await authClient.revokeOtherSessions();
    setSessions(await authClient.listSessions());
  }

  async function revokeAll() {
    await authClient.revokeSessions();
    window.location.href = "/login";
  }

  if (!sessions) return <p>Loading sessions...</p>;

  return (
    <div>
      <button onClick={revokeOthers}>Sign out of other devices</button>
      <button onClick={revokeAll}>Sign out everywhere</button>
      <ul>
        {sessions.map((s) => (
          <li key={s.session.token}>
            <span>{s.session.userAgent}</span>
            <span>{s.session.ipAddress}</span>
            <button onClick={() => revoke(s.session.token)}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 3.8 Social Sign-On (Google & Facebook)

Frontend sign-in is exactly as in the OAuth docs.

```tsx
// app/login/social-buttons.tsx
"use client";

import { authClient } from "@/lib/auth-client";

export function SocialButtons() {
  async function signInWithGoogle() {
    await authClient.signIn.social({ provider: "google" });
  }

  async function signInWithFacebook() {
    await authClient.signIn.social({ provider: "facebook" });
  }

  return (
    <div>
      <button onClick={signInWithGoogle}>Continue with Google</button>
      <button onClick={signInWithFacebook}>Continue with Facebook</button>
    </div>
  );
}
```

Configure redirect URIs in the Google/Facebook consoles to point to:

- `http://localhost:8000/api/auth/callback/google`
- `http://localhost:8000/api/auth/callback/facebook`

(as per the OAuth docs’ default `redirectURI` pattern).

---

### 3.9 Using the OpenAPI Reference in Next.js

If you want to embed the Better Auth OpenAPI UI inside your Next.js app, you can just iframe it:

```tsx
// app/docs/auth/page.tsx
export default function AuthDocsPage() {
  return (
    <iframe
      src="http://localhost:8000/api/auth/reference"
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
}
```

---

### 4. Summary

- **Backend**: All requested features are configured via official Better Auth options & plugins:
  - Change/reset password, change email, update user, delete user
  - 2FA plugin (TOTP, with DB schema for `two_factor` + `twoFactorEnabled`)
  - Session listing & revocation
  - Rate limiting (120 requests / 60s)
  - Google & Facebook OAuth
  - OpenAPI reference at `/api/auth/reference`
  - CLI `generate` executed and Drizzle schema aligned.
- **Postman**: You can hit all endpoints under `http://localhost:8000/api/auth`, using the Scalar UI as the authoritative reference for headers, paths, and schemas.
- **Next.js**: Use `better-auth/client` + `twoFactorClient` to build UI for each feature as shown in the examples.