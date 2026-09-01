"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookmarkPlus,
  Calendar,
  ChevronDown,
  File,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { LibraryImportModal } from "@/components/library-import-modal";
import { NotesEditor } from "@/components/notes-editor";
import { SpecsAddChooser } from "@/components/specs-add-chooser";
import { collections, userById } from "@/lib/data";
import {
  materialFromAsset,
  qtyFromAsset,
  sizeSpecFromAsset,
  trimFromAsset,
  type LibraryImportKind,
} from "@/lib/library-import";
import { isImageFile, readFilesAsProductFiles } from "@/lib/product-files";
import { useWorkspace } from "@/lib/store";
import type { Colorway, MeasurementRow, Product, SpecAttribute, SpecIdentity } from "@/lib/types";
import { specTabFill, type SpecTabId } from "@/lib/product-readiness";
import { cn } from "@/lib/utils";
import { MiscBoard } from "@/components/misc-board";

type SpecTab = SpecTabId;

const TABS: { id: SpecTab; label: string }[] = [
  { id: "basic", label: "기본" },
  { id: "fabric", label: "원단·부자재" },
  { id: "size", label: "사이즈·수량" },
  { id: "notes", label: "작업 시 주의사항" },
  { id: "print", label: "인쇄" },
  { id: "misc", label: "기타" },
];

const GUIDES: Partial<Record<SpecTab, string[]>> = {
  basic: ["제품의 이름, 시즌, 아이템 등 기본 식별 정보를 입력하세요."],
  fabric: [
    "제품에 사용되는 메인 원단과 배색 원단을 등록하세요.",
    "지퍼, 단추, 스트링 등 생산에 필요한 부자재를 추가하세요.",
  ],
  size: ["기준 사이즈를 입력하면 사이즈별 스펙을 관리할 수 있습니다."],
  notes: ["공장에서 놓치지 말아야 할 작업 시 주의사항을 적어 주세요."],
  misc: ["A4 페이지에 포장, 케어, 행택 등 기타 정보를 슬라이드처럼 정리하세요."],
  print: ["라벨과 인쇄물 시안을 나눠 업로드하고, 각 파일이 어디에 쓰이는지 적어 주세요."],
};

const DOT_FILLED = "bg-[#7cb98a]";
const DOT_EMPTY = "bg-[#e89a4a]";
const SPECS_COL = "max-w-[1400px] ml-[max(0px,calc((100vw-1400px)/2-1.25rem))]";

const SpecsNav = createContext<{ toTechPack?: () => void }>({});

function TechPackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1 rounded-full bg-ink px-4 text-[13px] font-medium text-snow"
    >
      Tech Pack
      <ArrowUpRight size={14} />
    </button>
  );
}

const ITEM_LABEL: Record<string, string> = {
  hoodie: "Hoodie",
  tee: "T-Shirt",
  pants: "Pants",
  jacket: "Jacket",
  shirt: "Shirt",
  knit: "Knit",
  skirt: "Skirt",
  vest: "Vest",
};

const POM_KO: Record<string, string> = {
  Chest: "가슴단면",
  Length: "총장",
  "Sleeve Width": "소매통",
  Shoulder: "어깨너비",
};

export function SpecsView({
  product,
  onOpenTechPack,
  initialTab,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  onSelectTarget: (t: { id: string; label: string } | null) => void;
  focusSection?: string | null;
  onOpenTechPack: () => void;
  initialTab?: SpecTab | string | null;
}) {
  const tabFromFocus: SpecTab =
    initialTab === "fabric" || initialTab === "material"
      ? "fabric"
      : initialTab === "size" || initialTab === "quantity"
        ? "size"
        : initialTab === "notes"
          ? "notes"
          : initialTab === "misc" || initialTab === "packaging"
            ? "misc"
            : initialTab === "print" || initialTab === "files" || initialTab === "label"
              ? "print"
              : "basic";
  const [tab, setTab] = useState<SpecTab>(tabFromFocus);
  const { workspaces, updateSpecsField } = useWorkspace();
  const ws = workspaces.find((w) => w.id === product.workspaceId);
  const owner = userById(product.ownerId);

  useEffect(() => {
    setTab(tabFromFocus);
  }, [tabFromFocus]);

  const tabLabel = TABS.find((t) => t.id === tab)?.label;
  const tabTitle = tabLabel === "기본" ? "기본 정보" : tabLabel;

  return (
    <SpecsNav.Provider value={{ toTechPack: onOpenTechPack }}>
    <div
      className={cn(
        "relative h-full min-h-0 bg-paper",
        tab === "misc" ? "flex flex-col overflow-hidden" : "canvas-dot overflow-x-hidden overflow-y-auto",
      )}
    >
      <div className="sticky top-0 z-30 h-12 shrink-0 overflow-hidden border-b border-mist bg-paper canvas-dot">
        <div className="flex h-12 w-screen items-center justify-center">
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px]",
                  tab === t.id ? "bg-snow font-medium shadow-sm" : "text-stone hover:bg-snow/60",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    specTabFill(product, t.id) === "empty" ? DOT_EMPTY : DOT_FILLED,
                  )}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-12 right-0 left-0 z-20 px-5 py-6">
        <div className={cn("pointer-events-auto", SPECS_COL)}>
          <div className="flex items-center justify-end gap-2">
            {tab === "basic" && (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-mist bg-snow px-3 text-[12px]"
              >
                <Save size={13} />
                저장
              </button>
            )}
            <TechPackButton onClick={onOpenTechPack} />
          </div>
        </div>
      </div>

      {tab === "misc" ? (
        <div className="flex min-h-0 flex-1 canvas-dot">
          <MiscBoard product={product} />
        </div>
      ) : (
      <div className="px-5 py-6">
        <div className={SPECS_COL}>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-[22px] font-semibold tracking-tight">{tabTitle}</h1>
          </div>

          {GUIDES[tab]?.map((line) => (
            <p key={line} className="mb-1 text-[13px] text-stone">
              {line}
            </p>
          ))}
          <div className={GUIDES[tab] ? "mt-4" : undefined}>
          {tab === "basic" && <BasicTab product={product} brand={ws?.name ?? "내 워크스페이스"} ownerName={owner?.name ?? ""} />}
          {tab === "fabric" && <FabricTab product={product} />}
          {tab === "size" && <SizeTab product={product} />}
          {tab === "notes" && <NotesTab product={product} />}
          {tab === "print" && <PrintTab product={product} />}
          </div>
        </div>
      </div>
      )}
    </div>
    </SpecsNav.Provider>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  const { toTechPack } = useContext(SpecsNav);
  return (
    <section className={cn("relative rounded-[20px] bg-snow p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]", className)}>
      {toTechPack && (
        <button
          type="button"
          onClick={toTechPack}
          aria-label="Tech Pack으로"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md text-stone hover:bg-paper hover:text-ink"
        >
          <ArrowUpRight size={16} />
        </button>
      )}
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[12px] text-stone">{children}</p>;
}

