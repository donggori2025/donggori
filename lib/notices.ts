export const PUBLIC_NOTICE_SELECT = "id,title,content,category,image_urls,start_at,end_at,created_at,updated_at";

export type PublicNotice = {
  id: string;
  title: string;
  content: string;
  category: "공지" | "일반" | "채용공고";
  image_urls?: string[];
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/** Public notices are visible only while their scheduled period is active. */
export function isPublicNoticeVisible(notice: Pick<PublicNotice, "start_at" | "end_at">, now = new Date()) {
  const start = notice.start_at ? new Date(notice.start_at) : null;
  const end = notice.end_at ? new Date(notice.end_at) : null;
  return (!start || start <= now) && (!end || end >= now);
}
