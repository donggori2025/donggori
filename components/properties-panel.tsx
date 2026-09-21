"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ChevronDown,
} from "lucide-react";
import { FlatThumb } from "./flats";
import { useWorkspace } from "@/lib/store";
import type { CanvasNode, CanvasNodeType, Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SpecRoleHint } from "./spec-role-hint";

const ARTBOARD = { w: 1100, h: 720 };
const PAGE_BG = "#f4f2ee";

type ExportFmt = "png" | "pdf" | "svg" | "jpg";
const EXPORT_FMTS: { value: ExportFmt; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "pdf", label: "PDF" },
  { value: "svg", label: "SVG" },
  { value: "jpg", label: "JPG" },
];

function defaultsFor(node?: CanvasNode) {
  const type = node?.type;
  const size =
    type === "label"
      ? { w: 254, h: 260 }
      : type === "mockup2d" || type === "mockup3d"
        ? { w: 254, h: 320 }
        : { w: 374, h: 400 };
  return {
    x: Math.round(node?.x ?? 80),
    y: Math.round(node?.y ?? 40),
    w: Math.round(node?.w ?? size.w),
    h: Math.round(node?.h ?? size.h),
    fill: node?.fill ?? "#fffefb",
    stroke: node?.stroke ?? "#e7e4dd",
    strokeWidth: node?.strokeWidth ?? 1,
  };
}

