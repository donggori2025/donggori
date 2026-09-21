"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  BoxSelect,
  FlipHorizontal,
  Layers,
  Minus,
  MousePointer2,
  PenTool,
  Pencil,
  Plus,
  RotateCw,
  Square,
  Type,
  Image as ImageIcon,
  Group,
  Scan,
  Trash2,
} from "lucide-react";
import { Mockup2D, Mockup3D, SelectableFlat, partsForCategory } from "./flats";
import { MiniFlat } from "./ui";
import { svgPairsOf } from "@/lib/generate-board";
import { useWorkspace } from "@/lib/store";
import type { CanvasNode, CanvasNodeType, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SpecAssignChip } from "./spec-role-hint";

const TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "pen", icon: PenTool, label: "Pen" },
  { id: "pencil", icon: Pencil, label: "Pencil" },
  { id: "shape", icon: Square, label: "Shape" },
  { id: "text", icon: Type, label: "Text" },
  { id: "image", icon: ImageIcon, label: "Image" },
  { id: "anchor", icon: Scan, label: "Anchor" },
] as const;

const MORE = [
  { id: "layer", icon: Layers, label: "Layer" },
  { id: "align", icon: AlignCenter, label: "Align" },
  { id: "flip", icon: FlipHorizontal, label: "Flip" },
  { id: "rotate", icon: RotateCw, label: "Rotate" },
  { id: "group", icon: Group, label: "Group" },
  { id: "boolean", icon: BoxSelect, label: "Boolean" },
];

const ADD_ITEMS: { type: CanvasNodeType; label: string; hint: string }[] = [
  { type: "mockup2d", label: "2D Mockup", hint: "2D 시각화" },
  { type: "mockup3d", label: "3D Mockup", hint: "3D 시각화" },
];

const PLUS_SIZE = 40;
const PLUS_GAP = 36;
const CARD_TITLE = 28;
/** Left layers rail width (icon rail 56 + panel 248). */
export const DESIGN_LEFT_RAIL_W = 304;
/** Right collab rail (속성 / 코멘트 / 버전). */
export const DESIGN_RIGHT_RAIL_W = 320;
/** Viewport inset matching `top-3` / `left-3` / `right-3`. */
export const DESIGN_FLOAT_INSET = 12;
/** Gap between stacked floating cards (title ↔ sidebar, share ↔ properties). */
export const DESIGN_FLOAT_GAP = 12;
const SIDEBAR_SHIFT = DESIGN_LEFT_RAIL_W;

export function designChromeSideOffsets(opts: { sidebarOpen?: boolean; railOpen?: boolean }) {
  const left = DESIGN_FLOAT_INSET + (opts.sidebarOpen ? DESIGN_LEFT_RAIL_W + DESIGN_FLOAT_GAP : 0);
  const right = DESIGN_FLOAT_INSET + (opts.railOpen ? DESIGN_RIGHT_RAIL_W + DESIGN_FLOAT_GAP : 0);
  return { left, right };
}

function nodeSize(node: CanvasNode) {
  const fallback =
    node.type === "label"
      ? { w: 254, h: 260 }
      : node.type === "mockup2d" || node.type === "mockup3d"
        ? { w: 254, h: 320 }
        : { w: 374, h: 400 };
  return { w: node.w ?? fallback.w, h: node.h ?? fallback.h };
}

