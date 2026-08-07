import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  FactoryNotification,
  PaymentType,
  WorkOrderMessage,
  WorkOrderPayment,
  WorkOrderRecord,
  WorkOrderStatus,
} from "./workOrderTypes";
import { getOrderBankInfo, getQuickDeliveryBankInfo } from "./workOrderBankInfo";

export function getWorkOrderSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createFactoryNotification(
  supabase: SupabaseClient,
  input: {
    factory_id: string;
    work_order_id: string;
    notification_type?: string;
    title: string;
    body?: string;
  }
) {
  const { data, error } = await supabase
    .from("factory_notifications")
    .insert({
      factory_id: input.factory_id,
      work_order_id: input.work_order_id,
      notification_type: input.notification_type || "work_order_arrived",
      title: input.title,
      body: input.body || "",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as FactoryNotification;
}

export async function appendSystemMessage(
  supabase: SupabaseClient,
  workOrderId: string,
  message: string,
  includeWorkOrder = false
) {
  const { data, error } = await supabase
    .from("work_order_messages")
    .insert({
      work_order_id: workOrderId,
      sender_role: "system",
      sender_name: "시스템",
      message,
      include_work_order: includeWorkOrder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkOrderMessage;
}

export async function ensurePaymentRecord(
  supabase: SupabaseClient,
  workOrderId: string,
  paymentType: PaymentType,
  amount: number
) {
  const { data: existing } = await supabase
    .from("work_order_payments")
    .select("*")
    .eq("work_order_id", workOrderId)
    .eq("payment_type", paymentType)
    .maybeSingle();

  if (existing) return existing as WorkOrderPayment;

  const bank =
    paymentType === "quick_delivery" ? getQuickDeliveryBankInfo() : getOrderBankInfo();

  const { data, error } = await supabase
    .from("work_order_payments")
    .insert({
      work_order_id: workOrderId,
      payment_type: paymentType,
      amount,
      status: "pending",
      bank_name: bank.bank_name,
      account_number: bank.account_number,
      account_holder: bank.account_holder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkOrderPayment;
}

export function isWorkOrderSchemaMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const message = error.message || "";
  return (
    error.code === "42P01" ||
    message.includes("work_orders") && message.includes("does not exist")
  );
}

export const WORK_ORDER_SETUP_MESSAGE =
  "결제·작업지시서 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 docs/db-payment-workflow.sql 을 실행해 주세요.";

export async function updateWorkOrderStatus(
  supabase: SupabaseClient,
  workOrderId: string,
  status: WorkOrderStatus,
  extra: Record<string, unknown> = {}
) {
  const { data, error } = await supabase
    .from("work_orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...extra,
    })
    .eq("id", workOrderId)
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkOrderRecord;
}
