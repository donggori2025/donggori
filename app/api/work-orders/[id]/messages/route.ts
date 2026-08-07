import { NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessWorkOrder } from "@/lib/workOrderAuth";
import {
  addWorkOrderMessage,
  getWorkOrderById,
  listWorkOrderMessages,
} from "@/lib/workOrderRepository";
import type { WorkOrderRecord } from "@/lib/workOrderTypes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { id } = await context.params;

  try {
    const { data: order } = await getWorkOrderById(id);
    if (!canAccessWorkOrder(auth, order as WorkOrderRecord)) return unauthorized();

    const { data, mock } = await listWorkOrderMessages(id);
    return NextResponse.json({ success: true, data, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "메시지 조회에 실패했습니다.";
    const status = message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: Request, context: RouteContext) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { id } = await context.params;
  const body = await req.json();

  try {
    const { data: order } = await getWorkOrderById(id);
    if (!canAccessWorkOrder(auth, order as WorkOrderRecord)) return unauthorized();

    const { data, mock } = await addWorkOrderMessage(order, auth, body);
    return NextResponse.json({ success: true, data, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "메시지 전송에 실패했습니다.";
    const status = message.includes("입력") ? 400 : message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
