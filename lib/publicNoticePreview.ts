import { isPublicNoticeVisible, type PublicNotice } from "@/lib/notices";

export function usePublicNoticePreview() {
  return process.env.NODE_ENV === "development" && process.env.DONGGORI_PUBLIC_NOTICE_PREVIEW === "1";
}

export async function readPublicNoticePreview(): Promise<PublicNotice[]> {
  const response = await fetch("https://www.donggori.com/api/notices", {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("공지를 불러오지 못했습니다.");
  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload.data)) throw new Error("공지 목록을 확인할 수 없습니다.");
  return (payload.data as PublicNotice[]).filter(notice => isPublicNoticeVisible(notice));
}
