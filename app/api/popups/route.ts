import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import type { PopupItem } from "@/lib/types";
import { dedupePopups } from "@/lib/popupList";

const PUBLIC_POPUP_SELECT = "id,slug,title,content,image_url,link_url,link_url_mobile,start_at,end_at,is_active,sort_order,created_at";

function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !/[\r\n]/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function toPublicPopup(row: Record<string, unknown>): PopupItem {
  return {
    id: String(row.id),
    slug: typeof row.slug === "string" ? row.slug : undefined,
    title: typeof row.title === "string" ? row.title : undefined,
    content: typeof row.content === "string" ? row.content : undefined,
    image_url: safeImageUrl(row.image_url),
    link_url: safeHttpUrl(row.link_url),
    link_url_mobile: safeHttpUrl(row.link_url_mobile),
    start_at: typeof row.start_at === "string" ? row.start_at : undefined,
    end_at: typeof row.end_at === "string" ? row.end_at : undefined,
    is_active: row.is_active !== false,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : undefined,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
  };
}

function isPopupActive(popup: PopupItem, now: Date) {
  if (popup.is_active === false) return false;
  const start = popup.start_at ? new Date(popup.start_at) : null;
  const end = popup.end_at ? new Date(popup.end_at) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export async function GET() {
  const now = new Date();
  const supabase = getServiceSupabase();

  const query = supabase.from("popups").select(PUBLIC_POPUP_SELECT);
  const { data, error } = await query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    if (fallback.error) {
      console.error("Failed to load public popups", fallback.error);
      return NextResponse.json({ success: false, error: "팝업을 불러오지 못했습니다." }, { status: 500 });
    }
    const filtered = (fallback.data || [])
      .map((row: Record<string, unknown>) => toPublicPopup(row))
      .filter((popup: PopupItem) => isPopupActive(popup, now));
    return NextResponse.json({ success: true, data: dedupePopups(filtered) });
  }

  const filtered = dedupePopups(
    (data || [])
      .map((row: Record<string, unknown>) => toPublicPopup(row))
      .filter((popup: PopupItem) => isPopupActive(popup, now))
  );
  return NextResponse.json({ success: true, data: filtered });
}
