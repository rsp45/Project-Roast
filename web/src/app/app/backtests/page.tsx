"use client";

import { useState } from "react";
import { backendFetch } from "@/lib/backend";

/* ── Types ── */
interface BacktestResult {
  backtestId: string;
  status: string;
  result?: {
    asOf?: string;
    template?: string;
    summary?: { status: string; note: string };
    metrics?: Record<string, number | string>;
    trades?: { symbol: string; pnl: number; date: string }[];
  };
  error?: string;
}

interface ParamConfig {
  key: string;
  label: string;
  type: "number" | "text";
  default: string | number;
}

/* ── Template definitions ── */
const TEMPLATES = [
  {
    id: "v1-mean-reversion",
    name: "Mean Reversion",
    icon: "swap_horiz",
    description: "Entry after overextension; exit on reversion or time stop.",
    color: "#8b5cf6",
    params: [
      { key: "lookback_days", label: "Lookback (days)", type: "number", default: 14 },
      { key: "z_score_threshold", label: "Z-Score Threshold", type: "number", default: 2.0 },
      { key: "stop_loss_pct", label: "Stop Loss %", type: "number", default: 3 },
    ] as ParamConfig[],
  },
  {
    id: "v1-breakout",
    name: "Breakout",
    icon: "trending_up",
    description: "Range break with volatility filter; exit on trailing stop.",
    color: "#3b82f6",
    params: [
      { key: "range_days", label: "Range Period (days)", type: "number", default: 20 },
      { key: "atr_multiplier", label: "ATR Multiplier", type: "number", default: 1.5 },
      { key: "trailing_stop_pct", label: "Trailing Stop %", type: "number", default: 5 },
    ] as ParamConfig[],
  },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

/* ── Card component ── */
function TemplateCard({
  template,
  selected,
  onClick,
}: {
  template: (typeof TEMPLATES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full rounded-xl border p-5 transition-all duration-200 group ${
        selected
          ? "border-opacity-50 bg-opacity-10"
          : "border-white/5 bg-surface-container-low/50 hover:border-white/10"
      }`}
      style={
        selected
          ? { borderColor: `${template.color}60`, background: `${template.color}0f` }
          : {}
      }
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${template.color}20`, color: template.color }}
        >
          <span className="material-symbols-outlined text-xl">{template.icon}</span>
        </div>
        <span className="font-headline-sm text-on-surface text-[16px]">{template.name}</span>
        {selected && (
          <span
            className="ml-auto text-[11px] font-label-mono px-2 py-0.5 rounded-full"
            style={{ background: `${template.color}25`, color: template.color }}
          >
            Selected
          </span>
        )}
      </div>
      <p className="text-secondary font-body-md text-sm leading-relaxed">{template.description}</p>
    </button>
  );
}

