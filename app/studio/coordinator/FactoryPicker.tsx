"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Search, Store } from "lucide-react";
import type { FactoryCard } from "@/lib/studioInquiries";
import { findInquiryFactories } from "./actions";

type Props = { id: string; request: string; lastQuestion: string; initial: FactoryCard[]; busy: boolean; onApply: (cards: FactoryCard[]) => void };

export default function FactoryPicker({ id, request, lastQuestion, initial, busy, onApply }: Props) {
  const [mode, setMode] = useState<"match" | "search">("match");
  const [value, setValue] = useState("");
  const [criteria, setCriteria] = useState({ mode, value: "" });
  const [manual, setManual] = useState("");
  const [sourceQuestion, setSourceQuestion] = useState("");
  const wantsSample = /샘플/.test(lastQuestion) && !/샘플.{0,12}(?:없이|생략|제외|필요\s*없)/.test(lastQuestion);
  const suggested = wantsSample ? "샘플 선제작" : ["그레이딩", "직기", "바텍"].find(term => lastQuestion.includes(term)) || "";
  const fromQuestion = suggested && sourceQuestion === lastQuestion ? suggested : "";
  const applied = [manual, fromQuestion].filter(Boolean).join(" · ");
  function applyManual(extra: string) {
    setManual(extra);
    setCriteria({ mode: "match", value: "" });
  }
  const [cards, setCards] = useState(initial);
  useEffect(() => { setCards(initial); }, [initial]);
  const [rows, setRows] = useState<FactoryCard[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setRows([]);
    setStatus("");
    if (criteria.mode === "search" && !criteria.value.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    findInquiryFactories(id, criteria.mode === "match" ? applied : "", criteria.mode === "search" ? criteria.value : "")
      .then(results => {
        if (active) { setRows(results); if (!results.length) setStatus("검색된 업체가 없습니다. 조건을 바꿔 보세요."); }
      }).catch(() => { if (active) setStatus("업체를 불러오지 못했어요. 다시 시도해 주세요."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, criteria, applied]);

  function reasonEditor(card: FactoryCard, inline: boolean) {
    const field = (inline ? "inline-reason-" : "reason-") + card.id;
    return <div key={card.id} className="picker-reason" data-inline={inline} data-in-results={rows.some(r => r.id === card.id)}>
      <label htmlFor={field}>{card.name} 추천 이유</label>
      <textarea id={field} rows={2} maxLength={300} value={card.reason}
        onChange={e => setCards(cards.map(c => c.id === card.id ? { ...c, reason: e.target.value } : c))}/>
      <button type="button" onClick={() => setCards(cards.filter(c => c.id !== card.id))}>{card.name} 제외</button>
    </div>;
  }

  return <aside className="factory-picker" aria-label="추천 업체 선택">
    <header><Store size={18}/><h2>업체 추천</h2></header>
    <div className="picker-scroll">
      <div className="picker-brief"><small>이번 의뢰</small><p className="picker-request">{request}</p></div>
      <form className="picker-desktop-search" role="search" onSubmit={e => {
        e.preventDefault();
        const query = String(new FormData(e.currentTarget).get("factory") || "").trim();
        setCriteria({ mode: query ? "search" : "match", value: query });
      }}>
        <input name="factory" aria-label="업체 검색" placeholder="업체 검색" maxLength={100} type="search" />
        <button aria-label="업체 검색 실행"><Search size={17}/></button>
      </form>
      <details className="picker-desktop-conditions"><summary>제작 조건 추가</summary>
        <form onSubmit={e => {
          e.preventDefault();
          const extra = String(new FormData(e.currentTarget).get("extra") || "").trim();
          applyManual(extra);
        }}>
          <input name="extra" aria-label="제작 조건 추가" placeholder="예: 장안동, 직기" maxLength={300}/>
          <button>추천받기</button>
        </form>
      </details>
      <div className="picker-modes">{(["match", "search"] as const).map(m =>
        <button key={m} aria-pressed={m === mode} onClick={() => {
          if (mode !== m) { setMode(m); setValue(""); setCriteria({ mode: m, value: "" }); }
        }}>{m === "match" ? "조건 맞춤 추천" : "직접 검색"}</button>)}</div>
      <form onSubmit={e => { e.preventDefault(); if (mode === "match") applyManual(value.trim()); else setCriteria({ mode, value: value.trim() }); }}>
        <input aria-label={mode === "match" ? "추가 제작 조건" : "업체 검색어"} maxLength={mode === "match" ? 300 : 100}
          placeholder={mode === "match" ? "추가 조건 (예: 장안동, 직기)" : "업체명, 지역, 품목, 원단"} value={value} onChange={e => setValue(e.target.value)}/>
        <button>{mode === "match" ? "추천받기" : "검색"}</button>
      </form>
      {suggested && !fromQuestion && <button className="question-condition" title={lastQuestion} onClick={() => {
        setSourceQuestion(lastQuestion); setMode("match"); setCriteria({ mode:"match", value:"" });
      }}>마지막 문의에서 추가 · {suggested} +</button>}
      {applied && criteria.mode === "match" && <div className="applied-condition">적용 조건 · {applied}
        <button aria-label="추가 조건 해제" onClick={() => { setSourceQuestion(""); applyManual(""); setValue(""); }}>×</button></div>}
      <p role="status">{loading ? "업체를 찾고 있어요…" : status}</p>
      <div className="picker-results" role="group" aria-label="업체 목록">
        {rows.map(row => {
          const chosen = cards.find(c => c.id === row.id);
          return <div className="picker-candidate" key={row.id} data-selected={Boolean(chosen)}><button className="picker-result" aria-pressed={Boolean(chosen)} disabled={!chosen && cards.length >= 3}
            onClick={() => setCards(chosen ? cards.filter(c => c.id !== row.id) : [...cards, fromQuestion === "샘플 선제작" && criteria.mode === "match" && row.reason.includes("샘플부터 생산까지") ? { ...row, reason: "샘플부터 생산까지 진행하는 업체라 먼저 샘플 제작을 상담하실 수 있어요." } : row])}>
            <i className="factory-thumb">{row.photo ? <img src={row.photo} loading="lazy" alt="" /> : <Store size={21}/>}</i>
            <strong>{row.name}</strong><small>{row.district} · {row.item}</small><span><b className="registered-caption">등록 정보</b>{row.reason}</span>
            <i className="picker-select">{chosen ? <Check size={15}/> : <Plus size={15}/>}</i>
          </button>{chosen && reasonEditor(chosen, true)}</div>;
        })}
      </div>
      {cards.map(card => reasonEditor(card, false))}
    </div>
    <footer><small>{cards.length} / 3곳 선택</small><button disabled={busy || cards.some(c => !c.reason.trim()) || (!cards.length && !initial.length)}
      onClick={() => onApply(cards)}>{!cards.length && initial.length ? "첨부 해제" : cards.length ? `선택한 ${cards.length}곳 대화에 담기` : "대화에 담기"}</button></footer>
  </aside>;
}
