"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

const PROMPT_EXAMPLES = [
  "여성 자켓 300장, 직기 원단",
  "아동복 샘플부터 본생산까지",
  "기능성 운동복 소량 제작",
];

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
    <section className="bg-white pb-8 pt-16 sm:pb-12 sm:pt-24 lg:pt-28">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="dg-display">
            옷을 만드는 사람과 잘 만드는 공장을 잇습니다.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-dg-muted sm:text-base">
            동대문의 생산 경험과 새로운 브랜드의 아이디어가 더 빠르고 정확하게 만나는 의류 생산 연결 플랫폼입니다.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-2xl sm:mt-12">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToMatchingWithPrompt(prompt);
            }}
            className="ai-prompt-composer"
          >
            <div className="ai-prompt-composer-inner">
              <textarea
                aria-label="제작할 옷의 품목, 수량, 원단"
                value={prompt}
                rows={2}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    goToMatchingWithPrompt(prompt);
                  }
                }}
                placeholder="어떤 옷을 만들고 싶으신가요? 품목, 수량, 원단을 알려주세요."
                className="min-h-[72px] w-full resize-none bg-transparent px-1 py-1 text-[15px] leading-6 text-gray-900 outline-none placeholder:text-gray-400 sm:min-h-[84px] sm:text-base sm:leading-7"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-400 sm:text-xs">
                  Enter로 시작 · Shift+Enter 줄바꿈
                </p>
                <button
                  type="submit"
                  disabled={!trimmedPrompt}
                  aria-label="맞춤 추천 시작"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dg-ink text-white transition hover:bg-black disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PROMPT_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => goToMatchingWithPrompt(example)}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