export function DesignCanvas({
  product,
  selectedTarget,
  onSelectTarget,
  readOnly = false,
  railOpen = false,
  sidebarOpen = true,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  onSelectTarget: (t: { id: string; label: string } | null) => void;
  readOnly?: boolean;
  railOpen?: boolean;
  sidebarOpen?: boolean;
}) {
  const { addNode, moveNode, deleteNode, hideNodePart, comments, setSpecArtboard } = useWorkspace();
  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40 + SIDEBAR_SHIFT, y: 72 });
  const [addOpenId, setAddOpenId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const sidebarOpenRef = useRef(sidebarOpen);
  const [overTrash, setOverTrash] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const drag = useRef<{ id: string; ox: number; oy: number; nx: number; ny: number } | null>(null);
  const space = useRef(false);
  const didPan = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  const commented = comments
    .filter((c) => c.productId === product.id && c.context.mode === "design")
    .map((c) => c.context.target);
  const chrome = designChromeSideOffsets({ sidebarOpen, railOpen });
  const visibleNodes = product.nodes.filter((n) => n.type !== "label");
  const flats = visibleNodes.filter((n) => n.type === "flat");
  const plusByFlat = flats.map((node) => {
    const { w, h } = nodeSize(node);
    const midY = node.y + CARD_TITLE + h / 2;
    return {
      id: node.id,
      left: node.x + w + PLUS_GAP,
      top: midY - PLUS_SIZE / 2,
      lineLeft: node.x + w,
      lineTop: midY,
    };
  });
  const linkedFocus = visibleNodes.find(
    (n) =>
      n.linkedTo &&
      n.generate?.kind !== "svg" &&
      (n.id === selectedTarget?.id || n.id === draggingId),
  );
  const svgPairs = svgPairsOf(visibleNodes);
  const focusedPair = svgPairs.find(
    (pair) =>
      pair.source.id === selectedTarget?.id ||
      pair.svg.id === selectedTarget?.id ||
      pair.source.id === draggingId ||
      pair.svg.id === draggingId,
  );
  const pairFocusId = focusedPair?.svg.id ?? null;

  const typingTarget = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.min(1.8, Math.max(0.5, z - e.deltaY * 0.001)));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  const hitsTrash = (x: number, y: number) => {
    const el = trashRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const removeSelected = useCallback(() => {
    if (readOnly) return;
    if (!selectedTarget) return;
    const node = product.nodes.find((n) => n.id === selectedTarget.id);
    if (node) {
      deleteNode(product.id, node.id);
      onSelectTarget(null);
      return;
    }
    const flatNode = product.nodes.find((n) => n.type === "flat");
    if (flatNode && partsForCategory(product.category).some((p) => p.id === selectedTarget.id)) {
      hideNodePart(product.id, flatNode.id, selectedTarget.id);
      onSelectTarget(null);
    }
  }, [selectedTarget, product, deleteNode, hideNodePart, onSelectTarget, readOnly]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (typingTarget(e.target)) return;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!space.current) {
          space.current = true;
          setSpaceHeld(true);
        }
        return;
      }
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (!selectedTarget) return;
      e.preventDefault();
      removeSelected();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        space.current = false;
        setSpaceHeld(false);
        setPanning(false);
      }
    };
    const onBlur = () => {
      space.current = false;
      setSpaceHeld(false);
      setPanning(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [selectedTarget, removeSelected]);

  useEffect(() => {
    if (sidebarOpenRef.current === sidebarOpen) return;
    sidebarOpenRef.current = sidebarOpen;
    setPan((p) => ({ ...p, x: p.x + (sidebarOpen ? SIDEBAR_SHIFT : -SIDEBAR_SHIFT) }));
  }, [sidebarOpen]);

  return (
    <div className="relative h-full overflow-hidden bg-paper">
      <div
        ref={wrap}
        className={cn(
          "canvas-dot absolute inset-0 h-full w-full",
          spaceHeld && "cursor-grab [&_*]:!cursor-grab",
          panning && "cursor-grabbing [&_*]:!cursor-grabbing",
        )}
        onWheel={onWheel}
        onMouseDown={(e) => {
          if (e.button === 1 || space.current || e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            didPan.current = false;
            setPanning(true);
            const sx = e.clientX;
            const sy = e.clientY;
            const start = { ...pan };
            const move = (ev: MouseEvent) => {
              didPan.current = true;
              setPan({ x: start.x + ev.clientX - sx, y: start.y + ev.clientY - sy });
            };
            const up = () => {
              setPanning(false);
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", up);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }
        }}
        onClick={() => {
          if (didPan.current) {
            didPan.current = false;
            return;
          }
          setAddOpenId(null);
          if (tool === "select") onSelectTarget(null);
        }}
      >
        <div
          className="origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div className="relative overflow-visible" style={{ width: 1800, height: 1200 }}>
            {plusByFlat.length > 0 && (
              <svg className="pointer-events-none absolute inset-0 overflow-visible" width="1800" height="1200">
                {plusByFlat.map((plus) => {
                  const children = visibleNodes.filter(
                    (n) => n.linkedTo === plus.id && n.generate?.kind !== "svg",
                  );
                  const focused = children.find((n) => n.id === linkedFocus?.id);
                  const showHub = Boolean(!readOnly && (addOpenId === plus.id || focused));
                  if (!showHub && !focused) return null;
                  return (
                    <g key={plus.id}>
                      {showHub && (
                      <line
                        x1={plus.lineLeft}
                        y1={plus.lineTop}
                        x2={plus.left}
                        y2={plus.lineTop}
                        stroke="#a8a39b"
                        strokeWidth="3.25"
                        strokeLinecap="round"
                        strokeDasharray="0 9"
                      />
                      )}
                      {focused && (
                        <line
                          x1={readOnly || !showHub ? plus.lineLeft : plus.left + PLUS_SIZE}
                          y1={plus.top + PLUS_SIZE / 2}
                          x2={focused.x}
                          y2={focused.y + CARD_TITLE + nodeSize(focused).h / 2}
                          stroke="#a8a39b"
                          strokeWidth="3.25"
                          strokeLinecap="round"
                          strokeDasharray="0 9"
                        />
                      )}
                    </g>
                  );
                })}
                {svgPairs.map(({ source, svg }) => {
                  const src = nodeSize(source);
                  const dst = nodeSize(svg);
                  const plus = plusByFlat.find((p) => p.id === source.id);
                  const active = pairFocusId === svg.id;
                  const x1 = source.x + src.w;
                  const y1 = source.y + CARD_TITLE + src.h / 2;
                  const x2 = svg.x;
                  const y2 = svg.y + CARD_TITLE + dst.h / 2;
                  const hubX = plus ? plus.left + PLUS_SIZE / 2 : x1;
                  const hubY = plus ? plus.top + PLUS_SIZE / 2 : y1;
                  const stroke = active ? "#0d99ff" : "#a8a39b";
                  return (
                    <g key={`${source.id}:${svg.id}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={hubX}
                        y2={hubY}
                        stroke={stroke}
                        strokeWidth="3.25"
                        strokeLinecap="round"
                        strokeDasharray="0 9"
                      />
                      <line
                        x1={hubX}
                        y1={hubY}
                        x2={x2}
                        y2={y2}
                        stroke={stroke}
                        strokeWidth="3.25"
                        strokeLinecap="round"
                        strokeDasharray="0 9"
                      />
                    </g>
                  );
                })}
              </svg>
            )}
            {visibleNodes.map((node) => (
              <CanvasCard
                key={node.id}
                node={node}
                product={product}
                selected={selectedTarget}
                paired={Boolean(
                  focusedPair && (focusedPair.source.id === node.id || focusedPair.svg.id === node.id),
                )}
                commented={commented}
                onSelectTarget={onSelectTarget}
                onSetSpec={readOnly ? undefined : (id) => setSpecArtboard(product.id, id)}
                onDragStart={(e) => {
                  if (readOnly || space.current) return;
                  e.stopPropagation();
                  drag.current = { id: node.id, ox: e.clientX, oy: e.clientY, nx: node.x, ny: node.y };
                  setDraggingId(node.id);
                  setOverTrash(false);
                  const move = (ev: MouseEvent) => {
                    if (!drag.current) return;
                    setOverTrash(hitsTrash(ev.clientX, ev.clientY));
                    moveNode(
                      product.id,
                      node.id,
                      drag.current.nx + (ev.clientX - drag.current.ox) / zoom,
                      drag.current.ny + (ev.clientY - drag.current.oy) / zoom,
                    );
                  };
                  const up = (ev: MouseEvent) => {
                    if (hitsTrash(ev.clientX, ev.clientY)) {
                      deleteNode(product.id, node.id);
                      onSelectTarget(null);
                    }
                    drag.current = null;
                    setDraggingId(null);
                    setOverTrash(false);
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                  };
                  window.addEventListener("mousemove", move);
                  window.addEventListener("mouseup", up);
                }}
              />
            ))}

            {!readOnly &&
              plusByFlat.map((plus) => (
              <button
                key={plus.id}
                aria-label="시각 결과물 추가"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpenId((id) => (id === plus.id ? null : plus.id));
                }}
                className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-fog bg-snow text-stone shadow-sm hover:border-ink hover:text-ink"
                style={{ left: plus.left, top: plus.top }}
              >
                <Plus size={16} />
              </button>
            ))}

            {plusByFlat.map((plus) =>
              addOpenId === plus.id ? (
                <div
                  key={`${plus.id}-menu`}
                  className="absolute z-30 w-52 overflow-hidden rounded-2xl border border-mist bg-snow p-1.5 shadow-[0_12px_40px_rgba(26,25,22,0.1)]"
                  style={{
                    left: plus.left + PLUS_SIZE + 8,
                    top: plus.top - 8,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="px-2.5 py-1.5 text-[10px] tracking-[0.14em] text-stone uppercase">Add</p>
                  {ADD_ITEMS.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => {
                        addNode(product.id, item.type, { linkedTo: plus.id });
                        setAddOpenId(null);
                      }}
                      className="flex w-full flex-col rounded-xl px-2.5 py-2 text-left hover:bg-paper"
                    >
                      <span className="text-[13px] font-medium">{item.label}</span>
                      <span className="text-[11px] text-stone">{item.hint}</span>
                    </button>
                  ))}
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {selectedTarget && (
        <div
          className="pointer-events-none absolute top-16 z-20 flex justify-center"
          style={{ left: chrome.left, right: chrome.right }}
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-mist bg-snow/95 px-3 py-1.5 text-[12px] shadow-sm">
            <span className="text-stone">Selected</span>
            <span className="font-medium">{selectedTarget.label}</span>
            <span className="text-mist">·</span>
            <span className="text-stone">Stroke 1.5 · Fill none</span>
          </div>
        </div>
      )}

      {draggingId && (
        <div
          className="pointer-events-none absolute bottom-20 z-30 flex justify-center"
          style={{ left: chrome.left, right: chrome.right }}
        >
          <div
            ref={trashRef}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition",
              overTrash
                ? "scale-110 border-danger bg-danger text-snow"
                : "border-dashed border-fog bg-snow text-stone",
            )}
          >
            <Trash2 size={18} strokeWidth={1.7} />
          </div>
        </div>
      )}

      <div
        className="pointer-events-none absolute bottom-4 z-20 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center"
        style={{ left: chrome.left, right: chrome.right }}
      >
        <div />
        <aside className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-mist bg-snow/95 p-1.5 shadow-[0_8px_30px_rgba(26,25,22,0.06)]">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                title={t.label}
                onClick={() => setTool(t.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  tool === t.id ? "bg-ink text-snow" : "text-stone hover:bg-paper hover:text-ink",
                )}
              >
                <Icon size={15} strokeWidth={1.7} />
              </button>
            );
          })}
          <div className="mx-1 h-5 w-px bg-mist" />
          {MORE.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} title={t.label} className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink">
                <Icon size={15} strokeWidth={1.7} />
              </button>
            );
          })}
        </aside>
        <div className="pointer-events-auto flex justify-end">
          <div className="flex items-center gap-1 rounded-full border border-mist bg-snow/95 px-1.5 py-1 shadow-sm">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-paper">
              <Minus size={12} />
            </button>
            <span className="w-10 text-center text-[11px] tabular-nums">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-paper">
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasCard({
  node,
  product,
  selected,
  paired,
  commented,
  onSelectTarget,
  onSetSpec,
  onDragStart,
}: {
  node: CanvasNode;
  product: Product;
  selected: { id: string; label: string } | null;
  paired?: boolean;
  commented: string[];
  onSelectTarget: (t: { id: string; label: string } | null) => void;
  onSetSpec?: (nodeId: string) => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  const nodeSelected = selected?.id === node.id;
  const generated = Boolean(node.generate);
  const svgBoard = node.generate?.kind === "svg";
  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      onMouseDown={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelectTarget({ id: node.id, label: node.title });
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="min-w-0 truncate text-[11px] tracking-wide text-stone">
          {node.title}
          {node.generate?.revised ? <span className="ml-1 text-[9px] font-medium text-select">수정됨</span> : null}
        </p>
        <span className="flex shrink-0 items-center gap-0.5">
          {svgBoard ? (
            <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-snow">SVG</span>
          ) : node.type === "flat" ? (
            <SpecAssignChip
              isSpec={node.boardKind === "specs"}
              onAssign={onSetSpec ? () => onSetSpec(node.id) : undefined}
            />
          ) : (
            <span className="rounded-full bg-mist px-2 py-0.5 text-[9px] tracking-wider text-stone uppercase">
              {node.type === "mockup2d" ? "2D" : "3D"}
            </span>
          )}
        </span>
      </div>
      <div
        className={cn(
          "relative overflow-hidden p-4 shadow-[0_8px_30px_rgba(26,25,22,0.04)]",
          nodeSelected && "ring-2 ring-[#0d99ff]",
          paired && !nodeSelected && "ring-1 ring-[#0d99ff]/45",
        )}
        style={{
          background: node.fill ?? (svgBoard ? "#fbfaf7" : "rgba(255,254,251,0.8)"),
          border: `${node.strokeWidth ?? 1}px solid ${node.stroke ?? "#e7e4dd"}`,
          width: node.w,
          height: node.h,
        }}
      >
        {svgBoard && (
          <span className="absolute top-2 right-2 z-[1] h-[18px] rounded px-1.5 text-[9px] font-semibold tracking-wider leading-[18px] text-snow bg-ink">
            SVG
          </span>
        )}
        {node.imageSrc ? (
          svgBoard ? (
            <svg viewBox="0 0 374 400" className="h-full w-full" aria-hidden>
              <image href={node.imageSrc} width="374" height="400" preserveAspectRatio="xMidYMid meet" />
            </svg>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.imageSrc} alt="" className="h-full w-full object-contain" />
          )
        ) : generated ? (
          <div className="flex h-full w-full items-center justify-center">
            <MiniFlat category={product.category} className="h-[86%] w-[70%]" />
          </div>
        ) : node.type === "flat" ? (
          <SelectableFlat
            category={product.category}
            selected={selected?.id ?? null}
            commented={commented}
            hiddenParts={node.hiddenParts}
            onSelect={(id, label) => onSelectTarget({ id, label })}
          />
        ) : null}
        {node.type === "mockup2d" && <Mockup2D category={product.category} />}
        {node.type === "mockup3d" && <Mockup3D />}
      </div>
    </div>
  );
}
