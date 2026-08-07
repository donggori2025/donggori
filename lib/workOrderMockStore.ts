import { randomUUID } from "crypto";
import {
  getOrderBankInfo,
  getQuickDeliveryBankInfo,
} from "./workOrderBankInfo";
import type {
  FactoryNotification,
  PaymentType,
  WorkOrderMessage,
  WorkOrderPayment,
  WorkOrderRecord,
  WorkOrderStatus,
} from "./workOrderTypes";
import {
  canRunAction,
  resolveStatusAfterAction,
  type WorkOrderAction,
} from "./workOrderWorkflow";
import { seedDemoWorkOrdersIfEmpty } from "./workOrderMockSeed";
import { formatBankAccountMessage } from "./workOrderBankInfo";

type MockState = {
  orders: Map<string, WorkOrderRecord>;
  messages: Map<string, WorkOrderMessage[]>;
  payments: Map<string, WorkOrderPayment[]>;
  notifications: Map<string, FactoryNotification[]>;
  seeded?: boolean;
};

function getState(): MockState {
  const globalRef = globalThis as typeof globalThis & { __donggoriWorkOrderMock?: MockState };
  if (!globalRef.__donggoriWorkOrderMock) {
    globalRef.__donggoriWorkOrderMock = {
      orders: new Map(),
      messages: new Map(),
      payments: new Map(),
      notifications: new Map(),
    };
  }
  const state = globalRef.__donggoriWorkOrderMock;
  if (isWorkOrderMockEnabled() && !state.seeded) {
    seedDemoWorkOrdersIfEmpty(state);
    syncDemoPayments(state);
  }
  return state;
}

function syncDemoPayments(state: MockState) {
  for (const order of state.orders.values()) {
    if (order.status === "awaiting_order_payment" || order.status === "order_payment_submitted") {
      ensurePaymentIn(state, order.id, "order", order.amount, order.factory_name);
    }
    if (order.status === "awaiting_quick_payment" || order.status === "quick_payment_submitted") {
      ensurePaymentIn(state, order.id, "quick_delivery", order.quick_delivery_fee, order.factory_name);
    }
  }
}

function nowIso() {
  return new Date().toISOString();
}

