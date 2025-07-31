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
        console.error('공장 수 로딩 중 오류:', error);
      }
    };
    
    loadFactoryCount();
  }, []);

  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center">직접 찾아보는 봉제공장 탐색</h2>
        <div className="w-full overflow-hidden mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl" style={{ maxWidth: 1400 }}>
          <div className="relative w-full h-[200px] sm:h-[250px] md:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden">
            <Image src="/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg" alt="봉제공장 배너" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-base sm:text-lg text-gray-500 text-center mb-6 sm:mb-8 px-4 sm:px-0">
            {factoryCount}개 이상의 인증된 봉제공장을<br />
            직접 검색하고 필터링하여 원하는 조건에 맞는 공장을 찾아보세요.
          </p>
          <Link href="/factories" className="bg-neutral-100 text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-[1000px] font-bold text-base sm:text-lg hover:bg-neutral-200 transition shadow-none flex items-center gap-2">
            봉제공장 찾기
            <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-black ml-2">
              <span className="text-sm sm:text-base text-white">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecommendSection; 