import type {
  DeliveryMethod,
  PaymentType,
  ProductionType,
  WorkOrderStatus,
} from "./workOrderTypes";

export type WorkOrderAction =
  | "factory_acknowledge"
  | "factory_request_review"
  | "factory_advance_to_payment"
  | "factory_confirm_order_payment"
  | "factory_choose_production_type"
  | "factory_confirm_quick_payment"
  | "factory_advance_pickup"
  | "factory_advance_quick"
  | "factory_confirm_purchase"
  | "user_request_revision"
  | "user_approve_review"
  | "user_choose_production_type"
  | "factory_start_work"
  | "factory_complete_work"
  | "user_choose_delivery"
  | "user_submit_quick_payment"
  | "admin_confirm_quick_payment"
  | "factory_dispatch_quick"
  | "factory_ready_pickup"
  | "user_submit_order_payment"
  | "admin_confirm_order_payment"
  | "user_confirm_purchase"
  | "cancel";

const TRANSITIONS: Record<WorkOrderAction, { from: WorkOrderStatus[]; to: WorkOrderStatus }> = {
  factory_acknowledge: { from: ["work_order_sent"], to: "factory_received" },
  factory_request_review: {
    from: ["factory_received", "in_discussion", "revision_requested"],
    to: "awaiting_user_review",
  },
  factory_advance_to_payment: {
    from: ["factory_received", "in_discussion", "revision_requested", "awaiting_user_review"],
    to: "awaiting_order_payment",
  },
  factory_confirm_order_payment: {
    from: ["awaiting_order_payment", "order_payment_submitted"],
    to: "awaiting_production_type",
  },
  factory_choose_production_type: {
    from: ["awaiting_production_type", "order_payment_confirmed"],
    to: "awaiting_production_type",
  },
  factory_confirm_quick_payment: {
    from: ["awaiting_quick_payment", "quick_payment_submitted"],
    to: "quick_payment_confirmed",
  },
  factory_advance_pickup: {
    from: ["work_completed", "awaiting_delivery_method"],
    to: "ready_for_pickup",
  },
  factory_advance_quick: {
    from: ["work_completed", "awaiting_delivery_method"],
    to: "awaiting_quick_payment",
  },
  factory_confirm_purchase: {
    from: ["ready_for_pickup", "quick_dispatched", "awaiting_purchase_confirm"],
    to: "completed",
  },
  user_request_revision: { from: ["awaiting_user_review"], to: "revision_requested" },
  user_approve_review: { from: ["awaiting_user_review"], to: "awaiting_order_payment" },
  user_choose_production_type: { from: ["awaiting_production_type"], to: "awaiting_production_type" },
  factory_start_work: {
    from: ["order_payment_confirmed", "awaiting_production_type"],
    to: "production_in_progress",
  },
  factory_complete_work: {
    from: ["sample_in_progress", "production_in_progress"],
    to: "work_completed",
  },
  user_choose_delivery: { from: ["work_completed", "awaiting_delivery_method"], to: "awaiting_delivery_method" },
  user_submit_quick_payment: { from: ["awaiting_quick_payment"], to: "quick_payment_submitted" },
  admin_confirm_quick_payment: { from: ["quick_payment_submitted"], to: "quick_payment_confirmed" },
  factory_dispatch_quick: { from: ["quick_payment_confirmed"], to: "quick_dispatched" },
  factory_ready_pickup: { from: ["work_completed"], to: "ready_for_pickup" },
  user_submit_order_payment: { from: ["awaiting_order_payment"], to: "order_payment_submitted" },
  admin_confirm_order_payment: { from: ["order_payment_submitted"], to: "order_payment_confirmed" },
  user_confirm_purchase: {
    from: ["ready_for_pickup", "quick_dispatched", "awaiting_purchase_confirm"],
    to: "completed",
  },
  cancel: {
    from: [
      "work_order_sent",
      "factory_received",
      "in_discussion",
      "awaiting_user_review",
      "revision_requested",
      "awaiting_production_type",
      "awaiting_order_payment",
      "order_payment_submitted",
    ],
    to: "cancelled",
  },
};

export function canRunAction(status: WorkOrderStatus, action: WorkOrderAction): boolean {
  return TRANSITIONS[action].from.includes(status);
}

export function getNextStatus(action: WorkOrderAction): WorkOrderStatus {
  return TRANSITIONS[action].to;
}

export function resolveStatusAfterAction(
  action: WorkOrderAction,
  current: WorkOrderStatus,
  payload?: {
    productionType?: ProductionType;
    deliveryMethod?: DeliveryMethod;
  }
): WorkOrderStatus {
  if (!canRunAction(current, action)) {
    throw new Error(`현재 상태(${current})에서 ${action} 작업을 수행할 수 없습니다.`);
  }

  if (action === "user_choose_production_type" && payload?.productionType) {
    return payload.productionType === "sample" ? "sample_in_progress" : "production_in_progress";
  }

  if (action === "factory_choose_production_type" && payload?.productionType) {
    return payload.productionType === "sample" ? "sample_in_progress" : "production_in_progress";
  }

  if (action === "user_choose_delivery" && payload?.deliveryMethod) {
    if (payload.deliveryMethod === "pickup") return "ready_for_pickup";
    return "awaiting_quick_payment";
  }

  if (action === "factory_complete_work") {
    return "awaiting_delivery_method";
  }

  if (action === "admin_confirm_order_payment") {
    return "awaiting_production_type";
  }

  if (action === "factory_confirm_order_payment") {
    return "awaiting_production_type";
  }

  if (action === "factory_dispatch_quick" || action === "factory_ready_pickup") {
    return "awaiting_purchase_confirm";
  }

  if (action === "factory_advance_quick") {
    return "awaiting_quick_payment";
  }

  if (action === "user_approve_review" || action === "factory_advance_to_payment") {
    return "awaiting_order_payment";
  }

  return getNextStatus(action);
}

export function getStatusSteps(status: WorkOrderStatus): string[] {
  const base = ["작업지시서 전달", "협의·검토", "결제", "작업 진행", "수령", "구매 확정"];
  if (status === "cancelled") return [...base, "취소"];
  if (status === "completed") return base;
  return base;
}

export function getPaymentTypeForStatus(status: WorkOrderStatus): PaymentType | null {
  if (status === "awaiting_order_payment" || status === "order_payment_submitted") return "order";
  if (status === "awaiting_quick_payment" || status === "quick_payment_submitted") return "quick_delivery";
  return null;
}
