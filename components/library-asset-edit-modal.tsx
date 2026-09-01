"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DRIVE_CHIP_LABEL, assetDriveChip } from "@/lib/drive";
import {
  IMPORT_KIND_LABEL,
  importKindOfAsset,
  materialFromAsset,
  qtyFromAsset,
  sizeSpecFromAsset,
  trimFromAsset,
} from "@/lib/library-import";
import { useWorkspace } from "@/lib/store";
import type { LibraryAsset, MeasurementRow } from "@/lib/types";

export function LibraryAssetEditModal({
  asset,
  onClose,
}: {
  asset: LibraryAsset;
  onClose: () => void;
}) {
  const { updateAsset } = useWorkspace();
  const kind = importKindOfAsset(asset) ?? "fabric";
  const chip = assetDriveChip(asset.kind, asset.name);
  const title = `${DRIVE_CHIP_LABEL[chip] ?? IMPORT_KIND_LABEL[kind]} 수정`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (name: string, meta: string, data: unknown) => {
    if (!name.trim()) return;
    updateAsset(asset.id, { name: name.trim(), meta, data });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-edit-title"
        className="flex max-h-[min(86vh,720px)] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-mist bg-snow text-ink shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="border-b border-mist px-5 py-4">
          <p id="library-edit-title" className="text-[18px] font-semibold tracking-tight">
            {title}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {kind === "fabric" && <FabricFields asset={asset} onSave={save} onClose={onClose} />}
          {kind === "trim" && <TrimFields asset={asset} onSave={save} onClose={onClose} />}
          {kind === "sizespec" && <SizeSpecFields asset={asset} onSave={save} onClose={onClose} />}
          {kind === "qty" && <QtyFields asset={asset} onSave={save} onClose={onClose} />}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-stone">{label}</span>
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
      />
    </label>
  );
}

function Actions({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
        취소
      </button>
      <button type="button" onClick={onSave} className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">
        저장
      </button>
    </div>
  );
}

function FabricFields({
  asset,
  onSave,
  onClose,
}: {
  asset: LibraryAsset;
  onSave: (name: string, meta: string, data: unknown) => void;
  onClose: () => void;
}) {
  const initial = materialFromAsset(asset, asset.id);
  const [name, setName] = useState(initial.name);
  const [composition, setComposition] = useState(initial.composition);
  const [weight, setWeight] = useState(initial.weight);
  const [supplier, setSupplier] = useState(initial.supplier);
  const [position, setPosition] = useState(initial.position ?? "");
  const [consumption, setConsumption] = useState(initial.consumption ?? "");
  const [colorName, setColorName] = useState(initial.colorName ?? "");
  const [memo, setMemo] = useState(initial.memo ?? "");

  return (
    <div className="space-y-3">
      <Field label="원단명" value={name} onChange={setName} />
      <Field label="혼용률" value={composition} onChange={setComposition} placeholder="C80/P20" />
      <Field label="중량" value={weight} onChange={setWeight} placeholder="420g" />
      <Field label="공급처" value={supplier} onChange={setSupplier} />
      <Field label="사용 위치" value={position} onChange={setPosition} />
      <Field label="소요량" value={consumption} onChange={setConsumption} placeholder="1.0 yd" />
      <Field label="컬러" value={colorName} onChange={setColorName} />
      <Field label="메모" value={memo} onChange={setMemo} />
      <Actions
        onClose={onClose}
        onSave={() =>
          onSave(
            name,
            [composition, supplier].filter(Boolean).join(" · ") ||
              [position, consumption, colorName].filter(Boolean).join(" · ") ||
              memo,
            { name, composition, weight, supplier, position, consumption, colorName, memo, color: initial.color },
          )
        }
      />
    </div>
  );
}

function TrimFields({
  asset,
  onSave,
  onClose,
}: {
  asset: LibraryAsset;
  onSave: (name: string, meta: string, data: unknown) => void;
  onClose: () => void;
}) {
  const initial = trimFromAsset(asset, asset.id);
  const [name, setName] = useState(initial.name);
  const [position, setPosition] = useState(initial.position ?? "");
  const [qty, setQty] = useState(initial.qty ?? "");
  const [attach, setAttach] = useState(initial.attach ?? "");
  const [spec, setSpec] = useState(initial.spec);
  const [colorName, setColorName] = useState(initial.color === "#e8e8e8" ? "" : initial.color);
  const [memo, setMemo] = useState(initial.memo ?? "");
  const [status, setStatus] = useState(initial.status ?? "");

  return (
    <div className="space-y-3">
      <Field label="품명" value={name} onChange={setName} />
      <Field label="사용 위치" value={position} onChange={setPosition} />
      <Field label="수량" value={qty} onChange={setQty} />
      <Field label="부착" value={attach} onChange={setAttach} />
      <Field label="스펙" value={spec} onChange={setSpec} />
      <Field label="컬러" value={colorName} onChange={setColorName} />
      <Field label="메모" value={memo} onChange={setMemo} />
      <Field label="상태" value={status} onChange={setStatus} />
      <Actions
        onClose={onClose}
        onSave={() =>
          onSave(name, [attach || initial.type, spec || qty].filter(Boolean).join(" · ") || memo, {
            name,
            type: initial.type,
            spec,
            color: colorName || initial.color,
            position,
            qty,
            attach,
            memo,
            status,
          })
        }
      />
    </div>
  );
}

