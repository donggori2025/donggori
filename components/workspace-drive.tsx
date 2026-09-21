"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Folder, Search, Upload } from "lucide-react";
import { CreateMenu } from "@/components/create-menu";
import { DriveChips } from "@/components/drive-chips";
import { DriveFileMenu } from "@/components/drive-file-menu";
import { InviteTrigger, AVATAR_SIZE } from "@/components/invite-modal";
import { NewProductModal } from "@/components/new-product-modal";
import { WorkspaceBackdrop } from "@/components/workspace-backdrop";
import { collections, userById } from "@/lib/data";
import { DRIVE_CHIP_LABEL, assetDriveChip, type DriveChipId } from "@/lib/drive";
import { productCompleteness } from "@/lib/product-readiness";
import { useWorkspace } from "@/lib/store";
import { Avatar, AvatarStack, MiniFlat } from "@/components/ui";
import { cn } from "@/lib/utils";

type DriveKind = Exclude<DriveChipId, "all" | "upload"> | "folder";

type DriveItem = {
  id: string;
  name: string;
  kind: DriveKind;
  subtitle: string;
  href?: string;
  uploaded?: boolean;
  favorite?: boolean;
  source?: "product" | "asset";
  category?: "hoodie" | "tee" | "pants" | "jacket" | "shirt" | "knit" | "skirt" | "vest";
  collection?: string;
  completeness?: { percent: number; stageLabel: string; stage: ReturnType<typeof productCompleteness>["stage"] };
  people?: string;
  updatedAt?: string;
};

const DRIVE_DEMO_FILES = [
  { name: "SS26 원단 스와치.png", meta: "이미지 · 2.1MB" },
  { name: "후디 실루엣 참고.pdf", meta: "PDF · 840KB" },
  { name: "컬러웨이 보드.jpg", meta: "이미지 · 1.4MB" },
];

