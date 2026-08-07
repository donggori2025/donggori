"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { WORK_ORDER_STATUS_LABELS, type WorkOrderRecord } from "@/lib/workOrderTypes";
import { getWorkOrders, runWorkOrderAction } from "@/lib/workOrders";

export default function AdminWorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getWorkOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmPayment = async (orderId: string, type: "order" | "quick") => {
    try {
      await runWorkOrderAction(
        orderId,
        type === "order" ? "admin_confirm_order_payment" : "admin_confirm_quick_payment"
      );
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "확인에 실패했습니다.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="거래·입금 관리"
        description="작업 대금 및 퀵 배송비 입금 확인을 처리합니다."
      />

      <AdminCard title={`거래 목록 (${orders.length})`}>
        {loading ? (
          <div className="py-10 text-center text-gray-500">불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-gray-500">등록된 거래가 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{order.title}</div>
                    <div className="text-sm text-gray-600">
                      {order.user_name} → {order.factory_name}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {WORK_ORDER_STATUS_LABELS[order.status]}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/my-page/work-orders/${order.id}`}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      사용자 화면
                    </Link>
                    <Link
                      href={`/factory-my-page/work-orders/${order.id}`}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      공장 화면
                    </Link>
                    {order.status === "order_payment_submitted" && (
                      <button
                        onClick={() => confirmPayment(order.id, "order")}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white"
                      >
                        작업 대금 확인
                      </button>
                    )}
                    {order.status === "quick_payment_submitted" && (
                      <button
                        onClick={() => confirmPayment(order.id, "quick")}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white"
                      >
                        퀵 배송비 확인
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
