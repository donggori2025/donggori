import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabaseService";
import NoticeDetailClient from "./NoticeDetailClient";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('notices').select('*').eq('id', id).limit(1);
  if (error) notFound();
  const notice = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (!notice) notFound();
  
  return <NoticeDetailClient notice={notice} />;
} 