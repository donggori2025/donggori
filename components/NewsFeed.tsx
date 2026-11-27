"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdArrowForward, MdArrowOutward } from "react-icons/md";
import { getPressArticles } from "@/lib/press-news";
import type { PublicNotice } from "@/lib/notices";

export const pressRows = getPressArticles().map((article) => ({
  ...article,
  href: article.url,
  tag: "보도자료" as const,
}));

type NewsRow = {
  title: string;
  date: string;
  href: string;
  tag: "공지사항" | "보도자료";
  source: string;
  image?: string;
  summary?: string;
};

export function useNoticeRows() {
  const [data, setData] = useState<PublicNotice[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    let retry: number | undefined;
    async function load(canRetry: boolean) {
      try {
        const res = await fetch("/api/notices", { signal: controller.signal });
        const body = await res.json();
        if (!res.ok || !body.success || !Array.isArray(body.data)) throw new Error("notices");
        setData(body.data);
        setStatus("ready");
      } catch {
        if (controller.signal.aborted) return;
        if (canRetry) retry = window.setTimeout(() => void load(false), 600);
        else setStatus("error");
      }
    }
    void load(true);
    return () => {
      controller.abort();
      window.clearTimeout(retry);
    };
  }, []);
  const rows: NewsRow[] = data.map((n) => ({
    title: n.title,
    date: (n.start_at || n.created_at || "").slice(0, 10),
    href: `/notices/${encodeURIComponent(n.id)}`,
    tag: "공지사항" as const,
    source: "동고리",
  })).sort((a, b) => b.date.localeCompare(a.date));
  return { rows, status };
}

export function NewsList({ entries, previews = false }: { entries: NewsRow[]; previews?: boolean }) {
  return (
    <ul className="pg-news-list">
      {entries.map((entry) => {
        const external = entry.tag === "보도자료";
        const contents = (
          <>
            <div className="min-w-0 flex-1">
              <div className="pg-news-meta">
                <span>{entry.tag}</span>
                <span>{entry.source}</span>
                {entry.date && <time dateTime={entry.date}>{entry.date.replaceAll("-", ".")}</time>}
              </div>
              <div className="pg-news-headline">
                <strong>{entry.title}</strong>
                {external ? <MdArrowOutward aria-label="새 창" /> : <MdArrowForward aria-hidden="true" />}
              </div>
              {previews && entry.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dg-muted">{entry.summary}</p>}
            </div>
            {previews && entry.image && (
              <Image src={entry.image} alt="" width={144} height={96} sizes="(max-width: 650px) 72px, 144px" className="pg-story-thumb" />
            )}
          </>
        );
        return (
          <li key={entry.href}>
            {external
              ? <a href={entry.href} target="_blank" rel="noopener noreferrer">{contents}</a>
              : <Link href={entry.href}>{contents}</Link>}
          </li>
        );
      })}
    </ul>
  );
}
