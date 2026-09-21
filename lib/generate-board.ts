import type { CanvasNode, GeneratePrompt } from "./types";

export const GENERATE_PLACEHOLDER = "오버사이즈 후드, 드롭숄더, 골지 1x1. 정면 도식화.";

export function isGeneratedBoard(node: CanvasNode) {
  return Boolean(node.generate);
}

export function generateBoardLabel(node: CanvasNode) {
  const mark = node.generate?.revised ? "′" : "";
  if (node.generate?.kind === "svg") return `디자인 보드 · SVG${mark}`;
  if (node.generate) return `디자인 보드 · v${node.generate.version}${mark}`;
  return node.title;
}

export function generateMention(node: CanvasNode) {
  if (node.generate?.kind === "svg") return `@svg${node.generate.revised ? "′" : ""}`;
  if (node.generate) return `@v${node.generate.version}${node.generate.revised ? "′" : ""}`;
  return "@보드";
}

export function nextGenerateVersion(nodes: CanvasNode[]) {
  const versions = nodes
    .map((node) => (node.generate?.kind === "image" ? node.generate.version : 0))
    .concat(0);
  return Math.max(...versions) + 1;
}

export function hasSvgSibling(nodes: CanvasNode[], sourceId: string) {
  return nodes.some((node) => node.generate?.kind === "svg" && svgSourceId(node) === sourceId);
}

export function svgSourceId(node: CanvasNode) {
  if (node.generate?.kind !== "svg") return undefined;
  return node.generate.sourceBoardId ?? node.linkedTo;
}

export function svgPairsOf(nodes: CanvasNode[]) {
  return nodes.flatMap((svg) => {
    const sourceId = svgSourceId(svg);
    if (!sourceId) return [];
    const source = nodes.find((node) => node.id === sourceId);
    if (!source || source.id === svg.id) return [];
    return [{ source, svg }];
  });
}

/** History is keyed by canvas node id (`GeneratePrompt.boardId`). No board → empty. */
export function promptsForBoard(prompts: GeneratePrompt[] | undefined, boardId: string | null) {
  if (!boardId) return [];
  return (prompts ?? []).filter((item) => item.boardId === boardId);
}

export function promptSnippet(text: string, fallback: string) {
  const snippet = text.replace(/\s+/g, " ").trim();
  if (!snippet) return fallback;
  return snippet.length > 24 ? `${snippet.slice(0, 24)}…` : snippet;
}

/** Room for the source board’s + hub (36 gap + 40 button + 36 gap). */
export const SVG_SIBLING_GAP = 112;

export function siblingPoint(source: CanvasNode) {
  return { x: source.x + (source.w ?? 374) + SVG_SIBLING_GAP, y: source.y };
}

export function canExtractBoard(node: CanvasNode | undefined, nodes: CanvasNode[]) {
  if (!node || node.type !== "flat") return false;
  if (node.generate?.kind === "svg") return false;
  return !hasSvgSibling(nodes, node.id);
}
