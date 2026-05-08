"use client";

import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Eye, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { backendFetch } from "@/lib/backend";

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

type Insight = {
  title: string;
  description: string;
  details: Record<string, string>;
};

type RoastData = {
  insights: Insight[];
};

export default function TradeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const q = useQuery({
    queryKey: ["trade", params.id],
    queryFn: () => backendFetch<Trade>(`/v1/trades/${params.id}`),
  });

  const rq = useQuery({
    queryKey: ["trade-roast", params.id],
    queryFn: () => backendFetch<RoastData>(`/v1/trades/${params.id}/roast`),
  });

  const trade = q.data;
  const roast = rq.data;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md border-b border-white/5 pb-stack-md">
        <div>
          <div className="flex items-center gap-stack-sm mb-2">
            <Link
              href="/app/trades"
              className="text-secondary hover:text-on-surface flex items-center gap-1 font-body-md text-[14px] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Interrogation Queue
            </Link>
            <span className="text-surface-variant">•</span>
            <span className="font-label-mono text-label-mono text-secondary">
              ID: {params.id}
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">
            {q.isLoading ? (
              <span className="animate-pulse bg-white/10 rounded h-10 w-48 block"></span>
            ) : trade ? (
              <>
                {trade.symbol} {trade.side === "SHORT" || trade.side === "SELL" ? "Short" : "Long"}{" "}
                <span className="text-tertiary">@ {trade.price.toFixed(2)}</span>
              </>
            ) : (
              "Trade Not Found"
            )}
          </h1>
        </div>
        <div className="flex items-center gap-stack-md">
          <div className="bg-error-container/20 border border-error-container text-primary px-3 py-1 rounded font-label-mono text-label-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Flagged
          </div>
          <div className="bg-surface-container-high border border-white/10 text-on-surface px-3 py-1 rounded font-label-mono text-label-mono">
            Roast Complete
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Main Chart Area (Col Span 8) */}
        <div className="md:col-span-8 space-y-gutter flex flex-col">
          <section className="bg-surface-container-lowest border border-white/5 rounded-xl p-stack-md relative overflow-hidden group h-[400px] flex flex-col hover:border-white/15 transition-colors">
            <div className="flex justify-between items-center mb-stack-md z-10 relative">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Execution Timeline
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-white/10 rounded bg-surface text-secondary font-label-mono text-caption hover:border-white/20 transition-colors">
                  1H
                </button>
                <button className="px-3 py-1 border border-primary-container rounded bg-primary-container/10 text-primary font-label-mono text-caption">
                  1D
                </button>
                <button className="px-3 py-1 border border-white/10 rounded bg-surface text-secondary font-label-mono text-caption hover:border-white/20 transition-colors">
                  1W
                </button>
              </div>
            </div>
            
            {/* Abstract Chart Representation */}
            <div className="flex-1 relative w-full flex items-end justify-between px-4 pb-8 z-10">
              {/* Grid lines */}
              <div className="absolute inset-0 border-b border-white/5 flex flex-col justify-between pb-8">
                <div className="w-full h-px bg-white/5"></div>
                <div className="w-full h-px bg-white/5"></div>
                <div className="w-full h-px bg-white/5"></div>
                <div className="w-full h-px bg-white/5"></div>
              </div>
              {/* SVG Line (Simulated) */}
              <svg className="absolute inset-0 w-full h-full pb-8" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline fill="none" points="0,50 20,45 40,60" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"></polyline>
                <polyline fill="none" points="40,60 50,80 70,95" stroke="#C52B39" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(197,43,57,0.4)]"></polyline>
                <polyline fill="none" points="70,95 80,70 100,65" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"></polyline>
              </svg>
              {/* Entry/Exit Markers */}
              {trade && (
                <div className="absolute left-[40%] top-[60%] -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-on-surface border-2 border-surface z-20"></div>
                  <div className="h-full w-px border-l border-dashed border-white/20 absolute top-3"></div>
                  <div className="absolute -top-8 bg-surface border border-white/10 px-2 py-1 rounded font-label-mono text-[10px] text-on-surface whitespace-nowrap">ENTRY: {trade.price.toFixed(2)}</div>
                </div>
              )}
            </div>
          </section>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">P&L (REALIZED)</div>
              {q.isLoading ? (
                <div className="animate-pulse bg-white/10 rounded h-8 w-24"></div>
              ) : trade ? (
                <>
                  <div className={`font-headline-md text-headline-md tracking-tighter ${trade.pnl && trade.pnl >= 0 ? "text-emerald-400" : trade.pnl ? "text-primary" : "text-on-surface"}`}>
                    {trade.pnl !== null ? `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}` : "—"}
                  </div>
                </>
              ) : (
                <div className="text-secondary">—</div>
              )}
            </div>
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">QTY / FEES</div>
              {q.isLoading ? (
                <div className="animate-pulse bg-white/10 rounded h-8 w-24"></div>
              ) : trade ? (
                <>
                  <div className="font-headline-md text-headline-md text-on-surface tracking-tighter">{trade.qty}</div>
                  <div className="mt-2 font-caption text-caption text-secondary border border-white/5 inline-block px-2 py-0.5 rounded w-fit bg-surface">
                    Fees: ${trade.fees.toFixed(2)}
                  </div>
                </>
              ) : (
                <div className="text-secondary">—</div>
              )}
            </div>
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">TIME</div>
              {q.isLoading ? (
                <div className="animate-pulse bg-white/10 rounded h-8 w-24"></div>
              ) : trade ? (
                <>
                  <div className="font-headline-md text-headline-md text-on-surface tracking-tighter">
                    {new Date(trade.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="mt-2 font-caption text-caption text-secondary border border-white/5 inline-block px-2 py-0.5 rounded w-fit bg-surface">
                    {new Date(trade.executedAt).toLocaleDateString()}
                  </div>
                </>
              ) : (
                <div className="text-secondary">—</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Panel (Col Span 4) */}
        <div className="md:col-span-4 h-full">
          <section className="glass-panel rounded-xl p-0 h-full flex flex-col border-t-4 border-t-primary-container">
            <div className="p-stack-md border-b border-white/5 bg-surface-container-low/50">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-5 w-5 text-primary-container" />
                <h2 className="font-headline-sm text-[20px] font-semibold text-on-surface tracking-tight">
                  The Interrogator's Verdict
                </h2>
              </div>
              <p className="font-body-md text-[14px] text-secondary">
                Surgical analysis of execution flaws.
              </p>
            </div>
            
            <div className="flex-1 p-stack-md overflow-y-auto space-y-stack-lg">
              {rq.isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-16 bg-white/10 rounded w-full"></div>
                  <div className="h-12 bg-white/10 rounded w-full"></div>
                </div>
              ) : roast?.insights && roast.insights.length > 0 ? (
                roast.insights.map((insight, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
                      <h3 className="font-label-mono text-[14px] text-primary uppercase">{insight.title}</h3>
                    </div>
                    <p className="font-body-md text-[15px] leading-relaxed text-on-surface-variant mb-3">
                      {insight.description}
                    </p>
                    {Object.keys(insight.details).length > 0 && (
                      <div className="bg-black/50 border border-white/5 rounded p-3 font-label-mono text-[12px] text-secondary">
                        {Object.entries(insight.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between mb-1 last:mb-0">
                            <span>{key}:</span>
                            <span className="text-on-surface">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-secondary font-body-md">No insights available.</p>
              )}
            </div>
            
            <div className="p-stack-md border-t border-white/5 bg-surface-container-low/50 mt-auto">
              <button className="w-full bg-transparent border border-primary-container text-primary font-label-mono text-[14px] py-2 rounded hover:bg-primary-container/10 transition-colors">
                Acknowledge Flaws
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
