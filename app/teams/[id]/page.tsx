"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { WorkspaceCard } from "@/components/workspace-card";
import { useWorkspace } from "@/lib/store";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { teams, workspaces, setTeamContext, createWorkspace } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const team = teams.find((t) => t.id === id);
  const teamWorkspaces = useMemo(() => workspaces.filter((w) => w.teamId === id), [workspaces, id]);

  useEffect(() => {
    if (team) setTeamContext(team.id);
  }, [team, setTeamContext]);

  if (!team) {
    return (
      <div className="flex min-h-full items-center justify-center bg-paper text-[14px] text-stone">팀을 찾을 수 없습니다.</div>
    );
  }

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-[13px] text-stone hover:text-ink"
        >
          ← 홈으로
        </button>
        <header className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[36px] font-semibold leading-none tracking-tight">{team.name}</h1>
            <p className="mt-2 text-[14px] text-stone">워크스페이스를 선택하여 시작하세요</p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-snow"
          >
            <Plus size={14} />
            워크스페이스 생성
          </button>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamWorkspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setCreating(false)}>
          <form
            className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (!trimmed) return;
              const wsId = createWorkspace(trimmed);
              setCreating(false);
              setName("");
              router.push(`/workspaces/${wsId}`);
            }}
          >
            <p className="text-[18px] font-semibold tracking-tight">워크스페이스 생성</p>
            <p className="mt-1 text-[13px] text-stone">{team.name} 안에 새 워크스페이스를 만듭니다.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="제품 템플릿"
              className="mt-4 h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                취소
              </button>
              <button className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">만들기</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
