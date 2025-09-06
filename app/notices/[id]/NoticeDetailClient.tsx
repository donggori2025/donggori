"use client";
import Link from "next/link";

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
  start_at?: string;
  createdAt?: string;
  category?: string;
}

interface NoticeDetailClientProps {
  notice: Notice;
}

export default function NoticeDetailClient({ notice }: NoticeDetailClientProps) {

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto py-16 px-6">
        {/* 상단 섹션 */}
        <div className="mb-12">
          <div className="text-sm text-gray-500 mb-2">{notice.category || '공지'}</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {notice.title}
          </h1>
          <div className="text-lg text-gray-600 mb-8">{(notice.start_at || notice.created_at || '').slice(0,10)}</div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 공지 내용 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
              {notice.content}
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <Link 
            href="/notices" 
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>목록으로</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

