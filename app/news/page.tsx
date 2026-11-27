import PortalPage from "@/components/PortalPage";
import NewsArchive from "./NewsArchive";

export default async function NewsPage({ searchParams }: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const { type } = await searchParams;
  const category = type === "notice" || type === "press" ? type : "all";
  return (
    <PortalPage title="동고리 소식" description="플랫폼 공지와 동대문 봉제산업에 관한 언론 보도를 모았습니다.">
      <NewsArchive category={category} />
    </PortalPage>
  );
}
