import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/faddit-logo.png"
      alt="faddit"
      className={cn("h-[26px] w-auto select-none", className)}
    />
  );
}
