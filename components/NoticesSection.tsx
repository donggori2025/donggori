"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { PublicNotice } from "@/lib/notices";
import { getPressArticles } from "@/lib/press-news";

const articles = getPressArticles();
const featured = articles.find(({ id }) => id === "shinailbo-20260709");
const briefs = ["startupn-20260605", "herald-20251121", "hkbs-20260709"].flatMap((id) =>
  articles.filter((article) => article.id === id),
);

function NewsMeta({ press, source, date }: { press?: boolean; source: string; date: string }) {
  return (
    <div className="pg-news-meta">
      <span>{press ? "보도자료" : "공지사항"}</span>
      <span>{source}</span>
      {date && <time dateTime={date}>{date.replaceAll("-", ".")}</time>}
    </div>
  );
}

export default function NoticesSection() {
  const [notice, setNotice] = useState<PublicNotice | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadLatestNotice() {
      try {
        const response = await fetch("/api/notices", { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data) && !controller.signal.aborted) {
          setNotice(payload.data[0] ?? null);
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("공지사항을 불러오지 못했습니다.", error);
      }
    }
    void loadLatestNotice();
    return () => controller.abort();
  }, []);

  return (
    <section id="pg-news" className="site-wide pg-news" aria-labelledby="pg-news-title">
      <h2 id="pg-news-title">동고리 소식</h2>
      <div className="pg-news-spread">
        {featured && (
          <a href={featured.url} className="pg-news-feature" target="_blank" rel="noopener noreferrer">
            <div className="pg-news-photo">
              <Image src={featured.image} fill sizes="(max-width: 720px) 92vw, 38vw" alt="" />
            </div>
            <NewsMeta press source={featured.source} date={featured.date} />
            <h3>{featured.title} <ArrowUpRight aria-hidden="true" /></h3>
          </a>
        )}
        <div className="pg-news-briefs">
          <ul className="pg-news-list" aria-label="공지사항과 보도자료">
            {notice && (
              <li>
                <Link href={`/notices/${notice.id}`}>
                  <NewsMeta source="동고리" date={(notice.start_at || notice.created_at || "").slice(0, 10)} />
                  <div className="pg-news-headline"><strong>{notice.title}</strong><ArrowRight size={16} aria-hidden="true" /></div>
                </Link>
              </li>
            )}
            {briefs.slice(0, notice ? 2 : 3).map((article) => (
              <li key={article.id}>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <NewsMeta press source={article.source} date={article.date} />
                  <div className="pg-news-headline"><strong>{article.title}</strong><ArrowUpRight size={16} aria-hidden="true" /></div>
                </a>
              </li>
            ))}
          </ul>
          <div className="pg-news-links">
            <Link href="/notices">공지사항 전체보기 <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/news">보도자료 전체보기 <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
