"use client";
import { loadTossPayments } from "@tosspayments/payment-sdk";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
}

export default function PaymentButton({ orderId, amount, orderName, customerName }: PaymentButtonProps) {
  const handleClick = async () => {
    console.log('TOSS KEY:', process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
    const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
    console.log('tossPayments:', tossPayments);
    tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName,
      customerName,
      successUrl: process.env.NEXT_PUBLIC_TOSS_SUCCESS_URL!,
      failUrl: process.env.NEXT_PUBLIC_TOSS_FAIL_URL!,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-toss-blue text-white rounded-full px-6 py-2 font-bold hover:bg-blue-600 transition-colors mt-4 w-full"
    >
      결제하기
    </button>
  );
} 