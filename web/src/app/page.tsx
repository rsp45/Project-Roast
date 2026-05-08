import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-white">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="flex justify-between items-center h-16 px-margin max-w-[1440px] mx-auto">
          <div className="flex items-center gap-stack-lg">
            <Link
              href="/"
              className="font-headline-sm text-headline-sm text-primary dark:text-primary tracking-tighter font-bold"
            >
              PROJECT ROAST
            </Link>
            <div className="hidden md:flex items-center gap-stack-md">
              <Link
                href="/app/portfolio"
                className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200 font-headline-sm text-headline-sm"
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200 font-headline-sm text-headline-sm"
              >
                History
              </Link>
              <Link
                href="#"
                className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200 font-headline-sm text-headline-sm"
              >
                Insights
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <Link
              href="/auth/sign-in"
              className="text-primary dark:text-primary hover:text-primary transition-colors duration-200 active:opacity-80 transition-opacity flex items-center gap-2"
            >
              Sign In
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-[120px] pb-margin px-margin max-w-[1440px] mx-auto w-full">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-margin mb-[120px]">
          <div className="lg:w-1/2 flex flex-col gap-stack-lg z-10">
            <h1 className="font-display-lg text-display-lg text-gradient">
              Interrogate Your Trades with AI Precision
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-xl">
              Deploy an analytical intelligence entity to dissect your financial
              data. Uncover hidden patterns, roast poor decisions, and optimize
              your portfolio with surgical accuracy.
            </p>
            <div className="flex gap-stack-md mt-stack-sm">
              <Link
                href="/auth/sign-in"
                className="bg-primary-container text-white px-8 py-3 rounded hover:bg-inverse-primary transition-colors font-headline-sm text-headline-sm flex items-center justify-center"
              >
                Start Interrogation
              </Link>
              <button className="border border-white/20 text-on-background px-8 py-3 rounded hover:bg-surface-container-high transition-colors font-headline-sm text-headline-sm">
                View Demo
              </button>
            </div>
          </div>

          {/* Hero Interactive Element */}
          <div className="lg:w-1/2 relative w-full aspect-square max-w-[600px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,43,57,0.15)_0%,transparent_70%)] rounded-full blur-3xl"></div>
            
            <div className="glass-panel p-stack-lg rounded-xl absolute top-10 right-10 w-64 glow-hover transition-all duration-300 z-20 transform rotate-3">
              <div className="flex justify-between items-center mb-stack-md">
                <span className="font-label-mono text-label-mono text-secondary">
                  AAPL / LONG
                </span>
                <span className="bg-error-container/20 border border-error-container text-error-container px-2 py-1 rounded text-caption font-label-mono">
                  Flagged
                </span>
              </div>
              <div className="font-headline-md text-headline-md mb-unit">
                -14.2%
              </div>
              <div className="font-caption text-caption text-secondary">
                AI Verdict: Poor entry timing relative to macro indicators.
              </div>
            </div>

            <div className="glass-panel p-stack-lg rounded-xl absolute bottom-20 left-0 w-72 glow-hover transition-all duration-300 z-30 transform -rotate-2">
              <div className="flex justify-between items-center mb-stack-md">
                <span className="font-label-mono text-label-mono text-secondary">
                  NVDA / SHORT
                </span>
                <span className="bg-primary-container/20 border border-primary-container text-primary-container px-2 py-1 rounded text-caption font-label-mono">
                  Roast Complete
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-primary-container mb-unit">
                +8.5%
              </div>
              <div className="font-caption text-caption text-secondary">
                AI Verdict: Solid thesis execution, premature exit.
              </div>
            </div>

            {/* Abstract Data Vis Background */}
            <div className="absolute inset-0 z-10 opacity-30 flex items-center justify-center">
              <img
                alt="Abstract data visualization lines"
                className="w-full h-full object-cover rounded-full mix-blend-screen mask-image-[radial-gradient(ellipse_at_center,black,transparent)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrPxZQSGCl6Hinj4yCOVQ-UImI2EIZoNW2YnzffcxQF_wFwqLiQ05SikhpK2rz_vqdHi-Z5dD1l9RTP5UHduHCruvFF65xczkTtLTKxiR-Ieyhv-285IUaodRWNPsWeR9gXOwOpE-IUlizzQlK2eVHDeYnPMP0DFm6dcv8cKHQsuRoLlndG2zJ7TNOAdJr8Vn9Vyye4JoBKoH8n6OGDRyuRir1tfGpsWmrvnXFEPmjHS29b-XprCoYPQNVZntcbmBup5mJWTXNeOmF"
              />
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="mb-[120px]">
          <h2 className="font-headline-md text-headline-md mb-margin text-center">
            Architected for Alpha
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Large Feature */}
            <div className="md:col-span-2 glass-panel p-margin rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-700"></div>
              <span className="material-symbols-outlined text-4xl text-primary-container mb-stack-md relative z-10 block">
                psychology
              </span>
              <h3 className="font-headline-sm text-headline-sm mb-stack-sm relative z-10">
                Surgical Dissection
              </h3>
              <p className="font-body-md text-body-md text-secondary relative z-10 max-w-md">
                The Interrogator AI doesn't just show charts; it tears apart
                your trading logic, identifying cognitive biases and statistical
                anomalies with zero empathy.
              </p>
            </div>

            {/* Small Feature 1 */}
            <div className="glass-panel p-margin rounded-xl group hover:border-white/20 transition-colors">
              <span className="material-symbols-outlined text-4xl text-secondary mb-stack-md block">
                analytics
              </span>
              <h3 className="font-headline-sm text-headline-sm mb-stack-sm">
                Deep Forensics
              </h3>
              <p className="font-body-md text-body-md text-secondary">
                Post-trade analysis that digs into order flow dynamics and
                execution slippage.
              </p>
            </div>

            {/* Small Feature 2 */}
            <div className="glass-panel p-margin rounded-xl group hover:border-white/20 transition-colors">
              <span className="material-symbols-outlined text-4xl text-secondary mb-stack-md block">
                radar
              </span>
              <h3 className="font-headline-sm text-headline-sm mb-stack-sm">
                Live Monitoring
              </h3>
              <p className="font-body-md text-body-md text-secondary">
                Real-time alerts when your current portfolio begins to drift
                from historical norms.
              </p>
            </div>

            {/* Medium Feature */}
            <div className="md:col-span-2 glass-panel p-margin rounded-xl flex flex-col sm:flex-row sm:items-center justify-between group hover:border-white/20 transition-colors gap-6">
              <div>
                <span className="material-symbols-outlined text-4xl text-secondary mb-stack-md block">
                  terminal
                </span>
                <h3 className="font-headline-sm text-headline-sm mb-stack-sm">
                  Command Line Interface
                </h3>
                <p className="font-body-md text-body-md text-secondary max-w-sm">
                  For the purists. Interrogate your data using raw commands for
                  maximum speed and minimal UI overhead.
                </p>
              </div>
              <div className="hidden sm:block font-label-mono text-label-mono text-secondary bg-surface-container-highest p-stack-md rounded border border-white/5 whitespace-nowrap">
                &gt; roast analyze --ticker TSLA
                <br />
                &gt; compiling parameters...
                <br />
                &gt; warning: heavy bias detected
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