function ensurePaymentIn(
  state: MockState,
  orderId: string,
  paymentType: PaymentType,
  amount: number,
  accountHolder?: string
): WorkOrderPayment {
  const list = state.payments.get(orderId) || [];
  const existing = list.find((item) => item.payment_type === paymentType);

  const bank =
    paymentType === "quick_delivery"
      ? getQuickDeliveryBankInfo(accountHolder)
      : getOrderBankInfo(accountHolder);

  if (existing) {
    if (!existing.bank_name || !existing.account_number) {
      existing.bank_name = bank.bank_name;
      existing.account_number = bank.account_number;
      existing.account_holder = bank.account_holder;
      existing.updated_at = nowIso();
    }
    return existing;
  }

  const payment: WorkOrderPayment = {
    id: randomUUID(),
    work_order_id: orderId,
    payment_type: paymentType,
    amount,
    status: "pending",
    bank_name: bank.bank_name,
    account_number: bank.account_number,
    account_holder: bank.account_holder,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  list.push(payment);
  state.payments.set(orderId, list);
  return payment;
}

function ensurePayment(
  orderId: string,
  paymentType: PaymentType,
  amount: number,
  accountHolder?: string
): WorkOrderPayment {
  return ensurePaymentIn(getState(), orderId, paymentType, amount, accountHolder);
}

function addMessage(
  orderId: string,
  input: Omit<WorkOrderMessage, "id" | "work_order_id" | "created_at" | "attachments"> & {
    attachments?: WorkOrderMessage["attachments"];
  }
) {
  const state = getState();
  const list = state.messages.get(orderId) || [];
  const message: WorkOrderMessage = {
    id: randomUUID(),
    work_order_id: orderId,
    sender_role: input.sender_role,
    sender_id: input.sender_id ?? null,
    sender_name: input.sender_name ?? null,
    message: input.message,
    attachments: input.attachments || [],
    include_work_order: input.include_work_order,
    created_at: nowIso(),
    read_at: null,
  };
  list.push(message);
  state.messages.set(orderId, list);
  return message;
}

export function mockListWorkOrders(filters: {
  factoryId?: string;
  userEmail?: string;
  userId?: string;
}) {
  const state = getState();
  let rows = Array.from(state.orders.values());
  if (filters.factoryId) rows = rows.filter((row) => row.factory_id === filters.factoryId);
  if (filters.userEmail) rows = rows.filter((row) => row.user_email === filters.userEmail);
  if (filters.userId) rows = rows.filter((row) => row.user_id === filters.userId);
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function mockGetWorkOrderById(id: string) {
  return getState().orders.get(id) || null;
}

export function mockCreateWorkOrder(body: {
  match_request_id?: string;
  user_id?: string | null;
  user_email: string;
  user_name: string;
  factory_id: string;
  factory_name: string;
  title?: string;
  description?: string;
  work_order_json?: Record<string, unknown>;
  amount?: number;
  quick_delivery_fee?: number;
  initial_message?: string;
}) {
  const state = getState();
  const id = randomUUID();
  const createdAt = nowIso();
  const order: WorkOrderRecord = {
    id,
    match_request_id: body.match_request_id || null,
    user_id: body.user_id || null,
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
    factory_notified_at: createdAt,
    created_at: createdAt,
    updated_at: createdAt,
  };
  state.orders.set(id, order);

  if (body.initial_message?.trim()) {
    addMessage(id, {
      sender_role: "user",
      sender_id: body.user_id || null,
      sender_name: body.user_name,
      message: body.initial_message.trim(),
      include_work_order: true,
    });
  }

  addMessage(id, {
    sender_role: "system",
    sender_name: "시스템",
    message: "작업지시서가 전달되었습니다. 공장에서 확인 후 채팅으로 협의를 진행합니다.",
    include_work_order: true,
  });

  const notifications = state.notifications.get(order.factory_id) || [];
  notifications.unshift({
    id: randomUUID(),
    factory_id: order.factory_id,
    work_order_id: order.id,
    notification_type: "work_order_arrived",
    title: "새 작업지시서 도착",
    body: `${order.user_name}님의 작업지시서가 도착했습니다.`,
    created_at: createdAt,
    read_at: null,
  });
  state.notifications.set(order.factory_id, notifications);

  return order;
}

export function mockListMessages(orderId: string) {
  return getState().messages.get(orderId) || [];
}

export function mockAddMessage(
  orderId: string,
  input: {
    sender_role: WorkOrderMessage["sender_role"];
    sender_id?: string | null;
    sender_name?: string | null;
    message: string;
    include_work_order?: boolean;
  }
) {
  const state = getState();
  const order = state.orders.get(orderId);
  if (!order) throw new Error("작업지시서를 찾을 수 없습니다.");

  const message = addMessage(orderId, {
    sender_role: input.sender_role,
    sender_id: input.sender_id,
    sender_name: input.sender_name,
    message: input.message,
    include_work_order: Boolean(input.include_work_order),
  });

  if (order.status === "factory_received" || order.status === "revision_requested") {
    order.status = "in_discussion";
    order.updated_at = nowIso();
  }

  return message;
}

export function mockListPayments(orderId: string, order: WorkOrderRecord) {
  if (order.status === "awaiting_order_payment" || order.status === "order_payment_submitted") {
    ensurePayment(orderId, "order", order.amount, order.factory_name);
  }
  if (order.status === "awaiting_quick_payment" || order.status === "quick_payment_submitted") {
    ensurePayment(orderId, "quick_delivery", order.quick_delivery_fee, order.factory_name);
  }
  return getState().payments.get(orderId) || [];
}

export function mockRunAction(
  orderId: string,
  action: WorkOrderAction,
  payload?: {
    productionType?: "sample" | "production";
    deliveryMethod?: "pickup" | "quick";
    depositorName?: string;
    message?: string;
    senderName?: string;
    senderRole?: WorkOrderMessage["sender_role"];
    senderId?: string | null;
  }
) {
  const state = getState();
  const order = state.orders.get(orderId);
  if (!order) throw new Error("작업지시서를 찾을 수 없습니다.");
  if (!canRunAction(order.status, action)) {
    throw new Error(`현재 상태에서는 ${action} 작업을 할 수 없습니다.`);
  }

  const nextStatus = resolveStatusAfterAction(action, order.status, {
    productionType: payload?.productionType,
    deliveryMethod: payload?.deliveryMethod,
  });

  order.status = nextStatus;
  order.updated_at = nowIso();

  if (action === "factory_acknowledge") order.factory_read_at = nowIso();
  if (action === "user_choose_production_type" && payload?.productionType) {
    order.production_type = payload.productionType;
  }
  if (action === "factory_choose_production_type" && payload?.productionType) {
    order.production_type = payload.productionType;
  }
  if (action === "user_choose_delivery" && payload?.deliveryMethod) {
    order.delivery_method = payload.deliveryMethod;
    if (payload.deliveryMethod === "quick") {
      order.quick_delivery_fee = getQuickDeliveryBankInfo().fee;
    }
  }
  if (action === "factory_complete_work") order.completed_at = nowIso();
  if (action === "user_confirm_purchase" || action === "factory_confirm_purchase") {
    order.purchase_confirmed_at = nowIso();
  }

  if (action === "user_approve_review") {
    const payment = ensurePayment(orderId, "order", order.amount, order.factory_name);
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: formatBankAccountMessage({
        bank_name: payment.bank_name || "",
        account_number: payment.account_number || "",
        account_holder: payment.account_holder || order.factory_name,
        amount: payment.amount,
        label: "작업 대금 입금 안내",
      }),
      include_work_order: false,
    });
  }

  if (action === "factory_advance_to_payment") {
    const payment = ensurePayment(orderId, "order", order.amount, order.factory_name);
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: formatBankAccountMessage({
        bank_name: payment.bank_name || "",
        account_number: payment.account_number || "",
        account_holder: payment.account_holder || order.factory_name,
        amount: payment.amount,
        label: "작업 대금 입금 안내",
      }),
      include_work_order: false,
    });
  }

  if (action === "admin_confirm_order_payment" || action === "factory_confirm_order_payment") {
    const payments = state.payments.get(orderId) || [];
    const payment = payments.find((item) => item.payment_type === "order");
    if (payment) {
      payment.status = "confirmed";
      payment.confirmed_at = nowIso();
      payment.updated_at = nowIso();
    }
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: "작업 대금 입금이 확인되었습니다. 샘플/본작업 유형을 선택해 주세요.",
      include_work_order: false,
    });
  }

  if (action === "user_choose_delivery" && payload?.deliveryMethod === "quick") {
    ensurePayment(orderId, "quick_delivery", order.quick_delivery_fee, order.factory_name);
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: `퀵 배송을 선택했습니다. 배송비 ${order.quick_delivery_fee.toLocaleString()}원을 입금해 주세요.`,
      include_work_order: false,
    });
  }

  if (action === "factory_advance_quick") {
    order.delivery_method = "quick";
    order.quick_delivery_fee = getQuickDeliveryBankInfo(order.factory_name).fee;
    const payment = ensurePayment(orderId, "quick_delivery", order.quick_delivery_fee, order.factory_name);
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: formatBankAccountMessage({
        bank_name: payment.bank_name || "",
        account_number: payment.account_number || "",
        account_holder: payment.account_holder || order.factory_name,
        amount: payment.amount,
        label: "퀵 배송비 입금 안내",
      }),
      include_work_order: false,
    });
  }

  if (action === "factory_advance_pickup") {
    order.delivery_method = "pickup";
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: "직접 방문 수령이 가능합니다. 방문 일정을 채팅으로 안내해 주세요.",
      include_work_order: false,
    });
  }

  if (action === "user_submit_quick_payment") {
    const payment = ensurePayment(orderId, "quick_delivery", order.quick_delivery_fee, order.factory_name);
    payment.status = "submitted";
    payment.depositor_name = payload?.depositorName || "";
    payment.submitted_at = nowIso();
    payment.updated_at = nowIso();
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: "퀵 배송비 입금이 접수되었습니다. 확인 후 발송됩니다.",
      include_work_order: false,
    });
  }

  if (action === "user_submit_order_payment") {
    const payment = ensurePayment(orderId, "order", order.amount, order.factory_name);
    payment.status = "submitted";
    payment.depositor_name = payload?.depositorName || "";
    payment.submitted_at = nowIso();
    payment.updated_at = nowIso();
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: "작업 대금 입금이 접수되었습니다. 확인 후 작업이 시작됩니다.",
      include_work_order: false,
    });
  }

  if (action === "admin_confirm_quick_payment" || action === "factory_confirm_quick_payment") {
    const payments = state.payments.get(orderId) || [];
    const payment = payments.find((item) => item.payment_type === "quick_delivery");
    if (payment) {
      payment.status = "confirmed";
      payment.confirmed_at = nowIso();
      payment.updated_at = nowIso();
    }
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: "퀵 배송비 입금이 확인되었습니다. 곧 발송됩니다.",
      include_work_order: false,
    });
  }

  if (action === "factory_choose_production_type" && payload?.productionType) {
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message:
        payload.productionType === "sample"
          ? "샘플 작업을 시작합니다."
          : "본작업을 시작합니다.",
      include_work_order: false,
    });
  }

  const systemMessages: Partial<Record<WorkOrderAction, string>> = {
    factory_acknowledge: "공장에서 작업지시서를 확인했습니다.",
    factory_request_review: "공장에서 검토를 요청했습니다.",
    user_request_revision: "수정 요청이 전달되었습니다.",
    factory_complete_work: "작업이 완료되었습니다. 수령 방법을 선택해 주세요.",
    factory_dispatch_quick: "퀵 배송이 발송되었습니다.",
    factory_ready_pickup: "직접 방문 수령이 가능합니다.",
    user_confirm_purchase: "구매가 확정되었습니다. 거래가 완료되었습니다.",
    factory_confirm_purchase: "거래가 완료되었습니다.",
    cancel: "거래가 취소되었습니다.",
  };

  if (payload?.message?.trim()) {
    addMessage(orderId, {
      sender_role: payload.senderRole || "user",
      sender_id: payload.senderId ?? null,
      sender_name: payload.senderName || null,
      message: payload.message.trim(),
      include_work_order: false,
    });
  }

  if (systemMessages[action]) {
    addMessage(orderId, {
      sender_role: "system",
      sender_name: "시스템",
      message: systemMessages[action]!,
      include_work_order: false,
    });
  }

  return order;
}

export function mockListFactoryNotifications(factoryId: string) {
  return (getState().notifications.get(factoryId) || []).slice(0, 50);
}

export function mockMarkFactoryNotificationsRead(factoryId: string, ids?: string[]) {
  const state = getState();
  const list = state.notifications.get(factoryId) || [];
  const now = nowIso();
  for (const item of list) {
    if (ids?.length && !ids.includes(item.id)) continue;
    item.read_at = now;
  }
  state.notifications.set(factoryId, list);
}

export function isWorkOrderMockEnabled() {
  if (process.env.WORK_ORDER_USE_DB === "true") return false;
  if (process.env.WORK_ORDER_MOCK === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}
