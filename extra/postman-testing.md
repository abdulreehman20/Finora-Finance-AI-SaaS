## 2️⃣ Postman Testing Guide

**Base URL:** `http://localhost:8000`  
**Auth base path:** `/api/auth` (everything below is relative to this)  
**Important:** Many endpoints require an authenticated session cookie. Use Postman’s cookie jar:

1. First call a **sign-in** endpoint.
2. Postman will store the `auth_session` cookie.
3. Subsequent calls that require auth will automatically include it.

Also, you now have an **OpenAPI reference UI** at:

- `GET http://localhost:8000/api/auth/reference`

Use that as the ground truth for all endpoint paths & methods; it’s generated directly by the official `openAPI` plugin.

Below I’ll give concrete examples for each requested feature using the standard paths from the Better Auth docs (all under `/api/auth`).

---

### 2.1 Change / Set New Password

#### a) Change password (user is logged in)

**Endpoint**

- **URL**: `POST http://localhost:8000/api/auth/change-password`
- **Headers**:
  - `Content-Type: application/json`
  - Cookie: automatically from prior sign-in
- **Body (JSON)**:

```json
{
  "currentPassword": "oldpassword1234",
  "newPassword": "newpassword1234",
  "revokeOtherSessions": true
}
```

**Example response**

```json
{
  "success": true
}
```

**Testing steps in Postman**

1. Sign in with `POST /api/auth/sign-in/email` (per Better Auth “Email & Password” docs) to get a session cookie.
2. Call `POST /api/auth/change-password` with the above body.
3. Expect `200` and `success: true`.
4. Try signing in again using the **new** password to confirm.

#### b) Reset password via email (forgot password)

**1. Request reset**

- **URL**: `POST http://localhost:8000/api/auth/request-password-reset`
- **Body**:

```json
{
  "email": "john.doe@example.com",
  "redirectTo": "http://localhost:3000/reset-password"
}
```

You’ll receive an email from Resend with a link containing `?token=...`.

**2. Reset password using token**

- **URL**: `POST http://localhost:8000/api/auth/reset-password`
- **Body**:

```json
{
  "newPassword": "newpassword1234",
  "token": "<token-from-email>"
}
```

**Example response**

```json
{
  "success": true
}
```

**Testing steps**

1. Trigger `request-password-reset`.
2. Inspect the email (Resend dashboard / logs).
3. Copy the `token` query param.
4. Call `POST /reset-password` with that token and a new password.
5. Sign in using the new password.

> **Set password for OAuth users**  
> This is **server-only** (`auth.api.setPassword` per docs). You don’t hit it directly from Postman; you’d usually expose a small internal handler that calls `auth.api.setPassword` after verifying the user.

---

### 2.2 Change / Update Email

The docs define the client/server APIs (`authClient.changeEmail`, `auth.api.changeEmail`). Over HTTP this is exposed as a Better Auth endpoint and appears in your OpenAPI reference.

**Endpoint (typical path; verify in `/api/auth/reference`)**

- **URL**: `POST http://localhost:8000/api/auth/change-email`
- **Headers**:
  - `Content-Type: application/json`
  - Cookie: current session
- **Body**:

```json
{
  "newEmail": "new-email@example.com",
  "callbackURL": "http://localhost:3000/dashboard"
}
```

**Response**

```json
{
  "success": true
}
```

Behavior (per official docs):

- Sends a verification email to the **new** email address.
- Email is updated only after the user clicks the link.

**Testing**

1. Sign in as the user.
2. Call `POST /api/auth/change-email` as above.
3. Check the new-email inbox for the verification link sent by Resend.
4. Click the link → you should be redirected to `callbackURL`.
5. Confirm by calling `GET /api/auth/get-session` and checking `user.email`.

---

### 2.3 Two-Factor Authentication (2FA)

All paths below are **under `/api/auth`**, and the plugin uses the same names as in the docs.

#### a) Enable 2FA (TOTP)

**Endpoint**

- **URL**: `POST http://localhost:8000/api/auth/two-factor/enable`
- **Body**:

```json
{
  "password": "current-password",
  "issuer": "Finora AI"
}
```

**Response**

```json
{
  "totpURI": "otpauth://totp/Finora%20AI:email@example.com?secret=...",
  "backupCodes": ["123456", "789012", "..."]
}
```

**Testing steps**

1. Sign in as the user.
2. Call `POST /two-factor/enable`.
3. Copy `totpURI` and paste it into an authenticator app (or use a QR generator).
4. Store the `backupCodes` securely.

#### b) Get TOTP URI again (optional)

- **URL**: `POST http://localhost:8000/api/auth/two-factor/get-totp-uri`
- **Body**:

```json
{ "password": "current-password" }
```

#### c) Verify TOTP

- **URL**: `POST http://localhost:8000/api/auth/two-factor/verify-totp`
- **Body**:

```json
{
  "code": "123456",
  "trustDevice": true
}
```

If correct, 2FA is fully enabled and the device is trusted.

#### d) Disable 2FA

