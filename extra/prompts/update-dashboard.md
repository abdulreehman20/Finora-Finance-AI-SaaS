**Act as a senior Full-Stack developer.**

Update the Next.js frontend app to implement the UI/UX and integration changes described below. **Use existing backend APIs and contracts only**. Do not add unrelated features.

---

## Deliverables / Requirements

### Dashboard Page

* Add a **Recent Transactions** table below the charts that renders the latest transactions (use existing API).
* Add subtle **gradient backgrounds** to dashboard cards and chart areas to improve realism.

### Transactions Page

* **Create Transaction**: convert current dialog to a **shadcn Sheet** component.

  * Add an **AI Scan Receipt** option inside the sheet (UI toggle/button) as shown in reference image.
  * Add **Transaction Type** select (two options: `income`, `expense`) and then the rest of the form fields exactly as per the reference image.
* **Pagination**: replace current pagination with **shadcn pagination** component and update the pagination logic so it works correctly with the backend.
* **Toasts**: show toast notifications for add / duplicate / update / delete actions (success & error).
* **Bulk Import**: update bulk import flow:

  * Allow CSV to include `description`, `date`, and `payment method` fields and map them during import.
  * After upload, show a confirmation modal/sheet with the parsed rows and a **Back** and **Confirm Import** button.
  * If import errors occur, display the errors in that modal and allow user to go back and fix fields (as per reference image flow).

### Reports Page

* Convert the **Report Settings** dialog into a **shadcn Sheet** and add the specific form fields shown in the reference image. Ensure the sheet saves settings via the backend API.

### Settings Page

* Implement **tabbed UI** with three tabs: `Settings`, `Appearance`, `Billing` (content as per reference).
* Ensure the **BetterAuth user menu button** links directly to this Settings page and opens the `Settings` tab.
* Update reports table pagination on Settings (if present) to **shadcn pagination** and ensure it works.
* Update the user settings button color to match the site **green** theme.

### AI Chat Page

* Integrate the **Vercel Chatbot UI** features ([https://github.com/vercel/chatbot](https://github.com/vercel/chatbot)) so the AI Chat page matches that UI/UX (client-side UI only). Connect to existing chat endpoints if available.

---

## Integration & Tech Notes

* Use **shadcn UI** components for sheets, pagination, and UI consistency.
* Keep all components modular (e.g., `transaction-data-table.tsx`, `add-transaction-sheet.tsx`, `bulk-import-sheet.tsx`).
* Use the existing API endpoints and auth/session helpers (BetterAuth) already implemented in the app.
* Show toast notifications using the project’s toast utility or a shadcn-compatible toast system.
* Ensure full **mobile responsiveness** and accessibility.
* Run manual tests for each workflow (create, edit, duplicate, delete, bulk import, generate/send reports, pagination, session redirects).

---

## Acceptance Criteria

1. All UI changes implemented as specified (sheet, pagination, toasts, tabs).
2. Bulk import flow shows parsed data, errors, and confirm/back behavior.
3. Pagination works end-to-end with backend for transactions & reports.
4. Recent Transactions table renders correct latest data.
5. BetterAuth user button routes to Settings tab and unauthenticated access remains protected.
6. AI Chat page UI matches Vercel Chatbot UI and connects to chat endpoints if available.
7. No console errors; UX tested on mobile & desktop.
8. Provide a short README note listing changed files and how to test these flows locally.

---

Implement these changes and then test all features thoroughly. Provide the updated files, run instructions, and a short verification checklist when complete.
