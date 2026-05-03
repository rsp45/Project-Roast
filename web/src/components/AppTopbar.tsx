"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AppTopbar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-foreground/10 bg-background px-6 py-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{userName}</div>
        <div className="truncate text-xs text-muted">{userEmail}</div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 bg-background px-4 text-xs font-semibold text-foreground/90 transition-colors hover:bg-foreground/10"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  );
}
