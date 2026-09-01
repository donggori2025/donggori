"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { CompletenessBadge, CompletenessBar } from "@/components/completeness-bar";
import { NewProductModal } from "@/components/new-product-modal";
import { MiniFlat } from "@/components/ui";
import { collections, userById } from "@/lib/data";
import { productCompleteness } from "@/lib/product-readiness";
import { useWorkspace } from "@/lib/store";
import { recencyRank } from "@/lib/utils";

export default function DashboardPage() {
  const { products, workspaces, teams, currentUserId, displayAccount, getUser } = useWorkspace();
  const [creating, setCreating] = useState(false);
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

  const inProgress = mine.filter((p) => productCompleteness(p).percent < 100).slice(0, 6);
  const needsAttention = mine
    .map((p) => {
      const r = productCompleteness(p);
      const gaps = r.missing.filter((a) => a.id !== "files" && a.id !== "notes");
      return { product: p, gaps, percent: r.percent };
    })
    .filter((row) => row.gaps.length > 0 && row.percent >= 20)
    .slice(0, 4);

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
      <div className="mx-auto max-w-7xl space-y-10 px-8 py-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Home</p>
            <h1 className="mt-1 text-[32px] font-semibold leading-none tracking-tight">안녕하세요, {firstName}님.</h1>
            <p className="mt-2 text-[14px] text-stone">현재 진행 중인 제품을 확인하세요.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-snow"
          >
            <Plus size={14} />
            새 제품
          </button>
        </header>

        <section>
          <h2 className="text-[16px] font-semibold tracking-tight">진행 중</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((p) => {
              const r = productCompleteness(p);
              const col = collections.find((c) => c.id === p.collectionId);
              const people = [p.ownerId, p.designerId, p.productionManagerId]
                .map((id) => getUser(id) ?? userById(id))
                .filter(Boolean);
              const lead = people[0]?.name ?? firstName;
              const extra = Math.max(0, people.length - 1);
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="rounded-2xl border border-mist bg-snow p-3 transition hover:border-fog"
                >
                  <div className="flex h-28 items-center justify-center rounded-2xl bg-paper">
                    <MiniFlat category={p.category} className="h-20 w-16" />
                  </div>
                  <p className="mt-2.5 truncate text-[13px] font-medium">{p.name}</p>
                  <p className="truncate text-[11px] text-stone">
                    {p.code} · {col ? `${col.name} Collection` : p.specs.identity?.season}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <CompletenessBar percent={r.percent} compact />
                    <CompletenessBadge stage={r.stage} />
                  </div>
                  <p className="mt-2 text-[11px] text-stone">
                    {lead}
                    {extra > 0 ? ` 외 ${extra}명` : ""} · {p.updatedAt}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {needsAttention.length > 0 && (
          <section>
            <h2 className="text-[16px] font-semibold tracking-tight">확인 필요한 제품</h2>
            <div className="mt-4 space-y-2">
              {needsAttention.map(({ product: p, gaps }) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between rounded-2xl border border-mist bg-snow px-4 py-3 hover:border-fog"
                >
                  <div>
                    <p className="text-[11px] text-stone">Tech Pack 정보 부족</p>
                    <p className="mt-0.5 text-[14px] font-medium">{p.name}</p>
                    <p className="mt-0.5 text-[12px] text-stone">
                      {gaps[0].label}
                      {gaps.length > 1 ? ` 외 ${gaps.length - 1}개` : ""}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-stone" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[16px] font-semibold tracking-tight">최근 작업</h2>
          <ul className="mt-4 divide-y divide-mist overflow-hidden rounded-2xl border border-mist bg-snow">
            {mine.slice(0, 8).map((p) => {
              const r = productCompleteness(p);
              return (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
                      <MiniFlat category={p.category} className="h-8 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{p.name}</p>
                      <p className="truncate text-[11px] text-stone">
                        {p.code} · {r.percent}% · {p.updatedAt}
                      </p>
                    </div>
                    <CompletenessBadge stage={r.stage} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {creating && <NewProductModal onClose={() => setCreating(false)} />}
    </div>
  );
}
