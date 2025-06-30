import React from "react";

const steps = [
  {
    left: "원하는 의류 넣고\n의뢰서 작성하면\n매칭 준비 끝.",
    right: "제작 준비 상."
  },
  {
    left: "봉제공장에서\n확인하고 연락오면\n제작 준비 끝.",
    right: "매칭 준비 끝."
  },
  {
    left: "원하는 의류 넣고\n의뢰서 작성하면\n매칭 준비 끝.",
    right: "제작 준비 끝."
  },
  {
    left: "봉제공장에서\n확인하고 연락오면\n제작 준비 끝.",
    right: "매칭 준비 끝."
  },
  {
    left: "원하는 의류 넣고\n의뢰서 작성하면\n매칭 준비 끝.",
    right: "제작 준비 끝."
  },
];

const StepSection = () => (
  <section className="w-full bg-gray-50 py-16">
    <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center">
      <div className="text-center mb-8">
        <span className="inline-block bg-gray-200 text-gray-800 text-xs font-bold rounded px-2 py-1 mb-2">동고리에서는</span>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2">5단계로 봉제공장 매칭이 이뤄져요!</h2>
      </div>
      <div className="w-full flex flex-col gap-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center gap-8`}
          >
            {/* 텍스트 */}
            <div className={`flex-1 flex items-center ${idx % 2 === 1 ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[48px] font-semibold whitespace-pre-line ${idx % 2 === 1 ? 'text-right' : 'text-left'}`}>{
                step.left.split('\n').map((line, i, arr) => (
                  <span
                    key={i}
                    className={
                      i === 0
                        ? 'text-gray-400' // 첫 줄 연한 회색
                        : i === arr.length - 1 && line.includes('매칭 준비 끝')
                        ? 'text-black font-bold' // 마지막 줄(매칭 준비 끝) 볼드
                        : 'text-gray-700' // 나머지
                    }
                  >
                    {line}
                    {i !== arr.length - 1 && <br />}
                  </span>
                ))
              }</span>
            </div>
            {/* 박스 */}
            <div className={`flex-1 flex items-center ${idx % 2 === 1 ? 'justify-start' : 'justify-end'}`}>
              <div className="w-96 h-96 bg-gray-300 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepSection; 