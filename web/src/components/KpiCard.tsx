import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="rounded-2xl bg-panel p-4 text-panel-ink ring-1 ring-border">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold tracking-wide text-muted">
          {label}
        </div>
        {hint ? <div className="text-[11px] text-muted">{hint}</div> : null}
      </div>
      <div
        className={cn(
          "mt-3 font-mono text-2xl font-semibold tracking-tight",
          tone === "positive" ? "text-emerald-700" : "",
          tone === "negative" ? "text-rose-700" : "",
        )}
      >
        {value}
      </div>
    </div>
  );
}
