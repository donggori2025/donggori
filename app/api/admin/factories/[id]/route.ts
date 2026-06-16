import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";

type AllowedValue = string | number | boolean | null | string[];

function sanitizeFactoryPatch(input: unknown): Record<string, AllowedValue> {
  const body = (input && typeof input === "object" ? (input as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const allowedKeys = new Set<string>([
    "company_name",
    "name",
    "address",
    "business_type",
    "phone_number",
    "contact",
    "contact_name",
    "email",
    "admin_district",
    "intro",
    "factory_type",
    "main_fabrics",
    "distribution",
    "delivery",
    "equipment",
    "sewing_machines",
    "pattern_machines",
    "special_machines",
    "processes",
    "top_items_upper",
    "top_items_lower",
    "top_items_outer",
    "top_items_dress_skirt",
    "top_items_bag",
    "top_items_fashion_accessory",
    "top_items_underwear",
    "top_items_sports_leisure",
    "top_items_pet",
    "items",
    "kakao_url",
    "image",
    "images",
    "lat",
    "lng",
    "moq",
    "minOrder",
    "monthly_capacity",
    "monthlyCapacity",
    "established_year",
    "establishedYear",
  ]);

  const out: Record<string, AllowedValue> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!allowedKeys.has(k)) continue;
    if (v === undefined) continue;

    if (k === "images") {
      if (Array.isArray(v)) {
        out[k] = v.map((x) => String(x)).filter((x) => x.length > 0);
      } else if (typeof v === "string" && v.length > 0) {
        out[k] = [v];
      }
      continue;
    }

    if (k === "lat" || k === "lng" || k === "moq" || k === "minOrder" || k === "monthly_capacity" || k === "monthlyCapacity" || k === "established_year" || k === "establishedYear") {
      const num = typeof v === "number" ? v : Number(String(v));
      if (!Number.isNaN(num)) out[k] = num;
      continue;
    }

    if (v === null) out[k] = null;
    else out[k] = String(v);
  }

  return out;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const patch = sanitizeFactoryPatch(body);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, error: "수정할 데이터가 없습니다." }, { status: 400 });
  }
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("donggori")
    .update(patch)
    .eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("donggori").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


