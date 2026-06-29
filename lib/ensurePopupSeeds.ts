import type { SupabaseClient } from "@supabase/supabase-js";
import { POPUP_SEEDS } from "@/lib/popupSeeds";
import { insertPopupRow } from "@/lib/adminPopupDb";

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes(column.toLowerCase()) && (lower.includes("column") || lower.includes("schema"));
}

/** slug 기준으로 기본 팝업이 없으면 DB에 등록 */
export async function ensurePopupSeeds(supabase: SupabaseClient): Promise<void> {
  for (const seed of POPUP_SEEDS) {
    const { data: bySlug, error: slugError } = await supabase
      .from("popups")
      .select("id")
      .eq("slug", seed.slug)
      .maybeSingle();

    if (!slugError && bySlug) continue;

    if (slugError && isMissingColumnError(slugError.message, "slug")) {
      // slug 컬럼 없음: 제목+이미지로 중복 확인
      const { data: byTitle } = await supabase
        .from("popups")
        .select("id")
        .eq("title", seed.title)
        .eq("image_url", seed.image_url)
        .maybeSingle();
      if (byTitle) continue;
    } else if (slugError) {
      console.error("[ensurePopupSeeds] slug lookup failed:", slugError.message);
      continue;
    }

    const row: Record<string, unknown> = {
      slug: seed.slug,
      title: seed.title,
      content: seed.content ?? null,
      image_url: seed.image_url,
      link_url: seed.link_url ?? null,
      link_url_mobile: seed.link_url_mobile ?? null,
      start_at: seed.start_at ?? null,
      end_at: seed.end_at ?? null,
      sort_order: seed.sort_order ?? 0,
      is_active: true,
    };

    const error = await insertPopupRow(supabase, row);
    if (error) {
      console.error(`[ensurePopupSeeds] insert failed (${seed.slug}):`, error.message);
    }
  }
}
