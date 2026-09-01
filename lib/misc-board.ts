import type { MiscObject, MiscPage, ProductSpecs } from "./types";
import { htmlToText, specMiscHtml } from "./utils";

export const A4_W = 794;
export const A4_H = 1123;

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function pageSize(_page?: Pick<MiscPage, "orient"> | null) {
  return { w: A4_H, h: A4_W };
}

export function emptyMiscPage(index = 1): MiscPage {
  return { id: uid("page"), title: String(index), orient: "landscape", objects: [] };
}

export function isArrow(object: MiscObject): object is Extract<MiscObject, { type: "arrow" }> {
  return object.type === "arrow";
}

export function objectHasContent(object: MiscObject) {
  if (object.type === "arrow") return true;
  if (object.type === "image") return Boolean(object.src);
  return Boolean(object.text?.trim());
}

export function miscBoardHasContent(pages?: MiscPage[]) {
  return Boolean(pages?.some((page) => page.objects.some(objectHasContent)));
}

function htmlToPlain(html: string) {
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function miscBoardOf(specs: ProductSpecs): MiscPage[] {
  if (specs.miscBoard) {
    return specs.miscBoard.map((page) => ({ ...page, orient: "landscape" as const }));
  }
  const html = specMiscHtml(specs);
  const text = htmlToPlain(html);
  if (!text) return [emptyMiscPage(1)];
  return [
    {
      id: "page-migrated",
      title: "1",
      orient: "landscape",
      objects: [
        {
          id: "text-migrated",
          type: "text",
          x: 56,
          y: 56,
          w: 682,
          h: 420,
          text,
          fontSize: 16,
        },
      ],
    },
  ];
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function miscCompleteness(specs: ProductSpecs) {
  if (miscBoardHasContent(specs.miscBoard)) return true;
  return Boolean(htmlToText(specMiscHtml(specs)));
}
