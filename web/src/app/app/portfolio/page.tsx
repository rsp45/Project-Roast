import { Suspense } from "react";
import { PortfolioDashboard } from "./PortfolioDashboard";

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

      <Suspense
        fallback={
          <div className="text-secondary font-label-mono text-sm animate-pulse">
            Loading dashboard...
          </div>
        }
      >
        <PortfolioDashboard />
      </Suspense>
    </>
  );
}
