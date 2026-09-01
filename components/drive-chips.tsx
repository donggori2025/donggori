"use client";

import { DRIVE_CHIPS, type DriveChipId } from "@/lib/drive";
import { cn } from "@/lib/utils";

export function DriveChips({
  value,
  onChange,
  chips = DRIVE_CHIPS,
}: {
  value: DriveChipId;
  onChange: (id: DriveChipId) => void;
  chips?: readonly { id: DriveChipId; label: string }[];
}) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
      {chips.map((chip) => {
        const selected = value === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-colors",
              selected ? "bg-ink text-snow" : "bg-snow text-ink",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
