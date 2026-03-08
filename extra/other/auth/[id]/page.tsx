"use client"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
            <AuthView
                client={authClient}
                // This ensures "Forgot Password" links and "Verify" links 
                // point back to your Next.js app, not the backend port.
                navigate={(path) => window.location.href = path}
                onSuccess={() => {
                    window.location.href = "/dashboard";
                }}
            />
            {/* <AuthView view="SIGN_IN" />
            {/* AuthView automatically detects the path: /auth/sign-in, /auth/sign-up, etc. */}
            {/* <AuthView
                onSuccess={(session, activeView) => {
                    if (activeView === "sign-in" || activeView === "sign-up") {
                        window.location.href = "/dashboard"
                    }
                }}
            /> */} */}
        </div>
    )
}


// import { AuthView } from "@daveyplate/better-auth-ui"
// import { authViewPaths } from "@daveyplate/better-auth-ui/server"

// export const dynamicParams = false

// export function generateStaticParams() {
//     return Object.values(authViewPaths).map((path) => ({ path }))
// }

// export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
//     const { path } = await params

//     return (
//         <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
//             <AuthView path={path} />
//         </main>
//     )
// }