"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  ExternalLink,
  FileText,
  FolderDown,
  Hash,
  Link2,
  Package,
  PenTool,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Ruler,
  Share2,
  Shirt,
  SquareArrowOutUpRight,
  StickyNote,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { CompletenessMenu } from "./completeness-bar";
import { MiniFlat } from "./ui";
import { NotesEditor } from "./notes-editor";
import { Mockup2D, Mockup3D } from "./flats";
import { LibraryImportModal } from "./library-import-modal";
import { MiscPageSurface, MiscPageToolbar, useMiscPageSession } from "./misc-board";
import { collections, userById } from "@/lib/data";
import { materialFromAsset, trimFromAsset } from "@/lib/library-import";
import { emptyMiscPage, miscBoardOf, pageSize } from "@/lib/misc-board";
import { isImageFile, printShareFiles, downloadProductFile, readFilesAsProductFiles } from "@/lib/product-files";
import { useWorkspace } from "@/lib/store";
import type {
  CanvasNode,
  Colorway,
  LabelSpec,
  Material,
  MeasurementRow,
  MiscPage,
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
  kind: "flatSpecs" | "drawing" | "basic" | "fabric" | "trim" | "label" | "size" | "qty" | "notes";
  node?: CanvasNode;
};

type ShareAlbumItem =
  | { id: string; kind: "pack"; packPage: number }
  | { id: string; kind: "misc"; page: MiscPage; index: number }
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

function drawingNodes(product: Product) {
  return product.nodes.filter((n) => n.type === "flat" || n.type === "mockup2d" || n.type === "mockup3d");
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
  const drawings = drawingNodes(product);
  return [
    { id: "flatSpecs", label: "도식화", badge: "specs", kind: "flatSpecs" },
    ...drawings.map((n, i) => ({
      id: `draw:${n.id}`,
      label: "도식화",
      badge: "일반" as const,
      subtitle: n.title || `Technical Drawing (${i + 1})`,
      kind: "drawing" as const,
      node: n,
    })),
    ...STATIC_SECTIONS.map((s) => ({ id: s.id, label: s.label, kind: s.id })),
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
  return kind;
}

function defaultOn(sections: SectionDef[]): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const s of sections) next[s.id] = s.kind !== "drawing";
  return next;
}

