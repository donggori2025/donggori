"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Image as ImageIcon,
  Minus,
  MousePointer2,
  Plus,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import {
  ARROW_STYLES,
  DEFAULT_TEXT_STYLE,
  TEXT_COLORS,
  TEXT_FONTS,
  TEXT_SIZES,
  clamp,
  emptyMiscPage,
  isArrow,
  miscBoardOf,
  pageSize,
  uid,
} from "@/lib/misc-board";
import { useWorkspace } from "@/lib/store";
import type { MiscArrowObject, MiscArrowStyle, MiscBoxObject, MiscPage, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type TextStyle = typeof DEFAULT_TEXT_STYLE;

type Tool = "select" | "text" | "image" | "arrow" | "note";

export const MISC_TOOLS: { id: Tool; icon: typeof Type; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "선택" },
  { id: "text", icon: Type, label: "텍스트" },
  { id: "image", icon: ImageIcon, label: "이미지" },
  { id: "arrow", icon: ArrowUpRight, label: "화살표" },
  { id: "note", icon: StickyNote, label: "주석" },
];

type Drag =
  | { kind: "move"; id: string; dx: number; dy: number }
  | { kind: "resize"; id: string; ox: number; oy: number; ow: number; oh: number }
  | { kind: "endpoint"; id: string; which: "start" | "end" };

