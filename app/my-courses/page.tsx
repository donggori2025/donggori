"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { courses } from "@/lib/courses";
import Link from "next/link";

export default function MyCoursesPage() {
  const { user } = useUser();
  const [myCourses, setMyCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPurchases = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("purchases")
        .select("course_id")
        .eq("user_id", user.id);
      setMyCourses(data?.map((row) => row.course_id) || []);
      setLoading(false);
    };
    fetchPurchases();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-lg text-gray-500">로그인 후 내 강의실을 확인할 수 있습니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-lg text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const purchasedCourses = courses.filter((c) => myCourses.includes(c.id));

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <h1 className="text-2xl font-bold text-toss-blue mb-6 text-center">내 강의실</h1>
      {purchasedCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          아직 구매한 강의가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {purchasedCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="font-bold text-lg text-toss-blue mb-2">{course.title}</div>
              <div className="text-sm text-gray-500 mb-2">{course.description}</div>
              <div className="text-right font-semibold">{course.price.toLocaleString()}원</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 