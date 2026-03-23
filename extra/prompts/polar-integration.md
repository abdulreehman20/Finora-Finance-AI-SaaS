
**Act as a senior full-stack developer.**

Update both frontend and backend per the requirements below. Use the existing backend APIs and auth (no extra endpoints unless required for payments). Use **Axios** for API calls and follow current project conventions.

---

## Tasks

1. **Recent Transactions (Frontend)**

   * Make the *Recent Transactions* component dynamic: fetch recent transactions from the existing backend “get transaction” API and render them live when a user creates a transaction.
   * Use existing API routes (do not invent new endpoints). Implement client/server actions as appropriate.

2. **Mobile Navbar (Frontend)**

   * Update `DashboardNavbar` to show a **hamburger button on mobile only**.
   * On mobile tap, open a **shadcn Sheet** containing all nav links and the user button. Desktop behavior unchanged.

3. **Pagination (Frontend)**

   * Add **shadcn pagination** to the **Transactions** and **Reports** data tables.
   * Combine pagination UI with the backend API responses so large datasets page correctly. Ensure page requests load the correct subset of data.

4. **Payments & Subscriptions (Backend + Frontend)**

   * Integrate **subscription payments** using the **Polar** plugin via the Better Auth plugin docs (Polar payments plugin).
   * Implement subscription model: **$10 / month** recurring plan.
   * Add required backend models (subscription, invoices) and endpoints if missing, following the official plugin docs.
   * Implement frontend subscription flow (checkout, webhooks handling, subscription status check).
   * After implementation, provide a short list of credentials & setup items I must configure (API keys, webhook URLs, merchant account settings, etc.) so I can enable Polar in my account.

5. **Plan Restrictions (Backend + Frontend)**

   * Enforce **Free plan** restrictions:

     * Max **30 transactions** total.
     * **No bulk import** access.
     * Analytics limited to **last 7 days** only.
   * **Paid plan** (subscribed) has full access (unlimited transactions, bulk import, full analytics).
   * Ensure checks occur server-side (auth + subscription validation) and UI hides/disables restricted features for free users.

---

## Requirements & Constraints

* Use **shadcn UI** components for sheets, pagination, and other UI elements. shadcn UI
* Use **Better Auth** session helpers for auth & session checks (frontend + backend). Better Auth
* Use **Axios** for API calls in server actions / client actions.
* Do not change existing backend API contracts unless absolutely necessary for subscription integration — if changes are required, document them clearly.
* Provide graceful UI states & toasts for success/error flows.
* Ensure mobile responsiveness and accessibility.

---

## Deliverables

1. Updated **Recent Transactions** component (dynamic).
2. Mobile hamburger → sheet added to `DashboardNavbar`.
3. Transactions & Reports tables wired to **shadcn pagination** and backend pagination logic.
4. Backend & frontend Polar subscription integration (checkout, webhooks, subscription status).
5. Server-side enforcement of free/paid plan restrictions and frontend UI gating.
6. A brief **setup doc** listing required Polar credentials & config (API keys, webhook endpoints, env vars) and steps to verify the integration.
7. Short QA checklist and notes on how to test each flow (transactions, pagination, subscription, plan restrictions).

---

## Acceptance Criteria

* Recent transactions update in real time after create.
* Mobile navbar sheet opens only on mobile and shows links + user button.
* Pagination works end-to-end with backend for both transactions & reports.
* Subscription checkout works and subscription status persists.
* Free-plan restrictions are enforced server-side; UI reflects restrictions.
* No console errors; flows tested locally.

---

Implement these changes exactly as specified and provide updated files, the Polar setup checklist, and testing instructions.
