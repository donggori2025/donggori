"use client";
import Link from "next/link";
import { useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
  createdAt?: string;
}

interface NoticeDetailClientProps {
  notice: Notice;
}

export default function NoticeDetailClient({ notice }: NoticeDetailClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto py-16 px-6">
        {/* 상단 섹션 */}
        <div className="mb-12">
          <div className="text-sm text-gray-500 mb-2">업데이트</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {notice.title}
          </h1>
          <div className="text-lg text-gray-600 mb-8">{(notice.created_at || '').slice(0,10)}</div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 인사말 */}
          <div className="text-lg text-gray-700">
            안녕하세요, 동고리입니다.
          </div>

          {/* 업데이트 일정 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">■ 업데이트 일정</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-2 text-gray-700">
                <p>• 업데이트 일시: {(notice.created_at || '').slice(0,10)} 오전 8시경 (한국 시간 기준)</p>
                <p>• 작업 시작: {notice.createdAt || (notice.created_at || '').slice(0,10)} 오후 8시부터</p>
                <p>• 서비스 이용: 작업 중에도 이용 가능하나 일시적으로 불안정할 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 업데이트 내용 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">■ 업데이트 내용</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {isExpanded ? (
                    notice.content
                  ) : (
                    <>
                      {notice.content.slice(0, 200)}
                      {notice.content.length > 200 && (
                        <span className="text-gray-500">...</span>
                      )}
                    </>
                  )}
                </div>
                {notice.content.length > 200 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {isExpanded ? "접기" : "계속 읽기"}
                  </button>
                )}
              </div>
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

