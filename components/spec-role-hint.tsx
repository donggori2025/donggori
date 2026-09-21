"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function SpecRoleHint({
  className,
  align = "right",
}: {
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="spec용 도식화 역할"
        aria-expanded={open}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-fog text-[10px] font-medium leading-none text-stone hover:border-ink hover:bg-paper hover:text-ink"
      >
        ?
      </button>
      {open && (
        <div
          role="tooltip"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-50 mt-1 w-[228px] rounded-xl border border-mist bg-snow p-2.5 text-[11px] leading-relaxed text-ink shadow-sm",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="font-medium">spec용 도식화</p>
          <p className="mt-1 text-stone">
            이 대지에 쓰는 원단, 부자재, 측정이 작업지시서에 채워집니다. spec용은 하나뿐입니다. 다른 아트보드의 일반
            칩을 누르면 spec용으로 바꿀 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

export function SpecRoleMark() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="rounded-full bg-sky px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-sky-ink">spec</span>
      <SpecRoleHint />
    </span>
  );
}

const chipClass =
  "rounded-full px-1.5 py-0.5 text-[9px] font-medium tracking-wide";

export function SpecSwitchConfirm({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/30 p-4"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spec-switch-title"
        className="w-[320px] rounded-3xl border border-mist bg-snow p-5 shadow-[0_20px_60px_rgba(26,25,22,0.16)]"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <p id="spec-switch-title" className="text-[16px] font-semibold tracking-tight">
          spec용으로 전환하시겠습니까?
        </p>
        <p className="mt-1.5 text-[13px] text-stone">
          spec용 도식화는 하나뿐입니다. 지금 spec은 일반으로 바뀝니다.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 rounded-full px-3.5 text-[13px] text-stone hover:bg-paper hover:text-ink"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 rounded-full bg-ink px-3.5 text-[13px] text-snow"
          >
            전환
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SpecAssignChip({
  isSpec,
  disabled,
  onAssign,
}: {
  isSpec: boolean;
  disabled?: boolean;
  onAssign?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (isSpec) return <SpecRoleMark />;

  const chip = (
    <span className={cn(chipClass, "bg-mist text-stone")}>일반</span>
  );

  if (!onAssign) return chip;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title="이 대지를 spec용 도식화로 전환"
        aria-label="일반 도식화, spec용으로 전환"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
        className={cn(
          chipClass,
          "bg-mist text-stone hover:bg-fog hover:text-ink disabled:opacity-40",
        )}
      >
        일반
      </button>
      <SpecSwitchConfirm
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onAssign();
        }}
      />
    </>
  );
}
