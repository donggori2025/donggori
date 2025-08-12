"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const NoticesSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices');
        const json = await response.json();
        
        if (response.ok && json.success) {
          // 최신 공지사항 5개 (최신순 정렬)
          const latestNotices = (json.data || [])
            .sort((a: Notice, b: Notice) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
          setNotices(latestNotices);
        } else {
          console.error('공지사항 로드 실패:', json.error);
        }
      } catch (error) {
        console.error('공지사항 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-6 sm:py-8 md:py-12 lg:py-16 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center text-gray-500">공지사항을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-6 sm:py-8 md:py-12 lg:py-16 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-3 sm:gap-4 md:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1">공지사항</h2>
            <div className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-4">동고리의 다양한 소식들을 확인해보세요.</div>
          </div>
          <Link 
            href="/notices" 
            className="text-xs sm:text-sm font-medium border-b border-gray-400 pb-1 hover:border-gray-600 transition-colors self-start sm:self-auto"
            style={{ fontSize: '14px' }}
          >
            전체보기
          </Link>
        </div>
        
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {notices.length === 0 ? (
            <div className="text-center text-gray-500 py-8">등록된 공지사항이 없습니다.</div>
          ) : (
            notices.map((notice) => (
              <Link 
                key={notice.id} 
                href={`/notices/${notice.id}`}
                className="block border-b border-gray-100 py-2 sm:py-3 md:py-4 hover:bg-gray-50 transition-colors rounded-lg px-2 sm:px-4 -mx-2 sm:-mx-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 md:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2">
                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
                        notice.category === '공지' ? 'bg-red-100 text-red-700' : 
                        notice.category === '채용공고' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notice.category}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm md:text-base">{notice.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 sm:ml-4 flex-shrink-0">
                    {notice.created_at ? notice.created_at.slice(0, 10) : ''}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NoticesSection; 