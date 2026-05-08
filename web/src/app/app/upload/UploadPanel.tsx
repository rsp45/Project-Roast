"use client";

import { useRef, useState } from "react";
import { getBackendAccessToken } from "@/lib/backend";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

type StructuredError = {
  error_code?: string;
  message?: string;
  hint?: string;
  found_columns?: string[];
  missing_columns?: string[];
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

const ERROR_CODE_META: Record<string, { label: string; icon: string; color: string }> = {
  INVALID_FILE_TYPE: { label: "Wrong File Type", icon: "description_off", color: "text-yellow-400 border-yellow-900/40 bg-yellow-900/10" },
  EMPTY_FILE:        { label: "Empty File",       icon: "file_copy_off",   color: "text-yellow-400 border-yellow-900/40 bg-yellow-900/10" },
  MISSING_COLUMNS:   { label: "Column Mismatch",  icon: "table_view",      color: "text-orange-400 border-orange-900/40 bg-orange-900/10" },
  NO_VALID_TRADES:   { label: "No Valid Data",    icon: "block",           color: "text-red-400 border-red-900/40 bg-red-900/10"    },
  AUTH_ERROR:        { label: "Auth Error",        icon: "lock",            color: "text-red-400 border-red-900/40 bg-red-900/10"    },
  NETWORK_ERROR:     { label: "Network Error",     icon: "cloud_off",       color: "text-red-400 border-red-900/40 bg-red-900/10"    },
};

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [structuredError, setStructuredError] = useState<StructuredError | null>(null);
  const [rawErrorMsg, setRawErrorMsg] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ trades?: number; symbols?: number } | null>(null);

  const handleUpload = async (selectedFile: File) => {
    try {
      setStatus("uploading");
      setStructuredError(null);
      setRawErrorMsg(null);

      const token = await getBackendAccessToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");

      const form = new FormData();
      form.append("file", selectedFile);
      form.append("timezone", "UTC");
      form.append("currency", "USD");

      const res = await fetch(`${baseUrl}/v1/trade-imports`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        let detail: unknown;
        try { detail = await res.json(); } catch { detail = null; }

        // FastAPI wraps our dict in { detail: {...} }
        const detailObj = (detail as { detail?: unknown })?.detail ?? detail;

        if (detailObj && typeof detailObj === "object") {
          setStructuredError(detailObj as StructuredError);
        } else {
          setStructuredError({ error_code: "NETWORK_ERROR", message: `HTTP ${res.status}: ${String(detailObj ?? "Import failed")}` });
        }
        setStatus("error");
        return;
      }

      const data = (await res.json()) as { importId: string; status: string };
      setImportId(data.importId);

      const statusRes = await fetch(`${baseUrl}/v1/trade-imports/${data.importId}`, {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const statusData = (await statusRes.json()) as { summary?: { trades?: number; symbols?: number } };
      setSummary(statusData.summary ?? null);
      setStatus("success");
      await queryClient.invalidateQueries({ queryKey: ["trades"] });
      await queryClient.invalidateQueries({ queryKey: ["metrics", "portfolio"] });
    } catch (e) {
      setStatus("error");
      setStructuredError({
        error_code: "NETWORK_ERROR",
        message: e instanceof Error ? e.message : "Import failed",
        hint: "Check your internet connection and try again.",
      });
    }
  };

  const errorMeta = structuredError?.error_code
    ? (ERROR_CODE_META[structuredError.error_code] ?? ERROR_CODE_META.NETWORK_ERROR)
    : ERROR_CODE_META.NETWORK_ERROR;

  return (
    <div className="flex flex-col gap-stack-lg w-full">
      {/* Upload Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-primary-container/50 transition-colors duration-300 cursor-pointer relative group overflow-hidden"
      >
        {/* Ambient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-stack-md group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10">
          <span className="material-symbols-outlined text-4xl text-secondary group-hover:text-primary transition-colors">
            cloud_upload
          </span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm relative z-10">
          {file ? file.name : "Drop CSV or Broker Logs Here"}
        </h3>
        <p className="font-body-md text-body-md text-secondary mb-stack-lg relative z-10">
          {file
            ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
            : "Supported: .csv (Max 50MB) — OHLCV & broker trade journals"}
        </p>

        {status === "idle" && (
          <button
            type="button"
            className="bg-primary-container text-white px-8 py-3 rounded font-label-mono text-label-mono hover:bg-primary-container/90 transition-colors shadow-[0_4px_14px_rgba(197,43,57,0.39)] relative z-10"
            onClick={(e) => {
              if (file) {
                e.stopPropagation();
                handleUpload(file);
              }
            }}
          >
            {file ? "START INTERROGATION" : "BROWSE FILES"}
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
          setStatus("idle");
          setStructuredError(null);
          setRawErrorMsg(null);
          setImportId(null);
          setSummary(null);
        }}
      />

      {/* Uploading State */}
      {status === "uploading" && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="scanning-line animate-[scan_2s_ease-in-out_infinite]" />
          <div className="flex justify-between items-center mb-stack-sm relative z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary animate-pulse">radar</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Dissecting Trade Data...</h4>
            </div>
            <span className="font-label-mono text-label-mono text-primary animate-pulse">Processing</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-stack-sm relative z-20">
            <div className="h-full bg-primary-container rounded-full w-full relative animate-pulse">
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-white/30 blur-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Success Panel */}
      {status === "success" && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-emerald-900/30 bg-emerald-900/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-stack-sm relative z-20">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="material-symbols-outlined">check_circle</span>
              <h4 className="font-headline-sm text-headline-sm">Ingestion Complete</h4>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-stack-md relative z-20">
            <div className="bg-surface-container-low p-stack-sm rounded border border-white/5 flex flex-col gap-1">
              <span className="font-label-mono text-caption text-secondary uppercase tracking-wider">Trades Parsed</span>
              <span className="font-label-mono text-body-md text-on-surface">{summary?.trades ?? "—"}</span>
            </div>
            <div className="bg-surface-container-low p-stack-sm rounded border border-white/5 flex flex-col gap-1">
              <span className="font-label-mono text-caption text-secondary uppercase tracking-wider">Symbols Found</span>
              <span className="font-label-mono text-body-md text-emerald-400 font-bold">{summary?.symbols ?? "—"}</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-secondary font-mono">ID: {importId}</div>
          <div className="mt-3 flex gap-3 relative z-20">
            <Link href="/app/portfolio" className="px-4 py-2 bg-emerald-900/30 border border-emerald-900/40 text-emerald-400 rounded font-label-mono text-sm hover:bg-emerald-900/50 transition-colors">
              View Dashboard →
            </Link>
            <Link href="/app/trades" className="px-4 py-2 border border-white/10 text-secondary rounded font-label-mono text-sm hover:border-white/20 hover:text-on-surface transition-colors">
              View Trades
            </Link>
          </div>
        </div>
      )}

      {/* Rich Error Panel */}
      {status === "error" && structuredError && (
        <div className={`glass-panel rounded-xl p-stack-lg flex flex-col gap-4 relative overflow-hidden border shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${errorMeta.color}`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">{errorMeta.icon}</span>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{errorMeta.label}</h4>
                <span className="font-label-mono text-[10px] uppercase tracking-widest opacity-60">
                  {structuredError.error_code ?? "ERROR"}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setStatus("idle"); setStructuredError(null); }}
              className="text-secondary hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Message */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
            <p className="text-on-surface font-body-md text-sm leading-relaxed">
              {structuredError.message ?? "An unexpected error occurred."}
            </p>
          </div>

          {/* Hint */}
          {structuredError.hint && (
            <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3 border border-white/5">
              <span className="material-symbols-outlined text-base text-yellow-400 mt-0.5 shrink-0">lightbulb</span>
              <p className="text-secondary font-body-md text-sm leading-relaxed">{structuredError.hint}</p>
            </div>
          )}

          {/* Column Diff — shown for MISSING_COLUMNS */}
          {structuredError.error_code === "MISSING_COLUMNS" && (
            <div className="mt-2">
              <p className="font-label-mono text-[11px] uppercase tracking-widest text-secondary mb-2">Column Analysis</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-label-mono text-secondary mb-1.5">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(structuredError.missing_columns ?? []).map((col) => (
                      <span key={col} className="px-2 py-0.5 bg-red-900/30 border border-red-900/40 text-red-400 rounded font-mono text-[11px]">
                        ✕ {col}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-label-mono text-secondary mb-1.5">Found in your CSV</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {(structuredError.found_columns ?? []).map((col) => (
                      <span key={col} className="px-2 py-0.5 bg-white/5 border border-white/10 text-secondary rounded font-mono text-[11px]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href="/app/settings"
                className="mt-3 inline-flex items-center gap-1.5 text-primary font-label-mono text-xs hover:underline"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Configure CSV column mapping →
              </Link>
            </div>
          )}

          {rawErrorMsg && (
            <details className="mt-1">
              <summary className="text-secondary font-label-mono text-xs cursor-pointer hover:text-on-surface">Raw error</summary>
              <pre className="mt-2 text-xs text-secondary bg-black/30 p-3 rounded overflow-x-auto">{rawErrorMsg}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
