Act as a **senior full-stack developer**.

I have already set up **BetterAuth** in my **Express backend**, and you can check all the authentication configuration inside the file:

`backend/src/lib/auth.ts`

I have also tested the authentication APIs, and they are **properly configured and working correctly**.

Now I want to **integrate BetterAuth into my frontend application**.

My requirement is that **all authentication logic should remain managed by the backend**, while the **frontend will only use BetterAuth UI components** to handle authentication views and provide a good user experience.

### Requirements

1. **Set up BetterAuth properly in my frontend application.**

2. **Add the `AuthView` component** in the frontend and include all the authentication views that are defined in my Express backend `auth.ts` file, such as:

   * Sign In
   * Sign Up
   * Email Verification
   * and other related authentication views.

3. When setting up the **`AuthUIProvider`** in the application, configure it with the following features:

   * `social → Google`
   * `emailOTP`
   * `changeEmail`
   * `signUp`
   * `account`
   * `multiSession`
   * `onSessionChange`
   * `avatar`

4. Create a **Dashboard page** in the frontend.
   Inside this page, implement the **Sidebar component from Aceternity UI**:
   [https://ui.aceternity.com/components/sidebar](https://ui.aceternity.com/components/sidebar)

   The sidebar should include the following navigation links:

   * Dashboard
   * Transaction
   * Report
   * AI Assistant
   * Settings

5. At the **bottom of the sidebar**, add the **BetterAuth `UserButton` UI component**.

### Important Note

Implement everything **strictly according to the BetterAuth documentation**. Do **not add any custom logic or features beyond the documentation**.
