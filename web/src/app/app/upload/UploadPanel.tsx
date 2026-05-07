"use client";

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

  const handleUpload = async (selectedFile: File) => {
    try {
      setStatus("uploading");
      setMessage(null);
      const token = await getBackendAccessToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
      }

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
  };

  return (
    <div className="flex flex-col gap-stack-lg w-full">
      {/* Upload Area */}
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
        
        {status === "idle" && (
          <button 
            type="button"
            className="bg-primary-container text-white px-8 py-3 rounded font-label-mono text-label-mono hover:bg-primary-container/90 transition-colors shadow-[0_4px_14px_rgba(197,43,57,0.39)]"
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
          setFileName(next?.name ?? null);
          setStatus("idle");
          setMessage(null);
          setImportId(null);
          setSummary(null);
        }}
      />

      {/* Active Analysis Panel (Simulated State) */}
      {status === "uploading" && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Scanning Effect Line */}
          <div className="scanning-line animate-[scan_2s_ease-in-out_infinite]"></div>
          <div className="flex justify-between items-center mb-stack-sm relative z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary animate-pulse">radar</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Dissecting Trade Data...</h4>
            </div>
            <span className="font-label-mono text-label-mono text-primary animate-pulse">Processing</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-stack-sm relative z-20">
            <div className="h-full bg-primary-container rounded-full w-full relative animate-pulse">
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-white/30 blur-sm"></div>
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

      {/* Error Panel */}
      {status === "error" && message && (
        <div className="glass-panel rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden border border-error/30 bg-error/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 text-error mb-stack-sm relative z-20">
            <span className="material-symbols-outlined">error</span>
            <h4 className="font-headline-sm text-headline-sm">Critical Failure</h4>
          </div>
          <div className="text-on-surface-variant font-body-md bg-surface-container-low p-4 rounded border border-white/5">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
