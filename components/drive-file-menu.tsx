"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { collections } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DriveFileMenu({
  itemId,
  itemName,
  source,
  favorite,
}: {
  itemId: string;
  itemName: string;
  source: "product" | "asset";
  favorite?: boolean;
}) {
  const { currentWorkspace, duplicateProduct, duplicateAsset, deleteProduct, deleteAsset, toggleItemFavorite, moveItemToFolder } =
    useWorkspace();
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const folders = [
    ...(currentWorkspace.folders ?? []),
    ...collections.map((c) => ({ id: `folder-${c.id}`, name: c.name })),
  ];

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      const width = 160;
      const height = 168;
      let left = r.right - width;
      left = Math.min(Math.max(12, left), window.innerWidth - width - 12);
      let top = r.bottom + 6;
      if (top + height > window.innerHeight - 8) top = r.top - height - 6;
      top = Math.min(Math.max(8, top), Math.max(8, window.innerHeight - height - 8));
      setCoords({ top, left });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const pick = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <div ref={root} className="relative">
        <button
          type="button"
          aria-label={`${itemName} 메뉴`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>
      </div>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[80] w-[160px] rounded-2xl border border-mist bg-snow p-1 shadow-float"
            style={{ top: coords.top, left: coords.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuRow
              label="파일 이동"
              onClick={() =>
                pick(() => {
                  setMoving(true);
                })
              }
            />
            <MenuRow
              label="복제하기"
              onClick={() =>
                pick(() => {
                  if (source === "product") duplicateProduct(itemId);
                  else duplicateAsset(itemId);
                })
              }
            />
            <MenuRow
              label={favorite ? "즐겨찾기 해제" : "즐겨 찾기"}
              onClick={() => pick(() => toggleItemFavorite(source, itemId))}
            />
            <MenuRow
              label="삭제하기"
              danger
              onClick={() =>
                pick(() => {
                  if (source === "product") deleteProduct(itemId);
                  else deleteAsset(itemId);
                })
              }
            />
          </div>,
          document.body,
        )}
      {moving &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
            onClick={() => setMoving(false)}
          >
            <div
              className="w-[320px] rounded-3xl bg-snow p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[16px] font-semibold tracking-tight">파일 이동</p>
              <p className="mt-1 text-[12px] text-stone">{itemName}을(를) 옮길 폴더를 고르세요.</p>
              <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto">
                {folders.length === 0 && (
                  <li className="px-2 py-6 text-center text-[13px] text-stone">옮길 폴더가 없습니다</li>
                )}
                {folders.map((folder) => (
                  <li key={folder.id}>
                    <button
                      type="button"
                      onClick={() => {
                        moveItemToFolder(source, itemId, folder.id);
                        setMoving(false);
                      }}
                      className="flex h-10 w-full items-center rounded-xl px-3 text-left text-[13px] hover:bg-paper"
                    >
                      {folder.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setMoving(false)}
                className="mt-3 h-10 w-full rounded-2xl border border-mist text-[13px] text-ink hover:bg-paper"
              >
                취소
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuRow({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] hover:bg-paper",
        danger ? "text-danger" : "text-ink",
      )}
    >
      {label}
    </button>
  );
}
