"use client";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at?: string | null;
  start_at?: string | null;
  createdAt?: string;
  category?: string;
}

interface NoticeDetailClientProps {
  notice: Notice;
}

export default function NoticeDetailClient({ notice }: NoticeDetailClientProps) {

  return (
    <div className="min-h-[65vh]">
      <div className={`${PAGE_CONTAINER_CLASS} py-16`}>
        {/* 상단 섹션 */}
        <div className="mb-12">
          <div className="text-sm font-semibold text-dg-brand mb-2">{notice.category || '공지'}</div>
          <h1 className="dg-page-title mb-4">
            {notice.title}
          </h1>
          <div className="text-lg text-gray-600 mb-8">{(notice.start_at || notice.created_at || '').slice(0,10)}</div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 공지 내용 */}
          <div className="dg-panel p-5 sm:p-8">
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
