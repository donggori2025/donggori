import { courses } from "@/lib/courses";
import CourseDetailClient from "@/components/CourseDetailClient";
import { Course } from "@/components/CourseDetailClient";
 
export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const raw = courses.find((c) => String(c.id) === String(params.id));
  if (!raw) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 강의입니다.</div>;
  // Course 타입에 맞게 변환
  const course: Course = {
    id: String(raw.id),
    title: (raw as any).title || (raw as any).name || "",
    description: raw.description,
    price: (raw as any).price || 0,
    image: (raw as any).image || undefined,
  };
  return <CourseDetailClient course={course} />;
} 