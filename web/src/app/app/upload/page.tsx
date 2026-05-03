import { UploadPanel } from "./UploadPanel";

export default function UploadPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div className="font-[var(--font-display)] text-3xl tracking-tight">
          Upload
        </div>
        <div className="mt-1 text-sm text-muted">
          Start with CSV. Everything else becomes queryable after ingestion.
        </div>
      </div>
      <UploadPanel />
    </div>
  );
}
