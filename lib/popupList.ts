import type { PopupItem } from "@/lib/types";

/** slug/이미지 기준 중복 제거 (목록 표시용) */
export function dedupePopups(popups: PopupItem[]): PopupItem[] {
  const seen = new Set<string>();
  const result: PopupItem[] = [];
  for (const popup of popups) {
    const key = popup.slug || popup.image_url || popup.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(popup);
  }
  return result;
}

export function popupDedupeKey(popup: PopupItem): string {
  return popup.slug || popup.image_url || popup.id;
}
