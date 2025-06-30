"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const courseId = orderId?.split("_")[1];

  useEffect(() => {
    // 결제 성공 시 구매 내역 저장
    const savePurchase = async () => {
      if (!user || !orderId || !paymentKey || !amount || !courseId) return;
      // 이미 구매 내역이 있으면 중복 저장 방지
      const { data: exist } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      if (!exist) {
        await supabase.from("purchases").insert({
          user_id: user.id,
          course_id: courseId,
          order_id: orderId,
          payment_key: paymentKey,
          amount: Number(amount),
        });
      }
    };
    savePurchase();
  }, [user, orderId, paymentKey, amount, courseId]);

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
      <h1 className="text-2xl font-bold text-toss-blue mb-4">결제 성공!</h1>
      <p className="mb-2">주문번호: <span className="font-mono">{orderId}</span></p>
      <p className="mb-2">결제금액: <span className="font-semibold">{amount}원</span></p>
      <p className="mb-6 text-gray-500 text-sm">결제가 정상적으로 완료되었습니다.<br/>내 강의실에서 강의를 확인하세요.</p>
      <Link href="/my-courses" className="inline-block bg-toss-blue text-white rounded-full px-6 py-2 font-bold hover:bg-blue-600 transition-colors mr-2">내 강의실</Link>
      <Link href="/" className="inline-block bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-bold hover:bg-gray-300 transition-colors">홈으로</Link>
    </div>
  );
} 