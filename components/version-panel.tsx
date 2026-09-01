"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { userById } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import type { Product, Version } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VersionPanel({
  product,
  viewingVersionId,
  onViewVersion,
}: {
  product: Product;
  viewingVersionId: string | null;
  onViewVersion: (id: string | null) => void;
}) {
  const { versions, renameVersion, restoreVersion, duplicateVersion } = useWorkspace();
  const [naming, setNaming] = useState<Version | null>(null);
  const productVersions = versions
    .filter((v) => v.productId === product.id)
    .slice()
    .sort((a, b) => b.number - a.number);

  return (
    <>
      <div className="space-y-2">
        {productVersions.length === 0 && (
          <p className="px-2 py-8 text-center text-[13px] text-stone">아직 버전이 없습니다</p>
        )}
        {productVersions.map((v, i) => (
          <article
            key={v.id}
            className={cn(
              "rounded-2xl border p-3 transition",
              viewingVersionId === v.id ? "border-ink bg-paper" : "border-mist hover:border-fog",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <button type="button" onClick={() => onViewVersion(v.id)} className="min-w-0 flex-1 text-left">
                <p className="text-[13px] font-medium tracking-tight">
                  V{v.number} · {v.title}
                </p>
                <p className="mt-0.5 text-[11px] text-stone">
                  {userById(v.authorId)?.name} · {v.createdAt}
                </p>
              </button>
              <VersionMenu
                version={v}
                onName={() => setNaming(v)}
                onRestore={() => {
                  restoreVersion(product.id, v.id);
                  onViewVersion(null);
                }}
                onDuplicate={() => duplicateVersion(product.id, v.id)}
              />
            </div>
            <button type="button" onClick={() => onViewVersion(v.id)} className="w-full text-left">
              {v.changes.map((ch) => (
                <p key={ch.field} className="mt-2 text-[12px]">
                  <span className="text-stone">{ch.field}</span>
                  <br />
                  <span className="text-stone line-through">{ch.from}</span>
                  <span className="mx-1">→</span>
                  {ch.to}
                </p>
              ))}
              {i === 0 && productVersions[1] && (
                <p className="mt-2 text-[10px] tracking-wide text-stone uppercase">
                  최신 · V{productVersions[1].number} → V{v.number} 비교
                </p>
              )}
            </button>
          </article>
        ))}
      </div>
      {naming && (
        <RenameVersionModal
          version={naming}
          onClose={() => setNaming(null)}
          onSave={(title) => {
            renameVersion(naming.id, title);
            setNaming(null);
          }}
        />
      )}
    </>
  );
}

function VersionMenu({
  version,
  onName,
  onRestore,
  onDuplicate,
}: {
  version: Version;
  onName: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      const width = 188;
      const height = 132;
      let left = r.right - width;
      left = Math.min(Math.max(12, left), window.innerWidth - width - 12);
      let top = r.bottom + 6;
      if (top + height > window.innerHeight - 8) top = r.top - height - 6;
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
      <div ref={root} className="relative shrink-0">
        <button
          type="button"
          aria-label={`${version.title} 메뉴`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-snow hover:text-ink"
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
            className="fixed z-[80] w-[188px] rounded-2xl border border-mist bg-snow p-1 shadow-float"
            style={{ top: coords.top, left: coords.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuRow label="이 버전 이름 지정" onClick={() => pick(onName)} />
            <MenuRow label="이 버전으로 복원" onClick={() => pick(onRestore)} />
            <MenuRow label="복제하기" onClick={() => pick(onDuplicate)} />
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] text-ink hover:bg-paper"
    >
      {label}
    </button>
  );
}

function RenameVersionModal({
  version,
  onClose,
  onSave,
}: {
  version: Version;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(version.title);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="w-[320px] rounded-3xl bg-snow p-5 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(title);
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-[16px] font-semibold tracking-tight">이 버전 이름 지정</p>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-4 h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
            취소
          </button>
          <button className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">저장</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
