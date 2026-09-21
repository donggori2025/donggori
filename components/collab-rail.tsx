"use client";

import { useEffect, useState } from "react";
import { collections, userById, users } from "@/lib/data";
import { useWorkspace, type CollabTab } from "@/lib/store";
import type { Mode, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PropertiesPanel } from "./properties-panel";
import { Avatar } from "./ui";
import { VersionPanel } from "./version-panel";

export function CollabRail({
  product,
  mode,
  selectedTarget,
  viewingVersionId,
  onViewVersion,
}: {
  product: Product;
  mode: Mode;
  selectedTarget: { id: string; label: string } | null;
  viewingVersionId: string | null;
  onViewVersion: (id: string | null) => void;
}) {
  const { comments, addComment, currentUserId } = useWorkspace();
  const isPack = mode !== "design";
  const [tab, setTab] = useState<CollabTab>(isPack ? "comments" : "properties");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setTab(mode === "design" ? "properties" : "comments");
  }, [mode]);

  const productComments = comments.filter((c) => c.productId === product.id);
  const tabs = (
    isPack
      ? ([
          ["comments", "코멘트"],
          ["versions", "버전"],
        ] as const)
      : ([
          ["properties", "속성"],
          ["comments", "코멘트"],
          ["versions", "버전"],
        ] as const)
  );

  const tabsBar = (
    <div className="flex gap-5 border-b border-mist px-4">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={cn(
            "-mb-px border-b-2 py-3 text-[13px] tracking-tight",
            tab === id ? "border-ink font-medium text-ink" : "border-transparent text-stone",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (tab === "properties" && !isPack) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        <PropertiesPanel product={product} selectedTarget={selectedTarget} tabs={tabsBar} />
      </div>
    );
  }

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-mist bg-snow shadow-sm">
      {tabsBar}

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {tab === "comments" && (
          <div className="space-y-3">
            {selectedTarget && (
              <p className="rounded-xl bg-lilac/50 px-3 py-2 text-[11px] text-lilac-ink">
                {mode === "design" ? "Design" : "Tech Pack"} · {selectedTarget.label}
              </p>
            )}
            {productComments.map((c) => {
              const author = userById(c.authorId);
              return (
                <article key={c.id} className="rounded-2xl border border-mist p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar user={author} size={22} />
                    <span className="text-[12px] font-medium">{author?.name}</span>
                    <span className="ml-auto text-[10px] text-stone">{c.createdAt}</span>
                  </div>
                  <p className="text-[11px] text-stone">
                    {c.context.mode === "design" ? "Design" : "Tech Pack"} · {c.context.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed">{c.body}</p>
                </article>
              );
            })}
          </div>
        )}

        {tab === "versions" && (
          <VersionPanel
            product={product}
            viewingVersionId={viewingVersionId}
            onViewVersion={onViewVersion}
          />
        )}

      </div>

      {tab === "comments" && (
        <form
          className="border-t border-mist p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addComment({
              productId: product.id,
              body: draft,
              mentions: draft.includes("@민지") ? ["lee-minji"] : [],
              context: {
                mode,
                target: selectedTarget?.id || "product",
                label: selectedTarget?.label || product.name,
              },
            });
            setDraft("");
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              selectedTarget
                ? `${selectedTarget.label}에 코멘트…  @로 멘션`
                : "코멘트 또는 @멘션"
            }
            className="h-20 w-full resize-none rounded-xl bg-paper px-3 py-2 text-[13px] outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-stone">{users.find((u) => u.id === currentUserId)?.name}로 작성</p>
            <button className="rounded-full bg-ink px-3 py-1.5 text-[12px] text-snow">보내기</button>
          </div>
        </form>
      )}
    </aside>
  );
}

export function collectionName(id: string) {
  return collections.find((c) => c.id === id)?.name ?? id;
}
