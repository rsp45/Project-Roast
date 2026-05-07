"use client";

import { backendFetch } from "@/lib/backend";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const q = useQuery({
    queryKey: ["trades"],
    queryFn: () => backendFetch<{ items: Trade[] }>("/v1/trades?limit=50"),
  });
  const errorMessage =
    q.error instanceof Error ? q.error.message : "Unable to load trades";

  return (
    <section className="glass-panel rounded-xl p-stack-md relative overflow-hidden group border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-stack-md z-10 relative">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent trades</h2>
        <div className="font-label-mono text-caption text-secondary">
          {q.isLoading
            ? "Loading..."
            : q.isError
              ? errorMessage
              : `${q.data?.items.length ?? 0} rows`}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-white/5 bg-surface-container-low/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/5">
            <tr className="font-label-mono text-caption text-secondary uppercase tracking-wider">
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
              <tr className="border-b border-white/5 hover:bg-surface-container-high transition-colors">
                <td className="px-4 py-8 text-sm text-error" colSpan={7}>
                  {errorMessage}
                </td>
              </tr>
            ) : null}
            {q.data?.items?.map((t) => (
              <tr 
                key={t.id} 
                className="border-b border-white/5 hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => router.push(`/app/trades/${t.id}`)}
              >
                <td className="px-4 py-3 font-mono text-xs text-secondary">
                  {new Date(t.executedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-on-surface">{t.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-1 text-[11px] font-mono border ${t.side.toUpperCase() === 'LONG' ? 'border-emerald-900/30 text-emerald-400 bg-emerald-900/10' : 'border-error-container/30 text-primary bg-error-container/10'}`}>
                    {t.side}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">
                  {t.qty}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">
                  {t.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-secondary">
                  {t.fees.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                  {t.pnl === null ? (
                    <span className="text-secondary">—</span>
                  ) : (
                    <span
                      className={
                        t.pnl >= 0 ? "text-emerald-400" : "text-primary"
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
              <tr className="border-b border-white/5 hover:bg-surface-container-high transition-colors">
                <td className="px-4 py-8 text-sm text-secondary text-center font-body-md" colSpan={7}>
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
