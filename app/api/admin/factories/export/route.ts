import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { buildFactoriesCsv, factoriesExportFilename } from "@/lib/factoryExcelExport";

async function fetchAllFactories() {
  const supabase = getServiceSupabase();
  const pageSize = 1000;
  let from = 0;
  const all: Record<string, unknown>[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .neq("company_name", "희망사")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const factories = await fetchAllFactories();
    const buffer = buildFactoriesCsv(factories);
    const filename = factoriesExportFilename();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "CSV 생성 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
