"use client";

import { backendFetch } from "@/lib/backend";
import { useQuery } from "@tanstack/react-query";
import { AskPanel } from "@/app/app/ask/AskPanel";
import Link from "next/link";

type Metrics = {
  kpis: {
    trades: number;
    pnl: number | null;
    winRate: number | null;
    profitFactor: number | null;
    maxDrawdown: number | null;
  };
  equityCurve: Array<{ date: string; equity: number }>;
};

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

function fmt(n: number | null | undefined, prefix = "", decimals = 2): string {
  if (n === null || n === undefined) return "—";
  return `${prefix}${n.toFixed(decimals)}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(1)}%`;
}

export function PortfolioDashboard() {
  const metricsQ = useQuery({
    queryKey: ["metrics", "portfolio"],
    queryFn: () => backendFetch<Metrics>("/v1/metrics/portfolio"),
  });

  const tradesQ = useQuery({
    queryKey: ["trades", "recent"],
    queryFn: () => backendFetch<{ items: Trade[] }>("/v1/trades?limit=5"),
  });

  const k = metricsQ.data?.kpis;
  const curve = metricsQ.data?.equityCurve ?? [];

  // Compute SVG path from equity curve
  let chartPath = "";
  let chartFill = "";
  if (curve.length > 1) {
    const values = curve.map((p) => p.equity);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = maxV - minV || 1;
    const toY = (v: number) => 100 - ((v - minV) / range) * 90;
    const toX = (i: number) => (i / (curve.length - 1)) * 100;

    const pts = curve
      .map((p, i) => `${toX(i)},${toY(p.equity)}`)
      .join(" L ");
    chartPath = `M ${pts}`;
    chartFill = `M ${pts} L 100,100 L 0,100 Z`;
  }

  const recentTrades = tradesQ.data?.items ?? [];
  const flaggedTrades = recentTrades.filter((t) => t.pnl !== null && t.pnl < 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* KPI: Total PnL */}
      <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-stack-md relative z-10">
          <span className="font-body-md text-body-md text-secondary">Total PnL</span>
          <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
        </div>
        <div className={`font-display-lg text-display-lg mb-unit relative z-10 ${k?.pnl != null && k.pnl >= 0 ? "text-[#4ade80]" : k?.pnl != null ? "text-primary" : "text-on-surface"}`}>
          {metricsQ.isLoading ? (
            <span className="animate-pulse text-secondary">...</span>
          ) : (
            `${k?.pnl != null && k.pnl >= 0 ? "+" : ""}${fmt(k?.pnl, "$")}`
          )}
        </div>
        <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
          <span>{k?.trades ?? "—"} total trades</span>
        </div>
      </div>

      {/* KPI: Win Rate */}
      <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-stack-md relative z-10">
          <span className="font-body-md text-body-md text-secondary">Win Rate</span>
          <span className="material-symbols-outlined text-secondary text-sm">verified</span>
        </div>
        <div className="font-display-lg text-display-lg text-on-surface mb-unit relative z-10">
          {metricsQ.isLoading ? <span className="animate-pulse text-secondary">...</span> : fmtPct(k?.winRate)}
        </div>
        <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
          <span>Profit factor: {fmt(k?.profitFactor)}</span>
        </div>
      </div>

      {/* KPI: Max Drawdown */}
      <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-stack-md relative z-10">
          <span className="font-body-md text-body-md text-secondary">Max Drawdown</span>
          <span className="material-symbols-outlined text-secondary text-sm">arrow_downward</span>
        </div>
        <div className="font-display-lg text-display-lg text-primary mb-unit relative z-10">
          {metricsQ.isLoading ? <span className="animate-pulse text-secondary">...</span> : fmt(k?.maxDrawdown)}
        </div>
        <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
          <span>Worst equity low</span>
        </div>
      </div>

      {/* KPI: Flags */}
      <div className="md:col-span-3 bg-[#121212] border border-primary/30 rounded-xl p-stack-md relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-stack-md relative z-10">
          <span className="font-body-md text-body-md text-primary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span> Flags
          </span>
        </div>
        <div className="font-display-lg text-display-lg text-primary mb-unit relative z-10">
          {tradesQ.isLoading ? <span className="animate-pulse text-secondary">...</span> : String(flaggedTrades.length).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-1 font-label-mono text-label-mono text-primary/80 relative z-10">
          <span>Requires Interrogation</span>
        </div>
      </div>

      {/* Main Chart Area - Live Equity Curve */}
      <div className="md:col-span-8 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-stack-md border-b border-white/5 pb-stack-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Performance Trajectory
          </h2>
          <span className="font-label-mono text-[10px] uppercase tracking-widest text-secondary border border-white/10 px-2 py-0.5 rounded">
            {curve.length > 0 ? `${curve.length} data pts` : "No data"}
          </span>
        </div>

        <div className="flex-1 relative mt-4">
          {curve.length <= 1 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-secondary">
              <span className="material-symbols-outlined text-4xl opacity-30">show_chart</span>
              <p className="font-body-md text-sm">Upload a CSV to see your equity curve.</p>
              <Link href="/app/upload" className="text-primary font-label-mono text-xs hover:underline">
                Go to Upload →
              </Link>
            </div>
          ) : (
            <>
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-secondary font-label-mono text-xs opacity-50 z-10">
                {(() => {
                  const values = curve.map((p) => p.equity);
                  const max = Math.max(...values);
                  const mid = (max + Math.min(...values)) / 2;
                  const min = Math.min(...values);
                  return [max, mid, min].map((v, i) => (
                    <span key={i}>${v.toFixed(0)}</span>
                  ));
                })()}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-6 z-20">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradientMain" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#e5e2e1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e5e2e1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chartFill} fill="url(#gradientMain)" opacity="0.15" />
                  <path d={chartPath} fill="none" stroke="#e5e2e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute left-10 right-0 bottom-0 flex justify-between text-secondary font-label-mono text-xs opacity-50">
                {[curve[0], curve[Math.floor(curve.length / 2)], curve[curve.length - 1]].map((p, i) => (
                  <span key={i}>{p?.date?.slice(5)}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Ask Panel - Live */}
      <div className="md:col-span-4 flex flex-col min-h-[400px]">
        <AskPanel />
      </div>

      {/* Recent Trades */}
      <div className="md:col-span-12 bg-[#121212] border border-white/5 rounded-xl p-stack-md flex flex-col">
        <div className="flex justify-between items-center mb-stack-md border-b border-white/5 pb-stack-sm">
          <h3 className="font-headline-sm text-[18px] text-on-surface">Recent Trades</h3>
          <Link href="/app/trades" className="text-primary font-body-md text-sm hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/5 bg-surface-container-low/30">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/5">
              <tr className="font-label-mono text-[11px] text-secondary uppercase tracking-wider">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">PnL</th>
              </tr>
            </thead>
            <tbody>
              {tradesQ.isLoading ? (
                <tr><td className="px-4 py-6 text-secondary font-body-md text-sm animate-pulse" colSpan={6}>Loading trades...</td></tr>
              ) : recentTrades.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-secondary font-body-md text-sm" colSpan={6}>
                  No trades yet.{" "}
                  <Link href="/app/upload" className="text-primary hover:underline">Upload a CSV</Link>
                </td></tr>
              ) : (
                recentTrades.map((t) => (
                  <Link href={`/app/trades/${t.id}`} key={t.id} legacyBehavior>
                    <tr className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs text-secondary">{new Date(t.executedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface">{t.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-1 text-[11px] font-mono border ${t.side.toUpperCase() === "LONG" || t.side.toUpperCase() === "BUY" ? "border-emerald-900/30 text-emerald-400 bg-emerald-900/10" : "border-red-900/30 text-primary bg-red-900/10"}`}>
                          {t.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">{t.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-on-surface-variant">{t.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                        {t.pnl === null ? <span className="text-secondary">—</span> : (
                          <span className={t.pnl >= 0 ? "text-emerald-400" : "text-primary"}>
                            {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </Link>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