export function useMiscPageSession(page: MiscPage, onCommit: (next: MiscPage) => void, enabled = true) {
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftArrow, setDraftArrow] = useState<{ x: number; y: number; x2: number; y2: number; style?: MiscArrowStyle } | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyle>(DEFAULT_TEXT_STYLE);
  const [arrowStyle, setArrowStyle] = useState<MiscArrowStyle>("straight");
  const [live, setLive] = useState(page);
  const textStyleRef = useRef(textStyle);
  const arrowStyleRef = useRef(arrowStyle);
  textStyleRef.current = textStyle;
  arrowStyleRef.current = arrowStyle;
  const pageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);
  const liveRef = useRef(live);
  liveRef.current = live;
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => {
    if (drag.current) return;
    setLive(page);
  }, [page]);

  useEffect(() => {
    setSelectedId(null);
    setEditingId(null);
    setTool("select");
    setDraftArrow(null);
  }, [page.id]);

  const apply = (next: MiscPage, persist = true) => {
    setLive(next);
    liveRef.current = next;
    if (persist) commitRef.current(next);
  };

  const toPage = (clientX: number, clientY: number) => {
    const el = pageRef.current;
    const { w, h } = pageSize(liveRef.current);
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const sx = r.width / Math.max(1, w);
    return {
      x: clamp((clientX - r.left) / sx, 0, w),
      y: clamp((clientY - r.top) / sx, 0, h),
    };
  };

  const addText = (x: number, y: number) => {
    const id = uid("text");
    apply({
      ...liveRef.current,
      objects: [
        ...liveRef.current.objects,
        { id, type: "text", x: x - 8, y: y - 12, w: 280, h: 72, text: "", ...textStyleRef.current },
      ],
    });
    setSelectedId(id);
    setEditingId(id);
    setTool("select");
  };

  const addNote = (x: number, y: number) => {
    const id = uid("note");
    apply({
      ...liveRef.current,
      objects: [...liveRef.current.objects, { id, type: "note", x: x - 16, y: y - 16, w: 188, h: 128, text: "" }],
    });
    setSelectedId(id);
    setEditingId(id);
    setTool("select");
  };

  const addImage = (src: string, naturalW: number, naturalH: number) => {
    const max = 360;
    const ratio = naturalW / Math.max(1, naturalH);
    const w = naturalW >= naturalH ? max : Math.round(max * ratio);
    const h = naturalW >= naturalH ? Math.round(max / ratio) : max;
    const id = uid("image");
    apply({
      ...liveRef.current,
      objects: [...liveRef.current.objects, { id, type: "image", x: 80, y: 80, w, h, src }],
    });
    setSelectedId(id);
    setTool("select");
  };

  const addArrow = (x: number, y: number, x2: number, y2: number) => {
    const id = uid("arrow");
    apply({
      ...liveRef.current,
      objects: [...liveRef.current.objects, { id, type: "arrow", x, y, x2, y2, style: arrowStyleRef.current }],
    });
    setSelectedId(id);
    setTool("select");
  };

  const removeSelected = useCallback(() => {
    const id = selectedId;
    if (!id) return;
    apply({
      ...liveRef.current,
      objects: liveRef.current.objects.filter((object) => object.id !== id),
    });
    setSelectedId(null);
    setEditingId(null);
  }, [selectedId]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "Escape") {
        setSelectedId(null);
        setEditingId(null);
        setTool("select");
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        removeSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, removeSelected, selectedId]);

  const onPagePointerDown = (e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-misc-object]")) return;
    const pt = toPage(e.clientX, e.clientY);
    if (tool === "text") {
      e.preventDefault();
      addText(pt.x, pt.y);
      return;
    }
    if (tool === "note") {
      e.preventDefault();
      addNote(pt.x, pt.y);
      return;
    }
    if (tool === "image") {
      fileRef.current?.click();
      return;
    }
    if (tool === "arrow") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDraftArrow({ x: pt.x, y: pt.y, x2: pt.x, y2: pt.y, style: arrowStyleRef.current });
      setSelectedId(null);
      setEditingId(null);
      return;
    }
    setSelectedId(null);
    setEditingId(null);
  };

  const onPagePointerMove = (e: React.PointerEvent) => {
    if (!draftArrow) return;
    const pt = toPage(e.clientX, e.clientY);
    setDraftArrow((d) => (d ? { ...d, x2: pt.x, y2: pt.y } : d));
  };

  const onPagePointerUp = (e: React.PointerEvent) => {
    if (!draftArrow) return;
    const pt = toPage(e.clientX, e.clientY);
    const dx = pt.x - draftArrow.x;
    const dy = pt.y - draftArrow.y;
    setDraftArrow(null);
    if (Math.hypot(dx, dy) >= 12) addArrow(draftArrow.x, draftArrow.y, pt.x, pt.y);
  };

  const onDragMove = (e: PointerEvent) => {
    const d = drag.current;
    const current = liveRef.current;
    if (!d) return;
    const pt = toPage(e.clientX, e.clientY);
    apply(
      {
        ...current,
        objects: current.objects.map((o) => {
          if (o.id !== d.id) return o;
          const { w: pw, h: ph } = pageSize(current);
          if (d.kind === "move") {
            if (isArrow(o)) {
              const w = o.x2 - o.x;
              const h = o.y2 - o.y;
              const x = clamp(pt.x - d.dx, 0, pw);
              const y = clamp(pt.y - d.dy, 0, ph);
              return { ...o, x, y, x2: clamp(x + w, 0, pw), y2: clamp(y + h, 0, ph) };
            }
            return {
              ...o,
              x: clamp(pt.x - d.dx, -o.w + 24, pw - 24),
              y: clamp(pt.y - d.dy, -o.h + 24, ph - 24),
            };
          }
          if (d.kind === "resize" && !isArrow(o)) {
            return {
              ...o,
              w: clamp(d.ow + (pt.x - d.ox), 48, pw - o.x),
              h: clamp(d.oh + (pt.y - d.oy), 32, ph - o.y),
            };
          }
          if (d.kind === "endpoint" && isArrow(o)) {
            if (d.which === "start") return { ...o, x: pt.x, y: pt.y };
            return { ...o, x2: pt.x, y2: pt.y };
          }
          return o;
        }),
      },
      false,
    );
  };

  const onDragUp = () => {
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragUp);
    drag.current = null;
    commitRef.current(liveRef.current);
  };

  const startMove = (id: string, e: React.PointerEvent) => {
    if (!enabled) return;
    if (tool !== "select" && tool !== "text" && tool !== "note") return;
    const obj = liveRef.current.objects.find((o) => o.id === id);
    if (!obj) return;
    const pt = toPage(e.clientX, e.clientY);
    drag.current = { kind: "move", id, dx: pt.x - obj.x, dy: pt.y - obj.y };
    setSelectedId(id);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const startResize = (id: string, e: React.PointerEvent) => {
    if (!enabled) return;
    e.stopPropagation();
    const obj = liveRef.current.objects.find((o) => o.id === id);
    if (!obj || isArrow(obj)) return;
    const pt = toPage(e.clientX, e.clientY);
    drag.current = { kind: "resize", id, ox: pt.x, oy: pt.y, ow: obj.w, oh: obj.h };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const startEndpoint = (id: string, which: "start" | "end", e: React.PointerEvent) => {
    if (!enabled) return;
    e.stopPropagation();
    drag.current = { kind: "endpoint", id, which };
    setSelectedId(id);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const changeText = (id: string, text: string) => {
    apply({
      ...liveRef.current,
      objects: liveRef.current.objects.map((o) => (o.id === id && !isArrow(o) ? { ...o, text } : o)),
    });
  };

  const patchSelectedText = (patch: Partial<TextStyle>) => {
    const next = { ...textStyleRef.current, ...patch };
    setTextStyle(next);
    const id = selectedId;
    if (!id) return;
    apply({
      ...liveRef.current,
      objects: liveRef.current.objects.map((o) => (o.id === id && o.type === "text" ? { ...o, ...patch } : o)),
    });
  };

  const patchArrowStyle = (style: MiscArrowStyle) => {
    setArrowStyle(style);
    const id = selectedId;
    if (!id) return;
    apply({
      ...liveRef.current,
      objects: liveRef.current.objects.map((o) => (o.id === id && isArrow(o) ? { ...o, style } : o)),
    });
  };

  const pickTool = (next: Tool) => {
    setTool(next);
    if (next === "image") fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      setTool("select");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const img = new window.Image();
      img.onload = () => addImage(src, img.naturalWidth, img.naturalHeight);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return {
    page: live,
    tool,
    selectedId,
    editingId,
    draftArrow,
    pageRef,
    fileRef,
    pickTool,
    setSelectedId,
    setEditingId,
    removeSelected,
    onPagePointerDown,
    onPagePointerMove,
    onPagePointerUp,
    startMove,
    startResize,
    startEndpoint,
    changeText,
    onFileChange,
    textStyle: (() => {
      const selected = live.objects.find((o) => o.id === selectedId);
      if (selected?.type === "text") {
        return {
          fontSize: selected.fontSize ?? textStyle.fontSize,
          fontColor: selected.fontColor ?? textStyle.fontColor,
          fontFamily: selected.fontFamily ?? textStyle.fontFamily,
        };
      }
      return textStyle;
    })(),
    arrowStyle: (() => {
      const selected = live.objects.find((o) => o.id === selectedId);
      return selected && isArrow(selected) ? (selected.style ?? arrowStyle) : arrowStyle;
    })(),
    patchSelectedText,
    patchArrowStyle,
  };
}

function FloatingPanel({
  open,
  anchor,
  onClose,
  width,
  children,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  const [box, setBox] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      setBox({ left: r.left + r.width / 2, top: r.top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (anchor?.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest("[data-misc-pop]")) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose, open]);

  if (!open || !anchor) return null;
  return createPortal(
    <div
      data-misc-pop
      className="fixed z-[120] -translate-x-1/2 -translate-y-full rounded-2xl border border-mist bg-snow p-3 shadow-[0_12px_32px_rgba(26,25,22,0.14)]"
      style={{ left: box.left, top: box.top - 8, width: width ?? 248 }}
    >
      {children}
    </div>,
    document.body,
  );
}

function ArrowStylePreview({ style, className }: { style: MiscArrowStyle; className?: string }) {
  const d =
    style === "curve"
      ? "M4 20 Q 14 4 28 12"
      : "M4 16 L28 8";
  return (
    <svg viewBox="0 0 32 24" className={cn("h-5 w-8", className)} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray={style === "dashed" ? "3 2.5" : undefined}
        markerEnd={style === "line" ? undefined : `url(#tb-${style}-e)`}
        markerStart={style === "double" ? `url(#tb-${style}-s)` : undefined}
      />
      <defs>
        <marker id={`tb-${style}-e`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
        <marker id={`tb-${style}-s`} markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}

export function MiscPageToolbar({
  tool,
  selectedId,
  onPickTool,
  onRemove,
  compact,
  textStyle = DEFAULT_TEXT_STYLE,
  arrowStyle = "straight",
  onTextStyle,
  onArrowStyle,
  endSlot,
}: {
  tool: Tool;
  selectedId: string | null;
  onPickTool: (tool: Tool) => void;
  onRemove: () => void;
  compact?: boolean;
  textStyle?: TextStyle;
  arrowStyle?: MiscArrowStyle;
  onTextStyle?: (patch: Partial<TextStyle>) => void;
  onArrowStyle?: (style: MiscArrowStyle) => void;
  endSlot?: ReactNode;
}) {
  const size = compact ? 13 : 15;
  const [open, setOpen] = useState<"text" | "arrow" | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const btn = (active: boolean) =>
    cn(
      "flex items-center justify-center",
      compact ? "h-7" : "h-8",
      active ? "bg-ink text-snow" : "text-stone hover:bg-paper hover:text-ink",
    );

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-mist bg-snow/95 shadow-[0_8px_30px_rgba(26,25,22,0.06)]",
        compact ? "p-1" : "p-1.5",
      )}
    >
      {MISC_TOOLS.map((t) => {
        const Icon = t.icon;
        const active = tool === t.id;
        if (t.id === "text" || t.id === "arrow") {
          return (
            <div
              key={t.id}
              ref={t.id === "text" ? textRef : arrowRef}
              className={cn("flex items-center overflow-hidden rounded-full", active && "bg-ink text-snow")}
            >
              <button
                type="button"
                title={t.label}
                onClick={() => {
                  onPickTool(t.id);
                  setOpen(null);
                }}
                className={cn(btn(active), compact ? "w-7" : "w-8", "rounded-none")}
              >
                <Icon size={size} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                title={`${t.label} 스타일`}
                aria-expanded={open === t.id}
                onClick={() => {
                  onPickTool(t.id);
                  setOpen((v) => (v === t.id ? null : t.id));
                }}
                className={cn(btn(active), compact ? "w-4 pr-1" : "w-5 pr-1.5", "rounded-none")}
              >
                <ChevronDown size={10} strokeWidth={2.2} className={cn(open === t.id && "rotate-180")} />
              </button>
            </div>
          );
        }
        return (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => {
              onPickTool(t.id);
              setOpen(null);
            }}
            className={cn(btn(active), "rounded-full", compact ? "w-7" : "w-8")}
          >
            <Icon size={size} strokeWidth={1.7} />
          </button>
        );
      })}
      {endSlot}
      {selectedId && (
        <>
          <div className="mx-1 h-5 w-px bg-mist" />
          <button
            type="button"
            title="삭제"
            onClick={onRemove}
            className={cn(
              "flex items-center justify-center rounded-full text-stone hover:bg-paper hover:text-danger",
              compact ? "h-7 w-7" : "h-8 w-8",
            )}
          >
            <Trash2 size={compact ? 13 : 14} />
          </button>
        </>
      )}
      <FloatingPanel open={open === "text"} anchor={textRef.current} onClose={() => setOpen(null)} width={260}>
        <p className="text-[11px] text-stone">글자 크기</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {TEXT_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onTextStyle?.({ fontSize: n })}
              className={cn(
                "h-7 min-w-7 rounded-md px-1.5 text-[12px]",
                textStyle.fontSize === n ? "bg-ink text-snow" : "bg-paper text-ink hover:bg-mist",
              )}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={8}
            max={96}
            value={textStyle.fontSize}
            onChange={(e) => onTextStyle?.({ fontSize: clamp(Number(e.target.value) || 18, 8, 96) })}
            className="h-7 w-14 rounded-md border border-mist px-1.5 text-[12px] outline-none"
          />
        </div>
        <p className="mt-3 text-[11px] text-stone">색</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => onTextStyle?.({ fontColor: c })}
              className={cn(
                "h-6 w-6 rounded-full border",
                textStyle.fontColor === c ? "border-ink ring-2 ring-ink/20" : "border-mist",
              )}
              style={{ background: c }}
            />
          ))}
          <label className="relative h-6 w-6 overflow-hidden rounded-full border border-mist">
            <span className="sr-only">직접 고르기</span>
            <input
              type="color"
              value={textStyle.fontColor}
              onChange={(e) => onTextStyle?.({ fontColor: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="block h-full w-full" style={{ background: textStyle.fontColor }} />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-stone">폰트</p>
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          {TEXT_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onTextStyle?.({ fontFamily: f.family })}
              className={cn(
                "h-8 rounded-md px-2 text-left text-[12px]",
                textStyle.fontFamily === f.family ? "bg-ink text-snow" : "bg-paper text-ink hover:bg-mist",
              )}
              style={{ fontFamily: f.family }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FloatingPanel>
      <FloatingPanel open={open === "arrow"} anchor={arrowRef.current} onClose={() => setOpen(null)} width={220}>
        <p className="text-[11px] text-stone">화살표 종류</p>
        <div className="mt-1.5 grid grid-cols-1 gap-1">
          {ARROW_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onArrowStyle?.(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px]",
                arrowStyle === s.id ? "bg-ink text-snow" : "text-ink hover:bg-paper",
              )}
            >
              <ArrowStylePreview style={s.id} />
              {s.label}
            </button>
          ))}
        </div>
      </FloatingPanel>
    </div>
  );
}

