## Prompt 01

Hey — act as a senior full-stack developer and do the following tasks:

Step 01 --> Create a Transaction Server Action
@beautifulMention -- In the transaction actions.ts file, create server actions that perform CRUD operations according to my requirements:

- Get all transactions — fetch from {{baseURL}}/api/transaction/all.
- Get single transaction — fetch from {{baseURL}}/api/transaction/{id}.
- Create transaction — POST to {{baseURL}}/api/transaction/create.
- Update transaction — PATCH/PUT to {{baseURL}}/api/transaction/update/{id}.
- Duplicate transaction — POST to {{baseURL}}/api/transaction/duplicate/{id}.
- Delete transaction — DELETE to {{baseURL}}/api/transaction/delete/{id}.
- Scan receipt transaction — POST to {{baseURL}}/api/transaction/scan-receipt.
- Create bulk transactions — POST to {{baseURL}}/api/transaction/bulk-transaction.
- Delete bulk transactions — POST/DELETE to {{baseURL}}/api/transaction/bulk-delete.

Step 02 --> Create a Report Server Action
@beautifulMention  -- In the reports actions.ts file, create server actions for report operations:

- Get all reports — fetch from {{baseURL}}/api/report/all.
- Generate report — request {{baseURL}}/api/report/generate?from=2026-02-01&to=2026-03-03.\
- Update report settings — call {{baseURL}}/api/update-setting.

Step 03 --> Integrate these server actions to my transatcion frontend
@beautifulMention @beautifulMention @beautifulMention @beautifulMention @beautifulMention 

- Convert helper functions from page.tsx into a new helper.ts file.
- Move the transaction form component into add-transaction-form.tsx.
- Move the bulk import modal component into bulk-import-transaction.tsx.
- Convert the data table into transaction-data-table.tsx.
- Import these components into page.tsx, ensuring everything works correctly.

Then:
- Convert helper functions from page.tsx into a new helper.ts file.
- Move the transaction form component into add-transaction-form.tsx.
- Move the bulk import modal component into bulk-import-transaction.tsx.
- Convert the data table into transaction-data-table.tsx.
- Import these components into page.tsx, ensuring everything works correctly.

Step 04 --> Now fix some UI issue
- When multiple transactions are selected in the data table for deletion, clicking delete should open a modal with Cancel and Confirm buttons. On Confirm, delete those transactions.
- When deleting a single transaction, clicking the delete button should open a modal with Cancel and Confirm. On Confirm, delete the transaction.
- Fix the data table pagination — it is not working properly. Ensure pagination works correctly.

Step 05 --> Add Send Report Functionalty
- The report page has a resend report feature that is currently not working. If required, create a backend API to send reports to the user when the resend action is triggered from the frontend.
- Then create a sendReport server action on the frontend and ensure the resend feature works correctly

Step 06 --> Create a Analytics API on my backend
@beautifulMention @beautifulMention @beautifulMention 
I have an analytics controller from a previous MERN project. Convert that analytics controller code into our current backend requirements and add it to the backend.

Step 07 --> Create dashboard page 
- Create a dashboard page (@beautifulMention ) matching the provided image and layout. Include the exact welcome message and an Add Transaction button like in the reference.
- Add a timeline control so users can view data by different time ranges.
- Render dynamic cards showing Available Balance, Total Card, Total Expenses, and Saving Rate. These must display proper dynamic data via server actions.
- Add a Transaction Overview chart showing total transactions.
- Add an Expense Breakdown chart (pie/donut) that visualizes expense categories with distinct colors. Design this breakdown component to match the reference image.

Use the chain-of-thought approach: first plan, then implement step-by-step so everything works correctly.

After implementing, test all features and ensure everything works exactly according to my requirements and image preferences.

Make sure all implemented features are fully tested and functional for a developer to review.


---

## Prompt 02
**Act as a senior Frontend Developer.**

Update the Next.js frontend app according to the exact requirements below. Use the existing backend, Better Auth, and shadcn UI. Do **not** add unrelated features.

---

## Authentication / Sign-in

1. On the **login page**: check session using the Better Auth client/session helper.

   * If the user is already authenticated → **redirect to Dashboard**.
   * If not authenticated → stay on the login page.

---

## UI & Data Tables

1. **Dropdown styling** in data tables:

   * Change dropdown text color from white → **black**.
   * Change dropdown hover background color from blue → **green** (match site theme).
2. **Pagination:** replace current pagination with the shadcn Radix pagination component (`https://ui.shadcn.com/docs/components/radix/pagination`) across all data tables (transactions & reports).

   * Ensure pagination logic works with the backend (correct page fetch when data grows).
   * Align pagination visually with table layout.
3. Ensure **reports page** pagination is updated and working.

---

## Transactions / Reports / Settings Updates

* Implement previous Transactions / Reports / Settings feature updates (sheets, bulk import flow, toasts, etc.) as previously specified and ensure they work with updated pagination & styling.
* **Settings page:** Remove the **Appearance** tab (leave Settings & Billing).

---

## Componentization & Code Cleanup (strict)

For **all route `page.tsx` files** across the app:

* Convert **all helper functions** in each `page.tsx` into a `lib/helper.ts` file.
* Move **all constants** from each `page.tsx` into a separate `constants` file.
* Convert **all UI code** into separate components. Then **import** and **render** those components inside `page.tsx`.

  * I want `page.tsx` files to contain **only imports and component rendering** — no UI logic or markup inside them.
  * Use consistent lowercase filenames (e.g., `footer.tsx`, `cta-section.tsx`).

Example (for each route):

* `page.tsx` → only: `import X from './components/x'; export default function Page(){ return <X/> }`
* `lib/helper.ts` → moved helper functions
* `constants.ts` → moved constants
* `components/` → UI components

---

## AI Chat Page UI Update

* Remove the top heading area that contains the logo (left) and delete chat button (right). Do **not** show that top bar.
* Make the chat UI width match the dashboard content width (same container width as the rest of the dashboard).
* Layout: **left sidebar** (recent chats list) + **right** chat panel (messages).
* Ensure responsive behavior and match dashboard spacing / theme.

---

## Testing, Lint & Format (final QA)

* Run the project **linting & formatting** tools and fix issues (use existing Biome/ESLint/Prettier or project tooling).
* Manually test all updated components and pages to ensure they work as specified (auth redirect, pagination, sheets, bulk import flow, toasts, charts, Recent Transactions table, AI chat layout, etc.).
* Do **not** create production builds. Only run lint/format and test components locally.

---

## Rules & Deliverables

* Follow existing backend contracts and Better Auth session helpers (do not change backend).
* Use shadcn UI where requested.
* Keep changes modular, typed (TSX), and consistent with project conventions.
* Deliver updated files, and a short README listing changed files and how to run lint/format and manual tests.
