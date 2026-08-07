import type { WorkOrderPayment, WorkOrderRecord } from "./workOrderTypes";

export const MOCK_WORK_ORDER_BANK = {
  bank_name: "국민은행",
  account_number: "356-0123-4567-89",
  account_holder: "재민상사",
} as const;

function useDevMockBankInfo() {
  if (process.env.WORK_ORDER_ACCOUNT_NUMBER?.trim()) return false;
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.WORK_ORDER_MOCK === "true") return true;
  return false;
}

export function getOrderBankInfo(accountHolder?: string) {
  if (useDevMockBankInfo()) {
    return {
      ...MOCK_WORK_ORDER_BANK,
      account_holder: accountHolder || MOCK_WORK_ORDER_BANK.account_holder,
    };
  }

  return {
    bank_name: process.env.WORK_ORDER_BANK_NAME || MOCK_WORK_ORDER_BANK.bank_name,
    account_number: process.env.WORK_ORDER_ACCOUNT_NUMBER || MOCK_WORK_ORDER_BANK.account_number,
    account_holder:
      process.env.WORK_ORDER_ACCOUNT_HOLDER || accountHolder || MOCK_WORK_ORDER_BANK.account_holder,
  };
}

export function getQuickDeliveryBankInfo(accountHolder?: string) {
  if (useDevMockBankInfo()) {
    return {
      ...MOCK_WORK_ORDER_BANK,
      account_holder: accountHolder || MOCK_WORK_ORDER_BANK.account_holder,
      fee: Number(process.env.QUICK_DELIVERY_FEE || 15000),
    };
  }

  return {
    bank_name:
      process.env.QUICK_DELIVERY_BANK_NAME ||
      process.env.WORK_ORDER_BANK_NAME ||
      MOCK_WORK_ORDER_BANK.bank_name,
    account_number:
      process.env.QUICK_DELIVERY_ACCOUNT_NUMBER ||
      process.env.WORK_ORDER_ACCOUNT_NUMBER ||
      MOCK_WORK_ORDER_BANK.account_number,
    account_holder:
      process.env.QUICK_DELIVERY_ACCOUNT_HOLDER ||
      process.env.WORK_ORDER_ACCOUNT_HOLDER ||
      accountHolder ||
      MOCK_WORK_ORDER_BANK.account_holder,
    fee: Number(process.env.QUICK_DELIVERY_FEE || 15000),
  };
}

export function formatBankAccountMessage(input: {
  bank_name: string;
  account_number: string;
  account_holder: string;
  amount: number;
  label?: string;
}) {
  const title = input.label || "입금 안내";
  return [
    `[${title}]`,
    "",
    `은행: ${input.bank_name}`,
    `계좌번호: ${input.account_number}`,
    `예금주: ${input.account_holder}`,
    `입금액: ${input.amount.toLocaleString()}원`,
  ].join("\n");
}

export function getFactoryPaymentPreview(
  order: WorkOrderRecord,
  payment?: WorkOrderPayment,
  type: "order" | "quick_delivery" = "order"
) {
  if (payment?.bank_name && payment.account_number) {
    return payment;
  }

  const amount = type === "quick_delivery" ? order.quick_delivery_fee : order.amount;

  return {
    id: payment?.id || "preview",
    work_order_id: order.id,
    payment_type: type,
    amount,
    status: payment?.status || "pending",
    bank_name: MOCK_WORK_ORDER_BANK.bank_name,
    account_number: MOCK_WORK_ORDER_BANK.account_number,
    account_holder: order.factory_name || MOCK_WORK_ORDER_BANK.account_holder,
    created_at: payment?.created_at || order.created_at,
    updated_at: payment?.updated_at || order.updated_at,
  } satisfies WorkOrderPayment;
}