- **URL**: `POST http://localhost:8000/api/auth/two-factor/disable`
- **Body**:

```json
{
  "password": "current-password"
}
```

#### e) OTP-based flows

If you later configure `otpOptions.sendOTP` in the plugin, you can use:

- `POST /two-factor/send-otp`
- `POST /two-factor/verify-otp`

Exactly as in the docs.

---

### 2.4 Update User Information

**Update basic profile**

- **URL**: `POST http://localhost:8000/api/auth/update-user`  
  (Confirm exact path in `/api/auth/reference` under the user/account group.)
- **Headers**: cookie from sign-in.
- **Body example**:

```json
{
  "name": "New Name",
  "image": "https://example.com/new-image.png"
}
```

**Response**

```json
{
  "user": {
    "id": "...",
    "name": "New Name",
    "image": "https://example.com/new-image.png",
    ...
  }
}
```

**Testing**

1. Sign in.
2. Call the update endpoint with new data.
3. Call `GET /api/auth/get-session` and confirm updated `user` fields.

---

### 2.5 Delete User

Per docs, this is enabled via `user.deleteUser.enabled: true` and supports multiple verification modes.

**Basic delete (password-based)**

- **URL**: `POST http://localhost:8000/api/auth/delete-user`
- **Body**:

```json
{
  "password": "current-password"
}
```

**Flow with email verification (we configured `sendDeleteAccountVerification`)**

1. Client calls `POST /delete-user` with **no** body or just `callbackURL`.
2. Better Auth sends a verification email via Resend using the URL we receive in `sendDeleteAccountVerification`.
3. User clicks the link → Better Auth deletes the account, then redirects (optionally) to your callback URL.

**Testing**

1. Sign in as a non-admin test user.
2. Call `POST /delete-user` with `password` or empty body (depending on flow you want).
3. Check email for deletion link and click it.
4. Try `GET /get-session` → should fail (user deleted).

---

### 2.6 Proper Session Management (list & revoke)

Endpoints correspond to `listSessions`, `revokeSession`, `revokeOtherSessions`, `revokeSessions` in the docs and will show up in `/api/auth/reference`.

Typical patterns:

- **List sessions**
  - `GET http://localhost:8000/api/auth/list-sessions`
  - Response: array of active sessions for the current user.

- **Revoke single session**
  - `POST http://localhost:8000/api/auth/revoke-session`
  - Body:

    ```json
    { "token": "<session-token-to-revoke>" }
    ```

- **Revoke other sessions (except current)**
  - `POST http://localhost:8000/api/auth/revoke-other-sessions`
  - Body: `{}`

- **Revoke all sessions**
  - `POST http://localhost:8000/api/auth/revoke-sessions`
  - Body: `{}`

**Testing**

1. Sign in from two different browsers/devices.
2. Use Postman (with one of the sessions) to:
   - List sessions.
   - Revoke a specific `token`.
   - Or call `revoke-other-sessions`.
3. Try using the revoked session in another client; it should be invalid.

---

### 2.7 Rate Limiting (120 req / 60s)

Configured via:

```60:65:src/lib/auth.ts
rateLimit: {
  enabled: true,
  window: 60,
  max: 120,
},
```

**Behavior**

- In production, any client IP exceeding 120 requests in 60 seconds across Better Auth endpoints gets `429 Too Many Requests`.
- Header `X-Retry-After` indicates when to retry.

**Testing**

1. In Postman, send a loop of >120 quick requests to, say, `GET /api/auth/get-session` from the same environment.
2. After hitting the limit, responses will be `429`, and `X-Retry-After` shows the wait time.

---

### 2.8 Social Sign-On (Google & Facebook)

Per OAuth docs, sign-in uses `/sign-in/social`.

**Google sign-in**

- **URL**: `POST http://localhost:8000/api/auth/sign-in/social`
- **Body**:

```json
{
  "provider": "google"
}
```

This returns a redirect URL or issues a redirect (depending on how you call it). In practice you hit this from the browser, not directly via Postman.

**Facebook sign-in**

Same endpoint with `"provider": "facebook"`.

**Testing with Postman**

1. Normally you test OAuth via the browser / frontend, not Postman.
2. For debugging, you can:
   - Inspect `/api/auth/reference` to see the exact shape of `signInSocial`.
   - Use a browser to hit your frontend Next.js route that calls `authClient.signIn.social({ provider: "google" })`.
3. Confirm that users created via Google/Facebook appear in your DB and `get-session` returns them.

---

### 2.9 OpenAPI Reference

Already enabled:

```73:80:src/lib/auth.ts
plugins: [
  username(),
  twoFactor({ issuer: appName }),
  openAPI(),
],
```

**Usage**

- Visit: `http://localhost:8000/api/auth/reference`
- You’ll see an interactive Scalar UI with:
  - All Better Auth endpoints (core + plugins)
  - Example requests & responses
  - Ability to “Try it out” directly from the browser

This OpenAPI view is the canonical, official listing of endpoints and their exact paths for your instance.

---
