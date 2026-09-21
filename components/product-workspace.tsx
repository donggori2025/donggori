"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, FileText, PanelLeft, PanelLeftClose, PanelRight, PanelRightClose, PenTool } from "lucide-react";
import { collaboratorsOf, collections, userById } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import type { Mode, Product, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CollabRail } from "./collab-rail";
import {
  DESIGN_FLOAT_GAP,
  DESIGN_FLOAT_INSET,
  DESIGN_LEFT_RAIL_W,
  DESIGN_RIGHT_RAIL_W,
  DesignCanvas,
} from "./design-canvas";
import { DesignSidebar } from "./design-sidebar";
import { InviteTrigger, AVATAR_SIZE } from "./invite-modal";
import { SpecsView } from "./specs-view";
import {
  PACK_CHROME_CHIP_H,
  PACK_RIGHT_RAIL_W,
  PACK_SIDEBAR_W,
  printTechPackSheets,
  ProductShareMenu,
  TechPackPreview,
} from "./tech-pack";
import { AvatarStack } from "./ui";

const ONBOARDING_KEY = "faddit-product-onboarding";

const MODES: { id: Mode; label: string; Icon: typeof PenTool; iconColor: string }[] = [
  { id: "design", label: "Design", Icon: PenTool, iconColor: "#5d4e7a" },
  { id: "specs", label: "Tech Pack", Icon: FileText, iconColor: "#5a8a78" },
];

