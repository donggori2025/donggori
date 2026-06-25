"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

const EXAMPLES = [
  "여성용 오버핏 셔츠 소량(100장) 제작",
  "기능성 원단 운동복 상·하의 제작",
  "아동복 샘플 + 본생산 동시 진행",
];

const ROLE_FACES = [
  { label: "디자이너", color: "text-[#7DD3FC]" },
  { label: "대표", color: "text-[#F9A8D4]" },
  { label: "MD", color: "text-[#FDE68A]" },
  { label: "메이커", color: "text-[#86EFAC]" },
  { label: "브랜드", color: "text-[#C4B5FD]" },
] as const;

export default function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);

  const trimmedPrompt = useMemo(() => prompt.trim(), [prompt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLE_FACES.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, []);

  const goToMatchingWithPrompt = (text: string) => {
    const value = text.trim();
    if (!value) return;
    router.push(`/matching?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <section
      className="w-screen relative left-1/2 right-1/2 -mx-[50vw]"
      style={{ left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw" }}
    >
      <div className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <img
          src="https://res.cloudinary.com/dvvqaywkd/image/upload/v1774682297/image_4_ykback.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105 brightness-[0.5]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/62 to-black/80" />

        <div className="relative z-10 w-full max-w-[720px] mx-auto px-5 py-28 md:py-32">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] md:text-xs font-medium tracking-wide text-white/80 bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles className="w-3 h-3 text-violet-300" />
              의류 봉제·생산 연결 플랫폼
            </span>
          </div>

          <h1 className="text-[1.75rem] md:text-[2.75rem] font-bold text-white text-center leading-[1.25] tracking-tight">
            <span className="inline-grid h-[1.2em] min-w-[5.5ch] overflow-hidden align-bottom mr-1">
              {ROLE_FACES.map((role, idx) => (
                <span
                  key={role.label}
                  className={`col-start-1 row-start-1 ${role.color} transition-all duration-700 ease-out ${
                    idx === roleIndex
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-full"
                  }`}
                >
                  {role.label}
                </span>
              ))}
            </span>
            님,
            <br className="sm:hidden" />
            <span className="sm:ml-1">어떤 옷을 만드시나요?</span>
          </h1>

          <p className="mt-4 text-sm md:text-[15px] text-white/55 text-center leading-relaxed">
            조건을 분석해 최적의 봉제공장 3곳을 추천합니다.
          </p>

          <div className="mt-8 md:mt-10">
            <div className="flex items-center gap-2 rounded-full bg-white/[0.97] backdrop-blur-xl pl-5 pr-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToMatchingWithPrompt(prompt);
                  }
                }}
                placeholder="여성 자켓 300장, 직기 원단, 샘플~본생산"
                className="flex-1 min-w-0 h-11 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => goToMatchingWithPrompt(prompt)}
                disabled={!trimmedPrompt}
                aria-label="AI 분석"
                className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all duration-200 ${
                  trimmedPrompt
                    ? "bg-[#111] text-white hover:scale-105 hover:bg-black"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <p className="text-[11px] md:text-xs text-white/40 text-center mb-3 tracking-wide">
              예시로 시작하기
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => goToMatchingWithPrompt(example)}
                  className="px-4 py-2 rounded-full text-xs md:text-sm text-white/75 bg-white/[0.07] backdrop-blur-sm border border-white/15 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
