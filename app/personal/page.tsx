"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useWorkspace } from "@/lib/store";

export default function PersonalPage() {
  const router = useRouter();
  const { workspaces, setTeamContext, setWorkspace, createWorkspace } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const personalWorkspaces = useMemo(() => workspaces.filter((w) => w.teamId === null), [workspaces]);

  useEffect(() => {
    setTeamContext(null);
  }, [setTeamContext]);

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
            <h1 className="text-[36px] font-semibold leading-none tracking-tight">내 워크스페이스</h1>
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
          {personalWorkspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                setWorkspace(ws.id);
                router.push(`/workspaces/${ws.id}`);
              }}
              className="overflow-hidden rounded-2xl border border-mist bg-snow text-left transition hover:border-fog"
            >
              <div className="h-28" style={{ background: ws.color }} />
              <div className="p-4">
                <p className="text-[15px] font-semibold tracking-tight">{ws.name}</p>
                <p className="mt-3 text-right text-[10px] text-stone">{ws.sizeLabel ?? "0MB"}</p>
              </div>
            </button>
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
            <p className="mt-1 text-[13px] text-stone">내 워크스페이스 안에 새 워크스페이스를 만듭니다.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="워크스페이스 이름"
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
