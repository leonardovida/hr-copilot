"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// TODO: resolve the ts-ignore issue
// @ts-ignore
export function MainNav({ className, ...props }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <a
        href="/"
        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
      >
        Talent Agent 💡
      </a>
      <a
        href="/jobs"
        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/jobs" ? "text-primary" : "text-muted-foreground"}`}
      >
        Job Descriptions 📕
      </a>
    </nav>
  );
}
