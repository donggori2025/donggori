"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy, FilePlus, LayoutTemplate, PenLine, Plus } from "lucide-react";
import { NewProductModal } from "@/components/new-product-modal";
import { MiniFlat } from "@/components/ui";
import { useWorkspace } from "@/lib/store";
import {
  TEMPLATE_GROUP_FILTERS,
  templateMatchesGroup,
  templatesMatchingQuery,
  type ServiceTemplate,
  type TemplateGroupFilterId,
} from "@/lib/templates";
import { cn, recencyRank } from "@/lib/utils";

const HINTS = [
  { label: "여름 아웃핏 추천", query: "여름 아웃핏" },
  { label: "여자 코트 추천", query: "여자 코트" },
  { label: "롱스커트 도식", query: "롱스커트" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { products, workspaces, teams, currentUserId, currentWorkspace, displayAccount, createProduct, duplicateProduct } =
    useWorkspace();
  const [creating, setCreating] = useState<"choose" | "blank" | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [group, setGroup] = useState<TemplateGroupFilterId>("all");
  const flatsRef = useRef<HTMLElement>(null);
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const firstName = displayAccount.name.replace(/님$/, "");

  const accessibleWorkspaceIds = useMemo(() => {
    const myTeams = new Set(teams.filter((t) => t.memberIds.includes(currentUserId)).map((t) => t.id));
    return new Set(
      workspaces.filter((w) => w.teamId === null || (w.teamId && myTeams.has(w.teamId))).map((w) => w.id),
    );
  }, [teams, workspaces, currentUserId]);

  const mine = useMemo(
    () =>
      products
        .filter((p) => accessibleWorkspaceIds.has(p.workspaceId))
        .sort((a, b) => recencyRank(a.updatedAt) - recencyRank(b.updatedAt)),
    [products, accessibleWorkspaceIds],
  );

  const latest = mine[0];

  const flats = useMemo(() => {
    const byQuery = templatesMatchingQuery(activeQuery);
    return byQuery.filter((t) => templateMatchesGroup(t.category, group));
  }, [activeQuery, group]);

  const runRecommend = (next?: string) => {
    const value = next ?? queryRef.current?.value ?? "";
    if (queryRef.current && next !== undefined) {
      queryRef.current.value = next;
    }
    setActiveQuery(value.trim());
    setGroup("all");
    requestAnimationFrame(() => flatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const useTemplate = (tpl: ServiceTemplate) => {
    const id = createProduct(tpl.name, { category: tpl.category, description: tpl.description });
    router.push(`/products/${id}`);
  };

  const copyProduct = (id: string) => {
    const nextId = duplicateProduct(id);
    setDuplicating(false);
    if (nextId) router.push(`/products/${nextId}`);
  };

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
      <div className="mx-auto max-w-7xl space-y-10 px-8 py-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Home</p>
            <h1 className="mt-1 text-[32px] font-semibold leading-none tracking-tight">안녕하세요, {firstName}님.</h1>
            <p className="mt-2 text-[14px] text-stone">키워드로 도식화를 찾거나 최근 작업을 이어가세요.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreating("choose")}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-snow"
          >
            <Plus size={14} />
            새 제품
          </button>
        </header>

        <section className="space-y-2">
          <form
            className="@container relative min-h-[72px] rounded-3xl border border-mist bg-snow px-4 pt-3.5 pb-3.5 focus-within:border-fog"
            onSubmit={(e) => {
              e.preventDefault();
              runRecommend();
            }}
          >
            <label className="block min-w-0">
              <span className="sr-only">키워드</span>
              <textarea
                ref={queryRef}
                rows={2}
                placeholder="키워드를 입력하세요 (예: 여자 코트 추천)"
                className="min-h-[40px] w-full resize-none bg-transparent pb-9 text-[14px] leading-relaxed outline-none placeholder:text-stone"
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.shiftKey) return;
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  e.preventDefault();
                  runRecommend();
                }}
              />
            </label>
            <button
              type="submit"
              aria-label="추천 실행"
              className="absolute right-3 bottom-3 inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-ink text-snow @[280px]:w-auto @[280px]:px-3"
            >
              <span className="hidden text-[12px] @[280px]:inline">추천 실행</span>
              <ArrowRight size={13} />
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {HINTS.map((hint) => {
              const on = activeQuery === hint.query;
              return (
                <button
                  key={hint.query}
                  type="button"
                  onClick={() => runRecommend(hint.query)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] tracking-tight",
                    on ? "border-ink bg-ink text-snow" : "border-mist bg-snow text-ink hover:border-fog",
                  )}
                >
                  {hint.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StartCard
            icon={<PenLine size={16} strokeWidth={1.7} />}
            title="최근 작업 이어서"
            body={latest ? latest.name : "이어갈 제품이 없습니다."}
            disabled={!latest}
            onClick={() => latest && router.push(`/products/${latest.id}`)}
          />
          <StartCard
            icon={<LayoutTemplate size={16} strokeWidth={1.7} />}
            title="무료 도식화 선택"
            body="상의·하의·원피스·아우터에서 고릅니다."
            onClick={() => {
              setGroup("all");
              flatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <StartCard
            icon={<Copy size={16} strokeWidth={1.7} />}
            title="이전 문서 복제"
            body="완성된 문서를 새 버전의 시작점으로 씁니다."
            disabled={mine.length === 0}
            onClick={() => setDuplicating(true)}
          />
          <StartCard
            icon={<FilePlus size={16} strokeWidth={1.7} />}
            title="빈 문서 만들기"
            body="저장 위치와 기본 정보를 먼저 정합니다."
            onClick={() => setCreating("blank")}
          />
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[16px] font-semibold tracking-tight">최근 작업지시서</h2>
            <Link href={`/workspaces/${currentWorkspace.id}`} className="text-[13px] text-stone hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-mist overflow-hidden rounded-2xl border border-mist bg-snow">
            {mine.slice(0, 5).map((p) => {
              return (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
                      <MiniFlat category={p.category} className="h-8 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{p.name}</p>
                      <p className="truncate text-[11px] text-stone">
                        {p.code} · {p.updatedAt} 수정
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-stone" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section ref={flatsRef}>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[16px] font-semibold tracking-tight">무료 도식화</h2>
            <Link href="/templates" className="text-[13px] text-stone hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TEMPLATE_GROUP_FILTERS.map((chip) => {
              const on = group === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setGroup(chip.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight",
                    on ? "bg-ink text-snow" : "bg-snow text-ink",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          {flats.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-fog bg-snow px-4 py-10 text-center text-[13px] text-stone">
              {activeQuery.trim()
                ? `"${activeQuery}"에 맞는 무료 도식화가 없습니다.`
                : "이 품목군의 무료 도식화가 없습니다."}
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {flats.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => useTemplate(tpl)}
                  className="group rounded-2xl border border-mist bg-snow p-3 text-left transition hover:border-fog"
                >
                  <div className="flex h-36 items-center justify-center rounded-2xl bg-paper">
                    {tpl.category && (
                      <MiniFlat category={tpl.category} className="h-24 w-20 transition group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-medium">{tpl.name}</p>
                    <ArrowRight size={14} className="shrink-0 text-stone" />
                  </div>
                  <p className="truncate text-[11px] text-stone">{tpl.meta}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {creating && <NewProductModal start={creating} onClose={() => setCreating(null)} />}

      {duplicating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setDuplicating(false)}>
          <div className="w-[420px] rounded-3xl bg-snow p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-[18px] font-semibold tracking-tight">이전 문서 복제</p>
            <p className="mt-1 text-[13px] text-stone">복제할 작업지시서를 고르세요.</p>
            <ul className="mt-4 max-h-80 space-y-1 overflow-auto">
              {mine.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => copyProduct(p.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-mist px-3 py-2.5 text-left hover:bg-paper"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
                      <MiniFlat category={p.category} className="h-8 w-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{p.name}</span>
                      <span className="block truncate text-[11px] text-stone">
                        {p.code} · {p.updatedAt}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setDuplicating(false)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StartCard({
  icon,
  title,
  body,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-start gap-3 rounded-2xl border border-mist bg-snow p-4 text-left transition hover:border-fog disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-ink">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] leading-relaxed text-stone">{body}</span>
      </span>
      <ArrowRight size={16} className="mt-1 shrink-0 text-stone" />
    </button>
  );
}
