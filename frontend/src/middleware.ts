import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000";
  const cookieHeader = request.headers.get("cookie") || "";

  // Call the backend get-session endpoint to verify authentication
  try {
    const res = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    const session = await res.json();
    if (!session || !session.session) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // If verification fails, redirect to sign-in
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
