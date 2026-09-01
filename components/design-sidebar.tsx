"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Frame,
  Group,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  PanelLeftClose,
  PenTool,
  Ruler,
  Star,
  SwatchBook,
  Type,
  Upload,
} from "lucide-react";
import { collections } from "@/lib/data";
import { readFilesAsProductFiles } from "@/lib/product-files";
import { useWorkspace } from "@/lib/store";
import type { CanvasNode, CanvasNodeType, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { partsForCategory } from "./flats";

type RailId = "layers" | "templates" | "fabrics" | "assets" | "upload" | "favorites";
type LayerKind = "page" | "frame" | "group" | "text" | "image" | "vector";

type LayerRow = {
  id: string;
  name: string;
  kind: LayerKind;
  target: { id: string; label: string };
  children?: LayerRow[];
};

const RAIL: { id: RailId; label: string; icon: typeof Layers }[] = [
  { id: "layers", label: "레이어", icon: Layers },
  { id: "templates", label: "템플릿", icon: LayoutTemplate },
  { id: "fabrics", label: "원단", icon: SwatchBook },
  { id: "assets", label: "에셋", icon: LayoutGrid },
  { id: "upload", label: "업로드", icon: Upload },
  { id: "favorites", label: "즐겨찾기", icon: Star },
];

const TEMPLATES: { type: CanvasNodeType; name: string; hint: string; tone: string }[] = [
  { type: "flat", name: "Oversized Hoodie", hint: "도식화 템플릿", tone: "bg-peach" },
  { type: "flat", name: "Graphic Tee", hint: "티셔츠 실루엣", tone: "bg-mint" },
  { type: "mockup2d", name: "2D Mockup", hint: "착장 시각화", tone: "bg-sky" },
  { type: "mockup3d", name: "3D Mockup", hint: "입체 미리보기", tone: "bg-lilac" },
];

function nodeChildren(node: CanvasNode, category: Product["category"]): LayerRow[] {
  if (node.type === "flat") {
    return [
      {
        id: `${node.id}::group`,
        name: "Front",
        kind: "group",
        target: { id: node.id, label: node.title },
        children: partsForCategory(category)
          .filter((part) => !(node.hiddenParts ?? []).includes(part.id))
          .map((part) => ({
          id: `${node.id}::${part.id}`,
          name: part.label,
          kind: "vector" as const,
          target: { id: part.id, label: part.label },
        })),
      },
    ];
  }
  if (node.type === "label") {
    return [
      { id: `${node.id}::abc`, name: "ABC", kind: "text", target: { id: node.id, label: node.title } },
      { id: `${node.id}::sub`, name: "EST. SEOUL", kind: "text", target: { id: node.id, label: node.title } },
      { id: `${node.id}::img`, name: "Woven Patch", kind: "image", target: { id: node.id, label: node.title } },
    ];
  }
  if (node.type === "mockup2d") {
    return [{ id: `${node.id}::preview`, name: "2D Preview", kind: "image", target: { id: node.id, label: node.title } }];
  }
  return [{ id: `${node.id}::preview`, name: "3D Preview", kind: "image", target: { id: node.id, label: node.title } }];
}

function buildLayerTree(product: Product): LayerRow[] {
  return product.nodes
    .filter((node) => node.type !== "label")
    .map((node) => ({
    id: node.id,
    name: node.title,
    kind: "frame" as const,
    target: { id: node.id, label: node.title },
    children: nodeChildren(node, product.category),
  }));
}

function KindIcon({ kind }: { kind: LayerKind }) {
  const cls = "shrink-0 text-stone";
  if (kind === "frame") return <Hash size={12} strokeWidth={1.8} className={cls} />;
  if (kind === "group") return <Group size={12} strokeWidth={1.8} className={cls} />;
  if (kind === "text") return <Type size={12} strokeWidth={1.8} className={cls} />;
  if (kind === "image") return <ImageIcon size={12} strokeWidth={1.8} className={cls} />;
  if (kind === "vector") return <PenTool size={12} strokeWidth={1.8} className={cls} />;
  return <Frame size={12} strokeWidth={1.8} className={cls} />;
}

export function DesignSidebar({
  product,
  selectedTarget,
  onSelectTarget,
  onCollapse,
}: {
  product: Product;
  selectedTarget: { id: string; label: string } | null;
  onSelectTarget: (t: { id: string; label: string } | null) => void;
  onCollapse: () => void;
}) {
  const { assets, addNode, createAsset, updateSpecsField } = useWorkspace();
  const [tab, setTab] = useState<RailId>("layers");
  const [query, setQuery] = useState("");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const collection = collections.find((c) => c.id === product.collectionId);
  const tree = useMemo(() => buildLayerTree(product), [product]);
  const productAssets = assets.filter((a) => a.workspaceId === product.workspaceId || a.uploaded);
  const designAssets = productAssets.filter((a) => a.group === "design");
  const fabricAssets = productAssets.filter((a) => a.kind === "Fabric");
  const templateAssets = productAssets.filter((a) => a.kind === "Template");
  const starredRows = flattenLayers(tree).filter((row) => starred.has(row.id));

  const selectTab = (id: RailId) => {
    if (tab === id && id !== "layers") {
      setTab("layers");
      return;
    }
    setTab(id);
  };

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ingestFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    void readFilesAsProductFiles(list, "design").then((productFiles) => {
      updateSpecsField(product.id, (p) => ({
        ...p,
        files: [...(p.files ?? []), ...productFiles],
      }));
    });
    list.forEach((file) => {
      createAsset({
        group: "design",
        kind: "Upload",
        name: file.name,
        meta: "로컬 업로드",
      });
    });
    setTab("assets");
  };

  return (
    <aside className="flex h-full shrink-0 border-r border-mist bg-paper text-[11px] text-ink">
      <nav className="flex w-[56px] shrink-0 flex-col items-center gap-0.5 pt-2">
        {RAIL.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-pressed={active}
              onClick={() => selectTab(item.id)}
              className="relative flex w-full flex-col items-center gap-0.5 px-1 py-1.5"
            >
              {active && <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-sm bg-ink" />}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[8px]",
                  active ? "bg-mist text-ink" : "text-stone hover:bg-snow/80",
                )}
              >
                <Icon size={16} strokeWidth={1.7} />
              </span>
              <span
                className={cn(
                  "w-full text-center text-[9px] leading-[1.15] tracking-tight",
                  active ? "font-medium text-ink" : "text-stone",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex w-[248px] min-w-0 flex-col border-l border-mist bg-snow">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-mist px-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[12px] font-medium leading-none">
                {product.name}
                <ChevronDown size={12} className="shrink-0 text-stone/50" />
              </p>
              <p className="mt-1 truncate text-[10px] text-stone">
                {collection?.name ?? "Workspace"} · {product.code}
              </p>
            </div>
            <button
              type="button"
              title="사이드바 접기"
              aria-label="사이드바 접기"
              onClick={onCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-stone hover:bg-paper"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {tab === "layers" && (
              <LayersPanel
                tree={tree}
                query={query}
                onQuery={setQuery}
                selectedId={selectedTarget?.id ?? null}
                collapsed={collapsed}
                starred={starred}
                onToggle={(id) =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onSelect={onSelectTarget}
                onStar={toggleStar}
                onCreateBoard={(kind) =>
                  addNode(product.id, "flat", {
                    boardKind: kind,
                    title: kind === "specs" ? "Specs용 도식화" : "일반 도식화",
                  })
                }
              />
            )}
            {tab === "templates" && (
              <TemplatesPanel
                extras={templateAssets.map((a) => a.name)}
                onInsert={(type) => {
                  if (type === "flat") {
                    addNode(product.id, "flat", { boardKind: "general", title: "일반 도식화" });
                    return;
                  }
                  const host =
                    product.nodes.find((n) => n.id === selectedTarget?.id && n.type === "flat") ??
                    product.nodes.find((n) => n.type === "flat");
                  if (host) addNode(product.id, type, { linkedTo: host.id });
                }}
              />
            )}
            {tab === "fabrics" && (
              <FabricsPanel materials={product.specs.materials} library={fabricAssets} />
            )}
            {tab === "assets" && <AssetsPanel items={designAssets} />}
            {tab === "upload" && (
              <UploadPanel
                dragOver={dragOver}
                fileRef={fileRef}
                onDragOver={setDragOver}
                onFiles={ingestFiles}
              />
            )}
            {tab === "favorites" && (
              <FavoritesPanel
                rows={starredRows}
                selectedId={selectedTarget?.id ?? null}
                onSelect={onSelectTarget}
                onStar={toggleStar}
              />
            )}
          </div>
        </div>
    </aside>
  );
}

function CreateBoard({ onCreate }: { onCreate: (kind: "general" | "specs") => void }) {
  return (
    <div className="flex flex-col gap-1.5 px-2 pt-3">
      {(
        [
          { kind: "general" as const, title: "일반 도식화", hint: "작업용 · Tech Pack", Icon: PenTool },
          { kind: "specs" as const, title: "spec용 도식화", hint: "스펙 연동", Icon: Ruler },
        ] as const
      ).map((item) => (
        <button
          key={item.kind}
          type="button"
          onClick={() => onCreate(item.kind)}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-fog bg-snow px-2.5 py-2.5 text-left hover:border-stone"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-paper text-ink">
            <item.Icon size={14} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold tracking-tight text-ink">{item.title}</span>
            <span className="mt-0.5 block text-[10px] leading-tight text-stone">{item.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function LayersPanel({
  tree,
  query,
  onQuery,
  selectedId,
  collapsed,
  starred,
  onToggle,
  onSelect,
  onStar,
  onCreateBoard,
}: {
  tree: LayerRow[];
  query: string;
  onQuery: (v: string) => void;
  selectedId: string | null;
  collapsed: Set<string>;
  starred: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (t: { id: string; label: string }) => void;
  onStar: (id: string) => void;
  onCreateBoard: (kind: "general" | "specs") => void;
}) {
  return (
    <div>
      <CreateBoard onCreate={onCreateBoard} />
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <p className="text-[11px] font-medium text-stone">Layers</p>
      </div>
      <div className="px-2 pb-1.5">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="레이어 검색"
          className="h-7 w-full rounded-md bg-paper px-2 text-[11px] outline-none placeholder:text-stone/50"
        />
      </div>
      <div className="pb-3">
        {tree.map((row) => (
          <LayerBranch
            key={row.id}
            row={row}
            depth={0}
            query={query.trim().toLowerCase()}
            selectedId={selectedId}
            collapsed={collapsed}
            starred={starred}
            onToggle={onToggle}
            onSelect={onSelect}
            onStar={onStar}
          />
        ))}
      </div>
    </div>
  );
}

function LayerBranch({
  row,
  depth,
  query,
  selectedId,
  collapsed,
  starred,
  onToggle,
  onSelect,
  onStar,
}: {
  row: LayerRow;
  depth: number;
  query: string;
  selectedId: string | null;
  collapsed: Set<string>;
  starred: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (t: { id: string; label: string }) => void;
  onStar: (id: string) => void;
}) {
  const hasKids = Boolean(row.children?.length);
  const open = !collapsed.has(row.id);
  const match = !query || row.name.toLowerCase().includes(query) || descendantMatch(row, query);
  const selected = selectedId === row.target.id || selectedId === row.id;
  if (!match) return null;

  return (
    <div>
      <div
        className={cn(
          "group flex h-7 cursor-pointer items-center pr-1.5",
          selected ? "bg-paper" : "hover:bg-paper",
        )}
        style={{ paddingLeft: 6 + depth * 12 }}
        onClick={() => onSelect(row.target)}
      >
        <button
          type="button"
          className="flex h-4 w-4 shrink-0 items-center justify-center text-stone/50"
          onClick={(e) => {
            e.stopPropagation();
            if (hasKids) onToggle(row.id);
          }}
        >
          {hasKids ? open ? <ChevronDown size={11} /> : <ChevronRight size={11} /> : <span className="w-2" />}
        </button>
        <KindIcon kind={row.kind} />
        <span className="ml-1.5 min-w-0 flex-1 truncate text-[11px] leading-none">{row.name}</span>
        <button
          type="button"
          title="즐겨찾기"
          onClick={(e) => {
            e.stopPropagation();
            onStar(row.id);
          }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100",
            starred.has(row.id) && "opacity-100 text-select",
          )}
        >
          <Star size={11} fill={starred.has(row.id) ? "currentColor" : "none"} />
        </button>
      </div>
      {hasKids && open &&
        row.children!.map((child) => (
          <LayerBranch
            key={child.id}
            row={child}
            depth={depth + 1}
            query={query}
            selectedId={selectedId}
            collapsed={collapsed}
            starred={starred}
            onToggle={onToggle}
            onSelect={onSelect}
            onStar={onStar}
          />
        ))}
    </div>
  );
}

function TemplatesPanel({ extras, onInsert }: { extras: string[]; onInsert: (type: CanvasNodeType) => void }) {
  return (
    <div className="space-y-3 p-3">
      <p className="text-[11px] font-medium text-stone">의류 템플릿</p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onInsert(t.type)}
            className="overflow-hidden rounded-lg border border-mist text-left hover:border-fog"
          >
            <div className={cn("flex h-16 items-end justify-center", t.tone)}>
              <div className="mb-2 h-10 w-8 rounded-t-md border border-mist bg-snow/50" />
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate text-[11px] font-medium">{t.name}</p>
              <p className="text-[10px] text-stone">{t.hint}</p>
            </div>
          </button>
        ))}
      </div>
      {extras.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-stone">라이브러리</p>
          <div className="space-y-1">
            {extras.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onInsert("flat")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-paper"
              >
                <LayoutTemplate size={13} className="text-stone" />
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FabricsPanel({
  materials,
  library,
}: {
  materials: Product["specs"]["materials"];
  library: { id: string; name: string; meta: string }[];
}) {
  return (
    <div className="space-y-3 p-3">
      <p className="text-[11px] font-medium text-stone">제품 원단</p>
      {materials.length === 0 && <p className="text-[11px] text-stone">등록된 원단이 없습니다.</p>}
      {materials.map((m) => (
        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-mist px-2 py-2">
          <span className="h-8 w-8 shrink-0 rounded-md border border-mist" style={{ background: m.color }} />
          <div className="min-w-0">
            <p className="truncate font-medium">{m.name}</p>
            <p className="truncate text-[10px] text-stone">
              {m.composition} · {m.weight}
            </p>
          </div>
        </div>
      ))}
      {library.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-stone">라이브러리</p>
          <div className="space-y-1">
            {library.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                <SwatchBook size={13} className="text-stone" />
                <div className="min-w-0">
                  <p className="truncate">{a.name}</p>
                  <p className="truncate text-[10px] text-stone">{a.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsPanel({ items }: { items: { id: string; name: string; kind: string; meta: string }[] }) {
  return (
    <div className="space-y-1 p-3">
      <p className="mb-2 text-[11px] font-medium text-stone">워크스페이스 에셋</p>
      {items.length === 0 && <p className="text-[11px] text-stone">에셋이 없습니다.</p>}
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-paper">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper text-stone">
            <LayoutGrid size={13} />
          </span>
          <div className="min-w-0">
            <p className="truncate">{a.name}</p>
            <p className="truncate text-[10px] text-stone">
              {a.kind} · {a.meta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadPanel({
  dragOver,
  fileRef,
  onDragOver,
  onFiles,
}: {
  dragOver: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (v: boolean) => void;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <div className="p-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(true);
        }}
        onDragLeave={() => onDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          onDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-stone",
          dragOver ? "border-select bg-select-soft text-select" : "border-fog bg-paper",
        )}
      >
        <Upload size={18} />
        <p className="text-[11px]">파일을 놓거나 클릭해서 업로드</p>
        <p className="text-[10px]">공유 페이지에서 받을 수 있습니다</p>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function FavoritesPanel({
  rows,
  selectedId,
  onSelect,
  onStar,
}: {
  rows: LayerRow[];
  selectedId: string | null;
  onSelect: (t: { id: string; label: string }) => void;
  onStar: (id: string) => void;
}) {
  return (
    <div className="p-3">
      <p className="mb-2 text-[11px] font-medium text-stone">즐겨찾기</p>
      {rows.length === 0 && (
        <p className="text-[11px] leading-relaxed text-stone">
          레이어 행의 별을 누르면 여기에 모입니다.
        </p>
      )}
      <div className="space-y-0.5">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row.target)}
            className={cn(
              "flex w-full items-center gap-1.5 px-1.5 py-1.5 text-left",
              selectedId === row.target.id ? "bg-paper" : "hover:bg-paper",
            )}
          >
            <KindIcon kind={row.kind} />
            <span className="min-w-0 flex-1 truncate">{row.name}</span>
            <Star
              size={11}
              className="text-select"
              fill="currentColor"
              onClick={(e) => {
                e.stopPropagation();
                onStar(row.id);
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function flattenLayers(rows: LayerRow[]): LayerRow[] {
  return rows.flatMap((row) => [row, ...flattenLayers(row.children ?? [])]);
}

function descendantMatch(row: LayerRow, query: string): boolean {
  return (row.children ?? []).some(
    (child) => child.name.toLowerCase().includes(query) || descendantMatch(child, query),
  );
}
