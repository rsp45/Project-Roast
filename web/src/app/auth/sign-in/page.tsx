import Link from "next/link";
import { SignInCard } from "./SignInCard";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error;

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
          <div className="flex w-full flex-col items-center gap-4">
            {error ? (
              <div className="w-full max-w-sm rounded-2xl bg-rose-50 p-4 text-rose-900 ring-1 ring-rose-200">
                <div className="text-xs font-semibold tracking-wide">
                  Sign-in failed
                </div>
                <div className="mt-2 text-sm">{error}</div>
              </div>
            ) : null}
            <SignInCard />
          </div>
        </main>
      </div>
    </div>
  );
}
