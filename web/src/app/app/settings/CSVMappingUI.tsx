// POST /v1/workspace/csv-mapping  (saves to backend if/when that endpoint exists)
// For now we use localStorage as a real persistence layer until the backend endpoint is built.
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, ArrowRight, CheckCircle } from "lucide-react";

type MappingItem = {
  systemField: string;
  csvHeader: string;
};

const defaultMapping: MappingItem[] = [
  { systemField: "symbol", csvHeader: "Ticker" },
  { systemField: "side", csvHeader: "Action" },
  { systemField: "qty", csvHeader: "Quantity" },
  { systemField: "price", csvHeader: "Avg Price" },
  { systemField: "executed_at", csvHeader: "Date/Time" },
  { systemField: "fees", csvHeader: "Comm/Fee" },
  { systemField: "pnl", csvHeader: "Realized P/L" },
];

const STORAGE_KEY = "project-roast:csv-mapping";

function loadSaved(): MappingItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MappingItem[];
  } catch {
    return null;
  }
}

export function CSVMappingUI() {
  const [mappings, setMappings] = useState<MappingItem[]>(defaultMapping);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hydrate from localStorage on client
  useEffect(() => {
    const persisted = loadSaved();
    if (persisted) setMappings(persisted);
  }, []);

  const handleUpdateMapping = (index: number, newHeader: string) => {
    const updated = [...mappings];
    updated[index].csvHeader = newHeader;
    setMappings(updated);
  };

  const handleAddRow = () => {
    setMappings((prev) => [...prev, { systemField: "", csvHeader: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, field: "systemField" | "csvHeader", value: string) => {
    const updated = [...mappings];
    updated[index][field] = value;
    setMappings(updated);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setMappings(defaultMapping);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-headline-sm text-[18px] text-on-surface mb-1">CSV Templates</div>
          <div className="text-[14px] text-secondary font-body-md">
            Map your broker&apos;s CSV headers to the system schema.
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {saved && (
            <span className="flex items-center gap-1 text-[#4ade80] font-label-mono text-[12px]">
              <CheckCircle className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 border border-white/10 rounded-lg text-sm font-label-mono text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Edit Mapping
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 border border-white/10 rounded-lg text-sm font-label-mono text-secondary hover:text-on-surface hover:border-white/30 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-sm font-label-mono hover:bg-primary-container/90 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-surface-container-low/50 border border-white/5 rounded-xl p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-12 gap-4 mb-3 px-2">
          <div className="col-span-5 font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase">System Field</div>
          <div className="col-span-2 flex justify-center text-secondary/50"></div>
          <div className="col-span-5 font-label-mono text-[11px] font-semibold tracking-wide text-secondary uppercase">CSV Header</div>
        </div>

        <div className="space-y-2">
          {mappings.map((mapping, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-surface-container-lowest border border-white/5 p-3 rounded-lg group">
              <div className="col-span-5">
                {isEditing ? (
                  <input
                    type="text"
                    value={mapping.systemField}
                    onChange={(e) => handleUpdateField(idx, "systemField", e.target.value)}
                    className="w-full bg-[#000000] border border-white/10 rounded-md py-1.5 px-3 text-on-surface font-label-mono text-[13px] focus:outline-none focus:border-primary-container transition-colors"
                    placeholder="system_field"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${["symbol", "side", "qty", "price", "executed_at"].includes(mapping.systemField) ? "bg-primary-container" : "bg-white/20"}`} />
                    <span className="font-label-mono text-[13px] text-on-surface">{mapping.systemField}</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-center">
                <ArrowRight className="h-4 w-4 text-secondary/50 group-hover:text-primary-container/70 transition-colors" />
              </div>
              <div className="col-span-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={mapping.csvHeader}
                    onChange={(e) => handleUpdateField(idx, "csvHeader", e.target.value)}
                    className="w-full bg-[#000000] border border-white/10 rounded-md py-1.5 px-3 text-on-surface font-label-mono text-[13px] focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-secondary/30"
                    placeholder="Enter CSV header..."
                  />
                ) : (
                  <div className="font-label-mono text-[13px] text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded inline-block w-full truncate">
                    {mapping.csvHeader || <span className="text-secondary italic">Unmapped</span>}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemoveRow(idx)}
                    className="text-secondary/40 hover:text-primary transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <button
            onClick={handleAddRow}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-lg py-2 text-secondary hover:text-on-surface hover:border-white/25 transition-colors font-label-mono text-sm"
          >
            <Plus className="h-4 w-4" /> Add Row
          </button>
        )}

        {isEditing && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-secondary font-body-md text-sm">
            <div className="w-2 h-2 rounded-full bg-primary-container" />
            Required fields for successful import: symbol, side, qty, price, executed_at.
          </div>
        )}
      </div>
    </div>
  );
}
