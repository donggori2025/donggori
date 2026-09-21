"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  ExternalLink,
  FileText,
  FolderDown,
  Link2,
  Plus,
  Printer,
  Check,
  LayoutGrid,
  List,
  RotateCcw,
  Share2,
  SquareArrowOutUpRight,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ComposePalette } from "./pack-compose-cards";
import { SharePageModal } from "./share-page-modal";
import { MiniFlat } from "./ui";
import { NotesEditor } from "./notes-editor";
import { Mockup2D, Mockup3D } from "./flats";
import { LibraryImportModal } from "./library-import-modal";
import { collections, userById } from "@/lib/data";
import { materialFromAsset, trimFromAsset } from "@/lib/library-import";
import { isImageFile, printShareFiles, downloadProductFile, readFilesAsProductFiles } from "@/lib/product-files";
import { pageSize } from "@/lib/misc-board";
import { FABRIC_PACK_COLUMNS, TRIM_PACK_COLUMNS, togglePackColumn, visiblePackColumns } from "@/lib/pack-columns";
import { artboardsOf, specArtboardOf, specsFromArtboard, uniquifyPackExtraTitles, uniquePackExtraTitle } from "@/lib/spec-artboard";
import { useWorkspace } from "@/lib/store";
import type {
  CanvasNode,
  Colorway,
  LabelSpec,
  Material,
  MeasurementRow,
  PackExtra,
  Product,
  ProductFile,
  SpecIdentity,
  TrimItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const POM_KO: Record<string, string> = {
  Chest: "가슴단면",
  Length: "총장",
  "Sleeve Width": "소매통",
  "Sleeve Length": "소매길이",
  Shoulder: "어깨너비",
  Neck: "넥폭",
  "Neck Width": "넥폭",
};

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

const NAMED_SWATCH: Record<string, string> = {
  Ecru: "#EDE6D9",
  Nickel: "#9A9A96",
  Ivory: "#F4EFE4",
  Charcoal: "#3A3A38",
  Natural: "#E8E4DC",
};

function withPackItemColumns(product: Product, kind: "fabric" | "trim", next: string[]): Product {
  return {
    ...product,
    specs: {
      ...product.specs,
      packItemColumns: {
        ...product.specs.packItemColumns,
        [kind]: next,
      },
    },
  };
}

const STATIC_SECTIONS = [
  { id: "basic", label: "기본 정보" },
  { id: "fabric", label: "원단" },
  { id: "trim", label: "부자재" },
  { id: "label", label: "라벨" },
  { id: "size", label: "사이즈 스펙" },
  { id: "qty", label: "색상별 수량" },
  { id: "notes", label: "주의사항" },
] as const;

type SectionDef = {
  id: string;
  label: string;
  badge?: "specs" | "일반";
  subtitle?: string;
  kind: "flatSpecs" | "drawing" | "basic" | "fabric" | "trim" | "label" | "size" | "qty" | "notes" | "table" | "memo";
  node?: CanvasNode;
  extra?: PackExtra;
};

type ShareAlbumItem =
  | { id: string; kind: "pack"; packPage: number }
  | { id: string; kind: "prints"; files: ProductFile[] };

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function swatchColor(value?: string) {
  if (!value) return "";
  if (isHexColor(value)) return value.trim();
  return NAMED_SWATCH[value] ?? "";
}

function colorLabel(color?: string, colorName?: string) {
  if (colorName?.trim()) return colorName;
  if (color && !isHexColor(color)) return color;
  if (color) {
    const named = Object.entries(NAMED_SWATCH).find(([, hex]) => hex.toLowerCase() === color.trim().toLowerCase());
    if (named) return named[0];
  }
  return "";
}

function linkedMockups(product: Product, flatId?: string) {
  if (!flatId) return [];
  return product.nodes
    .filter((n): n is CanvasNode & { type: "mockup2d" | "mockup3d" } =>
      (n.type === "mockup2d" || n.type === "mockup3d") && n.linkedTo === flatId,
    )
    .sort((a, b) => (a.type === b.type ? 0 : a.type === "mockup2d" ? -1 : 1));
}

function primaryFlat(product: Product) {
  return product.nodes.find((n) => n.type === "flat" && n.boardKind === "specs") ?? product.nodes.find((n) => n.type === "flat");
}

type DrawingSlide = { id: string; label: string; type: "flat" | "mockup2d" | "mockup3d" };

function drawingSlides(product: Product, section: SectionDef): DrawingSlide[] {
  const flat = section.node?.type === "flat" ? section.node : section.kind === "flatSpecs" ? primaryFlat(product) : undefined;
  if (section.kind === "flatSpecs" || section.node?.type === "flat") {
    return [
      { id: flat?.id ?? `${section.id}-flat`, label: "도식화", type: "flat" },
      ...linkedMockups(product, flat?.id).map((n) => ({
        id: n.id,
        label: n.type === "mockup2d" ? "2D" : "3D",
        type: n.type,
      })),
    ];
  }
  if (section.node?.type === "mockup2d" || section.node?.type === "mockup3d") {
    return [{ id: section.node.id, label: section.node.type === "mockup2d" ? "2D" : "3D", type: section.node.type }];
  }
  return [{ id: section.id, label: "도식화", type: "flat" }];
}

function isLinkedMockupCovered(section: SectionDef, visible: SectionDef[]) {
  const node = section.node;
  if (!node || (node.type !== "mockup2d" && node.type !== "mockup3d") || !node.linkedTo) return false;
  return visible.some((s) => s.kind === "flatSpecs" || s.node?.id === node.linkedTo);
}

function buildSections(product: Product): SectionDef[] {
  const spec = specArtboardOf(product);
  const others = artboardsOf(product).filter((n) => n.id !== spec?.id);
  const extras = uniquifyPackExtraTitles(product.specs.packExtras ?? []);
  return [
    ...(spec
      ? [
          {
            id: "flatSpecs",
            label: spec.title || "도식화",
            badge: "specs" as const,
            subtitle: "spec용 도식화",
            kind: "flatSpecs" as const,
            node: spec,
          },
        ]
      : []),
    ...others.map((n) => ({
      id: `draw:${n.id}`,
      label: n.title || "아트보드",
      subtitle: "아트보드",
      kind: "drawing" as const,
      node: n,
    })),
    ...STATIC_SECTIONS.map((s) => ({ id: s.id, label: s.label, kind: s.id })),
    ...extras.map((extra) => ({
      id: `extra:${extra.id}`,
      label: extra.title,
      kind: extra.kind,
      extra,
    })),
  ];
}

const PACK_LAYOUT_KEY = "faddit-pack-layout";
const MIN_COL_PX = 132;
const MIN_ROW_PX = 72;

function defaultColFr(col: SectionDef["kind"][]) {
  if (col.some((k) => k === "trim" || k === "notes")) return 0.76;
  if (col.some((k) => k === "size" || k === "qty" || k === "label")) return 1.24;
  return 1;
}

function defaultRowFr(kind: string) {
  if (kind === "flatSpecs") return 1.55;
  if (kind === "fabric") return 0.85;
  if (kind === "trim") return 1.15;
  if (kind === "notes") return 0.7;
  if (kind === "size") return 1.2;
  if (kind === "qty") return 1;
  if (kind === "label") return 0.9;
  return 1;
}

function loadPackLayout(productId: string): { cols: Record<string, number>; rows: Record<string, number> } {
  try {
    if (typeof window === "undefined") return { cols: {}, rows: {} };
    const raw = window.localStorage.getItem(`${PACK_LAYOUT_KEY}:${productId}`);
    if (!raw) return { cols: {}, rows: {} };
    const parsed = JSON.parse(raw) as { cols?: Record<string, number>; rows?: Record<string, number> };
    return { cols: parsed.cols ?? {}, rows: parsed.rows ?? {} };
  } catch {
    return { cols: {}, rows: {} };
  }
}

function savePackLayout(productId: string, layout: { cols: Record<string, number>; rows: Record<string, number> }) {
  try {
    window.localStorage.setItem(`${PACK_LAYOUT_KEY}:${productId}`, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
}

function clearPackLayout(productId: string) {
  try {
    window.localStorage.removeItem(`${PACK_LAYOUT_KEY}:${productId}`);
  } catch {
    /* ignore */
  }
}

function jumpKind(kind: SectionDef["kind"]) {
  if (kind === "flatSpecs" || kind === "drawing") return "design";
  if (kind === "trim") return "fabric";
  if (kind === "qty") return "size";
  if (kind === "label") return "print";
  if (kind === "table" || kind === "memo") return "";
  return kind;
}

function defaultPagesOf(sections: SectionDef[]): Record<string, number[]> {
  const next: Record<string, number[]> = {};
  const hasSpec = sections.some((s) => s.kind === "flatSpecs");
  let firstDrawing = true;
  for (const s of sections) {
    if (s.kind === "table" || s.kind === "memo") next[s.id] = [];
    else if (s.kind === "drawing") {
      next[s.id] = !hasSpec && firstDrawing ? [1] : [];
      firstDrawing = false;
    } else next[s.id] = [1];
  }
  return next;
}

function remapPagesOf(map: Record<string, number[]>, removed: number) {
  const next: Record<string, number[]> = {};
  for (const [id, list] of Object.entries(map)) {
    next[id] = (list ?? [])
      .filter((page) => page !== removed)
      .map((page) => (page > removed ? page - 1 : page));
  }
  return next;
}

function PackLiveThumb({
  product,
  workspaceName,
  ownerName,
  season,
  page,
  showPageNo,
  sections,
  layoutNonce,
}: {
  product: Product;
  workspaceName: string;
  ownerName: string;
  season: string;
  page: number;
  showPageNo: boolean;
  sections: SectionDef[];
  layoutNonce: number;
}) {
  return (
    <div className="aspect-[297/210] w-full overflow-hidden rounded-lg border border-mist bg-white">
      <div className="pointer-events-none h-full w-full select-none" aria-hidden="true" inert>
        <FitA4Landscape>
          <Sheet
            product={product}
            workspaceName={workspaceName}
            ownerName={ownerName}
            season={season}
            page={page}
            showPageNo={showPageNo}
            sections={sections}
            compact
            resizable={false}
            layoutNonce={layoutNonce}
          />
        </FitA4Landscape>
      </div>
    </div>
  );
}

const CM_PER_INCH = 2.54;

const DEFAULT_ATTRS = [
  { id: "fit", label: "Fit", value: "Crop" },
  { id: "sleeve", label: "Sleeve", value: "Regular" },
  { id: "pocket", label: "Pocket", value: "None" },
];

function productSizes(product: Product) {
  return product.specs.sizeRange.length ? product.specs.sizeRange : ["S", "M", "L", "XL"];
}

const SIZE_SEQ = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const COLOR_PALETTE = ["#EDE6D9", "#3A3A38", "#C4A57B", "#8B9A7D", "#6B7C8F", "#cfcfcf"];
const DEFAULT_MEASURE_ROWS: MeasurementRow[] = [
  { pom: "A", label: "총장", m: "66", s: "", l: "", xl: "", tolerance: "" },
  { pom: "B", label: "가슴단면", m: "57", s: "", l: "", xl: "", tolerance: "" },
];

function nextSizeLabel(current: string[]) {
  let last = -1;
  SIZE_SEQ.forEach((s, i) => {
    if (current.includes(s)) last = i;
  });
  if (last >= 0 && last < SIZE_SEQ.length - 1) return SIZE_SEQ[last + 1];
  const found = SIZE_SEQ.find((s) => !current.includes(s));
  if (found) return found;
  let i = 1;
  while (current.includes(`Size ${i}`)) i += 1;
  return `Size ${i}`;
}

function nextPomCode(used: Set<string>) {
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i);
    if (!used.has(c)) return c;
  }
  let n = 1;
  while (used.has(`P${n}`)) n += 1;
  return `P${n}`;
}

function hydrateColorways(product: Product, sizes: string[]): Colorway[] {
  if (!product.specs.colorways.length) return [];
  return product.specs.colorways.map((c) => ({
    ...c,
    qtyBySize: Object.fromEntries(sizes.map((sz) => [sz, c.qtyBySize?.[sz] ?? 0])),
  }));
}

function patchSizeRange(p: Product, sizeRange: string[], colorways: Colorway[]): Product {
  return {
    ...p,
    specs: {
      ...p.specs,
      sizeRange,
      colorways,
      quantity: sizeRange.map((size) => ({
        size,
        qty: colorways.reduce((sum, c) => sum + (c.qtyBySize?.[size] ?? 0), 0),
      })),
    },
  };
}

function addSizeColumn(p: Product): Product {
  const sizes = productSizes(p);
  const label = nextSizeLabel(sizes);
  const sizeRange = [...sizes, label];
  const colorways = hydrateColorways(p, sizes).map((c) => ({
    ...c,
    qtyBySize: { ...(c.qtyBySize ?? {}), [label]: 0 },
  }));
  return patchSizeRange(p, sizeRange, colorways);
}

function removeSizeColumn(p: Product, size: string): Product {
  const sizes = productSizes(p);
  if (sizes.length <= 1) return p;
  const sizeRange = sizes.filter((s) => s !== size);
  const colorways = hydrateColorways(p, sizes).map((c) => {
    const qtyBySize = { ...(c.qtyBySize ?? {}) };
    delete qtyBySize[size];
    return { ...c, qtyBySize };
  });
  const next = patchSizeRange(p, sizeRange, colorways);
  return {
    ...next,
    specs: {
      ...next.specs,
      measurements: p.specs.measurements.map((row) => {
        const values = { ...(row.values ?? {}) };
        delete values[size];
        return { ...row, values };
      }),
    },
  };
}

function renameSizeColumn(p: Product, from: string, to: string): Product {
  const next = to.trim();
  if (!next || next === from) return p;
  const sizes = productSizes(p);
  if (!sizes.includes(from) || sizes.includes(next)) return p;
  const sizeRange = sizes.map((s) => (s === from ? next : s));
  const colorways = hydrateColorways(p, sizes).map((c) => {
    const qtyBySize = { ...(c.qtyBySize ?? {}) };
    if (qtyBySize[from] != null) {
      qtyBySize[next] = qtyBySize[from];
      delete qtyBySize[from];
    }
    return { ...c, qtyBySize };
  });
  const patched = patchSizeRange(p, sizeRange, colorways);
  return {
    ...patched,
    specs: {
      ...patched.specs,
      measurements: (p.specs.measurements.length ? p.specs.measurements : DEFAULT_MEASURE_ROWS).map((row) => {
        const values = { ...(row.values ?? {}) };
        const cm = from in values ? values[from] : rowValueCm(row, from);
        delete values[from];
        if (cm != null) values[next] = cm;
        return { ...row, values };
      }),
    },
  };
}

function ensureMeasurements(p: Product): Product {
  if (p.specs.measurements.length) return p;
  return { ...p, specs: { ...p.specs, measurements: DEFAULT_MEASURE_ROWS } };
}

function addMeasurementRow(p: Product): Product {
  const base = ensureMeasurements(p);
  const used = new Set(base.specs.measurements.map((r) => r.pom));
  const pom = nextPomCode(used);
  return {
    ...base,
    specs: {
      ...base.specs,
      measurements: [...base.specs.measurements, { pom, label: "측정 항목", values: {}, grade: 2, tolerance: "±5" }],
    },
  };
}

function removeMeasurementRow(p: Product, pom: string): Product {
  return {
    ...p,
    specs: { ...p.specs, measurements: p.specs.measurements.filter((r) => r.pom !== pom) },
  };
}

function addColorRow(p: Product): Product {
  const sizes = productSizes(p);
  const qtyBySize = Object.fromEntries(sizes.map((s) => [s, 0]));
  const existing = hydrateColorways(p, sizes);
  const hex = COLOR_PALETTE[existing.length % COLOR_PALETTE.length];
  return patchSizeRange(p, sizes, [
    ...existing,
    { id: `cw-${Date.now()}`, name: "새 색상", main: "새 색상", sub: "", code: "", hex, qtyBySize, memo: "" },
  ]);
}

function removeColorRow(p: Product, id: string): Product {
  const sizes = productSizes(p);
  return patchSizeRange(p, sizes, hydrateColorways(p, sizes).filter((c) => c.id !== id));
}

function parseLegacyCm(raw: string | undefined) {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return n > 200 ? n / 10 : n;
}

function rowValueCm(row: Product["specs"]["measurements"][number], size: string) {
  if (row.values && Number.isFinite(row.values[size])) return row.values[size];
  const key = size.toLowerCase() as "xs" | "s" | "m" | "l" | "xl";
  return parseLegacyCm(row[key]);
}

function formatInch(cm: number | undefined) {
  if (cm == null || !Number.isFinite(cm)) return "—";
  return (cm / CM_PER_INCH).toFixed(2);
}

function formatDate(value?: string) {
  if (!value) return "—";
  return value.replaceAll("-", ".");
}

export function printTechPackSheets() {
  const sheets = Array.from(document.querySelectorAll<HTMLElement>("[data-pack-main] .tech-pack-sheet"));
  if (!sheets.length) return;

  const prev = document.querySelector("iframe[data-tech-pack-print]");
  prev?.remove();

  const iframe = document.createElement("iframe");
  iframe.dataset.techPackPrint = "1";
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    left: "-100vw",
    width: "297mm",
    height: "210mm",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((node) => node.outerHTML)
    .join("\n");

  const prevTitle = document.title;
  document.title = " ";

  doc.open();
  doc.write(`<!DOCTYPE html>
<html class="${document.documentElement.className}" lang="ko">
<head>
<meta charset="utf-8" />
<title> </title>
${styles}
<style>
  @page { size: 297mm 210mm; margin: 0 !important; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff;
    color: #1a1916;
  }
  body > .tech-pack-sheet {
    width: 297mm !important;
    height: 210mm !important;
    min-width: 297mm !important;
    min-height: 210mm !important;
    max-width: none !important;
    max-height: none !important;
    aspect-ratio: auto !important;
    box-shadow: none !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body > .tech-pack-sheet + .tech-pack-sheet {
    page-break-before: always;
    break-before: page;
  }
</style>
</head>
<body></body>
</html>`);
  doc.close();

  for (const sheet of sheets) {
    doc.body.appendChild(sheet.cloneNode(true));
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.title = prevTitle;
    iframe.remove();
  };
  win.addEventListener("afterprint", cleanup);

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    win.focus();
    win.print();
  };

  const links = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
  void Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          const el = link as HTMLLinkElement;
          if (el.sheet) {
            resolve();
            return;
          }
          el.addEventListener("load", () => resolve(), { once: true });
          el.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(start));
  });
  window.setTimeout(start, 500);
  window.setTimeout(cleanup, 180000);
}

