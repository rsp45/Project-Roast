import { PortfolioMetrics } from "./PortfolioMetrics";

export default function PortfolioPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Portfolio
        </div>
        <div className="mt-1 text-sm text-muted">
          Connect the story to the numbers. Every chart should have receipts.
        </div>
      </div>

      <PortfolioMetrics />

      <section className="rounded-2xl bg-panel p-5 text-panel-ink ring-1 ring-border">
        <div className="flex items-baseline justify-between gap-4">
          <div className="font-semibold">Equity Curve</div>
          <div className="text-xs text-muted">Sample preview</div>
        </div>
        <div className="mt-5 h-44 overflow-hidden rounded-xl bg-panel/60 ring-1 ring-border">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(209,31,58,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(0,0,0,0.08),transparent_55%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-panel-ink/10" />
            <div className="absolute inset-0 flex items-end px-5 pb-5">
              <div className="h-24 w-full rounded-lg bg-[linear-gradient(110deg,rgba(209,31,58,0.0),rgba(209,31,58,0.12),rgba(209,31,58,0.0))] [mask-image:linear-gradient(to_top,black,transparent)]" />
              <div className="pointer-events-none absolute inset-x-5 bottom-6 h-24 border-l border-b border-panel-ink/10" />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
            <div className="text-[11px] font-semibold tracking-wide text-muted">
              Biggest Loss Cluster
            </div>
            <div className="mt-2 text-sm">
              7 trades over 2 sessions, same setup, same exit mistake.
            </div>
          </div>
          <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
            <div className="text-[11px] font-semibold tracking-wide text-muted">
              Fees Spike
            </div>
            <div className="mt-2 text-sm">
              Fees increased 41% after position sizing change.
            </div>
          </div>
          <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
            <div className="text-[11px] font-semibold tracking-wide text-muted">
              Next Best Question
            </div>
            <div className="mt-2 text-sm">
              “Show me PnL by strategy tag for the last 30 days.”
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
