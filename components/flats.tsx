"use client";

import type { ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Part = { id: string; label: string; d: string };

export function partsForCategory(category: ProductCategory): { id: string; label: string }[] {
  const list = category === "pants" || category === "skirt" ? PANTS : HOODIE;
  return list.map(({ id, label }) => ({ id, label }));
}

export function FlatThumb({
  category,
  className,
}: {
  category: ProductCategory;
  className?: string;
}) {
  const isBottoms = category === "pants" || category === "skirt";
  const parts = isBottoms ? PANTS : HOODIE;
  return (
    <svg
      viewBox={isBottoms ? "0 0 240 330" : "0 0 336 330"}
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {parts.map((part) => (
        <path key={part.id} d={part.d} fill="#f7f3ea" stroke="currentColor" strokeWidth="6" />
      ))}
    </svg>
  );
}

const HOODIE: Part[] = [
  { id: "hood", label: "Hood", d: "M118 86c4-46 22-68 50-68s46 22 50 68" },
  { id: "sleeve-l", label: "Left Sleeve", d: "M104 108 L36 142 L28 168 L48 248 L86 236 L108 164 Z" },
  { id: "sleeve-r", label: "Right Sleeve", d: "M232 108 L300 142 L308 168 L288 248 L250 236 L228 164 Z" },
  { id: "body", label: "Body", d: "M104 108 L124 86 L212 86 L232 108 L236 286 L100 286 Z" },
  { id: "pocket", label: "Kangaroo Pocket", d: "M128 188 L208 188 L200 236 L136 236 Z" },
  { id: "rib", label: "Rib Hem", d: "M100 286h136v18H100z" },
];

const HOODIE_GUIDES = [
  "M134 86c10 28 34 32 50 0",
  "M48 248h38",
  "M250 236h38",
];

const PANTS: Part[] = [
  { id: "waist", label: "Waist", d: "M70 24h100l8 18H62z" },
  { id: "body", label: "Body", d: "M62 42h116l-10 70H72z" },
  { id: "leg-l", label: "Left Leg", d: "M72 112 L54 300 L104 300 L114 112" },
  { id: "leg-r", label: "Right Leg", d: "M126 112 L136 300 L186 300 L168 112" },
];

export function SelectableFlat({
  category,
  selected,
  commented,
  hiddenParts,
  onSelect,
}: {
  category: ProductCategory;
  selected: string | null;
  commented?: string[];
  hiddenParts?: string[];
  onSelect: (id: string, label: string) => void;
}) {
  const hidden = new Set(hiddenParts ?? []);
  const parts = (category === "pants" || category === "skirt" ? PANTS : HOODIE).filter((p) => !hidden.has(p.id));
  if (category === "pants" || category === "skirt") {
    return (
      <svg viewBox="0 0 240 330" className="h-[340px] w-[250px]">
        {parts.map((part) => (
          <PartPath key={part.id} part={part} selected={selected} commented={commented} onSelect={onSelect} />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 336 330" className="h-[340px] w-[340px]">
      {parts.map((part) => (
        <PartPath key={part.id} part={part} selected={selected} commented={commented} onSelect={onSelect} />
      ))}
      {HOODIE_GUIDES.map((d) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="1.1" className="pointer-events-none opacity-40" />
      ))}
      {commented?.includes("sleeve-r") && !hidden.has("sleeve-r") && (
        <circle cx="292" cy="176" r="5.5" className="fill-butter stroke-butter-ink" strokeWidth="1.4" />
      )}
      {selected && parts.some((p) => p.id === selected) && (
        <text x="168" y="322" textAnchor="middle" className="fill-stone" fontSize="11">
          {parts.find((p) => p.id === selected)?.label}
        </text>
      )}
    </svg>
  );
}

function PartPath({
  part,
  selected,
  onSelect,
}: {
  part: Part;
  selected: string | null;
  commented?: string[];
  onSelect: (id: string, label: string) => void;
}) {
  const isSel = selected === part.id;
  return (
    <path
      d={part.d}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(part.id, part.label);
      }}
      className={cn(
        "cursor-pointer transition-all",
        isSel ? "fill-lilac/80 stroke-lilac-ink" : "fill-[#f7f3ea] stroke-ink hover:fill-sky/60",
      )}
      strokeWidth={isSel ? 2.1 : 1.45}
    />
  );
}

export function LabelCard() {
  return (
    <div className="flex h-[200px] w-[220px] items-center justify-center">
      <div className="rotate-[-6deg] rounded-sm border border-ink/70 bg-snow px-5 py-4 shadow-sm">
        <p className="serif text-center text-[18px] tracking-wide">ABC</p>
        <p className="mt-1 text-center text-[9px] tracking-[0.2em] text-stone">EST. SEOUL</p>
        <div className="mt-3 h-px bg-ink/30" />
        <p className="mt-2 text-center text-[8px] text-stone">MAIN LABEL · WOVEN</p>
      </div>
    </div>
  );
}

export function Mockup2D({ category }: { category: ProductCategory }) {
  return (
    <div className="relative flex h-[280px] w-[220px] items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-sky/80 to-paper">
      <div className="absolute top-3 left-3 rounded-full bg-snow/80 px-2 py-0.5 text-[9px] tracking-wide text-stone">2D</div>
      <div className="mb-6">
        <div
          className="mx-auto h-40 w-32 rounded-t-[40px] border border-ink/20"
          style={{ background: category === "hoodie" ? "#EDE6D9" : "#F4EFE4" }}
        />
        <div className="mx-auto -mt-2 h-6 w-28 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

export function Mockup3D() {
  return (
    <div className="relative flex h-[280px] w-[220px] items-center justify-center">
      <div className="absolute top-3 left-3 rounded-full bg-snow/80 px-2 py-0.5 text-[9px] tracking-wide text-stone">3D</div>
      <div
        className="relative h-40 w-40"
        style={{ transform: "rotateX(18deg) rotateZ(-18deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 rounded-2xl bg-lilac shadow-lg" />
        <div className="absolute inset-2 rounded-xl border border-white/40 bg-gradient-to-br from-snow/50 to-transparent" />
        <div className="absolute top-8 right-6 left-6 h-16 rounded-t-full border border-ink/20 bg-snow/30" />
      </div>
    </div>
  );
}
