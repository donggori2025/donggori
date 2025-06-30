"use client";
import React from "react";

// 메인 페이지 컴포넌트
export default function Home() {
  return (
    <div className="w-full">
      {/* 1. 상단 배너 */}
      <div
        className="w-full h-[320px] flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/your-banner-image.jpg')" }} // 실제 이미지 경로로 교체
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">동고리</h1>
          <p className="text-lg md:text-xl font-semibold">
            동대문구 지역의 패션봉제공장과 디자이너들을 연결하는<br />
            패션봉제 올인원 플랫폼입니다.
          </p>
        </div>
      </div>

      {/* 2. 지원 서비스 */}
      <div className="bg-black text-white py-8">
        <div className="text-center mb-4 font-semibold">
          동대문구 패션봉제복합지원센터는<br />
          스마트 제조장비, 공용작업장, 제품개발, 일감연계 지원을 통해<br />
          소공인 혁신시작점을 조성합니다.
        </div>
        <div className="flex justify-center gap-4 max-w-4xl mx-auto">
          {["스마트 제조장비", "공용작업장", "제품개발", "일감연계"].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mb-2" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 5단계 매칭 프로세스 */}
      <div className="bg-gray-50 py-10">
        <div className="text-center font-bold mb-8">
          동고리에서는 <span className="inline-block bg-black text-white rounded px-2">5단계</span>로 봉제공장 매칭이 이뤄져요!
        </div>
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
          {[1, 2, 3, 4, 5].map((step, idx) => (
            <div key={step} className={`flex ${idx % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-center gap-6`}>
              <div className="flex-1 text-gray-500 font-semibold text-right md:text-left">
                원하는 의류 넣고<br />
                의뢰서 작성하면<br />
                <span className="text-black font-bold">매칭 준비 끝.</span>
              </div>
              <div className="w-40 h-40 bg-gray-300 rounded-lg flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. 하단 안내 */}
      <div className="bg-black text-white py-10">
        <div className="text-center font-semibold mb-6">
          지금 동고리에서<br />
          최상의 품질의 봉제공장을 만나보세요!
        </div>
        <div className="flex justify-center gap-8">
          <div className="w-48 h-40 bg-gray-700 rounded-lg flex flex-col items-center justify-center">
            <span className="mb-2">AI로 추천 받기</span>
            {/* 실제 이미지나 아이콘 추가 가능 */}
          </div>
          <div className="w-48 h-40 bg-gray-700 rounded-lg flex flex-col items-center justify-center">
            <span className="mb-2">카테고리로 직접 찾기</span>
          </div>
        </div>
      </div>
    </div>
  );
}
