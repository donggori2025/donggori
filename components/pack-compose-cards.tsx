"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  CircleDot,
  FileText,
  Hash,
  LayoutGrid,
  Package,
  Pencil,
  PenTool,
  Ruler,
  Shirt,
  StickyNote,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { MiniFlat } from "./ui";
import { Mockup2D, Mockup3D } from "./flats";
import type { CanvasNode, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const HOLD_MS = 420;
const MOVE_CANCEL = 8;
const DEFAULT_SPEC_KINDS = new Set<ComposeSection["kind"]>([
  "basic",
  "fabric",
  "trim",
  "label",
  "size",
  "qty",
  "notes",
]);

function canDeleteComposeSection(section: ComposeSection, artboardCount: number) {
  if (DEFAULT_SPEC_KINDS.has(section.kind)) return false;
  if (section.kind === "flatSpecs") return artboardCount > 1;
  return section.kind === "drawing" || section.kind === "table" || section.kind === "memo";
}

function objectParticle(word: string) {
  const last = word.at(-1);
  if (!last) return "를";
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "를";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

export type ComposeSection = {
  id: string;
  label: string;
  badge?: "specs" | "일반";
  subtitle?: string;
  kind: "flatSpecs" | "drawing" | "basic" | "fabric" | "trim" | "label" | "size" | "qty" | "notes" | "table" | "memo";
  node?: CanvasNode;
};

export type ComposeGroup = {
  title: string;
  items: ComposeSection[];
  canCreate?: boolean;
};

type LiftState = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  ox: number;
  oy: number;
};

export function ComposePalette({
  product,
  viewPage,
  pagesOf,
  groups,
  footer,
  onAddToPage,
  onCreateExtra,
  onRemove,
  onRename,
  onDragState,
}: {
  product: Product;
  viewPage: number;
  pagesOf: Record<string, number[]>;
  groups: ComposeGroup[];
  footer?: ReactNode;
  onAddToPage: (id: string, page: number) => void;
  onCreateExtra?: (kind: "table" | "memo") => void;
  onRemove?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onDragState?: (state: { dropPage: number | null } | null) => void;
}) {
  const [hover, setHover] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [lift, setLift] = useState<LiftState | null>(null);
  const [dropPage, setDropPage] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ComposeSection | null>(null);
  const holdTimer = useRef(0);
  const startPtr = useRef<{ x: number; y: number; id: string; rect: DOMRect } | null>(null);
  const moved = useRef(false);
  const liftRef = useRef<LiftState | null>(null);
  const hideHover = useRef(0);
  liftRef.current = lift;

  const readDrop = (x: number, y: number) => {
    const hit = document.elementFromPoint(x, y);
    const page = hit?.closest("[data-pack-drop-page]")?.getAttribute("data-pack-drop-page");
    return page ? Number(page) : null;
  };

  const clearHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = 0;
    }
  };

  const hidePreview = () => {
    window.clearTimeout(hideHover.current);
    setHover(null);
  };

  const showPreview = (id: string, el: HTMLElement) => {
    if (liftRef.current) return;
    window.clearTimeout(hideHover.current);
    setHover({ id, rect: el.getBoundingClientRect() });
  };

  const delayHidePreview = () => {
    window.clearTimeout(hideHover.current);
    hideHover.current = window.setTimeout(() => setHover(null), 140);
  };

  const beginLift = (x: number, y: number) => {
    const start = startPtr.current;
    if (!start || liftRef.current) return;
    clearHold();
    hidePreview();
    const next: LiftState = {
      id: start.id,
      x,
      y,
      w: start.rect.width,
      h: start.rect.height,
      ox: start.x - start.rect.left,
      oy: start.y - start.rect.top,
    };
    liftRef.current = next;
    setLift(next);
    document.body.style.cursor = "grabbing";
  };

  const endPointer = (x: number, y: number) => {
    const id = startPtr.current?.id ?? liftRef.current?.id;
    const dragging = Boolean(liftRef.current) || moved.current;
    const page = readDrop(x, y);
    clearHold();
    liftRef.current = null;
    setLift(null);
    setDropPage(null);
    startPtr.current = null;
    moved.current = false;
    document.body.style.cursor = "";
    if (!id) return;
    onAddToPage(id, dragging ? (page ?? viewPage) : viewPage);
  };

  useEffect(() => {
    onDragState?.(lift ? { dropPage } : null);
  }, [lift, dropPage, onDragState]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  const onPointerDown = (sectionId: string, e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    hidePreview();
    moved.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    startPtr.current = { x: e.clientX, y: e.clientY, id: sectionId, rect };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    clearHold();
    holdTimer.current = window.setTimeout(() => beginLift(e.clientX, e.clientY), HOLD_MS);
  };

  const onPointerMoveCard = (e: React.PointerEvent) => {
    const start = startPtr.current;
    if (!start) return;
    if (!liftRef.current) {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_CANCEL) {
        moved.current = true;
        beginLift(e.clientX, e.clientY);
      }
      return;
    }
    setLift((cur) => (cur ? { ...cur, x: e.clientX, y: e.clientY } : cur));
    setDropPage(readDrop(e.clientX, e.clientY));
  };

  const onPointerUpCard = (e: React.PointerEvent) => {
    endPointer(e.clientX, e.clientY);
  };

  const onPointerCancelCard = () => {
    clearHold();
    liftRef.current = null;
    setLift(null);
    setDropPage(null);
    startPtr.current = null;
    moved.current = false;
    document.body.style.cursor = "";
    onDragState?.(null);
  };

  const allItems = groups.flatMap((g) => g.items);
  const artboardCount = allItems.filter((s) => s.kind === "flatSpecs" || s.kind === "drawing").length;
  const hoverSection = hover ? allItems.find((s) => s.id === hover.id) : undefined;
  const liftSection = lift ? allItems.find((s) => s.id === lift.id) : undefined;

  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingDelete(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingDelete]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className={cn("min-h-0 flex-1 overflow-auto px-3 pb-4", lift && "pointer-events-none")}>
        {groups.map((group) => (
          <div key={group.title} className="pb-3.5">
            <p className="px-0.5 pb-1.5 pt-0.5 text-[11px] text-stone">{group.title}</p>
            {group.items.length === 0 && !group.canCreate ? (
              <p className="rounded-xl border border-dashed border-fog px-2 py-4 text-center text-[11px] text-stone">없음</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {group.canCreate && onCreateExtra && <ComposeAddCard onCreate={onCreateExtra} />}
                {group.items.map((sec) => {
                  const assigned = pagesOf[sec.id] ?? [];
                  const onHere = assigned.includes(viewPage);
                  return (
                    <ComposeCard
                      key={sec.id}
                      product={product}
                      section={sec}
                      assigned={assigned}
                      onHere={onHere}
                      dimmed={Boolean(lift && lift.id === sec.id)}
                      onPointerDown={(e) => onPointerDown(sec.id, e)}
                      onPointerMove={onPointerMoveCard}
                      onPointerUp={onPointerUpCard}
                      onPointerCancel={onPointerCancelCard}
                      onHoverStart={(el) => showPreview(sec.id, el)}
                      onHoverEnd={delayHidePreview}
                      onActivate={() => onAddToPage(sec.id, viewPage)}
                      onRemove={
                        onRemove && canDeleteComposeSection(sec, artboardCount)
                          ? () => {
                              hidePreview();
                              setPendingDelete(sec);
                            }
                          : undefined
                      }
                      onRename={
                        onRename && (sec.kind === "table" || sec.kind === "memo")
                          ? (title) => onRename(sec.id, title)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {footer}
      </div>

      {hover && hoverSection && !lift && typeof document !== "undefined" &&
        createPortal(
          <HoverPreview
            product={product}
            section={hoverSection}
            viewPage={viewPage}
            assigned={pagesOf[hoverSection.id] ?? []}
            anchor={hover.rect}
          />,
          document.body,
        )}

      {lift && liftSection && typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[80] origin-center scale-[1.18] overflow-hidden rounded-xl border border-mist bg-snow shadow-[0_18px_50px_rgba(26,25,22,0.18)]"
            style={{
              left: lift.x - lift.ox,
              top: lift.y - lift.oy,
              width: lift.w,
              height: lift.h,
            }}
          >
            <SectionThumb product={product} section={liftSection} />
          </div>,
          document.body,
        )}

      {pendingDelete && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/30 p-4"
            onClick={() => setPendingDelete(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pack-delete-title"
              className="w-[320px] rounded-3xl border border-mist bg-snow p-5 shadow-[0_20px_60px_rgba(26,25,22,0.16)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p id="pack-delete-title" className="text-[16px] font-semibold tracking-tight">
                정말 삭제하시겠습니까?
              </p>
              <p className="mt-1.5 text-[13px] text-stone">
                {pendingDelete.label}
                {objectParticle(pendingDelete.label)} 삭제합니다.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="h-8 rounded-full px-3.5 text-[13px] text-stone hover:bg-paper hover:text-ink"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = pendingDelete.id;
                    setPendingDelete(null);
                    onRemove?.(id);
                  }}
                  className="h-8 rounded-full bg-ink px-3.5 text-[13px] text-snow"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ComposeAddCard({ onCreate }: { onCreate: (kind: "table" | "memo") => void }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      const menu = document.getElementById("pack-extra-create-menu");
      if (menu?.contains(e.target as Node)) return;
      setOpen(false);
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
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="추가"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setRect(btnRef.current?.getBoundingClientRect() ?? null);
          setOpen(next);
        }}
        className="overflow-hidden rounded-xl border border-dashed border-fog bg-snow text-left hover:border-mist hover:bg-paper"
      >
        <div className="flex aspect-[5/4] items-center justify-center bg-paper text-stone">
          <Plus size={18} strokeWidth={1.7} />
        </div>
        <div className="px-1.5 py-1.5">
          <p className="truncate text-[11px] font-medium tracking-tight">+ 추가</p>
          <p className="truncate text-[10px] text-stone">표 · 메모</p>
        </div>
      </button>
      {open && rect && typeof document !== "undefined" &&
        createPortal(
          <div
            id="pack-extra-create-menu"
            role="menu"
            className="fixed z-[80] w-[6.5rem] rounded-lg border border-mist bg-snow p-0.5 shadow-[0_8px_24px_rgba(26,25,22,0.12)]"
            style={{
              left: Math.min(rect.left, window.innerWidth - 112),
              top: rect.bottom + 56 > window.innerHeight ? Math.max(8, rect.top - 56) : rect.bottom + 4,
            }}
          >
            {(
              [
                ["table", "표", LayoutGrid],
                ["memo", "메모", StickyNote],
              ] as const
            ).map(([kind, label, Icon]) => (
              <button
                key={kind}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onCreate(kind);
                }}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] text-ink hover:bg-paper"
              >
                <Icon size={12} strokeWidth={1.8} className="text-stone" />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function ComposeCard({
  product,
  section,
  assigned,
  onHere,
  dimmed,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onHoverStart,
  onHoverEnd,
  onActivate,
  onRemove,
  onRename,
}: {
  product: Product;
  section: ComposeSection;
  assigned: number[];
  onHere: boolean;
  dimmed: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: () => void;
  onHoverStart: (el: HTMLElement) => void;
  onHoverEnd: () => void;
  onActivate: () => void;
  onRemove?: () => void;
  onRename?: (title: string) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${section.label} 현재 장에 넣기`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseEnter={(e) => onHoverStart(e.currentTarget)}
      onMouseLeave={onHoverEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      className={cn(
        "group relative touch-none select-none overflow-hidden rounded-xl border bg-snow text-left transition",
        onHere ? "border-fog" : "border-mist hover:border-fog",
        dimmed ? "cursor-grabbing opacity-30" : "cursor-grab",
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-paper">
        <SectionThumb product={product} section={section} />
        {section.badge && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-sky px-1.5 py-0.5 text-[8px] font-medium text-sky-ink">
            {section.badge}
          </span>
        )}
      </div>
      <div className="px-1.5 py-1.5">
        {onRename ? (
          <RenameField value={section.label} onCommit={onRename} />
        ) : (
          <p className="truncate text-[11px] font-medium tracking-tight">{section.label}</p>
        )}
        <p className="truncate text-[10px] text-stone">
          {assigned.length ? assigned.map((n) => `${n}장`).join(" · ") : "아직 없음"}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`${section.label} 삭제`}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-snow/90 text-stone opacity-0 shadow-sm group-hover:opacity-100 focus-visible:opacity-100 hover:text-ink"
        >
          <Trash2 size={10} />
        </button>
      )}
    </article>
  );
}

function HoverPreview({
  product,
  section,
  viewPage,
  assigned,
  anchor,
}: {
  product: Product;
  section: ComposeSection;
  viewPage: number;
  assigned: number[];
  anchor: DOMRect;
}) {
  const left = Math.min(anchor.right + 10, window.innerWidth - 248);
  const top = Math.min(Math.max(12, anchor.top - 8), window.innerHeight - 280);
  return (
    <div
      className="pointer-events-none fixed z-[70] w-[228px] overflow-hidden rounded-2xl border border-mist bg-snow p-2 shadow-[0_16px_40px_rgba(26,25,22,0.14)]"
      style={{ left, top }}
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-paper">
        <SectionThumb product={product} section={section} large />
      </div>
      <p className="mt-2 truncate px-0.5 text-[13px] font-medium">{section.label}</p>
      <p className="px-0.5 text-[11px] text-stone">클릭하면 {viewPage}장에 넣습니다.</p>
      {assigned.length > 0 && (
        <p className="px-0.5 text-[11px] text-stone">이미 {assigned.map((n) => `${n}장`).join(", ")}에 있습니다.</p>
      )}
    </div>
  );
}

function SectionThumb({
  product,
  section,
  large,
}: {
  product: Product;
  section: ComposeSection;
  large?: boolean;
}) {
  const node = section.node;
  if (section.kind === "flatSpecs" || section.kind === "drawing") {
    if (node?.type === "mockup2d") {
      return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <div className={large ? "origin-center scale-[0.55]" : "origin-center scale-[0.32]"}>
            <Mockup2D category={product.category} />
          </div>
        </div>
      );
    }
    if (node?.type === "mockup3d") {
      return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <div className={large ? "origin-center scale-[0.55]" : "origin-center scale-[0.32]"}>
            <Mockup3D />
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center">
        <MiniFlat category={product.category} className={large ? "h-24 w-20" : "h-14 w-12"} />
      </div>
    );
  }

  if (section.kind === "fabric") {
    const colors = product.specs.materials.slice(0, 4).map((m) => m.color || "#EDE6D9");
    const swatches = colors.length ? colors : ["#EDE6D9", "#9A9A96", "#3A3A38"];
    return (
      <div className="grid h-full grid-cols-2 gap-px bg-mist p-2">
        {swatches.map((c, i) => (
          <div key={`${c}-${i}`} className="bg-snow" style={{ background: c }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2">
      <span className="text-stone">{kindIcon(section.kind, large ? 22 : 16)}</span>
      {section.kind === "size" || section.kind === "qty" || section.kind === "table" ? (
        <span className="grid w-[70%] grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-1.5 rounded-[1px] bg-fog" />
          ))}
        </span>
      ) : section.kind === "notes" || section.kind === "memo" || section.kind === "basic" ? (
        <span className="flex w-[70%] flex-col gap-0.5">
          <span className="h-1 rounded-[1px] bg-fog" />
          <span className="h-1 w-4/5 rounded-[1px] bg-fog" />
          <span className="h-1 w-3/5 rounded-[1px] bg-fog" />
        </span>
      ) : null}
    </div>
  );
}

function kindIcon(kind: ComposeSection["kind"], size: number) {
  const props = { size, strokeWidth: 1.7 };
  if (kind === "flatSpecs") return <PenTool {...props} />;
  if (kind === "drawing") return <Pencil {...props} />;
  if (kind === "basic") return <FileText {...props} />;
  if (kind === "fabric") return <Shirt {...props} />;
  if (kind === "trim") return <CircleDot {...props} />;
  if (kind === "label") return <Tag {...props} />;
  if (kind === "size") return <Ruler {...props} />;
  if (kind === "qty") return <Hash {...props} />;
  if (kind === "notes" || kind === "memo") return <StickyNote {...props} />;
  if (kind === "table") return <LayoutGrid {...props} />;
  return <Package {...props} />;
}

function RenameField({ value, onCommit }: { value: string; onCommit: (title: string) => void }) {
  return (
    <input
      key={value}
      defaultValue={value}
      aria-label="이름"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.value = value;
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      onBlur={(e) => {
        const next = e.currentTarget.value.trim();
        if (!next) {
          e.currentTarget.value = value;
          return;
        }
        if (next !== value) onCommit(next);
      }}
      className="h-4 w-full min-w-0 bg-transparent text-[11px] font-medium tracking-tight outline-none"
    />
  );
}
