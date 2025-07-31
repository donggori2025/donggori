import React from "react";
import Link from "next/link";
import { notices } from "@/lib/notices";

const NoticesSection = () => {
  // 최신 공지사항 5개 (최신순 정렬)
  const latestNotices = [...notices]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 min-h-[300px] sm:min-h-[400px] flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">공지사항</h2>
            <div className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-4">동고리의 다양한 소식들을 확인해보세요.</div>
          </div>
          <Link 
            href="/notices" 
            className="text-sm font-medium border-b border-gray-400 pb-1 hover:border-gray-600 transition-colors self-start sm:self-auto"
            style={{ fontSize: '14px' }}
          >
            전체보기
          </Link>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {latestNotices.map((notice) => (
            <Link 
              key={notice.id} 
              href={`/notices/${notice.id}`}
              className="block border-b border-gray-100 py-3 sm:py-4 hover:bg-gray-50 transition-colors rounded-lg px-2 sm:px-4 -mx-2 sm:-mx-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      notice.type === '공지' ? 'bg-red-100 text-red-700' : 
                      notice.type === '채용공고' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {notice.type}
                    </span>
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{notice.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 sm:ml-4 flex-shrink-0">
                  {notice.createdAt}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NoticesSection; 