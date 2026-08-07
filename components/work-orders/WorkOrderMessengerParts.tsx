"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFactoryActionOptions } from "@/lib/factoryWorkOrderActions";
import { getFactoryPaymentPreview } from "@/lib/workOrderBankInfo";
import {
  DELIVERY_METHOD_LABELS,
  PRODUCTION_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  type DeliveryMethod,
  type ProductionType,
  type WorkOrderPayment,
  type WorkOrderRecord,
} from "@/lib/workOrderTypes";
import { runWorkOrderAction } from "@/lib/workOrders";

export type ViewerRole = "user" | "factory" | "admin";

export function WorkOrderActionPanel({
  order,
  role,
  submitting,
  depositorName,
  onDepositorNameChange,
  orderPayment,
  quickPayment,
  onAction,
  onSendMessage,
  compact = false,
  large = false,
}: {
  order: WorkOrderRecord;
  role: ViewerRole;
  submitting: boolean;
  depositorName: string;
  onDepositorNameChange: (value: string) => void;
  orderPayment?: WorkOrderPayment;
  quickPayment?: WorkOrderPayment;
  onAction: (
    action: Parameters<typeof runWorkOrderAction>[1],
    payload?: Parameters<typeof runWorkOrderAction>[2]
  ) => Promise<void>;
  onSendMessage?: (message: string) => Promise<void>;
  compact?: boolean;
  large?: boolean;
}) {
  const factoryOptions = useMemo(
    () => (role === "factory" && large ? getFactoryActionOptions(order) : []),
    [role, large, order]
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOptionId(factoryOptions[0]?.id ?? null);
  }, [order.id, order.status, factoryOptions]);

  const wrapperClass = compact
    ? "space-y-3"
    : "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3";
  const buttonClass = large ? "w-full h-auto min-h-[56px] text-lg font-bold py-4" : "w-full";

  const selectedOption = factoryOptions.find((item) => item.id === selectedOptionId) ?? null;

  const handleFactorySubmit = async () => {
    if (!selectedOption || submitting) return;
    try {
      if (selectedOption.kind === "message") {
        if (!onSendMessage || !selectedOption.message) return;
        await onSendMessage(selectedOption.message);
        return;
      }
      if (!selectedOption.action) return;
      await onAction(selectedOption.action, selectedOption.payload);
    } catch (error) {
      alert(error instanceof Error ? error.message : "작업 처리에 실패했습니다.");
    }
  };

  return (
    <div className={wrapperClass}>
      {!compact && !large && <h3 className="font-semibold text-gray-900">다음 작업</h3>}
      {large && role === "factory" ? (
        <div className="space-y-4">
          <FactoryPaymentInfo order={order} orderPayment={orderPayment} quickPayment={quickPayment} />
          {factoryOptions.length > 0 ? (
            <FactorySelectableActionPanel
              options={factoryOptions}
              selectedOptionId={selectedOptionId}
              onSelect={setSelectedOptionId}
              submitting={submitting}
              onSubmit={handleFactorySubmit}
            />
          ) : (
            <p className="text-lg text-gray-500">지금은 진행할 작업이 없습니다.</p>
          )}
        </div>
      ) : (
        <>
          {role === "factory" && order.status === "work_order_sent" && !large && (
            <Button className={buttonClass} disabled={submitting} onClick={() => onAction("factory_acknowledge")}>
              작업지시서 확인
            </Button>
          )}

          {role === "factory" &&
            !large &&
            ["factory_received", "in_discussion", "revision_requested"].includes(order.status) && (
              <Button
                className={buttonClass}
                disabled={submitting}
                onClick={() => onAction("factory_request_review")}
              >
                검토 요청 보내기
              </Button>
            )}

          {role === "user" && order.status === "awaiting_user_review" && (
            <div className="space-y-2">
              <Button className="w-full" disabled={submitting} onClick={() => onAction("user_approve_review")}>
                검토 승인
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={submitting}
                onClick={() => onAction("user_request_revision", { message: "수정 요청드립니다." })}
              >
                수정 요청
              </Button>
            </div>
          )}

      {role === "user" && order.status === "awaiting_order_payment" && (
        <PaymentBox
          payment={getFactoryPaymentPreview(order, orderPayment, "order")}
          depositorName={depositorName}
          onDepositorNameChange={onDepositorNameChange}
          submitting={submitting}
          onSubmit={() => onAction("user_submit_order_payment", { depositorName })}
        />
      )}

      {role === "user" && order.status === "awaiting_production_type" && (
        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={submitting}
            onClick={() =>
              onAction("user_choose_production_type", { productionType: "sample" as ProductionType })
            }
          >
            샘플 작업
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={submitting}
            onClick={() =>
              onAction("user_choose_production_type", { productionType: "production" as ProductionType })
            }
          >
            바로 제작
          </Button>
        </div>
      )}

      {role === "factory" && ["sample_in_progress", "production_in_progress"].includes(order.status) && !large && (
        <Button className={buttonClass} disabled={submitting} onClick={() => onAction("factory_complete_work")}>
          작업 완료
        </Button>
      )}

      {role === "user" && order.status === "awaiting_delivery_method" && (
        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={submitting}
            onClick={() => onAction("user_choose_delivery", { deliveryMethod: "pickup" as DeliveryMethod })}
          >
            직접 방문 수령
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={submitting}
            onClick={() => onAction("user_choose_delivery", { deliveryMethod: "quick" as DeliveryMethod })}
          >
            퀵 배송
          </Button>
        </div>
      )}

      {role === "user" && order.status === "awaiting_quick_payment" && (
        <PaymentBox
          payment={getFactoryPaymentPreview(order, quickPayment, "quick_delivery")}
          depositorName={depositorName}
          onDepositorNameChange={onDepositorNameChange}
          submitting={submitting}
          onSubmit={() => onAction("user_submit_quick_payment", { depositorName })}
        />
      )}

      {role === "factory" && order.status === "quick_payment_confirmed" && !large && (
        <Button className={buttonClass} disabled={submitting} onClick={() => onAction("factory_dispatch_quick")}>
          퀵 발송 완료
        </Button>
      )}

      {role === "factory" && order.delivery_method === "pickup" && order.status === "work_completed" && !large && (
        <Button className={buttonClass} disabled={submitting} onClick={() => onAction("factory_ready_pickup")}>
          방문 수령 가능
        </Button>
      )}

      {role === "user" && order.status === "awaiting_purchase_confirm" && (
        <Button className="w-full" disabled={submitting} onClick={() => onAction("user_confirm_purchase")}>
          구매 확정
        </Button>
      )}

      {role === "admin" && order.status === "order_payment_submitted" && (
        <Button className="w-full" disabled={submitting} onClick={() => onAction("admin_confirm_order_payment")}>
          작업 대금 입금 확인
        </Button>
      )}

      {role === "admin" && order.status === "quick_payment_submitted" && (
        <Button className="w-full" disabled={submitting} onClick={() => onAction("admin_confirm_quick_payment")}>
          퀵 배송비 입금 확인
        </Button>
      )}
        </>
      )}
    </div>
  );
}

