const templates = [
  {
    id: "v1-mean-reversion",
    name: "Mean Reversion (v1)",
    description: "Entry after overextension; exit on reversion or time stop.",
  },
  {
    id: "v1-breakout",
    name: "Breakout (v1)",
    description: "Range break with volatility filter; exit on trailing stop.",
  },
] as const;

export default function BacktestsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Backtests
        </div>
        <div className="mt-1 text-sm text-muted">
          Reproducible runs. Comparable results. No mystery settings.
        </div>
      </div>

      <section className="rounded-2xl bg-panel p-6 text-panel-ink ring-1 ring-border">
        <div className="flex items-baseline justify-between gap-4">
          <div className="font-semibold">Templates</div>
          <div className="text-xs text-muted">Sample preview</div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-panel/60 p-5 ring-1 ring-border"
            >
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="mt-2 text-sm text-muted">{t.description}</div>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-accent/40 text-sm font-semibold text-white/90"
              >
                Run (backend not wired yet)
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