function uniqueUsers(list: (User | undefined)[]) {
  const seen = new Set<string>();
  return list.filter((u): u is User => {
    if (!u || seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

function ShareCluster({
  product,
  workspaceName,
  stackUsers,
  rail,
  onToggleRail,
  onPrint,
}: {
  product: Product;
  workspaceName: string;
  stackUsers: User[];
  rail: boolean;
  onToggleRail: () => void;
  onPrint: () => void;
}) {
  return (
    <div
      className="flex w-max shrink-0 items-center gap-1.5 rounded-2xl border border-mist bg-snow py-1 pr-1.5 pl-2 shadow-sm"
      style={{ height: PACK_CHROME_CHIP_H }}
    >
      <div className="hidden items-center md:flex">
        <AvatarStack users={stackUsers} size={AVATAR_SIZE} />
        <span className={cn(stackUsers.length > 0 && "-ml-1.5")}>
          <InviteTrigger product={product} workspaceName={workspaceName} />
        </span>
      </div>
      <ProductShareMenu productId={product.id} onPrint={onPrint} />
      <button
        type="button"
        onClick={onToggleRail}
        aria-label={rail ? "협업 패널 숨기기" : "협업 패널 보기"}
        aria-pressed={rail}
        title={rail ? "협업 패널 숨기기" : "협업 패널 보기"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full hover:bg-paper",
          rail ? "text-stone" : "text-stone/45",
        )}
      >
        {rail ? <PanelRightClose size={18} strokeWidth={1.75} /> : <PanelRight size={18} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export function ProductWorkspace({ productId }: { productId: string }) {
  const router = useRouter();
  const { getProduct, getUser, workspaces, versions } = useWorkspace();
  const product = getProduct(productId);
  const [mode, setMode] = useState<Mode>("design");
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null);
  const [selectRev, setSelectRev] = useState(0);
  const handleSelectTarget = (t: { id: string; label: string } | null) => {
    setSelected(t);
    setSelectRev((n) => n + 1);
  };
  const [specsEditing, setSpecsEditing] = useState(false);
  const [focusSection, setFocusSection] = useState<string | null>(null);
  const [rail, setRail] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    try {
      setOnboarding(window.localStorage.getItem(ONBOARDING_KEY) !== "1");
    } catch {
      setOnboarding(true);
    }
  }, []);

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center text-stone">
        제품을 찾을 수 없습니다.
      </div>
    );
  }

  const owner = getUser(product.ownerId) ?? userById(product.ownerId);
  const designer = getUser(product.designerId) ?? userById(product.designerId);
  const pm = getUser(product.productionManagerId) ?? userById(product.productionManagerId);
  const extraCollaborators = collaboratorsOf(product)
    .map((c) => getUser(c.userId) ?? userById(c.userId))
    .filter((u): u is User => Boolean(u));
  const stackUsers = uniqueUsers([designer, pm, owner, ...extraCollaborators]);
  const productWs = workspaces.find((w) => w.id === product.workspaceId);
  const collection = collections.find((c) => c.id === product.collectionId);
  const viewingVersion = versions.find((v) => v.id === viewingVersionId && v.productId === product.id);
  const viewingPast = Boolean(viewingVersion && viewingVersion.number !== product.version);
  const packRightW = mode === "design" ? DESIGN_RIGHT_RAIL_W : PACK_RIGHT_RAIL_W;
  const displayProduct =
    viewingPast && viewingVersion?.snapshot
      ? {
          ...product,
          nodes: viewingVersion.snapshot.nodes,
          specs: viewingVersion.snapshot.specs,
          version: viewingVersion.number,
        }
      : product;

  const dismissOnboarding = (persist: boolean) => {
    setOnboarding(false);
    if (persist) {
      try {
        window.localStorage.setItem(ONBOARDING_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-paper canvas-dot">
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 min-h-0 min-w-0",
          mode === "design" ? "top-0" : "top-16",
        )}
        style={
          mode !== "design" && rail
            ? { right: DESIGN_FLOAT_INSET + packRightW + DESIGN_FLOAT_GAP }
            : undefined
        }
      >
        {mode === "design" ? (
          <DesignCanvas
            product={displayProduct}
            selectedTarget={selected}
            onSelectTarget={handleSelectTarget}
            readOnly={viewingPast}
            railOpen={rail}
            sidebarOpen={sidebarOpen}
          />
        ) : (
          <>
            <div className={cn("h-full", specsEditing && "hidden")}>
              <TechPackPreview
                product={displayProduct}
                variant="workspace"
                onJumpSpecs={
                  viewingPast
                    ? undefined
                    : (section) => {
                        if (section === "design") {
                          setMode("design");
                          return;
                        }
                        if (!section) return;
                        setFocusSection(section);
                        setSpecsEditing(true);
                      }
                }
              />
            </div>
            {specsEditing && (
              <div className="h-full">
                <SpecsView
                  product={displayProduct}
                  selectedTarget={selected}
                  onSelectTarget={handleSelectTarget}
                  focusSection={focusSection}
                  onOpenTechPack={() => setSpecsEditing(false)}
                  initialTab={focusSection}
                />
              </div>
            )}
          </>
        )}
      </div>

      {viewingPast && viewingVersion && (
        <div className="absolute top-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12px] text-snow shadow-float">
          <span>
            V{viewingVersion.number} · {viewingVersion.title} 보는 중
          </span>
          <button
            type="button"
            onClick={() => setViewingVersionId(null)}
            className="rounded-full bg-snow/15 px-2 py-0.5 text-[11px] hover:bg-snow/25"
          >
            현재 작업으로
          </button>
        </div>
      )}

      <div
        data-workspace-right-chrome
        className={cn(
          "pointer-events-auto absolute top-3 right-3 z-30 flex flex-col items-end",
          rail && "bottom-3",
        )}
        style={{
          width: rail ? packRightW : undefined,
          gap: DESIGN_FLOAT_GAP,
        }}
      >
        <ShareCluster
          product={product}
          workspaceName={productWs?.name ?? "Workspace"}
          stackUsers={stackUsers}
          rail={rail}
          onToggleRail={() => setRail((v) => !v)}
          onPrint={() => {
            setMode("specs");
            setSpecsEditing(false);
            window.setTimeout(() => printTechPackSheets(), 120);
          }}
        />
        {rail && (
          <div
            data-pack-properties
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
          >
            <CollabRail
              product={product}
              mode={mode}
              selectedTarget={selected}
              viewingVersionId={viewingVersionId}
              onViewVersion={setViewingVersionId}
            />
          </div>
        )}
      </div>

      <div
        data-workspace-left-chrome
        className={cn(
          "pointer-events-auto absolute top-3 left-3 z-30 flex flex-col",
          mode === "design" && sidebarOpen && "bottom-3",
        )}
        style={{
          width: mode === "design" ? DESIGN_LEFT_RAIL_W : PACK_SIDEBAR_W,
          gap: DESIGN_FLOAT_GAP,
        }}
      >
        <div
          className="flex w-full shrink-0 items-center gap-2 rounded-2xl border border-mist bg-snow py-1.5 pr-1.5 pl-1.5 shadow-sm"
          style={{ height: PACK_CHROME_CHIP_H }}
        >
          <button
            type="button"
            aria-label="뒤로"
            onClick={() => {
              const idx = (window.history.state as { idx?: number } | null)?.idx;
              const canGoBack = typeof idx === "number" ? idx > 0 : window.history.length > 1;
              if (canGoBack) {
                router.back();
                return;
              }
              router.push(`/workspaces/${product.workspaceId}`);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-paper"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-[14px] font-medium tracking-tight">{product.name}</p>
              <ChevronDown size={12} className="shrink-0 text-stone/50" />
              <span className="shrink-0 text-[11px] text-stone">V{displayProduct.version}</span>
            </div>
            <p className="truncate text-[11px] text-stone">
              {collection?.name ?? productWs?.name ?? "Workspace"} · {product.code}
            </p>
          </div>
          {mode === "design" && (
            <button
              type="button"
              title={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
              aria-label={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone hover:bg-paper"
            >
              {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
            </button>
          )}
        </div>
        {mode === "design" && sidebarOpen && (
          <div className="h-full min-h-0 min-w-0 flex-1">
            <DesignSidebar
              product={displayProduct}
              selectedTarget={selected}
              selectRev={selectRev}
              onSelectTarget={handleSelectTarget}
            />
          </div>
        )}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2">
          <div className="flex h-10 items-center rounded-full border border-mist bg-snow p-1 shadow-sm">
            {MODES.map((m) => {
              const active = mode === m.id;
              const Icon = m.Icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setSelected(null);
                    if (m.id === "specs") setSpecsEditing(false);
                  }}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] capitalize",
                    active ? "bg-ink text-snow" : "text-stone hover:text-ink",
                  )}
                >
                  <Icon
                    size={13}
                    strokeWidth={2}
                    aria-hidden
                    className="shrink-0"
                    style={{ color: m.iconColor, opacity: active ? 1 : 0.72 }}
                  />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {onboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay">
          <div className="w-[420px] rounded-3xl bg-snow p-6 shadow-xl">
            <p className="text-[18px] font-semibold tracking-tight">제품을 만드는 방법</p>
            <ol className="mt-5 space-y-4">
              {[
                { n: "1", t: "Design", d: "제품의 형태를 만드세요." },
                { n: "2", t: "Tech Pack", d: "작업지시서를 보고 모듈을 수정하세요." },
                { n: "3", t: "공유", d: "완성된 문서를 공장과 공유하세요." },
              ].map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-medium">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium">{s.t}</p>
                    <p className="text-[13px] text-stone">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => dismissOnboarding(true)}
                className="text-[12px] text-stone hover:text-ink"
              >
                다시 보지 않기
              </button>
              <button
                type="button"
                onClick={() => dismissOnboarding(true)}
                className="rounded-full bg-ink px-4 py-2 text-[13px] text-snow"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
