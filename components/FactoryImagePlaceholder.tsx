import Image from "next/image";
import { cn } from "@/lib/utils";

export default function FactoryImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fff7fb] via-white to-[#f3f5f8]",
        className
      )}
      role="img"
      aria-label="동고리 등록 공장"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white bg-white/75 px-6 py-5 shadow-sm backdrop-blur-sm">
        <Image
          src="/logo_donggori.png"
          alt=""
          width={148}
          height={47}
          className="h-auto w-28 opacity-80 sm:w-36"
        />
        <span className="rounded-full bg-[#fff0f7] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#a73370]">
          동고리 등록 공장
        </span>
      </div>
    </div>
  );
}
