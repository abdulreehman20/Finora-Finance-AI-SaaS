/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserButton } from "@daveyplate/better-auth-ui";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/chat", label: "AI Chats" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="finora-green-bg flex h-8 w-8 items-center justify-center rounded-lg shadow-md shadow-emerald-500/40" />
          <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            Finora
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 rounded-full bg-card/60 px-2 py-1 text-sm shadow-sm ring-1 ring-border md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname?.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isActive &&
                    "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 hover:text-brand-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <UserButton size="lg" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "flex items-center gap-2 sm:hidden",
              )}
            >
              <Avatar size="sm">
                <AvatarFallback>
                  <UserIcon className="size-3" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                Navigation
              </DropdownMenuLabel>
              {navLinks.map((link) => (
                <DropdownMenuItem asChild key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                Account
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 size-3" />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOutIcon className="mr-2 size-3" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

