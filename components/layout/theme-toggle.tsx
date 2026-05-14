"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">浅色模式</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">深色模式</span>
        </>
      )}
    </Button>
  );
}
