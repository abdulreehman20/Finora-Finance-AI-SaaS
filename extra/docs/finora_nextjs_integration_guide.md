# Finora AI — Next.js Frontend Integration Guide

> **Scope**: Everything in this guide is derived directly from the backend source code. No endpoints, fields, or behavior are assumed or invented.

---

## Table of Contents

1. [Backend Setup & Environment](#1-backend-setup--environment)
2. [Better Auth — Client Setup & UI Integration](#2-better-auth--client-setup--ui-integration)
3. [Transaction API](#3-transaction-api)
4. [Report API](#4-report-api)

---

## 1. Backend Setup & Environment

### 1.1 Backend Overview

| Item | Value |
|------|-------|
| Runtime | Node.js / Bun with `tsx` |
| Framework | Express 5 |
| Port | **7000** (hard-coded in [src/index.ts](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/index.ts)) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (via `@neondatabase/serverless` / `pg`) |
| Auth | Better Auth |
| Storage | Cloudinary (receipt uploads) |
| Email | Resend |
| AI | Google Gemini (`@google/genai`) |
| API Docs | Scalar UI at `/api/docs` |

### 1.2 Environment Variables

Create [.env](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/.env) in your **backend** root, using [.env.example](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/.env.example) as reference:

```env
# PostgreSQL connection string (Neon recommended)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Your Next.js app URL — must match exactly what the browser uses
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_APP_NAME="Finora AI"
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"

# Resend (transactional email)
RESEND_API_KEY="re_..."
MAILER_SENDER="Finora AI <no-reply@yourdomain.com>"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Gemini AI
GEMINI_API_KEY="..."

# Cloudinary (receipt scanning)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

In your Next.js project create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000
```

### 1.3 Run & Migrate Commands

```bash
# Install dependencies
bun install          # or npm install

# Push schema directly to the database (development only)
bun run db:push

# Generate SQL migration files
bun run db:generate

# Apply pending migrations
bun run db:migrate

# Open Drizzle Studio (DB browser)
bun run db:studio

# Start dev server (tsx watch on port 7000)
bun run dev          # or npm run dev
```

> [!IMPORTANT]
> Cron jobs (`initializeCrons`) only start when `NODE_ENV=development`. Do not set `NODE_ENV=production` locally if you need recurring/report scheduling.

### 1.4 CORS Configuration

The backend allows only the origin defined in `NEXT_PUBLIC_APP_URL`. Allowed HTTP methods: `GET`, `POST`, `PUT`, `DELETE`. Credentials (cookies) are enabled.

```
# Backend src/index.ts — CORS config (for reference)
origin: process.env.NEXT_PUBLIC_APP_URL   // e.g. http://localhost:3000
credentials: true                   // cookies required for session
methods: ["GET", "POST", "PUT", "DELETE"]
```

---

## 2. Better Auth — Client Setup & UI Integration

### 2.1 How Auth Works

- Better Auth handles **all** auth endpoints at `/api/auth/*` on the **backend** (port 7000).
- The backend uses **email + password** with mandatory email verification, **Google OAuth**, and the **username** plugin.
- Session identity is propagated to all other routes via a cookie-based session: the [attachUserFromSession](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/middlewares/auth.middleware.ts#5-31) middleware reads the cookie on every request and sets `req.user`.
- You must send `credentials: "include"` (or `withCredentials: true`) from the frontend so cookies are carried.

### 2.2 Install Better Auth Client in Next.js

```bash
npm install better-auth
```

### 2.3 Create the Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Point to the Express backend, NOT Next.js
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000",
  plugins: [usernameClient()],
});

// Re-export commonly used hooks/methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  forgetPassword,
  resetPassword,
  changeEmail,
  changePassword,
  deleteUser,
  updateUser,
} = authClient;
```

### 2.4 Session Provider (App Router)

```tsx
// app/layout.tsx
import { SessionProvider } from "better-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### 2.5 Auth Flows — Exact API Contracts

All requests below go to the **backend** at `http://localhost:7000` and are handled by Better Auth internally. You use the `authClient` methods; the SDK constructs the raw HTTP calls for you.

---

#### Sign Up (Email + Password)

```typescript
// components/SignUpForm.tsx
import { signUp } from "@/lib/auth-client";

async function handleSignUp(name: string, email: string, password: string, username: string) {
  const { data, error } = await signUp.email({
    name,
    email,
    password,
    username,       // from the username plugin
    callbackURL: "/dashboard",  // redirect after email verification
  });
  if (error) console.error(error.message);
}
```

> [!NOTE]
> `requireEmailVerification: true` is set in the backend. The user **cannot sign in** until they click the verification link sent to their email via Resend.

---

#### Sign In (Email + Password)

```typescript
import { signIn } from "@/lib/auth-client";

const { data, error } = await signIn.email({
  email: "user@example.com",
  password: "secret123",
  callbackURL: "/dashboard",
});
```

**Success** — a session cookie is set automatically by the browser.

**Error example**:
```json
{ "message": "Email not verified" }
```

---

#### Sign In with Google (OAuth)

```typescript
import { signIn } from "@/lib/auth-client";

await signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
// Browser is redirected to Google consent page then back.
```

---

#### Get Current Session

```typescript
// In any Server Component or API Route
import { auth } from "@/lib/auth-server"; // see §2.6 for server-side helper
const session = await auth.api.getSession({ headers: headers() });

// In a Client Component
import { useSession } from "@/lib/auth-client";
const { data: session, isPending } = useSession();
// session.user: { id, name, email, emailVerified, image, username, displayUsername }
```

---

#### Sign Out

```typescript
import { signOut } from "@/lib/auth-client";

await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
```

---

#### Send / Re-send Verification Email

```typescript
import { sendVerificationEmail } from "@/lib/auth-client";

await sendVerificationEmail({ email: "user@example.com", callbackURL: "/dashboard" });
```

---

#### Forgot Password

```typescript
import { forgetPassword } from "@/lib/auth-client";

await forgetPassword({ email: "user@example.com", redirectTo: "/reset-password" });
// Backend sends reset link via Resend
```

---

#### Reset Password

```typescript
import { resetPassword } from "@/lib/auth-client";

// Token comes from the URL query param on the reset-password page
await resetPassword({ newPassword: "newSecret123", token: searchParams.get("token")! });
```

---

#### Change Password

```typescript
import { changePassword } from "@/lib/auth-client";

await changePassword({
  currentPassword: "oldPass",
  newPassword: "newPass",
  revokeOtherSessions: true, // log out other devices
});
```

---

#### Change Email

```typescript
import { changeEmail } from "@/lib/auth-client";

await changeEmail({
  newEmail: "newemail@example.com",
  callbackURL: "/settings",
});
// Backend sends verification to newEmail before applying the change
```

---

#### Delete Account

```typescript
import { deleteUser } from "@/lib/auth-client";

// Backend sends a confirmation email before deletion
await deleteUser({ callbackURL: "/goodbye" });
```

---

#### Update User Profile

```typescript
import { updateUser } from "@/lib/auth-client";

await updateUser({ name: "New Display Name", image: "https://..." });
```

---

### 2.6 Server-Side Auth Helper (Next.js Route Handlers)

```typescript
// lib/auth-server.ts
import { betterAuth } from "better-auth";
// You only need this if you are doing server-side session checks in Next.js Route Handlers.
// For most cases, calling the backend API with the browser's cookie is enough.

// Alternatively: just call the backend API from a Route Handler
// passing along the incoming request headers (which contain the session cookie).
import { headers } from "next/headers";

export async function getServerSession() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
    headers: Object.fromEntries(headers()),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { session, user } = await res.json();
  return { session, user };
}
```

---

## 3. Transaction API

### 3.1 Overview

All transaction endpoints are under `/api/transaction`. They require an **active session cookie** — Better Auth sets this automatically after sign-in. The backend reads the cookie via the [attachUserFromSession](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/middlewares/auth.middleware.ts#5-31) middleware and injects `req.user.id`.

**Base URL**: `http://localhost:7000/api/transaction`

### 3.2 Shared Headers

```
Cookie: <session-cookie>    // set automatically by browser with credentials: "include"
Content-Type: application/json  // for POST/PUT with a body
```

> [!IMPORTANT]
> Always pass `credentials: "include"` in every `fetch` call so the session cookie is sent.

### 3.3 Enums (exact values from backend)

| Enum | Values |
|------|--------|
| `type` | `"INCOME"` \| `"EXPENSE"` |
| `recurringInterval` | `"DAILY"` \| `"WEEKLY"` \| `"MONTHLY"` \| `"YEARLY"` |
| `paymentMethod` | `"CARD"` \| `"BANK_TRANSFER"` \| `"MOBILE_PAYMENT"` \| `"AUTO_DEBIT"` \| `"CASH"` \| `"OTHER"` |
| `status` (read-only) | `"PENDING"` \| `"COMPLETED"` \| `"FAILED"` |

---

### 3.4 GET `/api/transaction/all` — List Transactions

Fetches a paginated list of the authenticated user's transactions.

| | |
|--|--|
| **Method** | `GET` |
| **Auth** | Session cookie required |

**Query Parameters** (all optional):

| Param | Type | Notes |
|-------|------|-------|
| `keyword` | `string` | Search across `title` and `category` (case-insensitive) |
| `type` | `"INCOME"` \| `"EXPENSE"` | Filter by transaction type |
| `recurringStatus` | `"RECURRING"` \| `"NON_RECURRING"` | Filter by recurring flag |
| `pageSize` | `number` | Items per page; default `20` |
| `pageNumber` | `number` | 1-based page index; default `1` |

**Success Response `200`**:
```json
{
  "message": "Transaction fetched successfully",
  "transactions": [
    {
      "id": "uuid",
      "userId": "user-id",
      "type": "EXPENSE",
      "title": "Groceries",
      "amount": 5000,
      "category": "Food",
      "receiptUrl": null,
      "recurringInterval": null,
      "nextRecurringDate": null,
      "lastProcessed": null,
      "isRecurring": false,
      "description": "Weekly grocery run",
      "date": "2025-03-01T00:00:00.000Z",
      "status": "COMPLETED",
      "paymentMethod": "CARD",
      "createdAt": "2025-03-01T10:00:00.000Z",
      "updatedAt": "2025-03-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "pageSize": 20,
    "pageNumber": 1,
    "totalCount": 42,
    "totalPages": 3,
    "skip": 0
  }
}
```

**Error `401`** (no/invalid session):
```json
{ "message": "User not authenticated" }
```

**Next.js Example** — React hook:

```typescript
// hooks/useTransactions.ts
import { useEffect, useState } from "react";

interface Filters {
  keyword?: string;
  type?: "INCOME" | "EXPENSE";
  recurringStatus?: "RECURRING" | "NON_RECURRING";
  pageSize?: number;
  pageNumber?: number;
}

export function useTransactions(filters: Filters = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.type) params.set("type", filters.type);
    if (filters.recurringStatus) params.set("recurringStatus", filters.recurringStatus);
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
    if (filters.pageNumber) params.set("pageNumber", String(filters.pageNumber));

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/all?${params}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters.keyword, filters.type, filters.recurringStatus, filters.pageSize, filters.pageNumber]);

  return { data, loading, error };
}
```

---

### 3.5 GET `/api/transaction/:id` — Get Transaction by ID

| | |
|--|--|
| **Method** | `GET` |
| **Auth** | Session cookie required |
| **URL Param** | `:id` — transaction UUID |

**Success Response `200`**:
```json
{
  "message": "Transaction fetched successfully",
  "transaction": { /* full transaction object as above */ }
}
```

**Error `404`**:
```json
{ "message": "Transaction not found" }
```

**Example**:
```typescript
async function getTransaction(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/${id}`,
    { credentials: "include" }
  );
  return res.json(); // { message, transaction }
}
```

---

### 3.6 POST `/api/transaction/create` — Create Transaction

| | |
|--|--|
| **Method** | `POST` |
| **Auth** | Session cookie required |
| **Content-Type** | `application/json` |

**Request Body** (all required unless marked optional):

```typescript
{
  title: string;                // min 1 character
  description?: string;        // optional
  type: "INCOME" | "EXPENSE";  // required
  amount: number;               // positive number, min 1
  category: string;             // min 1 character
  date: string | Date;          // ISO 8601 datetime string or Date object
  isRecurring: boolean;         // defaults to false
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  receiptUrl?: string;          // optional
  paymentMethod?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "AUTO_DEBIT" | "CASH" | "OTHER";
                                // defaults to "CASH"
}
```

**Success Response `201`**:
```json
{
  "message": "Transacton created successfully",
  "transaction": { /* full transaction object */ }
}
```

**Validation Error `400`**:
```json
{ "message": "Transaction type must either INCOME or EXPENSE" }
```

**Example**:
```typescript
async function createTransaction(body: object) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/create`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json(); // { message, transaction }
}

// Usage
await createTransaction({
  title: "Salary",
  type: "INCOME",
  amount: 5000,
  category: "Employment",
  date: new Date().toISOString(),
  isRecurring: true,
  recurringInterval: "MONTHLY",
  paymentMethod: "BANK_TRANSFER",
});
```

---

### 3.7 PUT `/api/transaction/update/:id` — Update Transaction

| | |
|--|--|
| **Method** | `PUT` |
| **Auth** | Session cookie required |
| **URL Param** | `:id` — transaction UUID |
| **Content-Type** | `application/json` |

**Request Body**: All fields from the create schema are **optional** (partial update):

```typescript
{
  title?: string;
  description?: string;
  type?: "INCOME" | "EXPENSE";
  amount?: number;
  category?: string;
  date?: string | Date;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  receiptUrl?: string;
  paymentMethod?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "AUTO_DEBIT" | "CASH" | "OTHER";
}
```

**Success Response `200`**:
```json
{ "message": "Transaction updated successfully" }
```

**Error `404`**:
```json
{ "message": "Transaction not found" }
```

**Example**:
```typescript
async function updateTransaction(id: string, body: object) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/update/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}
```

---

### 3.8 DELETE `/api/transaction/delete/:id` — Delete Transaction

| | |
|--|--|
| **Method** | `DELETE` |
| **Auth** | Session cookie required |
| **URL Param** | `:id` — transaction UUID |

**Success Response `200`**:
```json
{ "message": "Transaction deleted successfully" }
```

**Error `404`**:
```json
{ "message": "Transaction not found" }
```

**Example**:
```typescript
async function deleteTransaction(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/delete/${id}`,
    { method: "DELETE", credentials: "include" }
  );
  return res.json();
}
```

---

### 3.9 PUT `/api/transaction/duplicate/:id` — Duplicate Transaction

Clones a transaction with a new UUID. The duplicate is **not** recurring and has `"Duplicate - "` prepended to the title.

| | |
|--|--|
| **Method** | `PUT` |
| **Auth** | Session cookie required |
| **URL Param** | `:id` — source transaction UUID |

**Success Response `200`**:
```json
{
  "message": "Transaction duplicated successfully",
  "data": { /* full new transaction object, isRecurring: false */ }
}
```

**Error `404`**:
```json
{ "message": "Transaction not found" }
```

**Example**:
```typescript
async function duplicateTransaction(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/duplicate/${id}`,
    { method: "PUT", credentials: "include" }
  );
  return res.json(); // { message, data }
}
```

---

### 3.10 POST `/api/transaction/scan-receipt` — Scan Receipt (AI OCR)

Uploads a receipt image to Cloudinary, runs it through **Google Gemini**, and returns extracted transaction fields. **Does NOT require a session** based on the controller (no `userId` check), but a session is still attached if present.

| | |
|--|--|
| **Method** | `POST` |
| **Auth** | No explicit user check in this endpoint |
| **Content-Type** | `multipart/form-data` |
| **Form Field** | `receipt` — the image file |

**Success Response `200`**:
```json
{
  "message": "Reciept scanned successfully",
  "data": {
    "title": "Starbucks Coffee",
    "amount": 6.50,
    "date": "2025-03-01",
    "description": "Grande Latte",
    "category": "Food & Drink",
    "paymentMethod": "CARD",
    "type": "EXPENSE",
    "receiptUrl": "https://res.cloudinary.com/..."
  }
}
```

**Error response** (when fields missing or scan fails):
```json
{ "message": "Reciept scanned successfully", "data": { "error": "Receipt missing required information" } }
```

**Example** — React component using `FormData`:
```typescript
async function scanReceipt(file: File) {
  const formData = new FormData();
  formData.append("receipt", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/scan-receipt`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
      // Do NOT set Content-Type — browser sets multipart boundary automatically
    }
  );
  return res.json(); // { message, data }
}
```

**UI Flow**: Upload → call [scanReceipt(file)](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/services/transaction.service.ts#253-311) → pre-fill the Create Transaction form with returned fields → user reviews and submits.

---

### 3.11 POST `/api/transaction/bulk-transaction` — Bulk Create

| | |
|--|--|
| **Method** | `POST` |
| **Auth** | Session cookie required |
| **Content-Type** | `application/json` |

**Request Body**:
```typescript
{
  transactions: Array<{
    title: string;
    description?: string;
    type: "INCOME" | "EXPENSE";
    amount: number;           // 1 – 1,000,000,000
    category: string;
    date: string | Date;
    isRecurring: boolean;
    recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
    receiptUrl?: string;
    paymentMethod?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "AUTO_DEBIT" | "CASH" | "OTHER";
  }>;  // min 1, max 300 items
}
```

**Success Response `200`**:
```json
{
  "message": "Bulk transaction inserted successfully",
  "insertedCount": 5,
  "success": true
}
```

**Example**:
```typescript
async function bulkCreateTransactions(transactions: object[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/bulk-transaction`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
    }
  );
  return res.json();
}
```

---

### 3.12 DELETE `/api/transaction/bulk-delete` — Bulk Delete

| | |
|--|--|
| **Method** | `DELETE` |
| **Auth** | Session cookie required |
| **Content-Type** | `application/json` |

**Request Body**:
```typescript
{
  transactionIds: string[];  // array of UUIDs, min 1 item
}
```

**Success Response `200`**:
```json
{
  "message": "Transaction deleted successfully",
  "success": true,
  "deletedCount": 3
}
```

**Error `404`** (none of the IDs found):
```json
{ "message": "No transactions found" }
```

**Example**:
```typescript
async function bulkDeleteTransactions(transactionIds: string[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/bulk-delete`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionIds }),
    }
  );
  return res.json();
}
```

---

## 4. Report API

### 4.1 Overview

All report endpoints are under `/api/report`. All require an active session cookie.

**Base URL**: `http://localhost:7000/api/report`

