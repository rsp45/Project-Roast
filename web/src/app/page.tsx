"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Candlestick + Spark Canvas ────────────────────────────────── */
function RoastCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Spark particles ──────────────────────────────────────────
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number };
    const sparks: Spark[] = [];

    const makeSpark = (): Spark => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 2.5 + 1),
      life: 0,
      maxLife: Math.random() * 120 + 60,
      size: Math.random() * 2.5 + 0.5,
      hue: Math.random() * 40 + 10, // orange-red range
    });

    for (let i = 0; i < 80; i++) {
      const s = makeSpark();
      s.y = Math.random() * canvas.height; // scatter initial
      s.life = Math.random() * s.maxLife;
      sparks.push(s);
    }

    // ── Candlestick data generation ──────────────────────────────
    type Candle = { o: number; h: number; l: number; c: number };
    const generateCandles = (count: number): Candle[] => {
      const candles: Candle[] = [];
      let price = 150;
      for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.48) * 8;
        const o = price;
        const c = price + change;
        const h = Math.max(o, c) + Math.random() * 4;
        const l = Math.min(o, c) - Math.random() * 4;
        candles.push({ o, h, l, c });
        price = c;
      }
      return candles;
    };

    const drawCandles = () => {
      const W = canvas.width;
      const H = canvas.height;
      const count = Math.floor(W / 22);
      const candles = generateCandles(count);
      const allPrices = candles.flatMap((c) => [c.h, c.l]);
      const minP = Math.min(...allPrices);
      const maxP = Math.max(...allPrices);
      const range = maxP - minP || 1;

      const toY = (p: number) => H * 0.35 + ((maxP - p) / range) * (H * 0.45);
      const cw = Math.floor(W / count) - 4;

      candles.forEach((c, i) => {
        const x = i * (W / count) + 4;
        const isGreen = c.c >= c.o;
        const baseAlpha = 0.12;

        // Wick
        ctx.beginPath();
        ctx.moveTo(x + cw / 2, toY(c.h));
        ctx.lineTo(x + cw / 2, toY(c.l));
        ctx.strokeStyle = isGreen ? `rgba(16,185,129,${baseAlpha})` : `rgba(197,43,57,${baseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Body
        ctx.fillStyle = isGreen ? `rgba(16,185,129,${baseAlpha * 1.5})` : `rgba(197,43,57,${baseAlpha * 1.5})`;
        const y1 = toY(Math.max(c.o, c.c));
        const y2 = toY(Math.min(c.o, c.c));
        ctx.fillRect(x, y1, cw, Math.max(y2 - y1, 1));

        // Roast glow on red candles
        if (!isGreen) {
          const grd = ctx.createLinearGradient(x, y1, x, y2);
          grd.addColorStop(0, "rgba(255,80,0,0.06)");
          grd.addColorStop(1, "rgba(255,30,0,0.02)");
          ctx.fillStyle = grd;
          ctx.fillRect(x - 1, y1 - 2, cw + 2, y2 - y1 + 4);
        }
      });
    };

    // Draw candles once (static for perf)
    drawCandles();

    // ── Animation loop (sparks only) ─────────────────────────────
    const animate = () => {
      // Fade trail
      ctx.fillStyle = "rgba(19,19,19,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of sparks) {
        s.x += s.vx + Math.sin(s.life * 0.08) * 0.4;
        s.y += s.vy;
        s.life++;
        s.vy *= 0.995;

        if (s.life >= s.maxLife) {
          Object.assign(s, makeSpark());
          continue;
        }

        const t = s.life / s.maxLife;
        const alpha = t < 0.1 ? t * 10 : 1 - t;
        const r = s.size * (1 - t * 0.5);

        // Core ember
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 70%, ${alpha * 0.9})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 50%, ${alpha * 0.15})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ── Typewriter ─────────────────────────────────────────────────── */
const PHRASES = ["Interrogate Your Trades.", "Expose Your Biases.", "Eliminate Weak Entries.", "Optimize for Alpha."];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const target = PHRASES[idx];
    const t = setTimeout(() => {
      if (!del) {
        if (txt.length < target.length) setTxt(target.slice(0, txt.length + 1));
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (txt.length > 0) setTxt(txt.slice(0, -1));
        else { setDel(false); setIdx((i) => (i + 1) % PHRASES.length); }
      }
    }, del ? 35 : 60);
    return () => clearTimeout(t);
  }, [txt, del, idx]);

  return (
    <span className="fire-text">
      {txt}<span className="animate-pulse">|</span>
    </span>
  );
}

/* ── Tilt card ──────────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    };
    const l = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", m); el.addEventListener("mouseleave", l);
    return () => { el.removeEventListener("mousemove", m); el.removeEventListener("mouseleave", l); };
  }, []);
  return <div ref={ref} className={`transition-transform duration-200 ease-out ${className}`} style={{ transformStyle: "preserve-3d" }}>{children}</div>;
}

const TICKERS = [
  { sym: "AAPL", val: "-14.2%", flag: true }, { sym: "NVDA", val: "+8.5%", flag: false },
  { sym: "TSLA", val: "-22.1%", flag: true }, { sym: "SPY", val: "+3.1%", flag: false },
  { sym: "HOOD", val: "-9.7%", flag: true }, { sym: "GME", val: "+41%", flag: false },
];

const FEATURES = [
  { icon: "psychology", title: "Surgical Dissection", body: "The Interrogator tears apart your trading logic, identifying cognitive biases and statistical anomalies with zero empathy.", wide: true, accent: true },
  { icon: "analytics", title: "Deep Forensics", body: "Win Rate, Max Drawdown, and Profit Factor computed from your actual imported trade data.", wide: false, accent: false },
  { icon: "upload_file", title: "Any Broker CSV", body: "Auto-detects Robinhood, Interactive Brokers, OHLCV, and custom formats — no manual mapping required.", wide: false, accent: false },
  { icon: "radar", title: "Pattern Detection", body: "Flags recurring loss patterns — bad days, oversized positions, FOMO entries — with specific trade evidence.", wide: false, accent: false },
  { icon: "terminal", title: "Ask Anything", body: "Natural language Q&A: \"Why did April underperform?\" gets you cited, data-backed answers in seconds.", wide: true, accent: false },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#131313] text-on-background antialiased overflow-x-hidden">
      <style>{`
        .fire-text {
          background-image: url('/fire-texture.png');
          background-size: cover;
          background-position: center;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: brightness(1.3) saturate(1.4);
        }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes floatA { 0%,100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-16px) rotate(2deg); } }
        @keyframes floatB { 0%,100% { transform: translateY(0px) rotate(-1.5deg); } 50% { transform: translateY(-12px) rotate(-1.5deg); } }
        @keyframes floatC { 0%,100% { transform: translateY(0px) rotate(1deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
      `}</style>

      <RoastCanvas />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 max-w-[1400px] mx-auto">
          <Link href="/" className="font-headline-sm text-xl text-primary font-bold tracking-tighter">PROJECT ROAST</Link>
          <div className="hidden md:flex items-center gap-8">
            {[["Dashboard", "/app/portfolio"], ["How It Works", "/app/about"], ["Upload", "/app/upload"]].map(([l, h]) => (
              <Link key={h} href={h} className="text-secondary hover:text-on-surface transition-colors text-sm">{l}</Link>
            ))}
          </div>
          <Link href="/auth/sign-in" className="bg-primary-container text-white px-5 py-2 rounded-lg font-label-mono text-sm hover:bg-primary-container/85 transition-colors shadow-[0_2px_12px_rgba(197,43,57,0.4)]">
            Sign In →
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative">
          {/* Ember glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(ellipse at bottom, rgba(197,43,57,0.18) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-container/15 border border-primary-container/25 rounded-full px-4 py-1.5 mb-8 font-label-mono text-xs text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Powered by Qwen 3 480B · NVIDIA NIM
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 min-h-[1.2em]">
              <Typewriter />
            </h1>

            <p className="text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Deploy a 480B-parameter AI to dissect your broker data, expose cognitive biases, and eliminate losing patterns — with surgical precision.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-14">
              <Link href="/auth/sign-in"
                className="bg-primary-container text-white px-8 py-4 rounded-xl font-label-mono font-semibold hover:bg-primary-container/90 transition-all shadow-[0_4px_24px_rgba(197,43,57,0.5)] hover:-translate-y-0.5">
                Start Interrogation 🔥
              </Link>
              <Link href="/app/about"
                className="border border-white/15 text-on-surface px-8 py-4 rounded-xl font-label-mono hover:border-white/30 hover:bg-white/5 transition-all">
                How It Works
              </Link>
            </div>

            {/* Floating trade cards */}
            <div className="relative h-[280px] w-full max-w-2xl mx-auto">
              <div className="absolute top-0 right-[5%] w-56" style={{ animation: "floatA 6s ease-in-out infinite" }}>
                <TiltCard>
                  <div className="bg-[#0f0f0f]/95 backdrop-blur-sm border border-red-900/40 rounded-xl p-4 shadow-[0_8px_32px_rgba(197,43,57,0.2)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-mono text-xs text-secondary">AAPL / LONG</span>
                      <span className="bg-red-900/40 border border-red-900/60 text-red-400 px-2 py-0.5 rounded text-[10px]">⚠ Flagged</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400 mb-1">-14.2%</div>
                    <div className="text-xs text-secondary">Poor entry timing vs macro indicators</div>
                  </div>
                </TiltCard>
              </div>

              <div className="absolute bottom-4 left-[3%] w-60" style={{ animation: "floatB 7s ease-in-out 1.5s infinite" }}>
                <TiltCard>
                  <div className="bg-[#0f0f0f]/95 backdrop-blur-sm border border-emerald-900/40 rounded-xl p-4 shadow-[0_8px_32px_rgba(16,185,129,0.15)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-mono text-xs text-secondary">NVDA / SHORT</span>
                      <span className="bg-emerald-900/40 border border-emerald-900/60 text-emerald-400 px-2 py-0.5 rounded text-[10px]">✓ Roasted</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">+8.5%</div>
                    <div className="text-xs text-secondary">Solid thesis, premature exit cost 3.2%</div>
                  </div>
                </TiltCard>
              </div>

              <div className="absolute top-10 left-[30%] w-48" style={{ animation: "floatC 5.5s ease-in-out 0.8s infinite" }}>
                <TiltCard>
                  <div className="bg-[#0f0f0f]/95 backdrop-blur-sm border border-orange-900/40 rounded-xl p-4 shadow-[0_8px_32px_rgba(251,146,60,0.15)]">
                    <div className="text-[10px] font-label-mono text-orange-400 uppercase tracking-widest mb-2">🔥 AI Verdict</div>
                    <div className="text-xs text-on-surface leading-snug">"You exit winners 40% too early. Avg hold: 2.1 days."</div>
                    <div className="mt-2 text-[10px] text-orange-400 font-label-mono">— The Interrogator</div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="w-full border-y border-white/5 bg-[#0c0c0c]/80 overflow-hidden py-3">
          <div className="flex gap-12 whitespace-nowrap" style={{ animation: "ticker 22s linear infinite" }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <span className="font-label-mono text-sm text-secondary">{t.sym}</span>
                <span className={`font-label-mono text-sm font-bold ${t.flag ? "text-red-400" : "text-emerald-400"}`}>{t.val}</span>
                {t.flag && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["480B", "Model Params", "Qwen 3 Coder MoE"], ["50×", "Trade Context", "per AI query"], ["< 1s", "CSV Ingestion", "any broker format"], ["100%", "Data Isolated", "per user workspace"]].map(([v, l, s]) => (
              <TiltCard key={l}>
                <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-6 text-center hover:border-orange-900/40 transition-colors group">
                  <div className="text-4xl font-bold text-on-surface mb-1 group-hover:fire-text transition-all">{v}</div>
                  <div className="font-label-mono text-xs text-secondary uppercase tracking-widest">{l}</div>
                  <div className="text-xs text-secondary/50 mt-1">{s}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Bento */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">Architected for Alpha</h2>
            <p className="text-secondary max-w-xl mx-auto">Every feature engineered to expose the truth about your trading.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <TiltCard key={f.title} className={f.wide ? "md:col-span-2" : ""}>
                <div className={`relative rounded-2xl p-8 border h-full overflow-hidden group transition-all duration-300
                  ${f.accent ? "bg-primary-container/10 border-primary-container/30 hover:border-primary-container/60" : "bg-[#0f0f0f] border-white/5 hover:border-white/15"}`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: f.accent ? "radial-gradient(ellipse at top right,rgba(197,43,57,0.1),transparent)" : "radial-gradient(ellipse at top right,rgba(251,146,60,0.04),transparent)" }} />
                  <span className={`material-symbols-outlined text-4xl mb-5 block ${f.accent ? "text-primary-container" : "text-secondary group-hover:text-orange-400 transition-colors"}`}>{f.icon}</span>
                  <h3 className="font-headline-sm text-xl text-on-surface mb-3">{f.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{f.body}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
          <TiltCard>
            <div className="relative rounded-3xl overflow-hidden border border-orange-900/30 p-12 md:p-20 text-center"
              style={{ background: "linear-gradient(135deg,rgba(197,43,57,0.12) 0%,#0f0f0f 60%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%,rgba(255,100,0,0.12),transparent)" }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.5),transparent)" }} />
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4 relative z-10">
                Stop guessing.<br />
                <span className="fire-text">Start interrogating.</span>
              </h2>
              <p className="text-secondary text-lg mb-10 max-w-lg mx-auto relative z-10">
                Upload your broker CSV and let a 480B-parameter AI tell you exactly what&apos;s costing you money.
              </p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                <Link href="/auth/sign-in"
                  className="bg-primary-container text-white px-10 py-4 rounded-xl font-label-mono font-semibold text-base hover:bg-primary-container/90 transition-all shadow-[0_4px_30px_rgba(197,43,57,0.5)] hover:-translate-y-0.5">
                  Start Free 🔥
                </Link>
                <Link href="/app/about"
                  className="border border-white/15 text-on-surface px-10 py-4 rounded-xl font-label-mono text-base hover:border-orange-900/50 transition-all">
                  Learn How It Works
                </Link>
              </div>
            </div>
          </TiltCard>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#0c0c0c] py-8 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-label-mono text-xs text-secondary/50">PROJECT ROAST © 2025 · NVIDIA NIM · Qwen 3 480B</div>
          <div className="flex gap-6">
            <Link href="/app/about" className="font-label-mono text-xs text-secondary/50 hover:text-secondary transition-colors">How It Works</Link>
            <Link href="/auth/sign-in" className="font-label-mono text-xs text-secondary/50 hover:text-secondary transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
