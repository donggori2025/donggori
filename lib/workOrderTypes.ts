export type WorkOrderStatus =
  | "work_order_sent"
  | "factory_received"
  | "in_discussion"
  | "awaiting_user_review"
  | "revision_requested"
  | "awaiting_production_type"
  | "sample_in_progress"
  | "production_in_progress"
  | "work_completed"
  | "awaiting_delivery_method"
  | "awaiting_quick_payment"
  | "quick_payment_submitted"
  | "quick_payment_confirmed"
  | "ready_for_pickup"
  | "quick_dispatched"
  | "awaiting_purchase_confirm"
  | "awaiting_order_payment"
  | "order_payment_submitted"
  | "order_payment_confirmed"
  | "completed"
  | "cancelled";

export type ProductionType = "sample" | "production";
export type DeliveryMethod = "pickup" | "quick";
export type PaymentType = "order" | "quick_delivery";
export type PaymentStatus = "pending" | "submitted" | "confirmed" | "rejected";
export type MessageSenderRole = "user" | "factory" | "system" | "admin";

export interface WorkOrderRecord {
  id: string;
  match_request_id?: string | null;
  user_id?: string | null;
  user_email: string;
  user_name: string;
  factory_id: string;
  factory_name: string;
  title: string;
  description: string;
  work_order_json: Record<string, unknown>;
  amount: number;
  status: WorkOrderStatus;
  production_type?: ProductionType | null;
  delivery_method?: DeliveryMethod | null;
  quick_delivery_fee: number;
  factory_read_at?: string | null;
  factory_notified_at?: string | null;
  completed_at?: string | null;
  purchase_confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderMessage {
  id: string;
  work_order_id: string;
  sender_role: MessageSenderRole;
  sender_id?: string | null;
  sender_name?: string | null;
  message: string;
  attachments: Array<{ name: string; url: string }>;
  include_work_order: boolean;
  created_at: string;
  read_at?: string | null;
}

export interface WorkOrderPayment {
  id: string;
  work_order_id: string;
  payment_type: PaymentType;
  amount: number;
  status: PaymentStatus;
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  depositor_name?: string | null;
  submitted_at?: string | null;
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FactoryNotification {
  id: string;
  factory_id: string;
  work_order_id?: string | null;
  notification_type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  work_order_sent: "작업지시서 전달됨",
  factory_received: "공장 확인 완료",
  in_discussion: "협의 중",
  awaiting_user_review: "검토 요청",
  revision_requested: "수정 요청",
  awaiting_production_type: "작업 유형 선택 대기",
  sample_in_progress: "샘플 작업 중",
  production_in_progress: "본작업 진행 중",
  work_completed: "작업 완료",
  awaiting_delivery_method: "수령 방법 선택 대기",
  awaiting_quick_payment: "퀵 배송비 입금 대기",
  quick_payment_submitted: "퀵 배송비 입금 확인 중",
  quick_payment_confirmed: "퀵 배송비 확인 완료",
  ready_for_pickup: "직접 방문 수령 대기",
  quick_dispatched: "퀵 발송 완료",
  awaiting_purchase_confirm: "구매 확정 대기",
  awaiting_order_payment: "작업 대금 입금 대기",
  order_payment_submitted: "작업 대금 입금 확인 중",
  order_payment_confirmed: "작업 대금 확인 완료",
  completed: "거래 완료",
  cancelled: "취소됨",
};

export const PRODUCTION_TYPE_LABELS: Record<ProductionType, string> = {
  sample: "샘플 작업",
  production: "바로 제작",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: "직접 방문 수령",
  quick: "퀵 배송",
};
