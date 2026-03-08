import { AccountView } from "@daveyplate/better-auth-ui"
import { accountViewPaths } from "@daveyplate/better-auth-ui/server"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    return (
        <main className="container p-4 md:p-6"><AccountView path={path} /></main>
    )
}

// The newly created dynamic route covers the following paths by default:

// /auth/sign-in – Sign in via email/password and social providers
// /auth/sign-up – New account registration
// /auth/magic-link – Email login without a password
// /auth/forgot-password – Trigger email to reset forgotten password
// /auth/two-factor – Two-factor authentication
// /auth/recover-account – Recover account via backup code
// /auth/reset-password – Set new password after receiving reset link
// /auth/sign-out – Log the user out of the application
// /auth/callback – Internal route to handle Auth callbacks
// /auth/accept-invitation – Accept an invitation to an organization
// Ensure that any links to the authentication process utilize these routes accordingly. All routes will render the <AuthView /> component and automatically handle navigation and authentication flow.