"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Animated Grid Background ─────────────────────────────────── */
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e5e2e1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_30%,#131313_100%)]" />
    </div>
  );
}

/* ─── 3D Floating Card ──────────────────────────────────────────── */
function FloatingCard({
  children, className = "", style = {}, delay = 0,
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(20px)`;
    };
    const onLeave = () => { el.style.transform = "perspective(600px) rotateY(0) rotateX(0) translateZ(0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
  return (
    <div ref={ref} className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ ...style, transformStyle: "preserve-3d", animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── Typewriter ────────────────────────────────────────────────── */
const PHRASES = ["Interrogate Your Trades.", "Expose Your Biases.", "Eliminate Weak Entries.", "Optimize for Alpha."];
function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const target = PHRASES[phraseIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayed.length < target.length) setDisplayed(target.slice(0, displayed.length + 1));
        else setTimeout(() => setDeleting(true), 1800);
      } else {
        if (displayed.length > 0) setDisplayed(displayed.slice(0, -1));
        else { setDeleting(false); setPhraseIdx((i) => (i + 1) % PHRASES.length); }
      }
    }, deleting ? 35 : 60);
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);
  return (
    <span className="text-gradient-red">
      {displayed}<span className="animate-pulse">|</span>
    </span>
  );
}

/* ─── Stat Counter ──────────────────────────────────────────────── */
function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <FloatingCard>
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 text-center hover:border-primary-container/40 transition-colors group">
        <div className="text-4xl font-bold text-on-surface mb-1 group-hover:text-gradient-red transition-colors">{value}</div>
        <div className="font-label-mono text-sm text-secondary uppercase tracking-widest">{label}</div>
        <div className="font-body-md text-xs text-secondary/50 mt-1">{sub}</div>
      </div>
    </FloatingCard>
  );
}

/* ─── Bento Card ────────────────────────────────────────────────── */
function BentoCard({ icon, title, body, accent = false, wide = false, children }: {
  icon: string; title: string; body: string; accent?: boolean; wide?: boolean; children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    };
    const onLeave = () => { el.style.transform = "none"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
  return (
    <div ref={ref}
      className={`relative rounded-2xl p-8 overflow-hidden group transition-all duration-300 will-change-transform border
        ${wide ? "md:col-span-2" : ""}
        ${accent
          ? "bg-primary-container/10 border-primary-container/30 hover:border-primary-container/60"
          : "bg-[#0f0f0f] border-white/5 hover:border-white/15"}`}
      style={{ transformStyle: "preserve-3d" }}>
      {/* Glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl
        ${accent ? "bg-[radial-gradient(ellipse_at_top_right,rgba(197,43,57,0.12),transparent)]" : "bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03),transparent)]"}`} />
      <span className={`material-symbols-outlined text-4xl mb-5 block ${accent ? "text-primary-container" : "text-secondary group-hover:text-on-surface transition-colors"}`}>
        {icon}
      </span>
      <h3 className="font-headline-sm text-xl text-on-surface mb-3">{title}</h3>
      <p className="font-body-md text-secondary text-sm leading-relaxed">{body}</p>
      {children}
    </div>
  );
}

