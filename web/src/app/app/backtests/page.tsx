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
    <div className="flex flex-col w-full gap-stack-lg">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
          Backtests
        </h1>
        <p className="text-secondary font-body-md">
          Reproducible runs. Comparable results. No mystery settings.
        </p>
      </div>

      <section className="glass-panel rounded-xl p-stack-md relative overflow-hidden group border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-stack-md z-10 relative">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Templates</h2>
          <div className="font-label-mono text-caption text-secondary">Sample preview</div>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 relative z-10">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-surface-container-low/50 border border-white/5 rounded-xl p-stack-md hover:border-white/10 transition-colors"
            >
              <div className="font-headline-sm text-[18px] text-on-surface">{t.name}</div>
              <div className="mt-2 text-[14px] text-secondary font-body-md leading-relaxed">{t.description}</div>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded bg-surface border border-white/10 text-[14px] font-label-mono text-secondary transition-colors cursor-not-allowed opacity-50"
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
