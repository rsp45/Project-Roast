import { AskPanel } from "./AskPanel";

export default function AskPage() {
  return (
    <div className="flex flex-col w-full gap-stack-lg">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
          Ask AI
        </h1>
        <p className="text-secondary font-body-md">
          Natural-language queries with evidence you can trace to rows.
        </p>
      </div>
      <AskPanel />
    </div>
  );
}
