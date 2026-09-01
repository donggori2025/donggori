"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Copy, Globe, Link2, SlidersHorizontal, UserRound, X } from "lucide-react";
import { collaboratorsOf, firstSyllable, userById } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import { INVITE_ROLES, type LinkAccess, type ProductAccessRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHARE_ROLE_LABEL: Record<ProductAccessRole, string> = {
  owner: "소유자",
  assignee: "담당",
  edit: "편집자",
  comment: "댓글 작성자",
  view: "뷰어",
};

const SHARE_MEMBER_ROLES: ProductAccessRole[] = ["owner", "assignee", "edit", "comment", "view"];
const LINK_ROLE_OPTIONS: ProductAccessRole[] = ["comment", "edit", "view"];
const VISIBILITY_OPTIONS = ["anyone", "restricted"] as const;
type Visibility = (typeof VISIBILITY_OPTIONS)[number];
const VISIBILITY_LABEL: Record<Visibility, string> = {
  anyone: "anyone",
  restricted: "제한됨",
};

function splitTokens(raw: string) {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function LetterAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#eceae6] text-[12px] font-medium text-ink"
      style={{ width: size, height: size }}
    >
      {firstSyllable(name)}
    </span>
  );
}

function RoleMenu<T extends string>({
  value,
  options,
  labels,
  open,
  onToggle,
  onSelect,
  boxed,
  up,
  className,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
  boxed?: boolean;
  up?: boolean;
  className?: string;
}) {
  return (
    <div className="relative inline-block w-fit max-w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "inline-flex w-full items-center justify-between gap-1 text-[13px]",
          boxed
            ? "h-9 rounded-lg border border-mist bg-snow px-2.5 text-ink"
            : "text-stone hover:text-ink",
          className,
        )}
      >
        <span className="truncate">{labels[value]}</span>
        <ChevronDown
          size={boxed ? 14 : 13}
          strokeWidth={1.75}
          className={cn("shrink-0 text-stone/70", up && open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 z-40 min-w-full overflow-hidden rounded-lg border border-mist bg-snow py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
            up ? "bottom-[calc(100%+4px)]" : "top-full mt-1",
          )}
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

