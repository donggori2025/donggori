"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
  badge?: string;
};

export function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value) ?? options[0];
  const active = open || value !== "all";
  const showValue = open || value !== "all";

  useEffect(() => {
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
  }, []);

  return (
    <div ref={root} className={cn("relative shrink-0", open && "z-50")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border bg-snow px-3.5 text-[13px] tracking-tight",
          active ? "border-ink text-ink" : "border-fog text-ink",
        )}
      >
        <span className="font-semibold">{label}</span>
        {showValue && selected && (
          <span className="font-normal text-stone">{selected.label}</span>
        )}
        {open ? (
          <ChevronUp size={14} className="shrink-0" strokeWidth={2} />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-stone" strokeWidth={2} />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-50 min-w-[240px] overflow-hidden rounded-[20px] border border-mist bg-snow py-2 shadow-float"
        >
          {options.map((opt) => {
            const on = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-ink hover:bg-paper"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                    on ? "border-ink" : "border-[#d0d0d0]",
                  )}
                >
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                </span>
                <span className="min-w-0 flex-1">{opt.label}</span>
                {opt.badge && (
                  <span className="rounded-[3px] bg-ink px-1 py-px text-[9px] font-semibold tracking-wide text-snow">
                    {opt.badge}
                  </span>
                )}
                {opt.count != null && (
                  <span className="tabular-nums text-[12px] text-stone">{opt.count.toLocaleString()}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
