"use client";

import { UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Transactions", href: "/dashboard/transactions" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Ai Chats", href: "/dashboard/chat" },
  { name: "Settings", href: "/dashboard/settings" },
];

export function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[oklch(0.06_0.01_145)]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        {/* Left — Logo + Name */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Finora
          </span>
        </Link>

        {/* Center — Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-white/10 -z-10" />
                )}
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-green-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right — User Button */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <UserButton
              size={"icon"}
              className="[&_button]:ring-green-500/40 [&_button]:hover:ring-green-500/60"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
