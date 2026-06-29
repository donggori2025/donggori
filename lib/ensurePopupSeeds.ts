import type { SupabaseClient } from "@supabase/supabase-js";
import { POPUP_SEEDS } from "@/lib/popupSeeds";
import { insertPopupRow, updatePopupRow } from "@/lib/adminPopupDb";
import { popupDedupeKey } from "@/lib/popupList";
import type { PopupItem } from "@/lib/types";

type SeedRow = {
  id: string;
  title?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  link_url_mobile?: string | null;
  slug?: string | null;
};

async function findExistingSeed(
  supabase: SupabaseClient,
  seed: (typeof POPUP_SEEDS)[number]
): Promise<SeedRow | null> {
  const queries = [
    () => supabase.from("popups").select("*").eq("slug", seed.slug).limit(1),
    () =>
      supabase
        .from("popups")
        .select("*")
        .eq("title", seed.title)
        .eq("image_url", seed.image_url)
        .limit(1),
    () => supabase.from("popups").select("*").eq("image_url", seed.image_url).limit(1),
  ];

  for (const run of queries) {
    const { data, error } = await run();
    if (!error && data?.[0]) return data[0] as SeedRow;
  }

  return null;
}

/** 기본 팝업 수동 등록 전용 — 자동 호출 금지 */
export async function ensurePopupSeeds(supabase: SupabaseClient): Promise<void> {
  for (const seed of POPUP_SEEDS) {
    const existing = await findExistingSeed(supabase, seed);

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (seed.slug && !existing.slug) patch.slug = seed.slug;
      if (seed.link_url && !existing.link_url) patch.link_url = seed.link_url;
      if (seed.link_url_mobile && !existing.link_url_mobile) patch.link_url_mobile = seed.link_url_mobile;
      if (Object.keys(patch).length === 0) continue;

      const error = await updatePopupRow(supabase, existing.id, patch);
      if (error) {
        console.error(`[ensurePopupSeeds] backfill failed (${seed.slug}):`, error.message);
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

/** 동일 slug/이미지 중복 행 삭제 (가장 오래된 1건만 유지) */
export async function removeDuplicatePopups(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data?.length) return 0;

  const seenKeys = new Set<string>();
  const toDelete: string[] = [];

  for (const row of data as PopupItem[]) {
    const key = popupDedupeKey(row);
    if (seenKeys.has(key)) {
      toDelete.push(row.id);
    } else {
      seenKeys.add(key);
    }
  }

  if (toDelete.length === 0) return 0;

  const { data: deleted, error: deleteError } = await supabase
    .from("popups")
    .delete()
    .in("id", toDelete)
    .select("id");

  if (deleteError) throw deleteError;
  return deleted?.length ?? 0;
}