export function SharePageModal({ productId, onClose }: { productId: string; onClose: () => void }) {
  const {
    currentUserId,
    displayAccount,
    getProduct,
    getUser,
    users,
    inviteToProduct,
    setCollaboratorAccess,
    removeCollaborator,
    setAnyoneAccess,
    ensureShareToken,
  } = useWorkspace();
  const product = getProduct(productId);
  const [draft, setDraft] = useState("");
  const [inviteRole, setInviteRole] = useState<ProductAccessRole>("comment");
  const [menu, setMenu] = useState<string | null>(null);
  const [copied, setCopied] = useState<"field" | "footer" | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState("");
  const shareToken = product?.shareToken || token;
  const shareUrl = shareToken
    ? `${typeof window === "undefined" ? "" : window.location.origin}/share/${shareToken}`
    : "";

  useEffect(() => {
    if (!productId) return;
    const next = ensureShareToken(productId);
    if (next) setToken(next);
  }, [ensureShareToken, productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menu) setMenu(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, onClose]);

  const members = product ? collaboratorsOf(product) : [];
  const takenIds = new Set(members.map((c) => c.userId));
  const visibility: Visibility = (product?.anyoneAccess ?? "view") === "none" ? "restricted" : "anyone";
  const linkRole: ProductAccessRole =
    product?.anyoneAccess && product.anyoneAccess !== "none" ? product.anyoneAccess : "comment";

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    return users
      .filter((u) => !takenIds.has(u.id) && !dismissedIds.includes(u.id))
      .filter((u) => {
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          (u.email?.toLowerCase().includes(q) ?? false) ||
          u.title.toLowerCase().includes(q)
        );
      })
      .slice(0, 3);
  }, [dismissedIds, draft, takenIds, users]);

  if (!product) return null;

  const copyLink = async (from: "field" | "footer") => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(from);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  const submit = () => {
    const tokens = splitTokens(draft);
    if (!tokens.length) return;
    inviteToProduct(product.id, tokens, inviteRole);
    setDraft("");
    setMenu(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-overlay p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="공유"
        className="w-[520px] rounded-2xl bg-snow p-6 shadow-[0_16px_50px_rgba(0,0,0,0.14)]"
        onClick={(e) => {
          e.stopPropagation();
          setMenu(null);
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold tracking-tight">공유</h2>
            <p className="mt-1 truncate text-[12px] text-stone">
              {product.name} · {product.code}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="공유 설정"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone hover:bg-paper hover:text-ink"
            >
              <SlidersHorizontal size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone hover:bg-paper hover:text-ink"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <section className="mt-5">
          <p className="text-[12px] text-stone">사람 추가</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="이메일 주소 입력"
              className="h-9 min-w-0 flex-1 rounded-lg border border-mist px-3 text-[13px] outline-none placeholder:text-stone/60 focus:border-mist"
            />
            <div onClick={(e) => e.stopPropagation()}>
              <RoleMenu
                value={inviteRole}
                options={INVITE_ROLES}
                labels={SHARE_ROLE_LABEL}
                open={menu === "invite-role"}
                onToggle={() => setMenu((m) => (m === "invite-role" ? null : "invite-role"))}
                onSelect={(role) => {
                  setInviteRole(role);
                  setMenu(null);
                }}
                boxed
                className="w-[124px]"
              />
            </div>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={submit}
              className={cn(
                "h-9 shrink-0 rounded-lg px-3.5 text-[13px]",
                draft.trim() ? "bg-ink text-snow" : "cursor-not-allowed bg-[#1a1916] text-snow/40",
              )}
            >
              초대
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-mist">
              {suggestions.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-paper">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      inviteToProduct(product.id, [u.email ?? u.name], inviteRole);
                      setDraft("");
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <LetterAvatar name={u.name} size={30} />
                    <span className="min-w-0">
                      <span className="block text-[13px] text-ink">{u.name}</span>
                      <span className="block truncate text-[11px] text-stone">{u.email ?? u.title}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${u.name} 목록에서 제거`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedIds((ids) => (ids.includes(u.id) ? ids : [...ids, u.id]));
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone hover:bg-mist hover:text-ink"
                  >
                    <X size={14} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {visibility === "restricted" && <section className="mt-5">
          <p className="text-[12px] text-stone">액세스 권한이 있는 사용자</p>
          <div className="mt-1">
            {members.map((c) => {
              const user = getUser(c.userId) ?? userById(c.userId);
              if (!user) return null;
              const isYou = c.userId === currentUserId;
              const name = isYou ? displayAccount.name : user.name;
              const email = isYou ? displayAccount.email : (user.email ?? user.title);
              const role: ProductAccessRole =
                c.access === "owner" || c.userId === product.ownerId ? "owner" : c.access;
              return (
                <div key={c.userId} className="flex items-center gap-2.5 py-2">
                  <LetterAvatar name={name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      {name}
                      {isYou ? " (나)" : ""}
                    </p>
                    <p className="truncate text-[11px] text-stone">{email}</p>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {role === "owner" ? (
                      <span className="text-[13px] text-stone">{SHARE_ROLE_LABEL.owner}</span>
                    ) : (
                      <RoleMenu
                        value={role}
                        options={SHARE_MEMBER_ROLES.filter((r) => r !== "owner")}
                        labels={SHARE_ROLE_LABEL}
                        open={menu === c.userId}
                        onToggle={() => setMenu((m) => (m === c.userId ? null : c.userId))}
                        onSelect={(next) => {
                          setCollaboratorAccess(product.id, c.userId, next);
                          setMenu(null);
                        }}
                      />
                    )}
                    {role !== "owner" && (
                      <button
                        type="button"
                        aria-label={`${name} 제거`}
                        onClick={() => removeCollaborator(product.id, c.userId)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone hover:bg-mist hover:text-ink"
                      >
                        <X size={14} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>}

        <section className="mt-4">
          <p className="text-[12px] text-stone">일반 액세스</p>
          <div className="relative mt-2 overflow-visible rounded-xl border border-mist">
            <div className="flex items-start gap-2.5 px-3 py-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center text-stone">
                <Globe size={18} strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <div onClick={(e) => e.stopPropagation()}>
                  <RoleMenu
                    value={visibility}
                    options={VISIBILITY_OPTIONS}
                    labels={VISIBILITY_LABEL}
                    open={menu === "visibility"}
                    onToggle={() => setMenu((m) => (m === "visibility" ? null : "visibility"))}
                    onSelect={(next) => {
                      setAnyoneAccess(product.id, next === "restricted" ? "none" : linkRole === "comment" || linkRole === "edit" || linkRole === "view" ? (linkRole as LinkAccess) : "comment");
                      setMenu(null);
                    }}
                    boxed
                    className="h-8 w-[132px]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-stone">
                  {visibility === "anyone"
                    ? "링크가 있는 인터넷상의 모든 사용자가 볼 수 있습니다"
                    : "초대받은 사용자만 액세스할 수 있습니다"}
                </p>
              </div>
            </div>
            {visibility === "anyone" && (
              <div className="flex items-center gap-2.5 border-t border-mist px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center text-stone">
                  <UserRound size={18} strokeWidth={1.6} />
                </span>
                <p className="flex-1 text-[13px] text-ink">역할</p>
                <div onClick={(e) => e.stopPropagation()}>
                  <RoleMenu
                    value={linkRole}
                    options={LINK_ROLE_OPTIONS}
                    labels={SHARE_ROLE_LABEL}
                    open={menu === "link-role"}
                    onToggle={() => setMenu((m) => (m === "link-role" ? null : "link-role"))}
                    onSelect={(role) => {
                      setAnyoneAccess(product.id, role as LinkAccess);
                      setMenu(null);
                    }}
                    boxed
                    className="h-8 w-[124px]"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-4">
          <p className="text-[12px] text-stone">공유 링크</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="h-9 min-w-0 flex-1 truncate rounded-lg border border-mist bg-snow px-3 text-[12px] text-ink outline-none"
            />
            <button
              type="button"
              onClick={() => copyLink("field")}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-mist px-2.5 text-[12px] hover:bg-paper"
            >
              <Copy size={13} strokeWidth={1.75} />
              {copied === "field" ? "복사됨" : "복사"}
            </button>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => copyLink("footer")}
            className="inline-flex items-center gap-1.5 text-[13px] text-ink hover:text-stone"
          >
            <Link2 size={14} strokeWidth={1.75} />
            {copied === "footer" ? "복사됨" : "링크 복사"}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open(shareUrl, "_blank", "noreferrer")}
              className="h-9 rounded-lg border border-mist px-3 text-[13px] hover:bg-paper"
            >
              페이지 열기
            </button>
            <button type="button" onClick={onClose} className="h-9 rounded-lg bg-ink px-3.5 text-[13px] text-snow">
              완료
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
