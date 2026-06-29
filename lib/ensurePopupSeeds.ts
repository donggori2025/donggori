import type { SupabaseClient } from "@supabase/supabase-js";
import { POPUP_SEEDS } from "@/lib/popupSeeds";
import { insertPopupRow, updatePopupRow } from "@/lib/adminPopupDb";

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes(column.toLowerCase()) && (lower.includes("column") || lower.includes("schema"));
}

async function findExistingSeed(
  supabase: SupabaseClient,
  seed: (typeof POPUP_SEEDS)[number]
): Promise<{ id: string; link_url?: string | null; link_url_mobile?: string | null } | null> {
  const { data: bySlug, error: slugError } = await supabase
    .from("popups")
    .select("id, link_url, link_url_mobile")
    .eq("slug", seed.slug)
    .maybeSingle();

  if (!slugError && bySlug) return bySlug;

  if (slugError && isMissingColumnError(slugError.message, "slug")) {
    const { data: byTitle } = await supabase
      .from("popups")
      .select("id, link_url, link_url_mobile")
      .eq("title", seed.title)
      .eq("image_url", seed.image_url)
      .maybeSingle();
    return byTitle;
  }

  if (slugError) {
    console.error("[ensurePopupSeeds] lookup failed:", slugError.message);
  }
  return null;
}

/** slug 기준으로 기본 팝업이 없으면 DB에 등록, 링크가 비어 있으면 보완 */
export async function ensurePopupSeeds(supabase: SupabaseClient): Promise<void> {
  for (const seed of POPUP_SEEDS) {
    const existing = await findExistingSeed(supabase, seed);

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (seed.link_url && !existing.link_url) patch.link_url = seed.link_url;
      if (seed.link_url_mobile && !existing.link_url_mobile) patch.link_url_mobile = seed.link_url_mobile;
      if (Object.keys(patch).length === 0) continue;

      const error = await updatePopupRow(supabase, existing.id, patch);
      if (error) {
        console.error(`[ensurePopupSeeds] link backfill failed (${seed.slug}):`, error.message);
      }
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
