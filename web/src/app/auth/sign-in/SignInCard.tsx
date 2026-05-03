"use client";

import { signIn } from "next-auth/react";

export function SignInCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-panel p-6 text-panel-ink shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-border">
      <div className="font-[var(--font-display)] text-2xl leading-7 tracking-tight">
        Sign in
      </div>
      <div className="mt-2 text-sm text-muted">
        Use Google to access your workspace.
      </div>
      <button
        type="button"
        onClick={() =>
          signIn("google", {
            callbackUrl: "/app/portfolio",
          })
        }
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-panel-ink px-4 text-sm font-semibold text-panel transition-colors hover:bg-panel-ink/90"
      >
        Continue with Google
      </button>
      <div className="mt-4 text-xs leading-5 text-muted">
        By signing in, you agree to keep credentials private and avoid uploading
        secrets in CSV notes or tags.
      </div>
    </div>
  );
}
