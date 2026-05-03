"use client";

import {
  BarChart3,
  FlaskConical,
  MessageSquareText,
  Settings,
  Table2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/app/portfolio", label: "Portfolio", icon: BarChart3 },
  { href: "/app/upload", label: "Upload", icon: Upload },
  { href: "/app/trades", label: "Trades", icon: Table2 },
  { href: "/app/ask", label: "Ask AI", icon: MessageSquareText },
  { href: "/app/backtests", label: "Backtests", icon: FlaskConical },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-dvh w-[272px] shrink-0 flex-col border-r border-foreground/10 bg-background">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="font-[var(--font-display)] text-lg tracking-tight">
          Project Roast
        </div>
        <div className="rounded-full bg-foreground/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-muted">
          v1
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground/85 hover:bg-foreground/10 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-background"
                    : "text-foreground/70 group-hover:text-foreground",
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-5 text-xs text-muted">
        Evidence-first analytics.
      </div>
    </aside>
  );
}