/* ─── Live Ticker ───────────────────────────────────────────────── */
const TICKERS = [
  { sym: "AAPL", val: "-14.2%", flag: true }, { sym: "NVDA", val: "+8.5%", flag: false },
  { sym: "TSLA", val: "-22.1%", flag: true }, { sym: "SPY",  val: "+3.1%", flag: false },
  { sym: "HOOD", val: "-9.7%",  flag: true }, { sym: "GME",  val: "+41%",  flag: false },
];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Hero parallax
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => { el.style.transform = `translateY(${window.scrollY * 0.25}px)`; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background antialiased selection:bg-primary-container selection:text-white overflow-x-hidden">
      <GridBackground />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 max-w-[1400px] mx-auto">
          <Link href="/" className="font-headline-sm text-xl text-primary font-bold tracking-tighter">
            PROJECT ROAST
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {["Dashboard", "How It Works", "Upload"].map((label, i) => (
              <Link key={i}
                href={i === 0 ? "/app/portfolio" : i === 1 ? "/app/about" : "/app/upload"}
                className="text-secondary hover:text-on-surface transition-colors font-body-md text-sm">
                {label}
              </Link>
            ))}
          </div>
          <Link href="/auth/sign-in"
            className="bg-primary-container text-white px-5 py-2 rounded-lg font-label-mono text-sm hover:bg-primary-container/85 transition-colors shadow-[0_2px_12px_rgba(197,43,57,0.35)]">
            Sign In →
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative">
          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-primary-container/8 blur-[120px]" />
          </div>

          {/* Orbit rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[280,400,520].map((s, i) => (
              <div key={i} className="absolute rounded-full border border-white/[0.04]"
                style={{ width: s, height: s }} />
            ))}
          </div>

          <div ref={heroRef} className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-container/15 border border-primary-container/25 rounded-full px-4 py-1.5 mb-8 font-label-mono text-xs text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Powered by Qwen 3 480B · NVIDIA NIM
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-on-surface leading-[1.05] mb-6">
              <Typewriter />
            </h1>

            <p className="text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Deploy a 480B-parameter AI to dissect your broker data, expose cognitive biases, and eliminate losing patterns — with surgical precision.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link href="/auth/sign-in"
                className="bg-primary-container text-white px-8 py-4 rounded-xl font-label-mono font-semibold hover:bg-primary-container/90 transition-all shadow-[0_4px_24px_rgba(197,43,57,0.45)] hover:shadow-[0_8px_32px_rgba(197,43,57,0.6)] hover:-translate-y-0.5 active:translate-y-0">
                Start Interrogation
              </Link>
              <Link href="/app/about"
                className="border border-white/15 text-on-surface px-8 py-4 rounded-xl font-label-mono hover:border-white/30 hover:bg-white/5 transition-all">
                How It Works
              </Link>
            </div>

            {/* Floating trade cards */}
            <div className="relative h-[320px] md:h-[280px] w-full max-w-3xl mx-auto">
              {/* Card 1 */}
              <FloatingCard delay={0}
                className="absolute top-0 right-[5%] md:right-[10%] w-60"
                style={{ animation: "floatCard 6s ease-in-out infinite" }}>
                <div className="bg-[#0f0f0f]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label-mono text-xs text-secondary">AAPL / LONG</span>
                    <span className="bg-red-900/40 border border-red-900/60 text-red-400 px-2 py-0.5 rounded text-[10px] font-label-mono">⚠ Flagged</span>
                  </div>
                  <div className="font-bold text-2xl text-red-400 mb-1">-14.2%</div>
                  <div className="text-xs text-secondary leading-snug">Poor entry timing relative to macro indicators</div>
                </div>
              </FloatingCard>

              {/* Card 2 */}
              <FloatingCard delay={1.5}
                className="absolute bottom-4 left-[2%] md:left-[8%] w-64"
                style={{ animation: "floatCard 7s ease-in-out 1.5s infinite" }}>
                <div className="bg-[#0f0f0f]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label-mono text-xs text-secondary">NVDA / SHORT</span>
                    <span className="bg-emerald-900/40 border border-emerald-900/60 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-label-mono">✓ Roasted</span>
                  </div>
                  <div className="font-bold text-2xl text-emerald-400 mb-1">+8.5%</div>
                  <div className="text-xs text-secondary leading-snug">Solid thesis, premature exit cost 3.2%</div>
                </div>
              </FloatingCard>

              {/* Card 3 — center */}
              <FloatingCard delay={0.8}
                className="absolute top-12 left-[30%] md:left-[35%] w-52"
                style={{ animation: "floatCard 5.5s ease-in-out 0.8s infinite" }}>
                <div className="bg-[#0f0f0f]/90 backdrop-blur-md border border-primary-container/30 rounded-xl p-4 shadow-2xl">
                  <div className="font-label-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">AI Verdict</div>
                  <div className="text-xs text-on-surface leading-snug">"You have a pattern of exiting winners 40% too early. Avg hold: 2.1 days."</div>
                  <div className="mt-2 text-[10px] text-primary font-label-mono">— The Interrogator</div>
                </div>
              </FloatingCard>
            </div>
          </div>

          <style>{`
            @keyframes floatCard {
              0%,100% { transform: translateY(0px) perspective(600px) rotateX(0deg); }
              50%      { transform: translateY(-14px) perspective(600px) rotateX(2deg); }
            }
          `}</style>
        </section>

        {/* ── Live Ticker Strip ──────────────────────────────────── */}
        <div className="w-full border-y border-white/5 bg-[#0c0c0c] overflow-hidden py-3 relative">
          <div className="flex gap-12 animate-[ticker_20s_linear_infinite] whitespace-nowrap">
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <span className="font-label-mono text-sm text-secondary">{t.sym}</span>
                <span className={`font-label-mono text-sm font-bold ${t.flag ? "text-red-400" : "text-emerald-400"}`}>{t.val}</span>
                {t.flag && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </div>
            ))}
          </div>
          <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="480B" label="Model Params" sub="Qwen 3 Coder MoE" />
            <StatCard value="50×" label="Trade Context" sub="per AI query" />
            <StatCard value="< 1s" label="CSV Ingestion" sub="any broker format" />
            <StatCard value="100%" label="Data Isolated" sub="per user workspace" />
          </div>
        </section>

        {/* ── Bento Grid ─────────────────────────────────────────── */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-3">Architected for Alpha</h2>
            <p className="text-secondary font-body-md max-w-xl mx-auto">Every feature engineered to expose the truth about your trading performance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard wide accent icon="psychology" title="Surgical Dissection"
              body="The Interrogator AI tears apart your trading logic, identifying cognitive biases and statistical anomalies with zero empathy. Evidence-cited, never generic." />
            <BentoCard icon="analytics" title="Deep Forensics"
              body="Post-trade analysis computes Win Rate, Max Drawdown, and Profit Factor from your actual imported data — updated after every upload." />
            <BentoCard icon="upload_file" title="Any Broker CSV"
              body="Auto-detects column schemas from Robinhood, Interactive Brokers, OHLCV, and custom formats. No manual mapping required for standard exports." />
            <BentoCard icon="radar" title="Pattern Detection"
              body="The AI flags recurring loss patterns — bad days of the week, oversized positions, FOMO entries — and gives you specific trade-level evidence." />
            <BentoCard wide icon="terminal" title="Ask Anything"
              body="Type natural language questions like 'Why did April underperform?' or 'What's my worst symbol this quarter?' and get cited, data-backed answers."
            >
              <div className="mt-5 font-label-mono text-sm text-secondary bg-black/50 border border-white/5 rounded-lg p-4 leading-relaxed">
                <span className="text-primary">{">"}</span> Why did I underperform in March?<br />
                <span className="text-emerald-400 text-xs">↳ 7 of 9 losses occurred on Monday opens. Avg loss: -$420. Pattern: gap-down entries.</span>
              </div>
            </BentoCard>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
          <FloatingCard>
            <div className="relative rounded-3xl overflow-hidden border border-primary-container/30 bg-gradient-to-br from-primary-container/15 via-[#0f0f0f] to-[#0f0f0f] p-12 md:p-20 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(197,43,57,0.15),transparent)] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/60 to-transparent" />
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4 relative z-10">
                Stop guessing.<br /><span className="text-gradient-red">Start interrogating.</span>
              </h2>
              <p className="text-secondary font-body-md text-lg mb-10 max-w-lg mx-auto relative z-10">
                Upload your broker CSV and let a 480B-parameter AI tell you exactly what&apos;s costing you money.
              </p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                <Link href="/auth/sign-in"
                  className="bg-primary-container text-white px-10 py-4 rounded-xl font-label-mono font-semibold text-base hover:bg-primary-container/90 transition-all shadow-[0_4px_30px_rgba(197,43,57,0.5)] hover:shadow-[0_8px_40px_rgba(197,43,57,0.7)] hover:-translate-y-0.5">
                  Start Free Interrogation
                </Link>
                <Link href="/app/about"
                  className="border border-white/15 text-on-surface px-10 py-4 rounded-xl font-label-mono text-base hover:border-white/30 hover:bg-white/5 transition-all">
                  Learn How It Works
                </Link>
              </div>
            </div>
          </FloatingCard>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0c0c0c] py-8 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-label-mono text-xs text-secondary/50">PROJECT ROAST © 2025 · Powered by NVIDIA NIM · Qwen 3 480B</div>
          <div className="flex gap-6">
            <Link href="/app/about" className="font-label-mono text-xs text-secondary/50 hover:text-secondary transition-colors">How It Works</Link>
            <Link href="/auth/sign-in" className="font-label-mono text-xs text-secondary/50 hover:text-secondary transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
