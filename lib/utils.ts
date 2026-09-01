import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDue(date: string) {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
}

export function toIsoDate(raw?: string) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return "";
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

export function specMiscHtml(specs: {
  misc?: string;
  packaging: { title: string; note: string }[];
}) {
  if (specs.misc && htmlToText(specs.misc)) return specs.misc;
  return specs.packaging
    .filter((p) => p.title.trim() || p.note.trim())
    .map((p) => {
      const title = escapeHtml(p.title.trim() || "기타");
      const note = escapeHtml(p.note.trim());
      return note ? `<p><strong>${title}</strong> — ${note}</p>` : `<p><strong>${title}</strong></p>`;
    })
    .join("");
}

export function recencyRank(label?: string) {
  if (!label) return 99;
  if (label.startsWith("방금")) return 0;
  if (label.startsWith("오늘")) return 1;
  if (label.startsWith("어제")) return 2;
  const days = label.match(/(\d+)일\s*전/);
  if (days) return 2 + Number(days[1]);
  const hours = label.match(/(\d+)시간\s*전/);
  if (hours) return 1;
  return 20;
}
