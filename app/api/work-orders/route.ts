import { NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessWorkOrder } from "@/lib/workOrderAuth";
import { createWorkOrderRecord, listWorkOrders } from "@/lib/workOrderRepository";
import type { WorkOrderRecord } from "@/lib/workOrderTypes";

export async function GET(req: Request) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  const userEmail = searchParams.get("userEmail");

  if (auth.role === "user" && !auth.email && !auth.userId) {
    return unauthorized();
  }

  try {
    const { data, mock } = await listWorkOrders(auth, { factoryId, userEmail });
    const rows = data.filter((row: WorkOrderRecord) => canAccessWorkOrder(auth, row));
    return NextResponse.json({ success: true, data: rows, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "작업지시서 목록 조회에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getRequestAuth();
  if (!auth.authenticated || (auth.role !== "user" && auth.role !== "admin")) {
    return unauthorized("사용자만 작업지시서를 생성할 수 있습니다.");
  }

  const body = await req.json();
  const required = ["user_email", "user_name", "factory_id", "factory_name"];
  const missing = required.filter((key) => !body?.[key]);
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `필수 필드 누락: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { data, mock } = await createWorkOrderRecord(body, auth);
    return NextResponse.json({ success: true, data, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "작업지시서 생성에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