function slug(name: string) {
  return name.replace(/[^\w가-힣.-]+/g, "-").replace(/^-|-$/g, "") || "export";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function simplePdf(title: string): Blob {
  const text = title.replace(/[()\\]/g, " ").slice(0, 80);
  const content = `BT /F1 24 Tf 72 700 Td (${text}) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((obj, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    body += `${String(off).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer << /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([body], { type: "application/pdf" });
}

function exportTarget(
  format: ExportFmt,
  name: string,
  style: { w: number; h: number; fill: string; stroke: string; strokeWidth: number },
) {
  const w = Math.max(80, style.w);
  const h = Math.max(80, style.h);
  const sw = Math.max(0.5, style.strokeWidth);

  if (format === "svg") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="${sw / 2}" y="${sw / 2}" width="${w - sw}" height="${h - sw}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${sw}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="16" fill="#1a1916">${name}</text>
</svg>`;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${slug(name)}.svg`);
    return;
  }

  if (format === "pdf") {
    downloadBlob(simplePdf(name), `${slug(name)}.pdf`);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = format === "jpg" ? "#ffffff" : style.fill;
  ctx.fillRect(0, 0, w, h);
  if (format !== "jpg") {
    ctx.fillStyle = style.fill;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = style.fill;
    ctx.fillRect(8, 8, w - 16, h - 16);
  }
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = sw;
  ctx.strokeRect(sw / 2, sw / 2, w - sw, h - sw);
  ctx.fillStyle = "#1a1916";
  ctx.font = "16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, w / 2, h / 2);
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  canvas.toBlob(
    (blob) => {
      if (blob) downloadBlob(blob, `${slug(name)}.${format}`);
    },
    mime,
    0.92,
  );
}

type PageDims = { name: string; w: number; h: number; fill: string };

export function PropertiesExportFooter({
  product,
  selectedTarget,
  page,
  objectStyle,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  page?: PageDims;
  objectStyle?: { w: number; h: number; fill: string; stroke: string; strokeWidth: number };
}) {
  const [exportFmt, setExportFmt] = useState<ExportFmt>("png");
  const node = product.nodes.find((n) => n.id === selectedTarget?.id);
  const isPage = !selectedTarget || selectedTarget.id === "page-1";
  const pageDims = page ?? { name: product.name, w: ARTBOARD.w, h: ARTBOARD.h, fill: PAGE_BG };
  const exportName = isPage ? pageDims.name : selectedTarget?.label ?? product.name;
  const style = objectStyle ?? {
    w: isPage ? pageDims.w : defaultsFor(node).w,
    h: isPage ? pageDims.h : defaultsFor(node).h,
    fill: isPage ? pageDims.fill : defaultsFor(node).fill,
    stroke: defaultsFor(node).stroke,
    strokeWidth: defaultsFor(node).strokeWidth,
  };

  return (
    <div className="shrink-0 border-t border-mist px-3 py-3">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-stone">추출하기</p>
      <div className="mb-2 flex items-center gap-2">
        <ExportThumb
          src={(node as (CanvasNode & { image?: string }) | undefined)?.image}
          kind={isPage ? "page" : node?.type ?? "flat"}
          fill={isPage ? pageDims.fill : style.fill}
          category={product.category}
          name={exportName}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium">{exportName}</p>
          <p className="truncate text-[10px] text-stone">
            {isPage ? "페이지" : node ? node.type : "layer"}
          </p>
        </div>
      </div>
      <label className="relative mb-2 block">
        <span className="sr-only">파일 형태</span>
        <select
          value={exportFmt}
          onChange={(e) => setExportFmt(e.target.value as ExportFmt)}
          className="h-8 w-full appearance-none rounded-md border border-mist bg-paper py-1.5 pr-7 pl-2 text-[11px] font-medium uppercase tracking-wide outline-none hover:border-ink"
        >
          {EXPORT_FMTS.map((fmt) => (
            <option key={fmt.value} value={fmt.value}>
              {fmt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-stone"
        />
      </label>
      <button
        type="button"
        onClick={() =>
          exportTarget(exportFmt, exportName, {
            w: isPage ? pageDims.w : style.w,
            h: isPage ? pageDims.h : style.h,
            fill: isPage ? pageDims.fill : style.fill,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
          })
        }
        className="h-8 w-full rounded-md bg-ink text-[12px] font-medium text-snow hover:opacity-90"
      >
        추출하기
      </button>
    </div>
  );
}

export function PropertiesPanel({
  product,
  selectedTarget,
  tabs,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  tabs?: ReactNode;
}) {
  const { updateNode, setSpecArtboard } = useWorkspace();
  const [page, setPage] = useState({
    name: product.name,
    w: ARTBOARD.w,
    h: ARTBOARD.h,
    fill: PAGE_BG,
  });
  const [local, setLocal] = useState<Record<string, ReturnType<typeof defaultsFor>>>({});

  const node = product.nodes.find((n) => n.id === selectedTarget?.id);
  const isPage = !selectedTarget || selectedTarget.id === "page-1";
  const objectStyle = useMemo(() => {
    if (isPage) return { ...page, x: 0, y: 0, stroke: "#e7e4dd", strokeWidth: 1 };
    const base = defaultsFor(node);
    return { ...base, ...local[selectedTarget!.id] };
  }, [isPage, page, node, local, selectedTarget]);

  const patchObject = (patch: Partial<ReturnType<typeof defaultsFor>>) => {
    if (isPage || !selectedTarget) return;
    if (node) updateNode(product.id, node.id, patch);
    else setLocal((prev) => ({ ...prev, [selectedTarget.id]: { ...objectStyle, ...patch } }));
  };

  const align = (dir: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (isPage) return;
    const frame = node ? ARTBOARD : ARTBOARD;
    const next =
      dir === "left"
        ? { x: 40 }
        : dir === "center"
          ? { x: Math.round((frame.w - objectStyle.w) / 2) }
          : dir === "right"
            ? { x: Math.round(frame.w - objectStyle.w - 40) }
            : dir === "top"
              ? { y: 40 }
              : dir === "middle"
                ? { y: Math.round((frame.h - objectStyle.h) / 2) }
                : { y: Math.round(frame.h - objectStyle.h - 40) };
    patchObject(next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-mist bg-snow shadow-sm">
        {tabs}
        <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
        {isPage ? (
          <section>
            <p className="mb-2 text-[11px] font-medium tracking-wide text-stone">페이지 속성</p>
            <Field label="이름">
              <input
                value={page.name}
                onChange={(e) => setPage((p) => ({ ...p, name: e.target.value }))}
                className="h-7 w-full rounded-md bg-paper px-2 text-[12px] outline-none"
              />
            </Field>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumField label="W" value={page.w} onChange={(w) => setPage((p) => ({ ...p, w }))} />
              <NumField label="H" value={page.h} onChange={(h) => setPage((p) => ({ ...p, h }))} />
            </div>
            <Field label="배경" className="mt-2">
              <ColorField value={page.fill} onChange={(fill) => setPage((p) => ({ ...p, fill }))} />
            </Field>
          </section>
        ) : (
          <>
            <div className="mb-1 flex items-start gap-1">
              <p className="min-w-0 flex-1 truncate text-[12px] font-medium">{selectedTarget.label}</p>
              {node?.type === "flat" && node.boardKind === "specs" && <SpecRoleHint />}
            </div>
            <p className="mb-3 text-[10px] text-stone">
              {node?.type === "flat" && node.boardKind === "specs" ? "spec용 도식화" : node ? node.type : "layer"}
            </p>
            {node?.type === "flat" && (
              <div className="mb-3 rounded-xl bg-paper px-2.5 py-2">
                {node.boardKind === "specs" ? (
                  <p className="text-[11px] leading-relaxed text-stone">
                    이 대지가 작업지시서 spec입니다. 여기에 쓴 원단·부자재·측정이 채워집니다.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSpecArtboard(product.id, node.id)}
                    className="w-full rounded-full bg-ink px-3 py-1.5 text-[12px] text-snow hover:opacity-90"
                  >
                    spec용 도식화로 지정
                  </button>
                )}
              </div>
            )}

            <Section title="레이아웃">
              <div className="grid grid-cols-2 gap-2">
                <NumField label="X" value={objectStyle.x} onChange={(x) => patchObject({ x })} />
                <NumField label="Y" value={objectStyle.y} onChange={(y) => patchObject({ y })} />
                <NumField label="W" value={objectStyle.w} onChange={(w) => patchObject({ w })} />
                <NumField label="H" value={objectStyle.h} onChange={(h) => patchObject({ h })} />
              </div>
            </Section>

            <Section title="색상">
              <ColorField value={objectStyle.fill} onChange={(fill) => patchObject({ fill })} />
            </Section>

            <Section title="선">
              <ColorField value={objectStyle.stroke} onChange={(stroke) => patchObject({ stroke })} />
              <div className="mt-2">
                <NumField
                  label="두께"
                  value={objectStyle.strokeWidth}
                  step={0.5}
                  onChange={(strokeWidth) => patchObject({ strokeWidth })}
                />
              </div>
            </Section>

            <Section title="정렬">
              <div className="flex gap-0.5">
                {(
                  [
                    ["left", AlignLeft, "왼쪽"],
                    ["center", AlignCenter, "가로 가운데"],
                    ["right", AlignRight, "오른쪽"],
                    ["top", AlignVerticalJustifyStart, "위"],
                    ["middle", AlignVerticalJustifyCenter, "세로 가운데"],
                    ["bottom", AlignVerticalJustifyEnd, "아래"],
                  ] as const
                ).map(([dir, Icon, label]) => (
                  <button
                    key={dir}
                    type="button"
                    title={label}
                    onClick={() => align(dir)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-stone hover:bg-paper hover:text-ink"
                  >
                    <Icon size={14} strokeWidth={1.7} />
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}
        </div>

      <PropertiesExportFooter
        product={product}
        selectedTarget={selectedTarget}
        page={page}
        objectStyle={objectStyle}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-stone">{title}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] text-stone">{label}</span>
      {children}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="flex h-7 items-center gap-1.5 rounded-md bg-paper px-2">
      <span className="w-3.5 text-[10px] text-stone">{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 bg-transparent text-right text-[12px] tabular-nums outline-none"
      />
    </label>
  );
}

function ExportThumb({
  src,
  kind,
  fill,
  category,
  name,
}: {
  src?: string;
  kind: "page" | CanvasNodeType | "layer";
  fill: string;
  category: ProductCategory;
  name: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;

  return (
    <div
      role="img"
      aria-label={`${name} 썸네일`}
      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-mist"
      style={{ background: fill }}
    >
      {showImg ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : kind === "flat" ? (
        <FlatThumb category={category} className="p-1 text-ink/80" />
      ) : kind === "label" ? (
        <span className="absolute inset-2 rotate-[-8deg] rounded-[2px] border border-ink/40 bg-snow" />
      ) : kind === "mockup2d" ? (
        <span className="absolute inset-x-3 bottom-1 top-2 rounded-t-full border border-ink/15 bg-gradient-to-b from-sky/70 to-paper" />
      ) : kind === "mockup3d" ? (
        <span className="absolute inset-3 rotate-[-12deg] rounded-md bg-lilac shadow-sm" />
      ) : null}
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-7 items-center gap-2 rounded-md bg-paper px-2">
      <input
        type="color"
        value={value.startsWith("#") && value.length === 7 ? value : "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="h-4 w-4 cursor-pointer rounded-sm border-0 bg-transparent p-0"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[12px] uppercase outline-none"
      />
    </div>
  );
}
