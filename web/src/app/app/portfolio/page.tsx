import { PortfolioMetrics } from "./PortfolioMetrics";

export default function PortfolioPage() {
  return (
    <>
      {/* Header Section */}
      <header className="flex justify-between items-end mb-gutter">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-unit">
            Dashboard Overview
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Real-time performance metrics and AI interrogation status.
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <button className="px-4 py-2 border border-white/15 rounded-DEFAULT text-on-surface hover:border-primary/50 transition-colors font-body-md text-body-md bg-surface/50 backdrop-blur-md flex items-center gap-1">
            <span className="material-symbols-outlined align-middle text-sm">
              download
            </span>{" "}
            Export
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* KPI Widgets (Top Row) */}
        <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-body-md text-body-md text-secondary">
              Total Value
            </span>
            <span className="material-symbols-outlined text-secondary text-sm">
              trending_up
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-unit relative z-10">
            $2.4M
          </div>
          <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
            <span className="text-[#4ade80]">+12.5%</span>{" "}
            <span>vs last month</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-body-md text-body-md text-secondary">
              Active Trades
            </span>
            <span className="material-symbols-outlined text-secondary text-sm">
              swap_horiz
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-unit relative z-10">
            142
          </div>
          <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
            <span className="text-error">-3.2%</span>{" "}
            <span>vs last month</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-body-md text-body-md text-secondary">
              Win Rate
            </span>
            <span className="material-symbols-outlined text-secondary text-sm">
              verified
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-unit relative z-10">
            68%
          </div>
          <div className="flex items-center gap-1 font-label-mono text-label-mono text-tertiary relative z-10">
            <span className="text-[#4ade80]">+5.1%</span>{" "}
            <span>vs last month</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-[#121212] border border-primary/30 rounded-xl p-stack-md relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-body-md text-body-md text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>{" "}
              Flags
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-primary mb-unit relative z-10">
            04
          </div>
          <div className="flex items-center gap-1 font-label-mono text-label-mono text-primary/80 relative z-10">
            <span>Requires Interrogation</span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="md:col-span-8 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-stack-md border-b border-white/5 pb-stack-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Performance Trajectory
            </h2>
            <div className="flex gap-2">
              <button className="font-label-mono text-label-mono text-secondary hover:text-on-surface px-2 py-1 rounded bg-white/5">
                1D
              </button>
              <button className="font-label-mono text-label-mono text-secondary hover:text-on-surface px-2 py-1 rounded bg-white/5">
                1W
              </button>
              <button className="font-label-mono text-label-mono text-on-surface px-2 py-1 rounded bg-primary/20 border border-primary/50">
                1M
              </button>
            </div>
          </div>

          {/* Faux Chart Representation */}
          <div className="flex-1 relative mt-4">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-secondary font-label-mono text-xs opacity-50 z-10">
              <span>$3M</span>
              <span>$2M</span>
              <span>$1M</span>
              <span>0</span>
            </div>
            <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between">
              <div className="border-t border-white/5 w-full"></div>
              <div className="border-t border-white/5 w-full"></div>
              <div className="border-t border-white/5 w-full"></div>
              <div className="border-t border-white/5 w-full"></div>
            </div>
            <div className="absolute left-8 right-0 top-0 bottom-6 z-20">
              <svg
                className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  className="opacity-80"
                  d="M0,80 Q10,70 20,75 T40,60 T60,65 T80,30 T100,20"
                  fill="none"
                  stroke="#e5e2e1"
                  strokeWidth="2"
                ></path>
                <path
                  d="M0,80 Q10,70 20,75 T40,60 T60,65 T80,30 T100,20 L100,100 L0,100 Z"
                  fill="url(#gradientMain)"
                  opacity="0.1"
                ></path>
                {/* Highlighted "Roasted" section */}
                <path
                  className="drop-shadow-[0_0_12px_rgba(197,43,57,0.8)]"
                  d="M40,60 T60,65"
                  fill="none"
                  stroke="#c52b39"
                  strokeWidth="3"
                ></path>
                <defs>
                  <linearGradient id="gradientMain" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e5e2e1" stopOpacity="0.5"></stop>
                    <stop offset="100%" stopColor="#e5e2e1" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-secondary font-label-mono text-xs opacity-50">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </div>

        {/* AI Interrogation Chat Panel */}
        <div className="md:col-span-4 bg-[#121212] border border-white/5 rounded-xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[400px]">
          <div className="p-stack-md border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Active Interrogation
              </h2>
            </div>
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded bg-primary/10">
              Live
            </span>
          </div>

          <div className="flex-1 p-stack-md overflow-y-auto space-y-stack-md custom-scrollbar">
            {/* AI Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-on-surface text-sm">
                  psychology
                </span>
              </div>
              <div className="bg-surface-variant/50 border border-white/5 rounded-lg rounded-tl-none p-3 max-w-[85%]">
                <p className="font-body-md text-sm text-on-surface mb-2">
                  Analyzing anomaly in Trade #892X. Volume spiked 400% against
                  historical baseline while latency increased by 12ms.
                </p>
                <div className="font-label-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded inline-block mt-1">
                  Status: Flagged for Review
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-secondary text-sm">
                  person
                </span>
              </div>
              <div className="bg-surface-container-highest border border-white/5 rounded-lg rounded-tr-none p-3 max-w-[85%]">
                <p className="font-body-md text-sm text-on-surface">
                  Cross-reference with market news during that window.
                </p>
              </div>
            </div>

            {/* AI Message (Typing) */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-on-surface text-sm">
                  psychology
                </span>
              </div>
              <div className="bg-surface-variant/50 border border-white/5 rounded-lg rounded-tl-none p-3 max-w-[85%] flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          </div>

          <div className="p-stack-md border-t border-white/5 bg-surface/50 backdrop-blur-md">
            <div className="relative">
              <input
                className="w-full bg-[#000000] border border-white/15 rounded-DEFAULT py-2 px-3 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary/50"
                placeholder="Command the interrogator..."
                type="text"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trade Volume (Bar Chart Placeholder) */}
        <div className="md:col-span-6 bg-[#121212] border border-white/5 rounded-xl p-stack-md relative overflow-hidden h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-stack-md">
            <h3 className="font-headline-sm text-[18px] text-on-surface">
              Execution Volume
            </h3>
            <span className="material-symbols-outlined text-secondary text-sm">
              bar_chart
            </span>
          </div>
          <div className="flex-1 flex items-end gap-2 justify-between pt-4">
            <div
              className="w-full bg-surface-variant/30 hover:bg-surface-variant/70 transition-colors rounded-t border-t border-x border-white/10 relative group"
              style={{ height: "40%" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-xs font-label-mono z-10 text-on-surface">
                2.1k
              </div>
            </div>
            <div
              className="w-full bg-surface-variant/30 hover:bg-surface-variant/70 transition-colors rounded-t border-t border-x border-white/10 relative group"
              style={{ height: "65%" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-xs font-label-mono z-10 text-on-surface">
                3.4k
              </div>
            </div>
            <div
              className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t border-t border-x border-primary/50 relative group"
              style={{ height: "95%" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-container border border-primary px-2 py-1 rounded text-xs font-label-mono z-10 text-white">
                5.8k
              </div>
            </div>
            <div
              className="w-full bg-surface-variant/30 hover:bg-surface-variant/70 transition-colors rounded-t border-t border-x border-white/10 relative group"
              style={{ height: "50%" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-xs font-label-mono z-10 text-on-surface">
                2.8k
              </div>
            </div>
            <div
              className="w-full bg-surface-variant/30 hover:bg-surface-variant/70 transition-colors rounded-t border-t border-x border-white/10 relative group"
              style={{ height: "30%" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-xs font-label-mono z-10 text-on-surface">
                1.5k
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-secondary font-label-mono text-xs opacity-50 border-t border-white/5 pt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </div>
        </div>

        {/* Recent Flags List */}
        <div className="md:col-span-6 bg-[#121212] border border-white/5 rounded-xl p-stack-md flex flex-col h-[300px] overflow-hidden">
          <div className="flex justify-between items-center mb-stack-md border-b border-white/5 pb-stack-sm">
            <h3 className="font-headline-sm text-[18px] text-on-surface">
              Recent Anomalies
            </h3>
            <a
              className="text-primary font-body-md text-sm hover:underline"
              href="#"
            >
              View All
            </a>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            <div className="bg-surface/50 border border-white/5 p-3 rounded-lg flex items-center justify-between hover:border-white/15 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <div>
                  <div className="font-label-mono text-sm text-on-surface group-hover:text-primary transition-colors">
                    TRD-992A
                  </div>
                  <div className="font-body-md text-xs text-secondary">
                    Latency Spike Detected
                  </div>
                </div>
              </div>
              <div className="font-label-mono text-xs text-tertiary">
                10:42 AM
              </div>
            </div>

            <div className="bg-surface/50 border border-white/5 p-3 rounded-lg flex items-center justify-between hover:border-white/15 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <div>
                  <div className="font-label-mono text-sm text-on-surface group-hover:text-primary transition-colors">
                    TRD-845B
                  </div>
                  <div className="font-body-md text-xs text-secondary">
                    Volume Threshold Exceeded
                  </div>
                </div>
              </div>
              <div className="font-label-mono text-xs text-tertiary">
                09:15 AM
              </div>
            </div>

            <div className="bg-surface/50 border border-white/5 p-3 rounded-lg flex items-center justify-between hover:border-white/15 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
                <div>
                  <div className="font-label-mono text-sm text-on-surface">
                    SYS-001X
                  </div>
                  <div className="font-body-md text-xs text-secondary">
                    Roast Complete - Cleared
                  </div>
                </div>
              </div>
              <div className="font-label-mono text-xs text-tertiary">
                Yesterday
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
