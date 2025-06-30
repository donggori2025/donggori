import { notices } from "@/lib/notices";
import Link from "next/link";

export default function NoticesPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-toss-blue mb-6">공지사항</h1>
      <div className="space-y-4">
        {notices.map(notice => (
          <Link key={notice.id} href={`/notices/${notice.id}`} className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="font-bold text-lg text-toss-blue mb-1">{notice.title}</div>
            <div className="text-sm text-gray-500 mb-1 line-clamp-2">{notice.content}</div>
            <div className="text-xs text-gray-400 text-right">{notice.createdAt}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 