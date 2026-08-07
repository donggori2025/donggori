import { NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessWorkOrder, canRunAdminPaymentAction } from "@/lib/workOrderAuth";
import { getWorkOrderById, runWorkOrderActionRecord } from "@/lib/workOrderRepository";
import type { WorkOrderRecord } from "@/lib/workOrderTypes";
import { canRunAction, type WorkOrderAction } from "@/lib/workOrderWorkflow";

type RouteContext = { params: Promise<{ id: string }> };

const FACTORY_ACTIONS = new Set<WorkOrderAction>([
  "factory_acknowledge",
  "factory_request_review",
  "factory_advance_to_payment",
  "factory_confirm_order_payment",
  "factory_choose_production_type",
  "factory_confirm_quick_payment",
  "factory_advance_pickup",
  "factory_advance_quick",
  "factory_confirm_purchase",
  "factory_start_work",
  "factory_complete_work",
  "factory_dispatch_quick",
  "factory_ready_pickup",
]);

const USER_ACTIONS = new Set<WorkOrderAction>([
  "user_request_revision",
  "user_approve_review",
  "user_choose_production_type",
  "user_choose_delivery",
  "user_submit_quick_payment",
  "user_submit_order_payment",
  "user_confirm_purchase",
  "cancel",
]);

const ADMIN_ACTIONS = new Set<WorkOrderAction>([
  "admin_confirm_quick_payment",
  "admin_confirm_order_payment",
]);

function assertRoleAction(authRole: string | undefined, action: WorkOrderAction) {
  if (authRole === "admin") return;
  if (authRole === "factory" && FACTORY_ACTIONS.has(action)) return;
  if (authRole === "user" && USER_ACTIONS.has(action)) return;
  throw new Error("이 작업을 수행할 권한이 없습니다.");
}

export async function POST(req: Request, context: RouteContext) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { id } = await context.params;
  const body = await req.json();
  const action = body.action as WorkOrderAction;
  if (!action) {
    return NextResponse.json({ success: false, error: "action이 필요합니다." }, { status: 400 });
  }

  try {
    const { data: order } = await getWorkOrderById(id);
    if (!canAccessWorkOrder(auth, order as WorkOrderRecord)) {
      return unauthorized("접근 권한이 없습니다.");
    }

    assertRoleAction(auth.role, action);
    if (ADMIN_ACTIONS.has(action) && !canRunAdminPaymentAction(auth)) {
      return unauthorized("관리자만 입금을 확인할 수 있습니다.");
    }

    const current = order as WorkOrderRecord;
    if (!canRunAction(current.status, action)) {
      return NextResponse.json(
        { success: false, error: `현재 상태에서는 ${action} 작업을 할 수 없습니다.` },
        { status: 400 }
      );
    }

    const { data, mock } = await runWorkOrderActionRecord(current, auth, body);
    return NextResponse.json({ success: true, data, mock });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "작업 처리 중 오류가 발생했습니다.";
    const status = message.includes("찾을 수 없습니다") ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
