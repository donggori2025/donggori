"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Folder, Globe, Plus } from "lucide-react";
import { collaboratorsOf, userById } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import {
  ACCESS_ROLE_LABEL,
  INVITE_ROLES,
  LINK_ACCESS_LABEL,
  LINK_ACCESS_OPTIONS,
  MEMBER_ROLES,
  TEAM_ACCESS_LABEL,
  TEAM_ACCESS_OPTIONS,
  type LinkAccess,
  type Product,
  type ProductAccessRole,
  type TeamAccess,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";

export const AVATAR_SIZE = 26;

function splitTokens(raw: string) {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pillLabel(token: string) {
  const t = token.trim();
  return t.includes("@") ? t.split("@")[0] || t : t;
}

function memberRoleOptions(access: ProductAccessRole): ProductAccessRole[] {
  if (access === "owner") return MEMBER_ROLES;
  if (MEMBER_ROLES.includes(access)) return MEMBER_ROLES;
  return [access, ...MEMBER_ROLES];
}

function AccessMenu<T extends string>({
  value,
  options,
  labels,
  open,
  onToggle,
  onSelect,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-0.5 text-[13px] text-stone hover:text-ink"
      >
        {labels[value]}
        <ChevronDown size={13} strokeWidth={1.75} className={cn("text-stone/60", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-[128px] overflow-hidden rounded-lg border border-mist bg-snow py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt);
              }}
              className={cn(
                "flex w-full px-3 py-1.5 text-left text-[13px] hover:bg-paper",
                opt === value ? "text-ink" : "text-stone",
              )}
            >
              {labels[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InviteTrigger({
  product,
  workspaceName,
}: {
  product?: Product;
  workspaceName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="인원 초대"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-mist bg-snow text-stone ring-2 ring-snow hover:bg-paper hover:text-ink"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      >
        <Plus size={12} strokeWidth={2.4} />
      </button>
      {open && (
        <InviteModal product={product} workspaceName={workspaceName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function InviteModal({
  product,
  workspaceName,
  onClose,
}: {
  product?: Product;
  workspaceName: string;
  onClose: () => void;
}) {
  const {
    currentUserId,
    currentWorkspace,
    getUser,
    getProduct,
    users,
    inviteToProduct,
    inviteToWorkspace,
    setCollaboratorAccess,
    setAnyoneAccess,
    setWorkspaceAccess,
  } = useWorkspace();
  const [draft, setDraft] = useState("");
  const [pills, setPills] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<ProductAccessRole>("edit");
  const [menu, setMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = product ? (getProduct(product.id) ?? product) : undefined;
  const members = live ? collaboratorsOf(live) : [];
  const workspaceMembers = currentWorkspace.memberIds
    .map((id) => getUser(id) ?? userById(id))
    .filter(Boolean);
  const takenIds = live ? new Set(members.map((c) => c.userId)) : new Set(currentWorkspace.memberIds);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menu) setMenu(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, onClose]);

  const addFromDraft = (raw: string) => {
    const next = splitTokens(raw);
    if (!next.length) return;
    setPills((prev) => {
      const seen = new Set(prev.map((p) => p.toLowerCase()));
      const extra = next.filter((t) => !seen.has(t.toLowerCase()));
      return extra.length ? [...prev, ...extra] : prev;
    });
    setDraft("");
  };

  const pending = useMemo(() => {
    const fromPills = [...pills];
    const leftover = draft.trim();
    if (leftover && !leftover.endsWith(",")) fromPills.push(leftover);
    return fromPills;
  }, [pills, draft]);

  const canInvite = pending.length > 0;

  const submit = () => {
    const tokens = [...pills, ...splitTokens(draft)];
    if (!tokens.length) return;
    if (live) inviteToProduct(live.id, tokens, inviteRole);
    else inviteToWorkspace(tokens, inviteRole);
    setPills([]);
    setDraft("");
    setMenu(null);
  };

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q || q.includes(",")) return [];
    return users
      .filter((u) => !takenIds.has(u.id))
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [draft, takenIds, users]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-overlay p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="인원 초대"
        className="w-[480px] rounded-xl bg-snow p-5 shadow-[0_16px_50px_rgba(0,0,0,0.14)]"
        onClick={(e) => {
          e.stopPropagation();
          setMenu(null);
        }}
      >
        <div className="flex items-stretch gap-2">
          <input
            ref={inputRef}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (draft.trim()) addFromDraft(draft);
                else submit();
              }
              if (e.key === ",") {
                e.preventDefault();
                addFromDraft(`${draft},`);
              }
              if (e.key === "Backspace" && !draft && pills.length) {
                setPills((p) => p.slice(0, -1));
              }
            }}
            placeholder="초대할 이메일을 쉼표로 구분해 입력하세요."
            className="h-10 min-w-0 flex-1 rounded-md border border-mist px-3 text-[13px] outline-none placeholder:text-stone/60 focus:border-select focus:ring-1 focus:ring-select"
          />
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <AccessMenu
              value={inviteRole}
              options={INVITE_ROLES}
              labels={ACCESS_ROLE_LABEL}
              open={menu === "invite-role"}
              onToggle={() => setMenu((m) => (m === "invite-role" ? null : "invite-role"))}
              onSelect={(role) => {
                setInviteRole(role);
                setMenu(null);
              }}
            />
          </div>
          <button
            type="button"
            disabled={!canInvite}
            onClick={submit}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "h-10 shrink-0 rounded-md px-4 text-[13px]",
              canInvite ? "bg-ink text-snow" : "cursor-not-allowed bg-fog text-stone",
            )}
          >
            초대
          </button>
        </div>

        {pills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pills.map((token) => (
              <button
                key={token}
                type="button"
                title="제거"
                onClick={() => setPills((p) => p.filter((x) => x !== token))}
                className="inline-flex items-center gap-1 rounded-md border border-mist px-2 py-1 text-[12px] text-ink hover:bg-paper"
              >
                <Plus size={11} strokeWidth={2.2} className="text-stone" />
                {pillLabel(token)}
              </button>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-lg border border-mist">
            {suggestions.map((u) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPills((prev) =>
                    prev.some((p) => p.toLowerCase() === u.name.toLowerCase()) ? prev : [...prev, u.name],
                  );
                  setDraft("");
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-paper"
              >
                <Avatar user={u} size={22} />
                <span className="text-[13px]">{u.name}</span>
                <span className="ml-auto text-[11px] text-stone">{u.email ?? u.title}</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-[12px] text-stone">접근 권한</p>
        <div className="mt-1">
          {live && (
            <>
          <AccessRow
            icon={
              <span className="flex h-8 w-8 items-center justify-center text-stone">
                <Globe size={18} strokeWidth={1.6} />
              </span>
            }
            label="누구나"
            menu={
              <AccessMenu
                value={live.anyoneAccess ?? "view"}
                options={LINK_ACCESS_OPTIONS}
                labels={LINK_ACCESS_LABEL}
                open={menu === "anyone"}
                onToggle={() => setMenu((m) => (m === "anyone" ? null : "anyone"))}
                onSelect={(v: LinkAccess) => {
                  setAnyoneAccess(live.id, v);
                  setMenu(null);
                }}
              />
            }
          />
          <AccessRow
            icon={
              <span className="flex h-8 w-8 items-center justify-center text-stone">
                <Folder size={18} strokeWidth={1.6} />
              </span>
            }
            label={`${workspaceName}의 멤버`}
            menu={
              <AccessMenu
                value={live.workspaceAccess ?? "access"}
                options={TEAM_ACCESS_OPTIONS}
                labels={TEAM_ACCESS_LABEL}
                open={menu === "workspace"}
                onToggle={() => setMenu((m) => (m === "workspace" ? null : "workspace"))}
                onSelect={(v: TeamAccess) => {
                  setWorkspaceAccess(live.id, v);
                  setMenu(null);
                }}
              />
            }
          />
          {members.map((c) => {
            const user = getUser(c.userId) ?? userById(c.userId);
            if (!user) return null;
            const isYou = c.userId === currentUserId;
            const isOwner = c.access === "owner" || c.userId === live.ownerId;
            return (
              <AccessRow
                key={c.userId}
                icon={<Avatar user={user} size={32} />}
                label={isYou ? `${user.name} (나)` : user.name}
                menu={
                  isOwner ? (
                    <span className="text-[13px] text-stone">{ACCESS_ROLE_LABEL.owner}</span>
                  ) : (
                    <AccessMenu
                      value={c.access}
                      options={memberRoleOptions(c.access)}
                      labels={ACCESS_ROLE_LABEL}
                      open={menu === c.userId}
                      onToggle={() => setMenu((m) => (m === c.userId ? null : c.userId))}
                      onSelect={(role: ProductAccessRole) => {
                        setCollaboratorAccess(live.id, c.userId, role);
                        setMenu(null);
                      }}
                    />
                  )
                }
              />
            );
          })}
            </>
          )}
          {!live &&
            workspaceMembers.map((user) => {
              if (!user) return null;
              const isYou = user.id === currentUserId;
              const isOwner = user.id === currentWorkspace.memberIds[0];
              return (
                <AccessRow
                  key={user.id}
                  icon={<Avatar user={user} size={32} />}
                  label={isYou ? `${user.name} (나)` : user.name}
                  menu={
                    <span className="text-[13px] text-stone">
                      {isOwner ? ACCESS_ROLE_LABEL.owner : ACCESS_ROLE_LABEL.edit}
                    </span>
                  }
                />
              );
            })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AccessRow({
  icon,
  label,
  menu,
}: {
  icon: ReactNode;
  label: string;
  menu: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">{icon}</div>
      <p className="min-w-0 flex-1 truncate text-[14px] text-ink">{label}</p>
      <div onClick={(e) => e.stopPropagation()}>{menu}</div>
    </div>
  );
}
