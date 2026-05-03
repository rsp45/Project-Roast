import { TradesTable } from "./TradesTable";

export default function TradesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Trades
        </div>
        <div className="mt-1 text-sm text-muted">
          Filter, group, and drill down into the raw events behind the curve.
        </div>
      </div>

      <TradesTable />
    </div>
  );
}
