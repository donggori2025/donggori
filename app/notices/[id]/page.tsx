import { notices } from "@/lib/notices";
import Link from "next/link";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = notices.find(n => n.id === id);
  if (!notice) {
    return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공지입니다.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="font-bold text-xl text-toss-blue mb-2">{notice.title}</div>
        <div className="text-xs text-gray-400 mb-4 text-right">{notice.createdAt}</div>
        <div className="text-base text-gray-700 whitespace-pre-line">{notice.content}</div>
      </div>
      <div className="text-center">
        <Link href="/notices" className="text-toss-blue hover:underline">← 공지사항 목록으로</Link>
      </div>
    </div>
  );
} 