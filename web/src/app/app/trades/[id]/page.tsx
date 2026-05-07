import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Eye, Brain } from "lucide-react";

export default function TradeDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
            NVDA Short <span className="text-tertiary">@ 124.50</span>
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
              <div className="absolute left-[40%] top-[60%] -translate-y-1/2 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-on-surface border-2 border-surface z-20"></div>
                <div className="h-full w-px border-l border-dashed border-white/20 absolute top-3"></div>
                <div className="absolute -top-8 bg-surface border border-white/10 px-2 py-1 rounded font-label-mono text-[10px] text-on-surface whitespace-nowrap">ENTRY: 124.50</div>
              </div>
              <div className="absolute left-[70%] top-[95%] -translate-y-1/2 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary-container border-2 border-surface z-20"></div>
                <div className="absolute -bottom-8 bg-surface border border-error-container/50 px-2 py-1 rounded font-label-mono text-[10px] text-primary whitespace-nowrap">EXIT: 132.20</div>
              </div>
            </div>
          </section>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">P&L (REALIZED)</div>
              <div className="font-headline-md text-headline-md text-primary tracking-tighter">-$4,250.00</div>
              <div className="mt-2 font-caption text-caption text-error-container bg-error-container/10 inline-block px-2 py-0.5 rounded border border-error-container/20 w-fit">
                -6.18%
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">RISK/REWARD RATIO</div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tighter">1 : 0.4</div>
              <div className="mt-2 font-caption text-caption text-secondary border border-white/5 inline-block px-2 py-0.5 rounded w-fit bg-surface">
                Sub-optimal
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-white/5 hover:border-white/15 transition-colors rounded-lg p-stack-md flex flex-col justify-between">
              <div className="font-label-mono text-caption text-secondary mb-2">HOLD DURATION</div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tighter">4h 12m</div>
              <div className="mt-2 font-caption text-caption text-secondary border border-white/5 inline-block px-2 py-0.5 rounded w-fit bg-surface">
                Intraday
              </div>
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
                  The Interrogator&apos;s Verdict
                </h2>
              </div>
              <p className="font-body-md text-[14px] text-secondary">
                Surgical analysis of execution flaws.
              </p>
            </div>
            
            <div className="flex-1 p-stack-md overflow-y-auto space-y-stack-lg">
              {/* Insight 1 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
                  <h3 className="font-label-mono text-[14px] text-primary">PREMATURE ENTRY</h3>
                </div>
                <p className="font-body-md text-[15px] leading-relaxed text-on-surface-variant mb-3">
                  You initiated the short position exactly 14 minutes before the scheduled FOMC minutes release. This indicates a high-risk anticipation strategy rather than a reactive, confirmation-based entry.
                </p>
                <div className="bg-black/50 border border-white/5 rounded p-3 font-label-mono text-[12px] text-secondary">
                  <div className="flex justify-between mb-1">
                    <span>Volatility at Entry:</span>
                    <span className="text-primary">Elevated (84th percentile)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RSI (5m):</span>
                    <span className="text-on-surface">42 (Neutral)</span>
                  </div>
                </div>
              </div>
              
              {/* Insight 2 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
                  <h3 className="font-label-mono text-[14px] text-primary">STOP-LOSS MISMANAGEMENT</h3>
                </div>
                <p className="font-body-md text-[15px] leading-relaxed text-on-surface-variant mb-3">
                  The hard stop was placed directly at the round number (132.00), a known liquidity pool. The algorithm notes you were stopped out by a 0.20 over-shoot before the price reversed 4% in your intended direction.
                </p>
                <button className="w-full py-2 border border-white/10 rounded bg-surface hover:bg-surface-container-high transition-colors font-label-mono text-[12px] text-on-surface flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" /> View Liquidity Heatmap
                </button>
              </div>
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
