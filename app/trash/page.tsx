"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, LayoutGrid, List, MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import { ContextPicker, workspaceIdsInScope } from "@/components/context-picker";
import { WorkspaceChips } from "@/components/workspace-chips";
import { useWorkspace } from "@/lib/store";
import type { TrashedItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "gallery";

function TrashMenu({
  item,
  onRestore,
  onDelete,
}: {
  item: TrashedItem;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

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
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-label={`${item.name} 더보기`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-stone transition-opacity hover:bg-paper hover:text-ink",
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
      >
        <MoreVertical size={16} strokeWidth={1.7} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-9 right-0 z-30 w-[168px] overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-float"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onRestore();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
          >
            <RotateCcw size={14} strokeWidth={1.7} className="text-stone" />
            복원
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-danger hover:bg-paper"
          >
            <Trash2 size={14} strokeWidth={1.7} />
            영구 삭제
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrashPage() {
  const { workspaces, currentTeamId, trash, restoreTrashItem, deleteTrashItem } = useWorkspace();
  const [scopeTeamId, setScopeTeamId] = useState<string | null>(currentTeamId);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | "all">("all");
  const [view, setView] = useState<ViewMode>("list");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaceFilter("all");
  }, [scopeTeamId]);

  const scopedWorkspaces = useMemo(
    () => workspaces.filter((w) => (scopeTeamId ? w.teamId === scopeTeamId : w.teamId === null)),
    [workspaces, scopeTeamId],
  );
  const scopedIds = useMemo(
    () => new Set(workspaceIdsInScope(workspaces, scopeTeamId)),
    [workspaces, scopeTeamId],
  );
  const activeWorkspace =
    workspaceFilter !== "all" && scopedIds.has(workspaceFilter) ? workspaceFilter : "all";
  const items = useMemo(
    () =>
      trash.filter(
        (item) => scopedIds.has(item.workspaceId) && (activeWorkspace === "all" || item.workspaceId === activeWorkspace),
      ),
    [trash, scopedIds, activeWorkspace],
  );

  function restore(item: TrashedItem) {
    restoreTrashItem(item.id);
    setNotice(`${item.name}을(를) 복원했습니다.`);
  }

  function remove(item: TrashedItem) {
    deleteTrashItem(item.id);
    setNotice(`${item.name}을(를) 영구 삭제했습니다.`);
  }

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Drive</p>
          <ContextPicker suffix="휴지통" value={scopeTeamId} onChange={setScopeTeamId} />
          <p className="mt-2 text-[14px] text-stone">삭제한 항목은 30일 동안 보관된 뒤 영구 삭제됩니다.</p>
        </div>
        <div className="flex shrink-0 items-center rounded-full border border-mist bg-snow p-0.5">
          <button
            type="button"
            aria-label="갤러리"
            aria-pressed={view === "gallery"}
            onClick={() => setView("gallery")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              view === "gallery" ? "bg-paper text-ink" : "text-stone hover:text-ink",
            )}
          >
            <LayoutGrid size={15} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            aria-label="리스트"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              view === "list" ? "bg-paper text-ink" : "text-stone hover:text-ink",
            )}
          >
            <List size={15} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div className="mb-6">
        <WorkspaceChips
          workspaces={scopedWorkspaces}
          value={activeWorkspace}
          onChange={setWorkspaceFilter}
        />
      </div>

      {notice && (
        <p className="mb-6 rounded-2xl border border-mist bg-snow px-4 py-3 text-[13px] text-ink">{notice}</p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-fog bg-snow/70 px-6 py-20 text-center">
          <Trash2 size={28} className="text-stone" strokeWidth={1.5} />
          <p className="mt-4 text-[15px] font-medium">휴지통이 비어 있습니다</p>
          <p className="mt-1 text-[13px] text-stone">삭제한 파일과 폴더가 여기에 표시됩니다.</p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="group flex items-center gap-3 rounded-2xl border border-mist bg-snow px-4 py-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-stone">
                <FileText size={16} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{item.name}</p>
                <p className="text-[12px] text-stone">
                  {item.kind} · {item.deletedAt} 삭제
                </p>
              </div>
              <TrashMenu item={item} onRestore={() => restore(item)} onDelete={() => remove(item)} />
            </article>
          ))}
        </div>
      ) : (
        <div className="drive-file-grid-fill">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative w-full min-w-0 rounded-2xl border border-mist bg-snow p-3"
            >
              <div className="absolute right-2.5 bottom-2.5 z-10">
                <TrashMenu item={item} onRestore={() => restore(item)} onDelete={() => remove(item)} />
              </div>
              <div className="flex h-32 items-center justify-center rounded-2xl bg-paper text-stone">
                <FileText size={24} strokeWidth={1.5} />
              </div>
              <div className="mt-2.5 min-w-0 pr-8">
                <p className="truncate text-[13px] font-medium">{item.name}</p>
                <p className="truncate text-[11px] text-stone">
                  {item.kind} · {item.deletedAt} 삭제
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
