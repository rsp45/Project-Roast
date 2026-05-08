"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

// 3D tilt card effect hook
function useTilt(strength = 15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`;
    };
    const handleLeave = () => {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength]);

  return ref;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useTilt(8);
  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

// Animated orbit ring
function OrbitRing({ size, speed, delay, color }: { size: number; speed: number; delay: number; color: string }) {
  return (
    <div
      className="absolute rounded-full border opacity-20 pointer-events-none"
      style={{
        width: size,
        height: size,
        borderColor: color,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        animation: `spin ${speed}s linear ${delay}s infinite`,
      }}
    />
  );
}

const PIPELINE_STEPS = [
  {
    icon: "upload_file",
    title: "CSV Ingestion",
    subtitle: "Step 1",
    body: "Your broker CSV is parsed by a multi-format engine that detects column schemas automatically — whether it's OHLCV, Robinhood, Interactive Brokers, or a custom format. Timestamps, PnL, symbols, and quantities are normalized.",
    color: "#c52b39",
  },
  {
    icon: "database",
    title: "Trade Storage",
    subtitle: "Step 2",
    body: "Parsed trades are stored in a PostgreSQL database, associated with your workspace. All data is isolated per user — no trade data is shared or visible to other accounts.",
    color: "#8b5cf6",
  },
  {
    icon: "analytics",
    title: "Metrics Engine",
    subtitle: "Step 3",
    body: "Aggregate metrics (Win Rate, PnL, Max Drawdown, Profit Factor) and per-trade signals are computed server-side. An equity curve is constructed from chronological PnL data.",
    color: "#3b82f6",
  },
  {
    icon: "psychology",
    title: "AI Interrogation",
    subtitle: "Step 4",
    body: "The Interrogator (Qwen 3 Coder 480B via NVIDIA NIM) receives your trade context — up to 50 recent trades with live metrics — and answers your questions with evidence-based citations from your actual data.",
    color: "#10b981",
  },
];

const INTERROGATOR_PRINCIPLES = [
  {
    icon: "fact_check",
    title: "Evidence-First",
    body: "Every answer cites specific trades, dates, and numbers from your actual CSV — no hallucinated generalizations.",
  },
  {
    icon: "search_insights",
    title: "Pattern Detection",
    body: "The model is instructed to identify recurring mistake patterns, correlations between loss days and market conditions, and behavioral biases.",
  },
  {
    icon: "security",
    title: "Data Privacy",
    body: "Your trade data is sent to NVIDIA's NIM API only during an active query. No data is stored by the AI provider. Each query is stateless.",
  },
  {
    icon: "bolt",
    title: "480B Parameter Model",
    body: "Qwen 3 Coder 480B is a mixture-of-experts model optimized for structured data analysis — it excels at reading tabular financial data and computing logical conclusions.",
  },
];

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax effect on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      el.style.transform = `translateY(${scrollY * 0.3}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-16 relative">
      {/* Hero Section with orbit rings */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[340px] overflow-hidden pt-8">
        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <style>{`@keyframes spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }`}</style>
          <OrbitRing size={240} speed={12} delay={0} color="#c52b39" />
          <OrbitRing size={340} speed={20} delay={-5} color="#8b5cf6" />
          <OrbitRing size={440} speed={28} delay={-10} color="#3b82f6" />
          <OrbitRing size={540} speed={36} delay={-15} color="#10b981" />
        </div>

        <div ref={heroRef} className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary-container/30 rounded-full px-4 py-1.5 mb-6 font-label-mono text-xs text-primary uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            System Architecture
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface tracking-tight mb-4 font-bold">
            How Project Roast Works
          </h1>
          <p className="text-secondary font-body-md text-lg max-w-2xl mx-auto leading-relaxed">
            A full-stack AI trading analyst that ingests your raw broker data, computes portfolio metrics, and deploys a 480B-parameter model to interrogate your strategy with surgical precision.
          </p>
        </div>
      </section>

      {/* Pipeline Steps */}
      <section>
        <h2 className="font-headline-sm text-2xl text-on-surface mb-2 text-center">The Interrogation Pipeline</h2>
        <p className="text-secondary font-body-md text-center mb-10">From raw CSV to AI-powered insight in 4 stages.</p>

        {/* Step selector tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-mono text-sm whitespace-nowrap transition-all duration-200 border ${
                activeStep === i
                  ? "border-primary-container/60 bg-primary-container/15 text-on-surface"
                  : "border-white/5 text-secondary hover:border-white/15 hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ color: activeStep === i ? step.color : undefined }}>
                {step.icon}
              </span>
              {step.title}
            </button>
          ))}
        </div>

        {/* Active step card with 3D tilt */}
        <TiltCard>
          <div
            className="relative rounded-2xl border p-8 md:p-12 overflow-hidden"
            style={{ borderColor: `${PIPELINE_STEPS[activeStep].color}30`, background: `${PIPELINE_STEPS[activeStep].color}08` }}
          >
            {/* Glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
              style={{ background: PIPELINE_STEPS[activeStep].color }}
            />
            <div className="flex items-start gap-6 relative z-10">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ background: `${PIPELINE_STEPS[activeStep].color}20`, borderColor: `${PIPELINE_STEPS[activeStep].color}40` }}
              >
                <span className="material-symbols-outlined text-3xl" style={{ color: PIPELINE_STEPS[activeStep].color }}>
                  {PIPELINE_STEPS[activeStep].icon}
                </span>
              </div>
              <div>
                <span className="font-label-mono text-xs uppercase tracking-widest text-secondary mb-1 block">
                  {PIPELINE_STEPS[activeStep].subtitle}
                </span>
                <h3 className="font-headline-sm text-2xl text-on-surface mb-4">{PIPELINE_STEPS[activeStep].title}</h3>
                <p className="text-secondary font-body-md text-base leading-relaxed max-w-2xl">
                  {PIPELINE_STEPS[activeStep].body}
                </p>
              </div>
            </div>

            {/* Pipeline arrows */}
            <div className="flex items-center gap-2 mt-8 relative z-10">
              {PIPELINE_STEPS.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStep(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ background: i === activeStep ? PIPELINE_STEPS[activeStep].color : "rgba(255,255,255,0.15)" }}
                  />
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="w-8 h-px bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      {/* Interrogator AI Section */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary">psychology</span>
          <h2 className="font-headline-sm text-2xl text-on-surface">The Interrogator AI</h2>
        </div>
        <p className="text-secondary font-body-md mb-8 max-w-2xl">
          Powered by <strong className="text-on-surface">Qwen 3 Coder 480B</strong> — a 480-billion parameter Mixture-of-Experts model hosted on NVIDIA NIM infrastructure.
          It's given a system prompt that enforces evidence-based financial analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTERROGATOR_PRINCIPLES.map((p, i) => (
            <TiltCard key={i}>
              <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 h-full group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-primary text-xl">{p.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-[17px] text-on-surface">{p.title}</h3>
                </div>
                <p className="text-secondary font-body-md text-sm leading-relaxed">{p.body}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* System Prompt Preview */}
      <section>
        <h2 className="font-headline-sm text-2xl text-on-surface mb-2">What the AI Is Told</h2>
        <p className="text-secondary font-body-md mb-6">The Interrogator receives this system context before every question:</p>
        <div className="bg-[#080808] border border-white/5 rounded-xl p-6 font-mono text-sm text-secondary leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-secondary/50 text-xs">system_prompt.txt</span>
          </div>
          <p className="text-on-surface/80 mb-2">
            <span className="text-primary">You are the Interrogator</span> — a ruthlessly analytical AI trading coach.
          </p>
          <p className="mb-2">Your job: dissect the trader&apos;s strategy using their actual trade data. Be precise. Cite specific trades. No platitudes.</p>
          <p className="mb-2 text-on-surface/50">
            Context: <span className="text-on-surface/80">[Last 50 trades with symbol, side, qty, price, PnL, timestamp]</span>
          </p>
          <p className="mb-2 text-on-surface/50">
            Metrics: <span className="text-on-surface/80">[Win rate, total PnL, max drawdown, profit factor]</span>
          </p>
          <p>
            <span className="text-primary">Rules:</span> Answer in JSON with{" "}
            <span className="text-emerald-400">summary</span>,{" "}
            <span className="text-emerald-400">insights[]</span>,{" "}
            <span className="text-emerald-400">actionItems[]</span>,{" "}
            <span className="text-emerald-400">verdict</span>.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="font-headline-sm text-2xl text-on-surface mb-8 text-center">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "FastAPI", role: "Backend API", icon: "rocket_launch", color: "#10b981" },
            { name: "Next.js 14", role: "Frontend", icon: "web", color: "#3b82f6" },
            { name: "PostgreSQL", role: "Trade Database", icon: "database", color: "#8b5cf6" },
            { name: "NVIDIA NIM", role: "AI Inference", icon: "memory", color: "#c52b39" },
            { name: "Vercel", role: "Frontend Host", icon: "cloud", color: "#64748b" },
            { name: "Render", role: "Backend Host", icon: "dns", color: "#f59e0b" },
            { name: "Qwen 3 480B", role: "AI Model", icon: "psychology", color: "#ec4899" },
            { name: "React Query", role: "Data Fetching", icon: "sync", color: "#06b6d4" },
          ].map((tech) => (
            <TiltCard key={tech.name}>
              <div
                className="rounded-xl border p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform"
                style={{ borderColor: `${tech.color}25`, background: `${tech.color}08` }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: tech.color }}>{tech.icon}</span>
                <div>
                  <div className="font-label-mono text-sm text-on-surface font-semibold">{tech.name}</div>
                  <div className="font-body-md text-xs text-secondary">{tech.role}</div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <TiltCard className="inline-block w-full">
          <div className="bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-transparent to-transparent pointer-events-none" />
            <h2 className="font-headline-sm text-3xl text-on-surface mb-3 relative z-10">Ready to be Interrogated?</h2>
            <p className="text-secondary font-body-md mb-8 relative z-10">Upload your broker CSV and let the AI dissect your trading decisions.</p>
            <div className="flex gap-4 justify-center relative z-10">
              <Link
                href="/app/upload"
                className="px-8 py-3 bg-primary-container text-white rounded-lg font-label-mono font-semibold hover:bg-primary-container/90 transition-colors shadow-[0_4px_20px_rgba(197,43,57,0.4)]"
              >
                Upload CSV
              </Link>
              <Link
                href="/app/ask"
                className="px-8 py-3 border border-white/15 text-on-surface rounded-lg font-label-mono hover:border-white/30 transition-colors"
              >
                Ask the AI
              </Link>
            </div>
          </div>
        </TiltCard>
      </section>
    </div>
  );
}
