"use client";

import { useEffect, useState } from "react";
import WorkOrderMessenger from "@/components/work-orders/WorkOrderMessenger";
import { useAppAuth } from "@/contexts/AuthContext";

export default function MyWorkOrdersPage() {
  const { user } = useAppAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email =
      user?.email ||
      (typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "");
    setUserEmail(email);
  }, [user?.email]);

  return (
    <WorkOrderMessenger role="user" basePath="/my-page/work-orders" userEmail={userEmail} />
  );
}
