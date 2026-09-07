import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabaseService";
import NoticeDetailClient from "./NoticeDetailClient";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  console.log('공지사항 세부 페이지 요청:', { id });
  
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('notices').select('*').eq('id', id).limit(1);
  
  if (error) {
    console.error('공지사항 조회 오류:', error);
    notFound();
  }
  
  const notice = Array.isArray(data) && data.length > 0 ? data[0] : null;
  
  if (!notice) {
    console.log('공지사항을 찾을 수 없음:', { id, data });
    notFound();
  }
  
  console.log('공지사항 조회 성공:', { id, title: notice.title });
  
  return <NoticeDetailClient notice={notice} />;
} 