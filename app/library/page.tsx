"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ContextPicker, workspaceIdsInScope } from "@/components/context-picker";
import { DriveChips } from "@/components/drive-chips";
import { WorkspaceChips } from "@/components/workspace-chips";
import { LibraryAssetEditModal } from "@/components/library-asset-edit-modal";
import { LIBRARY_CHIPS, assetDriveChip, type DriveChipId } from "@/lib/drive";
import { isSpecLibraryAsset } from "@/lib/library-import";
import { useWorkspace } from "@/lib/store";
import type { LibraryAsset } from "@/lib/types";
import { recencyRank } from "@/lib/utils";

export default function LibraryPage() {
  const { assets, workspaces, teams, currentTeamId } = useWorkspace();
  const [scopeTeamId, setScopeTeamId] = useState<string | null>(currentTeamId);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | "all">("all");
  const [filter, setFilter] = useState<DriveChipId>("all");

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
  const isTeam = Boolean(scopeTeamId);
  const teamName = teams.find((t) => t.id === scopeTeamId)?.name;

  const scopedAssets = useMemo(
    () =>
      assets.filter(
        (a) =>
          scopedIds.has(a.workspaceId) &&
          isSpecLibraryAsset(a) &&
          (activeWorkspace === "all" || a.workspaceId === activeWorkspace),
      ),
    [assets, scopedIds, activeWorkspace],
  );
  const visible = useMemo(() => {
    const filtered = scopedAssets.filter((a) => {
      if (filter === "all") return true;
      return assetDriveChip(a.kind, a.name) === filter;
    });
    return [...filtered].sort((a, b) => recencyRank(a.usedAt) - recencyRank(b.usedAt));
  }, [scopedAssets, filter]);

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div>
        <p className="text-[11px] tracking-[0.18em] text-stone uppercase">
          {isTeam ? "Team Assets" : "Personal Assets"}
        </p>
        <ContextPicker suffix="라이브러리" value={scopeTeamId} onChange={setScopeTeamId} />
        <p className="mt-2 max-w-xl text-[14px] text-stone">Specs에서 작업하며 모인 에셋</p>
        <p className="mt-1 max-w-xl text-[13px] text-stone">
          {isTeam
            ? `${teamName ?? "팀"} Specs에서 저장한 원단, 부자재, 사이즈, 수량만 보여 줍니다.`
            : "원단·부자재·사이즈·수량을 Specs에서 저장하면 여기에 모입니다."}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <WorkspaceChips
          workspaces={scopedWorkspaces}
          value={activeWorkspace}
          onChange={setWorkspaceFilter}
        />
        <div className="min-w-0 flex-1">
          <DriveChips value={filter} onChange={setFilter} chips={LIBRARY_CHIPS} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-[14px] font-medium">{filter === "all" ? "최근 사용" : "Assets"}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {visible.length === 0 && (
            <p className="col-span-full rounded-3xl border border-dashed border-fog px-4 py-10 text-center text-[13px] text-stone">
              Specs에서 저장한 에셋이 없습니다
            </p>
          )}
          {visible.map((item) => (
            <LibraryAssetCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
    </div>
  );
}

function LibraryAssetCard({ item }: { item: LibraryAsset }) {
  const { deleteAsset } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <article ref={root} className="relative w-full min-w-0 rounded-3xl border border-mist bg-snow p-3">
        <div className="mb-3 aspect-[4/3] rounded-2xl bg-paper" />
        <p className="text-[11px] tracking-wide text-stone uppercase">{item.kind}</p>
        <p className="mt-1 pr-8 text-[14px] font-medium">{item.name}</p>
        <p className="pr-8 text-[12px] text-stone">{item.meta}</p>
        <div className="absolute right-3 bottom-3 z-[1]" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={`${item.name} 메뉴`}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 bottom-9 z-30 w-[168px] overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                aria-label="수정"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
                  <Pencil size={13} />
                </span>
                수정
              </button>
              <div className="mx-2 my-1 h-px bg-mist" />
              <button
                type="button"
                role="menuitem"
                aria-label="삭제"
                onClick={() => {
                  setMenuOpen(false);
                  deleteAsset(item.id);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
                  <Trash2 size={13} />
                </span>
                삭제
              </button>
            </div>
          )}
        </div>
      </article>
      {editing && <LibraryAssetEditModal asset={item} onClose={() => setEditing(false)} />}
    </>
  );
}
