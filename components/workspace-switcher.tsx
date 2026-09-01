"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronRight, FileText, Lock, Plus } from "lucide-react";
import { CloudIcon } from "@/components/cloud-icon";
import { CURRENT_USER_ID } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import type { Team, Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkspacePanel({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    teams,
    currentTeam,
    currentTeamId,
    contextWorkspaces,
    setWorkspace,
    setTeamContext,
    createTeam,
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);
  const [favOpen, setFavOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const headerSelected =
    open ||
    pathname.startsWith("/teams/") ||
    pathname.startsWith("/workspaces/") ||
    pathname.startsWith("/personal");

  const favorites = contextWorkspaces.filter((w) => w.favorite);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function goPersonal() {
    setTeamContext(null);
    setOpen(false);
    router.push("/personal");
  }

  function goTeam(team: Team) {
    setTeamContext(team.id);
    setOpen(false);
    router.push(`/teams/${team.id}`);
  }

  function goWorkspace(ws: Workspace) {
    setWorkspace(ws.id);
    router.push(`/workspaces/${ws.id}`);
  }

  return (
    <div
      ref={root}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        collapsed ? "items-center px-1 pt-2" : "px-3 pb-3 pt-3",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={collapsed ? (currentTeam ? currentTeam.name : "내 워크스페이스") : undefined}
        className={cn(
          "flex items-center text-left transition-colors",
          collapsed ? "h-9 w-9 justify-center rounded-xl" : "w-full gap-2 rounded-xl px-2.5 py-1.5",
          headerSelected ? "bg-paper text-ink" : "text-ink hover:bg-paper",
        )}
      >
        {currentTeam ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold"
            style={{ background: currentTeam.color }}
          >
            {currentTeam.initial}
          </span>
        ) : (
          <CloudIcon className="text-ink" />
        )}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
              {currentTeam ? currentTeam.name : "내 워크스페이스"}
            </span>
            <ChevronDown size={14} className="shrink-0 text-stone" />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-40 w-[236px] rounded-2xl border border-mist bg-snow p-3 shadow-[0_16px_50px_rgba(26,25,22,0.12)]",
            collapsed ? "top-0 left-full ml-1" : "top-[44px] left-2",
          )}
        >
          <p className="px-1 pb-2 text-[11px] text-stone">개인</p>
          <button
            type="button"
            onClick={goPersonal}
            className={cn(
              "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
              !currentTeamId && (pathname.startsWith("/personal") || pathname.startsWith("/workspaces/"))
                ? "bg-paper text-ink"
                : "hover:bg-paper",
            )}
          >
            <CloudIcon className="text-stone" />
            <span className="min-w-0 flex-1 truncate text-[13px]">내 워크스페이스</span>
            {!currentTeamId && (pathname.startsWith("/personal") || pathname.startsWith("/workspaces/")) && (
              <Check size={14} className="shrink-0" strokeWidth={2.2} />
            )}
          </button>

          <p className="mt-3 px-1 pb-2 text-[11px] text-stone">팀</p>
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => goTeam(team)}
              className={cn(
                "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
                currentTeamId === team.id &&
                (pathname.startsWith(`/teams/${team.id}`) || pathname.startsWith("/workspaces/"))
                  ? "bg-paper text-ink"
                  : "hover:bg-paper",
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
              {currentTeamId === team.id &&
                (pathname.startsWith(`/teams/${team.id}`) || pathname.startsWith("/workspaces/")) && (
                  <Check size={14} className="shrink-0" strokeWidth={2.2} />
                )}
            </button>
          ))}

          {creating ? (
            <form
              className="mt-1 space-y-2 rounded-xl bg-paper p-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                const id = createTeam(name.trim(), locked, CURRENT_USER_ID);
                setName("");
                setLocked(false);
                setCreating(false);
                setOpen(false);
                router.push(`/teams/${id}`);
              }}
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="팀 이름"
                className="h-8 w-full rounded-lg bg-snow px-2 text-[13px] outline-none"
              />
              <label className="flex items-center gap-2 text-[11px] text-stone">
                <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
                비공개 팀
              </label>
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => setCreating(false)} className="rounded-full px-2 py-1 text-[11px] text-stone">
                  취소
                </button>
                <button className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-snow">만들기</button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-paper"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mist text-stone">
                <Plus size={14} />
              </span>
              <span className="text-[13px]">팀 생성</span>
            </button>
          )}
        </div>
      )}

      {!collapsed && (
      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        <button
          type="button"
          onClick={() => setFavOpen((v) => !v)}
          className="flex w-full items-center gap-1 px-0.5 py-1 text-[12px] text-stone"
        >
          {favOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          즐겨찾기
        </button>
        {favOpen && (
          <p className="px-5 py-1 text-[12px] text-stone/80">
            {favorites.length === 0 ? "즐겨찾기한 항목이 없습니다" : null}
          </p>
        )}

        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="mt-2 flex w-full items-center gap-1 px-0.5 py-1 text-[12px] text-stone"
        >
          {listOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          워크스페이스
        </button>
        {listOpen && (
          <div className="mt-0.5">
            {contextWorkspaces.length === 0 && (
              <p className="px-5 py-1 text-[12px] text-stone/80">워크스페이스가 없습니다</p>
            )}
            {contextWorkspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => goWorkspace(ws)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]",
                  pathname === `/workspaces/${ws.id}` || pathname.startsWith(`/workspaces/${ws.id}/`)
                    ? "bg-paper text-ink"
                    : "text-stone hover:bg-paper hover:text-ink",
                )}
              >
                <FileText size={14} className="shrink-0" strokeWidth={1.6} />
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