function seasonLabel(product: Product) {
  const col = collections.find((c) => c.id === product.collectionId);
  if (!col) return "2026 SS";
  const code = col.name.replace(/^\d+/, "") || col.season.split(" / ").map((p) => p[0]).join("");
  return `${col.year} ${code}`;
}

export function TechPackPreview({
  product,
  onClose,
  variant = "editor",
  onJumpSpecs,
  onPackSidebarWidth,
}: {
  product: Product;
  onClose?: () => void;
  variant?: "editor" | "share" | "workspace";
  onJumpSpecs?: (section: string) => void;
  onPackSidebarWidth?: (width: number) => void;
}) {
  const { workspaces, addPackExtra, removePackExtra, updateSpecsField, deleteNode } = useWorkspace();
  const ws = workspaces.find((w) => w.id === product.workspaceId);
  const owner = userById(product.ownerId);
  const sections = useMemo(() => buildSections(product), [product]);
  const isShare = variant === "share";

  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [composeTab, setComposeTab] = useState<"print" | "compose">("print");
  const [pagesOf, setPagesOf] = useState<Record<string, number[]>>(() => defaultPagesOf(sections));
  const [composeDrag, setComposeDrag] = useState<{ dropPage: number | null } | null>(null);
  const [albumIndex, setAlbumIndex] = useState(0);
  const printPack = () => printTechPackSheets();

  const season = seasonLabel(product);
  const [layoutNonce, setLayoutNonce] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);
  const [printTwoUp, setPrintTwoUp] = useState(false);
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1);
  const sheetPages = pages;

  const album = useMemo(() => {
    const packPages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1);
    const items: ShareAlbumItem[] = packPages.map((packPage) => ({
      id: `pack-${packPage}`,
      kind: "pack" as const,
      packPage,
    }));
    if (isShare) {
      const prints = printShareFiles(product.files);
      if (prints.length) {
        items.push({ id: "prints", kind: "prints", files: prints });
      }
    }
    return items;
  }, [isShare, pageCount, product]);

  const safeAlbumIndex = Math.min(albumIndex, Math.max(0, album.length - 1));
  const currentAlbum = album[safeAlbumIndex] ?? album[0];
  const pagerCount = album.length;
  const pagerView = safeAlbumIndex + 1;
  const viewPage =
    currentAlbum?.kind === "pack" ? currentAlbum.packPage : Math.min(currentPage, pages.length);

  useEffect(() => {
    setPagesOf((map) => {
      let changed = false;
      const next = { ...map };
      for (const s of sections) {
        if (s.id in next) continue;
        next[s.id] = s.kind === "table" || s.kind === "memo" ? [viewPage] : s.kind === "drawing" ? [] : [1];
        changed = true;
      }
      return changed ? next : map;
    });
  }, [sections, viewPage]);

  const visibleOnPage = (page: number) =>
    sections.filter((s) => (pagesOf[s.id] ?? []).includes(page));

  const addSectionToPage = (id: string, page: number) => {
    setPagesOf((map) => {
      const cur = map[id] ?? [];
      if (cur.includes(page)) return map;
      return { ...map, [id]: [...cur, page].sort((a, b) => a - b) };
    });
  };

  const removeSectionFromPage = (id: string, page: number) => {
    setPagesOf((map) => {
      const cur = map[id] ?? [];
      if (!cur.includes(page)) return map;
      return { ...map, [id]: cur.filter((n) => n !== page) };
    });
  };

  const addPage = () => {
    const next = pageCount + 1;
    setPageCount(next);
    setCurrentPage(next);
    setAlbumIndex(pageCount);
  };

  const removePage = (page: number) => {
    if (pageCount <= 1) return;
    const viewingPack = currentAlbum?.kind === "pack";
    const viewPackPage = viewingPack ? currentAlbum.packPage : currentPage;
    let nextPage = viewPackPage;
    if (nextPage === page) nextPage = Math.max(1, page - 1);
    else if (nextPage > page) nextPage -= 1;
    setPagesOf((map) => remapPagesOf(map, page));
    setPageCount((n) => Math.max(1, n - 1));
    setCurrentPage(nextPage);
    setAlbumIndex((i) => (viewingPack ? nextPage - 1 : Math.max(0, i - 1)));
  };

  const reset = () => {
    setPagesOf(defaultPagesOf(sections));
    setPageCount(1);
    setCurrentPage(1);
    clearPackLayout(product.id);
    setLayoutNonce((n) => n + 1);
  };

  const embedded = variant === "workspace";
  const showCompose = variant !== "share";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        printTechPackSheets();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const apply = () => setPrintTwoUp(el.clientWidth >= PACK_PRINT_TWO_UP_PX);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showCompose]);

  return (
    <div
      className={cn(
        "tech-pack-root flex flex-col overflow-hidden bg-paper",
        embedded ? "relative h-full canvas-dot" : "fixed inset-0 z-50 h-svh",
      )}
    >
      {variant === "share" ? (
        <ShareCopyLinkButton />
      ) : variant === "workspace" ? null : (
        <header className="tech-pack-chrome flex h-12 shrink-0 items-center justify-between border-b border-mist bg-snow px-4 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-paper"
              aria-label="닫기"
            >
              <X size={14} />
            </button>
            <p className="text-[15px] font-semibold tracking-tight">Tech Pack</p>
          </div>
          <ShareMenu productId={product.id} onPrint={printPack} />
        </header>
      )}

      <div className="tech-pack-body flex min-h-0 flex-1 overflow-hidden">
        <div className="tech-pack-stage relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PackFitRow
          dropPage={currentAlbum?.kind === "pack" ? viewPage : undefined}
          flushEnd={embedded}
          onSidebarWidth={onPackSidebarWidth}
          sidebar={showCompose ? (
        <aside
          ref={sidebarRef}
          data-pack-sidebar
          className={cn("tech-pack-chrome relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border border-mist bg-snow shadow-sm print:hidden", PACK_PANEL_RADIUS)}
        >
          <div className="mx-3.5 mt-3 flex shrink-0 border-b border-mist" role="tablist" aria-label="작업지시서 사이드바">
            {([
              ["print", "출력"],
              ["compose", "구성"],
            ] as const).map(([id, label]) => {
              const active = composeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setComposeTab(id)}
                  className={cn(
                    "-mb-px flex-1 pb-2 text-[13px]",
                    active
                      ? "border-b-2 border-ink text-ink"
                      : "border-b-2 border-transparent text-stone hover:text-ink",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className={cn("flex min-h-0 flex-1 flex-col pt-3", composeTab !== "print" && "hidden")}>
            <div className="min-h-0 flex-1 overflow-auto px-3.5 pb-3">
              <div className={cn("grid gap-2", printTwoUp ? "grid-cols-2" : "grid-cols-1")}>
                {pages.map((n) => {
                  const selected = n === viewPage;
                  return (
                    <div
                      key={n}
                      data-pack-drop-page={n}
                      className={cn(
                        "rounded-2xl p-1.5",
                        selected ? "bg-paper ring-1 ring-ink/15" : "hover:bg-paper/70",
                        composeDrag?.dropPage === n && "ring-2 ring-[#0d99ff]",
                      )}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`${n}장 미리보기`}
                        onClick={() => {
                          setCurrentPage(n);
                          const idx = album.findIndex((item) => item.kind === "pack" && item.packPage === n);
                          if (idx >= 0) setAlbumIndex(idx);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          setCurrentPage(n);
                          const idx = album.findIndex((item) => item.kind === "pack" && item.packPage === n);
                          if (idx >= 0) setAlbumIndex(idx);
                        }}
                        className="block w-full cursor-pointer"
                      >
                        <PackLiveThumb
                          product={product}
                          workspaceName={ws?.name ?? "내 워크스페이스"}
                          ownerName={owner?.name ?? "—"}
                          season={season}
                          page={n}
                          showPageNo={pageCount > 1}
                          sections={visibleOnPage(n)}
                          layoutNonce={layoutNonce}
                        />
                      </div>
                      <div className="mt-1 flex h-7 items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(n);
                            const idx = album.findIndex((item) => item.kind === "pack" && item.packPage === n);
                            if (idx >= 0) setAlbumIndex(idx);
                          }}
                          className={cn("text-[12px]", selected ? "text-ink" : "text-stone")}
                        >
                          {n}장
                        </button>
                        <button
                          type="button"
                          onClick={() => removePage(n)}
                          disabled={pageCount <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-stone hover:bg-snow hover:text-ink disabled:opacity-30"
                          aria-label={`${n}장 삭제`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addPage}
                  className={cn(
                    "flex w-full items-center justify-center gap-1 text-[12px] text-stone hover:bg-paper hover:text-ink",
                    printTwoUp
                      ? "flex-col rounded-2xl p-1.5"
                      : "h-8 rounded-full",
                  )}
                >
                  {printTwoUp ? (
                    <>
                      <span className="flex aspect-[297/210] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-mist">
                        <Plus size={12} />
                        장 추가
                      </span>
                      <span className="mt-1 h-7" />
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      장 추가
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={cn("flex min-h-0 flex-1 flex-col pt-3", composeTab !== "compose" && "hidden")}>
            <div className="flex items-center justify-between gap-1 px-3.5 pb-2">
              <p className="min-w-0 truncate text-[11px] text-stone">{viewPage}장 · 끌어다 넣기</p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-stone hover:bg-paper hover:text-ink"
              >
                <RotateCcw size={11} />
                초기화
              </button>
            </div>
            <ComposePalette
              product={product}
              viewPage={viewPage}
              pagesOf={pagesOf}
              groups={[
                {
                  title: "아트보드",
                  items: sections
                    .filter((s) => s.kind === "flatSpecs" || s.kind === "drawing")
                    .filter((s) => !isLinkedMockupCovered(s, sections)),
                },
                {
                  title: "스펙",
                  items: sections.filter(
                    (s) => s.kind !== "flatSpecs" && s.kind !== "drawing" && s.kind !== "table" && s.kind !== "memo",
                  ),
                },
                {
                  title: "표 · 메모",
                  canCreate: true,
                  items: sections.filter((s) => s.kind === "table" || s.kind === "memo"),
                },
              ]}
              onAddToPage={addSectionToPage}
              onCreateExtra={(kind) => {
                const id = addPackExtra(product.id, kind);
                setPagesOf((map) => ({ ...map, [`extra:${id}`]: [viewPage] }));
              }}
              onRemove={(id) => {
                const sec = sections.find((s) => s.id === id);
                if (!sec) return;
                if (sec.extra) removePackExtra(product.id, sec.extra.id);
                else if (sec.node) deleteNode(product.id, sec.node.id);
                setPagesOf((map) => {
                  if (!(id in map)) return map;
                  const next = { ...map };
                  delete next[id];
                  return next;
                });
              }}
              onRename={(id, title) => {
                const extra = sections.find((s) => s.id === id)?.extra;
                if (!extra) return;
                updateSpecsField(product.id, (p) => {
                  const extras = p.specs.packExtras ?? [];
                  const nextTitle = uniquePackExtraTitle(title, extras, extra.kind, extra.id);
                  return {
                    ...p,
                    specs: {
                      ...p.specs,
                      packExtras: extras.map((e) => (e.id === extra.id ? { ...e, title: nextTitle } : e)),
                    },
                  };
                });
              }}
              onDragState={setComposeDrag}
            />
          </div>
          {composeDrag && (
            <div className="pointer-events-none absolute inset-0 z-20 bg-paper/70" aria-hidden="true" />
          )}
        </aside>
          ) : null}
        >
              {sheetPages.map((page) => {
                const packVisible = currentAlbum?.kind === "pack" && currentAlbum.packPage === page;
                return (
                <div
                  key={page}
                  data-pack-drop-page={packVisible ? page : undefined}
                  className={cn(
                    "h-full w-full",
                    !packVisible && "hidden print:block",
                    composeDrag && packVisible && composeDrag.dropPage === page && "ring-2 ring-[#0d99ff]",
                  )}
                >
                  <Sheet
                    product={product}
                    workspaceName={ws?.name ?? "내 워크스페이스"}
                    ownerName={owner?.name ?? "—"}
                    season={season}
                    page={page}
                    showPageNo={pageCount > 1}
                    sections={visibleOnPage(page)}
                    compact={embedded}
                    resizable={!isShare}
                    layoutNonce={layoutNonce}
                    onJump={isShare ? undefined : onJumpSpecs}
                    onUnassign={isShare ? undefined : (id) => removeSectionFromPage(id, page)}
                  />
                </div>
                );
              })}
              {isShare && currentAlbum?.kind === "prints" && <SharePrintSheet files={currentAlbum.files} />}
        </PackFitRow>
          <nav
            data-pack-pager
            aria-label="페이지"
            className="tech-pack-chrome pointer-events-none absolute z-20 flex justify-center print:hidden"
            style={{
              left: showCompose ? PACK_FLOAT_INSET + PACK_SIDEBAR_W + PACK_PAIR_GAP_PX : 0,
              right: 0,
              bottom: PACK_FLOAT_INSET,
            }}
          >
            <div className="pointer-events-auto inline-flex h-9 items-center gap-0.5 rounded-full border border-mist bg-snow px-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setAlbumIndex((i) => Math.max(0, i - 1))}
                disabled={pagerView <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink disabled:text-stone/35 disabled:hover:bg-transparent"
                aria-label="이전 페이지"
              >
                <ChevronLeft size={16} strokeWidth={1.75} />
              </button>
              <p className="min-w-[2.25rem] px-0.5 text-center text-[13px] tabular-nums text-ink">
                {pagerView}/{pagerCount}
              </p>
              <button
                type="button"
                onClick={() => setAlbumIndex((i) => Math.min(album.length - 1, i + 1))}
                disabled={pagerView >= pagerCount}
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink disabled:text-stone/35 disabled:hover:bg-transparent"
                aria-label="다음 페이지"
              >
                <ChevronRight size={16} strokeWidth={1.75} />
              </button>
            </div>
          </nav>
          {composeDrag && (
            <div className="pointer-events-none absolute inset-0 z-30 print:hidden">
              <div className="pointer-events-auto absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2">
                {pages.map((n) => (
                  <div
                    key={n}
                    data-pack-drop-page={n}
                    className={cn(
                      "rounded-full border bg-snow px-3.5 py-2 text-[13px] shadow-[0_8px_24px_rgba(26,25,22,0.12)]",
                      composeDrag.dropPage === n ? "border-ink ring-2 ring-[#0d99ff]" : "border-mist",
                    )}
                  >
                    {n}장
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductShareMenu({
  productId,
  onPrint,
}: {
  productId: string;
  onPrint?: () => void;
}) {
  return <ShareMenu productId={productId} onPrint={onPrint ?? printTechPackSheets} />;
}

function ShareMenu({
  productId,
  onPrint,
}: {
  productId: string;
  onPrint: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sharePage, setSharePage] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {sharePage && <SharePageModal productId={productId} onClose={() => setSharePage(false)} />}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-mist px-3 text-[12px] hover:bg-paper"
      >
        <Share2 size={13} />
        공유
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-30 w-[200px] overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-float"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setSharePage(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <ExternalLink size={13} />
            </span>
            공유 페이지
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onPrint();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] hover:bg-paper"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-stone">
              <Printer size={13} />
            </span>
            인쇄/PDF
          </button>
        </div>
      )}
    </div>
  );
}

function ShareCopyLinkButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* ignore */
        }
      }}
      className="tech-pack-chrome absolute right-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-mist bg-snow px-3 text-[12px] shadow-sm hover:bg-paper print:hidden"
    >
      <Link2 size={13} />
      {copied ? "복사됨" : "링크 복사"}
    </button>
  );
}


/** Fixed 출력/구성 rail width. Does not absorb leftover canvas width. */
export const PACK_SIDEBAR_W = 272;
export const PACK_SIDEBAR_MIN_PX = PACK_SIDEBAR_W;
/** Tech Pack-only 속성 card width. Narrower than Design so the A4 sheet can grow. */
export const PACK_RIGHT_RAIL_W = 268;
/** Viewport inset matching Design `top-3` / `left-3` / `right-3` (12px). */
export const PACK_FLOAT_INSET = 12;
export const PACK_FLOAT_INSET_RIGHT = PACK_FLOAT_INSET;
/** 출력 thumbs sit two-up only if this modest rail is wide enough — it is not. */
export const PACK_PRINT_TWO_UP_PX = 280;
const PACK_PAIR_GAP_PX = 12;
const PACK_FIT = 1;
const PACK_CHROME_RADIUS_PX = 8;
const PACK_PANEL_RADIUS = "rounded-[8px]";
const PACK_SHEET_RADIUS = "rounded-[8px]";
export const PACK_CHROME_CHIP_H = 52;

function contentBoxSize(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  return {
    w: Math.max(0, el.clientWidth - padX),
    h: Math.max(0, el.clientHeight - padY),
  };
}

function PackFitRow({
  sidebar,
  dropPage,
  flushEnd,
  onSidebarWidth,
  children,
}: {
  sidebar: ReactNode;
  dropPage?: number;
  flushEnd?: boolean;
  onSidebarWidth?: (width: number) => void;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const onSidebarWidthRef = useRef(onSidebarWidth);
  onSidebarWidthRef.current = onSidebarWidth;
  const { w, h } = pageSize();
  const [zoom, setZoom] = useState(0.01);
  const hasSidebar = Boolean(sidebar);
  const sidebarW = hasSidebar ? PACK_SIDEBAR_W : 0;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const { w: pw, h: ph } = pageSize();
      const { w: innerW, h: innerH } = contentBoxSize(el);
      const sidebarSpace = hasSidebar ? PACK_SIDEBAR_W + PACK_PAIR_GAP_PX : 0;
      const next =
        Math.min((innerW - sidebarSpace) / pw, innerH / ph) * PACK_FIT;
      const nextZoom = Number.isFinite(next) && next > 0 ? next : 0.01;
      setZoom(nextZoom);
      onSidebarWidthRef.current?.(hasSidebar ? PACK_SIDEBAR_W : 0);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasSidebar]);

  const paperW = w * zoom;
  const paperH = h * zoom;

  const sheet = (
    <div
      data-pack-main
      className={cn("tech-pack-pages relative isolate shrink-0 overflow-hidden shadow-sm", PACK_SHEET_RADIUS)}
      style={{
        width: paperW,
        height: paperH,
        clipPath: `inset(0 round ${PACK_CHROME_RADIUS_PX}px)`,
        ["--pack-zoom" as string]: String(zoom),
        ["--pack-chrome-radius" as string]: `${PACK_CHROME_RADIUS_PX}px`,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left overflow-hidden"
        style={{
          width: w,
          height: h,
          transform: `scale(${zoom})`,
          borderRadius: PACK_CHROME_RADIUS_PX / zoom,
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div
      ref={wrapRef}
      className={cn(
        "tech-pack-stage-body flex min-h-0 flex-1 flex-col overflow-hidden py-3",
        hasSidebar ? "justify-start" : "items-center justify-center px-4",
      )}
      style={
        hasSidebar
          ? {
              paddingLeft: PACK_FLOAT_INSET,
              paddingRight: flushEnd ? 0 : PACK_FLOAT_INSET,
            }
          : undefined
      }
      data-pack-drop-page={dropPage}
    >
      {hasSidebar ? (
        <div className="flex min-h-0 w-full flex-1 gap-3">
          <div className="flex min-h-0 shrink-0 flex-col self-stretch" style={{ width: sidebarW }}>
            {sidebar}
          </div>
          <div className="relative flex min-h-0 min-w-0 flex-1 justify-center">
            <div className="relative shrink-0 self-start" style={{ width: paperW, height: paperH }}>
              {sheet}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full min-h-0 w-full items-center justify-center">
          {sheet}
        </div>
      )}
    </div>
  );
}

function FitA4Landscape({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { w, h } = pageSize();
  const [zoom, setZoom] = useState(0.01);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const { w: pw, h: ph } = pageSize();
      const next = Math.min(el.clientWidth / pw, el.clientHeight / ph);
      setZoom(Number.isFinite(next) && next > 0 ? next : 0.01);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="tech-pack-pages flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
      <div className="relative overflow-hidden shadow-sm" style={{ width: w * zoom, height: h * zoom }}>
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${zoom})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SharePrintSheet({ files }: { files: ProductFile[] }) {
  const cols = files.length <= 1 ? 1 : files.length <= 4 ? 2 : 3;

  return (
    <div className="h-full w-full overflow-hidden border border-[#e6e4de] bg-white">
            <div className="flex h-full flex-col px-10 py-8">
              <p className="text-[13px] text-stone">인쇄</p>
              <p className="mt-1 text-[22px] font-semibold tracking-tight">라벨 · 인쇄물</p>
              <div
                className="mt-6 grid min-h-0 flex-1 content-start gap-5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {files.map((file) => {
                  const image = isImageFile(file);
                  const kindLabel = file.kind === "label" ? "라벨" : "인쇄물";
                  return (
                    <article key={file.id} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e6e4de]">
                      <div className="relative aspect-[5/4] bg-paper">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={file.src} alt="" className="h-full w-full object-contain p-4" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-stone">
                            <FileText size={28} />
                            <p className="px-4 text-center text-[12px]">{file.name}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => downloadProductFile(file)}
                          className="absolute top-2.5 right-2.5 inline-flex h-8 items-center gap-1 rounded-full border border-mist bg-snow px-2.5 text-[11px] hover:bg-paper"
                        >
                          <Download size={12} />
                          다운로드
                        </button>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] text-stone">{kindLabel}</p>
                        <p className="truncate text-[13px] font-medium tracking-tight">
                          {file.purpose?.trim() || file.name}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
    </div>
  );
}

function Sheet({
  product,
  workspaceName,
  ownerName,
  season,
  page,
  showPageNo,
  sections,
  compact,
  resizable,
  layoutNonce = 0,
  onJump,
  onUnassign,
}: {
  product: Product;
  workspaceName: string;
  ownerName: string;
  season: string;
  page: number;
  showPageNo: boolean;
  sections: SectionDef[];
  compact?: boolean;
  resizable?: boolean;
  layoutNonce?: number;
  onJump?: (section: string) => void;
  onUnassign?: (id: string) => void;
}) {
  const live = specsFromArtboard(product);
  const liveProduct = { ...product, specs: live };
  const extras = sections.filter((s) => s.kind === "table" || s.kind === "memo");
  const has = (kind: SectionDef["kind"]) => sections.some((s) => s.kind === kind);
  const drawings = sections.filter((s) => s.kind === "flatSpecs" || s.kind === "drawing");

  const left: SectionDef["kind"][] = [];
  if (drawings.length) left.push("flatSpecs");
  if (has("fabric")) left.push("fabric");

  const mid: SectionDef["kind"][] = [];
  if (has("trim")) mid.push("trim");
  if (has("notes")) mid.push("notes");

  const right: SectionDef["kind"][] = [];
  if (has("size")) right.push("size");
  if (has("qty")) right.push("qty");
  if (has("label")) right.push("label");

  const cols = [left, mid, right].filter((c) => c.length > 0);
  const colKeys = cols.map((col) => col.join("+"));
  const saved = useMemo(() => loadPackLayout(product.id), [product.id]);
  const [colFr, setColFr] = useState(() => colKeys.map((key, i) => saved.cols[key] ?? defaultColFr(cols[i])));
  const [rowFr, setRowFr] = useState<Record<string, number>>(() => ({ ...saved.rows }));
  const colFrRef = useRef(colFr);
  const rowFrRef = useRef(rowFr);
  colFrRef.current = colFr;
  rowFrRef.current = rowFr;
  const drag = useRef<
    | { kind: "col"; index: number; startX: number; left: number; right: number; leftW: number; rightW: number }
    | { kind: "row"; a: string; b: string; startY: number; aFr: number; bFr: number; height: number }
    | null
  >(null);

  useEffect(() => {
    const savedNow = loadPackLayout(product.id);
    setColFr(colKeys.map((key, i) => savedNow.cols[key] ?? defaultColFr(cols[i])));
    setRowFr({ ...savedNow.rows });
  }, [colKeys.join("|"), product.id, layoutNonce]);

  const persist = useCallback(() => {
    const colsMap: Record<string, number> = {};
    colKeys.forEach((key, i) => {
      if (colFrRef.current[i] != null) colsMap[key] = colFrRef.current[i];
    });
    savePackLayout(product.id, { cols: { ...loadPackLayout(product.id).cols, ...colsMap }, rows: rowFrRef.current });
  }, [colKeys, product.id]);

  const rowGrow = (kind: string) => rowFr[kind] ?? defaultRowFr(kind);

  const startColResize = (index: number, e: React.PointerEvent) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    const left = colFrRef.current[index];
    const right = colFrRef.current[index + 1];
    const sheet = (e.currentTarget as HTMLElement).closest(".tech-pack-sheet");
    const colEls = sheet?.querySelectorAll<HTMLElement>(".tech-pack-col");
    const a = colEls?.[index];
    const b = colEls?.[index + 1];
    if (left == null || right == null || !a || !b) return;
    drag.current = {
      kind: "col",
      index,
      startX: e.clientX,
      left,
      right,
      leftW: a.getBoundingClientRect().width,
      rightW: b.getBoundingClientRect().width,
    };
    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || d.kind !== "col") return;
      const pair = d.leftW + d.rightW;
      const nextA = Math.min(Math.max(MIN_COL_PX, d.leftW + (ev.clientX - d.startX)), pair - MIN_COL_PX);
      const ratio = nextA / pair;
      const sum = d.left + d.right;
      setColFr((prev) => prev.map((fr, i) => (i === d.index ? sum * ratio : i === d.index + 1 ? sum * (1 - ratio) : fr)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      drag.current = null;
      persist();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startRowResize = (a: string, b: string, e: React.PointerEvent) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    const col = (e.currentTarget as HTMLElement).closest(".tech-pack-col");
    const modules = col ? Array.from(col.querySelectorAll<HTMLElement>("[data-pack-module]")) : [];
    const aEl = modules.find((el) => el.dataset.packModule === a);
    const bEl = modules.find((el) => el.dataset.packModule === b);
    if (!aEl || !bEl) return;
    drag.current = {
      kind: "row",
      a,
      b,
      startY: e.clientY,
      aFr: rowGrow(a),
      bFr: rowGrow(b),
      height: aEl.getBoundingClientRect().height + bEl.getBoundingClientRect().height,
    };
    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || d.kind !== "row") return;
      const nextA = Math.min(Math.max(MIN_ROW_PX, (d.height * d.aFr) / (d.aFr + d.bFr) + (ev.clientY - d.startY)), d.height - MIN_ROW_PX);
      const ratio = nextA / d.height;
      const sum = d.aFr + d.bFr;
      setRowFr((prev) => ({ ...prev, [d.a]: sum * ratio, [d.b]: sum * (1 - ratio) }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      drag.current = null;
      persist();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <article className="tech-pack-sheet flex h-full w-full flex-col overflow-hidden border border-[#e6e4de] bg-white">
      <div className={cn("flex shrink-0 items-start justify-between", compact ? "px-2 pt-1.5 pb-0.5" : "px-3 pt-2 pb-1")}>
        <div className="min-w-0">
          <p className={cn("truncate font-bold tracking-tight", compact ? "text-[12px] print:text-[16px]" : "text-[16px]")}>
            {season} {workspaceName} {product.name}
          </p>
          <p className={cn("mt-0.5 text-stone", compact ? "text-[8px] print:text-[11px]" : "text-[11px]")}>
            {product.code} · Tech Pack v{product.version}.1
          </p>
        </div>
        {showPageNo && (
          <p className={cn("shrink-0 text-stone", compact ? "text-[9px] print:text-[12px]" : "text-[12px]")}>
            {page}페이지
          </p>
        )}
      </div>

      {has("basic") && (
        <div className="group/packsec shrink-0">
          <SectionBar
            title="기본 정보"
            compact={compact}
            onJump={onJump ? () => onJump("basic") : undefined}
            onUnassign={onUnassign ? () => onUnassign("basic") : undefined}
          />
          <InfoTable
            product={product}
            workspaceName={workspaceName}
            ownerName={ownerName}
            season={season}
            compact={compact}
            editable={Boolean(onJump)}
          />
        </div>
      )}

      {cols.length === 0 && !has("basic") && extras.length === 0 && (
        <p className="px-5 py-10 text-center text-[12px] text-stone">이 페이지에 배정된 섹션이 없습니다.</p>
      )}

      {cols.length > 0 && (
        <div className="flex min-h-0 flex-1 overflow-hidden border-t border-[#e6e4de]">
          {cols.map((col, i) => (
              <div
                key={colKeys[i]}
                className={cn(
                  "tech-pack-col relative flex min-h-0 min-w-0 flex-col overflow-hidden",
                  i < cols.length - 1 && "border-r border-[#e6e4de]",
                )}
                style={{ flex: `${colFr[i] ?? defaultColFr(col)} 1 120px` }}
              >
                {col.map((kind, mi) => {
                  const jump = onJump ? () => onJump(jumpKind(kind === "flatSpecs" ? "flatSpecs" : kind)) : undefined;
                  const next = col[mi + 1];
                  const body =
                    kind === "flatSpecs" ? (
                      <div className="flex h-full min-h-0 flex-col">
                        {drawings
                          .filter((d) => !isLinkedMockupCovered(d, drawings))
                          .map((d) => (
                          <DrawingBlock
                            key={d.id}
                            product={product}
                            section={d}
                            compact={compact}
                            onJump={onJump ? () => onJump(jumpKind(d.kind)) : undefined}
                            onUnassign={onUnassign ? () => onUnassign(d.id) : undefined}
                          />
                        ))}
                      </div>
                    ) : kind === "fabric" ? (
                      <FabricBlock
                        product={liveProduct}
                        materials={live.materials}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("fabric") : undefined}
                      />
                    ) : kind === "trim" ? (
                      <TrimBlock
                        product={liveProduct}
                        trims={live.trims}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("trim") : undefined}
                      />
                    ) : kind === "size" ? (
                      <SizeBlock
                        product={liveProduct}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("size") : undefined}
                      />
                    ) : kind === "qty" ? (
                      <QtyBlock
                        product={product}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("qty") : undefined}
                      />
                    ) : kind === "label" ? (
                      <LabelBlock
                        product={product}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("label") : undefined}
                      />
                    ) : kind === "notes" ? (
                      <NotesBlock
                        product={product}
                        compact={compact}
                        onJump={jump}
                        onUnassign={onUnassign ? () => onUnassign("notes") : undefined}
                      />
                    ) : null;
                  return (
                    <div
                      key={kind}
                      data-pack-module={kind}
                      className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
                      style={{ flex: `${rowGrow(kind)} 1 72px` }}
                    >
                      <div className="min-h-0 flex-1 overflow-auto">{body}</div>
                      {resizable && next && (
                        <button
                          type="button"
                          aria-label="모듈 높이 조절"
                          onPointerDown={(e) => startRowResize(kind, next, e)}
                          className="absolute inset-x-0 -bottom-px z-10 h-1.5 cursor-row-resize print:hidden hover:bg-[#0d99ff]/25"
                        />
                      )}
                    </div>
                  );
                })}
                {resizable && i < cols.length - 1 && (
                  <button
                    type="button"
                    aria-label="열 너비 조절"
                    onPointerDown={(e) => startColResize(i, e)}
                    className="absolute top-0 right-0 z-20 h-full w-1.5 translate-x-1/2 cursor-col-resize print:hidden hover:bg-[#0d99ff]/25"
                  />
                )}
              </div>
          ))}
        </div>
      )}
      {extras.length > 0 && (
        <div className={cn("shrink-0 border-t border-[#e6e4de]", compact ? "px-2 py-1.5" : "px-3 py-2")}>
          {extras.map((sec) => (
            <ExtraBlock
              key={sec.id}
              extra={sec.extra!}
              compact={compact}
              productId={product.id}
              editable={Boolean(onJump)}
              onUnassign={onUnassign ? () => onUnassign(sec.id) : undefined}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function ExtraBlock({
  extra,
  compact,
  productId,
  editable,
  onUnassign,
}: {
  extra: PackExtra;
  compact?: boolean;
  productId: string;
  editable?: boolean;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const patch = (next: PackExtra) => {
    updateSpecsField(productId, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        packExtras: (p.specs.packExtras ?? []).map((e) => (e.id === extra.id ? next : e)),
      },
    }));
  };
  const rename = (title: string) => {
    updateSpecsField(productId, (p) => {
      const extras = p.specs.packExtras ?? [];
      const nextTitle = uniquePackExtraTitle(title, extras, extra.kind, extra.id);
      return {
        ...p,
        specs: {
          ...p.specs,
          packExtras: extras.map((e) => (e.id === extra.id ? { ...e, title: nextTitle } : e)),
        },
      };
    });
  };
  return (
    <div className={cn("group/packsec relative mb-2 last:mb-0", compact && "mb-1")}>
      <div className="flex items-start gap-1">
        {editable && !compact ? (
          <input
            key={extra.title}
            defaultValue={extra.title}
            aria-label="이름"
            onBlur={(e) => {
              const next = e.target.value.trim();
              if (!next) {
                e.target.value = extra.title;
                return;
              }
              if (next !== extra.title) rename(next);
            }}
            className="mb-1 min-w-0 flex-1 bg-transparent text-[12px] font-medium outline-none"
          />
        ) : (
          <p className={cn("min-w-0 flex-1 font-medium", compact ? "text-[9px] print:text-[12px]" : "text-[12px]")}>{extra.title}</p>
        )}
        {onUnassign && (
          <button
            type="button"
            aria-label={`${extra.title}을 작업지시서에서 빼기`}
            onClick={onUnassign}
            className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-stone hover:bg-white hover:text-ink print:hidden"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>
      {extra.kind === "memo" ? (
        <textarea
          key={extra.body}
          defaultValue={extra.body ?? ""}
          readOnly={!editable || compact}
          placeholder="메모"
          onBlur={(e) => {
            if (e.target.value !== (extra.body ?? "")) patch({ ...extra, body: e.target.value });
          }}
          className={cn(
            "mt-1 w-full resize-none rounded-lg border border-[#e6e4de] bg-white px-2 py-1.5 outline-none",
            compact ? "h-12 text-[8px] print:text-[11px]" : "h-20 text-[12px]",
          )}
        />
      ) : (
        <table className={cn("mt-1 w-full border-collapse", compact ? "text-[8px] print:text-[11px]" : "text-[12px]")}>
          <thead>
            <tr>
              {(extra.table?.head ?? ["항목", "내용"]).map((h, i) => (
                <th key={i} className="border border-[#e6e4de] bg-[#f7f6f2] px-2.5 py-1 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(extra.table?.rows ?? [["", ""]]).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-[#e6e4de] px-2.5 py-1">
                    {editable && !compact ? (
                      <input
                        defaultValue={cell}
                        onBlur={(e) => {
                          const rows = (extra.table?.rows ?? []).map((r, i) =>
                            i === ri ? r.map((c, j) => (j === ci ? e.target.value : c)) : r,
                          );
                          patch({ ...extra, table: { head: extra.table?.head ?? ["항목", "내용"], rows } });
                        }}
                        className="w-full bg-transparent outline-none"
                      />
                    ) : (
                      cell || "—"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PackInput({
  value,
  onCommit,
  className,
  align = "left",
  placeholder,
  ariaLabel,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  align?: "left" | "right";
  placeholder?: string;
  ariaLabel?: string;
}) {
  const empty = value === "—" || value === "";
  return (
    <input
      key={value}
      defaultValue={empty ? "" : value}
      aria-label={ariaLabel}
      placeholder={placeholder ?? (empty ? "—" : undefined)}
      onBlur={(e) => {
        const next = e.target.value;
        if (next !== (empty ? "" : value)) onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={cn(
        "w-full min-w-0 rounded-[2px] border border-transparent bg-transparent px-0.5 outline-none placeholder:text-stone/50 focus:border-[#e6e4de] focus:bg-white",
        align === "right" && "text-right",
        className,
      )}
    />
  );
}

function PackSizeInput({
  value,
  taken,
  onRename,
}: {
  value: string;
  taken: string[];
  onRename: (next: string) => void;
}) {
  return (
    <PackInput
      value={value}
      align="right"
      ariaLabel={`${value} 사이즈명`}
      className="min-w-[1.25rem] font-medium"
      onCommit={(raw) => {
        const next = raw.trim();
        if (!next || next === value || taken.includes(next)) return;
        onRename(next);
      }}
    />
  );
}

function PackAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-stone hover:bg-white hover:text-ink print:hidden"
    >
      <Plus size={10} />
    </button>
  );
}

function PackAddMenu({
  label,
  onAsset,
  onUpload,
}: {
  label: string;
  onAsset: () => void;
  onUpload: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative print:hidden">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-stone hover:bg-white hover:text-ink"
      >
        <Plus size={10} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+4px)] left-0 z-30 w-[132px] overflow-hidden rounded-xl border border-[#e6e4de] bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAsset();
            }}
            className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[10px] hover:bg-[#f3f2ef]"
          >
            <FolderDown size={11} />
            에셋
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onUpload();
            }}
            className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[10px] hover:bg-[#f3f2ef]"
          >
            <Upload size={11} />
            업로드
          </button>
        </div>
      )}
    </div>
  );
}

function PackDel({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-stone/40 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-ink focus-visible:opacity-100 print:hidden"
    >
      <X size={9} strokeWidth={2.5} />
    </button>
  );
}

function SectionBar({
  title,
  extra,
  compact,
  onJump,
  onUnassign,
  actions,
}: {
  title: string;
  extra?: string;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[#e6e4de] bg-[#f3f2ef]",
        compact ? "px-2.5 py-0.5" : "px-3 py-1",
      )}
    >
      <div className="flex min-w-0 items-center gap-0.5">
        <p className={cn("min-w-0 font-semibold text-ink", compact ? "text-[10px] print:text-[12px]" : "text-[11px]")}>{title}</p>
        {onJump && (
          <button
            type="button"
            onClick={onJump}
            aria-label={`${title} 수정`}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-stone hover:bg-white hover:text-ink print:hidden"
          >
            <SquareArrowOutUpRight size={11} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {extra && <p className={cn("text-stone", compact ? "text-[9px] print:text-[10px]" : "text-[9px]")}>{extra}</p>}
        {onUnassign && (
          <button
            type="button"
            onClick={onUnassign}
            aria-label={`${title}을 작업지시서에서 빼기`}
            className="flex h-4 w-4 items-center justify-center rounded-[3px] text-stone hover:bg-white hover:text-ink print:hidden"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

function InfoTable({
  product,
  workspaceName,
  ownerName,
  season,
  compact,
  editable,
}: {
  product: Product;
  workspaceName: string;
  ownerName: string;
  season: string;
  compact?: boolean;
  editable?: boolean;
}) {
  const { updateSpecsField } = useWorkspace();
  const idn = product.specs.identity;
  const headers = ["브랜드", "아이템", "성별", "스타일 번호", "품명", "시즌", "샘플 납기", "생산 납기", "담당"];
  const values = [
    idn?.brand?.trim() || workspaceName,
    idn?.item?.trim() || (ITEM_LABEL[product.category] ?? product.category),
    idn?.gender?.trim() || "Unisex",
    product.code,
    product.name,
    idn?.season?.trim() || season,
    idn?.sampleDue?.trim() || "—",
    idn?.productionDue?.trim() || formatDate(product.dueDate),
    idn?.manager?.trim() || ownerName,
  ];
  const extrasSource = idn?.extras ?? DEFAULT_ATTRS;
  const attrs = extrasSource.filter((a) => a.label.trim() || a.value.trim() || editable);

  const patchExtras = (next: (current: typeof extrasSource) => typeof extrasSource) =>
    updateSpecsField(product.id, (p) => {
      const current = p.specs.identity?.extras ?? DEFAULT_ATTRS;
      return {
        ...p,
        specs: { ...p.specs, identity: { ...p.specs.identity, extras: next(current) } },
      };
    });

  const patchIdentity = (patch: Partial<SpecIdentity>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, identity: { ...p.specs.identity, ...patch } },
    }));

  const commitField = (index: number, next: string) => {
    if (index === 0) patchIdentity({ brand: next });
    else if (index === 1) patchIdentity({ item: next });
    else if (index === 2) patchIdentity({ gender: next });
    else if (index === 3) updateSpecsField(product.id, (p) => ({ ...p, code: next }));
    else if (index === 4) updateSpecsField(product.id, (p) => ({ ...p, name: next }));
    else if (index === 5) patchIdentity({ season: next });
    else if (index === 6) patchIdentity({ sampleDue: next });
    else if (index === 7) {
      updateSpecsField(product.id, (p) => ({
        ...p,
        dueDate: next.replaceAll(". ", "-").replaceAll(".", "-"),
        specs: { ...p.specs, identity: { ...p.specs.identity, productionDue: next } },
      }));
    } else if (index === 8) patchIdentity({ manager: next });
  };

  const commitExtra = (id: string, field: "label" | "value", next: string) => {
    patchExtras((current) => current.map((a) => (a.id === id ? { ...a, [field]: next } : a)));
  };

  const addExtra = () =>
    patchExtras((current) => [...current, { id: `c-${Date.now()}`, label: "항목", value: "" }]);

  const removeExtra = (id: string) => patchExtras((current) => current.filter((a) => a.id !== id));

  const cell = compact ? "border border-[#e6e4de] px-2.5 py-0.5" : "border border-[#e6e4de] px-3 py-1";
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[11px]";

  const extraSlots = editable ? [...attrs, { id: "__add", label: "", value: "" }] : attrs;
  const extraRows: (typeof extraSlots)[] = [];
  for (let i = 0; i < extraSlots.length; i += 9) extraRows.push(extraSlots.slice(i, i + 9));
  if (!extraRows.length) extraRows.push([]);

  return (
    <table className={cn("w-full border-collapse", type)}>
      <thead>
        <tr className="bg-[#f3f2ef]">
          {headers.map((h) => (
            <th key={h} className={cn(cell, "text-left font-medium text-stone")}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {values.map((v, i) => (
            <td key={headers[i]} className={cn(cell, "font-medium")}>
              {editable ? (
                <PackInput value={v} onCommit={(next) => commitField(i, next)} />
              ) : (
                <span className="block truncate">{v}</span>
              )}
            </td>
          ))}
        </tr>
        {extraRows.map((row, ri) => (
          <tr key={`extra-${ri}`}>
            {row.map((attr) =>
              attr.id === "__add" ? (
                <td key="add" className={cell}>
                  <PackAdd label="항목 추가" onClick={addExtra} />
                </td>
              ) : (
                <td key={attr.id} className={cn(cell, "group relative")}>
                  {editable ? (
                    <>
                      <div className="flex items-start justify-between gap-0.5">
                        <PackInput
                          value={attr.label}
                          placeholder="제목"
                          className={cn(
                            "min-h-[1.1em] font-medium text-stone underline decoration-stone/30 underline-offset-2",
                            compact ? "text-[8px] print:text-[10px] print:no-underline" : "text-[10px] print:no-underline",
                          )}
                          onCommit={(label) => commitExtra(attr.id, "label", label.trim() || attr.label)}
                        />
                        <PackDel label={`${attr.label || "항목"} 삭제`} onClick={() => removeExtra(attr.id)} />
                      </div>
                      <PackInput
                        value={attr.value || "—"}
                        className="mt-px font-medium"
                        onCommit={(value) => commitExtra(attr.id, "value", value)}
                      />
                    </>
                  ) : (
                    <>
                      <p className={cn("text-stone", compact ? "text-[8px] print:text-[10px]" : "text-[10px]")}>
                        {attr.label}
                      </p>
                      <p className="mt-px font-medium">{attr.value || "—"}</p>
                    </>
                  )}
                </td>
              ),
            )}
            {row.length < 9 && <td colSpan={9 - row.length} className="border border-[#e6e4de]" />}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DrawingBlock({
  product,
  section,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  section: SectionDef;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const slides = drawingSlides(product, section);
  const [index, setIndex] = useState(0);
  const safe = Math.min(index, slides.length - 1);
  const slide = slides[safe] ?? slides[0];
  const many = slides.length > 1;
  const title = many ? `도식화 · ${slide.label}` : section.kind === "flatSpecs" ? "도식화 · 도식화" : `도식화 · ${section.subtitle ?? "도식화"}`;

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col">
      <SectionBar title={title} compact={compact} onJump={onJump} onUnassign={onUnassign} />
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-white">
        {slide.type === "mockup2d" ? (
          <Mockup2D category={product.category} />
        ) : slide.type === "mockup3d" ? (
          <Mockup3D />
        ) : (
          <div className="text-center">
            <MiniFlat category={product.category} className={cn("mx-auto h-auto w-[40%]", compact ? "max-h-[7rem]" : "max-h-[9rem]")} />
            <p className={cn("mt-1 text-stone", compact ? "text-[8px] print:text-[11px]" : "text-[11px]")}>도식화</p>
          </div>
        )}
        {many && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex items-center justify-center gap-2 print:hidden">
            <button
              type="button"
              aria-label="이전 도식화"
              disabled={safe <= 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full border border-[#e6e4de] bg-white text-stone disabled:opacity-30"
            >
              <ChevronLeft size={12} />
            </button>
            <div className="flex items-center gap-1">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-current={i === safe ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={cn("pointer-events-auto h-1.5 w-1.5 rounded-full", i === safe ? "bg-ink" : "bg-black/15 hover:bg-black/30")}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="다음 도식화"
              disabled={safe >= slides.length - 1}
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full border border-[#e6e4de] bg-white text-stone disabled:opacity-30"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CardRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap content-start gap-1.5">{children}</div>;
}

type ItemView = "list" | "grid";

function ItemViewToggle({
  value,
  onChange,
}: {
  value: ItemView;
  onChange: (next: ItemView) => void;
}) {
  return (
    <div className="flex items-center rounded-[3px] print:hidden" role="group" aria-label="보기 방식">
      <button
        type="button"
        aria-pressed={value === "list"}
        aria-label="리스트 보기"
        onClick={() => onChange("list")}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-[3px]",
          value === "list" ? "bg-white text-ink" : "text-stone hover:bg-white/80 hover:text-ink",
        )}
      >
        <List size={10} strokeWidth={2.2} />
      </button>
      <button
        type="button"
        aria-pressed={value === "grid"}
        aria-label="그리드 보기"
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-[3px]",
          value === "grid" ? "bg-white text-ink" : "text-stone hover:bg-white/80 hover:text-ink",
        )}
      >
        <LayoutGrid size={10} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function ColumnPicker({
  options,
  selected,
  onChange,
}: {
  options: { key: string; label: string }[];
  selected?: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const visible = visiblePackColumns(options, selected).map((col) => col.key);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative print:hidden">
      <button
        type="button"
        aria-label="컬럼"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-[3px]",
          open ? "bg-white text-ink" : "text-stone hover:bg-white/80 hover:text-ink",
        )}
      >
        <Columns3 size={10} strokeWidth={2.2} />
      </button>
      {open && (
        <div className="absolute top-5 right-0 z-30 w-[6.25rem] rounded-lg border border-[#e6e4de] bg-white p-0.5 shadow-sm">
          <p className="px-1.5 py-0.5 text-[9px] text-stone">컬럼</p>
          {options.map((col) => {
            const on = visible.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                onClick={() => onChange(togglePackColumn(options, visible, col.key))}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left hover:bg-paper"
              >
                <span
                  className={cn(
                    "flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border",
                    on ? "border-ink bg-ink text-snow" : "border-fog bg-snow",
                  )}
                >
                  {on && <Check size={8} strokeWidth={2.8} />}
                </span>
                <span className="text-[11px] leading-4 text-ink">{col.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FabricBlock({
  product,
  materials,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  materials: Material[];
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [view, setView] = useState<ItemView>("grid");
  const editable = Boolean(onJump);
  const showViewToggle = Boolean(onJump);
  const type = compact ? "text-[9px] print:text-[11px]" : "text-[11px]";
  const columns = visiblePackColumns(FABRIC_PACK_COLUMNS, product.specs.packItemColumns?.fabric);
  const showName = columns.some((col) => col.key === "name");
  const extraCols = columns.filter((col) => col.key !== "name");

  const patchMaterial = (id: string, patch: Partial<Material>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        materials: p.specs.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    }));

  const addFromUpload = (files: FileList | null) => {
    if (!files?.length) return;
    void readFilesAsProductFiles(files, "specs").then((incoming) => {
      updateSpecsField(product.id, (p) => ({
        ...p,
        specs: {
          ...p.specs,
          materials: [
            ...p.specs.materials,
            ...incoming.map((file, i) => ({
              id: `fab-${Date.now()}-${i}`,
              name: file.name.replace(/\.[^.]+$/, "") || "새 원단",
              composition: "",
              weight: "",
              supplier: "",
              color: "",
              image: file.src,
            })),
          ],
        },
      }));
    });
  };

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar
        title="원단"
        compact={compact}
        onJump={onJump}
        onUnassign={onUnassign}
        actions={
          showViewToggle ? (
            <span className="flex items-center gap-0.5">
              <ColumnPicker
                options={FABRIC_PACK_COLUMNS}
                selected={product.specs.packItemColumns?.fabric}
                onChange={(next) => updateSpecsField(product.id, (p) => withPackItemColumns(p, "fabric", next))}
              />
              <ItemViewToggle value={view} onChange={setView} />
            </span>
          ) : undefined
        }
      />
      <div className={cn("min-h-0 flex-1 overflow-auto", view === "list" ? "" : compact ? "p-1.5" : "p-2", type)}>
        {materials.length === 0 && !editable ? (
          <p className="py-3 text-center text-stone">없음</p>
        ) : view === "list" ? (
          <ItemTable
            nameLabel="품명"
            showName={showName}
            columns={extraCols}
            items={materials.map((m) => ({
              id: m.id,
              src: m.image,
              color: m.color,
              name: m.name,
              values: {
                position: m.position ?? "",
                colorName: colorLabel(m.color, m.colorName),
                consumption: m.consumption || m.weight || "",
                yardage: m.yardage ?? "",
                price: m.price ?? "",
              },
              onPatch: (patch) => patchMaterial(m.id, patch),
              onRemove: () =>
                updateSpecsField(product.id, (p) => ({
                  ...p,
                  specs: { ...p.specs, materials: p.specs.materials.filter((row) => row.id !== m.id) },
                })),
            }))}
            editable={editable}
            compact={compact}
            addLabel="원단 추가"
            onAddAsset={() => setImportOpen(true)}
            onAddUpload={() => fileRef.current?.click()}
          />
        ) : (
          <CardRow>
            {materials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                columns={columns}
                editable={editable}
                onPatch={(patch) => patchMaterial(m.id, patch)}
                onRemove={() =>
                  updateSpecsField(product.id, (p) => ({
                    ...p,
                    specs: { ...p.specs, materials: p.specs.materials.filter((row) => row.id !== m.id) },
                  }))
                }
              />
            ))}
            {editable && (
              <PackAddMenu
                label="원단 추가"
                onAsset={() => setImportOpen(true)}
                onUpload={() => fileRef.current?.click()}
              />
            )}
          </CardRow>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFromUpload(e.target.files);
          e.target.value = "";
        }}
      />
      {importOpen && (
        <LibraryImportModal
          kind="fabric"
          onClose={() => setImportOpen(false)}
          onImport={(assets) => {
            const stamp = Date.now();
            updateSpecsField(product.id, (p) => ({
              ...p,
              specs: {
                ...p.specs,
                materials: [...p.specs.materials, ...assets.map((a, i) => materialFromAsset(a, `fab-${stamp}-${i}`))],
              },
            }));
            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TrimBlock({
  product,
  trims,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  trims: TrimItem[];
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [view, setView] = useState<ItemView>("list");
  const editable = Boolean(onJump);
  const showViewToggle = Boolean(onJump);
  const type = compact ? "text-[9px] print:text-[11px]" : "text-[11px]";
  const columns = visiblePackColumns(TRIM_PACK_COLUMNS, product.specs.packItemColumns?.trim);
  const showName = columns.some((col) => col.key === "name");
  const extraCols = columns.filter((col) => col.key !== "name");

  const patchTrim = (id: string, patch: Partial<TrimItem>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, trims: p.specs.trims.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
    }));

  const addFromUpload = (files: FileList | null) => {
    if (!files?.length) return;
    void readFilesAsProductFiles(files, "specs").then((incoming) => {
      updateSpecsField(product.id, (p) => ({
        ...p,
        specs: {
          ...p.specs,
          trims: [
            ...p.specs.trims,
            ...incoming.map((file, i) => ({
              id: `tr-${Date.now()}-${i}`,
              name: file.name.replace(/\.[^.]+$/, "") || "새 부자재",
              type: "",
              spec: "",
              color: "",
              image: file.src,
            })),
          ],
        },
      }));
    });
  };

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col">
      <SectionBar
        title="부자재"
        compact={compact}
        onJump={onJump}
        onUnassign={onUnassign}
        actions={
          showViewToggle ? (
            <span className="flex items-center gap-0.5">
              <ColumnPicker
                options={TRIM_PACK_COLUMNS}
                selected={product.specs.packItemColumns?.trim}
                onChange={(next) => updateSpecsField(product.id, (p) => withPackItemColumns(p, "trim", next))}
              />
              <ItemViewToggle value={view} onChange={setView} />
            </span>
          ) : undefined
        }
      />
      <div className={cn("min-h-0 flex-1 overflow-auto", view === "grid" ? (compact ? "p-1.5" : "p-2") : "", type)}>
        {trims.length === 0 && !editable ? (
          <p className="py-3 text-center text-stone">없음</p>
        ) : view === "grid" ? (
          <CardRow>
            {trims.map((t) => (
              <TrimCard
                key={t.id}
                trim={t}
                columns={columns}
                editable={editable}
                onPatch={(patch) => patchTrim(t.id, patch)}
                onRemove={() =>
                  updateSpecsField(product.id, (p) => ({
                    ...p,
                    specs: { ...p.specs, trims: p.specs.trims.filter((row) => row.id !== t.id) },
                  }))
                }
              />
            ))}
            {editable && (
              <PackAddMenu
                label="부자재 추가"
                onAsset={() => setImportOpen(true)}
                onUpload={() => fileRef.current?.click()}
              />
            )}
          </CardRow>
        ) : (
          <ItemTable
            nameLabel="품명"
            showName={showName}
            columns={extraCols}
            items={trims.map((t) => ({
              id: t.id,
              src: t.image,
              color: t.color,
              name: t.name,
              values: {
                position: t.position ?? "",
                type: t.type ?? "",
                qty: t.qty || t.spec || "",
                yardage: t.yardage ?? "",
                price: t.price ?? "",
              },
              onPatch: (patch) => patchTrim(t.id, patch),
              onRemove: () =>
                updateSpecsField(product.id, (p) => ({
                  ...p,
                  specs: { ...p.specs, trims: p.specs.trims.filter((row) => row.id !== t.id) },
                })),
            }))}
            editable={editable}
            compact={compact}
            addLabel="부자재 추가"
            onAddAsset={() => setImportOpen(true)}
            onAddUpload={() => fileRef.current?.click()}
          />
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFromUpload(e.target.files);
          e.target.value = "";
        }}
      />
      {importOpen && (
        <LibraryImportModal
          kind="trim"
          onClose={() => setImportOpen(false)}
          onImport={(assets) => {
            const stamp = Date.now();
            updateSpecsField(product.id, (p) => ({
              ...p,
              specs: {
                ...p.specs,
                trims: [...p.specs.trims, ...assets.map((a, i) => trimFromAsset(a, `tr-${stamp}-${i}`))],
              },
            }));
            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}

const CARD_SIZE = "w-[132px]";

function ItemTable({
  nameLabel,
  showName = true,
  columns,
  items,
  editable,
  compact,
  addLabel,
  onAddAsset,
  onAddUpload,
}: {
  nameLabel: string;
  showName?: boolean;
  columns: { key: string; label: string }[];
  items: {
    id: string;
    src?: string;
    color?: string;
    name: string;
    values: Record<string, string>;
    onPatch: (patch: Record<string, string>) => void;
    onRemove: () => void;
  }[];
  editable?: boolean;
  compact?: boolean;
  addLabel?: string;
  onAddAsset?: () => void;
  onAddUpload?: () => void;
}) {
  const cell = compact ? "border border-[#e6e4de] px-2.5 py-0.5" : "border border-[#e6e4de] px-3 py-1";
  const thumb = compact ? 18 : 24;
  const colSpan = 1 + (showName ? 1 : 0) + columns.length + (editable ? 1 : 0);

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#f3f2ef]">
          <th className={cn(cell, "w-7")} />
          {showName && <th className={cn(cell, "text-left font-medium text-stone")}>{nameLabel}</th>}
          {columns.map((col) => (
            <th key={col.key} className={cn(cell, "text-left font-medium text-stone")}>
              {col.label}
            </th>
          ))}
          {editable && <th className={cn(cell, "w-5 print:hidden")} />}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="group">
            <td className={cn(cell, "w-7 p-0.5")}>
              <ListThumb src={item.src} color={item.color} label={`${item.name} 썸네일`} side={thumb} />
            </td>
            {showName && (
              <td className={cn(cell, "font-medium")}>
                {editable ? (
                  <PackInput value={item.name} onCommit={(name) => item.onPatch({ name })} />
                ) : (
                  <span className="block truncate">{item.name || "—"}</span>
                )}
              </td>
            )}
            {columns.map((col) => (
              <td key={col.key} className={cell}>
                {editable ? (
                  <PackInput
                    value={item.values[col.key] ?? ""}
                    onCommit={(next) => item.onPatch({ [col.key]: next })}
                  />
                ) : (
                  <span className="block truncate">{item.values[col.key] || "—"}</span>
                )}
              </td>
            ))}
            {editable && (
              <td className={cn(cell, "w-5 text-center print:hidden")}>
                <PackDel label={`${item.name} 삭제`} onClick={item.onRemove} />
              </td>
            )}
          </tr>
        ))}
        {editable && addLabel && onAddAsset && onAddUpload && (
          <tr className="print:hidden">
            <td className={cell} colSpan={colSpan}>
              <PackAddMenu label={addLabel} onAsset={onAddAsset} onUpload={onAddUpload} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function FieldLine({
  label,
  value,
  editable,
  placeholder,
  onCommit,
  strong,
}: {
  label: string;
  value: string;
  editable?: boolean;
  placeholder?: string;
  onCommit?: (next: string) => void;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1 leading-tight">
      <span className="w-[2.75rem] shrink-0 text-stone">{label}</span>
      {editable && onCommit ? (
        <PackInput
          value={value}
          placeholder={placeholder ?? "—"}
          className={cn("min-w-0 flex-1", strong && "font-medium")}
          onCommit={onCommit}
        />
      ) : (
        <span className={cn("min-w-0 truncate", strong && "font-medium")}>{value || "—"}</span>
      )}
    </div>
  );
}

function MaterialCard({
  material,
  columns,
  editable,
  onPatch,
  onRemove,
}: {
  material: Material;
  columns: { key: string; label: string }[];
  editable?: boolean;
  onPatch?: (patch: Partial<Material>) => void;
  onRemove?: () => void;
}) {
  const values: Record<string, string> = {
    name: material.name,
    position: material.position ?? "",
    colorName: colorLabel(material.color, material.colorName),
    consumption: material.consumption || material.weight || "",
    yardage: material.yardage ?? "",
    price: material.price ?? "",
  };
  return (
    <ItemCard
      src={material.image}
      color={material.color}
      name={material.name}
      nameLabel="품명"
      showName={columns.some((col) => col.key === "name")}
      lines={columns
        .filter((col) => col.key !== "name")
        .map((col) => ({ key: col.key, label: col.label, value: values[col.key] ?? "" }))}
      editable={editable}
      onPatch={onPatch}
      onRemove={onRemove}
    />
  );
}

function TrimCard({
  trim,
  columns,
  editable,
  onPatch,
  onRemove,
}: {
  trim: TrimItem;
  columns: { key: string; label: string }[];
  editable?: boolean;
  onPatch?: (patch: Partial<TrimItem>) => void;
  onRemove?: () => void;
}) {
  const values: Record<string, string> = {
    name: trim.name,
    position: trim.position ?? "",
    type: trim.type ?? "",
    qty: trim.qty || trim.spec || "",
    yardage: trim.yardage ?? "",
    price: trim.price ?? "",
  };
  return (
    <ItemCard
      src={trim.image}
      color={trim.color}
      name={trim.name}
      nameLabel="품명"
      showName={columns.some((col) => col.key === "name")}
      lines={columns
        .filter((col) => col.key !== "name")
        .map((col) => ({ key: col.key, label: col.label, value: values[col.key] ?? "" }))}
      editable={editable}
      onPatch={onPatch}
      onRemove={onRemove}
    />
  );
}

function ItemCard({
  src,
  color,
  name,
  nameLabel,
  showName = true,
  lines,
  editable,
  onPatch,
  onRemove,
}: {
  src?: string;
  color?: string;
  name: string;
  nameLabel: string;
  showName?: boolean;
  lines: { key: string; value: string; label: string }[];
  editable?: boolean;
  onPatch?: (patch: Record<string, string>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className={cn(CARD_SIZE, "group relative shrink-0 overflow-hidden border border-[#e6e4de] bg-white")}>
      {editable && onRemove && (
        <span className="absolute top-0.5 right-0.5 z-10">
          <PackDel label={`${name} 삭제`} onClick={onRemove} />
        </span>
      )}
      <CardThumb src={src} color={color} label={`${name} 썸네일`} />
      <div className={cn("space-y-px px-1 py-1", "text-[9px] print:text-[11px]")}>
        {showName && (
          <FieldLine
            label={nameLabel}
            value={name}
            strong
            editable={editable}
            onCommit={(next) => onPatch?.({ name: next })}
          />
        )}
        {lines.map((line) => (
          <FieldLine
            key={line.key}
            label={line.label}
            value={line.value}
            editable={editable}
            onCommit={(next) => onPatch?.({ [line.key]: next })}
          />
        ))}
      </div>
    </div>
  );
}

function ItemListRow({
  src,
  color,
  name,
  nameLabel,
  lines,
  editable,
  onPatch,
  onRemove,
}: {
  src?: string;
  color?: string;
  name: string;
  nameLabel: string;
  lines: { key: string; value: string; label: string }[];
  editable?: boolean;
  onPatch?: (patch: Record<string, string>) => void;
  onRemove?: () => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const apply = () => setSide(el.offsetHeight);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="group flex items-start gap-1.5 px-2.5 py-1">
      <ListThumb src={src} color={color} label={`${name} 썸네일`} side={side} />
      <div ref={textRef} className="min-w-0 flex-1 space-y-px">
        <FieldLine
          label={nameLabel}
          value={name}
          strong
          editable={editable}
          onCommit={(next) => onPatch?.({ name: next })}
        />
        {lines.map((line) => (
          <FieldLine
            key={line.key}
            label={line.label}
            value={line.value}
            editable={editable}
            onCommit={(next) => onPatch?.({ [line.key]: next })}
          />
        ))}
      </div>
      {editable && onRemove && <PackDel label={`${name} 삭제`} onClick={onRemove} />}
    </div>
  );
}

function ListThumb({
  src,
  color,
  label,
  side,
}: {
  src?: string;
  color?: string;
  label: string;
  side: number;
}) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;
  const fill = swatchColor(color);
  const px = side || 32;

  return (
    <div
      role="img"
      aria-label={label}
      className="relative shrink-0 overflow-hidden border border-[#e6e4de] bg-[#ececec]"
      style={{ width: px, height: px }}
    >
      {showImg ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : fill ? (
        <span className="absolute inset-0" style={{ background: fill }} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[7px] text-stone">없음</span>
      )}
    </div>
  );
}

function CardThumb({ src, color, label }: { src?: string; color?: string; label: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;
  const fill = swatchColor(color);

  return (
    <div role="img" aria-label={label} className="relative aspect-square w-full overflow-hidden bg-[#ececec]">
      {showImg ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : fill ? (
        <span className="absolute inset-0" style={{ background: fill }} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-stone">이미지 없음</span>
      )}
    </div>
  );
}

function SizeBlock({
  product,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const sizes = productSizes(product);
  const rows = product.specs.measurements.length ? product.specs.measurements : DEFAULT_MEASURE_ROWS;
  const editable = Boolean(onJump);
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[11px]";
  const cell = compact ? "border-b border-[#eee] px-2.5 py-0.5" : "border-b border-[#eee] px-3 py-1";
  const patch = (updater: (p: Product) => Product) => updateSpecsField(product.id, updater);

  const commitInch = (pom: string, size: string, raw: string) => {
    const inch = Number(raw);
    const cm = Number.isFinite(inch) ? inch * CM_PER_INCH : undefined;
    patch((p) => {
      const currentSizes = productSizes(p);
      const source = p.specs.measurements.length ? p.specs.measurements : rows;
      return {
        ...p,
        specs: {
          ...p.specs,
          measurements: source.map((row) => {
            if (row.pom !== pom) return row;
            const values: Record<string, number> = { ...(row.values ?? {}) };
            for (const sz of currentSizes) {
              if (values[sz] == null) {
                const legacy = rowValueCm(row, sz);
                if (legacy != null) values[sz] = legacy;
              }
            }
            if (cm == null) delete values[size];
            else values[size] = cm;
            return { ...row, values };
          }),
        },
      };
    });
  };

  const commitLabel = (pom: string, label: string) =>
    patch((p) => ({
      ...p,
      specs: {
        ...p.specs,
        measurements: (p.specs.measurements.length ? p.specs.measurements : rows).map((row) =>
          row.pom === pom ? { ...row, label } : row,
        ),
      },
    }));

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col">
      <SectionBar title="Size Spec" extra="inch/단면" compact={compact} onJump={onJump} onUnassign={onUnassign} />
      <div className="min-h-0 flex-1 overflow-auto">
      <table className={cn("w-full border-collapse", type)}>
        <thead>
          <tr className="bg-[#f7f6f3] text-stone">
            <th className={cn(cell, "text-left font-medium")}>항목</th>
            {sizes.map((sz) => (
              <th key={sz} className={cn(cell, "whitespace-nowrap text-right font-medium")}>
                <span className="group inline-flex items-center justify-end gap-0.5">
                  {editable ? (
                    <PackSizeInput
                      value={sz}
                      taken={sizes}
                      onRename={(next) => patch((p) => renameSizeColumn(p, sz, next))}
                    />
                  ) : (
                    sz
                  )}
                  {editable && sizes.length > 1 && (
                    <PackDel label={`${sz} 열 삭제`} onClick={() => patch((p) => removeSizeColumn(p, sz))} />
                  )}
                </span>
              </th>
            ))}
            {editable && (
              <th className={cn(cell, "w-5 print:hidden")}>
                <PackAdd label="사이즈 열 추가" onClick={() => patch(addSizeColumn)} />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.pom} className="group">
              <td className={cn(cell, "text-stone")}>
                {editable ? (
                  <span className="inline-flex w-full items-center gap-0.5">
                    <PackInput
                      value={POM_KO[row.label] ?? row.label}
                      onCommit={(label) => commitLabel(row.pom, label)}
                    />
                    <PackDel label={`${row.label} 행 삭제`} onClick={() => patch((p) => removeMeasurementRow(p, row.pom))} />
                  </span>
                ) : (
                  POM_KO[row.label] ?? row.label
                )}
              </td>
              {sizes.map((sz) => (
                <td key={sz} className={cn(cell, "text-right font-medium")}>
                  {editable ? (
                    <PackInput
                      value={formatInch(rowValueCm(row, sz))}
                      align="right"
                      onCommit={(raw) => commitInch(row.pom, sz, raw)}
                    />
                  ) : (
                    formatInch(rowValueCm(row, sz))
                  )}
                </td>
              ))}
              {editable && <td className={cn(cell, "print:hidden")} />}
            </tr>
          ))}
          {editable && (
            <tr className="print:hidden">
              <td className={cell}>
                <PackAdd label="측정 항목 행 추가" onClick={() => patch(addMeasurementRow)} />
              </td>
              {sizes.map((sz) => (
                <td key={sz} className={cell} />
              ))}
              <td className={cell} />
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function QtyBlock({
  product,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const sizes = productSizes(product);
  const colors = product.specs.colorways.length
    ? product.specs.colorways
    : [{ id: "x", name: "—", hex: "#ddd", main: "", sub: "", code: "" }];
  const editable = Boolean(onJump);
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[11px]";
  const cell = compact ? "border-b border-[#eee] px-2.5 py-0.5" : "border-b border-[#eee] px-3 py-1";
  const patch = (updater: (p: Product) => Product) => updateSpecsField(product.id, updater);

  const commitQty = (colorId: string, size: string, raw: string) => {
    const qty = Math.max(0, Math.round(Number(raw)));
    if (!Number.isFinite(qty)) return;
    patch((p) => {
      const current = p.specs.colorways.length ? p.specs.colorways : colors;
      return patchSizeRange(
        p,
        productSizes(p),
        current.map((c) => (c.id === colorId ? { ...c, qtyBySize: { ...(c.qtyBySize ?? {}), [size]: qty } } : c)),
      );
    });
  };

  const commitColorName = (colorId: string, name: string) => {
    patch((p) => ({
      ...p,
      specs: {
        ...p.specs,
        colorways: (p.specs.colorways.length ? p.specs.colorways : colors).map((c) =>
          c.id === colorId ? { ...c, name, main: name } : c,
        ),
      },
    }));
  };

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="색상/사이즈 별 수량" compact={compact} onJump={onJump} onUnassign={onUnassign} />
      <div className="min-h-0 flex-1 overflow-auto">
      <table className={cn("w-full border-collapse", type)}>
        <thead>
          <tr className="bg-[#f7f6f3] text-stone">
            <th className={cn(cell, "text-left font-medium")}>색상</th>
            {sizes.map((sz) => (
              <th key={sz} className={cn(cell, "whitespace-nowrap text-right font-medium")}>
                <span className="group inline-flex items-center justify-end gap-0.5">
                  {editable ? (
                    <PackSizeInput
                      value={sz}
                      taken={sizes}
                      onRename={(next) => patch((p) => renameSizeColumn(p, sz, next))}
                    />
                  ) : (
                    sz
                  )}
                  {editable && sizes.length > 1 && (
                    <PackDel label={`${sz} 열 삭제`} onClick={() => patch((p) => removeSizeColumn(p, sz))} />
                  )}
                </span>
              </th>
            ))}
            {editable && (
              <th className={cn(cell, "w-5 print:hidden")}>
                <PackAdd label="사이즈 열 추가" onClick={() => patch(addSizeColumn)} />
              </th>
            )}
            <th className={cn(cell, "whitespace-nowrap text-right font-medium")}>합계</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((c) => {
            const total = sizes.reduce((a, sz) => a + (c.qtyBySize?.[sz] ?? 0), 0);
            return (
              <tr key={c.id} className="group">
                <td className={cell}>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 shrink-0 border border-black/10" style={{ background: c.hex }} />
                    {editable ? (
                      <PackInput value={c.name} onCommit={(name) => commitColorName(c.id, name)} />
                    ) : (
                      c.name
                    )}
                    {editable && colors.length > 1 && (
                      <PackDel label={`${c.name} 행 삭제`} onClick={() => patch((p) => removeColorRow(p, c.id))} />
                    )}
                  </span>
                </td>
                {sizes.map((sz) => (
                  <td key={sz} className={cn(cell, "text-right font-medium")}>
                    {editable ? (
                      <PackInput
                        value={String(c.qtyBySize?.[sz] ?? 0)}
                        align="right"
                        onCommit={(raw) => commitQty(c.id, sz, raw)}
                      />
                    ) : (
                      c.qtyBySize?.[sz] ?? 0
                    )}
                  </td>
                ))}
                {editable && <td className={cn(cell, "print:hidden")} />}
                <td className={cn(cell, "whitespace-nowrap text-right font-medium")}>{total}</td>
              </tr>
            );
          })}
          {editable && (
            <tr className="print:hidden">
              <td className={cell}>
                <PackAdd label="색상 행 추가" onClick={() => patch(addColorRow)} />
              </td>
              {sizes.map((sz) => (
                <td key={sz} className={cell} />
              ))}
              <td className={cell} />
              <td className={cell} />
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function LabelBlock({
  product,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const editable = Boolean(onJump);
  const type = compact ? "text-[9px] print:text-[11px]" : "text-[11px]";
  const labels = product.specs.labels;

  const patchLabel = (id: string, patch: Partial<LabelSpec>) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, labels: p.specs.labels.map((lb) => (lb.id === id ? { ...lb, ...patch } : lb)) },
    }));

  const addLabel = () =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        labels: [...p.specs.labels, { id: `lb-${Date.now()}`, kind: "main", name: "새 라벨", material: "", size: "", position: "" }],
      },
    }));

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="라벨" compact={compact} onJump={onJump} onUnassign={onUnassign} />
      <div className={cn("min-h-0 flex-1 overflow-auto", type)}>
        {labels.length === 0 && !editable ? (
          <p className="px-2.5 py-3 text-center text-stone">없음</p>
        ) : (
          <div className="divide-y divide-[#eee]">
            {labels.map((lb) => (
              <ItemListRow
                key={lb.id}
                src={lb.image}
                name={lb.name}
                nameLabel="라벨명"
                lines={[
                  { key: "position", value: lb.position, label: "위치" },
                  { key: "material", value: lb.material, label: "소재" },
                  { key: "size", value: lb.size, label: "사이즈" },
                ]}
                editable={editable}
                onPatch={(patch) => patchLabel(lb.id, patch)}
                onRemove={() =>
                  updateSpecsField(product.id, (p) => ({
                    ...p,
                    specs: { ...p.specs, labels: p.specs.labels.filter((row) => row.id !== lb.id) },
                  }))
                }
              />
            ))}
            {editable && (
              <div className="px-2.5 pt-1">
                <PackAdd label="라벨 추가" onClick={addLabel} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotesBlock({
  product,
  compact,
  onJump,
  onUnassign,
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
  onUnassign?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const editable = Boolean(onJump);
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[12px]";
  const body = product.specs.notes[0]?.body ?? "";

  const commitBody = (html: string) =>
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        notes: p.specs.notes.length
          ? p.specs.notes.map((n, i) => (i === 0 ? { ...n, body: html } : n))
          : [{ title: "주의사항", body: html }],
      },
    }));

  return (
    <div className="group/packsec flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="주의사항" compact={compact} onJump={onJump} onUnassign={onUnassign} />
      {editable ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <NotesEditor compact={compact} value={body} onChange={commitBody} />
        </div>
      ) : product.specs.notes.length === 0 ? (
        <p className={cn("py-4 text-center text-stone", compact ? "p-2" : "p-3", type)}>없음</p>
      ) : (
        <div className={cn("min-h-0 flex-1 overflow-auto", compact ? "p-2" : "p-3", type)}>
          {product.specs.notes.map((n, i) => (
            <div key={`${n.title}-${i}`} className="mb-1.5 last:mb-0">
              {n.title?.trim() && <p className="font-medium">{n.title}</p>}
              <div className="notes-html mt-px text-stone" dangerouslySetInnerHTML={{ __html: n.body || "" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
