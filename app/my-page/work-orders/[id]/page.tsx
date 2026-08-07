"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkOrderMessenger from "@/components/work-orders/WorkOrderMessenger";
import { useAppAuth } from "@/contexts/AuthContext";

export default function MyWorkOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAppAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email =
      user?.email ||
      (typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "");
    setUserEmail(email);
  }, [user?.email]);

  return (
    <WorkOrderMessenger
      role="user"
      selectedOrderId={orderId}
      basePath="/my-page/work-orders"
      userEmail={userEmail}
    />
  );
}
