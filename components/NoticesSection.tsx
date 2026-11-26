"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPressArticles } from "@/lib/press-news";

const articles = getPressArticles();
const featured = articles.find((article) => article.id === "shinailbo-20260709");
const pressBriefs = articles.filter((article) => article !== featured);

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

  return (
    <section className="landing-news site-wide" aria-labelledby="landing-news-title">
      <div className="section-heading">
        <h2 id="landing-news-title">동고리 소식</h2>
        <Link className="landing-link" href="/news">보도자료 전체보기 <ArrowRight size={16} /></Link>
      </div>
      <div className="news-spread">
        {featured && (
          <a href={featured.url} className="news-feature" target="_blank" rel="noopener noreferrer">
            <div className="news-photo">
              <Image src={featured.image} alt="" fill sizes="(max-width: 700px) 92vw, 36vw" className="object-cover" />
            </div>
            <p>보도자료 · {featured.source} · <time dateTime={featured.date}>{featured.date}</time></p>
            <h3>{featured.title} <ArrowUpRight size={18} /></h3>
          </a>
        )}
        <div>
          <ul className="news-rows" aria-label="최근 공지사항과 보도자료">
            {loading && <li role="status">공지사항을 불러오는 중입니다.</li>}
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link href={`/notices/${notice.id}`}>
                  <small>{notice.category || "공지사항"} · {(notice.start_at || notice.created_at || "").slice(0, 10)}</small>
                  <strong>{notice.title}</strong>
                  {notice.content && <span className="line-clamp-2">{notice.content}</span>}
                </Link>
              </li>
            ))}
            {pressBriefs.slice(0, Math.max(0, 3 - notices.length)).map((article) => (
              <li key={article.id}>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <small>보도자료 · {article.source} · {article.date}</small>
                  <strong>{article.title}</strong>
                </a>
              </li>
            ))}
          </ul>
          <Link className="landing-link mt-4" href="/notices">공지사항 전체보기 <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
};

export default NoticesSection;
