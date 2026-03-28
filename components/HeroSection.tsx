"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "여성용 오버핏 셔츠를 소량(100장 내외) 제작하고 싶어요",
  "기능성 원단으로 운동복 상하의 제작 가능한 공장을 찾고 싶어요",
  "아동복 샘플 제작과 본생산을 함께 진행할 수 있는 곳이 필요해요",
];

const ROLE_FACES = [
  { label: "디자이너", colorClass: "text-[#7DD3FC]" },
  { label: "대표", colorClass: "text-[#F9A8D4]" },
  { label: "김봉제", colorClass: "text-[#FDE68A]" },
  { label: "브랜드", colorClass: "text-[#C4B5FD]" },
] as const;

export default function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const trimmedPrompt = useMemo(() => prompt.trim(), [prompt]);

  const goToMatchingWithPrompt = (text: string) => {
    const value = text.trim();
    if (!value) return;
    router.push(`/matching?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <section
      className="w-screen bg-white py-0 relative left-1/2 right-1/2 -mx-[50vw]"
      style={{ left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw" }}
    >
      <div className="w-full mx-auto flex flex-col items-stretch h-[100svh] min-h-[100svh] gap-0 px-0">
        <div className="flex-1 min-w-0 flex items-center justify-center relative overflow-hidden bg-white h-full">
          <img
            src="https://res.cloudinary.com/dvvqaywkd/image/upload/v1774682297/image_4_ykback.png"
            alt="동고리 메인 이미지"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />

          <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
            <div className="w-full max-w-[980px] p-2 md:p-4">
              <p className="text-center text-sm md:text-lg font-semibold text-white/90 mb-4">
                의류 봉제·생산 연결 플랫폼, 동고리 입니다.
              </p>
              <h2 className="text-2xl md:text-5xl font-extrabold text-white text-center leading-tight">
                <span className="role-cube-wrap inline-flex items-center justify-center align-baseline">
                  <span className="role-cube">
                    {ROLE_FACES.map((role, idx) => (
                      <span
                        key={role.label}
                        className={`role-face ${role.colorClass}`}
                        style={{ transform: `rotateX(${-idx * 90}deg) translateZ(0.62em)` }}
                      >
                        {role.label}
                      </span>
                    ))}
                  </span>
                </span>{" "}
                님, 어떤 옷을 만들고 싶으신가요?
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/90 text-center">
                입력해주시면 조건을 분석해서 가장 적합한 봉제공장 3곳을 추천해드려요.
              </p>

              <div className="mt-5 md:mt-6">
                <div className="hero-input-border rounded-2xl p-[2.5px] shadow-sm">
                  <div className="rounded-2xl bg-white p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          goToMatchingWithPrompt(prompt);
                        }
                      }}
                      placeholder="예: 여성 자켓 300장, 직기 원단, 샘플부터 본생산까지 가능한 공장"
                      className="w-full h-12 md:h-14 px-2 rounded-xl bg-transparent text-[#111111] placeholder:text-gray-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => goToMatchingWithPrompt(prompt)}
                      disabled={!trimmedPrompt}
                      className={`h-10 md:h-11 px-4 md:px-5 rounded-lg text-sm font-bold transition shrink-0 ${
                        trimmedPrompt
                          ? "bg-[#111111] text-white hover:bg-black"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      분석
                    </button>
                  </div>
                </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs md:text-sm font-extrabold tracking-wider text-white/90 mb-2 uppercase">
                  아래 예시로 시작해보세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => goToMatchingWithPrompt(example)}
                      className="text-left min-h-[92px] rounded-xl border border-gray-200 bg-[#f8f9fc] px-4 py-3 text-sm text-gray-700 hover:border-[#333333] hover:bg-white transition"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .role-cube-wrap {
          perspective: 900px;
          width: 6.2ch;
          height: 1.05em;
          vertical-align: baseline;
          transform: translateY(0.13em);
        }

        .role-cube {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: role-cube-spin 10.4s infinite cubic-bezier(0.55, 0.08, 0.2, 1);
        }

        .role-face {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          line-height: 1;
        }

        @keyframes role-cube-spin {
          0%,
          20% {
            transform: rotateX(0deg);
          }
          25%,
          45% {
            transform: rotateX(90deg);
          }
          50%,
          70% {
            transform: rotateX(180deg);
          }
          75%,
          95% {
            transform: rotateX(270deg);
          }
          100% {
            transform: rotateX(360deg);
          }
        }

        .hero-input-border {
          background: linear-gradient(120deg, #79a8ff, #8ec5ff, #e88bef, #79a8ff);
          background-size: 240% 240%;
          animation: border-ambient-flow 7s ease-in-out infinite;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.2),
            0 0 24px rgba(121, 168, 255, 0.25),
            0 0 36px rgba(232, 139, 239, 0.2);
        }

        @keyframes border-ambient-flow {
          0% {
            background-position: 0% 50%;
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.2),
              0 0 16px rgba(121, 168, 255, 0.22),
              0 0 24px rgba(232, 139, 239, 0.18);
          }
          50% {
            background-position: 100% 50%;
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.25),
              0 0 28px rgba(121, 168, 255, 0.3),
              0 0 40px rgba(232, 139, 239, 0.25);
          }
          100% {
            background-position: 0% 50%;
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.2),
              0 0 16px rgba(121, 168, 255, 0.22),
              0 0 24px rgba(232, 139, 239, 0.18);
          }
        }
      `}</style>
    </section>
  );
}