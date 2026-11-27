import type { Metadata } from "next";
import HomeLanding from "@/components/home/HomeLanding";
import "./home.css";

export const metadata: Metadata = {
  title: { absolute: "동고리 | 봉제공장·맞춤 추천" },
  description:
    "의류 제작 조건에 맞는 봉제공장을 찾고 문의할 수 있는 동고리의 공장 정보·맞춤 추천 서비스입니다.",
};

export default function HomePage() {
  return <HomeLanding />;
}
