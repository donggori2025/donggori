import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabaseService";
import { isPublicNoticeVisible, PUBLIC_NOTICE_SELECT, type PublicNotice } from "@/lib/notices";
import NoticeDetailClient from "./NoticeDetailClient";

export const dynamic = "force-dynamic";

async function getNotice(id: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notices")
    .select(PUBLIC_NOTICE_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  return { notice: data as PublicNotice | null, error };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { notice } = await getNotice(id);
  if (!notice || !isPublicNoticeVisible(notice)) return { title: "공지사항", robots: { index: false, follow: false } };
  return {
    title: notice.title,
    description: notice.content.slice(0, 160),
    alternates: { canonical: `/notices/${id}` },
  };
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { notice, error } = await getNotice(id);
  if (error || !notice || !isPublicNoticeVisible(notice)) notFound();
  return <NoticeDetailClient notice={notice} />;
}
