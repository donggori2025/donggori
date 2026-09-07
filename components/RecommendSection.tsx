"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFactoriesFromDB } from "@/lib/factoryCatalog";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { ArrowRight } from "lucide-react";

const RecommendSection = () => {
  const [factoryCount, setFactoryCount] = useState<number | null>(null);

  useEffect(() => {
    const loadFactoryCount = async () => {
      try {
        const factories = await fetchFactoriesFromDB();
        if (factories.length > 0) {
          setFactoryCount(factories.length);
        }
      } catch (error) {
        console.error("공장 수 로딩 중 오류가 발생했습니다:", error);
      }
    };

    loadFactoryCount();
  }, []);

  return (
    <section className="w-full bg-[#f6f7fb] py-10 sm:py-12 md:py-16 lg:py-20">
      <div className={PAGE_CONTAINER_CLASS}>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center tracking-tight mb-6 md:mb-8">
          직접 찾아보는 봉제공장 탐색
        </h2>

        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] rounded-2xl overflow-hidden mb-6 md:mb-8">
          <Image
            src="/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg"
            alt="봉제공장 배너"
            fill
            className="object-cover brightness-[0.55]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8 leading-relaxed">
            {factoryCount === null ? "등록된 봉제공장을" : `${factoryCount}개의 봉제공장을`}
            <br className="sm:hidden" />
            직접 검색하고 필터링해 보세요.
          </p>
          <Link
            href="/factories"
            className="inline-flex items-center gap-2 bg-[#111] text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:bg-black transition-colors"
          >
            봉제공장 찾기
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecommendSection;
