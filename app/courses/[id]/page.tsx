import { courses } from "@/lib/courses";
import CourseDetailClient from "@/components/CourseDetailClient";
 
export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = courses.find((c) => c.id === params.id);
  if (!course) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 강의입니다.</div>;
  return <CourseDetailClient course={course} />;
} 