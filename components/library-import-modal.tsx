"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Lock } from "lucide-react";
import { CloudIcon } from "@/components/cloud-icon";
import { workspaceIdsInScope } from "@/components/context-picker";
import { IMPORT_KIND_LABEL, matchesImportKind, type LibraryImportKind } from "@/lib/library-import";
import { useWorkspace } from "@/lib/store";
import type { LibraryAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LibraryImportModal({
  kind,
  onClose,
  onImport,
}: {
  kind: LibraryImportKind;
  onClose: () => void;
  onImport: (assets: LibraryAsset[]) => void;
}) {
  const { assets, workspaces, teams, currentUserId } = useWorkspace();
  const [teamId, setTeamId] = useState<string | null | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const scopes = useMemo(
    () => [
      { id: null as string | null, label: "내 워크스페이스" },
      ...teams
        .filter((t) => t.memberIds.includes(currentUserId))
        .map((t) => ({ id: t.id, label: t.name })),
    ],
    [teams, currentUserId],
  );

  const selectedScope = teamId === undefined ? null : scopes.find((s) => s.id === teamId);
  const kindLabel = IMPORT_KIND_LABEL[kind];

  const items = useMemo(() => {
    if (teamId === undefined) return [];
    const ids = new Set(workspaceIdsInScope(workspaces, teamId));
    return assets.filter((a) => ids.has(a.workspaceId) && matchesImportKind(a, kind));
  }, [assets, workspaces, teamId, kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    const picked = items.filter((a) => selected.has(a.id));
    if (!picked.length) return;
    onImport(picked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-import-title"
        className="flex max-h-[min(80vh,560px)] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-mist bg-snow text-ink shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 border-b border-mist px-5 py-4">
          {teamId !== undefined && (
            <button
              type="button"
              aria-label="라이브러리 목록으로"
              onClick={() => {
                setTeamId(undefined);
                setSelected(new Set());
              }}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-paper"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p id="library-import-title" className="text-[18px] font-semibold tracking-tight">
              {teamId === undefined ? "라이브러리에서 가져오기" : `${selectedScope?.label ?? ""}의 라이브러리`}
            </p>
            <p className="mt-1 text-[13px] text-stone">
              {teamId === undefined ? "라이브러리를 고르세요." : `가져올 ${kindLabel} 항목을 선택하세요.`}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {teamId === undefined ? (
            <div className="space-y-0.5">
              <p className="px-2 pb-1.5 text-[11px] text-stone">개인</p>
              {scopes
                .filter((s) => s.id === null)
                .map((s) => (
                  <button
                    key="personal"
                    type="button"
                    onClick={() => setTeamId(null)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left hover:bg-paper"
                  >
                    <CloudIcon className="text-stone" />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{s.label}</span>
                  </button>
                ))}
              <p className="mt-3 px-2 pb-1.5 text-[11px] text-stone">팀</p>
              {scopes
                .filter((s) => s.id !== null)
                .map((s) => {
                  const team = teams.find((t) => t.id === s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTeamId(s.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left hover:bg-paper"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{ background: team?.color }}
                      >
                        {team?.initial}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px]">{s.label}</span>
                      {team?.locked && <Lock size={13} className="shrink-0 text-stone" />}
                    </button>
                  );
                })}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <p className="text-[14px] font-medium">가져올 항목이 없습니다</p>
              <p className="mt-1 text-[13px] text-stone">
                {selectedScope?.label} 라이브러리에 해당하는 {kindLabel}이 없습니다.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => {
                const on = selected.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left",
                        on ? "border-ink bg-paper" : "border-mist hover:bg-paper",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                          on ? "border-ink bg-ink text-snow" : "border-mist bg-snow text-transparent",
                        )}
                      >
                        <Check size={12} strokeWidth={2.4} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{item.name}</span>
                        <span className="block truncate text-[12px] text-stone">
                          {item.kind} · {item.meta}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {teamId !== undefined && (
          <div className="flex items-center justify-end gap-2 border-t border-mist px-5 py-3">
            <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
              취소
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={confirm}
              className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow disabled:opacity-30"
            >
              가져오기{selected.size > 0 ? ` ${selected.size}` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
