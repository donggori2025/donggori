"use client";

import Link from "next/link";
import Image from "next/image";
import { MdArrowForward, MdArrowOutward } from "react-icons/md";
import { NewsList, pressRows, useNoticeRows } from "@/components/NewsFeed";

const featured = pressRows.find((article) => article.id === "shinailbo-20260709");
const otherStories = ["startupn-20260605", "herald-20251121", "hkbs-20260709"].flatMap((id) =>
  pressRows.filter((row) => row.id === id),
);

export function NewsDesk() {
  const { rows } = useNoticeRows();
  const frontRows = [...rows.slice(0, 1), ...otherStories].slice(0, 3);

  return (
    <section id="pg-news" className="pg-news pg-wide" aria-labelledby="pg-news-title">
      <h2 id="pg-news-title">동고리 소식</h2>
      <div className="pg-news-spread">
        {featured && (
          <a className="pg-news-feature" href={featured.url} target="_blank" rel="noopener noreferrer">
            <div className="pg-news-photo">
              <Image src={featured.image} fill sizes="(max-width: 720px) 92vw, 38vw" alt="" />
            </div>
            <div className="pg-news-meta">
              <span>보도자료</span>
              <span>{featured.source}</span>
              <time dateTime={featured.date}>{featured.date.replaceAll("-", ".")}</time>
            </div>
            <h3>
              {featured.title} <MdArrowOutward aria-hidden="true" />
            </h3>
          </a>
        )}
        <div className="pg-news-briefs">
          <NewsList entries={frontRows} />
          <Link className="pg-news-all" href="/news" aria-label="동고리 소식 전체보기">
            전체보기 <MdArrowForward aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
