import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";
import { sendAlimtalk, sendSMS } from "@/lib/messaging";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated) {
      return unauthorized("인증이 필요합니다.");
    }

    const workOrderId = params.id;
    if (!workOrderId) {
      return NextResponse.json({ ok: false, error: "id가 필요합니다." }, { status: 400 });
    }

    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: orderData, error } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", workOrderId)
      .single();

    if (error || !orderData) {
      return NextResponse.json(
        { ok: false, error: error?.message || "의뢰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let factoryPhone = orderData.factory_phone || orderData.factory_contact || null;
    if (!factoryPhone) {
      const { data: factoryRow } = await supabase
        .from("donggori")
        .select("phone_number, contact")
        .eq("id", orderData.factory_id)
        .maybeSingle();
      factoryPhone = (factoryRow?.phone_number || factoryRow?.contact || orderData.contact || "").toString();
    }

    const designerName = orderData.user_name || "디자이너";
    const designerPhone = orderData.contact || orderData.user_phone || "";
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/my-page/requests?id=${workOrderId}`;

    const digits = String(factoryPhone).replace(/[^0-9]/g, "");
    if (!digits || digits.length < 9) {
      try {
        await supabase.from("message_logs").insert([
          {
            work_order_id: String(workOrderId),
            channel: "ALIMTALK",
            to: String(factoryPhone || ""),
            payload: { reason: "NO_VALID_FACTORY_PHONE" },
            status: "FAILED",
            error: "공장 연락처가 없거나 유효하지 않습니다.",
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {}
      return NextResponse.json(
        { ok: false, error: "공장 연락처가 없거나 유효하지 않습니다." },
        { status: 400 }
      );
    }

    let desc = "";
    let details = "";
    try {
      const add =
        typeof orderData.additional_info === "string"
          ? JSON.parse(orderData.additional_info)
          : orderData.additional_info || {};
      desc = (add?.description || orderData.description || "").toString().slice(0, 300);
      details = (add?.request || add?.requests || add?.notes || "").toString().slice(0, 300);
    } catch {}

    const variables = {
      id: String(workOrderId),
      name: String(designerName),
      phone: String(designerPhone),
      shortUrl,
      desc,
      details,
    };

    const a = await sendAlimtalk(factoryPhone, "DG_REQUEST", variables);
    let finalChannel: "ALIMTALK" | "SMS" = "ALIMTALK";
    if (!a.ok) {
      await sendSMS(
        factoryPhone,
        `[동고리 의뢰] 의뢰ID ${variables.id}, 디자이너 ${variables.name}(${variables.phone}) 확인: ${variables.shortUrl}`
      );
      finalChannel = "SMS";
    }

    try {
      await supabase.from("message_logs").insert([
        {
          work_order_id: String(workOrderId),
          channel: finalChannel,
          to: String(factoryPhone),
          payload: { templateCode: "DG_REQUEST", variables },
          status: "SENT",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn("message_logs insert failed (non-blocking):", e);
    }

    await supabase
      .from("match_requests")
      .update({ status: "SENT", updated_at: new Date().toISOString() })
      .eq("id", workOrderId);

    return NextResponse.json({ ok: true, channel: a.ok ? "ALIMTALK" : "SMS" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed" }, { status: 500 });
  }
}
