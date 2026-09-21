import type { CanvasNode, PackExtra, Product, ProductSpecs } from "./types";

export function artboardsOf(product: Product) {
  return product.nodes.filter((n) => n.type === "flat");
}

export function specArtboardOf(product: Product) {
  return product.nodes.find((n) => n.type === "flat" && n.boardKind === "specs") ?? null;
}

/** spec용 도식화는 제품마다 항상 하나 둔다. 없으면 첫 아트보드를 지정하거나 새로 만든다. */
export function ensureSpecArtboard(product: Product, makeId?: () => string): Product {
  if (specArtboardOf(product)) return product;
  const first = product.nodes.find((n) => n.type === "flat");
  if (first) {
    return {
      ...product,
      nodes: product.nodes.map((n) => (n.id === first.id ? seedUsageFromSpecs(n, product.specs) : n)),
    };
  }
  const node = seedUsageFromSpecs(
    {
      id: makeId?.() ?? `n-spec-${product.id}`,
      type: "flat",
      title: "spec용 도식화",
      x: 80,
      y: 40,
    },
    product.specs,
  );
  return { ...product, nodes: [node, ...product.nodes] };
}

function pick<T>(items: T[], ids: string[] | undefined, idOf: (item: T) => string) {
  if (!ids) return items;
  const set = new Set(ids);
  return items.filter((item) => set.has(idOf(item)));
}

/** Tech Pack 원단·부자재·측정은 spec용 도식화에 쓰인 것만 채운다. */
export function specsFromArtboard(product: Product): ProductSpecs {
  const board = specArtboardOf(product);
  if (!board) return product.specs;
  const s = product.specs;
  return {
    ...s,
    materials: pick(s.materials, board.usedMaterialIds, (m) => m.id),
    trims: pick(s.trims, board.usedTrimIds, (t) => t.id),
    measurements: pick(s.measurements, board.usedMeasurementPoms, (r) => r.pom),
  };
}

export function seedUsageFromSpecs(node: CanvasNode, specs: ProductSpecs): CanvasNode {
  const empty =
    !node.usedMaterialIds?.length && !node.usedTrimIds?.length && !node.usedMeasurementPoms?.length;
  if (!empty) return { ...node, boardKind: "specs" };
  return {
    ...node,
    boardKind: "specs",
    usedMaterialIds: specs.materials.map((m) => m.id),
    usedTrimIds: specs.trims.map((t) => t.id),
    usedMeasurementPoms: specs.measurements.map((r) => r.pom),
  };
}

export function uniquifyPackExtraTitles(extras: PackExtra[]): PackExtra[] {
  const out: PackExtra[] = [];
  for (const extra of extras) {
    const title = uniquePackExtraTitle(extra.title, out, extra.kind);
    out.push(title === extra.title ? extra : { ...extra, title });
  }
  return out;
}

export function uniquePackExtraTitle(
  desired: string,
  extras: PackExtra[],
  kind: PackExtra["kind"],
  exceptId?: string,
) {
  const fallback = kind === "table" ? "표" : "메모";
  const base = desired.trim() || fallback;
  const used = new Set(extras.filter((e) => e.id !== exceptId).map((e) => e.title));
  if (!used.has(base)) return base;
  const stem = base.replace(/\(\d+\)$/, "") || fallback;
  let n = 1;
  while (used.has(`${stem}(${n})`)) n += 1;
  return `${stem}(${n})`;
}

export function emptyPackExtra(kind: PackExtra["kind"], extras: PackExtra[] = []): PackExtra {
  const title = uniquePackExtraTitle(kind === "table" ? "표" : "메모", extras, kind);
  if (kind === "table") {
    return {
      id: `extra-table-${Date.now()}-${extras.length + 1}`,
      kind: "table",
      title,
      table: {
        head: ["항목", "내용"],
        rows: [
          ["", ""],
          ["", ""],
        ],
      },
    };
  }
  return {
    id: `extra-memo-${Date.now()}-${extras.length + 1}`,
    kind: "memo",
    title,
    body: "",
  };
}