function SizeSpecFields({
  asset,
  onSave,
  onClose,
}: {
  asset: LibraryAsset;
  onSave: (name: string, meta: string, data: unknown) => void;
  onClose: () => void;
}) {
  const initial = sizeSpecFromAsset(asset);
  const unit =
    typeof (asset.data as { unit?: string } | undefined)?.unit === "string"
      ? (asset.data as { unit: string }).unit
      : "CM";
  const [name, setName] = useState(asset.name);
  const [sizeText, setSizeText] = useState(initial.sizeRange.join(" / "));
  const [rows, setRows] = useState<MeasurementRow[]>(initial.measurements);
  const sizes = useMemo(
    () =>
      sizeText
        .split(/[/,,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [sizeText],
  );

  const patchRow = (index: number, patch: Partial<MeasurementRow>) => {
    setRows((cur) => cur.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className="space-y-3">
      <Field label="이름" value={name} onChange={setName} />
      <Field label="사이즈" value={sizeText} onChange={setSizeText} placeholder="XS / S / M / L" />
      <div>
        <p className="mb-1.5 text-[12px] text-stone">측정 항목 · {unit}</p>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={`${row.pom}-${i}`} className="rounded-2xl bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={row.label}
                  onChange={(e) => patchRow(i, { label: e.target.value })}
                  placeholder="항목명"
                  className="h-9 min-w-0 flex-1 rounded-xl bg-snow px-3 text-[13px] outline-none"
                />
                <button
                  type="button"
                  aria-label={`${row.label || "항목"} 삭제`}
                  onClick={() => setRows((cur) => cur.filter((_, idx) => idx !== i))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-snow hover:text-ink"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((sz) => (
                  <label key={sz} className="block">
                    <span className="mb-1 block text-[10px] text-stone">{sz}</span>
                    <input
                      type="number"
                      value={row.values?.[sz] ?? ""}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        patchRow(i, {
                          values: {
                            ...(row.values ?? {}),
                            [sz]: Number.isFinite(n) ? n : 0,
                          },
                        });
                      }}
                      className="h-8 w-full rounded-lg bg-snow px-2 text-center text-[12px] outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setRows((cur) => [
              ...cur,
              {
                pom: String.fromCharCode(65 + cur.length),
                label: "새 항목",
                values: {},
                grade: 2,
                tolerance: "±5",
              },
            ])
          }
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-mist px-3 py-1.5 text-[12px] text-stone hover:text-ink"
        >
          <Plus size={12} />
          항목 추가
        </button>
      </div>
      <Actions
        onClose={onClose}
        onSave={() =>
          onSave(name, `${sizes.join(" / ")} · ${rows.length}항목 · ${unit}`, {
            sizeRange: sizes,
            measurements: rows,
            unit,
          })
        }
      />
    </div>
  );
}

function QtyFields({
  asset,
  onSave,
  onClose,
}: {
  asset: LibraryAsset;
  onSave: (name: string, meta: string, data: unknown) => void;
  onClose: () => void;
}) {
  const initial = qtyFromAsset(asset);
  const [name, setName] = useState(asset.name);
  const [sizeText, setSizeText] = useState(initial.sizeRange.join(" / "));
  const [colors, setColors] = useState(initial.colorways);
  const sizes = useMemo(
    () =>
      sizeText
        .split(/[/,,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [sizeText],
  );

  return (
    <div className="space-y-3">
      <Field label="이름" value={name} onChange={setName} />
      <Field label="사이즈" value={sizeText} onChange={setSizeText} placeholder="S / M / L / XL" />
      <div>
        <p className="mb-1.5 text-[12px] text-stone">색상별 수량</p>
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={`${c.name}-${i}`} className="rounded-2xl bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) =>
                    setColors((cur) => cur.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))
                  }
                  placeholder="색상명"
                  className="h-9 min-w-0 flex-1 rounded-xl bg-snow px-3 text-[13px] outline-none"
                />
                <input
                  value={c.hex}
                  onChange={(e) =>
                    setColors((cur) => cur.map((row, idx) => (idx === i ? { ...row, hex: e.target.value } : row)))
                  }
                  className="h-9 w-24 rounded-xl bg-snow px-2 text-[12px] outline-none"
                />
                <button
                  type="button"
                  aria-label={`${c.name || "색상"} 삭제`}
                  onClick={() => setColors((cur) => cur.filter((_, idx) => idx !== i))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-snow hover:text-ink"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((sz) => (
                  <label key={sz} className="block">
                    <span className="mb-1 block text-[10px] text-stone">{sz}</span>
                    <input
                      type="number"
                      value={c.qtyBySize?.[sz] ?? 0}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        setColors((cur) =>
                          cur.map((row, idx) =>
                            idx === i
                              ? { ...row, qtyBySize: { ...(row.qtyBySize ?? {}), [sz]: Number.isFinite(n) ? n : 0 } }
                              : row,
                          ),
                        );
                      }}
                      className="h-8 w-full rounded-lg bg-snow px-2 text-center text-[12px] outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setColors((cur) => [
              ...cur,
              { name: "새 색상", main: "새 색상", sub: "", code: "", hex: "#cfcfcf", qtyBySize: {}, memo: "" },
            ])
          }
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-mist px-3 py-1.5 text-[12px] text-stone hover:text-ink"
        >
          <Plus size={12} />
          색상 추가
        </button>
      </div>
      <Actions
        onClose={onClose}
        onSave={() => {
          const total = colors.reduce(
            (sum, c) => sum + Object.values(c.qtyBySize ?? {}).reduce((a, b) => a + b, 0),
            0,
          );
          onSave(name, `${colors.length}색상 · 합계 ${total}`, {
            sizeRange: sizes,
            colorways: colors,
          });
        }}
      />
    </div>
  );
}
