"use client";

import { useState } from "react";
import Link from "next/link";
import { NewsList, pressRows, useNoticeRows } from "@/components/NewsFeed";

const categories = [
  { key: "all", label: "전체", href: "/news" },
  { key: "notice", label: "공지사항", href: "/news?type=notice" },
  { key: "press", label: "보도자료", href: "/news?type=press" },
] as const;
const pageSize = 10;

type Category = typeof categories[number]["key"];

export default function NewsArchive({ category }: { category: Category }) {
  const notices = useNoticeRows();
  return <ArchiveView key={category} category={category} notices={notices} />;
}

function ArchiveView({ category, notices }: { category: Category; notices: ReturnType<typeof useNoticeRows> }) {
  const [oldestFirst, setOldestFirst] = useState(false);
  const [page, setPage] = useState(1);
  const entries = [
    ...(category === "press" ? [] : notices.rows),
    ...(category === "notice" ? [] : pressRows),
  ].sort((a, b) => oldestFirst ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  const pages = Math.ceil(entries.length / pageSize);
  const start = (page - 1) * pageSize;
  return (
    <div className="pg-archive">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="소식 분류" className="pg-segments">
          {categories.map((item) => (
            <Link key={item.key} href={item.href} scroll={false} aria-current={category === item.key ? "page" : undefined}>{item.label}</Link>
          ))}
        </nav>
        <select aria-label="소식 정렬" value={oldestFirst ? "asc" : "desc"}
          onChange={(e) => { setOldestFirst(e.target.value === "asc"); setPage(1); }}
          className="min-h-10 rounded-xl border border-blue-100 bg-white px-3 text-sm">
          <option value="desc">최신순</option>
          <option value="asc">오래된순</option>
        </select>
      </div>
      {category !== "press" && notices.status !== "ready" && (
        <p className="py-3 text-sm text-dg-muted" role="status">
          {notices.status === "loading" ? "공지사항을 불러오는 중입니다." : "공지사항을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."}
        </p>
      )}
      {entries.length > 0
        ? <NewsList previews entries={entries.slice(start, start + pageSize)} />
        : notices.status === "ready" && <p className="py-12 text-center">등록된 글이 없습니다.</p>}
      {pages > 1 && (
        <nav aria-label="소식 페이지" className="pg-pages">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>이전</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" aria-label={`${n}페이지`} aria-current={n === page ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>다음</button>
        </nav>
      )}
    </div>
  );
}
