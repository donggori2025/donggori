"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { CloudIcon } from "@/components/cloud-icon";
import { useWorkspace } from "@/lib/store";
import type { Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ContextPickerSuffix = "라이브러리" | "휴지통";

export function workspaceIdsInScope(workspaces: Workspace[], teamId: string | null) {
  return workspaces
    .filter((w) => (teamId ? w.teamId === teamId : w.teamId === null))
    .map((w) => w.id);
}

export function ContextPicker({
  suffix,
  value,
  onChange,
}: {
  suffix: ContextPickerSuffix;
  value: string | null;
  onChange: (teamId: string | null) => void;
}) {
  const { teams } = useWorkspace();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selectedTeam = value ? teams.find((t) => t.id === value) : null;
  const contextName = selectedTeam?.name ?? "내 워크스페이스";

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
    <div ref={root} className="relative mt-1">
      <div className="flex max-w-full items-center text-[36px] font-semibold leading-none tracking-tight text-ink">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-w-0 items-center gap-1 rounded-2xl py-0.5 pr-0.5 text-left hover:bg-paper"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`${contextName} 선택`}
        >
          <span className="truncate">{contextName}</span>
          <ChevronDown
            size={22}
            className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
            strokeWidth={2}
          />
        </button>
        <span className="shrink-0">의 {suffix}</span>
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 z-40 w-[260px] rounded-2xl border border-mist bg-snow p-3 shadow-float"
        >
          <p className="px-1 pb-2 text-[11px] text-stone">개인</p>
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={cn(
              "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
              !value ? "bg-mist" : "hover:bg-paper",
            )}
          >
            <CloudIcon className="text-stone" />
            <span className="min-w-0 flex-1 truncate text-[13px]">내 워크스페이스</span>
            {!value && <Check size={14} className="shrink-0" strokeWidth={2.2} />}
          </button>

          <p className="mt-3 px-1 pb-2 text-[11px] text-stone">팀</p>
          {teams.map((team) => {
            const selected = value === team.id;
            return (
              <button
                key={team.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(team.id);
                  setOpen(false);
                }}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
                  selected ? "bg-mist" : "hover:bg-paper",
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: team.color }}
                >
                  {team.initial}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{team.name}</span>
                {team.locked && <Lock size={13} className="shrink-0 text-stone" />}
                {selected && <Check size={14} className="shrink-0" strokeWidth={2.2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