function FactorySelectableActionPanel({
  options,
  selectedOptionId,
  onSelect,
  submitting,
  onSubmit,
}: {
  options: ReturnType<typeof getFactoryActionOptions>;
  selectedOptionId: string | null;
  onSelect: (id: string) => void;
  submitting: boolean;
  onSubmit: () => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">지금 할 일</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const active = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition ${
                active ? "border-gray-800 bg-gray-100" : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-gray-800" : "border-gray-300"
                  }`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="mt-1 block text-base text-gray-500">{option.description}</span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <Button
        className="w-full min-h-[56px] text-lg font-bold"
        disabled={submitting || !selectedOptionId}
        onClick={() => void onSubmit()}
      >
        {submitting ? "처리 중..." : "선택한 작업 보내기"}
      </Button>
    </div>
  );
}

function FactoryPaymentInfo({
  order,
  orderPayment,
  quickPayment,
}: {
  order: WorkOrderRecord;
  orderPayment?: WorkOrderPayment;
  quickPayment?: WorkOrderPayment;
}) {
  const showOrderPayment = Boolean(
    orderPayment || ["awaiting_order_payment", "order_payment_submitted"].includes(order.status)
  );
  const showQuickPayment = Boolean(
    quickPayment || ["awaiting_quick_payment", "quick_payment_submitted"].includes(order.status)
  );

  if (!showOrderPayment && !showQuickPayment) return null;

  return (
    <div className="space-y-3">
      {showOrderPayment && (
        <BankInfoDisplay
          title="작업 대금 입금 계좌"
          payment={getFactoryPaymentPreview(order, orderPayment, "order")}
        />
      )}
      {showQuickPayment && (
        <BankInfoDisplay
          title="퀵 배송비 입금 계좌"
          payment={getFactoryPaymentPreview(order, quickPayment, "quick_delivery")}
        />
      )}
    </div>
  );
}

function BankInfoDisplay({ title, payment }: { title: string; payment: WorkOrderPayment }) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 text-base text-gray-800 md:text-lg">
      <div className="font-bold text-gray-900">{title}</div>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">은행</dt>
          <dd className="font-semibold text-gray-900">{payment.bank_name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">계좌번호</dt>
          <dd className="font-semibold text-gray-900">{payment.account_number}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">예금주</dt>
          <dd className="font-semibold text-gray-900">{payment.account_holder}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-gray-200 pt-2">
          <dt className="text-gray-500">입금액</dt>
          <dd className="text-lg font-bold text-gray-900">{payment.amount.toLocaleString()}원</dd>
        </div>
      </dl>
    </div>
  );
}

function PaymentBox({
  payment,
  depositorName,
  onDepositorNameChange,
  submitting,
  onSubmit,
}: {
  payment: WorkOrderPayment;
  depositorName: string;
  onDepositorNameChange: (value: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700 space-y-3">
      <div className="font-semibold text-gray-900">계좌 입금 안내</div>
      <div>
        {payment.bank_name} {payment.account_number}
      </div>
      <div>예금주: {payment.account_holder}</div>
      <div>입금액: {payment.amount.toLocaleString()}원</div>
      <input
        value={depositorName}
        onChange={(e) => onDepositorNameChange(e.target.value)}
        placeholder="입금자명"
        className="w-full rounded-lg border border-gray-200 px-3 py-2"
      />
      <Button className="w-full" disabled={submitting || !depositorName.trim()} onClick={onSubmit}>
        입금 완료 신청
      </Button>
    </div>
  );
}

export function WorkOrderSummaryCard({ order }: { order: WorkOrderRecord }) {
  const json = order.work_order_json || {};
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1.5">
      <div className="font-semibold text-sm text-gray-900">{order.title}</div>
      {order.description && <p className="line-clamp-3 whitespace-pre-wrap">{order.description}</p>}
      {Object.entries(json)
        .slice(0, 6)
        .map(([key, value]) => (
          <div key={key}>
            <span className="font-medium text-gray-800">{key}: </span>
            <span>{typeof value === "string" ? value : JSON.stringify(value)}</span>
          </div>
        ))}
      <div className="pt-1 font-medium text-gray-800">
        작업 대금: {order.amount.toLocaleString()}원
      </div>
    </div>
  );
}

export function getCounterpartyName(order: WorkOrderRecord, role: ViewerRole) {
  return role === "factory" ? order.user_name : order.factory_name;
}

export function getCounterpartySubtext(order: WorkOrderRecord, role: ViewerRole) {
  return role === "factory" ? order.user_email : order.title;
}

export function formatListTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) {
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

export function needsAttention(order: WorkOrderRecord, role: ViewerRole) {
  if (role === "factory") return order.status === "work_order_sent";
  return ["awaiting_user_review", "awaiting_order_payment", "awaiting_delivery_method", "awaiting_quick_payment", "awaiting_purchase_confirm"].includes(
    order.status
  );
}
