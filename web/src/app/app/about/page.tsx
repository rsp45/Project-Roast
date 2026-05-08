"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

function useTilt(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`;
    };
    const onLeave = () => { el.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return ref;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useTilt();
  return <div ref={ref} className={`transition-transform duration-200 ease-out will-change-transform ${className}`} style={{ transformStyle: "preserve-3d" }}>{children}</div>;
}

const STEPS = [
  {
    icon: "upload_file", title: "CSV Ingestion", subtitle: "Step 1", color: "#c52b39",
    body: "Your broker CSV is parsed by a multi-format engine that auto-detects column schemas — OHLCV, Robinhood, Interactive Brokers, or custom formats. Timestamps, PnL, symbols and quantities are normalized before storage.",
    extra: null,
  },
  {
    icon: "database", title: "Trade Storage", subtitle: "Step 2", color: "#8b5cf6",
    body: "Parsed trades are persisted to a PostgreSQL database, scoped to your workspace. All data is user-isolated — no trade data is shared across accounts. Indexes are maintained for fast time-range queries.",
    extra: null,
  },
  {
    icon: "analytics", title: "Metrics Engine", subtitle: "Step 3", color: "#3b82f6",
    body: "Win Rate, PnL, Max Drawdown, and Profit Factor are computed server-side from your stored trades. An equity curve is built chronologically from cumulative PnL — used to power the Performance Trajectory chart on the dashboard.",
    extra: null,
  },
  {
    icon: "psychology", title: "AI Interrogation", subtitle: "Step 4", color: "#10b981",
    body: "The Interrogator (Qwen 3 Coder 480B via NVIDIA NIM) receives your last 50 trades plus live metrics, then answers your question with evidence-based citations from your actual data — no hallucinations.",
    extra: "ai", // shows tech stack + system prompt
  },
];

const PRINCIPLES = [
  { icon: "fact_check", title: "Evidence-First", body: "Every answer cites specific trades, dates, and numbers from your actual CSV — no hallucinated generalizations." },
  { icon: "search_insights", title: "Pattern Detection", body: "The model identifies recurring mistake patterns, correlations between loss days and market conditions, and behavioral biases." },
  { icon: "security", title: "Data Privacy", body: "Trade data is sent to NVIDIA's NIM API only during an active query. No data is stored by the AI provider. Each query is stateless." },
  { icon: "bolt", title: "480B Parameters", body: "Qwen 3 Coder 480B is a Mixture-of-Experts model optimized for structured data analysis — it excels at reading tabular financial data." },
];

const TECH = [
  { name: "FastAPI", role: "Backend API", icon: "rocket_launch", color: "#10b981" },
  { name: "Next.js 14", role: "Frontend", icon: "web", color: "#3b82f6" },
  { name: "PostgreSQL", role: "Trade DB", icon: "database", color: "#8b5cf6" },
  { name: "NVIDIA NIM", role: "AI Inference", icon: "memory", color: "#c52b39" },
  { name: "Vercel", role: "Frontend Host", icon: "cloud", color: "#64748b" },
  { name: "Render", role: "Backend Host", icon: "dns", color: "#f59e0b" },
  { name: "Qwen 3 480B", role: "AI Model", icon: "psychology", color: "#ec4899" },
  { name: "React Query", role: "Data Fetching", icon: "sync", color: "#06b6d4" },
];

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex flex-col gap-16 pb-16 relative">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[300px] overflow-hidden pt-8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[240,340,440,540].map((size, i) => (
            <div key={i} className="absolute rounded-full border opacity-[0.12]"
              style={{ width: size, height: size, borderColor: ["#c52b39","#8b5cf6","#3b82f6","#10b981"][i],
                animation: `spin ${12 + i*8}s linear ${-i*5}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }`}</style>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary-container/30 rounded-full px-4 py-1.5 mb-5 font-label-mono text-xs text-primary uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" /> System Architecture
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface tracking-tight mb-4 font-bold">How Project Roast Works</h1>
          <p className="text-secondary font-body-md text-lg max-w-2xl mx-auto leading-relaxed">
            A full-stack AI trading analyst that ingests raw broker data, computes portfolio metrics, and deploys a 480B-parameter model to interrogate your strategy.
          </p>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <h2 className="font-headline-sm text-2xl text-on-surface mb-2 text-center">The Interrogation Pipeline</h2>
        <p className="text-secondary font-body-md text-center mb-8">From raw CSV to AI-powered insight in 4 stages.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-mono text-sm whitespace-nowrap transition-all border ${activeStep === i ? "border-primary-container/60 bg-primary-container/15 text-on-surface" : "border-white/5 text-secondary hover:border-white/15 hover:text-on-surface"}`}>
              <span className="material-symbols-outlined text-base" style={{ color: activeStep === i ? s.color : undefined }}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Active Step Card */}
        <TiltCard>
          <div className="relative rounded-2xl border p-8 md:p-12 overflow-hidden"
            style={{ borderColor: `${STEPS[activeStep].color}30`, background: `${STEPS[activeStep].color}08` }}>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
              style={{ background: STEPS[activeStep].color }} />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ background: `${STEPS[activeStep].color}20`, borderColor: `${STEPS[activeStep].color}40` }}>
                <span className="material-symbols-outlined text-3xl" style={{ color: STEPS[activeStep].color }}>{STEPS[activeStep].icon}</span>
              </div>
              <div className="flex-1">
                <span className="font-label-mono text-xs uppercase tracking-widest text-secondary mb-1 block">{STEPS[activeStep].subtitle}</span>
                <h3 className="font-headline-sm text-2xl text-on-surface mb-4">{STEPS[activeStep].title}</h3>
                <p className="text-secondary font-body-md text-base leading-relaxed max-w-2xl">{STEPS[activeStep].body}</p>
              </div>
            </div>

            {/* AI-specific extras — only for Step 4 */}
            {STEPS[activeStep].extra === "ai" && (
              <div className="mt-10 relative z-10 flex flex-col gap-10">
                {/* Principles */}
                <div>
                  <h4 className="font-headline-sm text-lg text-on-surface mb-4">How the AI Thinks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PRINCIPLES.map((p, i) => (
                      <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-primary text-xl">{p.icon}</span>
                          <span className="font-label-mono text-sm text-on-surface font-semibold">{p.title}</span>
                        </div>
                        <p className="text-secondary font-body-md text-sm leading-relaxed">{p.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Prompt Preview */}
                <div>
                  <h4 className="font-headline-sm text-lg text-on-surface mb-4">What the AI Is Told</h4>
                  <div className="bg-[#080808] border border-white/5 rounded-xl p-6 font-mono text-sm text-secondary leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="ml-2 text-secondary/50 text-xs">system_prompt.txt</span>
                    </div>
                    <p className="text-on-surface/80 mb-2"><span className="text-primary">You are the Interrogator</span> — a ruthlessly analytical AI trading coach.</p>
                    <p className="mb-2">Dissect the trader&apos;s strategy using their actual trade data. Be precise. Cite specific trades. No platitudes.</p>
                    <p className="mb-2 text-on-surface/50">Context: <span className="text-on-surface/80">[Last 50 trades with symbol, side, qty, price, PnL, timestamp]</span></p>
                    <p className="mb-2 text-on-surface/50">Metrics: <span className="text-on-surface/80">[Win rate, total PnL, max drawdown, profit factor]</span></p>
                    <p><span className="text-primary">Output:</span> JSON with <span className="text-emerald-400">summary</span>, <span className="text-emerald-400">insights[]</span>, <span className="text-emerald-400">actionItems[]</span>, <span className="text-emerald-400">verdict</span>.</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-headline-sm text-lg text-on-surface mb-4">Technology Stack</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TECH.map((t) => (
                      <TiltCard key={t.name}>
                        <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: `${t.color}25`, background: `${t.color}08` }}>
                          <span className="material-symbols-outlined text-2xl" style={{ color: t.color }}>{t.icon}</span>
                          <div>
                            <div className="font-label-mono text-sm text-on-surface font-semibold">{t.name}</div>
                            <div className="font-body-md text-xs text-secondary">{t.role}</div>
                          </div>
                        </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dot nav */}
            <div className="flex items-center gap-2 mt-8 relative z-10">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: i === activeStep ? STEPS[activeStep].color : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      {/* CTA */}
      <section className="text-center">
        <TiltCard className="inline-block w-full">
          <div className="bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-transparent to-transparent pointer-events-none" />
            <h2 className="font-headline-sm text-3xl text-on-surface mb-3 relative z-10">Ready to be Interrogated?</h2>
            <p className="text-secondary font-body-md mb-8 relative z-10">Upload your broker CSV and let the AI dissect your decisions.</p>
            <div className="flex gap-4 justify-center relative z-10">
              <Link href="/app/upload" className="px-8 py-3 bg-primary-container text-white rounded-lg font-label-mono font-semibold hover:bg-primary-container/90 transition-colors shadow-[0_4px_20px_rgba(197,43,57,0.4)]">Upload CSV</Link>
              <Link href="/app/ask" className="px-8 py-3 border border-white/15 text-on-surface rounded-lg font-label-mono hover:border-white/30 transition-colors">Ask the AI</Link>
            </div>
          </div>
        </TiltCard>
      </section>
    </div>
  );
}
