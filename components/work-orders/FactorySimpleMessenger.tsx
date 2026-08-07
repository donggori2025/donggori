"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WorkOrderChatCenter, { useWorkOrderSession } from "@/components/work-orders/WorkOrderChatCenter";
import {
  needsAttention,
  WorkOrderActionPanel,
  formatListTime,
} from "@/components/work-orders/WorkOrderMessengerParts";
import { linkifyText } from "@/lib/linkifyText";
import { WORK_ORDER_STATUS_LABELS, type WorkOrderRecord } from "@/lib/workOrderTypes";
import { getWorkOrderById, getWorkOrders } from "@/lib/workOrders";

interface FactorySimpleMessengerProps {
  factoryId: string;
  senderName?: string;
  selectedOrderId?: string | null;
  basePath?: string;
}

function RequestDetailCard({ order }: { order: WorkOrderRecord }) {
  const json = order.work_order_json || {};
  const links = Array.isArray(json.링크) ? (json.링크 as string[]) : [];

  const rows: Array<{ label: string; value: string }> = [
    { label: "의뢰자", value: String(json.담당자 || order.user_name) },
    { label: "연락처", value: String(json.연락처 || "") },
    { label: "브랜드", value: String(json.브랜드 || "미입력") },
    { label: "상세 설명", value: String(json.상세설명 || order.description || "") },
    { label: "요청 사항", value: String(json.요청사항 || "") },
    { label: "샘플", value: String(json.샘플 || "") },
    { label: "패턴", value: String(json.패턴 || "") },
  ].filter((row) => row.value && row.value !== "미입력");

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 md:text-2xl">의뢰 내용</h3>
      <dl className="mt-4 space-y-4 md:space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-base font-semibold text-gray-500 md:text-lg">{row.label}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-gray-900 md:text-xl">
              {linkifyText(row.value)}
            </dd>
          </div>
        ))}
        {links.length > 0 && (
          <div>
            <dt className="text-base font-semibold text-gray-500 md:text-lg">참고 링크</dt>
            <dd className="mt-2 space-y-2">
              {links.map((link, index) => (
                <a
                  key={`${link}-${index}`}
                  href={link.startsWith("http") ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all text-lg text-gray-800 underline md:text-xl"
                >
                  {index + 1}. {link}
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function FactoryOrderDetail({
  order,
  session,
  onBack,
}: {
  order: WorkOrderRecord;
  session: ReturnType<typeof useWorkOrderSession>;
  onBack?: () => void;
}) {
  const needsAction = needsAttention(order, "factory");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex min-h-[48px] items-center gap-2 text-lg font-semibold text-gray-700 md:hidden"
        >
          ← 목록으로
        </button>
      )}

      <div
        className={`mb-4 rounded-2xl border-2 px-5 py-4 text-center md:py-5 ${
          needsAction ? "border-gray-400 bg-gray-100" : "border-gray-200 bg-gray-50"
        }`}
      >
        <p className="text-lg font-semibold text-gray-700 md:text-xl">{order.user_name}님 의뢰</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
          {WORK_ORDER_STATUS_LABELS[order.status]}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <RequestDetailCard order={order} />

        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white md:min-h-[320px]">
          <div className="shrink-0 border-b border-gray-100 px-5 py-4">
            <h3 className="text-xl font-bold text-gray-900 md:text-2xl">채팅</h3>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <WorkOrderChatCenter
              order={order}
              role="factory"
              messages={session.messages}
              loading={session.loading}
              draft={session.draft}
              setDraft={session.setDraft}
              submitting={session.submitting}
              onSend={session.handleSendMessage}
              large
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FactoryActionPanel({
  order,
  session,
}: {
  order: WorkOrderRecord;
  session: ReturnType<typeof useWorkOrderSession>;
}) {
  return (
    <WorkOrderActionPanel
      order={order}
      role="factory"
      submitting={session.submitting}
      depositorName={session.depositorName}
      onDepositorNameChange={session.setDepositorName}
      orderPayment={session.orderPayment}
      quickPayment={session.quickPayment}
      onAction={session.action}
      onSendMessage={session.handleSendMessage}
      large
      compact
    />
  );
}

function FactoryOrderList({
  orders,
  selectedOrderId,
  loadingList,
  loadError,
  newCount,
  onSelect,
}: {
  orders: WorkOrderRecord[];
  selectedOrderId?: string | null;
  loadingList: boolean;
  loadError: string | null;
  newCount: number;
  onSelect: (orderId: string) => void;
}) {
  return (
    <>
      <div className="border-b border-gray-100 p-5 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">의뢰 목록</h2>
        {newCount > 0 && (
          <p className="mt-2 text-lg font-semibold text-gray-700 md:text-xl">확인 필요 {newCount}건</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loadingList ? (
          <p className="p-6 text-center text-lg text-gray-500 md:text-xl">불러오는 중...</p>
        ) : loadError ? (
          <p className="p-6 text-center text-lg text-gray-600 md:text-xl">{loadError}</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-lg text-gray-500 md:text-xl">아직 의뢰가 없습니다.</p>
        ) : (
          orders.map((order) => {
            const active = order.id === selectedOrderId;
            const urgent = needsAttention(order, "factory");
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelect(order.id)}
                className={`flex w-full min-h-[88px] flex-col justify-center gap-1 border-b border-gray-100 px-5 py-5 text-left transition md:min-h-[100px] md:px-6 ${
                  active ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-bold text-gray-900 md:text-2xl">{order.user_name}</span>
                  <span className="shrink-0 text-sm text-gray-500 md:text-base">
                    {formatListTime(order.updated_at || order.created_at)}
                  </span>
                </div>
                <p className="line-clamp-2 text-lg text-gray-600 md:text-xl">{order.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium text-gray-700 md:text-lg">
                    {WORK_ORDER_STATUS_LABELS[order.status]}
                  </span>
                  {urgent && (
                    <span className="rounded-full bg-gray-800 px-3 py-0.5 text-sm font-bold text-white md:text-base">
                      확인 필요
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

function FactoryActiveWorkspace({
  order,
  orders,
  selectedOrderId,
  senderName,
  loadingList,
  loadError,
  newCount,
  onSelect,
  onOrderUpdated,
  onBack,
}: {
  order: WorkOrderRecord;
  orders: WorkOrderRecord[];
  selectedOrderId: string;
  senderName?: string;
  loadingList: boolean;
  loadError: string | null;
  newCount: number;
  onSelect: (orderId: string) => void;
  onOrderUpdated: (order: WorkOrderRecord) => void;
  onBack: () => void;
}) {
  const session = useWorkOrderSession({
    order,
    role: "factory",
    senderName,
    onOrderUpdated,
  });

  return (
    <>
      <aside className="hidden min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white md:flex md:w-[38%] md:max-w-[420px]">
        <FactoryOrderList
          orders={orders}
          selectedOrderId={selectedOrderId}
          loadingList={loadingList}
          loadError={loadError}
          newCount={newCount}
          onSelect={onSelect}
        />
        <div className="shrink-0 border-t-2 border-gray-200 bg-white p-4">
          <FactoryActionPanel order={order} session={session} />
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border-2 border-gray-200 bg-[#f8f9fb] p-4 md:p-5">
        <FactoryOrderDetail order={order} session={session} onBack={onBack} />
        <div className="shrink-0 border-t-2 border-gray-200 bg-white p-4 md:hidden">
          <FactoryActionPanel order={order} session={session} />
        </div>
      </main>
    </>
  );
}

export default function FactorySimpleMessenger({
  factoryId,
  senderName,
  selectedOrderId,
  basePath = "/factory-my-page/work-orders",
}: FactorySimpleMessengerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<WorkOrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderRecord | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      setLoadError(null);
      try {
        const data = await getWorkOrders({ factoryId });
        setOrders(data);
      } catch (error) {
        console.error(error);
        setLoadError("의뢰 목록을 불러오지 못했습니다. 다시 로그인해 주세요.");
        setOrders([]);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [factoryId]);

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

  const newCount = useMemo(
    () => orders.filter((order) => needsAttention(order, "factory")).length,
    [orders]
  );

  const handleSelect = (orderId: string) => {
    router.push(`${basePath}/${orderId}`);
  };

  const handleOrderUpdated = (updated: WorkOrderRecord) => {
    setSelectedOrder(updated);
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const showDetail = Boolean(selectedOrderId);

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[640px] flex-col gap-4 md:flex-row md:gap-5">
      {showDetail && selectedOrder ? (
        <FactoryActiveWorkspace
          order={selectedOrder}
          orders={orders}
          selectedOrderId={selectedOrderId!}
          senderName={senderName}
          loadingList={loadingList}
          loadError={loadError}
          newCount={newCount}
          onSelect={handleSelect}
          onOrderUpdated={handleOrderUpdated}
          onBack={() => router.push(basePath)}
        />
      ) : (
        <>
          <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white md:w-[38%] md:max-w-[420px]">
            <FactoryOrderList
              orders={orders}
              selectedOrderId={selectedOrderId}
              loadingList={loadingList}
              loadError={loadError}
              newCount={newCount}
              onSelect={handleSelect}
            />
          </aside>

          <main className="hidden min-h-0 min-w-0 flex-1 flex-col rounded-2xl border-2 border-gray-200 bg-[#f8f9fb] p-4 md:flex md:p-5">
            {showDetail && !selectedOrder ? (
              <div className="flex flex-1 items-center justify-center text-lg text-gray-500 md:text-xl">
                {loadingOrder ? "불러오는 중..." : "의뢰를 찾을 수 없습니다."}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center text-lg text-gray-500 md:text-2xl">
                왼쪽에서 의뢰를 선택해 주세요.
              </div>
            )}
          </main>
        </>
      )}

      {showDetail && !selectedOrder && (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border-2 border-gray-200 bg-[#f8f9fb] p-4 md:hidden">
          <div className="flex flex-1 items-center justify-center text-lg text-gray-500">
            {loadingOrder ? "불러오는 중..." : "의뢰를 찾을 수 없습니다."}
          </div>
        </main>
      )}
    </div>
  );
}