The Report API provides:
- **History** — paginated list of past reports stored in the `report` table.
- **On-demand generation** — generates an AI-powered financial report for a custom date range, emails it to the user, and persists a record.
- **Scheduling settings** — enable/disable automated monthly reports and configure the day of month.

---

### 4.2 GET `/api/report/all` — Get Report History

| | |
|--|--|
| **Method** | `GET` |
| **Auth** | Session cookie required |

**Query Parameters**:

| Param | Type | Default |
|-------|------|---------|
| `pageSize` | `number` | `20` |
| `pageNumber` | `number` | `1` |

**Success Response `200`**:
```json
{
  "message": "Reports history fetched successfully",
  "reports": [
    {
      "id": "uuid",
      "userId": "user-id",
      "period": "March 1 - 31, 2025",
      "sentDate": "2025-03-31T00:00:00.000Z",
      "status": "SENT",
      "createdAt": "2025-03-31T00:00:00.000Z",
      "updatedAt": "2025-03-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "pageSize": 20,
    "pageNumber": 1,
    "totalCount": 5,
    "totalPages": 1,
    "skip": 0
  }
}
```

**Report `status` values**: `"SENT"` | `"PENDING"` | `"FAILED"` | `"NO_ACTIVITY"`

**Error `401`**:
```json
{ "message": "User not authenticated" }
```

