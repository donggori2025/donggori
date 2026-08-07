import { NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessWorkOrder } from "@/lib/workOrderAuth";
import { getWorkOrderById } from "@/lib/workOrderRepository";
import type { WorkOrderRecord } from "@/lib/workOrderTypes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { id } = await context.params;

  try {
    const { data, mock } = await getWorkOrderById(id);
    if (!canAccessWorkOrder(auth, data as WorkOrderRecord)) {
      return unauthorized("접근 권한이 없습니다.");
    }
    return NextResponse.json({ success: true, data, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "작업지시서 조회에 실패했습니다.";
    const status = message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
