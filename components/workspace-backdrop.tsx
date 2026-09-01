"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ImageMinus, Palette, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import type { Workspace, WorkspaceSticker } from "@/lib/types";
import { cn } from "@/lib/utils";

export const WORKSPACE_BG_COLORS = [
  "#f3d9e2",
  "#f6dfd0",
  "#f3ebc7",
  "#d3ede3",
  "#d7e6f5",
  "#e4dcf3",
  "#e7e4dd",
];

const DEFAULT_W = 152;
const MIN_W = 72;
const MAX_W = 360;

export function WorkspaceBackdrop({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  const { updateWorkspace } = useWorkspace();
  const stickers = stickersOf(workspace);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (workspace.stickers?.length) return;
    if (!workspace.coverImage) return;
    updateWorkspace(workspace.id, {
      stickers: [
        {
          id: `sticker-legacy-${workspace.id}`,
          src: workspace.coverImage,
          x: workspace.coverImageX ?? 52,
          y: workspace.coverImageY ?? 14,
          w: DEFAULT_W,
          rotate: -2.5,
        },
      ],
    });
  }, [
    workspace.id,
    workspace.coverImage,
    workspace.coverImageX,
    workspace.coverImageY,
    workspace.stickers,
    updateWorkspace,
  ]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("[data-sticker]") || el?.closest("[data-sticker-toolbar]")) return;
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [selectedId]);

  return (
    <div className="relative min-h-full bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: workspace.color, opacity: 0.24 }}
      />
      <div className="canvas-dot relative min-h-full fade-up">{children}</div>
      {stickers.map((sticker) => (
        <FloatingSticker
          key={sticker.id}
          workspaceId={workspace.id}
          sticker={sticker}
          selected={selectedId === sticker.id}
          onSelect={() => setSelectedId(sticker.id)}
        />
      ))}
    </div>
  );
}

function stickersOf(workspace: Workspace): WorkspaceSticker[] {
  if (workspace.stickers?.length) return workspace.stickers;
  if (!workspace.coverImage) return [];
  return [
    {
      id: `sticker-legacy-${workspace.id}`,
      src: workspace.coverImage,
      x: workspace.coverImageX ?? 52,
      y: workspace.coverImageY ?? 14,
      w: DEFAULT_W,
      rotate: -2.5,
    },
  ];
}