**Example**:
```typescript
// hooks/useReports.ts
import { useEffect, useState } from "react";

export function useReports(pageSize = 20, pageNumber = 1) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/report/all?pageSize=${pageSize}&pageNumber=${pageNumber}`,
      { credentials: "include" }
    )
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [pageSize, pageNumber]);

  return { data, loading };
}
```

---

### 4.3 GET `/api/report/generate` — Generate Report On-Demand

Generates a financial summary for a given date range using Gemini AI, emails it to the authenticated user via Resend, and saves a record to the `report` table.

| | |
|--|--|
| **Method** | `GET` |
| **Auth** | Session cookie required |

**Query Parameters** (both required):

| Param | Type | Notes |
|-------|------|-------|
| `from` | `string` | Start date — any value parseable by `new Date()` e.g. `"2025-03-01"` |
| `to` | `string` | End date — e.g. `"2025-03-31"` |

**Success Response `200`** (when transactions exist in the period):
```json
{
  "message": "Report generated successfully",
  "period": "March 1 - 31, 2025",
  "summary": {
    "income": 5000,
    "expenses": 2000,
    "balance": 3000,
    "savingsRate": 60.0,
    "topCategories": [
      { "name": "Food", "amount": 800, "percent": 40 },
      { "name": "Transport", "amount": 600, "percent": 30 },
      { "name": "Entertainment", "amount": 300, "percent": 15 },
      { "name": "Utilities", "amount": 200, "percent": 10 },
      { "name": "Health", "amount": 100, "percent": 5 }
    ]
  },
  "insights": "<AI-generated text string>"
}
```

**Success Response `200`** (no transactions in period):
```json
{ "message": "Report generated successfully" }
```
> The service returns `null` when there are no transactions or all amounts are 0; the controller spreads this as an empty body alongside `message`.

**Error `401`**:
```json
{ "message": "User not authenticated" }
```

**Example**:
```typescript
async function generateReport(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/report/generate?${params}`,
    { credentials: "include" }
  );
  return res.json();
}

// Usage — generate current month's report
const now = new Date();
const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

const report = await generateReport(from, to);
```

**UI Flow**:
1. Show a date range picker (month selector or custom range).
2. Call [generateReport(from, to)](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/services/report.service.ts#60-207) on button click.
3. Display a loading spinner — the AI call takes a few seconds.
4. Render `summary`, `insights`, and `topCategories` (chart/table).
5. Inform the user that a copy was emailed to them.
6. Refresh report history (`/api/report/all`) to show the new record.

---

### 4.4 PUT `/api/report/update-setting` — Update Report Scheduling

Creates or updates the automated monthly report schedule for the authenticated user. The backend upserts the row — safe to call on first use.

| | |
|--|--|
| **Method** | `PUT` |
| **Auth** | Session cookie required |
| **Content-Type** | `application/json` |

**Request Body** (all fields optional — partial update):

```typescript
{
  isEnabled?: boolean;    // true = opt in to automated monthly reports, false = opt out
  dayOfMonth?: number;   // integer 1–28, day of month to receive the report; default 1
}
```

**Success Response `200`**:
```json
{ "message": "Reports setting updated successfully" }
```

**Validation Error `400`**:
```json
{ "message": "Number must be less than or equal to 28" }
```

**Error `401`**:
```json
{ "message": "User not authenticated" }
```

**Behaviour notes**:
- When `isEnabled: true` — `nextReportDate` is recalculated based on `dayOfMonth` so the cron fires on the correct day.
- When `isEnabled: false` — `nextReportDate` is set to `null`, pausing automated delivery.
- If no setting row exists yet, a new one is inserted (so no pre-flight `GET` is needed).

**Example**:
```typescript
async function updateReportSetting(settings: { isEnabled?: boolean; dayOfMonth?: number }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/report/update-setting`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }
  );
  return res.json();
}

