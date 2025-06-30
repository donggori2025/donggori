import React from "react";

const infoCards = [
  { label: "스마트 제조장비" },
  { label: "공용작업장" },
  { label: "제품개발" },
  { label: "일감연계 지원" },
];

const InfoSection = () => (
  <section className="w-full bg-white py-16">
    <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center">
      <h2 className="text-[48px] font-extrabold text-center mb-2">동대문구 패션봉제복합지원센터는</h2>
      <p className="text-lg text-gray-500 text-center mb-8">
        스마트 제조장비, 공용작업장, 제품개발, 일감연계 지원을 통해<br />
        <span className="font-bold text-gray-700">소공인 혁신시간</span>을 조성합니다.
      </p>
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
        {infoCards.map((card, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              {/* 실제 아이콘/이미지로 교체 가능 */}
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-base font-semibold text-gray-700 text-center">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default InfoSection; 