import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  let body: { ids?: unknown; all?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (body.all === true) {
    const { data, error: selectError } = await supabase.from("popups").select("id");
    if (selectError) {
      return NextResponse.json({ success: false, error: selectError.message }, { status: 500 });
    }
    const allIds = (data ?? []).map((row: { id: string }) => row.id).filter(isValidUuid);
    if (allIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }
    const { error } = await supabase.from("popups").delete().in("id", allIds);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: allIds.length });
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ success: false, error: "ids 배열 또는 all: true 가 필요합니다." }, { status: 400 });
  }

  const ids = body.ids.filter(isValidUuid);
  if (ids.length === 0) {
    return NextResponse.json({ success: false, error: "삭제할 항목이 없습니다." }, { status: 400 });
  }

  const { error } = await supabase.from("popups").delete().in("id", ids);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, deleted: ids.length });
}
