import React from "react";
import Image from "next/image";
import Link from "next/link";

const RecommendSection = () => (
  <section className="w-full bg-white py-16 min-h-[600px] flex items-center">
    <div className="w-full max-w-[1400px] mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">AI 매칭으로 딱 맞는 봉제공장 추천</h2>
      <div className="w-full overflow-hidden mb-8 rounded-3xl" style={{ maxWidth: 1400 }}>
        <div style={{ position: 'relative', width: '100%', height: '320px' }} className="rounded-3xl overflow-hidden">
          <Image src="/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg" alt="봉제공장 배너" fill style={{ objectFit: 'cover' }} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg text-gray-500 text-center mb-8">
          1,000여 개의 데이터를 활용해 매칭하고 있는<br />
          이 페이지에 딱 맞는 봉제공장들을 추천하여 공정 분석 시간을 줄여드립니다.
        </p>
        <Link href="/matching" className="bg-neutral-100 text-black px-8 py-3 rounded-[1000px] font-bold text-lg hover:bg-neutral-200 transition shadow-none flex items-center gap-2">
          AI 추천받기
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-black ml-2">
            <span className="text-base text-white">→</span>
          </span>
        </Link>
      </div>
    </div>
  </section>
);

export default RecommendSection; 