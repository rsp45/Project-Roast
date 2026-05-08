import { CSVMappingUI } from "./CSVMappingUI";

export default function SettingsPage() {
  return (
    <div className="flex flex-col w-full gap-stack-lg">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-secondary font-body-md">
          Workspace preferences and data conventions.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        <div className="glass-panel rounded-xl p-stack-md relative overflow-hidden border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="font-headline-sm text-[18px] text-on-surface mb-1">Workspace</div>
          <div className="text-[14px] text-secondary font-body-md mb-stack-md">
            Timezone, base currency, and retention policy.
          </div>
          <div className="space-y-3">
            <div className="bg-surface-container-low/50 border border-white/5 rounded p-4">
              <div className="font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase mb-1">
                Timezone
              </div>
              <div className="font-label-mono text-[14px] text-on-surface">UTC</div>
            </div>
            <div className="bg-surface-container-low/50 border border-white/5 rounded p-4">
              <div className="font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase mb-1">
                Base currency
              </div>
              <div className="font-label-mono text-[14px] text-on-surface">USD</div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-stack-md relative overflow-hidden border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col h-[500px]">
          <CSVMappingUI />
        </div>
      </section>
    </div>
  );
}