function Input({
  defaultValue,
  placeholder,
  onCommit,
}: {
  defaultValue?: string;
  placeholder?: string;
  onCommit?: (value: string) => void;
}) {
  return (
    <input
      key={defaultValue}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onBlur={(e) => onCommit?.(e.target.value)}
      className="h-10 w-full rounded-xl border border-mist bg-snow px-3 text-[13px] outline-none focus:border-fog"
    />
  );
}

function GhostAdd({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="mt-4 rounded-full border border-mist px-3 py-1.5 text-[12px] text-stone hover:border-fog hover:text-ink">
      + 추가
    </button>
  );
}

const DEFAULT_ATTRS: SpecAttribute[] = [
  { id: "fit", label: "Fit", value: "Crop" },
  { id: "sleeve", label: "Sleeve", value: "Regular" },
  { id: "pocket", label: "Pocket", value: "None" },
];

function seasonOf(product: Product) {
  const col = collections.find((c) => c.id === product.collectionId);
  if (!col) return "2026 SS";
  const code = col.name.replace(/^\d+/, "") || col.season.split(" / ").map((p) => p[0]).join("");
  return `${col.year} ${code}`;
}

function BasicTab({ product, brand, ownerName }: { product: Product; brand: string; ownerName: string }) {
  const { updateSpecsField } = useWorkspace();
  const idn = product.specs.identity ?? {};
  const extras = idn.extras ?? DEFAULT_ATTRS;

  const patchIdentity = (patch: Partial<SpecIdentity>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, identity: { ...p.specs.identity, ...patch } },
    }));

  const patchExtras = (next: (current: SpecAttribute[]) => SpecAttribute[]) =>
    updateSpecsField(product.id, (p) => {
      const current = p.specs.identity?.extras ?? DEFAULT_ATTRS;
      return {
        ...p,
        specs: {
          ...p.specs,
          identity: { ...p.specs.identity, extras: next(current) },
        },
      };
    });

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-5 text-[14px] font-medium">제품 식별</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
          <div>
            <Label>브랜드</Label>
            <Input defaultValue={idn.brand ?? brand} onCommit={(brand) => patchIdentity({ brand })} />
          </div>
          <div>
            <Label>아이템</Label>
            <Input
              defaultValue={idn.item ?? ITEM_LABEL[product.category] ?? product.category}
              onCommit={(item) => patchIdentity({ item })}
            />
          </div>
          <div>
            <Label>성별</Label>
            <div className="relative">
              <select
                value={idn.gender ?? "Unisex"}
                onChange={(e) => patchIdentity({ gender: e.target.value })}
                className="h-10 w-full appearance-none rounded-xl border border-mist bg-snow px-3 pr-10 text-[13px] outline-none"
              >
                <option>Unisex</option>
                <option>Women</option>
                <option>Men</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-stone"
              />
            </div>
          </div>
          <div>
            <Label>스타일 번호</Label>
            <Input
              defaultValue={product.code}
              onCommit={(code) => updateSpecsField(product.id, (p) => ({ ...p, code }))}
            />
          </div>
          <div>
            <Label>품명</Label>
            <Input
              defaultValue={product.name}
              onCommit={(name) => updateSpecsField(product.id, (p) => ({ ...p, name }))}
            />
          </div>
          <div>
            <Label>시즌</Label>
            <Input defaultValue={idn.season ?? seasonOf(product)} onCommit={(season) => patchIdentity({ season })} />
          </div>
          {extras.map((c) => (
            <div key={c.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[12px] text-stone">{c.label}</p>
                <button
                  type="button"
                  onClick={() => patchExtras((list) => list.filter((r) => r.id !== c.id))}
                  className="text-stone hover:text-ink"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <Input
                defaultValue={c.value}
                onCommit={(value) =>
                  patchExtras((list) => {
                    if (!list.some((r) => r.id === c.id)) return list;
                    return list.map((r) => (r.id === c.id ? { ...r, value } : r));
                  })
                }
              />
            </div>
          ))}
        </div>
        <GhostAdd
          onClick={() =>
            patchExtras((list) => [...list, { id: `c-${Date.now()}`, label: "항목", value: "" }])
          }
        />
      </Card>

      <Card>
        <p className="mb-5 text-[14px] font-medium">일정 · 담당</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>샘플 납기</Label>
            <div className="relative">
              <Input
                defaultValue={idn.sampleDue ?? ""}
                placeholder="연도. 월. 일."
                onCommit={(sampleDue) => patchIdentity({ sampleDue })}
              />
              <Calendar size={14} className="pointer-events-none absolute top-3 right-3 text-stone" />
            </div>
          </div>
          <div>
            <Label>생산 납기</Label>
            <div className="relative">
              <Input
                defaultValue={idn.productionDue ?? product.dueDate.replaceAll("-", ". ")}
                placeholder="연도. 월. 일."
                onCommit={(productionDue) =>
                  updateSpecsField(product.id, (p) => ({
                    ...p,
                    dueDate: productionDue.replaceAll(". ", "-").replaceAll(".", "-"),
                    specs: { ...p.specs, identity: { ...p.specs.identity, productionDue } },
                  }))
                }
              />
              <Calendar size={14} className="pointer-events-none absolute top-3 right-3 text-stone" />
            </div>
          </div>
          <div>
            <Label>담당자</Label>
            <Input defaultValue={idn.manager ?? ownerName} onCommit={(manager) => patchIdentity({ manager })} />
          </div>
        </div>
      </Card>
    </div>
  );
}

const NAMED_SWATCH: Record<string, string> = {
  Ecru: "#EDE6D9",
  Nickel: "#9A9A96",
  Ivory: "#F4EFE4",
  Charcoal: "#3A3A38",
  Natural: "#E8E4DC",
};

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function swatchColor(value?: string) {
  if (!value) return "#e8e8e8";
  if (isHexColor(value)) return value.trim();
  return NAMED_SWATCH[value] ?? "#e8e8e8";
}

