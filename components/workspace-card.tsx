"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Palette, Pencil, Settings, Trash2, Users } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { WorkspaceBackgroundModal } from "@/components/workspace-backdrop";
import { useWorkspace } from "@/lib/store";
import type { User, Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AvatarStack } from "./ui";

type Panel = "menu" | "rename" | "background" | "members" | "delete" | null;

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const { getUser, setWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [panel, setPanel] = useState<Panel>(null);
  const [name, setName] = useState(workspace.name);
  const root = useRef<HTMLDivElement>(null);

  const members = workspace.memberIds.map((id) => getUser(id)).filter(Boolean) as User[];
  const shown = members.slice(0, 4);
  const extra = Math.max(0, members.length - shown.length);
  const menuOpen = panel === "menu";

  useEffect(() => {
    if (panel !== "menu") return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  useEffect(() => {
    setName(workspace.name);
  }, [workspace.name]);

  function openWorkspace() {
    setWorkspace(workspace.id);
    router.push(`/workspaces/${workspace.id}`);
  }

  return (
    <>
      <div
        ref={root}
        className="group relative rounded-2xl border border-mist bg-snow text-left transition hover:border-fog"
      >
        <button
          type="button"
          aria-label={`${workspace.name} 설정`}
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPanel((p) => (p === "menu" ? null : "menu"));
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-md bg-snow/90 text-stone shadow-sm transition-opacity hover:bg-snow hover:text-ink",
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100",
          )}
        >
          <Settings size={14} strokeWidth={1.75} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute top-11 right-2 z-30 w-[200px] rounded-xl bg-snow p-1.5 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              icon={<Users size={15} strokeWidth={1.7} />}
              label="멤버 관리"
              onClick={() => {
                setWorkspace(workspace.id);
                setPanel("members");
              }}
            />
            <MenuItem
              icon={<Pencil size={15} strokeWidth={1.7} />}
              label="이름 변경"
              onClick={() => setPanel("rename")}
            />
            <MenuItem
              icon={<Palette size={15} strokeWidth={1.7} />}
              label="배경 변경"
              onClick={() => setPanel("background")}
            />
            <MenuItem
              icon={<Trash2 size={15} strokeWidth={1.7} />}
              label="워크스페이스 삭제"
              danger
              onClick={() => setPanel("delete")}
            />
          </div>
        )}
        <button type="button" onClick={openWorkspace} className="block w-full overflow-hidden rounded-2xl text-left">
          <div
            className="relative h-28 overflow-hidden"
            style={{ backgroundColor: workspace.color }}
          >
            {(workspace.stickers?.length
              ? workspace.stickers
              : workspace.coverImage
                ? [
                    {
                      id: "cover",
                      src: workspace.coverImage,
                      x: workspace.coverImageX ?? 42,
                      y: workspace.coverImageY ?? 18,
                      rotate: -8,
                    },
                  ]
                : []
            )
              .slice(0, 4)
              .map((st) => (
                <img
                  key={st.id}
                  src={st.src}
                  alt=""
                  className="absolute h-10 w-auto rounded-md object-contain p-0.5 shadow-md ring-1 ring-black/5"
                  style={{
                    left: `${Math.min(62, st.x)}%`,
                    top: `${Math.min(38, st.y)}%`,
                    transform: `rotate(${st.rotate}deg)`,
                    background: "#fff",
                  }}
                />
              ))}
          </div>
          <div className="p-4">
            <p className="text-[15px] font-semibold tracking-tight">{workspace.name}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <AvatarStack users={shown} size={22} />
                {extra > 0 && <span className="text-[11px] text-stone">+{extra}</span>}
                <Users size={12} className="text-stone" />
                <span className="text-[11px] text-stone">{members.length}</span>
              </div>
              <div className="w-16 shrink-0">
                <div className="h-px bg-fog" />
                <p className="mt-1 text-right text-[10px] text-stone">{workspace.sizeLabel ?? "0MB"}</p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {panel === "rename" && (
        <Overlay onClose={() => setPanel(null)}>
          <form
            className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (!trimmed) return;
              updateWorkspace(workspace.id, { name: trimmed });
              setPanel(null);
            }}
          >
            <p className="text-[18px] font-semibold tracking-tight">이름 변경</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-4 h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setPanel(null)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                취소
              </button>
              <button className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">저장</button>
            </div>
          </form>
        </Overlay>
      )}

      {panel === "background" && (
        <WorkspaceBackgroundModal workspace={workspace} onClose={() => setPanel(null)} />
      )}

      {panel === "delete" && (
        <Overlay onClose={() => setPanel(null)}>
          <div className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl">
            <p className="text-[18px] font-semibold tracking-tight">워크스페이스 삭제</p>
            <p className="mt-2 text-[13px] text-stone">
              {workspace.name}을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPanel(null)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteWorkspace(workspace.id);
                  setPanel(null);
                }}
                className="rounded-full bg-danger px-4 py-1.5 text-[13px] text-snow"
              >
                삭제
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {panel === "members" && (
        <InviteModal workspaceName={workspace.name} onClose={() => setPanel(null)} />
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-paper",
        danger ? "text-danger" : "text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
