"use client";

import { useState } from "react";
import { Plus, Trash2, Save, ArrowRight } from "lucide-react";

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

export function CSVMappingUI() {
  const [mappings, setMappings] = useState<MappingItem[]>(defaultMapping);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateMapping = (index: number, newHeader: string) => {
    const updated = [...mappings];
    updated[index].csvHeader = newHeader;
    setMappings(updated);
  };

  const handleSave = () => {
    // In the future: save mapping to the backend
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-headline-sm text-[18px] text-on-surface mb-1">CSV Templates</div>
          <div className="text-[14px] text-secondary font-body-md">
            Map your broker's CSV headers to the system schema.
          </div>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 border border-white/10 rounded-lg text-sm font-label-mono text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Edit Mapping
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-sm font-label-mono hover:bg-primary-container/90 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        )}
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
              <div className="col-span-5 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${["symbol", "side", "qty", "price", "executed_at"].includes(mapping.systemField) ? "bg-primary-container" : "bg-white/20"}`}></div>
                <span className="font-label-mono text-[13px] text-on-surface">{mapping.systemField}</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <ArrowRight className="h-4 w-4 text-secondary/50 group-hover:text-primary-container/70 transition-colors" />
              </div>
              <div className="col-span-5">
                {isEditing ? (
                  <input
                    type="text"
                    value={mapping.csvHeader}
                    onChange={(e) => handleUpdateMapping(idx, e.target.value)}
                    className="w-full bg-[#000000] border border-white/10 rounded-md py-1.5 px-3 text-on-surface font-label-mono text-[13px] focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-secondary/30"
                    placeholder="Enter CSV header..."
                  />
                ) : (
                  <div className="font-label-mono text-[13px] text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded inline-block w-full truncate">
                    {mapping.csvHeader || <span className="text-secondary italic">Unmapped</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-secondary font-body-md text-sm">
            <div className="w-2 h-2 rounded-full bg-primary-container"></div>
            Required fields for successful import.
          </div>
        )}
      </div>
    </div>
  );
}
