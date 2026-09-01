"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  jumpSectionOf,
  productCompleteness,
  STAGE_META,
  type CompletenessStage,
} from "@/lib/product-readiness";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CompletenessBadge({
  stage,
  size = "sm",
}: {
  stage: CompletenessStage;
  size?: "sm" | "md";
}) {
  const meta = STAGE_META[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-tight",
        meta.tone,
        meta.ink,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
    >
      {meta.label}
    </span>
  );
}

export function CompletenessBar({
  percent,
  compact,
}: {
  percent: number;
  compact?: boolean;
}) {
  return (
    <div className={cn("min-w-0", compact ? "w-[88px]" : "w-[140px]")}>
      {!compact && (
        <p className="mb-1 text-[10px] tracking-tight text-stone">제품 완성도 {percent}%</p>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
      </div>
      {compact && <p className="mt-0.5 text-[10px] text-stone">{percent}%</p>}
    </div>
  );
}

export function CompletenessMenu({
  product,
  onJump,
}: {
  product: Product;
  onJump?: (section: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const readiness = productCompleteness(product);
  const incomplete = readiness.areas.filter((a) => a.percent < 100);
  const complete = readiness.areas.filter((a) => a.percent >= 100);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
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
    <div className="pointer-events-auto relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-mist bg-snow px-3 text-[12px] shadow-sm hover:bg-paper"
      >
        {readiness.percent}%
        <ChevronDown size={12} className={cn("text-stone transition", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-30 w-[240px] overflow-hidden rounded-2xl border border-mist bg-snow p-2 shadow-float"
        >
          <div className="px-2 pt-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[11px] text-stone">제품 완성도</p>
              <p className="text-[13px] font-medium tracking-tight">{readiness.percent}%</p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-ink" style={{ width: `${readiness.percent}%` }} />
            </div>
          </div>
          {incomplete.length > 0 && (
            <div className="border-t border-mist pt-1">
              <p className="px-2 py-1 text-[10px] font-medium tracking-[0.14em] text-stone uppercase">미작성</p>
              {incomplete.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onJump?.(jumpSectionOf(area.id));
                    setOpen(false);
                  }}
                  className="flex w-full items-start justify-between gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-paper"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] tracking-tight">{area.label}</span>
                    {area.gaps.length > 0 && (
                      <span className="mt-0.5 block truncate text-[11px] text-stone">{area.gaps.join(" · ")}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-stone">{area.percent}%</span>
                </button>
              ))}
            </div>
          )}
          {complete.length > 0 && (
            <div className="border-t border-mist pt-1">
              <p className="px-2 py-1 text-[10px] font-medium tracking-[0.14em] text-stone uppercase">완료</p>
              {complete.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onJump?.(jumpSectionOf(area.id));
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-paper"
                >
                  <span className="text-[13px] tracking-tight">{area.label}</span>
                  <span className="shrink-0 text-[12px] tabular-nums text-stone">{area.percent}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