function FloatingSticker({
  workspaceId,
  sticker,
  selected,
  onSelect,
}: {
  workspaceId: string;
  sticker: WorkspaceSticker;
  selected: boolean;
  onSelect: () => void;
}) {
  const { patchWorkspaceSticker, removeWorkspaceSticker } = useWorkspace();
  const rootRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(sticker);
  const liveRef = useRef(sticker);
  const mode = useRef<"move" | "resize" | "rotate" | null>(null);
  const start = useRef({
    w: 0,
    rotate: 0,
    grabX: 0,
    grabY: 0,
    pointerX: 0,
    angle: 0,
    cx: 0,
    cy: 0,
    parent: { left: 0, top: 0, width: 1, height: 1 },
  });

  useEffect(() => {
    if (mode.current) return;
    setLive(sticker);
    liveRef.current = sticker;
  }, [sticker]);

  const applyMove = (clientX: number, clientY: number) => {
    const current = mode.current;
    if (!current) return;
    const p = start.current.parent;

    if (current === "move") {
      const w = liveRef.current.w;
      let left = clientX - p.left - start.current.grabX;
      let top = clientY - p.top - start.current.grabY;
      left = Math.max(-w * 0.4, Math.min(p.width - w * 0.6, left));
      top = Math.max(-40, Math.min(p.height - 40, top));
      const next = {
        ...liveRef.current,
        x: (left / p.width) * 100,
        y: (top / p.height) * 100,
      };
      liveRef.current = next;
      setLive(next);
      return;
    }

    if (current === "resize") {
      const dx = clientX - start.current.pointerX;
      const next = {
        ...liveRef.current,
        w: Math.round(Math.min(MAX_W, Math.max(MIN_W, start.current.w + dx))),
      };
      liveRef.current = next;
      setLive(next);
      return;
    }

    const ang = Math.atan2(clientY - start.current.cy, clientX - start.current.cx);
    const deg = start.current.rotate + ((ang - start.current.angle) * 180) / Math.PI;
    const next = { ...liveRef.current, rotate: Math.round(deg) };
    liveRef.current = next;
    setLive(next);
  };

  const stopDrag = () => {
    if (!mode.current) return;
    mode.current = null;
    window.removeEventListener("pointermove", onWinMove);
    window.removeEventListener("pointerup", onWinUp);
    window.removeEventListener("pointercancel", onWinUp);
    patchWorkspaceSticker(workspaceId, sticker.id, {
      x: liveRef.current.x,
      y: liveRef.current.y,
      w: liveRef.current.w,
      rotate: liveRef.current.rotate,
    });
  };

  const onWinMove = (e: PointerEvent) => {
    e.preventDefault();
    applyMove(e.clientX, e.clientY);
  };

  const onWinUp = () => stopDrag();

  const begin = (e: ReactPointerEvent<HTMLDivElement>, nextMode: "move" | "resize" | "rotate") => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const parent = (rootRef.current?.offsetParent ?? rootRef.current?.parentElement) as HTMLElement | null;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const img = (rootRef.current?.querySelector("[data-sticker-img]") ?? e.currentTarget).getBoundingClientRect();
    start.current = {
      w: liveRef.current.w,
      rotate: liveRef.current.rotate,
      grabX: e.clientX - img.left,
      grabY: e.clientY - img.top,
      pointerX: e.clientX,
      angle: Math.atan2(e.clientY - (img.top + img.height / 2), e.clientX - (img.left + img.width / 2)),
      cx: img.left + img.width / 2,
      cy: img.top + img.height / 2,
      parent: { left: parentRect.left, top: parentRect.top, width: parentRect.width, height: parentRect.height },
    };
    mode.current = nextMode;
    window.addEventListener("pointermove", onWinMove);
    window.addEventListener("pointerup", onWinUp);
    window.addEventListener("pointercancel", onWinUp);
  };

  const nudgeRotate = (delta: number) => {
    const next = { ...liveRef.current, rotate: liveRef.current.rotate + delta };
    liveRef.current = next;
    setLive(next);
    patchWorkspaceSticker(workspaceId, sticker.id, { rotate: next.rotate });
  };

  return (
    <div
      ref={rootRef}
      data-sticker={sticker.id}
      className="absolute z-[15] touch-none"
      style={{ left: `${live.x}%`, top: `${live.y}%` }}
      onPointerDown={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("[data-handle='rotate']")) begin(e, "rotate");
        else if (t.closest("[data-handle='resize']")) begin(e, "resize");
        else if (t.closest("[data-sticker-img]")) begin(e, "move");
      }}
    >
      <div
        className={cn("relative", selected && "z-10")}
        style={{ width: live.w }}
      >
        <img
          data-sticker-img
          src={sticker.src}
          alt=""
          draggable={false}
          className={cn(
            "block cursor-grab rounded-xl bg-snow p-1 shadow-[0_12px_32px_rgba(26,25,22,0.14)] ring-1 ring-black/5 active:cursor-grabbing",
            selected && "ring-2 ring-ink",
          )}
          style={{
            width: live.w,
            height: "auto",
            maxHeight: "36vh",
            objectFit: "contain",
            transform: `rotate(${live.rotate}deg)`,
          }}
        />
        {selected && (
          <>
            <span
              data-handle="rotate"
              data-sticker-toolbar
              aria-label="회전"
              className="absolute -top-8 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-ink text-snow shadow-sm"
            >
              <RotateCw size={11} strokeWidth={2.2} />
            </span>
            <span
              data-handle="resize"
              data-sticker-toolbar
              aria-label="크기 조절"
              className="absolute -right-2 -bottom-2 z-10 h-4 w-4 cursor-nwse-resize rounded-sm border-2 border-snow bg-ink shadow-sm"
            />
          </>
        )}
      </div>
      {selected && (
        <div
          data-sticker-toolbar
          className="absolute top-full left-1/2 z-20 mt-2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-snow p-1 shadow-float"
        >
          <button
            type="button"
            aria-label="왼쪽으로 회전"
            onClick={() => nudgeRotate(-15)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
          >
            <RotateCcw size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="오른쪽으로 회전"
            onClick={() => nudgeRotate(15)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
          >
            <RotateCw size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={() => removeWorkspaceSticker(workspaceId, sticker.id)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-red-600"
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkspaceBackgroundModal({
  workspace,
  onClose,
}: {
  workspace: Workspace;
  onClose: () => void;
}) {
  const { updateWorkspace, addWorkspaceStickers, removeWorkspaceSticker } = useWorkspace();
  const picking = useRef(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasFilePickerApi, setHasFilePickerApi] = useState(false);
  const stickers = stickersOf(workspace);

  useEffect(() => {
    setReady(true);
    setHasFilePickerApi(typeof showOpenFilePickerFn() === "function");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (picking.current) return;
      onClose();
    };
    const onFocus = () => {
      window.setTimeout(() => {
        picking.current = false;
      }, 800);
    };
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (!files.length) return;
      e.preventDefault();
      void ingestFiles(files);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("focus", onFocus);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("paste", onPaste);
    };
  }, [onClose]);

  const ingestFiles = async (files: File[]) => {
    picking.current = false;
    if (!files.length) return;
    setBusy(true);
    try {
      const made: WorkspaceSticker[] = [];
      let i = 0;
      for (const file of files) {
        if (!shouldTryImage(file)) continue;
        try {
          const src = await fileToStickerSrc(file);
          const n = stickers.length + i;
          made.push({
            id: `sticker-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            src,
            x: 46 + (n % 5) * 5,
            y: 10 + (n % 4) * 6,
            w: DEFAULT_W,
            rotate: ((n % 5) - 2) * 3,
          });
          i += 1;
        } catch {
          /* skip unreadable files */
        }
      }
      if (!made.length) return;
      addWorkspaceStickers(workspace.id, made);
    } finally {
      setBusy(false);
    }
  };

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void ingestFiles(files);
  };

  const onPickClick = async () => {
    picking.current = true;
    const picked = await pickImagesWithFilePicker();
    if (picked === null) {
      setHasFilePickerApi(false);
      picking.current = false;
      return;
    }
    await ingestFiles(picked);
  };

  if (!ready) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(e) => {
        if (picking.current) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[300px] rounded-3xl bg-snow p-5 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <p className="text-[16px] font-semibold tracking-tight">배경 꾸미기</p>
        <p className="mt-1 text-[12px] text-stone">색을 고르고, 이미지는 여러 장 올려 크기와 각도를 조절할 수 있습니다.</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {WORKSPACE_BG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`배경 ${color}`}
              onClick={() => updateWorkspace(workspace.id, { color })}
              className={cn(
                "h-9 rounded-xl",
                workspace.color === color && "ring-2 ring-ink ring-offset-2 ring-offset-snow",
              )}
              style={{ background: color }}
            />
          ))}
        </div>
        <div
          className="mt-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const list = e.dataTransfer.files;
            if (!list?.length) return;
            void ingestFiles(Array.from(list));
          }}
        >
          {hasFilePickerApi ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onPickClick()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-fog text-[13px] text-stone hover:border-stone hover:text-ink disabled:opacity-60"
            >
              <Palette size={16} strokeWidth={1.7} />
              {busy ? "올리는 중…" : "이미지 업로드"}
            </button>
          ) : (
            <div className="group relative">
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.bmp,.heic,.heif,.avif"
                multiple
                data-workspace-sticker-upload
                disabled={busy}
                onClick={() => {
                  picking.current = true;
                }}
                onChange={onFiles}
                className="workspace-bg-file-input"
                aria-label={busy ? "올리는 중" : "이미지 업로드"}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-[13px] text-stone group-hover:text-ink">
                <Palette size={16} strokeWidth={1.7} />
                {busy ? "올리는 중…" : "이미지 업로드"}
              </div>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-stone">여러 장을 고르거나, 파일을 여기로 끌어다 놓으세요</p>
        {stickers.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {stickers.map((st) => (
              <div key={st.id} className="relative">
                <img src={st.src} alt="" className="h-16 w-full rounded-xl bg-paper object-contain" />
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={() => removeWorkspaceSticker(workspace.id, st.id)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-snow/90 text-stone shadow-sm hover:text-ink"
                >
                  <ImageMinus size={11} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
        {stickers.length > 0 && (
          <button
            type="button"
            onClick={() => updateWorkspace(workspace.id, { stickers: [], coverImage: null })}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13px] text-stone hover:text-ink"
          >
            <ImageMinus size={15} strokeWidth={1.7} />
            이미지 모두 빼기
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 h-11 w-full rounded-2xl border border-mist text-[13px] text-ink hover:bg-paper"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body,
  );
}

type FilePickerHandle = { getFile: () => Promise<File> };

function showOpenFilePickerFn():
  | ((options: {
      multiple?: boolean;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<FilePickerHandle[]>)
  | undefined {
  const picker = (window as Window & { showOpenFilePicker?: unknown }).showOpenFilePicker;
  return typeof picker === "function"
    ? (picker as (options: {
        multiple?: boolean;
        types?: { description: string; accept: Record<string, string[]> }[];
      }) => Promise<FilePickerHandle[]>)
    : undefined;
}

async function pickImagesWithFilePicker(): Promise<File[] | null> {
  const picker = showOpenFilePickerFn();
  if (!picker) return null;
  try {
    const handles = await picker({
      multiple: true,
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif", ".heic", ".heif"],
          },
        },
      ],
    });
    return Promise.all(handles.map((handle) => handle.getFile()));
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    return null;
  }
}

function shouldTryImage(file: File) {
  if (!file.type || file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|heic|heif|avif|svg)$/i.test(file.name);
}

function fileToStickerSrc(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        reject(new Error("read failed"));
        return;
      }
      const preferPng =
        file.type === "image/png" ||
        file.type === "image/gif" ||
        file.type === "image/webp" ||
        /\.(png|gif|webp)$/i.test(file.name);
      resolve(await compressDataUrl(reader.result, preferPng));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function compressDataUrl(src: string, preferPng: boolean): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const out = preferPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.86);
        resolve(out || src);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
