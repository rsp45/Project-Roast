"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";
import Image from "next/image";

const navItems = [
  { href: "/app/portfolio", label: "Dashboard", icon: "analytics" },
  { href: "/app/trades", label: "Trades", icon: "account_balance_wallet" },
  { href: "/app/ask", label: "Interrogate", icon: "psychology" },
  { href: "/app/upload", label: "Upload", icon: "upload" },
  { href: "/app/backtests", label: "Backtests", icon: "flask" },
  { href: "/app/settings", label: "Settings", icon: "settings" },
  { href: "/app/about", label: "How It Works", icon: "info" },
] as const;

export function AppSidebar({ userName, userEmail, userImage }: { userName?: string; userEmail?: string; userImage?: string | null }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top Navigation (Mobile) */}
      <nav className="md:hidden fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-2xl flex justify-between items-center h-16 px-margin">
        <div className="text-headline-sm font-headline-md font-bold text-primary dark:text-primary tracking-tighter">PROJECT ROAST</div>
        <button className="text-primary dark:text-primary hover:text-primary transition-colors duration-200 active:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>

      {/* Side Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col h-full py-margin px-stack-md bg-surface-container-low border-r border-white/5 fixed left-0 top-0 w-[280px] z-40">
        <div className="mb-stack-lg px-4">
          <div className="font-headline-sm text-headline-sm text-primary mb-stack-sm tracking-tighter font-bold">PROJECT ROAST</div>
          <div className="flex items-center gap-stack-sm mt-stack-md">
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
               {userImage ? (
                 <img src={userImage} alt={userName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <span className="material-symbols-outlined text-on-surface">person</span>
               )}
            </div>
            <div className="min-w-0">
              <div className="font-body-md text-body-md text-on-surface font-semibold truncate">{userName || "The Interrogator"}</div>
              <div className="font-caption text-caption text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> {userEmail || "AI Active"}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-unit overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-stack-md rounded-xl px-4 py-3 active:scale-[0.98] transition-all duration-300",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-medium"
                    : "text-secondary hover:bg-surface-container-high"
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-stack-lg space-y-unit border-t border-white/5 shrink-0">
          <Link href="/app/upload" className="w-full flex justify-center bg-primary-container text-on-primary-container hover:bg-primary-container/90 transition-colors py-3 rounded-DEFAULT font-body-md text-body-md font-semibold mb-stack-md">
            Upload CSV
          </Link>
          <button className="w-full flex items-center gap-stack-md text-secondary px-4 py-3 hover:bg-surface-container-high transition-all duration-300 rounded-xl">
            <span className="material-symbols-outlined">help_outline</span>
            <span className="font-body-md text-body-md">Help</span>
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-stack-md text-secondary px-4 py-3 hover:bg-surface-container-high transition-all duration-300 rounded-xl">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-body-md">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
