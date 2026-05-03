export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Settings
        </div>
        <div className="mt-1 text-sm text-muted">
          Workspace preferences and data conventions.
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-panel p-6 text-panel-ink ring-1 ring-border">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-2 text-sm text-muted">
            Timezone, base currency, and retention policy.
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
              <div className="text-[11px] font-semibold tracking-wide text-muted">
                Timezone
              </div>
              <div className="mt-2 font-mono text-sm">UTC</div>
            </div>
            <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-border">
              <div className="text-[11px] font-semibold tracking-wide text-muted">
                Base currency
              </div>
              <div className="mt-2 font-mono text-sm">USD</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-panel p-6 text-panel-ink ring-1 ring-border">
          <div className="text-sm font-semibold">CSV Templates</div>
          <div className="mt-2 text-sm text-muted">
            Define column mappings once, reuse across imports.
          </div>
          <div className="mt-5 rounded-xl bg-panel/60 p-4 ring-1 ring-border">
            <div className="text-[11px] font-semibold tracking-wide text-muted">
              Coming next
            </div>
            <div className="mt-2 text-sm">
              Upload a sample CSV and save a mapping preset.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
