"use client";

import { backendFetch } from "@/lib/backend";
import { useQuery } from "@tanstack/react-query";

type Trade = {
  id: string;
  executedAt: string;
  symbol: string;
  side: string;
  qty: number;
  price: number;
  fees: number;
  pnl: number | null;
};

export function TradesTable() {
  const q = useQuery({
    queryKey: ["trades"],
    queryFn: () => backendFetch<{ items: Trade[] }>("/v1/trades?limit=50"),
  });
  const errorMessage =
    q.error instanceof Error ? q.error.message : "Unable to load trades";

  return (
    <section className="rounded-2xl bg-panel p-5 text-panel-ink ring-1 ring-border">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-semibold">Recent trades</div>
        <div className="text-xs text-muted">
          {q.isLoading
            ? "Loading..."
            : q.isError
              ? errorMessage
              : `${q.data?.items.length ?? 0} rows`}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel/60">
            <tr className="text-[11px] font-semibold tracking-wide text-muted">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Fees</th>
              <th className="px-4 py-3 text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {q.isError ? (
              <tr className="border-t border-panel-ink/10 bg-panel">
                <td className="px-4 py-8 text-sm text-muted" colSpan={7}>
                  {errorMessage}
                </td>
              </tr>
            ) : null}
            {q.data?.items?.map((t) => (
              <tr key={t.id} className="border-t border-panel-ink/10 bg-panel">
                <td className="px-4 py-3 font-mono text-xs">
                  {new Date(t.executedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold">{t.symbol}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-panel-ink/10 px-2 py-1 text-[11px] font-semibold">
                    {t.side}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {t.qty}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {t.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {t.fees.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                  {t.pnl === null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span
                      className={
                        t.pnl >= 0 ? "text-emerald-700" : "text-rose-700"
                      }
                    >
                      {t.pnl >= 0 ? "+" : ""}
                      {t.pnl.toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!q.isLoading && !q.isError && (q.data?.items?.length ?? 0) === 0 ? (
              <tr className="border-t border-panel-ink/10 bg-panel">
                <td className="px-4 py-8 text-sm text-muted" colSpan={7}>
                  No trades yet. Upload a CSV to populate this table.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
