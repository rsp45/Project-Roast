import Link from "next/link";
import { SignInCard } from "./SignInCard";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <div className="font-[var(--font-display)] text-xl tracking-tight">
              Project Roast
            </div>
            <div className="text-xs text-muted">AI Trade Interrogator</div>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            Back to home
          </Link>
        </header>

        <main className="mt-16 flex flex-1 items-center justify-center">
          <SignInCard />
        </main>
      </div>
    </div>
  );
}
