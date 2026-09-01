"use client";

import { useMemo } from "react";
import { avatarDataUri, DEFAULT_AVATAR, type VoxelAvatarConfig } from "@/lib/dicebear-avatar";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  size = 32,
  config,
  className,
}: {
  size?: number;
  config?: VoxelAvatarConfig;
  className?: string;
}) {
  const { displayAccount } = useWorkspace();
  const avatar = config ?? displayAccount.avatar ?? DEFAULT_AVATAR;
  const src = useMemo(() => avatarDataUri(avatar, Math.max(size, 64)), [avatar, size]);

  return (
    <span
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full bg-paper ring-1 ring-black/5", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} className="h-full w-full object-cover" />
    </span>
  );
}
