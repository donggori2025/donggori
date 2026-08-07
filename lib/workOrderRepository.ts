import type { AuthResult } from "./authHelpers";
import {
  isWorkOrderMockEnabled,
  mockAddMessage,
  mockCreateWorkOrder,
  mockGetWorkOrderById,
  mockListFactoryNotifications,
  mockListMessages,
  mockListPayments,
  mockListWorkOrders,
  mockMarkFactoryNotificationsRead,
  mockRunAction,
} from "./workOrderMockStore";
import { getQuickDeliveryBankInfo } from "./workOrderBankInfo";
import {
  appendSystemMessage,
  createFactoryNotification,
  ensurePaymentRecord,
  getWorkOrderSupabase,
  isWorkOrderSchemaMissing,
  updateWorkOrderStatus,
} from "./workOrderServer";
import type {
  FactoryNotification,
  WorkOrderMessage,
  WorkOrderPayment,
  WorkOrderRecord,
} from "./workOrderTypes";
import { canRunAction, resolveStatusAfterAction, type WorkOrderAction } from "./workOrderWorkflow";

let dbUnavailable = false;

type WorkOrderListResult = { data: WorkOrderRecord[]; mock: boolean };
type WorkOrderSingleResult = { data: WorkOrderRecord; mock: boolean };

function useMockStore() {
  return isWorkOrderMockEnabled() || dbUnavailable;
}

export async function listWorkOrders(
  auth: AuthResult,
  filters: { factoryId?: string | null; userEmail?: string | null }
): Promise<WorkOrderListResult> {
  if (useMockStore()) {
    return {
      data: mockListWorkOrders({
        factoryId:
          auth.role === "factory" ? auth.userId || filters.factoryId || undefined : filters.factoryId || undefined,
        userEmail: auth.role === "user" ? auth.email : filters.userEmail || undefined,
        userId: auth.role === "user" ? auth.userId : undefined,
      }),
      mock: true,
    };
  }

  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");

  let query = supabase.from("work_orders").select("*").order("created_at", { ascending: false });
  if (auth.role === "factory") query = query.eq("factory_id", auth.userId || filters.factoryId || "");
  else if (auth.role === "user") {
    if (auth.email) query = query.eq("user_email", auth.email);
    else if (auth.userId) query = query.eq("user_id", auth.userId);
  } else {
    if (filters.factoryId) query = query.eq("factory_id", filters.factoryId);
    if (filters.userEmail) query = query.eq("user_email", filters.userEmail);
  }

  const { data, error } = await query;
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return listWorkOrders(auth, filters);
  }
  if (error) throw new Error(error.message);
  return { data: (data || []) as WorkOrderRecord[], mock: false };
}

export async function getWorkOrderById(id: string): Promise<WorkOrderSingleResult> {
  if (useMockStore()) {
    const order = mockGetWorkOrderById(id);
    if (!order) throw new Error("작업지시서를 찾을 수 없습니다.");
    return { data: order, mock: true };
  }

  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const { data, error } = await supabase.from("work_orders").select("*").eq("id", id).maybeSingle();
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return getWorkOrderById(id);
  }
  if (error) throw new Error(error.message);
  if (!data) throw new Error("작업지시서를 찾을 수 없습니다.");
  return { data: data as WorkOrderRecord, mock: false };
}

