"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkspaceChips({
  workspaces,
  value,
  onChange,
}: {
  workspaces: Workspace[];
  value: string | "all";
  onChange: (id: string | "all") => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const options = [{ id: "all" as const, label: "전체" }, ...workspaces.map((w) => ({ id: w.id, label: w.name }))];
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="워크스페이스 선택"
        className="inline-flex max-w-full items-center gap-1 rounded-full border border-ink bg-snow px-3.5 py-1.5 text-[13px] font-medium tracking-tight text-ink"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.2}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 z-40 min-w-[220px] rounded-2xl border border-mist bg-snow p-2 shadow-float"
        >
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px]",
                  selected ? "bg-mist" : "hover:bg-paper",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected && <Check size={14} className="shrink-0" strokeWidth={2.2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
