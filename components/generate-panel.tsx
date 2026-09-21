"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, X } from "lucide-react";
import {
  GENERATE_PLACEHOLDER,
  canExtractBoard,
  generateBoardLabel,
  generateMention,
  isGeneratedBoard,
  nextGenerateVersion,
  promptSnippet,
  promptsForBoard,
  siblingPoint,
} from "@/lib/generate-board";
import { useWorkspace } from "@/lib/store";
import type { CanvasNode, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MiniFlat } from "./ui";

type Attach = { name: string; src: string };

export function GeneratePanel({
  product,
  selectedTarget,
  selectRev,
  onSelectTarget,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  selectRev: number;
  onSelectTarget: (t: { id: string; label: string } | null) => void;
}) {
  const { addNode, addGeneratePrompt, updateNode } = useWorkspace();
  const [taggedId, setTaggedId] = useState<string | null>(null);
  const [attach, setAttach] = useState<Attach | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const skipTagRef = useRef<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(product.nodes);
  nodesRef.current = product.nodes;

  const boards = product.nodes.filter((node) => node.type === "flat" && isGeneratedBoard(node));
  const tagged = product.nodes.find((node) => node.id === taggedId && node.type === "flat");
  const convertOk = canExtractBoard(tagged, product.nodes);
  const history = promptsForBoard(product.generatePrompts, taggedId);

  useEffect(() => {
    const id = selectedTarget?.id;
    if (!id) return;
    if (skipTagRef.current === id) {
      skipTagRef.current = null;
      return;
    }
    const node = nodesRef.current.find((n) => n.id === id && n.type === "flat");
    if (!node || (node.boardKind === "specs" && !node.generate)) return;
    setTaggedId(id);
  }, [selectRev, selectedTarget?.id]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length, taggedId]);

  const pickBoard = (node: CanvasNode) => {
    skipTagRef.current = null;
    setTaggedId(node.id);
    onSelectTarget({ id: node.id, label: node.title });
    promptRef.current?.focus();
  };

  const clearTag = () => {
    setTaggedId(null);
    promptRef.current?.focus();
  };

  const send = () => {
    const typed = promptRef.current?.value.trim() ?? "";
    if (tagged) {
      const nextSrc = attach?.src ?? tagged.imageSrc;
      const nextGenerate = tagged.generate
        ? { ...tagged.generate, revised: true }
        : { kind: "image" as const, version: nextGenerateVersion(product.nodes), revised: true };
      const fallback = generateBoardLabel({ ...tagged, generate: nextGenerate });
      updateNode(product.id, tagged.id, {
        title: typed ? promptSnippet(typed, fallback) : fallback,
        imageSrc: nextSrc,
        generate: nextGenerate,
      });
      addGeneratePrompt(product.id, {
        text: typed || "이 보드를 다듬기",
        boardId: tagged.id,
        action: "edit",
      });
      setAttach(null);
      if (promptRef.current) promptRef.current.value = "";
      onSelectTarget({ id: tagged.id, label: typed ? promptSnippet(typed, fallback) : fallback });
      return;
    }

    const version = nextGenerateVersion(product.nodes);
    const fallback = `디자인 보드 · v${version}`;
    const title = promptSnippet(typed, fallback);
    const id = addNode(product.id, "flat", {
      boardKind: "general",
      title,
      imageSrc: attach?.src,
      generate: { kind: "image", version },
    });
    if (!id) return;
    addGeneratePrompt(product.id, { text: typed || fallback, boardId: id, action: "create" });
    skipTagRef.current = id;
    setTaggedId(null);
    setAttach(null);
    if (promptRef.current) promptRef.current.value = "";
    onSelectTarget({ id, label: title });
  };

  const convertSvg = () => {
    const source = tagged;
    if (!source || !canExtractBoard(source, product.nodes)) return;
    const point = siblingPoint(source);
    const title = "디자인 보드 · SVG";
    const id = addNode(product.id, "flat", {
      boardKind: "general",
      title,
      x: point.x,
      y: point.y,
      linkedTo: source.id,
      imageSrc: source.imageSrc,
      generate: {
        kind: "svg",
        version: source.generate?.version ?? nextGenerateVersion(product.nodes),
        sourceBoardId: source.id,
      },
    });
    if (!id) return;
    skipTagRef.current = null;
    onSelectTarget({ id, label: title });
  };

  const onAttach = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttach({ name: file.name, src: String(reader.result ?? "") });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-3 pb-2">
        <h2 className="mb-2.5 text-[13px] font-semibold tracking-tight text-ink">생성</h2>

        <section className="mb-2.5 flex max-h-[min(220px,38%)] min-h-0 flex-col" aria-label="프롬프트 히스토리">
          <div className="mb-1.5 text-[11px] font-semibold tracking-tight">
            히스토리 <span className="font-normal text-stone">{history.length}</span>
          </div>
          {history.length === 0 ? (
            <p className="px-1 py-1.5 text-[11px] leading-relaxed text-stone">
              {tagged
                ? "이 보드의 생성·수정 프롬프트가 아직 없습니다."
                : "보드를 고르면 이 보드의 생성·수정 프롬프트가 여기에 보입니다."}
            </p>
          ) : (
            <div ref={threadRef} className="flex min-h-0 flex-col gap-1 overflow-auto" role="list">
              {history.map((item) => {
                const board = product.nodes.find((n) => n.id === item.boardId);
                const mark = board?.generate?.kind === "svg" ? "svg" : board?.generate ? `v${board.generate.version}` : "";
                const act = item.action === "edit" ? `${mark} 수정` : `${mark} 생성`;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    onClick={() => {
                      if (!promptRef.current) return;
                      promptRef.current.value = item.text;
                      promptRef.current.focus();
                    }}
                    className="flex w-full flex-col gap-1 rounded-[14px] bg-paper px-2.5 py-2 text-left hover:bg-[#f1eee8]"
                  >
                    <span className="line-clamp-2 text-[11px] leading-snug tracking-tight">{item.text}</span>
                    <span className="flex items-baseline gap-1.5 text-[10px] text-stone">
                      <span className="font-semibold tracking-tight text-ink">{act || "생성"}</span>
                      {item.action === "edit" && board && (
                        <span className="font-semibold text-select">{generateMention(board)}</span>
                      )}
                      <span>{relTime(item.createdAt)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="mb-2 flex items-baseline justify-between text-[11px] font-semibold tracking-tight">
          <span>
            대지 보드 <span className="font-normal text-stone">{boards.length}</span>
          </span>
        </div>
        {boards.length === 0 ? (
          <p className="px-1 py-2.5 text-[11px] leading-relaxed text-stone">
            아직 없습니다. 보내면 여기에 목록이 쌓입니다. 본문은 대지입니다.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {boards.map((board) => {
              const on = selectedTarget?.id === board.id;
              const isTag = taggedId === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  aria-current={on ? "true" : "false"}
                  onClick={() => pickBoard(board)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[10px] px-1.5 py-1.5 text-left",
                    on ? "bg-select-soft shadow-[inset_0_0_0_1px_rgba(13,153,255,0.35)]" : "hover:bg-paper",
                  )}
                >
                  <span className="flex h-[34px] w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-mist bg-paper">
                    {board.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={board.imageSrc} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <MiniFlat category={product.category} className="h-7 w-6" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium tracking-tight">{generateBoardLabel(board)}</span>
                    <span className="block text-[10px] text-stone">
                      {board.generate?.kind === "svg" ? "라인 SVG" : "래스터"}
                      {board.generate?.revised ? " · 수정됨" : ""}
                    </span>
                  </span>
                  {isTag && (
                    <span className="ml-auto h-4 rounded-full bg-snow px-1.5 text-[9px] font-semibold leading-4 text-select shadow-[inset_0_0_0_1px_rgba(13,153,255,0.35)]">
                      {generateMention(board)}
                    </span>
                  )}
                  {board.generate?.kind === "svg" && !isTag && (
                    <span className="ml-auto h-4 rounded bg-ink px-1.5 text-[9px] font-semibold tracking-wide leading-4 text-snow">
                      SVG
                    </span>
                  )}
                  {board.generate?.kind === "svg" && isTag && (
                    <span className="h-4 rounded bg-ink px-1.5 text-[9px] font-semibold tracking-wide leading-4 text-snow">
                      SVG
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-mist bg-snow px-3 pt-2.5 pb-3">
        <div className="flex flex-col rounded-[16px] border border-mist bg-snow px-2.5 pt-2 pb-2 shadow-sm focus-within:border-fog focus-within:shadow-[0_0_0_3px_rgba(26,25,22,0.045)]">
          <div className="flex min-h-0 flex-col gap-1.5 px-0.5">
            {tagged && (
              <span className="inline-flex w-max max-w-full items-center gap-1.5 rounded-full border border-[rgba(13,153,255,0.28)] bg-select-soft py-0.5 pr-1 pl-0.5">
                <span className="h-[22px] w-[18px] shrink-0 overflow-hidden rounded-md border border-[rgba(13,153,255,0.22)] bg-snow">
                  {tagged.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tagged.imageSrc} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <MiniFlat category={product.category} className="h-full w-full p-0.5" />
                  )}
                </span>
                <span className="flex min-w-0 items-baseline gap-1.5 pr-0.5">
                  <span className="truncate text-[11px] font-semibold tracking-tight">{generateBoardLabel(tagged)}</span>
                  <span className="text-[10px] font-semibold text-select">{generateMention(tagged)}</span>
                </span>
                <button
                  type="button"
                  aria-label="태그 제거"
                  onClick={clearTag}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-stone hover:bg-snow hover:text-ink"
                >
                  <X size={10} strokeWidth={2.2} />
                </button>
              </span>
            )}
            <textarea
              ref={promptRef}
              rows={3}
              placeholder={GENERATE_PLACEHOLDER}
              className="min-h-[52px] w-full resize-none bg-transparent px-0.5 text-[13px] leading-relaxed outline-none placeholder:text-stone/70"
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.key === "Process") return;
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
            />
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-1.5 px-0.5">
            {attach ? (
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-mist bg-paper py-0.5 pr-1 pl-0.5">
                <span className="h-6 w-5 shrink-0 overflow-hidden rounded-md border border-mist bg-snow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attach.src} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="max-w-[108px] truncate text-[11px] font-medium tracking-tight">{attach.name}</span>
                <button
                  type="button"
                  aria-label="첨부 제거"
                  onClick={() => setAttach(null)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-stone hover:bg-mist hover:text-ink"
                >
                  <X size={10} strokeWidth={2.2} />
                </button>
              </span>
            ) : (
              <button
                type="button"
                title="참조 이미지"
                aria-label="참조 이미지"
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-mist bg-snow pl-1.5 pr-2.5 text-[11px] font-medium tracking-tight text-ink hover:bg-paper"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-fog text-stone">
                  <Plus size={9} strokeWidth={2.4} />
                </span>
                참조
              </button>
            )}
            <button
              type="button"
              aria-label="보내기"
              onClick={send}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-snow hover:opacity-90"
            >
              <ArrowUp size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {tagged && (
          <div className="pt-2.5">
            <button
              type="button"
              disabled={!convertOk}
              onClick={convertSvg}
              className="inline-flex h-[34px] w-full items-center justify-center rounded-full bg-ink text-[12px] font-medium text-snow hover:opacity-90 disabled:cursor-default disabled:opacity-30"
            >
              SVG로 변환하기
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onAttach(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function relTime(iso: string) {
  const elapsed = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (!Number.isFinite(elapsed) || elapsed < 45) return "방금";
  if (elapsed < 3600) return `${Math.round(elapsed / 60)}분 전`;
  return "오늘";
}