function defaultPages(sections: SectionDef[]): Record<string, number> {
  const next: Record<string, number> = {};
  for (const s of sections) next[s.id] = 1;
  return next;
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
  const sheets = Array.from(document.querySelectorAll<HTMLElement>(".tech-pack-sheet"));
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
}: {
  product: Product;
  onClose?: () => void;
  variant?: "editor" | "share" | "workspace";
  onJumpSpecs?: (section: string) => void;
}) {
  const { workspaces, updateSpecsField } = useWorkspace();
  const ws = workspaces.find((w) => w.id === product.workspaceId);
  const owner = userById(product.ownerId);
  const sections = useMemo(() => buildSections(product), [product]);
  const isShare = variant === "share";

  const [onePage, setOnePage] = useState(true);
  const [pageCount, setPageCount] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [on, setOn] = useState<Record<string, boolean>>(() => defaultOn(sections));
  const [pageOf, setPageOf] = useState<Record<string, number>>(() => defaultPages(sections));
  const [albumIndex, setAlbumIndex] = useState(0);
  const printPack = () => printTechPackSheets();

  const season = seasonLabel(product);
  const [miscOn, setMiscOn] = useState<Record<string, boolean>>({});
  const [layoutNonce, setLayoutNonce] = useState(0);
  const miscPages = useMemo(() => miscBoardOf(product.specs), [product]);
  const isMiscOn = (id: string) => miscOn[id] !== false;
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1);
  const sheetPages = onePage ? [1] : pages;

  const album = useMemo(() => {
    const packPages = onePage ? [1] : Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1);
    const items: ShareAlbumItem[] = packPages.map((packPage) => ({
      id: `pack-${packPage}`,
      kind: "pack" as const,
      packPage,
    }));
    for (const [index, page] of miscPages.entries()) {
      if (!isMiscOn(page.id)) continue;
      items.push({ id: `misc-${page.id}`, kind: "misc", page, index });
    }
    if (isShare) {
      const prints = printShareFiles(product.files);
      if (prints.length) {
        items.push({ id: "prints", kind: "prints", files: prints });
      }
    }
    return items;
  }, [isShare, miscOn, miscPages, onePage, pageCount, product]);

  const safeAlbumIndex = Math.min(albumIndex, Math.max(0, album.length - 1));
  const currentAlbum = album[safeAlbumIndex] ?? album[0];
  const showPager = album.length > 1;
  const pagerCount = album.length;
  const pagerView = safeAlbumIndex + 1;
  const viewPage =
    currentAlbum?.kind === "pack" ? currentAlbum.packPage : onePage ? 1 : Math.min(currentPage, pages.length);
  const albumCaption =
    currentAlbum?.kind === "pack"
      ? sheetPages.length > 1
        ? `작업지시서 ${currentAlbum.packPage}`
        : "작업지시서"
      : currentAlbum?.kind === "misc"
        ? currentAlbum.page.title?.trim() || `기타 ${currentAlbum.index + 1}`
        : currentAlbum?.kind === "prints"
          ? "인쇄"
          : "";

  const visibleOnPage = (page: number) =>
    sections.filter((s) => on[s.id] && (onePage || (pageOf[s.id] ?? 1) === page));

  const toggleOnePage = () => {
    setOnePage((v) => {
      if (v && pageCount < 2) setPageCount(2);
      return !v;
    });
  };

  const addPage = () => setPageCount((n) => n + 1);

  const removePage = (page: number) => {
    if (pageCount <= 1) return;
    setPageOf((map) => {
      const next: Record<string, number> = {};
      for (const [id, p] of Object.entries(map)) {
        if (p === page) next[id] = 1;
        else if (p > page) next[id] = p - 1;
        else next[id] = p;
      }
      return next;
    });
    setPageCount((n) => Math.max(1, n - 1));
    setCurrentPage((c) => {
      if (c === page) return Math.max(1, page - 1);
      if (c > page) return c - 1;
      return c;
    });
  };

  const reset = () => {
    setOn(defaultOn(sections));
    setPageOf(defaultPages(sections));
    setMiscOn({});
    clearPackLayout(product.id);
    setLayoutNonce((n) => n + 1);
  };

  const renameMiscPage = (id: string, title: string) => {
    const next = title.trim();
    if (!next) return;
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        miscBoard: miscBoardOf(p.specs).map((page) => (page.id === id ? { ...page, title: next } : page)),
      },
    }));
  };

  const patchMiscPage = (id: string, next: MiscPage) => {
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: {
        ...p.specs,
        miscBoard: miscBoardOf(p.specs).map((page) => (page.id === id ? next : page)),
      },
    }));
  };

  const deleteMiscPage = (id: string) => {
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, miscBoard: miscBoardOf(p.specs).filter((page) => page.id !== id) },
    }));
    setMiscOn((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });
    setAlbumIndex((i) => Math.max(0, i - 1));
  };

  const addMiscPage = () => {
    const next = emptyMiscPage(miscPages.length + 1);
    updateSpecsField(product.id, (p) => ({
      ...p,
      specs: { ...p.specs, miscBoard: [...miscBoardOf(p.specs), next] },
    }));
    setMiscOn((m) => ({ ...m, [next.id]: true }));
    const packLen = onePage ? 1 : pageCount;
    const before = miscPages.filter((p) => isMiscOn(p.id)).length;
    setAlbumIndex(packLen + before);
  };

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

  const embedded = variant === "workspace";
  const showCompose = variant !== "share";

  return (
    <div
      className={cn(
        "tech-pack-root flex flex-col overflow-hidden bg-paper",
        embedded ? "relative h-full canvas-dot" : "fixed inset-0 z-50 h-svh",
      )}
    >
      {variant === "share" ? (
        <ShareCopyLinkButton />
      ) : variant === "workspace" ? (
        <div className="tech-pack-chrome pointer-events-none absolute top-3 right-4 z-20 print:hidden">
          {onJumpSpecs && <CompletenessMenu product={product} onJump={onJumpSpecs} />}
        </div>
      ) : (
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
        {showCompose && (
        <aside className="tech-pack-chrome flex w-[268px] shrink-0 flex-col border-r border-mist bg-snow print:hidden">
          <div className="px-3.5 pt-4 pb-3">
            <p className="text-[10px] font-medium tracking-[0.18em] text-stone uppercase">출력</p>
            <div className="mt-2.5 rounded-2xl bg-paper px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] tracking-tight">한 장에 모두</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-stone">
                    {onePage ? "섹션을 한 페이지에 모읍니다" : "페이지를 나눠 배치합니다"}
                  </p>
                </div>
                <Switch on={onePage} onClick={toggleOnePage} />
              </div>
              {!onePage && (
                <div className="mt-2.5 space-y-1.5 border-t border-mist pt-2.5">
                  {pages.map((n) => (
                    <div
                      key={n}
                      className={cn(
                        "flex h-8 items-center justify-between rounded-full px-2.5 text-[12px]",
                        n === viewPage ? "bg-snow text-ink" : "text-stone hover:bg-snow/70",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(n);
                          const idx = album.findIndex((item) => item.kind === "pack" && item.packPage === n);
                          if (idx >= 0) setAlbumIndex(idx);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        {n}페이지
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(n)}
                        disabled={pageCount <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink disabled:opacity-30"
                        aria-label={`${n}페이지 삭제`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPage}
                    className="flex h-8 w-full items-center justify-center gap-1 rounded-full text-[12px] text-stone hover:bg-snow hover:text-ink"
                  >
                    <Plus size={12} />
                    페이지 추가
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-3.5 pb-2">
            <p className="text-[10px] font-medium tracking-[0.18em] text-stone uppercase">구성</p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-stone hover:bg-paper hover:text-ink"
            >
              <RotateCcw size={11} />
              초기화
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-4">
            <p className="px-1 pb-1.5 text-[11px] text-stone">도식화</p>
            <div className="space-y-1">
              {sections
                .filter((s) => s.kind === "flatSpecs" || s.kind === "drawing")
                .filter((s) => !isLinkedMockupCovered(s, sections))
                .map((sec) => (
                  <SectionRow
                    key={sec.id}
                    section={sec}
                    on={Boolean(on[sec.id])}
                    onePage={onePage}
                    page={pageOf[sec.id] ?? 1}
                    pages={pages}
                    onToggle={() => setOn((s) => ({ ...s, [sec.id]: !s[sec.id] }))}
                    onPage={(n) => setPageOf((m) => ({ ...m, [sec.id]: n }))}
                  />
                ))}
            </div>
            <p className="px-1 pb-1.5 pt-3.5 text-[11px] text-stone">스펙</p>
            <div className="space-y-1">
              {sections
                .filter((s) => s.kind !== "flatSpecs" && s.kind !== "drawing")
                .map((sec) => (
                  <SectionRow
                    key={sec.id}
                    section={sec}
                    on={Boolean(on[sec.id])}
                    onePage={onePage}
                    page={pageOf[sec.id] ?? 1}
                    pages={pages}
                    onToggle={() => setOn((s) => ({ ...s, [sec.id]: !s[sec.id] }))}
                    onPage={(n) => setPageOf((m) => ({ ...m, [sec.id]: n }))}
                  />
                ))}
            </div>
            <p className="px-1 pb-1.5 pt-3.5 text-[11px] text-stone">기타</p>
            <div className="space-y-1">
              {miscPages.length === 0 ? (
                <button
                  type="button"
                  onClick={addMiscPage}
                  className="flex h-8 w-full items-center justify-center gap-1 rounded-full text-[12px] text-stone hover:bg-snow hover:text-ink"
                >
                  <Plus size={12} />
                  페이지 추가
                </button>
              ) : (
                miscPages.map((page, index) => (
                  <MiscRow
                    key={page.id}
                    title={page.title?.trim() || `${index + 1}페이지`}
                    on={isMiscOn(page.id)}
                    onToggle={() => {
                      const nextOn = !isMiscOn(page.id);
                      setMiscOn((m) => ({ ...m, [page.id]: nextOn }));
                      if (nextOn) {
                        const packLen = onePage ? 1 : pageCount;
                        const before = miscPages.filter((p, i) => i < index && isMiscOn(p.id)).length;
                        setAlbumIndex(packLen + before);
                      }
                    }}
                    onTitle={(title) => renameMiscPage(page.id, title)}
                    onOpen={() => {
                      if (!isMiscOn(page.id)) return;
                      const packLen = onePage ? 1 : pageCount;
                      const before = miscPages.filter((p, i) => i < index && isMiscOn(p.id)).length;
                      setAlbumIndex(packLen + before);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </aside>
        )}

        <div className="tech-pack-stage flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="tech-pack-stage-body flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
            <FitA4Landscape>
              {sheetPages.map((page) => {
                const packVisible = currentAlbum?.kind === "pack" && currentAlbum.packPage === page;
                return (
                <div
                  key={page}
                  className={cn(
                    "h-full w-full",
                    !packVisible && "hidden print:block",
                  )}
                >
                  <Sheet
                    product={product}
                    workspaceName={ws?.name ?? "내 워크스페이스"}
                    ownerName={owner?.name ?? "—"}
                    season={season}
                    page={page}
                    showPageNo={!onePage}
                    sections={visibleOnPage(page)}
                    compact={embedded}
                    resizable={!isShare}
                    layoutNonce={layoutNonce}
                    onJump={isShare ? undefined : onJumpSpecs}
                  />
                </div>
                );
              })}
              {currentAlbum?.kind === "misc" && (
                <ShareMiscSheet
                  key={currentAlbum.page.id}
                  page={currentAlbum.page}
                  index={currentAlbum.index}
                  compact={embedded}
                  productCode={product.code}
                  version={product.version}
                  onJump={isShare ? undefined : () => onJumpSpecs?.("misc")}
                  onTitle={isShare ? undefined : (title) => renameMiscPage(currentAlbum.page.id, title)}
                  onDeletePage={isShare ? undefined : () => deleteMiscPage(currentAlbum.page.id)}
                  onChangePage={isShare ? undefined : (next) => patchMiscPage(currentAlbum.page.id, next)}
                />
              )}
              {isShare && currentAlbum?.kind === "prints" && <SharePrintSheet files={currentAlbum.files} />}
            </FitA4Landscape>
          </div>
          {showPager && (
            <div className="tech-pack-chrome flex shrink-0 flex-col items-center justify-center gap-1.5 pb-3 print:hidden">
              <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAlbumIndex((i) => Math.max(0, i - 1))}
                disabled={pagerView <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-mist disabled:opacity-30"
                aria-label="이전 페이지"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5">
                {album.map((item, i) => {
                  const n = i + 1;
                  const active = n === pagerView;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${n}페이지`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setAlbumIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      active ? "bg-ink" : "bg-black/15 hover:bg-black/30",
                    )}
                  />
                  );
                })}
              </div>
              <p className="min-w-[3.5rem] text-center text-[12px] tabular-nums text-stone">
                {pagerView} / {pagerCount}
              </p>
              <button
                type="button"
                onClick={() => setAlbumIndex((i) => Math.min(album.length - 1, i + 1))}
                disabled={pagerView >= pagerCount}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-mist disabled:opacity-30"
                aria-label="다음 페이지"
              >
                <ChevronRight size={16} />
              </button>
              </div>
              {albumCaption && (
                <p className="text-[11px] text-stone">{albumCaption}</p>
              )}
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
  const ref = useRef<HTMLDivElement>(null);
  const { ensureShareToken } = useWorkspace();

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
              window.open(`${window.location.origin}/share/${ensureShareToken(productId)}`, "_blank", "noreferrer");
              setOpen(false);
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

function sectionIcon(kind: SectionDef["kind"]) {
  const props = { size: 13, strokeWidth: 1.7 };
  if (kind === "flatSpecs") return <PenTool {...props} />;
  if (kind === "drawing") return <Pencil {...props} />;
  if (kind === "basic") return <FileText {...props} />;
  if (kind === "fabric") return <Shirt {...props} />;
  if (kind === "trim") return <CircleDot {...props} />;
  if (kind === "label") return <Tag {...props} />;
  if (kind === "size") return <Ruler {...props} />;
  if (kind === "qty") return <Hash {...props} />;
  if (kind === "notes") return <StickyNote {...props} />;
  return <Package {...props} />;
}

function MiscRow({
  title,
  on,
  onToggle,
  onTitle,
  onOpen,
}: {
  title: string;
  on: boolean;
  onToggle: () => void;
  onTitle: (title: string) => void;
  onOpen?: () => void;
}) {
  return (
    <div className={cn("rounded-2xl transition-colors", on ? "bg-paper" : "hover:bg-paper/70")}>
      <div className="flex items-start gap-2 px-2 py-2">
        <button
          type="button"
          onClick={onOpen ?? onToggle}
          className={cn(
            "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
            on ? "bg-snow text-ink" : "bg-snow/80 text-stone",
          )}
          aria-label="기타 페이지 보기"
        >
          <ArrowUpRight size={13} strokeWidth={1.7} />
        </button>
        <input
          key={title}
          defaultValue={title}
          aria-label="기타 페이지 제목"
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (next && next !== title) onTitle(next);
            else e.target.value = title;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={cn(
            "mt-0.5 h-6 min-w-0 flex-1 bg-transparent text-[13px] tracking-tight outline-none",
            !on && "text-stone",
          )}
        />
        <span className="mt-0.5">
          <Switch on={on} onClick={onToggle} />
        </span>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  on,
  onePage,
  page,
  pages,
  onToggle,
  onPage,
}: {
  section: SectionDef;
  on: boolean;
  onePage: boolean;
  page: number;
  pages: number[];
  onToggle: () => void;
  onPage: (n: number) => void;
}) {
  return (
    <div className={cn("rounded-2xl transition-colors", on ? "bg-paper" : "hover:bg-paper/70")}>
      <div className="flex items-start gap-2 px-2 py-2">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
          <span
            className={cn(
              "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
              on ? "bg-snow text-ink" : "bg-snow/80 text-stone",
            )}
          >
            {sectionIcon(section.kind)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={cn("truncate text-[13px] tracking-tight", !on && "text-stone")}>{section.label}</span>
              {section.badge && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                    section.badge === "specs" ? "bg-sky text-sky-ink" : "bg-mist text-stone",
                  )}
                >
                  {section.badge}
                </span>
              )}
            </span>
            {section.subtitle && (
              <span className="mt-0.5 block truncate text-[11px] text-stone">{section.subtitle}</span>
            )}
          </span>
        </button>
        <span className="mt-0.5">
          <Switch on={on} onClick={onToggle} />
        </span>
      </div>
      {!onePage && on && (
        <div className="px-2 pb-2">
          <select
            value={page}
            onChange={(e) => onPage(Number(e.target.value))}
            className="h-7 w-full rounded-full border-0 bg-snow px-2.5 text-[11px] text-stone outline-none"
          >
            {pages.map((n) => (
              <option key={n} value={n}>
                {n}페이지
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
        on ? "bg-ink" : "bg-fog",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] h-3.5 w-3.5 rounded-full bg-snow shadow-sm transition-[left]",
          on ? "left-[14px]" : "left-[2px]",
        )}
      />
    </button>
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

function ShareMiscSheet({
  page,
  index,
  compact,
  productCode,
  version,
  onJump,
  onTitle,
  onDeletePage,
  onChangePage,
}: {
  page: MiscPage;
  index: number;
  compact?: boolean;
  productCode: string;
  version: number;
  onJump?: () => void;
  onTitle?: (title: string) => void;
  onDeletePage?: () => void;
  onChangePage?: (page: MiscPage) => void;
}) {
  const editable = Boolean(onChangePage);
  const session = useMiscPageSession(page, onChangePage ?? (() => {}), editable);
  const title = page.title?.trim() || `${index + 1}페이지`;
  const livePage = editable ? session.page : page;

  return (
    <article className="tech-pack-sheet flex h-full w-full flex-col overflow-hidden border border-[#e6e4de] bg-white">
      <div className={cn("flex shrink-0 items-start justify-between", compact ? "px-2 pt-1.5 pb-0.5" : "px-3 pt-2 pb-1")}>
        <div className="min-w-0 flex-1">
          {onTitle ? (
            <input
              key={title}
              defaultValue={title}
              aria-label="기타 페이지 제목"
              onBlur={(e) => {
                const next = e.target.value.trim();
                if (next && next !== title) onTitle(next);
                else e.target.value = title;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className={cn(
                "w-full min-w-0 bg-transparent font-bold tracking-tight outline-none",
                compact ? "text-[12px] print:text-[16px]" : "text-[16px]",
              )}
            />
          ) : (
            <p className={cn("truncate font-bold tracking-tight", compact ? "text-[12px] print:text-[16px]" : "text-[16px]")}>
              {title}
            </p>
          )}
          <p className={cn("mt-0.5 text-stone", compact ? "text-[8px] print:text-[11px]" : "text-[11px]")}>
            {productCode} · Tech Pack v{version}.1
          </p>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-0.5 print:hidden">
          {onDeletePage && (
            <button
              type="button"
              onClick={onDeletePage}
              aria-label="기타 페이지 삭제"
              className="flex h-6 w-6 items-center justify-center rounded-full text-stone hover:bg-[#f3f2ef] hover:text-ink"
            >
              <Trash2 size={13} />
            </button>
          )}
          {onJump && (
            <button
              type="button"
              onClick={onJump}
              aria-label="기타 상세 수정"
              className="flex h-6 w-6 items-center justify-center rounded-md text-stone hover:bg-[#f3f2ef] hover:text-ink"
            >
              <SquareArrowOutUpRight size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      <div
        ref={editable ? session.pageRef : undefined}
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden border-t border-[#e6e4de]",
          editable && (session.tool === "text" || session.tool === "note" || session.tool === "arrow") && "cursor-crosshair",
        )}
        onPointerDown={editable ? session.onPagePointerDown : undefined}
        onPointerMove={editable ? session.onPagePointerMove : undefined}
        onPointerUp={editable ? session.onPagePointerUp : undefined}
      >
        <MiscPageSurface
          page={livePage}
          selectedId={editable ? session.selectedId : undefined}
          editingId={editable ? session.editingId : undefined}
          draftArrow={editable ? session.draftArrow : undefined}
          onSelect={
            editable
              ? (id) => {
                  session.setSelectedId(id);
                  if (session.editingId && session.editingId !== id) session.setEditingId(null);
                }
              : undefined
          }
          onEdit={editable ? session.setEditingId : undefined}
          onMoveStart={editable ? session.startMove : undefined}
          onResizeStart={editable ? session.startResize : undefined}
          onEndpointStart={editable ? session.startEndpoint : undefined}
          onChangeText={editable ? session.changeText : undefined}
        />
        {editable && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center print:hidden">
            <div className="pointer-events-auto">
              <MiscPageToolbar
                compact
                tool={session.tool}
                selectedId={session.selectedId}
                onPickTool={session.pickTool}
                onRemove={session.removeSelected}
              />
            </div>
          </div>
        )}
        {editable && (
          <input
            ref={session.fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={session.onFileChange}
          />
        )}
      </div>
    </article>
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
}) {
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
        <div className="shrink-0">
          <SectionBar title="기본 정보" compact={compact} onJump={onJump ? () => onJump("basic") : undefined} />
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

      {cols.length === 0 && !has("basic") && (
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
                          />
                        ))}
                      </div>
                    ) : kind === "fabric" ? (
                      <FabricBlock product={product} materials={product.specs.materials} compact={compact} onJump={jump} />
                    ) : kind === "trim" ? (
                      <TrimBlock product={product} trims={product.specs.trims} compact={compact} onJump={jump} />
                    ) : kind === "size" ? (
                      <SizeBlock product={product} compact={compact} onJump={jump} />
                    ) : kind === "qty" ? (
                      <QtyBlock product={product} compact={compact} onJump={jump} />
                    ) : kind === "label" ? (
                      <LabelBlock product={product} compact={compact} onJump={jump} />
                    ) : kind === "notes" ? (
                      <NotesBlock product={product} compact={compact} onJump={jump} />
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
    </article>
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
          className="absolute top-0 left-[calc(100%+4px)] z-30 w-[132px] overflow-hidden rounded-xl border border-[#e6e4de] bg-white p-1 shadow-sm"
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
}: {
  title: string;
  extra?: string;
  compact?: boolean;
  onJump?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[#e6e4de] bg-[#f3f2ef]",
        compact ? "px-2 py-0.5" : "px-2.5 py-1",
      )}
    >
      <p className={cn("font-semibold text-ink", compact ? "text-[10px] print:text-[12px]" : "text-[11px]")}>{title}</p>
      <div className="flex items-center gap-1">
        {extra && <p className={cn("text-stone", compact ? "text-[9px] print:text-[10px]" : "text-[9px]")}>{extra}</p>}
        {onJump && (
          <button
            type="button"
            onClick={onJump}
            aria-label={`${title} 수정`}
            className="flex h-4 w-4 items-center justify-center rounded-[3px] text-stone hover:bg-white hover:text-ink print:hidden"
          >
            <SquareArrowOutUpRight size={11} strokeWidth={2} />
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

  const cell = compact ? "border border-[#e6e4de] px-1.5 py-0.5" : "border border-[#e6e4de] px-2 py-1";
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
}: {
  product: Product;
  section: SectionDef;
  compact?: boolean;
  onJump?: () => void;
}) {
  const slides = drawingSlides(product, section);
  const [index, setIndex] = useState(0);
  const safe = Math.min(index, slides.length - 1);
  const slide = slides[safe] ?? slides[0];
  const many = slides.length > 1;
  const title = many ? `도식화 · ${slide.label}` : section.kind === "flatSpecs" ? "도식화 · 도식화" : `도식화 · ${section.subtitle ?? "도식화"}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SectionBar title={title} compact={compact} onJump={onJump} />
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
  return <div className="flex flex-nowrap gap-1.5 overflow-x-auto">{children}</div>;
}

function FabricBlock({
  product,
  materials,
  compact,
  onJump,
}: {
  product: Product;
  materials: Material[];
  compact?: boolean;
  onJump?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const editable = Boolean(onJump);

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
    <div className="flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="원단" compact={compact} onJump={onJump} />
      <div className={cn("min-h-0 flex-1 overflow-auto", compact ? "p-1.5" : "p-2")}>
        {materials.length === 0 && !editable ? (
          <p className={cn("py-3 text-center text-stone", compact ? "text-[9px]" : "text-[11px]")}>없음</p>
        ) : (
          <CardRow>
            {materials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
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
}: {
  product: Product;
  trims: TrimItem[];
  compact?: boolean;
  onJump?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const editable = Boolean(onJump);
  const type = compact ? "text-[9px] print:text-[11px]" : "text-[11px]";

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
    <div className="flex h-full min-h-0 flex-col">
      <SectionBar title="부자재" compact={compact} onJump={onJump} />
      <div className={cn("min-h-0 flex-1 overflow-auto", compact ? "p-1.5" : "p-2", type)}>
        {trims.length === 0 && !editable ? (
          <p className="py-3 text-center text-stone">없음</p>
        ) : (
          <div className="divide-y divide-[#eee]">
            {trims.map((t) => (
              <ItemListRow
                key={t.id}
                src={t.image}
                color={t.color}
                name={t.name}
                nameLabel="품명"
                lines={[
                  { key: "position", value: t.position ?? "", label: "위치" },
                  { key: "type", value: t.type ?? "", label: "종류" },
                  { key: "qty", value: t.qty || t.spec || "", label: "수량" },
                ]}
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
              <div className="pt-1">
                <PackAddMenu
                  label="부자재 추가"
                  onAsset={() => setImportOpen(true)}
                  onUpload={() => fileRef.current?.click()}
                />
              </div>
            )}
          </div>
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
  editable,
  onPatch,
  onRemove,
}: {
  material: Material;
  editable?: boolean;
  onPatch?: (patch: Partial<Material>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className={cn(CARD_SIZE, "group relative shrink-0 overflow-hidden border border-[#e6e4de] bg-white")}>
      {editable && onRemove && (
        <span className="absolute top-0.5 right-0.5 z-10">
          <PackDel label={`${material.name} 삭제`} onClick={onRemove} />
        </span>
      )}
      <CardThumb src={material.image} color={material.color} label={`${material.name} 썸네일`} />
      <div className={cn("space-y-px px-1 py-1", "text-[9px] print:text-[11px]")}>
        <FieldLine
          label="원단명"
          value={material.name}
          strong
          editable={editable}
          onCommit={(name) => onPatch?.({ name })}
        />
        <FieldLine
          label="위치"
          value={material.position ?? ""}
          editable={editable}
          onCommit={(position) => onPatch?.({ position })}
        />
        <FieldLine
          label="컬러"
          value={colorLabel(material.color, material.colorName)}
          editable={editable}
          onCommit={(colorName) => onPatch?.({ colorName })}
        />
        <FieldLine
          label="소요량"
          value={material.consumption || material.weight || ""}
          editable={editable}
          onCommit={(consumption) => onPatch?.({ consumption })}
        />
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
    <div className="group flex items-start gap-1.5 py-1">
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
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const sizes = productSizes(product);
  const rows = product.specs.measurements.length ? product.specs.measurements : DEFAULT_MEASURE_ROWS;
  const editable = Boolean(onJump);
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[11px]";
  const cell = compact ? "border-b border-[#eee] px-1 py-0.5" : "border-b border-[#eee] px-2 py-1";
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
    <div className="flex h-full min-h-0 flex-col">
      <SectionBar title="Size Spec" extra="inch/단면" compact={compact} onJump={onJump} />
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
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
}) {
  const { updateSpecsField } = useWorkspace();
  const sizes = productSizes(product);
  const colors = product.specs.colorways.length
    ? product.specs.colorways
    : [{ id: "x", name: "—", hex: "#ddd", main: "", sub: "", code: "" }];
  const editable = Boolean(onJump);
  const type = compact ? "text-[10px] print:text-[12px]" : "text-[11px]";
  const cell = compact ? "border-b border-[#eee] px-1 py-0.5" : "border-b border-[#eee] px-2 py-1";
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
    <div className="flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="색상/사이즈 별 수량" compact={compact} onJump={onJump} />
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
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
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
    <div className="flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="라벨" compact={compact} onJump={onJump} />
      <div className={cn("min-h-0 flex-1 overflow-auto", compact ? "p-1.5" : "p-2", type)}>
        {labels.length === 0 && !editable ? (
          <p className="py-3 text-center text-stone">없음</p>
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
              <div className="pt-1">
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
}: {
  product: Product;
  compact?: boolean;
  onJump?: () => void;
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
    <div className="flex h-full min-h-0 flex-col border-t border-[#e6e4de]">
      <SectionBar title="주의사항" compact={compact} onJump={onJump} />
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
