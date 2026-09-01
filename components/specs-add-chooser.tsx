"use client";

import { useEffect, useRef, useState } from "react";
import { FolderDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpecsAddChooser({
  onAdd,
  onImport,
  label = "+ 추가",
  className,
}: {
  onAdd: () => void;
  onImport: () => void;
  label?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={className ?? "rounded-full border border-mist px-3 py-1.5 text-[12px]"}
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+6px)] right-0 z-30 w-[156px] overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onImport();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-ink hover:bg-paper",
            )}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <FolderDown size={13} />
            </span>
            가져오기
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAdd();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-ink hover:bg-paper"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <Plus size={13} />
            </span>
            추가
          </button>
        </div>
      )}
    </div>
  );
}
