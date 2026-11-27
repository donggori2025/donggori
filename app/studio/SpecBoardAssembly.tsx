import { useEffect, useId, useState } from "react";
import { SpecArtwork } from "./OrderArtwork";
import { parkaOrder } from "@/lib/presentationDemo";

// Bounds on the original 1279 × 924 sheet. These same tiles become the finished document.
const modules = [
  { name: "도식화", detail: "앞면 · 뒷면", x: 29, y: 230, w: 405, h: 382, ms: 1650 },
  { name: "기본 정보", detail: "DB-26FW-JK065 · 2026 F/W", x: 29, y: 84, w: 1221, h: 146, ms: 1280 },
  { name: "원단", detail: "겉감 · 안감", x: 29, y: 612, w: 405, h: 284, ms: 1170 },
  { name: "부자재", detail: "투웨이 지퍼 · 스냅 · 스토퍼", x: 434, y: 230, w: 342, h: 414, ms: 1230 },
  { name: "사이즈 스펙", detail: "6개 부위 · S–XXL", x: 776, y: 230, w: 474, h: 256, ms: 1420 },
  { name: "색상·사이즈 수량", detail: "올리브 18장 · 다크올리브 11장 · 블랙 18장", x: 776, y: 486, w: 474, h: 239, ms: 1350 },
  { name: "주의사항", detail: "피쉬테일 밑단 · 드로코드 마감", x: 434, y: 644, w: 342, h: 252, ms: 1200 },
  { name: "라벨", detail: "왼쪽 옆선 안쪽 · 30 × 46 mm", x: 776, y: 725, w: 474, h: 171, ms: 1800 },
];

export default function SpecBoardAssembly({ onComplete, progress, request }: { request: string; onComplete: () => void; progress: string }) {
  const id = useId();
  const [current, setCurrent] = useState(0);
  const active = modules[current];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(() => {
      if (reduced.matches || current === modules.length - 1) onComplete();
      else setCurrent(current + 1);
    }, reduced.matches ? 1150 : active.ms);
    return () => window.clearTimeout(timer);
  }, [active.ms, current, onComplete]);

  return (
    <>
      <div className="studio-board-surface">
        <div className="studio-paper">
          <svg className="studio-assembly" width="1279" height="924" viewBox="0 0 1279 924"
            role="img" aria-label="도식화와 제작 사양을 옮겨 담는 M-65 파카 스펙 보드">
            <defs>
              <g id={id}><SpecArtwork request={request} /></g>
            </defs>
            <use href={`#${id}`} />
            <rect x="29" y="84" width="1221" height="812" fill="white" />
            {modules.map(({ name, x, y, w, h }) => (
              <rect key={name} x={x} y={y} width={w} height={h} fill="#fdfdfb" stroke="#dfded8" />
            ))}
            {modules.map(({ name, x, y, w, h }, i) => (
              <g key={name} className="studio-module" data-state={i < current ? "done" : i === current ? "active" : "waiting"}>
                <defs>
                  <clipPath id={`${id}-tile-${i}`}>
                    <rect className={i === 0 ? undefined : "studio-module-mask"} x={x} y={y} width={w} height={h} />
                  </clipPath>
                </defs>
                <g className={i === 0 ? "studio-seated-drawing" : undefined}>
                  <use href={`#${id}`} clipPath={`url(#${id}-tile-${i})`} />
                </g>
                <rect className="studio-module-trace" x={x + 1} y={y + 1} width={w - 2} height={h - 2}
                  fill="none" stroke="#3182f6" strokeWidth="3" pathLength="1" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      <footer>
        <span className="studio-module-caption" key={current}><strong>{active.name}</strong>{current === 5 ? parkaOrder(request).text : active.detail}</span>
        <b>{progress}</b>
      </footer>
    </>
  );
}
