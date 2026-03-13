"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || theme === undefined;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border border-border bg-background/60 backdrop-blur-sm hover:bg-background"
    >
      <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-400" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

