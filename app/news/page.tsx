"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getPressArticles } from "@/lib/press-news";
import { PageShell } from "@/components/ui/app-ui";

const PAGE_SIZE = 10;

export default function NewsPage() {
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const articles = useMemo(() => getPressArticles(), []);

  const sortedNews = useMemo(() => {
    return [...articles].sort((a, b) => {
      if (a.date === b.date) return 0;
      return sort === "desc"
        ? a.date < b.date ? 1 : -1
        : a.date > b.date ? 1 : -1;
    });
  }, [articles, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleNews = sortedNews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeSort = (next: "desc" | "asc") => {
    setSort(next);
    setPage(1);
  };

  return (
    <PageShell>
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between gap-4">
            <h1 className="dg-page-title">News</h1>
            <div className="flex shrink-0 items-center gap-2">
              <label htmlFor="news-sort" className="text-sm text-gray-400">정렬</label>
              <select
                id="news-sort"
                value={sort}
                onChange={(e) => changeSort(e.target.value as "desc" | "asc")}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
              >
                <option value="desc">내림차순 (최신순)</option>
                <option value="asc">오름차순 (오래된순)</option>
              </select>
            </div>
          </div>
        </header>
        <ul className="divide-y divide-gray-100">
          {visibleNews.map((article) => (
            <li key={article.id} className="py-6 sm:py-7">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">{article.source}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:underline">
                    {article.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                    {article.summary}
                  </p>
                  <span className="mt-2 inline-block text-xs font-bold text-gray-400 group-hover:text-gray-700">
                    원문 보기 →
                  </span>
                </div>
                <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-gray-100 sm:h-24 sm:w-36">
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
        {sortedNews.length > PAGE_SIZE && (
          <nav className="flex items-center justify-center gap-1 mt-10" aria-label="뉴스 페이지">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="min-w-9 h-9 px-2 rounded-lg text-sm text-gray-500 disabled:text-gray-300 hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-9 h-9 rounded-lg text-sm font-bold ${currentPage === n ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                aria-current={currentPage === n ? "page" : undefined}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="min-w-9 h-9 px-2 rounded-lg text-sm text-gray-500 disabled:text-gray-300 hover:bg-gray-50"
            >
              다음
            </button>
          </nav>
        )}
    </PageShell>
  );
}
