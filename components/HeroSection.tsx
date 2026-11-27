"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, MapPin, Ruler, Search } from "lucide-react";

const PROMPT_EXAMPLES = [
  "여성 자켓 300장, 직기 원단",
  "아동복 샘플부터 본생산까지",
  "기능성 운동복 소량 제작",
];

const conditions = [
  { label: "수량", example: "100장", Icon: Ruler },
  { label: "원단", example: "면 원단", Icon: Layers },
  { label: "지역", example: "장안동", Icon: MapPin },
];

export default function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);

  const goToMatchingWithPrompt = (text: string) => {
    const value = text.trim();
    if (!value) return;
    router.push(`/matching?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <section className="pg-search" aria-labelledby="pg-search-title">
      <h1 id="pg-search-title">
        동대문구 봉제공장과<br />디자이너의 연결고리, <span className="pg-search-brand">동고리</span>
      </h1>
      <div className="pg-prompt-stage">
        <form className="dg-composer" onSubmit={(event) => {
          event.preventDefault();
          goToMatchingWithPrompt(prompt);
        }}>
          <textarea ref={field} aria-label="제작할 옷의 품목, 수량, 원단" value={prompt} rows={2}
            placeholder="예를 들어, 면 티셔츠 100장을 만들고 싶어요."
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
                event.preventDefault();
                goToMatchingWithPrompt(prompt);
              }
            }} />
          <div className="dg-tools">
            {conditions.map(({ label, example, Icon }) => (
              <button type="button" className="dg-handle" key={label} onClick={() => {
                const next = [prompt.trimEnd(), example].filter(Boolean).join(", ");
                setPrompt(next);
                field.current?.focus();
                requestAnimationFrame(() => field.current?.setSelectionRange(next.length - example.length, next.length));
              }}>
                <Icon size={15} aria-hidden="true" />{label}
              </button>
            ))}
            <button type="submit" className="dg-submit" disabled={!prompt.trim()} aria-label="맞춤 추천 시작">
              <Search size={20} aria-hidden="true" />
            </button>
          </div>
        </form>
        <div className="pg-examples" aria-label="추천 검색 예시">
          {PROMPT_EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => goToMatchingWithPrompt(example)}>{example}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