/* ── Main page ── */
export default function BacktestsPage() {
  const [selectedId, setSelectedId] = useState<TemplateId>("v1-mean-reversion");
  const [params, setParams] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BacktestResult[]>([]);

  const selected = TEMPLATES.find((t) => t.id === selectedId)!;

  const getParam = (key: string, def: string | number) =>
    params[`${selectedId}.${key}`] ?? String(def);

  const setParam = (key: string, val: string) =>
    setParams((p) => ({ ...p, [`${selectedId}.${key}`]: val }));

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setError(null);

    const builtParams: Record<string, string | number> = {};
    for (const p of selected.params) {
      const raw = getParam(p.key, p.default);
      builtParams[p.key] = p.type === "number" ? parseFloat(raw) || p.default : raw;
    }

    try {
      const res = await backendFetch<BacktestResult>("/v1/backtests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedId, params: builtParams }),
      });
      setResult(res);
      setHistory((h) => [res, ...h].slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
          Backtests
        </h1>
        <p className="text-secondary font-body-md">
          Reproducible runs against your uploaded trade data. Comparable results. No mystery settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Configuration ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Template picker */}
          <section className="glass-panel rounded-xl p-5 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Strategy Template</h2>
            <div className="flex flex-col gap-3">
              {TEMPLATES.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedId === t.id}
                  onClick={() => setSelectedId(t.id)}
                />
              ))}
            </div>
          </section>

          {/* Parameter editor */}
          <section className="glass-panel rounded-xl p-5 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Parameters</h2>
            <div className="flex flex-col gap-4">
              {selected.params.map((p) => (
                <div key={p.key}>
                  <label className="font-label-mono text-xs text-secondary uppercase tracking-widest block mb-1.5">
                    {p.label}
                  </label>
                  <input
                    type={p.type === "number" ? "number" : "text"}
                    value={getParam(p.key, p.default)}
                    onChange={(e) => setParam(p.key, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 font-label-mono text-sm text-on-surface focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="mt-6 w-full h-11 rounded-lg font-label-mono font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: running ? `${selected.color}40` : selected.color,
                color: "#fff",
                boxShadow: running ? "none" : `0 4px 20px ${selected.color}40`,
              }}
            >
              {running ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
                  Running…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Run Backtest
                </>
              )}
            </button>
          </section>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-5 flex gap-3">
              <span className="material-symbols-outlined text-red-400 shrink-0">error</span>
              <div>
                <div className="font-label-mono text-sm text-red-400 mb-1">Run Failed</div>
                <div className="text-secondary text-sm font-body-md">{error}</div>
              </div>
            </div>
          )}

          {/* Running skeleton */}
          {running && (
            <section className="glass-panel rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[260px]">
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: selected.color, borderTopColor: "transparent" }} />
              <div className="font-label-mono text-secondary text-sm">Running {selected.name}…</div>
            </section>
          )}

          {/* Result card */}
          {result && !running && (
            <section className="glass-panel rounded-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5"
                style={{ background: `${selected.color}0a` }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: selected.color }}>
                    {selected.icon}
                  </span>
                  <span className="font-headline-sm text-on-surface">{selected.name}</span>
                </div>
                <span className="font-label-mono text-xs px-3 py-1 rounded-full"
                  style={{ background: `${selected.color}20`, color: selected.color }}>
                  {result.status}
                </span>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Summary note */}
                {result.result?.summary && (
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
                    <div className="font-label-mono text-xs text-secondary uppercase tracking-widest mb-2">Summary</div>
                    <div className="text-on-surface font-body-md text-sm leading-relaxed">
                      {result.result.summary.note}
                    </div>
                  </div>
                )}

                {/* Metrics grid */}
                {result.result?.metrics && (
                  <div>
                    <div className="font-label-mono text-xs text-secondary uppercase tracking-widest mb-3">Metrics</div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.result.metrics).map(([k, v]) => (
                        <div key={k} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
                          <div className="font-label-mono text-[11px] text-secondary uppercase tracking-widest mb-1">
                            {k.replace(/_/g, " ")}
                          </div>
                          <div className="font-headline-sm text-on-surface text-xl">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON fallback */}
                {!result.result?.summary && !result.result?.metrics && (
                  <div>
                    <div className="font-label-mono text-xs text-secondary uppercase tracking-widest mb-2">Raw Result</div>
                    <pre className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 font-mono text-xs text-secondary overflow-auto max-h-64">
                      {JSON.stringify(result.result ?? result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Run ID */}
                <div className="font-label-mono text-[10px] text-secondary/40">
                  Run ID: {result.backtestId}
                  {result.result?.asOf && ` · ${new Date(result.result.asOf).toLocaleString()}`}
                </div>
              </div>
            </section>
          )}

          {/* Empty state */}
          {!result && !running && !error && (
            <section className="glass-panel rounded-xl border border-white/5 p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[260px]">
              <span className="material-symbols-outlined text-5xl text-secondary/30">science</span>
              <div className="font-headline-sm text-on-surface">No runs yet</div>
              <p className="text-secondary font-body-md text-sm max-w-xs">
                Configure parameters on the left and click <strong>Run Backtest</strong> to simulate your strategy against uploaded trade data.
              </p>
            </section>
          )}

          {/* History */}
          {history.length > 1 && (
            <section className="glass-panel rounded-xl border border-white/5 p-5">
              <h3 className="font-headline-sm text-sm text-secondary uppercase tracking-widest mb-3">Run History</h3>
              <div className="flex flex-col gap-2">
                {history.slice(1).map((r) => (
                  <div key={r.backtestId}
                    className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-3">
                    <div className="font-label-mono text-xs text-secondary">{r.result?.template ?? "—"}</div>
                    <div className="font-label-mono text-xs text-secondary/50">{r.backtestId.slice(0, 8)}…</div>
                    <span className="font-label-mono text-[11px] px-2 py-0.5 rounded bg-white/5 text-secondary">{r.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
