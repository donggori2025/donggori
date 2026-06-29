import type { SupabaseClient } from "@supabase/supabase-js";

type PopupRow = Record<string, unknown>;

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes(column.toLowerCase()) && (lower.includes("column") || lower.includes("schema"));
}

/** link_url 컬럼이 없는 DB에서도 팝업 저장 가능 */
export async function insertPopupRow(supabase: SupabaseClient, row: PopupRow) {
  const payload = {
    ...row,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("popups").insert(payload);
  if (error) {
    const optionalCols = ["link_url", "link_url_mobile", "slug", "sort_order"] as const;
    let fallback: PopupRow = { ...payload };
    for (const col of optionalCols) {
      if (isMissingColumnError(error.message, col) && col in fallback) {
        const { [col]: _removed, ...rest } = fallback;
        fallback = rest;
        ({ error } = await supabase.from("popups").insert(fallback));
        if (!error) break;
      }
    }
  }
  return error;
}

export async function updatePopupRow(supabase: SupabaseClient, id: string, row: PopupRow) {
  const payload = { ...row, updated_at: new Date().toISOString() };

  let { error } = await supabase.from("popups").update(payload).eq("id", id);
  if (error) {
    const optionalCols = ["link_url", "link_url_mobile", "slug", "sort_order"] as const;
    let fallback: PopupRow = { ...payload };
    for (const col of optionalCols) {
      if (isMissingColumnError(error.message, col) && col in fallback) {
        const { [col]: _removed, ...rest } = fallback;
        fallback = rest;
        ({ error } = await supabase.from("popups").update(fallback).eq("id", id));
        if (!error) break;
      }
    }
  }
  return error;
}
