"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, ChevronUp, LogOut, Moon, Sun } from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";
import { useWorkspace } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "마이 프로필", href: "/profile" },
  { label: "플랜 및 결제", href: "/dashboard" },
  { label: "서비스 가이드", href: "/library" },
  { label: "관리자 콘솔", href: "/dashboard" },
] as const;

export function UserMenu({ unread = true, collapsed = false }: { unread?: boolean; collapsed?: boolean }) {
  const router = useRouter();
  const { displayAccount } = useWorkspace();
  const { dark, toggle } = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div ref={root} className={cn("relative", collapsed ? "flex justify-center px-1 pt-3 pb-1" : "px-3 pt-4 pb-1")}>
      <div className={cn("flex items-center", collapsed ? "" : "gap-1")}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title={collapsed ? displayAccount.name : undefined}
          className={cn(
            "flex items-center text-left",
            collapsed ? "relative rounded-lg p-0.5" : "min-w-0 flex-1 gap-2 rounded-lg py-1 pr-1",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <ProfileAvatar size={collapsed ? 28 : 32} />
          {collapsed && unread && (
            <span className="absolute top-0.5 right-0.5 h-[7px] w-[7px] rounded-full bg-danger" />
          )}
          {!collapsed && (
            <>
              <span className="truncate text-[14px] font-bold tracking-tight text-ink">
                {displayAccount.name}
              </span>
              {open ? (
                <ChevronUp size={14} className="shrink-0 text-stone/70" strokeWidth={2} />
              ) : (
                <ChevronDown size={14} className="shrink-0 text-stone/70" strokeWidth={2} />
              )}
            </>
          )}
        </button>
        {!collapsed && (
          <button
            type="button"
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
            aria-label="알림"
          >
            <Bell size={16} strokeWidth={1.7} />
            {unread && (
              <span className="absolute top-[7px] right-[7px] h-[7px] w-[7px] rounded-full bg-danger" />
            )}
          </button>
        )}
      </div>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-[248px] overflow-hidden rounded-2xl border border-mist bg-snow shadow-float",
            collapsed ? "top-2 left-full ml-1" : "top-[calc(100%-2px)] left-2",
          )}
        >
          <div className="px-4 py-3.5">
            <p className="text-[14px] font-semibold tracking-tight text-ink">{displayAccount.name}</p>
            <p className="mt-0.5 text-[12px] text-stone">{displayAccount.email}</p>
          </div>

          <div className="border-t border-mist py-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-[13px] text-ink hover:bg-paper"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-mist py-1.5">
            <div className="flex items-center gap-2.5 px-4 py-2">
              {dark ? (
                <Sun size={16} className="shrink-0 text-stone" strokeWidth={1.7} />
              ) : (
                <Moon size={16} className="shrink-0 text-stone" strokeWidth={1.7} />
              )}
              <span className="flex-1 text-[13px] text-ink">다크 모드</span>
              <button
                type="button"
                role="switch"
                aria-checked={dark}
                aria-label="다크 모드"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className={cn(
                  "relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors",
                  dark ? "bg-toggle" : "bg-fog",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                    dark ? "translate-x-[18px]" : "translate-x-[3px]",
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2">
              <KoreaFlag />
              <span className="flex-1 text-[13px] text-ink">언어</span>
              <span className="flex items-center gap-0.5 text-[13px] text-stone">
                한국어
                <ChevronDown size={14} strokeWidth={2} />
              </span>
            </div>
          </div>

          <div className="border-t border-mist py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (window.confirm("로그아웃할까요?")) router.push("/dashboard");
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-danger hover:bg-paper"
            >
              <LogOut size={16} strokeWidth={1.7} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KoreaFlag() {
  return (
    <svg viewBox="0 0 24 16" className="h-3.5 w-[21px] shrink-0 rounded-[2px] ring-1 ring-mist" aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="3.35" fill="#0047A0" />
      <path d="M8.65 8a3.35 3.35 0 0 1 6.7 0A3.35 3.35 0 0 0 12 4.65 3.35 3.35 0 0 0 8.65 8Z" fill="#CD2E3A" />
      <circle cx="12" cy="6.35" r="1.05" fill="#0047A0" />
      <circle cx="12" cy="9.65" r="1.05" fill="#CD2E3A" />
    </svg>
  );
}