// Enable monthly reports on the 5th of each month
await updateReportSetting({ isEnabled: true, dayOfMonth: 5 });

// Disable automated reports
await updateReportSetting({ isEnabled: false });
```

**UI Flow** — Settings page:
1. Render a toggle for "Enable monthly reports" and a number input (1–28) for day of month.
2. On toggle or day change, call [updateReportSetting(...)](file:///C:/Users/pc/OneDrive/Desktop/Data%20%28E%29/Finora-AI/backend/src/services/report.service.ts#210-280).
3. Show success toast: _"Report settings updated"_.

---

## 5. Quick Reference

### All Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `ALL` | `/api/auth/*` | Better Auth — handles all auth flows |
| `GET` | `/api/health` | Health check (no auth) |
| `GET` | `/api/transaction/all` | List transactions (paginated + filters) |
| `GET` | `/api/transaction/:id` | Get one transaction |
| `POST` | `/api/transaction/create` | Create transaction |
| `PUT` | `/api/transaction/update/:id` | Update transaction (partial) |
| `DELETE` | `/api/transaction/delete/:id` | Delete transaction |
| `PUT` | `/api/transaction/duplicate/:id` | Duplicate transaction |
| `POST` | `/api/transaction/scan-receipt` | OCR receipt to extract fields |
| `POST` | `/api/transaction/bulk-transaction` | Bulk create (max 300) |
| `DELETE` | `/api/transaction/bulk-delete` | Bulk delete by ID array |
| `GET` | `/api/report/all` | Report history (paginated) |
| `GET` | `/api/report/generate` | On-demand AI report |
| `PUT` | `/api/report/update-setting` | Update scheduling settings |

> [!NOTE]
> Admin routes (`/api/admin/*`) are mounted **only in non-production** environments (`NODE_ENV !== "production"`) and are not documented here as they are not for frontend use.

### Auth Booleans to Know

| Feature | Value in backend |
|---------|-----------------|
| Email verification required to sign in | ✅ `requireEmailVerification: true` |
| Google OAuth | ✅ enabled |
| Username plugin | ✅ enabled |
| Two-factor auth | ❌ not enabled (`twoFactor` plugin not in `plugins[]`) |
| Change email with verification | ✅ `updateEmailWithoutVerification: false` |
| Delete user | ✅ enabled with confirmation email |
| Rate limit | 120 requests / 60 seconds (auth endpoints only) |