export async function createWorkOrderRecord(
  body: Record<string, unknown>,
  auth: AuthResult
) {
  if (useMockStore()) {
    const order = mockCreateWorkOrder({
      match_request_id: body.match_request_id as string | undefined,
      user_id: (body.user_id as string) || auth.userId || null,
      user_email: String(body.user_email),
      user_name: String(body.user_name),
      factory_id: String(body.factory_id),
      factory_name: String(body.factory_name),
      title: body.title as string | undefined,
      description: body.description as string | undefined,
      work_order_json: (body.work_order_json as Record<string, unknown>) || {},
      amount: Number(body.amount || 0),
      quick_delivery_fee: Number(body.quick_delivery_fee || process.env.QUICK_DELIVERY_FEE || 15000),
      initial_message: body.initial_message as string | undefined,
    });
    return { data: order, mock: true };
  }

  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      match_request_id: body.match_request_id || null,
      user_id: body.user_id || auth.userId || null,
      user_email: body.user_email,
      user_name: body.user_name,
      factory_id: String(body.factory_id),
      factory_name: body.factory_name,
      title: body.title || "작업지시서",
      description: body.description || "",
      work_order_json: body.work_order_json || {},
      amount: Number(body.amount || 0),
      status: "work_order_sent",
      quick_delivery_fee: Number(body.quick_delivery_fee || process.env.QUICK_DELIVERY_FEE || 15000),
      factory_notified_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return createWorkOrderRecord(body, auth);
  }
  if (error) throw new Error(error.message);

  const order = data as WorkOrderRecord;
  if (body.initial_message) {
    await supabase.from("work_order_messages").insert({
      work_order_id: order.id,
      sender_role: "user",
      sender_id: body.user_id || auth.userId || null,
      sender_name: body.user_name,
      message: String(body.initial_message).trim(),
      include_work_order: true,
    });
  }
  await appendSystemMessage(
    supabase,
    order.id,
    "작업지시서가 전달되었습니다. 공장에서 확인 후 채팅으로 협의를 진행합니다.",
    true
  );
  await createFactoryNotification(supabase, {
    factory_id: order.factory_id,
    work_order_id: order.id,
    title: "새 작업지시서 도착",
    body: `${order.user_name}님의 작업지시서가 도착했습니다.`,
  });
  return { data: order, mock: false };
}

export async function listWorkOrderMessages(orderId: string) {
  if (useMockStore()) {
    return { data: mockListMessages(orderId), mock: true };
  }
  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const { data, error } = await supabase
    .from("work_order_messages")
    .select("*")
    .eq("work_order_id", orderId)
    .order("created_at", { ascending: true });
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return listWorkOrderMessages(orderId);
  }
  if (error) throw new Error(error.message);
  return { data: (data || []) as WorkOrderMessage[], mock: false };
}

