import { TradesTable } from "./TradesTable";

export default function TradesPage() {
  return (
    <div className="flex flex-col w-full gap-stack-lg">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
          Interrogation Queue
        </h1>
        <p className="text-secondary font-body-md">
          Filter, group, and drill down into the raw events behind the curve.
        </p>
      </div>

      <TradesTable />
    </div>
  );
}
