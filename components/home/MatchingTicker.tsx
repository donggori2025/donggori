"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useCarouselPlayback } from "./useCarouselPlayback";
import { MdKeyboardArrowDown, MdPause, MdPlayArrow } from "react-icons/md";

const examples = [
  { district: "답십리동", item: "피쉬테일 숏 파카", quantity: 47, status: "매칭 완료", time: "방금 전" },
  { district: "장안동", item: "코튼 반소매 티셔츠", quantity: 120, status: "견적 대기", time: "2분 전" },
  { district: "용두동", item: "데님 와이드 팬츠", quantity: 80, status: "매칭 접수", time: "5분 전" },
  { district: "신설동", item: "옥스퍼드 셔츠", quantity: 60, status: "매칭 완료", time: "8분 전" },
  { district: "전농동", item: "린넨 랩 원피스", quantity: 50, status: "견적 대기", time: "12분 전" },
  { district: "제기동", item: "플리츠 스커트", quantity: 90, status: "매칭 접수", time: "16분 전" },
] as const;

// The extra row at either edge keeps the reel continuous when the examples loop.
const rowOffsets = [-3, -2, -1, 0, 1, 2, 3];

export default function MatchingTicker() {
  const { section, playing, setPlaying, visible } = useCarouselPlayback();
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setTimeout(() => setTurn(turn + 1), 3000);
    return () => window.clearTimeout(timer);
  }, [playing, visible, turn]);

  return (
    <section id="sk-lines" ref={section} className="pg-matching" aria-labelledby="pg-matching-title">
      <div className="pg-wide pg-matching-layout">
        <header className="pg-matching-heading">
          <h2 id="pg-matching-title">현재 매칭 현황</h2>
        </header>
        <div id="pg-matching-reel" className="pg-matching-reel"
          aria-live={playing ? "off" : "polite"} aria-atomic="true">
          {rowOffsets.map(offset => {
            const position = turn + offset;
            const entry = examples[(position + examples.length) % examples.length];
            return (
              <div key={position} className="pg-matching-row" data-distance={Math.abs(offset)}
                style={{ "--offset": offset } as CSSProperties} aria-hidden={offset !== 0}>
                <span className="pg-matching-area">{entry.district}</span>
                <strong className="pg-matching-item"><span>{entry.item}</span> {entry.quantity}장</strong>
                <span className="pg-matching-status" data-status={entry.status}>{entry.status}</span>
                <small className="pg-matching-time">{entry.time}</small>
              </div>
            );
          })}
        </div>
        <div className="pg-matching-controls">
          <button type="button" aria-label={playing ? "매칭 현황 일시정지" : "매칭 현황 자동 재생"} aria-controls="pg-matching-reel"
            onClick={() => setPlaying(value => !value)}>
            {playing ? <MdPause /> : <MdPlayArrow />}
          </button>
          <button type="button" aria-label="다음 매칭 현황" aria-controls="pg-matching-reel" onClick={() => setTurn(value => value + 1)}>
            <MdKeyboardArrowDown />
          </button>
        </div>
      </div>
    </section>
  );
}
