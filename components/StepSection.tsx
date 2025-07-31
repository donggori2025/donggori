import React from "react";

const trustCards = [
  {
    icon: "📧",
    title: "의류 생산도 이제 올인원으로",
    desc: "샘플 제작에서 본생산까지 한번에"
  },
  {
    icon: "⭐",
    title: "5단계로 찾는 간단한 의뢰 방식",
    desc: "AI 매칭 기능으로 나에게 딱 맞는 봉제공장을 찾아보세요"
  },
  {
    icon: "🏁",
    title: "AI의 추천을 받아보세요",
    desc: "내가 찾는 기술과 가장 비슷한 3개의 봉제공장을 추천드려요"
  },
];

const StepSection = () => (
  <section className="w-full bg-white py-8 sm:py-12 md:py-16 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
      {/* 상단 섹션 */}
      <div className="mb-8 sm:mb-12">
        {/* 제목과 설명 */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              공장 탐색 시간을 줄여주는 매칭 프로세스
            </h2>
          </div>
          <div className="flex-1 lg:max-w-[500px]">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              1,000 여 개의 데이터를 활용하여 만들고자 하는 의류에 딱 맞는 봉제공장을 추천하여 공장 탐색 시간을 줄여드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 카드 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {trustCards.map((card, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 sm:p-6">
            {/* 아이콘 */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
              <span className="text-lg sm:text-xl">{card.icon}</span>
            </div>
            
            {/* 제목 */}
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              {card.title}
            </h3>
            
            {/* 설명 */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepSection; 