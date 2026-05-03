import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <div className="font-[var(--font-display)] text-xl tracking-tight">
              Project Roast
            </div>
            <div className="text-xs text-muted">AI Trade Interrogator</div>
          </div>
          <Link
            href="/auth/sign-in"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Sign in with Google
          </Link>
        </header>

        <main className="mt-14 grid flex-1 grid-cols-1 gap-10 md:grid-cols-12">
          <section className="md:col-span-7">
            <h1 className="font-[var(--font-display)] text-5xl leading-[1.02] tracking-tight md:text-6xl">
              Interrogate your trades.
              <span className="text-accent"> Ruthlessly.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
              Upload a CSV export, slice performance by symbol and strategy, and
              ask natural-language questions with evidence-backed answers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
              >
                Enter the dashboard
              </Link>
              <div className="text-xs leading-5 text-muted">
                v1 supports CSV uploads. Broker integrations come next.
              </div>
            </div>
          </section>

          <section className="md:col-span-5">
            <div className="rounded-2xl bg-panel p-5 text-panel-ink shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-border">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium tracking-wide">
                  PERFORMANCE SNAPSHOT
                </div>
                <div className="text-xs text-muted">sample</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
                  <div className="text-[11px] text-muted">PnL</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    +12.4%
                  </div>
                </div>
                <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
                  <div className="text-[11px] text-muted">Max DD</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    -3.1%
                  </div>
                </div>
                <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
                  <div className="text-[11px] text-muted">Win Rate</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    54.2%
                  </div>
                </div>
                <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
                  <div className="text-[11px] text-muted">Profit Factor</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    1.37
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-panel/60 p-4 ring-1 ring-border">
                <div className="text-[11px] text-muted">Ask AI</div>
                <div className="mt-2 text-sm">
                  Why did April underperform compared to March?
                </div>
                <div className="mt-3 text-xs text-muted">
                  Evidence: 18 trades, 4 symbols, fees spike + loss clustering.
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 flex flex-col gap-2 border-t border-foreground/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>Built for high-signal post-trade analysis.</div>
          <div>Data stays in your workspace. Export anytime.</div>
        </footer>
      </div>
    </div>
  );
}
