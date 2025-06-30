import { courses } from "@/lib/courses";
import CourseDetailClient, { Course } from "@/components/CourseDetailClient";

// courses 배열의 원소 타입을 명확히 선언
interface RawCourse {
  id: string | number;
  name?: string;
  title?: string;
  description: string;
  price?: number;
  image?: string;
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const raw: RawCourse | undefined = courses.find((c: RawCourse) => String(c.id) === String(params.id));
  if (!raw) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 강의입니다.</div>;
  // Course 타입에 맞게 변환
  const course: Course = {
    id: String(raw.id),
    title: raw.title ?? raw.name ?? "",
    description: raw.description,
    price: raw.price ?? 0,
    image: raw.image ?? undefined,
  };
  return <CourseDetailClient course={course} />;
} 