export async function addWorkOrderMessage(
  order: WorkOrderRecord,
  auth: AuthResult,
  body: Record<string, unknown>
) {
  const message = String(body.message || "").trim();
  if (!message) throw new Error("메시지를 입력해 주세요.");

  if (useMockStore()) {
    const data = mockAddMessage(order.id, {
      sender_role: auth.role === "factory" ? "factory" : auth.role === "admin" ? "admin" : "user",
      sender_id: auth.userId || null,
      sender_name: (body.sender_name as string) || (body.senderName as string) || null,
      message,
      include_work_order: Boolean(body.include_work_order),
    });
    return { data, mock: true };
  }

  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const senderRole = auth.role === "factory" ? "factory" : auth.role === "admin" ? "admin" : "user";
  const { data, error } = await supabase
    .from("work_order_messages")
    .insert({
      work_order_id: order.id,
      sender_role: senderRole,
      sender_id: auth.userId || null,
      sender_name: (body.sender_name as string) || (body.senderName as string) || null,
      message,
      include_work_order: Boolean(body.include_work_order),
      attachments: body.attachments || [],
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (order.status === "factory_received" || order.status === "revision_requested") {
    await updateWorkOrderStatus(supabase, order.id, "in_discussion");
  }
  return { data: data as WorkOrderMessage, mock: false };
}

export async function listWorkOrderPayments(order: WorkOrderRecord) {
  if (useMockStore()) {
    return { data: mockListPayments(order.id, order), mock: true };
  }
  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  if (order.status === "awaiting_order_payment" || order.status === "order_payment_submitted") {
    await ensurePaymentRecord(supabase, order.id, "order", order.amount);
  }
  if (order.status === "awaiting_quick_payment" || order.status === "quick_payment_submitted") {
    await ensurePaymentRecord(supabase, order.id, "quick_delivery", order.quick_delivery_fee);
  }
  const { data, error } = await supabase
    .from("work_order_payments")
    .select("*")
    .eq("work_order_id", order.id)
    .order("created_at", { ascending: true });
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return listWorkOrderPayments(order);
  }
  if (error) throw new Error(error.message);
  return { data: (data || []) as WorkOrderPayment[], mock: false };
}

export async function runWorkOrderActionRecord(
  order: WorkOrderRecord,
  auth: AuthResult,
  body: Record<string, unknown>
) {
  const action = body.action as WorkOrderAction;
  if (useMockStore()) {
    const data = mockRunAction(order.id, action, {
      productionType: body.productionType as "sample" | "production" | undefined,
      deliveryMethod: body.deliveryMethod as "pickup" | "quick" | undefined,
      depositorName: body.depositorName as string | undefined,
      message: body.message as string | undefined,
      senderName: body.senderName as string | undefined,
      senderRole: auth.role === "factory" ? "factory" : auth.role === "admin" ? "admin" : "user",
      senderId: auth.userId || null,
    });
    return { data, mock: true };
  }

  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  if (!canRunAction(order.status, action)) {
    throw new Error(`현재 상태에서는 ${action} 작업을 할 수 없습니다.`);
  }

  const nextStatus = resolveStatusAfterAction(action, order.status, {
    productionType: body.productionType as "sample" | "production" | undefined,
    deliveryMethod: body.deliveryMethod as "pickup" | "quick" | undefined,
  });

  const extra: Record<string, unknown> = {};
  if (action === "factory_acknowledge") extra.factory_read_at = new Date().toISOString();
  if (action === "user_choose_production_type" && body.productionType) {
    extra.production_type = body.productionType;
  }
  if (action === "factory_choose_production_type" && body.productionType) {
    extra.production_type = body.productionType;
  }
  if (action === "user_choose_delivery" && body.deliveryMethod) {
    extra.delivery_method = body.deliveryMethod;
    if (body.deliveryMethod === "quick") extra.quick_delivery_fee = getQuickDeliveryBankInfo().fee;
  }
  if (action === "factory_complete_work") extra.completed_at = new Date().toISOString();
  if (action === "user_confirm_purchase" || action === "factory_confirm_purchase") {
    extra.purchase_confirmed_at = new Date().toISOString();
  }
  if (action === "factory_advance_pickup") extra.delivery_method = "pickup";
  if (action === "factory_advance_quick") {
    extra.delivery_method = "quick";
    extra.quick_delivery_fee = getQuickDeliveryBankInfo().fee;
  }

  const updated = await updateWorkOrderStatus(supabase, order.id, nextStatus, extra);

  if (action === "user_approve_review") {
    await ensurePaymentRecord(supabase, order.id, "order", updated.amount);
    await appendSystemMessage(supabase, order.id, "검토가 승인되었습니다. 작업 대금을 입금해 주세요.");
  }
  if (action === "factory_advance_to_payment") {
    await ensurePaymentRecord(supabase, order.id, "order", updated.amount);
    await appendSystemMessage(
      supabase,
      order.id,
      "작업 대금 입금 안내가 전달되었습니다. 계좌 정보를 확인해 주세요."
    );
  }
  if (action === "admin_confirm_order_payment" || action === "factory_confirm_order_payment") {
    await supabase
      .from("work_order_payments")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: auth.userId || "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("work_order_id", order.id)
      .eq("payment_type", "order");
    await appendSystemMessage(
      supabase,
      order.id,
      "작업 대금 입금이 확인되었습니다. 샘플/본작업 유형을 선택해 주세요."
    );
  }
  if (action === "user_choose_delivery" && body.deliveryMethod === "quick") {
    await ensurePaymentRecord(supabase, order.id, "quick_delivery", updated.quick_delivery_fee);
    await appendSystemMessage(
      supabase,
      order.id,
      `퀵 배송을 선택했습니다. 배송비 ${updated.quick_delivery_fee.toLocaleString()}원을 입금해 주세요.`
    );
  }
  if (action === "factory_advance_quick") {
    await ensurePaymentRecord(supabase, order.id, "quick_delivery", updated.quick_delivery_fee);
    await appendSystemMessage(
      supabase,
      order.id,
      `퀵 배송 안내가 전달되었습니다. 배송비 ${updated.quick_delivery_fee.toLocaleString()}원을 입금해 주세요.`
    );
  }
  if (action === "factory_advance_pickup") {
    await appendSystemMessage(
      supabase,
      order.id,
      "직접 방문 수령이 가능합니다. 방문 일정을 채팅으로 안내해 주세요."
    );
  }
  if (action === "factory_choose_production_type" && body.productionType) {
    await appendSystemMessage(
      supabase,
      order.id,
      body.productionType === "sample" ? "샘플 작업을 시작합니다." : "본작업을 시작합니다."
    );
  }
  if (action === "user_submit_quick_payment") {
    await supabase
      .from("work_order_payments")
      .update({
        status: "submitted",
        depositor_name: body.depositorName || "",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("work_order_id", order.id)
      .eq("payment_type", "quick_delivery");
    await appendSystemMessage(supabase, order.id, "퀵 배송비 입금이 접수되었습니다. 확인 후 발송됩니다.");
  }
  if (action === "user_submit_order_payment") {
    await supabase
      .from("work_order_payments")
      .update({
        status: "submitted",
        depositor_name: body.depositorName || "",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("work_order_id", order.id)
      .eq("payment_type", "order");
    await appendSystemMessage(supabase, order.id, "작업 대금 입금이 접수되었습니다. 확인 후 작업이 시작됩니다.");
  }
  if (action === "admin_confirm_quick_payment" || action === "factory_confirm_quick_payment") {
    await supabase
      .from("work_order_payments")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: auth.userId || "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("work_order_id", order.id)
      .eq("payment_type", "quick_delivery");
    await appendSystemMessage(supabase, order.id, "퀵 배송비 입금이 확인되었습니다. 곧 발송됩니다.");
  }

  if (body.message) {
    await supabase.from("work_order_messages").insert({
      work_order_id: order.id,
      sender_role: auth.role === "factory" ? "factory" : auth.role === "admin" ? "admin" : "user",
      sender_id: auth.userId || null,
      sender_name: body.senderName || null,
      message: String(body.message).trim(),
    });
  }

  return { data: updated, mock: false };
}

export async function listFactoryNotificationRecords(factoryId: string) {
  if (useMockStore()) {
    return { data: mockListFactoryNotifications(factoryId), mock: true };
  }
  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const { data, error } = await supabase
    .from("factory_notifications")
    .select("*")
    .eq("factory_id", factoryId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return listFactoryNotificationRecords(factoryId);
  }
  if (error) throw new Error(error.message);
  return { data: (data || []) as FactoryNotification[], mock: false };
}

export async function markFactoryNotificationRecordsRead(factoryId: string, ids?: string[]) {
  if (useMockStore()) {
    mockMarkFactoryNotificationsRead(factoryId, ids);
    return { mock: true };
  }
  const supabase = getWorkOrderSupabase();
  if (!supabase) throw new Error("서버 설정 오류");
  const now = new Date().toISOString();
  let query = supabase
    .from("factory_notifications")
    .update({ read_at: now })
    .eq("factory_id", factoryId)
    .is("read_at", null);
  if (ids?.length) query = query.in("id", ids);
  const { error } = await query;
  if (error && isWorkOrderSchemaMissing(error)) {
    dbUnavailable = true;
    return markFactoryNotificationRecordsRead(factoryId, ids);
  }
  if (error) throw new Error(error.message);
  return { mock: false };
}
