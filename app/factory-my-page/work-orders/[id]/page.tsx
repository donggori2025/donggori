"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FactorySimpleMessenger from "@/components/work-orders/FactorySimpleMessenger";

export default function FactoryWorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [factoryAuth, setFactoryAuth] = useState<{
    factoryId: string;
    factoryName: string;
  } | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem("factoryAuth");
    const userType = localStorage.getItem("userType");
    if (!storedAuth || userType !== "factory") {
      router.push("/sign-in");
      return;
    }
    setFactoryAuth(JSON.parse(storedAuth));
  }, [router]);

  if (!factoryAuth) {
    return <div className="py-16 text-center text-xl text-gray-500">불러오는 중...</div>;
  }

  return (
    <FactorySimpleMessenger
      factoryId={factoryAuth.factoryId}
      senderName={factoryAuth.factoryName}
      selectedOrderId={orderId}
    />
  );
}
