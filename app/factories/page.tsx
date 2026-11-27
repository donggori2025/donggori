import type { Metadata } from "next";
import { getPublicFactoryList } from "@/lib/publicFactoryList";
import { toMapFactory } from "@/lib/factoryMapRows";
import { naverMapScriptUrl } from "@/lib/config";
import FactoryMapExplorer from "./FactoryMapExplorer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "봉제공장 지도",
  description: "동대문구 봉제공장을 지도에서 지역과 제작 조건으로 찾아보세요.",
  alternates: { canonical: "/factories" },
};

export default async function FactoryMapPage() {
  const initialRows = await getPublicFactoryList(24 * 60 * 60_000)
    .then(rows => rows.map(toMapFactory))
    .catch(() => null);
  return (
    <>
      {naverMapScriptUrl && <link rel="preload" href={naverMapScriptUrl} as="script" />}
      <FactoryMapExplorer initialRows={initialRows} />
    </>
  );
}