export function MiscBoard({ product }: { product: Product }) {
  const { updateSpecsField } = useWorkspace();
  const [pages, setPagesState] = useState(() => miscBoardOf(product.specs));
  const [pageId, setPageId] = useState(pages[0]?.id ?? "");
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [draftArrow, setDraftArrow] = useState<{ x: number; y: number; x2: number; y2: number; style?: MiscArrowStyle } | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyle>(DEFAULT_TEXT_STYLE);
  const [arrowStyle, setArrowStyle] = useState<MiscArrowStyle>("straight");
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  const size = pageSize(page);

  useEffect(() => {
    if (drag.current) return;
    setPagesState(miscBoardOf(product.specs));
  }, [product.specs]);

  useEffect(() => {
    if (!pages.some((p) => p.id === pageId) && pages[0]) setPageId(pages[0].id);
  }, [pages, pageId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const { w, h } = pageSize(pagesRef.current.find((p) => p.id === pageId) ?? pagesRef.current[0]);
      const cs = getComputedStyle(el);
      const availW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const fit = Math.min(availW / w, availH / h);
      setZoom(clamp(fit, 0.22, 1.4));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageId, page?.orient]);

  const commit = useCallback(
    (next: MiscPage[]) => {
      setPagesState(next);
      pagesRef.current = next;
      updateSpecsField(product.id, (p) => ({
        ...p,
        specs: { ...p.specs, miscBoard: next },
      }));
    },
    [product.id, updateSpecsField],
  );

  const setPages = useCallback(
    (updater: (prev: MiscPage[]) => MiscPage[], persist = true) => {
      const next = updater(pagesRef.current);
      pagesRef.current = next;
      setPagesState(next);
      if (persist) {
        updateSpecsField(product.id, (p) => ({
          ...p,
          specs: { ...p.specs, miscBoard: next },
        }));
      }
    },
    [product.id, updateSpecsField],
  );

  const patchPage = useCallback(
    (updater: (page: MiscPage) => MiscPage, persist = true) => {
      setPages(
        (prev) => prev.map((p) => (p.id === (page?.id ?? pageId) ? updater(p) : p)),
        persist,
      );
    },
    [page?.id, pageId, setPages],
  );

  const toPage = (clientX: number, clientY: number) => {
    const el = pageRef.current;
    const current = pagesRef.current.find((p) => p.id === pageId) ?? pagesRef.current[0];
    const { w, h } = pageSize(current);
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: clamp(((clientX - r.left) / r.width) * w, 0, w),
      y: clamp(((clientY - r.top) / r.height) * h, 0, h),
    };
  };

  const addText = (x: number, y: number) => {
    const id = uid("text");
    patchPage((p) => ({
      ...p,
      objects: [
        ...p.objects,
        { id, type: "text", x: x - 8, y: y - 12, w: 280, h: 72, text: "", ...textStyleRef.current },
      ],
    }));
    setSelectedId(id);
    setEditingId(id);
    setTool("select");
  };

  const addNote = (x: number, y: number) => {
    const id = uid("note");
    patchPage((p) => ({
      ...p,
      objects: [...p.objects, { id, type: "note", x: x - 16, y: y - 16, w: 188, h: 128, text: "" }],
    }));
    setSelectedId(id);
    setEditingId(id);
    setTool("select");
  };

  const addImage = (src: string, naturalW: number, naturalH: number) => {
    const max = 360;
    const ratio = naturalW / Math.max(1, naturalH);
    const w = naturalW >= naturalH ? max : Math.round(max * ratio);
    const h = naturalW >= naturalH ? Math.round(max / ratio) : max;
    const id = uid("image");
    patchPage((p) => ({
      ...p,
      objects: [...p.objects, { id, type: "image", x: 80, y: 80, w, h, src }],
    }));
    setSelectedId(id);
    setTool("select");
  };

  const addArrow = (x: number, y: number, x2: number, y2: number) => {
    const id = uid("arrow");
    patchPage((p) => ({
      ...p,
      objects: [...p.objects, { id, type: "arrow", x, y, x2, y2, style: arrowStyle }],
    }));
    setSelectedId(id);
    setTool("select");
  };

  const removeSelected = useCallback(() => {
    if (!selectedId || !page) return;
    patchPage((p) => ({ ...p, objects: p.objects.filter((o) => o.id !== selectedId) }));
    setSelectedId(null);
    setEditingId(null);
  }, [page, patchPage, selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "Escape") {
        setSelectedId(null);
        setEditingId(null);
        setTool("select");
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        removeSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [removeSelected, selectedId]);

  const onPagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-misc-object]")) return;
    const pt = toPage(e.clientX, e.clientY);
    if (tool === "text") {
      e.preventDefault();
      addText(pt.x, pt.y);
      return;
    }
    if (tool === "note") {
      e.preventDefault();
      addNote(pt.x, pt.y);
      return;
    }
    if (tool === "image") {
      fileRef.current?.click();
      return;
    }
    if (tool === "arrow") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDraftArrow({ x: pt.x, y: pt.y, x2: pt.x, y2: pt.y, style: arrowStyleRef.current });
      setSelectedId(null);
      setEditingId(null);
      return;
    }
    setSelectedId(null);
    setEditingId(null);
  };

  const onPagePointerMove = (e: React.PointerEvent) => {
    if (!draftArrow) return;
    const pt = toPage(e.clientX, e.clientY);
    setDraftArrow((d) => (d ? { ...d, x2: pt.x, y2: pt.y } : d));
  };

  const onPagePointerUp = (e: React.PointerEvent) => {
    if (!draftArrow) return;
    const pt = toPage(e.clientX, e.clientY);
    const dx = pt.x - draftArrow.x;
    const dy = pt.y - draftArrow.y;
    setDraftArrow(null);
    if (Math.hypot(dx, dy) >= 12) addArrow(draftArrow.x, draftArrow.y, pt.x, pt.y);
  };

  const startMove = (id: string, e: React.PointerEvent) => {
    if (tool !== "select" && tool !== "text" && tool !== "note") return;
    const obj = page?.objects.find((o) => o.id === id);
    if (!obj) return;
    const pt = toPage(e.clientX, e.clientY);
    drag.current = { kind: "move", id, dx: pt.x - obj.x, dy: pt.y - obj.y };
    setSelectedId(id);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const startResize = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const obj = page?.objects.find((o) => o.id === id);
    if (!obj || isArrow(obj)) return;
    const pt = toPage(e.clientX, e.clientY);
    drag.current = { kind: "resize", id, ox: pt.x, oy: pt.y, ow: obj.w, oh: obj.h };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const startEndpoint = (id: string, which: "start" | "end", e: React.PointerEvent) => {
    e.stopPropagation();
    drag.current = { kind: "endpoint", id, which };
    setSelectedId(id);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const onDragMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || !page) return;
    const pt = toPage(e.clientX, e.clientY);
    setPages(
      (prev) =>
        prev.map((p) => {
          if (p.id !== page.id) return p;
          return {
            ...p,
            objects: p.objects.map((o) => {
              if (o.id !== d.id) return o;
              if (d.kind === "move") {
                const { w: pw, h: ph } = pageSize(p);
                if (isArrow(o)) {
                  const w = o.x2 - o.x;
                  const h = o.y2 - o.y;
                  const x = clamp(pt.x - d.dx, 0, pw);
                  const y = clamp(pt.y - d.dy, 0, ph);
                  return { ...o, x, y, x2: clamp(x + w, 0, pw), y2: clamp(y + h, 0, ph) };
                }
                return {
                  ...o,
                  x: clamp(pt.x - d.dx, -o.w + 24, pw - 24),
                  y: clamp(pt.y - d.dy, -o.h + 24, ph - 24),
                };
              }
              if (d.kind === "resize" && !isArrow(o)) {
                const { w: pw, h: ph } = pageSize(p);
                return {
                  ...o,
                  w: clamp(d.ow + (pt.x - d.ox), 48, pw - o.x),
                  h: clamp(d.oh + (pt.y - d.oy), 32, ph - o.y),
                };
              }
              if (d.kind === "endpoint" && isArrow(o)) {
                if (d.which === "start") return { ...o, x: pt.x, y: pt.y };
                return { ...o, x2: pt.x, y2: pt.y };
              }
              return o;
            }),
          };
        }),
      false,
    );
  };

  const onDragUp = () => {
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragUp);
    drag.current = null;
    commit(pagesRef.current);
  };

  const updateObject = (id: string, patch: Partial<MiscBoxObject>) => {
    patchPage((p) => ({
      ...p,
      objects: p.objects.map((o) => (o.id === id && !isArrow(o) ? { ...o, ...patch } : o)),
    }));
  };

  const selectedObj = page?.objects.find((o) => o.id === selectedId);
  const activeTextStyle =
    selectedObj?.type === "text"
      ? {
          fontSize: selectedObj.fontSize ?? textStyle.fontSize,
          fontColor: selectedObj.fontColor ?? textStyle.fontColor,
          fontFamily: selectedObj.fontFamily ?? textStyle.fontFamily,
        }
      : textStyle;
  const activeArrowStyle = selectedObj && isArrow(selectedObj) ? (selectedObj.style ?? arrowStyle) : arrowStyle;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="flex w-[132px] shrink-0 flex-col border-r border-mist bg-snow/70">
        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {pages.map((p, i) => (
            <div key={p.id} className="group relative">
              <button
                type="button"
                onClick={() => {
                  setPageId(p.id);
                  setSelectedId(null);
                  setEditingId(null);
                }}
                className={cn(
                  "block w-full overflow-hidden rounded-lg border bg-white text-left",
                  p.id === page?.id ? "border-ink" : "border-mist hover:border-fog",
                )}
              >
                <div className="pointer-events-none flex min-h-[88px] items-center justify-center overflow-hidden bg-white py-2">
                  <MiscPagePreview page={p} />
                </div>
                <input
                  key={p.title}
                  defaultValue={p.title?.trim() || String(i + 1)}
                  aria-label={`${i + 1}페이지 제목`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    const title = e.target.value.trim() || p.title || String(i + 1);
                    if (title === p.title) return;
                    commit(pages.map((x) => (x.id === p.id ? { ...x, title } : x)));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                  className="w-full border-t border-mist bg-transparent px-2 py-1 text-center text-[11px] text-stone outline-none hover:text-ink focus:text-ink"
                />
              </button>
              {pages.length > 1 && (
                <button
                  type="button"
                  aria-label={`${i + 1}페이지 삭제`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = pages.filter((x) => x.id !== p.id);
                    commit(next);
                    if (pageId === p.id) setPageId(next[0]?.id ?? "");
                  }}
                  className="absolute top-1.5 right-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-snow/90 text-stone shadow-sm group-hover:flex hover:text-ink"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = emptyMiscPage(pages.length + 1);
            commit([...pages, next]);
            setPageId(next.id);
            setSelectedId(null);
          }}
          className="m-2 flex h-9 items-center justify-center gap-1 rounded-full border border-dashed border-fog text-[12px] text-stone hover:border-ink hover:text-ink"
        >
          <Plus size={13} />
          페이지
        </button>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div ref={wrapRef} className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5 pb-16">
          {page && (
            <div style={{ width: size.w * zoom, height: size.h * zoom }}>
              <div
                ref={pageRef}
                onPointerDown={onPagePointerDown}
                onPointerMove={onPagePointerMove}
                onPointerUp={onPagePointerUp}
                className={cn(
                  "relative origin-top-left bg-white shadow-float select-none",
                  tool === "text" || tool === "note" || tool === "arrow" ? "cursor-crosshair" : "cursor-default",
                )}
                data-misc-page="true"
                style={{
                  width: size.w,
                  height: size.h,
                  transform: `scale(${zoom})`,
                }}
              >
                <MiscPageSurface
                  page={page}
                  selectedId={selectedId}
                  editingId={editingId}
                  draftArrow={draftArrow}
                  onSelect={(id) => {
                    setSelectedId(id);
                    if (editingId && editingId !== id) setEditingId(null);
                  }}
                  onEdit={setEditingId}
                  onMoveStart={startMove}
                  onResizeStart={startResize}
                  onEndpointStart={startEndpoint}
                  onChangeText={(id, text) => updateObject(id, { text })}
                />
              </div>
            </div>
          )}
        </div>

        <aside className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
          <MiscPageToolbar
            tool={tool}
            selectedId={selectedId}
            onPickTool={(next) => {
              setTool(next);
              if (next === "image") fileRef.current?.click();
            }}
            onRemove={removeSelected}
            textStyle={activeTextStyle}
            arrowStyle={activeArrowStyle}
            onTextStyle={(patch) => {
              setTextStyle((s) => ({ ...s, ...patch }));
              if (selectedObj?.type === "text") updateObject(selectedObj.id, patch);
            }}
            onArrowStyle={(style) => {
              setArrowStyle(style);
              if (selectedObj && isArrow(selectedObj)) {
                patchPage((p) => ({
                  ...p,
                  objects: p.objects.map((o) => (o.id === selectedObj.id && isArrow(o) ? { ...o, style } : o)),
                }));
              }
            }}
            endSlot={
              <>
                <div className="mx-1 h-5 w-px bg-mist" />
                <button
                  type="button"
                  title="축소"
                  onClick={() => setZoom((z) => clamp(z - 0.08, 0.28, 1.4))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  title="확대"
                  onClick={() => setZoom((z) => clamp(z + 0.08, 0.28, 1.4))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
                >
                  <Plus size={14} />
                </button>
              </>
            }
          />
        </aside>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) {
            setTool("select");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const src = String(reader.result ?? "");
            const img = new window.Image();
            img.onload = () => addImage(src, img.naturalWidth, img.naturalHeight);
            img.src = src;
          };
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

export function MiscPagePreview({ page }: { page: MiscPage }) {
  const { w, h } = pageSize(page);
  const scale = Math.min(108 / w, 88 / h);
  return (
    <div className="overflow-hidden" style={{ width: w * scale, height: h * scale }}>
      <div
        className="pointer-events-none origin-top-left bg-white"
        style={{ width: w, height: h, transform: `scale(${scale})` }}
      >
        <MiscPageSurface page={page} />
      </div>
    </div>
  );
}

export function MiscPageSurface({
  page,
  selectedId,
  editingId,
  draftArrow,
  onSelect,
  onEdit,
  onMoveStart,
  onResizeStart,
  onEndpointStart,
  onChangeText,
}: {
  page: MiscPage;
  selectedId?: string | null;
  editingId?: string | null;
  draftArrow?: { x: number; y: number; x2: number; y2: number; style?: MiscArrowStyle } | null;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMoveStart?: (id: string, e: React.PointerEvent) => void;
  onResizeStart?: (id: string, e: React.PointerEvent) => void;
  onEndpointStart?: (id: string, which: "start" | "end", e: React.PointerEvent) => void;
  onChangeText?: (id: string, text: string) => void;
}) {
  const { w, h } = pageSize(page);
  const markerId = `arrow-${page.id}`;
  const arrows = page.objects.filter(isArrow);
  const boxes = page.objects.filter((o): o is MiscBoxObject => !isArrow(o));

  return (
    <>
      <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
        <defs>
          <marker id={`${markerId}-ink`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="#1a1916" />
          </marker>
          <marker id={`${markerId}-sel`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="#0d99ff" />
          </marker>
          <marker id={`${markerId}-ink-start`} markerWidth="8" markerHeight="8" refX="1" refY="3" orient="auto">
            <path d="M7,0 L0,3 L7,6 Z" fill="#1a1916" />
          </marker>
          <marker id={`${markerId}-sel-start`} markerWidth="8" markerHeight="8" refX="1" refY="3" orient="auto">
            <path d="M7,0 L0,3 L7,6 Z" fill="#0d99ff" />
          </marker>
        </defs>
        {arrows.map((arrow) => (
          <ArrowShape
            key={arrow.id}
            arrow={arrow}
            markerId={markerId}
            selected={selectedId === arrow.id}
            onSelect={onSelect}
            onMoveStart={onMoveStart}
            onEndpointStart={onEndpointStart}
          />
        ))}
        {draftArrow && (
          <ArrowPath
            x={draftArrow.x}
            y={draftArrow.y}
            x2={draftArrow.x2}
            y2={draftArrow.y2}
            style={draftArrow.style ?? "straight"}
            markerId={markerId}
            selected={false}
          />
        )}
      </svg>
      {boxes.map((object) => (
        <BoxObject
          key={object.id}
          object={object}
          selected={selectedId === object.id}
          editing={editingId === object.id}
          onSelect={onSelect}
          onEdit={onEdit}
          onMoveStart={onMoveStart}
          onResizeStart={onResizeStart}
          onChangeText={onChangeText}
        />
      ))}
      {page.objects.length === 0 && !draftArrow && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="max-w-[280px] text-center text-[13px] leading-relaxed text-stone">
            아래에서 텍스트, 이미지, 화살표, 주석을 골라 페이지에 올려 보세요.
          </p>
        </div>
      )}
    </>
  );
}

function arrowCurve(x: number, y: number, x2: number, y2: number) {
  const mx = (x + x2) / 2;
  const my = (y + y2) / 2;
  const dx = x2 - x;
  const dy = y2 - y;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * Math.min(48, len * 0.28);
  const oy = (dx / len) * Math.min(48, len * 0.28);
  return `M ${x} ${y} Q ${mx + ox} ${my + oy} ${x2} ${y2}`;
}

function ArrowPath({
  x,
  y,
  x2,
  y2,
  style,
  markerId,
  selected,
  hit,
}: {
  x: number;
  y: number;
  x2: number;
  y2: number;
  style: MiscArrowStyle;
  markerId: string;
  selected?: boolean;
  hit?: {
    id: string;
    onSelect?: (id: string) => void;
    onMoveStart?: (id: string, e: React.PointerEvent) => void;
  };
}) {
  const tone = selected ? "sel" : "ink";
  const stroke = selected ? "#0d99ff" : "#1a1916";
  const end = style === "line" ? undefined : `url(#${markerId}-${tone})`;
  const start = style === "double" ? `url(#${markerId}-${tone}-start)` : undefined;
  const dash = style === "dashed" ? "8 6" : undefined;
  const common = {
    stroke,
    strokeWidth: 2,
    fill: "none" as const,
    strokeDasharray: dash,
    markerEnd: end,
    markerStart: start,
    className: "pointer-events-none",
  };
  return (
    <g>
      {hit && (
        <line
          x1={x}
          y1={y}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth="16"
          className={hit.onSelect ? "cursor-move" : undefined}
          onPointerDown={(e) => {
            e.stopPropagation();
            hit.onSelect?.(hit.id);
            hit.onMoveStart?.(hit.id, e);
          }}
        />
      )}
      {style === "curve" ? <path d={arrowCurve(x, y, x2, y2)} {...common} /> : <line x1={x} y1={y} x2={x2} y2={y2} {...common} />}
    </g>
  );
}

function ArrowShape({
  arrow,
  markerId,
  selected,
  onSelect,
  onMoveStart,
  onEndpointStart,
}: {
  arrow: MiscArrowObject;
  markerId: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onMoveStart?: (id: string, e: React.PointerEvent) => void;
  onEndpointStart?: (id: string, which: "start" | "end", e: React.PointerEvent) => void;
}) {
  return (
    <g data-misc-object={arrow.id}>
      <ArrowPath
        x={arrow.x}
        y={arrow.y}
        x2={arrow.x2}
        y2={arrow.y2}
        style={arrow.style ?? "straight"}
        markerId={markerId}
        selected={selected}
        hit={{ id: arrow.id, onSelect, onMoveStart }}
      />
      {selected && onEndpointStart && (
        <>
          <circle
            cx={arrow.x}
            cy={arrow.y}
            r="6"
            fill="#fff"
            stroke="#0d99ff"
            strokeWidth="1.5"
            className="cursor-move"
            onPointerDown={(e) => onEndpointStart(arrow.id, "start", e)}
          />
          <circle
            cx={arrow.x2}
            cy={arrow.y2}
            r="6"
            fill="#fff"
            stroke="#0d99ff"
            strokeWidth="1.5"
            className="cursor-move"
            onPointerDown={(e) => onEndpointStart(arrow.id, "end", e)}
          />
        </>
      )}
    </g>
  );
}

function BoxObject({
  object,
  selected,
  editing,
  onSelect,
  onEdit,
  onMoveStart,
  onResizeStart,
  onChangeText,
}: {
  object: MiscBoxObject;
  selected?: boolean;
  editing?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMoveStart?: (id: string, e: React.PointerEvent) => void;
  onResizeStart?: (id: string, e: React.PointerEvent) => void;
  onChangeText?: (id: string, text: string) => void;
}) {
  return (
    <div
      data-misc-object={object.id}
      className={cn("absolute", selected ? "z-10" : "z-[1]")}
      style={{ left: object.x, top: object.y, width: object.w, height: object.h }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect?.(object.id);
        if (!editing) onMoveStart?.(object.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (object.type !== "image") onEdit?.(object.id);
      }}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden",
          object.type === "note" && "rounded-md bg-butter px-3 py-2.5 text-butter-ink",
          selected && "ring-1 ring-[#0d99ff]",
        )}
      >
        {object.type === "image" && object.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={object.src} alt="" className="h-full w-full object-contain" draggable={false} />
        )}
        {object.type !== "image" &&
          (editing ? (
            <textarea
              autoFocus
              value={object.text ?? ""}
              placeholder={object.type === "note" ? "주석을 입력하세요" : "텍스트 입력"}
              onChange={(e) => onChangeText?.(object.id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "h-full w-full resize-none bg-transparent outline-none select-text",
                object.type === "note" ? "text-[13px] leading-relaxed" : "text-ink",
              )}
              style={
                object.type === "text"
                  ? {
                      fontSize: object.fontSize ?? 18,
                      lineHeight: 1.35,
                      color: object.fontColor,
                      fontFamily: object.fontFamily,
                    }
                  : undefined
              }
            />
          ) : (
            <p
              className={cn(
                "h-full whitespace-pre-wrap break-words",
                object.type === "note" ? "text-[13px] leading-relaxed" : "text-ink",
                !(object.text ?? "").trim() && "text-stone",
              )}
              style={
                object.type === "text"
                  ? {
                      fontSize: object.fontSize ?? 18,
                      lineHeight: 1.35,
                      color: object.fontColor,
                      fontFamily: object.fontFamily,
                    }
                  : undefined
              }
            >
              {(object.text ?? "").trim()
                ? object.text
                : object.type === "note"
                  ? "주석을 입력하세요"
                  : "텍스트 입력"}
            </p>
          ))}
      </div>
      {selected && onResizeStart && (
        <button
          type="button"
          aria-label="크기 조절"
          onPointerDown={(e) => onResizeStart(object.id, e)}
          className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-sm border border-[#0d99ff] bg-white"
        />
      )}
    </div>
  );
}
