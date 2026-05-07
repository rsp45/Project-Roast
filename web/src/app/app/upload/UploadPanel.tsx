"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { getBackendAccessToken } from "@/lib/backend";
import { useQueryClient } from "@tanstack/react-query";

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [summary, setSummary] = useState<
    { trades?: number; symbols?: number } | null
  >(null);

  return (
    <div className="rounded-2xl bg-panel p-6 text-panel-ink ring-1 ring-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">CSV Import</div>
          <div className="mt-1 text-sm text-muted">
            Upload a broker export. Map columns. Validate. Import.
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-panel-ink px-4 text-xs font-semibold text-panel transition-colors hover:bg-panel-ink/90"
        >
          <UploadCloud className="h-4 w-4" />
          Select CSV
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          setFile(next);
          setFileName(next?.name ?? null);
          setStatus("idle");
          setMessage(null);
          setImportId(null);
          setSummary(null);
        }}
      />

      <div className="mt-6 rounded-xl bg-panel/60 p-4 ring-1 ring-border">
        <div className="text-[11px] font-semibold tracking-wide text-muted">
          Selected File
        </div>
        <div className="mt-2 font-mono text-sm">
          {fileName ?? "No file selected"}
        </div>
      </div>

      <button
        type="button"
        disabled={!file || status === "uploading"}
        onClick={async () => {
          if (!file) return;
          try {
            setStatus("uploading");
            setMessage(null);
            const token = await getBackendAccessToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (!baseUrl) {
              throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
            }

            const form = new FormData();
            form.append("file", file);
            form.append("timezone", "UTC");
            form.append("currency", "USD");

            const res = await fetch(`${baseUrl}/v1/trade-imports`, {
              method: "POST",
              headers: { authorization: `Bearer ${token}` },
              body: form,
            });

            if (!res.ok) {
              throw new Error(`Import failed (${res.status})`);
            }

            const data = (await res.json()) as {
              importId: string;
              status: string;
            };

            setImportId(data.importId);

            const statusRes = await fetch(
              `${baseUrl}/v1/trade-imports/${data.importId}`,
              {
                headers: { authorization: `Bearer ${token}` },
                cache: "no-store",
              },
            );

            const statusData = (await statusRes.json()) as {
              summary?: { trades?: number; symbols?: number };
            };
            setSummary(statusData.summary ?? null);
            setStatus("success");
            await queryClient.invalidateQueries({ queryKey: ["trades"] });
            await queryClient.invalidateQueries({
              queryKey: ["metrics", "portfolio"],
            });
          } catch (e) {
            setStatus("error");
            setMessage(e instanceof Error ? e.message : "Import failed");
          }
        }}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-white transition-colors disabled:bg-accent/40 disabled:text-white/90 hover:bg-accent/90"
      >
        {status === "uploading" ? "Importing..." : "Import trades"}
      </button>

      {status === "success" ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-200">
          <div className="text-xs font-semibold tracking-wide">Imported</div>
          <div className="mt-2 font-mono text-xs">{importId}</div>
          {summary ? (
            <div className="mt-3 text-sm">
              Trades: {summary.trades ?? "—"} · Symbols: {summary.symbols ?? "—"}
            </div>
          ) : null}
        </div>
      ) : null}

      {status === "error" && message ? (
        <div className="mt-4 rounded-xl bg-rose-50 p-4 text-rose-900 ring-1 ring-rose-200">
          <div className="text-xs font-semibold tracking-wide">Import failed</div>
          <div className="mt-2 text-sm">{message}</div>
        </div>
      ) : null}
    </div>
  );
}
