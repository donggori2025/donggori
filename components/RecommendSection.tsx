import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFactoriesFromDB } from "@/lib/factories";

const RecommendSection = () => {
  const [factoryCount, setFactoryCount] = useState<number>(70);

  useEffect(() => {
    const loadFactoryCount = async () => {
      try {
        const factories = await fetchFactoriesFromDB();
        if (factories.length > 0) {
          setFactoryCount(factories.length);
        }
      } catch (error) {
        console.error('공장 수 로딩 중 오류가 발생했습니다:', error);
      }
    };
    
    loadFactoryCount();
  }, []);

  return (
    <section className="w-full bg-white py-6 sm:py-8 md:py-12 lg:py-16 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">직접 찾아보는 봉제공장 탐색</h2>
        <div className="w-full overflow-hidden mb-4 sm:mb-6 md:mb-8 rounded-xl sm:rounded-2xl lg:rounded-3xl" style={{ maxWidth: 1400 }}>
          <div className="relative w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[320px] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
            <Image src="/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg" alt="봉제공장 배너" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm sm:text-base md:text-lg text-gray-500 text-center mb-4 sm:mb-6 md:mb-8 px-4 sm:px-0">
            {factoryCount}개 이상의 인증된 봉제공장을<br />
            직접 검색하고 필터링하여 원하는 조건에 맞는 공장을 찾아보세요.
          </p>
          <Link href="/factories" className="bg-neutral-100 text-black px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-[1000px] font-bold text-sm sm:text-base md:text-lg hover:bg-neutral-200 transition shadow-none flex items-center gap-2">
            봉제공장 찾기
            <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-black ml-2">
              <span className="text-xs sm:text-sm md:text-base text-white">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecommendSection; 