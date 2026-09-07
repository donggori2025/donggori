"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  start_at?: string;
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
      <section className="dg-section w-full bg-white">
        <div className={`w-full ${PAGE_CONTAINER_CLASS}`}>
          <div className="text-center text-gray-500 text-sm">공지사항을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="dg-section w-full bg-white">
      <div className={`w-full ${PAGE_CONTAINER_CLASS}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-3">
          <div>
            <h2 className="dg-section-title">공지사항</h2>
            <p className="text-sm text-gray-500 mt-2">동고리의 다양한 소식을 확인해보세요.</p>
          </div>
          <Link
            href="/notices"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors self-start sm:self-auto"
          >
            전체보기 →
          </Link>
        </div>

        <div>
          {notices.length === 0 ? (
            <div className="text-center text-gray-500 py-8">등록된 공지사항이 없습니다.</div>
          ) : (
            notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="block border-b border-gray-300/70 py-5 transition-colors hover:bg-white/60 sm:py-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 md:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2">
                      <span className="text-xs font-semibold text-gray-400">
                        {notice.category}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm md:text-base">{notice.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 sm:ml-4 flex-shrink-0">
                    {(notice.start_at || notice.created_at) ? (notice.start_at || notice.created_at).slice(0, 10) : ''}
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
