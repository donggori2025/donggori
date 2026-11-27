import { readPreviewFactoryList, isPublicFactoryPreview } from "@/lib/publicFactoryPreview";
import { FACTORY_LIST_TAG } from "@/lib/factoryCatalog";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { mapPublicFactoryRows, PUBLIC_FACTORY_SELECT } from "@/lib/factoryPrivacy";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const readFactoryList = unstable_cache(async () => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("공장 데이터베이스 설정 오류");

  const primary = await supabase
    .from("donggori")
    .select(PUBLIC_FACTORY_SELECT)
    .order("id", { ascending: true });

  const fallback = primary.error?.code === "42703"
    ? await supabase.from("donggori").select("*").order("id", { ascending: true })
    : null;
  const data = fallback?.data ?? primary.data;
  const error = fallback ? fallback.error : primary.error;

  if (error) {
    console.error("[factories] public query failed", { code: error.code, message: error.message });
    throw new Error("공장 목록 조회 실패");
  }

  return mapPublicFactoryRows((data || []) as unknown as Record<string, unknown>[]);
}, [FACTORY_LIST_TAG, process.env.NEXT_PUBLIC_SUPABASE_URL || ""], { tags: [FACTORY_LIST_TAG], revalidate: 60 });

export function getPublicFactoryList(previewMaxStaleMs?: number) {
  return isPublicFactoryPreview() ? readPreviewFactoryList(previewMaxStaleMs) : readFactoryList();
}