function colorLabel(color?: string, colorName?: string) {
  if (colorName?.trim()) return colorName;
  if (color && !isHexColor(color)) return color;
  if (color) {
    const named = Object.entries(NAMED_SWATCH).find(([, hex]) => hex.toLowerCase() === color.trim().toLowerCase());
    if (named) return named[0];
  }
  return "—";
}

function CircleThumb({ src, color, label }: { src?: string; color?: string; label: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;
  return (
    <span
      role="img"
      aria-label={label}
      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-mist bg-mist"
    >
      {showImg ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <span className="absolute inset-0" style={{ background: swatchColor(color) }} />
      )}
    </span>
  );
}

function CellInput({
  defaultValue,
  placeholder,
  onCommit,
  className,
}: {
  defaultValue?: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  className?: string;
}) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      onBlur={(e) => onCommit(e.target.value)}
      className={cn("h-9 w-full min-w-0 rounded-lg bg-transparent px-1 text-[13px] outline-none", className)}
    />
  );
}

function SpecRowMenu({
  open,
  ariaLabel,
  onToggle,
  onSave,
  onDelete,
}: {
  open: boolean;
  ariaLabel: string;
  onToggle: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="relative flex items-center justify-end"
      data-spec-row-menu=""
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
      >
        <MoreVertical size={16} strokeWidth={1.7} />
      </button>
      {open && (
        <div
          className="absolute top-8 right-0 z-20 w-[168px] overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onSave}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <BookmarkPlus size={13} />
            </span>
            자산에 저장
          </button>
          <div className="mx-2 my-1 h-px bg-mist" />
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <Trash2 size={13} />
            </span>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

function FabricTab({ product }: { product: Product }) {
  const { updateSpecsField, createAsset } = useWorkspace();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [importKind, setImportKind] = useState<LibraryImportKind | null>(null);
  const s = product.specs;

  const addBlankMaterial = () =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        materials: [
          ...p.specs.materials,
          {
            id: `fab-${Date.now()}`,
            name: "새 원단",
            composition: "",
            weight: "",
            supplier: "",
            color: "#e8e8e8",
            position: "",
            consumption: "",
            colorName: "",
            memo: "",
            status: "",
          },
        ],
      },
    }));

  const addBlankTrim = () =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        trims: [
          ...p.specs.trims,
          {
            id: `tr-${Date.now()}`,
            name: "새 부자재",
            type: "Trim",
            spec: "",
            color: "#e8e8e8",
            position: "",
            qty: "",
            attach: "",
            memo: "",
            status: "",
          },
        ],
      },
    }));

  const patchMaterial = (id: string, patch: Record<string, string>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        materials: p.specs.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    }));

  const patchTrim = (id: string, patch: Record<string, string>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        trims: p.specs.trims.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      },
    }));

  const saveAsset = (key: string, kind: string, name: string, meta: string) => {
    createAsset({ group: "production", kind, name, meta });
    setSavedId(key);
    setMenuId(null);
    window.setTimeout(() => setSavedId(null), 1600);
  };

  useEffect(() => {
    if (!menuId) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-spec-row-menu]")) return;
      setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuId]);

  return (
    <div className="space-y-4">
      <Card className="min-h-[220px] overflow-visible">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-medium">원단</p>
          <div className="flex items-center gap-2">
            {savedId?.startsWith("material:") && (
              <p className="text-[11px] text-stone">Library에 저장됨</p>
            )}
            <SpecsAddChooser
              onAdd={addBlankMaterial}
              onImport={() => setImportKind("fabric")}
              className="rounded-full border border-mist px-3 py-1.5 text-[12px]"
            />
          </div>
        </div>
        {s.materials.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-stone/40">원단을 추가하세요.</p>
        ) : (
          <div className="overflow-visible">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-mist text-[12px] text-stone">
                  <th className="pb-3 pr-3 font-medium">원단명</th>
                  <th className="pb-3 pr-3 font-medium">사용 위치</th>
                  <th className="pb-3 pr-3 font-medium">소요량</th>
                  <th className="pb-3 pr-3 font-medium">컬러</th>
                  <th className="pb-3 pr-3 font-medium">메모</th>
                  <th className="pb-3 pr-3 font-medium">상태</th>
                  <th className="w-10 pb-3" />
                </tr>
              </thead>
              <tbody>
                {s.materials.map((m) => {
                  const key = `material:${m.id}`;
                  return (
                    <tr key={m.id} className="border-b border-mist last:border-0">
                      <td className="py-3 pr-3">
                        <span className="flex items-center gap-3">
                          <CircleThumb src={m.image} color={m.color} label={`${m.name} 썸네일`} />
                          <CellInput defaultValue={m.name} onCommit={(name) => patchMaterial(m.id, { name })} />
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={m.position || "추가 부위"}
                          onCommit={(position) => patchMaterial(m.id, { position })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={m.consumption || "1.0 yd"}
                          onCommit={(consumption) => patchMaterial(m.id, { consumption })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={colorLabel(m.color, m.colorName)}
                          onCommit={(colorName) => patchMaterial(m.id, { colorName })}
                        />
                      </td>
                      <td className="py-3 pr-3 text-stone">
                        <CellInput
                          defaultValue={m.memo || "—"}
                          placeholder="—"
                          onCommit={(memo) => patchMaterial(m.id, { memo })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput defaultValue={m.status || ""} onCommit={(status) => patchMaterial(m.id, { status })} />
                      </td>
                      <td className="py-3">
                        <SpecRowMenu
                          open={menuId === key}
                          ariaLabel={`${m.name} 메뉴`}
                          onToggle={() => setMenuId((id) => (id === key ? null : key))}
                          onSave={() =>
                            saveAsset(
                              key,
                              "원단",
                              m.name,
                              [m.position, m.consumption, colorLabel(m.color, m.colorName)]
                                .filter((v) => v && v !== "—")
                                .join(" · ") || m.composition,
                            )
                          }
                          onDelete={() => {
                            updateSpecsField(product.id, (p) => ({
                              ...p,
                              specs: {
                                ...p.specs,
                                materials: p.specs.materials.filter((row) => row.id !== m.id),
                              },
                            }));
                            setMenuId(null);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="min-h-[220px] overflow-visible">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-medium">부자재</p>
          <div className="flex items-center gap-2">
            {savedId?.startsWith("trim:") && (
              <p className="text-[11px] text-stone">Library에 저장됨</p>
            )}
            <SpecsAddChooser
              onAdd={addBlankTrim}
              onImport={() => setImportKind("trim")}
              className="rounded-full border border-mist px-3 py-1.5 text-[12px]"
            />
          </div>
        </div>
        {s.trims.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-stone/40">부자재를 추가하세요.</p>
        ) : (
          <div className="overflow-visible">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-mist text-[12px] text-stone">
                  <th className="pb-3 pr-3 font-medium">품명</th>
                  <th className="pb-3 pr-3 font-medium">사용 위치</th>
                  <th className="pb-3 pr-3 font-medium">수량</th>
                  <th className="pb-3 pr-3 font-medium">부착</th>
                  <th className="pb-3 pr-3 font-medium">메모</th>
                  <th className="pb-3 pr-3 font-medium">상태</th>
                  <th className="w-10 pb-3" />
                </tr>
              </thead>
              <tbody>
                {s.trims.map((t) => {
                  const key = `trim:${t.id}`;
                  return (
                    <tr key={t.id} className="border-b border-mist last:border-0">
                      <td className="py-3 pr-3">
                        <span className="flex items-center gap-3">
                          <CircleThumb src={t.image} color={t.color} label={`${t.name} 썸네일`} />
                          <CellInput defaultValue={t.name} onCommit={(name) => patchTrim(t.id, { name })} />
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={t.position || "소매단 / 밑단"}
                          onCommit={(position) => patchTrim(t.id, { position })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={t.qty || t.spec || "1 cone / 50pcs"}
                          onCommit={(qty) => patchTrim(t.id, { qty })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput
                          defaultValue={t.attach || t.type || "Coverstitch"}
                          onCommit={(attach) => patchTrim(t.id, { attach })}
                        />
                      </td>
                      <td className="py-3 pr-3 text-stone">
                        <CellInput
                          defaultValue={t.memo || "—"}
                          placeholder="—"
                          onCommit={(memo) => patchTrim(t.id, { memo })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <CellInput defaultValue={t.status || ""} onCommit={(status) => patchTrim(t.id, { status })} />
                      </td>
                      <td className="py-3">
                        <SpecRowMenu
                          open={menuId === key}
                          ariaLabel={`${t.name} 메뉴`}
                          onToggle={() => setMenuId((id) => (id === key ? null : key))}
                          onSave={() =>
                            saveAsset(
                              key,
                              "부자재",
                              t.name,
                              [t.position, t.qty || t.spec, t.attach || t.type].filter(Boolean).join(" · "),
                            )
                          }
                          onDelete={() => {
                            updateSpecsField(product.id, (p) => ({
                              ...p,
                              specs: {
                                ...p.specs,
                                trims: p.specs.trims.filter((row) => row.id !== t.id),
                              },
                            }));
                            setMenuId(null);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {importKind && (
        <LibraryImportModal
          kind={importKind}
          onClose={() => setImportKind(null)}
          onImport={(assets) => {
            const stamp = Date.now();
            if (importKind === "fabric") {
              updateSpecsField(product.id, (p) => ({
                ...p,
                specs: {
                  ...p.specs,
                  materials: [
                    ...p.specs.materials,
                    ...assets.map((a, i) => materialFromAsset(a, `fab-${stamp}-${i}`)),
                  ],
                },
              }));
            } else if (importKind === "trim") {
              updateSpecsField(product.id, (p) => ({
                ...p,
                specs: {
                  ...p.specs,
                  trims: [...p.specs.trims, ...assets.map((a, i) => trimFromAsset(a, `tr-${stamp}-${i}`))],
                },
              }));
            }
            setImportKind(null);
          }}
        />
      )}
    </div>
  );
}

const CM_PER_INCH = 2.54;
const SIZE_SEQ = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const COLOR_PALETTE = ["#EDE6D9", "#3A3A38", "#C4A57B", "#8B9A7D", "#6B7C8F", "#cfcfcf"];

function productSizes(product: Product): string[] {
  return product.specs.sizeRange.length ? product.specs.sizeRange : ["S", "M", "L", "XL"];
}

function nextSizeLabel(current: string[]): string {
  const found = SIZE_SEQ.find((s) => !current.includes(s));
  if (found) return found;
  let i = 1;
  while (current.includes(`Size ${i}`)) i += 1;
  return `Size ${i}`;
}

function nextPomCode(used: Set<string>): string {
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i);
    if (!used.has(c)) return c;
  }
  let n = 1;
  while (used.has(`P${n}`)) n += 1;
  return `P${n}`;
}

function pickBaseSize(sizes: string[]): string {
  if (sizes.includes("M")) return "M";
  if (!sizes.length) return "";
  return sizes[Math.floor((sizes.length - 1) / 2)];
}

function legacyKey(size: string): "xs" | "s" | "m" | "l" | "xl" | null {
  const k = size.toLowerCase();
  if (k === "xs" || k === "s" || k === "m" || k === "l" || k === "xl") return k;
  return null;
}

function parseLegacyCm(raw: string | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return n > 200 ? n / 10 : n;
}

function rowValuesCm(row: MeasurementRow, sizes: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const sz of sizes) {
    if (row.values && Number.isFinite(row.values[sz])) {
      out[sz] = row.values[sz];
      continue;
    }
    const key = legacyKey(sz);
    const parsed = key ? parseLegacyCm(row[key]) : undefined;
    if (parsed != null) out[sz] = parsed;
  }
  return out;
}

function rowGrade(row: MeasurementRow): number {
  if (row.grade != null && Number.isFinite(row.grade)) return row.grade;
  return 2;
}

function formatCm(cm: number): string {
  const r = Math.round(cm * 10) / 10;
  return Number.isInteger(r) ? String(r) : String(r);
}

function formatMeasure(cm: number | undefined, unit: "CM" | "INCH"): string {
  if (cm == null || !Number.isFinite(cm)) return "";
  return unit === "INCH" ? (cm / CM_PER_INCH).toFixed(2) : formatCm(cm);
}

function parseToCm(text: string, unit: "CM" | "INCH"): number | undefined {
  const n = Number(text.replace(",", ".").trim());
  if (!Number.isFinite(n)) return undefined;
  return unit === "INCH" ? n * CM_PER_INCH : n;
}

function syncLegacy(row: MeasurementRow, values: Record<string, number>): MeasurementRow {
  const str = (sz: string) => (values[sz] != null ? formatCm(values[sz]) : "");
  return { ...row, values, xs: str("XS"), s: str("S"), m: str("M"), l: str("L"), xl: str("XL") };
}

function summedQuantity(colorways: Colorway[], sizes: string[]) {
  return sizes.map((size) => ({
    size,
    qty: colorways.reduce((sum, c) => sum + (c.qtyBySize?.[size] ?? 0), 0),
  }));
}

function hydrateColorways(product: Product, sizes: string[]): Colorway[] {
  return product.specs.colorways.map((c, i) => {
    if (c.qtyBySize) return c;
    const qtyBySize: Record<string, number> = {};
    for (const sz of sizes) {
      qtyBySize[sz] = i === 0 ? (product.specs.quantity.find((q) => q.size === sz)?.qty ?? 0) : 0;
    }
    return { ...c, qtyBySize, memo: c.memo ?? "" };
  });
}

function withSizeRange(product: Product, sizeRange: string[], colorways: Colorway[]): Product {
  return {
    ...product,
    specs: {
      ...product.specs,
      sizeRange,
      colorways,
      quantity: summedQuantity(colorways, sizeRange),
    },
  };
}

function mergeSizes(product: Product, extra: string[]): Product {
  const current = productSizes(product);
  let colorways = hydrateColorways(product, current);
  const toAdd = extra.filter((s) => !current.includes(s));
  if (!toAdd.length) return withSizeRange(product, current, colorways);
  const sizeRange = [...current, ...toAdd];
  colorways = colorways.map((c) => {
    const qtyBySize = { ...(c.qtyBySize ?? {}) };
    for (const sz of toAdd) {
      if (qtyBySize[sz] == null) qtyBySize[sz] = 0;
    }
    return { ...c, qtyBySize };
  });
  return withSizeRange(product, sizeRange, colorways);
}

function appendSizeColumn(product: Product): Product {
  return mergeSizes(product, [nextSizeLabel(productSizes(product))]);
}

function renameSizeColumn(product: Product, from: string, to: string): Product {
  const next = to.trim();
  if (!next || next === from) return product;
  const current = productSizes(product);
  if (!current.includes(from) || current.includes(next)) return product;
  const sizeRange = current.map((s) => (s === from ? next : s));
  const colorways = hydrateColorways(product, current).map((c) => {
    const qtyBySize = { ...(c.qtyBySize ?? {}) };
    if (qtyBySize[from] != null) {
      qtyBySize[next] = qtyBySize[from];
      delete qtyBySize[from];
    }
    return { ...c, qtyBySize };
  });
  const patched = withSizeRange(product, sizeRange, colorways);
  return {
    ...patched,
    specs: {
      ...patched.specs,
      measurements: product.specs.measurements.map((row) => {
        const values = rowValuesCm(row, current);
        if (values[from] != null) {
          values[next] = values[from];
          delete values[from];
        }
        return syncLegacy(row, values);
      }),
    },
  };
}

function appendMeasurementRow(product: Product, label = "측정 항목"): Product {
  const used = new Set(product.specs.measurements.map((r) => r.pom));
  const pom = nextPomCode(used);
  return {
    ...product,
    specs: {
      ...product.specs,
      measurements: [...product.specs.measurements, { pom, label, values: {}, grade: 2, tolerance: "±5" }],
    },
  };
}

function appendColorRow(product: Product): Product {
  const current = productSizes(product);
  const qtyBySize: Record<string, number> = {};
  for (const sz of current) qtyBySize[sz] = 0;
  const hex = COLOR_PALETTE[product.specs.colorways.length % COLOR_PALETTE.length];
  const colorways = [
    ...hydrateColorways(product, current),
    {
      id: `cw-${Date.now()}`,
      name: "새 색상",
      main: "새 색상",
      sub: "",
      code: "",
      hex,
      qtyBySize,
      memo: "",
    },
  ];
  return withSizeRange(product, current, colorways);
}

function GridAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-mist bg-paper text-stone hover:border-ink hover:text-ink"
    >
      <Plus size={14} strokeWidth={2} />
    </button>
  );
}

function MeasureInput({
  cm,
  unit,
  onCommit,
}: {
  cm: number | undefined;
  unit: "CM" | "INCH";
  onCommit: (cm: number | undefined) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const display = formatMeasure(cm, unit);
  return (
    <input
      value={focused ? draft : display}
      onFocus={() => {
        setFocused(true);
        setDraft(display);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        if (draft.trim() === "") {
          onCommit(undefined);
          return;
        }
        const parsed = parseToCm(draft, unit);
        if (parsed == null) return;
        onCommit(parsed);
      }}
      className="h-8 w-full rounded-lg border border-mist bg-snow px-2 text-center outline-none"
    />
  );
}

function SaveAssetNameModal({
  defaultName,
  onClose,
  onSave,
}: {
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={onClose}>
      <form
        className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSave(name.trim());
        }}
      >
        <p className="text-[18px] font-semibold tracking-tight">자산에 저장</p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[12px] text-stone">이름</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="이름"
            className="h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
            취소
          </button>
          <button type="submit" className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

function SizeHeaderPill({
  size,
  taken,
  isBase,
  unit,
  onRename,
  onRemove,
}: {
  size: string;
  taken: string[];
  isBase: boolean;
  unit: "CM" | "INCH";
  onRename: (next: string) => void;
  onRemove: () => void;
}) {
  return (
    <th className={cn("relative px-2.5 pb-3 text-center font-medium", isBase && "bg-paper")}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
          isBase ? "border border-mist/80 bg-snow" : "border border-mist bg-snow",
        )}
      >
        <input
          key={size}
          defaultValue={size}
          aria-label={`${size} 사이즈명`}
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (!next || next === size || taken.includes(next)) {
              e.target.value = size;
              return;
            }
            onRename(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-8 bg-transparent text-center outline-none"
        />
        <button
          type="button"
          aria-label={`${size} 사이즈 삭제`}
          onClick={onRemove}
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] text-stone/40 hover:bg-mist hover:text-ink"
        >
          <X size={9} strokeWidth={2.5} />
        </button>
      </span>
      <p className="mt-1 text-[10px] font-normal">{isBase ? `기준 · ${unit.toLowerCase()}` : unit.toLowerCase()}</p>
    </th>
  );
}

function sizeCol(isBase: boolean, extra?: string) {
  return cn("px-2.5 py-2 text-center align-middle", isBase && "bg-paper", extra);
}

function SizeTab({ product }: { product: Product }) {
  const { updateSpecsField, createAsset } = useWorkspace();
  const [unit, setUnit] = useState<"CM" | "INCH">("CM");
  const [saveModal, setSaveModal] = useState<null | "size" | "qty">(null);
  const [savedKind, setSavedKind] = useState<null | "size" | "qty">(null);
  const [importKind, setImportKind] = useState<null | "sizespec" | "qty">(null);
  const sizes = productSizes(product);
  const baseSize = pickBaseSize(sizes);
  const rows = product.specs.measurements;
  const colors = hydrateColorways(product, sizes);

  const patch = (updater: (p: Product) => Product) => updateSpecsField(product.id, updater);

  const addSize = () => patch(appendSizeColumn);
  const addMeasurement = () => patch(appendMeasurementRow);
  const addColor = () => patch(appendColorRow);
  const addSizeSpecBoth = () => patch((p) => appendSizeColumn(appendMeasurementRow(p)));
  const addQtyBoth = () => patch((p) => appendSizeColumn(appendColorRow(p)));

  const removeSize = (size: string) =>
    patch((p) => {
      const current = productSizes(p);
      if (current.length <= 1) return p;
      const sizeRange = current.filter((s) => s !== size);
      const colorways = hydrateColorways(p, current).map((c) => {
        const qtyBySize = { ...(c.qtyBySize ?? {}) };
        delete qtyBySize[size];
        return { ...c, qtyBySize };
      });
      const next = withSizeRange(p, sizeRange, colorways);
      return {
        ...next,
        specs: {
          ...next.specs,
          measurements: p.specs.measurements.map((row) => {
            const values = rowValuesCm(row, current);
            delete values[size];
            return syncLegacy(row, values);
          }),
        },
      };
    });

  const setCellCm = (pom: string, size: string, cm: number | undefined) =>
    patch((p) => {
      const current = productSizes(p);
      return {
        ...p,
        specs: {
          ...p.specs,
          measurements: p.specs.measurements.map((row) => {
            if (row.pom !== pom) return row;
            const values = rowValuesCm(row, current);
            if (cm == null) delete values[size];
            else values[size] = cm;
            return syncLegacy(row, values);
          }),
        },
      };
    });

  const autoGrade = () =>
    patch((p) => {
      const current = productSizes(p);
      const mIndex = current.indexOf(pickBaseSize(current));
      if (mIndex < 0) return p;
      return {
        ...p,
        specs: {
          ...p.specs,
          measurements: p.specs.measurements.map((row) => {
            const values = rowValuesCm(row, current);
            const base = values[current[mIndex]];
            if (base == null || !Number.isFinite(base)) return row;
            const next = { ...values };
            current.forEach((sz, i) => {
              next[sz] = base + (i - mIndex) * rowGrade(row);
            });
            return syncLegacy(row, next);
          }),
        },
      };
    });

  const setGrade = (pom: string, grade: number) =>
    patch((p) => ({
      ...p,
      specs: {
        ...p.specs,
        measurements: p.specs.measurements.map((row) => (row.pom === pom ? { ...row, grade } : row)),
      },
    }));

  const setQty = (colorId: string, size: string, qty: number) =>
    patch((p) => {
      const current = productSizes(p);
      const colorways = hydrateColorways(p, current).map((c) =>
        c.id === colorId ? { ...c, qtyBySize: { ...(c.qtyBySize ?? {}), [size]: qty } } : c,
      );
      return withSizeRange(p, current, colorways);
    });

  const colTotals = sizes.map((sz) => colors.reduce((sum, c) => sum + (c.qtyBySize?.[sz] ?? 0), 0));
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);

  const markSaved = (kind: "size" | "qty") => {
    setSavedKind(kind);
    setSaveModal(null);
    window.setTimeout(() => setSavedKind((cur) => (cur === kind ? null : cur)), 1600);
  };

  const saveSizeSpec = (name: string) => {
    const measurements = (rows.length ? rows : [{ pom: "A", label: "총장", values: {}, grade: 2, tolerance: "" }]).map((row) => ({
      pom: row.pom,
      label: row.label,
      values: rowValuesCm(row, sizes),
      grade: rowGrade(row),
      tolerance: row.tolerance,
    }));
    createAsset({
      group: "production",
      kind: "사이즈스펙",
      name,
      meta: `${sizes.join(" / ")} · ${measurements.length}항목 · ${unit}`,
      data: { sizeRange: sizes, measurements, unit },
    });
    markSaved("size");
  };

  const saveQty = (name: string) => {
    createAsset({
      group: "production",
      kind: "수량",
      name,
      meta: `${colors.length}색상 · 합계 ${grandTotal}`,
      data: {
        sizeRange: sizes,
        colorways: colors.map((c) => ({
          id: c.id,
          name: c.name,
          hex: c.hex,
          qtyBySize: c.qtyBySize ?? {},
          memo: c.memo ?? "",
        })),
      },
    });
    markSaved("qty");
  };

  return (
    <div className="space-y-4">
      {saveModal === "size" && (
        <SaveAssetNameModal
          defaultName={`${product.name} 사이즈 스펙`}
          onClose={() => setSaveModal(null)}
          onSave={saveSizeSpec}
        />
      )}
      {saveModal === "qty" && (
        <SaveAssetNameModal
          defaultName={`${product.name} 색상별 수량`}
          onClose={() => setSaveModal(null)}
          onSave={saveQty}
        />
      )}
      {importKind && (
        <LibraryImportModal
          kind={importKind}
          onClose={() => setImportKind(null)}
          onImport={(assets) => {
            const stamp = Date.now();
            if (importKind === "sizespec") {
              patch((p) => {
                let next = p;
                for (const asset of assets) {
                  const spec = sizeSpecFromAsset(asset);
                  next = mergeSizes(next, spec.sizeRange);
                  const used = new Set(next.specs.measurements.map((r) => r.pom));
                  const imported = spec.measurements.map((row) => {
                    let pom = row.pom;
                    if (!pom || used.has(pom)) pom = nextPomCode(used);
                    used.add(pom);
                    return syncLegacy({ ...row, pom }, row.values ?? {});
                  });
                  next = {
                    ...next,
                    specs: { ...next.specs, measurements: [...next.specs.measurements, ...imported] },
                  };
                }
                return next;
              });
            } else {
              patch((p) => {
                let next = p;
                assets.forEach((asset, ai) => {
                  const spec = qtyFromAsset(asset);
                  next = mergeSizes(next, spec.sizeRange);
                  const current = productSizes(next);
                  const extras: Colorway[] = spec.colorways.map((c, i) => {
                    const qtyBySize: Record<string, number> = {};
                    for (const sz of current) qtyBySize[sz] = c.qtyBySize?.[sz] ?? 0;
                    return {
                      ...c,
                      id: `cw-imp-${stamp}-${ai}-${i}`,
                      qtyBySize,
                    };
                  });
                  next = withSizeRange(next, current, [...hydrateColorways(next, current), ...extras]);
                });
                return next;
              });
            }
            setImportKind(null);
          }}
        />
      )}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-medium">사이즈 스펙</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex rounded-full bg-paper p-0.5">
              {(["CM", "INCH"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={cn("rounded-full px-3 py-1 text-[11px]", unit === u ? "bg-snow shadow-sm" : "text-stone")}
                >
                  {u}
                </button>
              ))}
            </div>
            <button type="button" onClick={autoGrade} className="inline-flex items-center gap-1 rounded-full border border-mist px-3 py-1.5 text-[12px]">
              <WandSparkles size={12} />
              자동 그레이딩
            </button>
            {savedKind === "size" && <p className="text-[11px] text-stone">Library에 저장됨</p>}
            <button
              type="button"
              onClick={() => setSaveModal("size")}
              className="inline-flex items-center gap-1 rounded-full border border-mist px-3 py-1.5 text-[12px]"
            >
              <BookmarkPlus size={12} />
              자산에 저장
            </button>
            <SpecsAddChooser
              onAdd={addSizeSpecBoth}
              onImport={() => setImportKind("sizespec")}
              className="rounded-full border border-mist px-3 py-1.5 text-[12px]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[12px]">
            <thead>
              <tr className="text-stone">
                <th className="px-2 pb-3 font-medium">코드</th>
                <th className="px-2 pb-3 font-medium">측정 항목</th>
                <th className="px-2 pb-3 text-center font-medium">편차</th>
                {sizes.map((sz) => (
                  <SizeHeaderPill
                    key={sz}
                    size={sz}
                    taken={sizes}
                    isBase={sz === baseSize}
                    unit={unit}
                    onRename={(next) => patch((p) => renameSizeColumn(p, sz, next))}
                    onRemove={() => removeSize(sz)}
                  />
                ))}
                <th className="w-10 px-1 pb-3 font-medium">
                  <GridAddButton label="사이즈 추가" onClick={addSize} />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = rowValuesCm(row, sizes);
                return (
                  <tr key={row.pom} className="border-t border-mist">
                    <td className="border-t border-mist px-2 py-2 pr-3">{row.pom}</td>
                    <td className="border-t border-mist px-2 py-2 pr-3">
                      <input
                        defaultValue={POM_KO[row.label] ?? row.label}
                        onBlur={(e) => {
                          const label = e.target.value.trim() || row.label;
                          patch((p) => ({
                            ...p,
                            specs: {
                              ...p.specs,
                              measurements: p.specs.measurements.map((r) => (r.pom === row.pom ? { ...r, label } : r)),
                            },
                          }));
                        }}
                        className="h-8 w-full min-w-[88px] rounded-lg px-1 outline-none"
                      />
                    </td>
                    <td className="border-t border-mist px-2 py-2">
                      <span className="inline-flex h-8 w-[72px] items-center rounded-lg border border-mist bg-snow px-1.5">
                        <span className="shrink-0 text-stone">+</span>
                        <input
                          inputMode="decimal"
                          defaultValue={String(rowGrade(row))}
                          onBlur={(e) => {
                            const n = Number(e.target.value.replace(",", ".").trim());
                            if (!Number.isFinite(n)) {
                              e.currentTarget.value = String(rowGrade(row));
                              return;
                            }
                            setGrade(row.pom, n);
                            e.currentTarget.value = String(n);
                          }}
                          className="h-full w-full min-w-0 bg-transparent text-center outline-none"
                          aria-label={`${row.pom} 편차`}
                        />
                      </span>
                    </td>
                    {sizes.map((sz) => (
                      <td key={sz} className={cn("border-t border-mist", sizeCol(sz === baseSize))}>
                        <MeasureInput
                          cm={values[sz]}
                          unit={unit}
                          onCommit={(cm) => setCellCm(row.pom, sz, cm)}
                        />
                      </td>
                    ))}
                    <td className="w-10 border-t border-mist px-1" />
                  </tr>
                );
              })}
              <tr>
                <td className="border-t border-mist px-2 py-2 pr-3">
                  <GridAddButton label="측정 항목 추가" onClick={addMeasurement} />
                </td>
                <td className="border-t border-mist" />
                <td className="border-t border-mist" />
                {sizes.map((sz) => (
                  <td key={sz} className={cn("border-t border-mist", sizeCol(sz === baseSize))} />
                ))}
                <td className="w-10 border-t border-mist px-1" />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-medium">색상별 수량</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {savedKind === "qty" && <p className="text-[11px] text-stone">Library에 저장됨</p>}
            <button
              type="button"
              onClick={() => setSaveModal("qty")}
              className="inline-flex items-center gap-1 rounded-full border border-mist px-3 py-1.5 text-[12px]"
            >
              <BookmarkPlus size={12} />
              자산에 저장
            </button>
            <SpecsAddChooser
              onAdd={addQtyBoth}
              onImport={() => setImportKind("qty")}
              className="rounded-full border border-mist px-3 py-1.5 text-[12px]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[12px]">
            <thead>
              <tr className="text-stone">
                <th className="px-2 pb-3 font-medium">색상</th>
                {sizes.map((sz) => (
                  <th key={sz} className="px-2.5 pb-3 text-center font-medium">
                    <span className="inline-flex items-center gap-1 rounded-full border border-mist bg-snow px-2 py-0.5">
                      <input
                        key={sz}
                        defaultValue={sz}
                        aria-label={`${sz} 사이즈명`}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (!next || next === sz || sizes.includes(next)) {
                            e.target.value = sz;
                            return;
                          }
                          patch((p) => renameSizeColumn(p, sz, next));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-8 bg-transparent text-center outline-none"
                      />
                      <button
                        type="button"
                        aria-label={`${sz} 사이즈 삭제`}
                        onClick={() => removeSize(sz)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-stone/40 hover:bg-mist hover:text-ink"
                      >
                        <X size={9} strokeWidth={2.5} />
                      </button>
                    </span>
                  </th>
                ))}
                <th className="w-10 px-1 pb-3 font-medium">
                  <GridAddButton label="사이즈 추가" onClick={addSize} />
                </th>
                <th className="px-2 pb-3 text-center font-medium">합계</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => {
                const rowTotal = sizes.reduce((sum, sz) => sum + (c.qtyBySize?.[sz] ?? 0), 0);
                return (
                  <tr key={c.id}>
                    <td className="border-t border-mist px-2 py-3 pr-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-mist" style={{ background: c.hex }} />
                        <input
                          defaultValue={c.name}
                          onBlur={(e) => {
                            const name = e.target.value.trim() || c.name;
                            patch((p) => ({
                              ...p,
                              specs: {
                                ...p.specs,
                                colorways: p.specs.colorways.map((cw) => (cw.id === c.id ? { ...cw, name, main: name } : cw)),
                              },
                            }));
                          }}
                          className="h-8 w-24 rounded-lg px-1 outline-none"
                        />
                      </span>
                    </td>
                    {sizes.map((sz) => (
                      <td key={sz} className="border-t border-mist px-2.5 py-2">
                        <input
                          inputMode="numeric"
                          value={c.qtyBySize?.[sz] ?? 0}
                          onChange={(e) => {
                            const n = Number(e.target.value.replace(/[^\d]/g, ""));
                            setQty(c.id, sz, Number.isFinite(n) ? n : 0);
                          }}
                          className="h-8 w-full min-w-[56px] rounded-lg border border-mist bg-snow px-2 text-center outline-none"
                        />
                      </td>
                    ))}
                    <td className="w-10 border-t border-mist px-1" />
                    <td className="border-t border-mist px-2 py-3 text-center font-medium">{rowTotal}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="border-t border-mist px-2 py-2 pr-3">
                  <GridAddButton label="색상 추가" onClick={addColor} />
                </td>
                {sizes.map((sz) => (
                  <td key={sz} className="border-t border-mist px-2.5" />
                ))}
                <td className="w-10 border-t border-mist px-1" />
                <td className="border-t border-mist" />
              </tr>
              <tr className="font-medium">
                <td className="border-t border-mist px-2 py-3">합계</td>
                {colTotals.map((n, i) => (
                  <td key={sizes[i]} className="border-t border-mist px-2 py-3 text-center">
                    {n}
                  </td>
                ))}
                <td className="w-10 border-t border-mist px-1" />
                <td className="border-t border-mist px-2 py-3 text-center">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function NotesTab({ product }: { product: Product }) {
  const { updateSpecsField } = useWorkspace();
  const value = product.specs.notes[0]?.body ?? "";
  return (
    <Card>
      <p className="mb-3 text-[13px] text-stone">주의사항</p>
      <NotesEditor
        key={product.id}
        value={value}
        onChange={(body) => {
          updateSpecsField(product.id, (p) => ({
            ...p,
            specs: {
              ...p.specs,
              notes: p.specs.notes.length
                ? p.specs.notes.map((n, i) => (i === 0 ? { ...n, body } : n))
                : [{ title: "주의사항", body }],
            },
          }));
        }}
      />
    </Card>
  );
}

function PrintTab({ product }: { product: Product }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PrintGroup
        product={product}
        kind="label"
        title="라벨"
        guide="메인 라벨, 케어 라벨, 사이즈 라벨 등 부착 시안을 업로드하세요."
        purposePlaceholder="용도 · 예: 메인 라벨, 백넥"
      />
      <PrintGroup
        product={product}
        kind="print"
        title="인쇄물"
        guide="그래픽, 나염, 자수 등 인쇄 시안을 업로드하세요."
        purposePlaceholder="용도 · 예: 가슴 그래픽 나염"
      />
    </div>
  );
}

function PrintGroup({
  product,
  kind,
  title,
  guide,
  purposePlaceholder,
}: {
  product: Product;
  kind: "label" | "print";
  title: string;
  guide: string;
  purposePlaceholder: string;
}) {
  const { updateSpecsField } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const items = (product.files ?? []).filter((f) => f.kind === kind);

  const ingest = (list: FileList | null) => {
    if (!list?.length) return;
    void readFilesAsProductFiles(list, "specs", kind).then((incoming) => {
      updateSpecsField(product.id, (p) => ({
        ...p,
        files: [...(p.files ?? []), ...incoming],
      }));
    });
  };

  const patch = (id: string, purpose: string) => {
    updateSpecsField(product.id, (p) => ({
      ...p,
      files: (p.files ?? []).map((f) => (f.id === id ? { ...f, purpose } : f)),
    }));
  };

  const remove = (id: string) => {
    updateSpecsField(product.id, (p) => ({
      ...p,
      files: (p.files ?? []).filter((f) => f.id !== id),
    }));
  };

  return (
    <Card>
      <p className="text-[15px] font-semibold tracking-tight">{title}</p>
      <p className="mt-1 mb-4 text-[12px] leading-relaxed text-stone">{guide}</p>

      {items.length > 0 && (
        <ul className="mb-4 grid gap-3 sm:grid-cols-2">
          {items.map((file) => {
            const image = isImageFile(file);
            return (
              <li key={file.id} className="overflow-hidden rounded-2xl border border-mist bg-paper">
                <div className="relative aspect-square bg-snow">
                  {image ? (
                    <img src={file.src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-stone">
                      <File size={22} />
                      <span className="px-3 text-center text-[11px]">{file.name}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(file.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-snow/90 text-stone shadow-sm hover:text-ink"
                    aria-label={`${file.name} 삭제`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-[13px] font-medium">{file.name}</p>
                  <input
                    value={file.purpose ?? ""}
                    placeholder={purposePlaceholder}
                    onChange={(e) => patch(file.id, e.target.value)}
                    className="h-9 w-full rounded-xl border border-mist bg-snow px-3 text-[12px] outline-none focus:border-fog"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          ingest(e.dataTransfer.files);
        }}
        className={cn(
          "flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-stone",
          dragOver ? "border-ink bg-snow text-ink" : "border-fog bg-paper",
        )}
      >
        <Upload size={18} />
        <p className="text-[13px]">{title} 파일을 놓거나 클릭해서 업로드</p>
        <p className="text-[11px]">이미지 또는 PDF</p>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          ingest(e.target.files);
          e.target.value = "";
        }}
      />
    </Card>
  );
}
