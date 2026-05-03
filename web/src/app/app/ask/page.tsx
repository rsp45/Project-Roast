import { AskPanel } from "./AskPanel";

export default function AskPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Ask AI
        </div>
        <div className="mt-1 text-sm text-muted">
          Natural-language queries with evidence you can trace to rows.
        </div>
      </div>
      <AskPanel />
    </div>
  );
}