export function WorkspaceDrive() {
  const {
    currentWorkspace,
    workspaceProducts,
    workspaceAssets,
    comments,
    activities,
    createFolder,
    createAsset,
    getUser,
  } = useWorkspace();
  const [filter, setFilter] = useState<DriveChipId>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"folder" | "techpack" | "gdrive" | null>(null);
  const [name, setName] = useState("");

  const items = useMemo<DriveItem[]>(() => {
    const customFolders: DriveItem[] = (currentWorkspace.folders ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      kind: "folder",
      subtitle: "폴더",
    }));
    const folders: DriveItem[] = collections.map((c) => ({
      id: `folder-${c.id}`,
      name: c.name,
      kind: "folder",
      subtitle: `${c.season} · ${c.year}`,
    }));
    const packs: DriveItem[] = workspaceProducts.map((p) => {
      const r = productCompleteness(p);
      const col = collections.find((c) => c.id === p.collectionId);
      const names = [p.ownerId, p.designerId, p.productionManagerId]
        .map((id) => getUser(id)?.name ?? userById(id)?.name)
        .filter((n, i, arr): n is string => Boolean(n) && arr.indexOf(n) === i);
      const extra = Math.max(0, names.length - 1);
      return {
        id: p.id,
        name: p.name,
        kind: "techpack",
        subtitle: p.code,
        href: `/products/${p.id}`,
        category: p.category,
        source: "product" as const,
        favorite: p.favorite,
        collection: col ? `${col.name} Collection` : p.specs.identity?.season,
        completeness: { percent: r.percent, stageLabel: r.stage, stage: r.stage },
        people: names[0] ? `${names[0]}${extra > 0 ? ` 외 ${extra}명` : ""}` : undefined,
        updatedAt: p.updatedAt,
      };
    });
    const assets: DriveItem[] = workspaceAssets.map((a) => ({
      id: a.id,
      name: a.name,
      kind: assetDriveChip(a.kind, a.name),
      subtitle: a.meta,
      uploaded: Boolean(a.uploaded),
      source: "asset",
      favorite: a.favorite,
    }));
    return [...customFolders, ...folders, ...packs, ...assets];
  }, [currentWorkspace.folders, workspaceProducts, workspaceAssets, getUser]);

  const { folders, files } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesQuery = (item: DriveItem) =>
      !q || item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
    const folders = items.filter((item) => item.kind === "folder" && matchesQuery(item));
    const files = items.filter((item) => {
      if (item.kind === "folder") return false;
      if (!matchesQuery(item)) return false;
      if (filter === "upload") return Boolean(item.uploaded);
      if (filter === "all") return true;
      return item.kind === filter;
    });
    return { folders, files };
  }, [items, filter, query]);

  const showFolders = filter === "all";
  const empty = (showFolders ? folders.length === 0 : true) && files.length === 0;

  const ids = new Set(workspaceProducts.map((p) => p.id));
  const myTasks = comments.filter((c) => c.isTask && c.taskStatus !== "resolved" && ids.has(c.productId));
  const members = currentWorkspace.memberIds.map((id) => getUser(id)).filter(Boolean);
  const isTeam = currentWorkspace.kind === "team";

  return (
    <WorkspaceBackdrop workspace={currentWorkspace}>
      <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        <header className="relative z-20 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-stone uppercase">
              {isTeam ? "Team Workspace" : "Personal Workspace"}
            </p>
            <h1 className="mt-1 text-[36px] font-semibold leading-none tracking-tight">{currentWorkspace.name}</h1>
            <p className="mt-2 text-[14px] text-stone">
              {workspaceProducts.length} Products
              {isTeam ? ` · ${currentWorkspace.memberIds.length} Members` : " · 나만 볼 수 있습니다"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isTeam && (
              <div className="flex items-center">
                <AvatarStack users={members as NonNullable<(typeof members)[number]>[]} size={AVATAR_SIZE} />
                <span className={cn(members.length > 0 && "-ml-1.5")}>
                  <InviteTrigger workspaceName={currentWorkspace.name} />
                </span>
              </div>
            )}
            <CreateMenu
              onFolder={() => {
                setName("");
                setDialog("folder");
              }}
              onTechPack={() => {
                setName("");
                setDialog("techpack");
              }}
              onUpload={(files) => {
                Array.from(files).forEach((file) => {
                  createAsset({
                    group: "design",
                    kind: "Upload",
                    name: file.name,
                    meta: "로컬 업로드",
                  });
                });
              }}
              onGoogleDrive={() => setDialog("gdrive")}
            />
          </div>
        </header>

        <div className="flex items-start gap-5">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="워크스페이스 검색"
                className="h-10 w-full rounded-full border border-mist bg-snow pl-10 pr-4 text-[13px] outline-none placeholder:text-stone"
              />
            </div>

            <DriveChips value={filter} onChange={setFilter} />

            {empty ? (
              <div className="rounded-3xl border border-dashed border-fog bg-snow/80 px-6 py-16 text-center">
                <p className="text-[15px] font-medium">{query.trim() ? "검색 결과가 없습니다" : "해당하는 항목이 없습니다"}</p>
                <p className="mt-1 text-[13px] text-stone">
                  {query.trim()
                    ? "다른 검색어나 칩을 선택해 보세요."
                    : isTeam
                      ? "팀 안에서 제품을 만들고 에셋과 함께 공유하세요."
                      : "개인 워크스페이스에서 먼저 스케치를 시작해 보세요."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {showFolders && folders.length > 0 && (
                  <div className="drive-file-grid">
                    {folders.map((item) => (
                      <article
                        key={item.id}
                        className="flex w-drive-file items-center gap-3 rounded-2xl border border-mist bg-snow p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paper">
                          <Folder size={22} className="text-stone" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">{item.name}</p>
                          <p className="truncate text-[11px] text-stone">{item.subtitle}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="drive-file-grid">
                    {files.map((item) => {
                      const inner = (
                        <>
                          <div className="flex h-32 items-center justify-center rounded-2xl bg-paper">
                            {item.kind === "techpack" && item.category ? (
                              <MiniFlat category={item.category} className="h-24 w-20 transition group-hover:scale-[1.03]" />
                            ) : item.uploaded ? (
                              <Upload size={24} className="text-stone" strokeWidth={1.5} />
                            ) : (
                              <FileText size={24} className="text-stone" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="mt-2.5 min-w-0 pr-8">
                            <p className="truncate text-[13px] font-medium">{item.name}</p>
                            {item.source === "product" ? (
                              <>
                                <p className="truncate text-[11px] text-stone">{item.subtitle}</p>
                                {item.collection && (
                                  <p className="truncate text-[11px] text-stone">{item.collection}</p>
                                )}
                                {item.completeness && (
                                  <p className="mt-1 truncate text-[11px] text-stone">{item.completeness.percent}%</p>
                                )}
                                <p className="mt-0.5 truncate text-[11px] text-stone">
                                  {[item.people, item.updatedAt].filter(Boolean).join(" · ")}
                                </p>
                              </>
                            ) : (
                              <p className="truncate text-[11px] text-stone">
                                {item.kind === "folder" ? "폴더" : DRIVE_CHIP_LABEL[item.kind]}
                                {item.uploaded ? " · 업로드" : ""} · {item.subtitle}
                              </p>
                            )}
                          </div>
                        </>
                      );
                      return (
                        <article
                          key={item.id}
                          className="group relative w-drive-file rounded-2xl border border-mist bg-snow p-3 pb-10 transition hover:border-fog"
                        >
                          {item.href ? (
                            <Link href={item.href} className="block min-w-0">
                              {inner}
                            </Link>
                          ) : (
                            inner
                          )}
                          {item.source && (
                            <div className="absolute right-2.5 bottom-2.5 z-[1]">
                              <DriveFileMenu
                                itemId={item.id}
                                itemName={item.name}
                                source={item.source}
                                favorite={item.favorite}
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="hidden w-[260px] shrink-0 space-y-3 lg:block">
            <section className="rounded-2xl border border-mist bg-snow px-4 py-3.5">
              <h2 className="text-[13px] font-medium">My Tasks</h2>
              <div className="mt-2 space-y-1.5">
                {myTasks.length === 0 && (
                  <p className="text-[12px] leading-relaxed text-stone">이 워크스페이스에 열린 태스크가 없습니다.</p>
                )}
                {myTasks.slice(0, 3).map((t) => {
                  const p = workspaceProducts.find((x) => x.id === t.productId);
                  return (
                    <Link
                      key={t.id}
                      href={`/products/${t.productId}`}
                      className="block rounded-xl bg-paper px-2.5 py-2 hover:bg-lilac/30"
                    >
                      <p className="truncate text-[12px]">{p?.name}</p>
                      <p className="truncate text-[11px] text-stone">{t.body}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
            <section className="rounded-2xl border border-mist bg-snow px-4 py-3.5">
              <h2 className="text-[13px] font-medium">Recent Activity</h2>
              <div className="mt-2 space-y-2">
                {activities
                  .filter((a) => !a.productId || ids.has(a.productId))
                  .slice(0, 3)
                  .map((a) => (
                    <div key={a.id} className="flex gap-2">
                      <Avatar user={getUser(a.actorId)} size={20} />
                      <div className="min-w-0">
                        <p className="text-[11px] leading-snug text-ink">{a.text}</p>
                        <p className="text-[10px] text-stone">{a.createdAt}</p>
                      </div>
                    </div>
                  ))}
                {activities.filter((a) => !a.productId || ids.has(a.productId)).length === 0 && (
                  <p className="text-[12px] leading-relaxed text-stone">최근 활동이 없습니다.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {dialog === "folder" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setDialog(null)}>
          <form
            className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              createFolder(name.trim() || "새 폴더");
              setDialog(null);
              setName("");
            }}
          >
            <p className="text-[18px] font-semibold tracking-tight">폴더 만들기</p>
            <p className="mt-1 text-[13px] text-stone">{currentWorkspace.name}에 새 폴더를 추가합니다.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="폴더 이름"
              className="mt-4 h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDialog(null)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                취소
              </button>
              <button className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">만들기</button>
            </div>
          </form>
        </div>
      )}

      {dialog === "techpack" && <NewProductModal onClose={() => setDialog(null)} />}

      {dialog === "gdrive" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setDialog(null)}>
          <div
            className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[18px] font-semibold tracking-tight">Google Drive</p>
            <p className="mt-1 text-[13px] text-stone">가져올 파일을 고르세요. 데모에서는 로컬 워크스페이스에 추가됩니다.</p>
            <ul className="mt-4 space-y-1">
              {DRIVE_DEMO_FILES.map((file) => (
                <li key={file.name}>
                  <button
                    type="button"
                    onClick={() => {
                      createAsset({
                        group: "design",
                        kind: "Upload",
                        name: file.name,
                        meta: "Google Drive",
                      });
                      setDialog(null);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-mist px-3 py-2.5 text-left hover:bg-paper"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper text-stone">
                      <FileText size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{file.name}</span>
                      <span className="block text-[11px] text-stone">{file.meta}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setDialog(null)} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceBackdrop>
  );
}
