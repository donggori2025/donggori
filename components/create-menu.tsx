"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloudUpload, FileText, FolderPlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateMenu({
  onFolder,
  onTechPack,
  onUpload,
  onGoogleDrive,
}: {
  onFolder: () => void;
  onTechPack: () => void;
  onUpload: (files: FileList) => void;
  onGoogleDrive: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      setCoords({ top: r.bottom + 6, right: window.innerWidth - r.right });
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
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-snow"
      >
        <Plus size={14} />
        생성하기
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[80] w-[220px] rounded-2xl border border-mist bg-snow p-1.5 shadow-float"
            style={{ top: coords.top, right: coords.right }}
          >
            <MenuRow
              icon={<FolderPlus size={16} strokeWidth={1.7} />}
              label="폴더"
              onClick={() => pick(onFolder)}
            />
            <MenuRow
              icon={<FileText size={16} strokeWidth={1.7} />}
              label="새 제품"
              onClick={() => pick(onTechPack)}
            />
            <MenuRow
              icon={<CloudUpload size={16} strokeWidth={1.7} />}
              label="업로드"
              onClick={() => {
                setOpen(false);
                fileRef.current?.click();
              }}
            />
            <MenuRow
              icon={<GoogleDriveMark />}
              label="Google Drive"
              onClick={() => pick(onGoogleDrive)}
            />
          </div>,
          document.body,
        )}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onUpload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-ink hover:bg-paper",
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-stone">
        {icon}
      </span>
      {label}
    </button>
  );
}

function GoogleDriveMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 87.3 78" aria-hidden>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53.4H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3L78.45 70.75 86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-1.35-.8-2.9-1.2-4.5-1.2 1.6 0 3.15.45 4.5 1.2L81.55 41.5H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}
