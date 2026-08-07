"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import WorkOrderChatCenter, { useWorkOrderSession } from "@/components/work-orders/WorkOrderChatCenter";
import {
  getCounterpartyName,
  getCounterpartySubtext,
  formatListTime,
  needsAttention,
  WorkOrderActionPanel,
  WorkOrderSummaryCard,
  type ViewerRole,
} from "@/components/work-orders/WorkOrderMessengerParts";
import {
  DELIVERY_METHOD_LABELS,
  PRODUCTION_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  type WorkOrderRecord,
} from "@/lib/workOrderTypes";
import { getWorkOrderById, getWorkOrders } from "@/lib/workOrders";

type ListFilter = "all" | "unread" | "starred";

interface WorkOrderMessengerProps {
  role: ViewerRole;
  selectedOrderId?: string | null;
  senderName?: string;
  basePath: string;
  factoryId?: string;
  userEmail?: string;
}

function getInitial(name: string) {
  return name.trim().charAt(0) || "동";
}

function ActiveChatPanels({
  order,
  role,
  senderName,
  starred,
  onToggleStar,
  memo,
  onMemoChange,
  onOrderUpdated,
  onBack,
}: {
  order: WorkOrderRecord;
  role: ViewerRole;
  senderName?: string;
  starred: boolean;
  onToggleStar: () => void;
  memo: string;
  onMemoChange: (value: string) => void;
  onOrderUpdated: (order: WorkOrderRecord) => void;
  onBack?: () => void;
}) {
  const session = useWorkOrderSession({ order, role, senderName, onOrderUpdated });
  const counterpartyName = getCounterpartyName(order, role);
  const counterpartySub = getCounterpartySubtext(order, role);

  return (
    <>
      <section className="hidden min-w-0 flex-1 flex-col bg-[#f8f9fb] lg:flex">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{counterpartyName}</h2>
            <p className="text-sm text-gray-500">{WORK_ORDER_STATUS_LABELS[order.status]}</p>
          </div>
          <button
            type="button"
            onClick={onToggleStar}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-500"
            aria-label="즐겨찾기"
          >
            <Star className={`h-5 w-5 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        </div>
        <WorkOrderChatCenter
          order={order}
          role={role}
          messages={session.messages}
          loading={session.loading}
          draft={session.draft}
          setDraft={session.setDraft}
          submitting={session.submitting}
          onSend={session.handleSendMessage}
        />
      </section>

      <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white xl:flex">
        <RightSidebar
          order={order}
          role={role}
          counterpartyName={counterpartyName}
          counterpartySub={counterpartySub}
          memo={memo}
          onMemoChange={onMemoChange}
          session={session}
        />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-[#f8f9fb] lg:hidden">
        {onBack && (
          <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
            <button type="button" onClick={onBack} className="text-sm text-gray-600">
              ← 목록
            </button>
            <div className="min-w-0">
              <div className="truncate font-semibold text-gray-900">{counterpartyName}</div>
              <div className="truncate text-xs text-gray-500">
                {WORK_ORDER_STATUS_LABELS[order.status]}
              </div>
            </div>
          </div>
        )}
        <WorkOrderChatCenter
          order={order}
          role={role}
          messages={session.messages}
          loading={session.loading}
          draft={session.draft}
          setDraft={session.setDraft}
          submitting={session.submitting}
          onSend={session.handleSendMessage}
        />
      </section>
    </>
  );
}

function RightSidebar({
  order,
  role,
  counterpartyName,
  counterpartySub,
  memo,
  onMemoChange,
  session,
}: {
  order: WorkOrderRecord;
  role: ViewerRole;
  counterpartyName: string;
  counterpartySub: string;
  memo: string;
  onMemoChange: (value: string) => void;
  session: ReturnType<typeof useWorkOrderSession>;
}) {
  return (
    <div className="space-y-0">
      <div className="border-b border-gray-100 p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
          {getInitial(counterpartyName)}
        </div>
        <div className="mt-3 text-lg font-bold text-gray-900">{counterpartyName}</div>
        <div className="mt-1 text-sm text-gray-500">{counterpartySub}</div>
        <div className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {role === "factory" ? "의뢰자" : "봉제공장"}
        </div>
      </div>

      <div className="border-b border-gray-100 p-4">
        <div className="mb-2 text-sm font-semibold text-gray-900">메모하기</div>
        <textarea
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          placeholder="메모를 입력하세요."
          className="h-24 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
      </div>

      <div className="border-b border-gray-100 p-4">
        <div className="mb-3 text-sm font-semibold text-gray-900">거래 정보</div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">주문번호</dt>
            <dd className="font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">진행 단계</dt>
            <dd className="text-right font-medium text-gray-900">
              {WORK_ORDER_STATUS_LABELS[order.status]}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">작업 대금</dt>
            <dd className="font-medium text-gray-900">{order.amount.toLocaleString()}원</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">의뢰일</dt>
            <dd className="text-gray-900">{new Date(order.created_at).toLocaleDateString("ko-KR")}</dd>
          </div>
          {order.production_type && (
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">작업 유형</dt>
              <dd className="text-gray-900">{PRODUCTION_TYPE_LABELS[order.production_type]}</dd>
            </div>
          )}
          {order.delivery_method && (
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">수령 방법</dt>
              <dd className="text-gray-900">{DELIVERY_METHOD_LABELS[order.delivery_method]}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-b border-gray-100 p-4">
        <div className="mb-3 text-sm font-semibold text-gray-900">작업지시서</div>
        <WorkOrderSummaryCard order={order} />
      </div>

      <div className="p-4">
        <div className="mb-2 text-sm font-semibold text-gray-900">다음 작업</div>
        <WorkOrderActionPanel
          order={order}
          role={role}
          submitting={session.submitting}
          depositorName={session.depositorName}
          onDepositorNameChange={session.setDepositorName}
          orderPayment={session.orderPayment}
          quickPayment={session.quickPayment}
          onAction={session.action}
          compact
        />
      </div>
    </div>
  );
}

export default function WorkOrderMessenger({
  role,
  selectedOrderId,
  senderName,
  basePath,
  factoryId,
  userEmail,
}: WorkOrderMessengerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<WorkOrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderRecord | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [memo, setMemo] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("donggori-work-order-starred");
      if (raw) setStarred(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const persistStarred = (next: Set<string>) => {
    setStarred(next);
    localStorage.setItem("donggori-work-order-starred", JSON.stringify(Array.from(next)));
  };

  const toggleStar = (orderId: string) => {
    const next = new Set(starred);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    persistStarred(next);
  };

  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const data = await getWorkOrders(
          role === "factory" && factoryId
            ? { factoryId }
            : userEmail
              ? { userEmail }
              : undefined
        );
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [role, factoryId, userEmail]);

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }

    const fromList = orders.find((item) => item.id === selectedOrderId);
    if (fromList) {
      setSelectedOrder(fromList);
      return;
    }

    if (loadingList) return;

    const load = async () => {
      setLoadingOrder(true);
      try {
        const data = await getWorkOrderById(selectedOrderId);
        if (data) {
          setSelectedOrder(data);
        } else {
          router.replace(basePath);
        }
      } catch (error) {
        console.error(error);
        router.replace(basePath);
      } finally {
        setLoadingOrder(false);
      }
    };
    load();
  }, [selectedOrderId, orders, loadingList, basePath, router]);

  useEffect(() => {
    if (!selectedOrder) {
      setMemo("");
      return;
    }
    setMemo(localStorage.getItem(`donggori-work-order-memo-${selectedOrder.id}`) || "");
  }, [selectedOrder?.id]);

  const filteredOrders = useMemo(() => {
    let rows = [...orders];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (order) =>
          order.title.toLowerCase().includes(q) ||
          order.factory_name.toLowerCase().includes(q) ||
          order.user_name.toLowerCase().includes(q)
      );
    }
    if (filter === "unread") rows = rows.filter((order) => needsAttention(order, role));
    if (filter === "starred") rows = rows.filter((order) => starred.has(order.id));
    return rows;
  }, [orders, search, filter, starred, role]);

  const unreadCount = useMemo(
    () => orders.filter((order) => needsAttention(order, role)).length,
    [orders, role]
  );

  const handleSelectOrder = (orderId: string) => {
    router.push(`${basePath}/${orderId}`);
  };

  const handleMemoChange = (value: string) => {
    setMemo(value);
    if (selectedOrder) {
      localStorage.setItem(`donggori-work-order-memo-${selectedOrder.id}`, value);
    }
  };

  const handleOrderUpdated = (updated: WorkOrderRecord) => {
    setSelectedOrder(updated);
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const showListOnMobile = !selectedOrderId;

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[560px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <aside
        className={`${
          showListOnMobile ? "flex" : "hidden"
        } w-full max-w-none shrink-0 flex-col border-r border-gray-200 bg-white sm:max-w-[300px] lg:flex`}
      >
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">채팅목록</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#222] px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름을 검색하세요"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            {(
              [
                ["all", "전체"],
                ["unread", "읽지 않음"],
                ["starred", "즐겨찾기"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`pb-1 font-medium transition-colors ${
                  filter === key
                    ? "border-b-2 border-[#222] text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-6 text-center text-sm text-gray-500">불러오는 중...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">채팅방이 없습니다.</div>
          ) : (
            filteredOrders.map((order) => {
              const active = order.id === selectedOrderId;
              const name = getCounterpartyName(order, role);
              const attention = needsAttention(order, role);
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => handleSelectOrder(order.id)}
                  className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                    {getInitial(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-gray-900">{name}</span>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {formatListTime(order.updated_at || order.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-gray-500">{order.title}</p>
                      {attention && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {!selectedOrder ? (
        <section className="flex flex-1 items-center justify-center bg-[#f8f9fb] text-sm text-gray-500">
          채팅방을 선택해 주세요.
        </section>
      ) : loadingOrder ? (
        <section className="flex flex-1 items-center justify-center bg-[#f8f9fb] text-sm text-gray-500">
          채팅을 불러오는 중...
        </section>
      ) : (
        <ActiveChatPanels
          order={selectedOrder}
          role={role}
          senderName={senderName}
          starred={starred.has(selectedOrder.id)}
          onToggleStar={() => toggleStar(selectedOrder.id)}
          memo={memo}
          onMemoChange={handleMemoChange}
          onOrderUpdated={handleOrderUpdated}
          onBack={() => router.push(basePath)}
        />
      )}

    </div>
  );
}
