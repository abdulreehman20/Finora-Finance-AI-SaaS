"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Bot, ChartBar, LayoutDashboard, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserButton } from "@daveyplate/better-auth-ui";

const iconClass = "h-5 w-5 shrink-0 text-sidebar-foreground/80 group-hover/sidebar:text-sidebar-foreground";

export function SidebarComponent() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className={iconClass} />,
    },
    {
      label: "Transaction",
      href: "/dashboard/transaction",
      icon: <Receipt className={iconClass} />,
    },
    {
      label: "Report",
      href: "/dashboard/report",
      icon: <ChartBar className={iconClass} />,
    },
    {
      label: "AI Assistant",
      href: "/dashboard/ai-assistant",
      icon: <Bot className={iconClass} />,
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "flex h-full min-h-screen shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-sidebar">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <SidebarLink key={link.href + link.label} link={link} />
              ))}
            </div>
          </div>
          <div className="pt-2">
            <UserButton size="lg" />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-sidebar-foreground"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-sidebar-primary" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-sidebar-foreground"
      >
        Finora
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-sidebar-foreground"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-sidebar-primary" />
    </Link>
  );
};
