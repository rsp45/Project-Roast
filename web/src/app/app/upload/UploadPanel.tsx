"use client";

import { useRef, useState } from "react";
import { getBackendAccessToken } from "@/lib/backend";
import { useQueryClient } from "@tanstack/react-query";

type Preview = {
  headers: string[];
  suggestedMapping: Record<string, string | null>;
  requiredMissing: string[];
  sampleRows: Array<Record<string, string>>;
  notes: string[];
};

const requiredKeys = ["symbol", "side", "qty", "price"] as const;
const optionalKeys = ["pnl", "fees", "strategy_tag"] as const;
const mappingRows = [
  { key: "symbol", label: "Symbol", required: true },
  { key: "side", label: "Side", required: true },
  { key: "qty", label: "Quantity", required: true },
  { key: "price", label: "Price", required: true },
  { key: "executed_at", label: "Date/Time", required: false },
  { key: "pnl", label: "PnL", required: false },
  { key: "fees", label: "Fees", required: false },
  { key: "strategy_tag", label: "Strategy Tag", required: false },
] as const;

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<
    "idle" | "analyzing" | "mapping" | "importing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [summary, setSummary] = useState<
    { trades?: number; symbols?: number } | null
  >(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const analyze = async (selectedFile: File) => {
    try {
      setStage("analyzing");
      setMessage(null);
      setPreview(null);
      setMapping({});
      setImportId(null);
      setSummary(null);

      if (!baseUrl) {
        throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
      }

      const token = await getBackendAccessToken();
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await fetch(`${baseUrl}/v1/trade-imports/preview`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Preview failed (${res.status})${detail ? `: ${detail}` : ""}`);
      }

      const data = (await res.json()) as Preview;
      setPreview(data);
      const next: Record<string, string> = {};
      for (const row of mappingRows) {
        const suggested = data.suggestedMapping[row.key] ?? "";
        next[row.key] = suggested || "";
      }
      setMapping(next);
      setStage("mapping");
    } catch (e) {
      setStage("error");
      setMessage(e instanceof Error ? e.message : "Preview failed");
    }
  };

  const handleUpload = async (selectedFile: File) => {
    try {
      setStage("importing");
      setMessage(null);
      const token = await getBackendAccessToken();
      if (!baseUrl) {
        throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
      }

      const form = new FormData();
      form.append("file", selectedFile);
      form.append("timezone", "UTC");
      form.append("currency", "USD");
      const mappingOverride: Record<string, string> = {};
      for (const key of [...requiredKeys, ...optionalKeys, "executed_at"] as const) {
        const v = mapping[key];
        if (v) mappingOverride[key] = v;
      }
      if (Object.keys(mappingOverride).length) {
        form.append("mapping", JSON.stringify(mappingOverride));
      }

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
      setStage("success");
      await queryClient.invalidateQueries({ queryKey: ["trades"] });
      await queryClient.invalidateQueries({
        queryKey: ["metrics", "portfolio"],
      });
    } catch (e) {
      setStage("error");
      setMessage(e instanceof Error ? e.message : "Import failed");
    }
  };

  const timestampRequired = preview?.requiredMissing?.includes("date") ?? false;
  const missingRequired = [
    ...requiredKeys.filter((k) => !mapping[k]),
    ...(timestampRequired && !mapping.executed_at ? ["executed_at"] : []),
  ];
  const canImport = !!file && stage === "mapping" && missingRequired.length === 0;

  return (
    <div className="flex flex-col gap-stack-lg w-full">
      <div 
        onClick={() => inputRef.current?.click()}
        className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-primary-container/50 transition-colors duration-300 cursor-pointer relative group overflow-hidden"
      >
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-stack-md group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <span className="material-symbols-outlined text-4xl text-secondary group-hover:text-primary transition-colors">cloud_upload</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">
          {file ? file.name : "Drop CSV or Broker Logs Here"}
        </h3>
        <p className="font-body-md text-body-md text-secondary mb-stack-lg">
          {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supported formats: .csv, .xlsx, .json (Max 50MB)"}
        </p>
        
        {stage === "idle" && (
          <button 
            type="button"
            className="bg-primary-container text-white px-8 py-3 rounded font-label-mono text-label-mono hover:bg-primary-container/90 transition-colors shadow-[0_4px_14px_rgba(197,43,57,0.39)]"
            onClick={(e) => {
              if (file) {
                e.stopPropagation();
                analyze(file);
              }
            }}
          >
            {file ? "ANALYZE CSV" : "BROWSE FILES"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          setFile(next);
          setStage("idle");
          setMessage(null);
          setPreview(null);
          setMapping({});
          setImportId(null);
          setSummary(null);
        }}
      />

      {stage === "analyzing" || stage === "importing" ? (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="scanning-line animate-[scan_2s_ease-in-out_infinite]"></div>
          <div className="flex justify-between items-center mb-stack-sm relative z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary animate-pulse">radar</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">
                {stage === "analyzing" ? "Analyzing columns..." : "Importing trades..."}
              </h4>
            </div>
            <span className="font-label-mono text-label-mono text-primary animate-pulse">Processing</span>
          </div>
          
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-stack-sm relative z-20">
            <div className="h-full bg-primary-container rounded-full w-full relative animate-pulse">
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-white/30 blur-sm"></div>
            </div>
          </div>
        </div>
      ) : null}

      {stage === "mapping" && preview ? (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-baseline justify-between gap-4">
            <div className="font-headline-sm text-headline-sm text-on-surface">Column Mapping</div>
            <div className="font-label-mono text-caption text-secondary">
              {missingRequired.length ? `${missingRequired.length} required missing` : "Ready"}
            </div>
          </div>

          {preview.notes?.length ? (
            <div className="rounded border border-white/10 bg-surface-container-low/50 p-4 text-sm text-secondary">
              {preview.notes.join(" · ")}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {mappingRows.map((row) => {
              const isRequired =
                row.required || (row.key === "executed_at" && timestampRequired);
              return (
                <div
                  key={row.key}
                  className="bg-surface-container-low/50 border border-white/5 rounded p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase">
                      {row.label}
                      {isRequired ? " *" : ""}
                    </div>
                    <div className="font-label-mono text-[11px] text-secondary">
                      {mapping[row.key] ? "Mapped" : "—"}
                    </div>
                  </div>
                  <select
                    value={mapping[row.key] ?? ""}
                    onChange={(e) =>
                      setMapping((prev) => ({
                        ...prev,
                        [row.key]: e.target.value,
                      }))
                    }
                    className="h-10 rounded bg-surface border border-white/10 px-3 text-sm text-on-surface focus:outline-none"
                  >
                    <option value="">Unmapped</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {preview.sampleRows?.length ? (
            <div className="overflow-hidden rounded border border-white/10">
              <div className="bg-surface-container-low/50 px-4 py-3 font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase">
                Sample Rows
              </div>
              <div className="max-h-[240px] overflow-auto bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface-container-low/70 backdrop-blur">
                    <tr className="text-[11px] font-semibold tracking-wide text-secondary">
                      {preview.headers.slice(0, 8).map((h) => (
                        <th key={h} className="px-3 py-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleRows.slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="border-t border-white/5">
                        {preview.headers.slice(0, 8).map((h) => (
                          <td key={h} className="px-3 py-2 font-mono text-xs text-secondary">
                            {(r[h] ?? "").toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <button
              type="button"
              onClick={() => {
                setStage("idle");
                setPreview(null);
                setMapping({});
                setMessage(null);
              }}
              className="h-11 rounded border border-white/10 bg-surface px-4 text-sm font-semibold text-secondary hover:border-white/20"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canImport}
              onClick={() => {
                if (file) handleUpload(file);
              }}
              className="h-11 rounded bg-primary-container px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              Import trades
            </button>
          </div>
        </div>
      ) : null}

      {stage === "success" && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-emerald-900/30 bg-emerald-900/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-stack-sm relative z-20">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="material-symbols-outlined">check_circle</span>
              <h4 className="font-headline-sm text-headline-sm">Ingestion Complete</h4>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-stack-md relative z-20">
            <div className="bg-surface-container-low p-stack-sm rounded border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
              <span className="font-label-mono text-caption text-secondary uppercase tracking-wider">Trades Parsed</span>
              <span className="font-label-mono text-body-md text-on-surface">{summary?.trades ?? "—"}</span>
            </div>
            <div className="bg-surface-container-low p-stack-sm rounded border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
              <span className="font-label-mono text-caption text-secondary uppercase tracking-wider">Symbols Found</span>
              <span className="font-label-mono text-body-md text-emerald-400 font-bold">{summary?.symbols ?? "—"}</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-secondary font-mono">ID: {importId}</div>
        </div>
      )}

      {stage === "error" && message && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-error/30 bg-error/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 text-error mb-stack-sm relative z-20">
            <span className="material-symbols-outlined">error</span>
            <h4 className="font-headline-sm text-headline-sm">Critical Failure</h4>
          </div>
          <div className="text-on-surface-variant font-body-md bg-surface-container-low p-4 rounded border border-white/5">
            {message}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setStage("idle");
                setMessage(null);
              }}
              className="h-11 rounded bg-surface px-4 text-sm font-semibold text-secondary border border-white/10 hover:border-white/20"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
