"use client";

import { useMemo } from "react";
import { avatarConfigForSeed, avatarDataUri } from "@/lib/dicebear-avatar";
import { useWorkspace } from "@/lib/store";
import type { ProductCategory, ProductStatus, User } from "@/lib/types";
import { STATUS_META } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, size = "md" }: { status: ProductStatus; size?: "sm" | "md" }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-tight",
        meta.tone,
        meta.ink,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
    >
      {meta.label}
    </span>
  );
}

export function Avatar({ user, size = 28 }: { user?: User; size?: number }) {
  const { currentUserId, displayAccount } = useWorkspace();
  const src = useMemo(() => {
    if (!user) return "";
    const config =
      user.id === currentUserId
        ? displayAccount.avatar
        : avatarConfigForSeed(user.email ?? user.id, user.color);
    return avatarDataUri(config, Math.max(size, 64));
  }, [user, currentUserId, displayAccount.avatar, size]);

  if (!user) return null;
  return (
    <span
      title={`${user.name} · ${user.title}`}
      className="inline-flex shrink-0 overflow-hidden rounded-full bg-paper ring-2 ring-snow"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={user.name} width={size} height={size} className="h-full w-full object-cover" />
    </span>
  );
}

export function AvatarStack({ users, size = 26 }: { users: User[]; size?: number }) {
  return (
    <div className="flex items-center">
      {users.map((u, i) => (
        <span key={u.id} className={cn(i > 0 && "-ml-1.5")}>
          <Avatar user={u} size={size} />
        </span>
      ))}
    </div>
  );
}

export function MiniFlat({ category, className }: { category: ProductCategory; className?: string }) {
  const common = "stroke-ink fill-none";
  if (category === "hoodie") {
    return (
      <svg viewBox="0 0 80 90" className={className}>
        <path className={common} strokeWidth="1.4" d="M28 18c0-8 8-14 12-14s12 6 12 14" />
        <path className={common} strokeWidth="1.4" d="M18 28 L28 20 L52 20 L62 28 L74 36 L68 52 L58 46 L58 78 L22 78 L22 46 L12 52 L6 36 Z" />
        <path className={common} strokeWidth="1.2" d="M30 46h20v16H30z" />
        <path className={common} strokeWidth="1.2" d="M22 78h36" />
      </svg>
    );
  }
  if (category === "tee") {
    return (
      <svg viewBox="0 0 80 90" className={className}>
        <path className={common} strokeWidth="1.4" d="M24 22 L32 16 L48 16 L56 22 L72 30 L66 44 L56 38 L56 78 L24 78 L24 38 L14 44 L8 30 Z" />
        <path className={common} strokeWidth="1.2" d="M32 16c4 6 12 6 16 0" />
      </svg>
    );
  }
  if (category === "pants" || category === "skirt") {
    return (
      <svg viewBox="0 0 80 90" className={className}>
        <path className={common} strokeWidth="1.4" d="M24 14h32l4 8-6 56H46L40 36 34 78H26L20 22Z" />
        {category === "skirt" && <path className={common} strokeWidth="1.2" d="M22 50h36" />}
      </svg>
    );
  }
  if (category === "jacket") {
    return (
      <svg viewBox="0 0 80 90" className={className}>
        <path className={common} strokeWidth="1.4" d="M16 26 L28 16 L52 16 L64 26 L76 34 L70 52 L58 46 L58 80 L22 80 L22 46 L10 52 L4 34 Z" />
        <path className={common} strokeWidth="1.2" d="M40 16v64M28 16c4 10 8 12 12 12s8-2 12-12" />
      </svg>
    );
  }
  if (category === "vest") {
    return (
      <svg viewBox="0 0 80 90" className={className}>
        <path className={common} strokeWidth="1.4" d="M26 18 L32 14 L48 14 L54 18 L58 28 L58 80 L22 80 L22 28 Z" />
        <path className={common} strokeWidth="1.2" d="M32 14c3 14 8 22 8 36M48 14c-3 14-8 22-8 36" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 90" className={className}>
      <path className={common} strokeWidth="1.4" d="M22 22 L32 14 L48 14 L58 22 L70 30 L64 44 L56 38 L56 80 L24 80 L24 38 L16 44 L10 30 Z" />
      <path className={common} strokeWidth="1.2" d="M32 14c4 8 12 8 16 0M40 22v58" />
    </svg>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-[11px] text-stone", className)}>
      {children}
    </span>
  );
}
