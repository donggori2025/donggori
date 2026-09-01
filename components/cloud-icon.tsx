"use client";

import { CiCloudOn } from "react-icons/ci";
import { cn } from "@/lib/utils";

export function CloudIcon({ className }: { className?: string }) {
  return (
    <CiCloudOn
      size={15}
      strokeWidth={0.5}
      className={cn("shrink-0 overflow-visible", className)}
    />
  );
}
