import type {
  DeliveryMethod,
  FactoryNotification,
  ProductionType,
  WorkOrderMessage,
  WorkOrderPayment,
  WorkOrderRecord,
} from "./workOrderTypes";
import type { WorkOrderAction } from "./workOrderWorkflow";

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok && json.success === false && !json.setupRequired) {
    throw new Error(json.error || json.message || "요청에 실패했습니다.");
  }
  return json as T;
}

export async function getWorkOrders(params?: {
  factoryId?: string;
  userEmail?: string;
}): Promise<WorkOrderRecord[]> {
  const search = new URLSearchParams();
  if (params?.factoryId) search.set("factoryId", params.factoryId);
  if (params?.userEmail) search.set("userEmail", params.userEmail);
  const res = await fetch(`/api/work-orders?${search.toString()}`, { credentials: "include" });
  const json = await parseJson<{ data: WorkOrderRecord[] }>(res);
  return json.data || [];
}

export async function getWorkOrderById(id: string): Promise<WorkOrderRecord | null> {
  const res = await fetch(`/api/work-orders/${id}`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) {
    if (res.status === 404) return null;
    if (json.success === false && !json.setupRequired) {
      throw new Error(json.error || json.message || "요청에 실패했습니다.");
    }
    return null;
  }
  return (json as { data?: WorkOrderRecord }).data || null;
}

export async function createWorkOrder(input: {
  match_request_id?: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  factory_id: string;
  factory_name: string;
  title?: string;
  description?: string;
  work_order_json?: Record<string, unknown>;
  amount?: number;
  initial_message?: string;
}): Promise<WorkOrderRecord> {
  const res = await fetch("/api/work-orders", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || "작업지시서 생성에 실패했습니다.");
  }
  if (!json.data) {
    throw new Error("작업지시서 생성에 실패했습니다.");
  }
  return json.data as WorkOrderRecord;
}

export async function runWorkOrderAction(
  id: string,
  action: WorkOrderAction,
  payload?: {
    message?: string;
    productionType?: ProductionType;
    deliveryMethod?: DeliveryMethod;
    depositorName?: string;
    senderName?: string;
  }
): Promise<WorkOrderRecord> {
  const res = await fetch(`/api/work-orders/${id}/actions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await parseJson<{ data: WorkOrderRecord }>(res);
  return json.data;
}

export async function getWorkOrderMessages(id: string): Promise<WorkOrderMessage[]> {
  const res = await fetch(`/api/work-orders/${id}/messages`, { credentials: "include" });
  const json = await parseJson<{ data: WorkOrderMessage[] }>(res);
  return json.data || [];
}

export async function sendWorkOrderMessage(
  id: string,
  message: string,
  includeWorkOrder = false,
  senderName?: string
): Promise<WorkOrderMessage> {
  const res = await fetch(`/api/work-orders/${id}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      include_work_order: includeWorkOrder,
      senderName,
    }),
  });
  const json = await parseJson<{ data: WorkOrderMessage }>(res);
  return json.data;
}

export async function getWorkOrderPayments(id: string): Promise<WorkOrderPayment[]> {
  const res = await fetch(`/api/work-orders/${id}/payments`, { credentials: "include" });
  const json = await parseJson<{ data: WorkOrderPayment[] }>(res);
  return json.data || [];
}

export async function getFactoryNotifications(factoryId: string): Promise<FactoryNotification[]> {
  const res = await fetch(`/api/factory/notifications?factoryId=${encodeURIComponent(factoryId)}`, {
    credentials: "include",
  });
  const json = await parseJson<{ data: FactoryNotification[] }>(res);
  return json.data || [];
}

export async function markFactoryNotificationsRead(factoryId: string, ids?: string[]) {
  const res = await fetch("/api/factory/notifications", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ factoryId, ids }),
  });
  await parseJson(res);
}
