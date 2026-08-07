"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { linkifyText } from "@/lib/linkifyText";
import {
  getWorkOrderMessages,
  getWorkOrderPayments,
  runWorkOrderAction,
  sendWorkOrderMessage,
} from "@/lib/workOrders";
import type { WorkOrderMessage, WorkOrderPayment, WorkOrderRecord } from "@/lib/workOrderTypes";
import type { ViewerRole } from "@/components/work-orders/WorkOrderMessengerParts";

export function useWorkOrderSession({
  order,
  role,
  senderName,
  onOrderUpdated,
}: {
  order: WorkOrderRecord;
  role: ViewerRole;
  senderName?: string;
  onOrderUpdated: (order: WorkOrderRecord) => void;
}) {
  const [messages, setMessages] = useState<WorkOrderMessage[]>([]);
  const [payments, setPayments] = useState<WorkOrderPayment[]>([]);
  const [draft, setDraft] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    const [nextMessages, nextPayments] = await Promise.all([
      getWorkOrderMessages(order.id),
      getWorkOrderPayments(order.id),
    ]);
    setMessages(nextMessages);
    setPayments(nextPayments);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [order.id, order.status]);

  const action = async (
    actionName: Parameters<typeof runWorkOrderAction>[1],
    payload?: Parameters<typeof runWorkOrderAction>[2]
  ) => {
    setSubmitting(true);
    try {
      const updated = await runWorkOrderAction(order.id, actionName, {
        ...payload,
        senderName,
      });
      onOrderUpdated(updated);
      await refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const message = (overrideMessage ?? draft).trim();
    if (!message) return;
    setSubmitting(true);
    try {
      await sendWorkOrderMessage(order.id, message, false, senderName);
      if (!overrideMessage) setDraft("");
      await refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "메시지 전송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const orderPayment = payments.find((p) => p.payment_type === "order");
  const quickPayment = payments.find((p) => p.payment_type === "quick_delivery");

  return {
    messages,
    loading,
    draft,
    setDraft,
    submitting,
    handleSendMessage,
    action,
    depositorName,
    setDepositorName,
    orderPayment,
    quickPayment,
  };
}

function MessageBubble({
  message,
  viewerRole,
  large = false,
}: {
  message: WorkOrderMessage;
  viewerRole: ViewerRole;
  large?: boolean;
}) {
  if (message.sender_role === "system") {
    return (
      <div className="flex justify-center px-2">
        <p className={`text-center text-gray-400 ${large ? "text-base" : "text-xs"}`}>{message.message}</p>
      </div>
    );
  }

  const isOwnMessage =
    (viewerRole === "user" && message.sender_role === "user") ||
    (viewerRole === "factory" && message.sender_role === "factory");

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          large ? "text-base" : "text-sm"
        } ${
          message.sender_role === "factory"
            ? "border border-emerald-100 bg-emerald-50 text-gray-800"
            : message.sender_role === "user"
              ? "border border-blue-100 bg-blue-50 text-gray-800"
              : "bg-gray-100 text-gray-700"
        }`}
      >
        {message.sender_name && (
          <div className="mb-1 text-xs font-semibold text-gray-500">{message.sender_name}</div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed">{linkifyText(message.message)}</div>
        <div className="mt-2 text-[11px] text-gray-400">
          {new Date(message.created_at).toLocaleString("ko-KR")}
        </div>
      </div>
    </div>
  );
}

export default function WorkOrderChatCenter({
  order,
  role,
  messages,
  loading,
  draft,
  setDraft,
  submitting,
  onSend,
  large = false,
}: {
  order: WorkOrderRecord;
  role: ViewerRole;
  messages: WorkOrderMessage[];
  loading: boolean;
  draft: string;
  setDraft: (value: string) => void;
  submitting: boolean;
  onSend: () => void;
  large?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <>
      <div className={`flex-1 space-y-4 overflow-y-auto ${large ? "px-4 py-4" : "px-5 py-4"}`}>
        {loading ? (
          <div className={`text-center text-gray-500 ${large ? "text-lg" : "text-sm"}`}>불러오는 중...</div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              viewerRole={role}
              large={large}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t border-gray-200 bg-white ${large ? "p-4" : "p-4"}`}>
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={large ? "메시지를 적어 주세요" : "메시지를 입력하세요"}
            className={`flex-1 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 ${
              large ? "px-4 py-4 text-lg" : "px-4 py-3 text-sm"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button
            onClick={onSend}
            disabled={submitting || !draft.trim()}
            className={large ? "min-h-[56px] px-6 text-lg font-bold" : undefined}
          >
            보내기
          </Button>
        </div>
        {!large && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
            동고리 이외의 방법으로 연락하거나 거래를 진행하는 것은 이용약관 위반으로 이용 제한 조치를 받을 수
            있습니다.
          </p>
        )}
      </div>
    </>
  );
}
