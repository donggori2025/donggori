"use client";
import Link from "next/link";
import PortalPage from "@/components/PortalPage";

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at?: string | null;
  start_at?: string | null;
  createdAt?: string;
  category?: string;
}

interface NoticeDetailClientProps {
  notice: Notice;
}

export default function NoticeDetailClient({ notice }: NoticeDetailClientProps) {

  return (
    <PortalPage title={notice.title} description={[notice.category || "공지", (notice.start_at || notice.created_at || "").slice(0, 10)].filter(Boolean).join(" · ")}>
      <article className="pg-panel mx-auto max-w-4xl p-6 sm:p-10">
        <p className="whitespace-pre-line break-words leading-loose">{notice.content}</p>
      </article>
      <div className="mx-auto mt-6 max-w-4xl">
        <Link href="/news?type=notice" className="inline-flex min-h-11 items-center font-semibold">← 공지사항 목록</Link>
      </div>
    </PortalPage>
  );
}
