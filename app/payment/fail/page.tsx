"use client";
export const dynamic = "force-dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">결제 실패</h1>
      <p className="mb-4 text-gray-500">{message || "결제가 정상적으로 처리되지 않았습니다."}</p>
      <Link href="/" className="inline-block bg-toss-blue text-white rounded-full px-6 py-2 font-bold hover:bg-blue-600 transition-colors">홈으로</Link>
    </div>
  );
} 