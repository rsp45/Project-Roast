"use client";

import { KpiCard } from "@/components/KpiCard";
import { backendFetch } from "@/lib/backend";
import { useQuery } from "@tanstack/react-query";

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

export function PortfolioMetrics() {
  const q = useQuery({
    queryKey: ["metrics", "portfolio"],
    queryFn: () => backendFetch<Metrics>("/v1/metrics/portfolio"),
  });

  const k = q.data?.kpis;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="PnL"
        value={
          k?.pnl === null || k?.pnl === undefined
            ? "—"
            : `${k.pnl >= 0 ? "+" : ""}${k.pnl.toFixed(2)}`
        }
        hint="sum"
        tone={
          k?.pnl === null || k?.pnl === undefined
            ? "neutral"
            : k.pnl >= 0
              ? "positive"
              : "negative"
        }
      />
      <KpiCard
        label="Max Drawdown"
        value={
          k?.maxDrawdown === null || k?.maxDrawdown === undefined
            ? "—"
            : k.maxDrawdown.toFixed(2)
        }
        hint="equity"
        tone="negative"
      />
      <KpiCard
        label="Win Rate"
        value={
          k?.winRate === null || k?.winRate === undefined
            ? "—"
            : `${k.winRate.toFixed(1)}%`
        }
        hint={k?.trades ? `${k.trades} trades` : undefined}
      />
      <KpiCard
        label="Profit Factor"
        value={
          k?.profitFactor === null || k?.profitFactor === undefined
            ? "—"
            : k.profitFactor.toFixed(2)
        }
        hint="gross"
      />
    </section>
  );
}
