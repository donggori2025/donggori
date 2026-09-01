"use client";

import { useMemo, useState } from "react";
import { Shuffle, X } from "lucide-react";
import {
  BEARD_VARIANTS,
  BG_COLORS,
  CHEEK_VARIANTS,
  DEFAULT_AVATAR,
  EYEBROW_VARIANTS,
  EYE_VARIANTS,
  GLASSES_VARIANTS,
  HAIR_COLORS,
  HAT_COLORS,
  MOUTH_VARIANTS,
  NONE,
  NOSE_VARIANTS,
  OUTFIT_VARIANTS,
  RANDOM,
  SHIRT_COLORS,
  SKIN_COLORS,
  TOP_VARIANTS,
  avatarDataUri,
  randomSeed,
  variantLabel,
  type VoxelAvatarConfig,
} from "@/lib/dicebear-avatar";
import { ProfileAvatar } from "./profile-avatar";

function ColorRow({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value?: string;
  colors: string[];
  onChange: (hex: string | undefined) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-stone">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`h-6 rounded-full px-2 text-[10px] ${!value ? "bg-ink text-snow" : "border border-mist bg-paper text-stone"}`}
        >
          랜덤
        </button>
        {colors.map((hex) => {
          const active = value?.replace("#", "").toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onChange(hex)}
              aria-label={`${label} #${hex}`}
              className={`h-6 w-6 rounded-full border ${active ? "ring-2 ring-ink ring-offset-1 ring-offset-snow" : "border-mist"}`}
              style={{ background: `#${hex}` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PartSelect({
  label,
  value,
  options,
  group,
  allowNone,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly string[];
  group?: string;
  allowNone?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium text-stone">{label}</span>
      <select
        value={value || RANDOM}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-xl border border-mist bg-paper px-3 text-[13px] outline-none"
      >
        <option value={RANDOM}>{variantLabel(RANDOM)}</option>
        {allowNone && <option value={NONE}>{variantLabel(NONE)}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {variantLabel(opt, group)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AvatarMaker({
  initial,
  onClose,
  onApply,
}: {
  initial?: VoxelAvatarConfig;
  onClose: () => void;
  onApply: (config: VoxelAvatarConfig) => void;
}) {
  const [draft, setDraft] = useState<VoxelAvatarConfig>(initial ?? DEFAULT_AVATAR);
  const preview = useMemo(() => avatarDataUri(draft, 256), [draft]);

  function patch(next: Partial<VoxelAvatarConfig>) {
    setDraft((d) => ({ ...d, ...next }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay px-4 py-8" onClick={onClose}>
      <div
        className="flex max-h-[84vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-mist bg-snow shadow-[0_20px_60px_rgba(26,25,22,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-mist px-5 py-3">
          <div>
            <p className="text-[15px] font-semibold tracking-tight">프로필 얼굴 만들기</p>
            <p className="text-[12px] text-stone">DiceBear Voxel Art · CC0 1.0</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-paper"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-auto p-5 sm:grid-cols-[180px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <span className="overflow-hidden rounded-2xl border border-mist bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="미리보기" width={168} height={168} className="h-[168px] w-[168px] object-cover" />
            </span>
            <ProfileAvatar size={40} config={draft} />
            <button
              type="button"
              onClick={() => patch({ seed: randomSeed() })}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-mist px-3 text-[12px] hover:bg-paper"
            >
              <Shuffle size={12} />
              랜덤
            </button>
          </div>

          <div className="space-y-3">
            <PartSelect
              label="머리"
              group="top"
              value={draft.topVariant}
              options={TOP_VARIANTS}
              onChange={(topVariant) => patch({ topVariant })}
            />
            <PartSelect
              label="눈"
              group="eyes"
              value={draft.eyesVariant}
              options={EYE_VARIANTS}
              onChange={(eyesVariant) => patch({ eyesVariant })}
            />
            <PartSelect
              label="눈썹"
              group="eyebrows"
              value={draft.eyebrowsVariant}
              options={EYEBROW_VARIANTS}
              onChange={(eyebrowsVariant) => patch({ eyebrowsVariant })}
            />
            <PartSelect
              label="코"
              group="nose"
              value={draft.noseVariant}
              options={NOSE_VARIANTS}
              onChange={(noseVariant) => patch({ noseVariant })}
            />
            <PartSelect
              label="입"
              group="mouth"
              value={draft.mouthVariant}
              options={MOUTH_VARIANTS}
              onChange={(mouthVariant) => patch({ mouthVariant })}
            />
            <PartSelect
              label="볼"
              group="cheeks"
              value={draft.cheeksVariant}
              options={CHEEK_VARIANTS}
              allowNone
              onChange={(cheeksVariant) => patch({ cheeksVariant })}
            />
            <PartSelect
              label="옷"
              group="outfit"
              value={draft.outfitVariant}
              options={OUTFIT_VARIANTS}
              onChange={(outfitVariant) => patch({ outfitVariant })}
            />
            <PartSelect
              label="안경"
              group="glasses"
              value={draft.glassesVariant}
              options={GLASSES_VARIANTS}
              allowNone
              onChange={(glassesVariant) => patch({ glassesVariant })}
            />
            <PartSelect
              label="수염"
              group="beard"
              value={draft.beardVariant}
              options={BEARD_VARIANTS}
              allowNone
              onChange={(beardVariant) => patch({ beardVariant })}
            />
            <ColorRow
              label="배경"
              value={draft.backgroundColor}
              colors={BG_COLORS}
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
            <ColorRow label="피부" value={draft.skinColor} colors={SKIN_COLORS} onChange={(skinColor) => patch({ skinColor })} />
            <ColorRow label="머리색" value={draft.hairColor} colors={HAIR_COLORS} onChange={(hairColor) => patch({ hairColor })} />
            <ColorRow label="모자색" value={draft.hatColor} colors={HAT_COLORS} onChange={(hatColor) => patch({ hatColor })} />
            <ColorRow label="옷 색" value={draft.shirtColor} colors={SHIRT_COLORS} onChange={(shirtColor) => patch({ shirtColor })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-mist px-5 py-3">
          <button type="button" onClick={onClose} className="h-9 rounded-full px-4 text-[13px] text-stone hover:bg-paper">
            취소
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="h-9 rounded-full bg-ink px-4 text-[13px] text-snow"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
