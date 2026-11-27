"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import OrderArtwork from "./OrderArtwork";
import { sheets } from "./case";

export default function SheetViewer({ dialogRef, page, setPage, request }: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  page: number; request: string;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  return (
    <dialog
        className="studio-zoom"
        ref={dialogRef}
        aria-labelledby="studio-zoom-title"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPage((i) => (i + sheets.length - 1) % sheets.length);
          if (e.key === "ArrowRight") setPage((i) => (i + 1) % sheets.length);
        }}
      >
        <header>
          <h2 id="studio-zoom-title">{sheets[page].title} · 원본</h2>
          <button aria-label="원본 닫기" onClick={() => dialogRef.current?.close()}>
            <X />
          </button>
        </header>
        <div className="studio-zoom-paper">
          <OrderArtwork request={request} page={page} />
        </div>
        <footer>
          <button aria-label="이전 문서" onClick={() => setPage((page + sheets.length - 1) % sheets.length)}>
            <ChevronLeft />
          </button>
          <span>{page + 1} / {sheets.length}</span>
          <button aria-label="다음 문서" onClick={() => setPage((page + 1) % sheets.length)}>
            <ChevronRight />
          </button>
        </footer>
      </dialog>
  );
}
