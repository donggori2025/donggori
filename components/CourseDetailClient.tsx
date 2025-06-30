"use client";
import { useUser } from "@clerk/nextjs";
import LikeButton from "./LikeButton";
import PaymentButton from "./PaymentButton";
import CourseImage from "./CourseImage";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  // 필요시 필드 추가
}

export default function CourseDetailClient({ course }: { course: Course }) {
  const { user } = useUser();
  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
        <CourseImage
          src={course.image || ''}
          alt={course.title}
          className="w-full h-60 object-cover rounded mb-4"
        />
        <p className="text-base text-gray-700 mb-4">{course.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-semibold">{course.price.toLocaleString()}원</span>
          <LikeButton courseId={course.id} />
          <Button variant="outline" asChild>
            <Link href="/">목록으로</Link>
          </Button>
        </div>
        {user && (
          <PaymentButton
            orderId={`order_${course.id}_${user.id}`}
            amount={course.price}
            orderName={course.title}
            customerName={user.fullName || user.username || "회원"}
          />
        )}
        {!user && (
          <div className="mt-4 text-center text-gray-400 text-sm">로그인 후 결제할 수 있습니다.</div>
        )}
      </div>
    </main>
  );
} 