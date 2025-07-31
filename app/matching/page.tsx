"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { Factory } from "@/lib/factories";


// factories 데이터에서 옵션 추출 유틸(공장 찾기에서 복사)
const moqRanges = [
  { label: "0-50", min: 0, max: 50 },
  { label: "51-100", min: 51, max: 100 },
  { label: "101-300", min: 101, max: 300 },
  { label: "301+", min: 301, max: Infinity },
];

// 채팅 말풍선 컴포넌트 (fade-in + 타이핑 효과)
function ChatBubble({ text, type, isTyping, showCursor, onEdit }: { text: string; type: "question" | "answer"; isTyping?: boolean; showCursor?: boolean; onEdit?: () => void }) {
  return (
    <div className={`flex flex-col items-${type === "answer" ? "end" : "start"} w-full`}>
      <div className={`relative px-4 py-2 rounded-2xl text-base animate-fade-in max-w-[80%] ${type === "question" ? "bg-white text-black self-start" : "bg-[#222222] text-white self-end"}`} style={{ minHeight: 40 }}>
        {isTyping ? (
          <span>
            {text}
            {showCursor && <span className="inline-block w-2 animate-blink ml-0.5">|</span>}
          </span>
        ) : (
          text
        )}
      </div>
      {/* 답변(선택지) 말풍선에만 수정 버튼 노출 */}
      {type === "answer" && onEdit && (
        <button
          className="mt-1 text-xs text-gray-400 underline hover:text-[#222222]"
          onClick={onEdit}
        >
          수정
        </button>
      )}
    </div>
  );
}

export default function MatchingPage() {
  // 공장 데이터 state
  const [factories, setFactories] = useState<Factory[]>([]);

  useEffect(() => {
    async function fetchFactories() {
      const { data } = await supabase.from("donggori").select("*");
      setFactories(data ?? []);
    }
    fetchFactories();
  }, []);

  // factories state 기반 옵션 추출 함수 (함수 내부에서 선언)
  const getOptions = useCallback((key: string): string[] => {
    if (key === 'admin_district') {
      return Array.from(new Set(factories.map((f: Factory) => f.admin_district).filter((v: string | undefined): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'processes') {
      return Array.from(new Set(factories.flatMap((f: Factory) => f.processes ? String(f.processes).split(',').map((v: string) => v.trim()) : []).filter((v: string) => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'sewing_machines' || key === 'pattern_machines' || key === 'special_machines') {
      return Array.from(new Set(factories.flatMap((f: Factory) => f[key] ? String(f[key]).split(',').map((v: string) => v.trim()) : []).filter((v: string) => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'items') {
      const arr = factories.flatMap((f: Factory) => [
        f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet
      ].filter((v: string | undefined): v is string => typeof v === 'string' && Boolean(v)));
      return Array.from(new Set(arr.flatMap((i: string) => String(i).split(',').map((v: string) => v.trim())).filter((v: string) => typeof v === 'string' && Boolean(v))));
    }
    return [];
  }, [factories]);

type ScoredFactory = Factory & { score: number };

  // 동적 질문/옵션 useMemo는 반드시 함수 내부에서 호출
  const QUESTIONS = useMemo(() => [
    { question: "어떤 공정을 원하시나요?", key: "processes", options: getOptions("processes") },
    { question: "지역을 선택하세요", key: "admin_district", options: getOptions("admin_district") },
    { question: "MOQ(최소 주문 수량)을 선택하세요", key: "moq", options: moqRanges.map(r => r.label) },
    { question: "재봉기를 선택하세요", key: "sewing_machines", options: getOptions("sewing_machines") },
    { question: "패턴기를 선택하세요", key: "pattern_machines", options: getOptions("pattern_machines") },
    { question: "특수기를 선택하세요", key: "special_machines", options: getOptions("special_machines") },
    { question: "어떤 품목을 원하시나요?", key: "items", options: getOptions("items") },
  ], [getOptions]);
  // 채팅 메시지(질문/답변 순서대로)
  const [chat, setChat] = useState<{ type: "question" | "answer"; text: string }[]>([]);
  const [introDone, setIntroDone] = useState(false);

  // 인트로 타이핑 상태 추가
  const [typingText, setTypingText] = useState(""); // 현재 타이핑 중인 텍스트
  // introMessages를 useMemo로 관리
  const introMessages = useMemo(() => [
    "반갑습니다:)",
    "동고리가 봉제공장을 추천해드릴게요!",
    QUESTIONS[0]?.question || "어떤 공정을 원하시나요?",
  ], [QUESTIONS]);
  const [introStep, setIntroStep] = useState(0); // 0: 타이핑, 1: ... 표시, 2: 다음 메시지
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const [introRestartKey, setIntroRestartKey] = useState(0); // 인트로 재시작을 위한 키

  useEffect(() => {
    // 인트로 타이핑 효과
    setChat([]);
    setIntroDone(false);
    setTypingText("");
    setIntroStep(0);
    const timers: NodeJS.Timeout[] = [];
    let currentMsgIdx = 0;
    let currentCharIdx = 0;
    function typeNextChar() {
      const msg = introMessages[currentMsgIdx];
      if (currentCharIdx < msg.length) {
        setTypingText(msg.slice(0, currentCharIdx + 1));
        currentCharIdx++;
        typingTimer.current = setTimeout(typeNextChar, 40); // 타이핑 속도
      } else {
        // 타이핑 끝나면 바로 메시지 추가 및 다음 메시지로 이동
        setChat(prev => [...prev, { type: "question", text: msg }]);
        setTypingText("");
        setIntroStep(2);
        if (currentMsgIdx < introMessages.length - 1) {
          currentMsgIdx++;
          currentCharIdx = 0;
          setTimeout(() => {
            setIntroStep(0);
            typeNextChar();
          }, 200); // 바로 다음 메시지 타이핑 시작, 약간의 텀만 둠
        } else {
          // 인트로 끝: setTimeout 없이 바로 introDone 처리
          setIntroDone(true);
        }
      }
    }
    // 첫 메시지 타이핑 시작
    typeNextChar();
    return () => {
      timers.forEach(clearTimeout);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [introMessages, introRestartKey]);
  // 현재 질문 인덱스
  const [step, setStep] = useState(0);
  // 사용자가 선택한 답변들
  const [answers, setAnswers] = useState<string[][]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  // user 변수 제거 (사용하지 않음)
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<ScoredFactory[]>([]);
  // 추천 결과 로딩 상태 추가
  const [resultLoading, setResultLoading] = useState(false);
  // 채팅 스크롤 ref
  const chatScrollRef = useRef<HTMLDivElement>(null);


  // 카드별 칩(공장 id 기준) - 공장 찾기와 동일하게 고정
  const cardFabricsById = useMemo(() => {
    const fabricChips = [
      { label: '봉제', color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
      { label: '샘플', color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
      { label: '패턴', color: '#FF8308', bg: 'rgba(255, 131, 8, 0.1)' },
      { label: '나염', color: '#A259FF', bg: 'rgba(162, 89, 255, 0.1)' },
      { label: '전사', color: '#ED6262', bg: 'rgba(237, 98, 98, 0.1)' },
    ];
    return Object.fromEntries(
      recommended.map((f, idx) => {
        const seed = String(f.id ?? idx);
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        const shuffled = [...fabricChips].sort((a, b) => {
          const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
          const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
          return h1 - h2;
        });
        const count = (Math.abs(hash) % 2) + 1;
        return [f.id ?? idx, shuffled.slice(0, count)];
      })
    );
  }, [recommended]);

  // 선택지 클릭 시
  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // 1. showResult, loading 등 결과 오버레이/전체화면 관련 상태/코드 제거
  // 2. handleConfirm, handleSkip에서 setShowResult, setLoading 등 제거, 대신 answers가 7개(마지막)까지 쌓이면 결과 상태로 전환
  // 3. 왼쪽: 7개 답변이 모두 끝나면 질문/선택지 대신 추천 3개 카드만 표시
  // 4. 오른쪽: 기존 채팅 UI 아래에 결과 안내 메시지(답변 말풍선) 추가

  // handleConfirm 내부
  const handleConfirm = () => {
    if (selectedOptions.length === 0) return;
    const newAnswers = [...answers, selectedOptions];
    setAnswers(newAnswers);
    setChat(prev => [
      ...prev,
      { type: "answer", text: selectedOptions.join(", ") },
    ]);
    setSelectedOptions([]);
    // 다음 질문이 있으면 추가
    if (step + 1 < QUESTIONS.length) {
      setTimeout(() => {
        setChat(prev => [
          ...prev,
          { type: "question", text: QUESTIONS[step + 1].question },
        ]);
        setStep(prev => prev + 1);
      }, 400);
    } else {
      // 7개 완료 시 추천 결과만 상태에 저장
      const rec = getRecommendedFactories(newAnswers.map(a => a.join(", ")));
      setRecommended(rec);
      // step, answers 등은 그대로 두고, showResult/로딩 등은 사용하지 않음
    }
  };
  // handleSkip도 동일하게 showResult/로딩 제거
  const handleSkip = () => {
    const newAnswers = [...answers, []];
    setAnswers(newAnswers);
    setChat(prev => [
      ...prev,
      { type: "answer", text: "(건너뜀)" },
    ]);
    setSelectedOptions([]);
    if (step + 1 < QUESTIONS.length) {
      setTimeout(() => {
        setChat(prev => [
          ...prev,
          { type: "question", text: QUESTIONS[step + 1].question },
        ]);
        setStep(prev => prev + 1);
      }, 400);
    } else {
      const rec = getRecommendedFactories(newAnswers.map(a => a.join(", ")));
      setRecommended(rec);
    }
  };

  // 추천 알고리즘: 답변과 공장 데이터 매칭 점수 계산
  const getRecommendedFactories = useCallback((answers: string[]) => {
    // 선택한 옵션 중 1개라도 일치하는 공장만 후보로 삼고, 그 중 최대 3개만(랜덤 또는 상위 3개) 노출
    // 일치하는 공장이 3개 미만이면 나머지는 랜덤으로 채움
    const matched = factories.filter(f => {
      // 공정
      if (answers[0] && Array.isArray(f.processes) && f.processes.some(p => answers[0].includes(p))) return true;
      // 지역
      if (answers[1] && typeof f.admin_district === 'string' && answers[1].includes(f.admin_district)) return true;
      // MOQ(수량)
      if (answers[2]) {
        if (
          (answers[2] === "0-50" && f.minOrder <= 50) ||
          (answers[2] === "51-100" && f.minOrder <= 100) ||
          (answers[2] === "101-300" && f.minOrder <= 300) ||
          (answers[2] === "301+" && f.minOrder > 300)
        ) return true;
      }
      // 재봉기/패턴기/특수기
      if (answers[3] && typeof f.sewing_machines === 'string' && answers[3].split(',').some(val => typeof f.sewing_machines === 'string' && f.sewing_machines.includes(val))) return true;
      if (answers[4] && typeof f.pattern_machines === 'string' && answers[4].split(',').some(val => typeof f.pattern_machines === 'string' && f.pattern_machines.includes(val))) return true;
      if (answers[5] && typeof f.special_machines === 'string' && answers[5].split(',').some(val => typeof f.special_machines === 'string' && f.special_machines.includes(val))) return true;
      // 품목
      if (answers[6] && Array.isArray(f.items) && f.items.some(i => answers[6].includes(i))) return true;
      return false;
    });
    // 3개 미만이면 랜덤으로 채움
    const result = matched.slice(0, 3).map(f => ({ ...f, score: 1 }));
    if (result.length < 3) {
      const others = factories.filter(f => !matched.includes(f));
      while (result.length < 3 && others.length > 0) {
        const idx = Math.floor(Math.random() * others.length);
        result.push({ ...others.splice(idx, 1)[0], score: 1 });
      }
    }
    return result;
  }, [factories]);

  // 추천 결과 카드 UI (공장 정보 상세)
  function renderResultCards() {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
        <div className="text-[40px] font-extrabold text-gray-900 mb-2">가장 적합한 봉제공장 3곳을 추천드려요!</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-3xl">
          {recommended.map((f, idx) => {
            const displayName = typeof f.name === 'string' && f.name
              ? f.name
              : typeof f.company_name === 'string' && f.company_name
                ? f.company_name
                : '이름 없음';
            const mainItems = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt]
              .filter((v) => typeof v === 'string' && v.length > 0)
              .join(', ') || '-';
            const randomFabrics = cardFabricsById[f.id ?? idx] || [];
            

            
            return (
              <div key={f.id ?? idx} className="rounded-xl bg-white overflow-hidden flex flex-col border border-gray-200">
                {/* 이미지 영역 */}
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl group">
                  {(f.images && f.images.length > 0 && f.images[0] && f.images[0] !== '/logo_donggori.png' && !f.images[0].includes('동고')) || 
                   (f.image && f.image !== '/logo_donggori.png' && !f.image.includes('동고') && !f.image.includes('unsplash')) ? (
                    <Image
                      src={f.images && f.images.length > 0 ? f.images[0] : f.image}
                      alt={typeof f.company_name === 'string' ? f.company_name : '공장 이미지'}
                      className="object-cover w-full h-full rounded-xl group-hover:scale-110 transition-transform duration-300"
                      width={400}
                      height={160}
                      priority={idx < 3}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm font-medium">
                      이미지 준비 중
                    </div>
                  )}
                </div>
                {/* 이미지와 텍스트 사이 gap */}
                <div className="mt-4" />
                {/* 정보 영역 (패딩 적용) */}
                <div className="flex-1 flex flex-col p-6">
                  {/* 주요 원단 칩 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {randomFabrics.map((chip) => (
                      <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-3 py-1 text-xs font-semibold">
                        {chip.label}
                      </span>
                    ))}
                  </div>
                  <div className="font-bold text-base mb-1">{displayName}</div>
                  {/* 주요 품목 */}
                  <div className="text-sm font-bold mt-2 mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                    <span className="shrink-0">주요품목</span>
                    <span className="font-normal ml-2 flex-1 truncate">{mainItems}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#333333', opacity: 0.6 }}>
                    MOQ(최소 주문 수량) <span className="font-normal">{typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? Number(f.moq) : (typeof f.minOrder === 'number' ? f.minOrder : '-'))}</span>
                  </div>
                  <button
                    className="w-full mt-4 bg-[#333333] text-white rounded-lg py-2 font-semibold hover:bg-[#222] transition"
                    onClick={() => router.push(`/factories/${f.id}`)}
                  >
                    의뢰하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 로딩 스피너 UI
  function renderLoading() {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#222222] rounded-full animate-spin mb-6"></div>
        <div className="text-lg font-semibold">추천 결과를 분석 중입니다...</div>
      </div>
    );
  }

  // 이전 단계로 돌아가기 (수정)
  const handleEdit = (editStep: number) => {
    setLoading(false);
    setStep(editStep);
    setSelectedOptions(answers[editStep] || []);
    setAnswers(answers.slice(0, editStep));
    setChat(chat.slice(0, 1 + editStep * 2)); // 질문/답변 쌍이므로
  };

  // 추천 결과(매칭 완료) 시 왼쪽 하단에 '직접 찾기'와 '다시하기' 버튼을 추가합니다. '직접 찾기'는 /factories로 이동, '다시하기'는 매칭 상태(answers, step, chat 등) 초기화. 버튼은 Figma 예시처럼 스타일링(직접 찾기: 흰색, 다시하기: 검정 배경, 아이콘 포함)합니다.
  const handleRestart = () => {
    // 모든 상태 초기화
    setLoading(false);
    setStep(0);
    setAnswers([]);
    setSelectedOptions([]);
    setChat([]);
    setIntroDone(false);
    setRecommended([]); // 결과 초기화
    setResultLoading(false);
    setShowResultMsg1(false);
    setShowResultMsg2(false);
    setTypingText("");
    setIntroStep(0);
    
    // 타이핑 타이머 초기화
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    
    // 인트로 재시작을 위한 키 변경
    setIntroRestartKey(prev => prev + 1);
  };

  // 답변이 모두 끝나면 분석 로딩 후 결과 노출
  useEffect(() => {
    if (answers.length === QUESTIONS.length) {
      setResultLoading(true);
      const timer = setTimeout(() => {
        const rec = getRecommendedFactories(answers.map(a => a.join(", ")));
        setRecommended(rec);
        setResultLoading(false);
      }, 2200); // 2.2초 분석 로딩
      return () => clearTimeout(timer);
    } else {
      setResultLoading(false);
    }
  }, [answers.length, QUESTIONS.length, getRecommendedFactories, answers]);

  // 채팅 자동 스크롤 useEffect
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chat, recommended, resultLoading]);

  // --- [추가: 결과 안내 메시지 상태] ---
  const [showResultMsg1, setShowResultMsg1] = useState(false);
  const [showResultMsg2, setShowResultMsg2] = useState(false);

  // --- [결과 안내 메시지 타이밍 제어 useEffect 수정] ---
  useEffect(() => {
    if (
      answers.length === QUESTIONS.length &&
      recommended.length > 0 &&
      !resultLoading
    ) {
      setShowResultMsg1(false);
      setShowResultMsg2(false);
      const t1 = setTimeout(() => setShowResultMsg1(true), 500); // 0.5초 후 첫 메시지
      const t2 = setTimeout(() => setShowResultMsg2(true), 1500); // 1.5초 후 두 번째 메시지
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setShowResultMsg1(false);
      setShowResultMsg2(false);
    }
  }, [answers.length, recommended, resultLoading, QUESTIONS.length]);

  // 결과 안내 메시지 등장 시 채팅창 자동 스크롤
  useEffect(() => {
    if ((showResultMsg1 || showResultMsg2) && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [showResultMsg1, showResultMsg2]);

  // 왼쪽: 질문/선택지 or 결과 카드 or 로딩
  return (
    <div className="w-full min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-start overflow-x-hidden py-16 px-6">
      <div className="w-full max-w-[1400px] mx-auto flex flex-row gap-4 items-start justify-center flex-1 transition-opacity duration-700 px-1 overflow-hidden bg-[#F4F5F7] pb-0 mb-0" style={{ minHeight: '84vh' }}>
        {/* 왼쪽: 질문/선택지 or 결과 카드 or 로딩 */}
        <div className="flex-[2] bg-white rounded-2xl shadow border p-6 flex flex-col h-[100vh] max-h-[80vh]">
          {answers.length === QUESTIONS.length ? (
            resultLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-[#222222] rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold">추천 결과를 분석 중입니다...</div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 justify-between h-full">
                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderResultCards()}
                </div>
                {/* 하단 버튼 영역 */}
                <div className="flex w-full gap-4 pt-4">
                  <button
                    className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg py-3 text-base font-semibold bg-white hover:bg-gray-50 transition"
                    onClick={() => router.push('/factories')}
                  >
                    <span className="mr-2">🔍</span>직접 찾기
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center rounded-lg py-3 text-base font-semibold bg-[#222] text-white hover:bg-[#111] transition"
                    onClick={handleRestart}
                  >
                    <span className="mr-2">↻</span>다시하기
                  </button>
                </div>
              </div>
            )
          ) : !introDone ? (
            // 인트로 타이핑 중에는 아무것도 안 보이게(또는 로딩/스켈레톤 등)
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">...</div>
          ) : (
            // 기존 질문/선택지 UI
            <>
              {/* 상단~선택지 영역 */}
              <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="text-base text-gray-500 mb-4">
                  몇 가지 정보를 알려주시면,<br />
                  <span className="font-bold">가장 적합한 3개의 봉제공장을 추천</span>해드립니다.
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex gap-2 mb-6">
                  {QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`h-1 w-12 rounded-full ${idx <= step ? "bg-[#333333]" : "bg-gray-200"}`}></div>
                  ))}
                </div>
                <div className="text-sm text-gray-400 mb-2">{step + 1} of {QUESTIONS.length}</div>
                <div className="text-xl font-bold mb-6">{QUESTIONS[step].question}</div>
                {/* 선택지 영역 */}
                <div className={QUESTIONS[step].key === 'items' ? 'bg-gray-50 rounded-xl p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1' : 'bg-gray-50 rounded-xl p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1'}
                  style={QUESTIONS[step].key === 'items' ? { maxHeight: 'unset' } : {}}>
                  {QUESTIONS[step].options.map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-xl bg-white shadow text-[15px] font-medium py-8 transition border border-gray-200 flex items-center justify-center
                        ${selectedOptions.includes(option)
                          ? "border-[#333333] ring-2 ring-[#333333]"
                          : "hover:border-[#333333]"}
                      `}
                      onClick={() => handleOptionToggle(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="h-6" />
              </div>
              {/* 하단 버튼 영역 */}
              <div className="pt-4 pb-6 border-t border-gray-200 flex justify-between items-center gap-4 shrink-0 bg-white">
                <button className="text-base text-gray-500 underline" onClick={() => router.push("/")}>나가기</button>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-[#333333] text-base px-6 py-3" onClick={handleSkip}>건너뛰기</Button>
                  <Button
                    className="bg-[#333333] text-white rounded-lg px-8 py-3 font-bold text-base"
                    onClick={handleConfirm}
                    disabled={selectedOptions.length === 0}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 오른쪽: 기존 채팅 UI + 결과 안내 메시지(답변 말풍선) */}
        <div
          className="flex-[1] bg-[#F7F8FA] rounded-xl shadow-md p-4 min-h-[500px] flex flex-col gap-6"
          style={{ height: '80vh', maxHeight: '80vh', overflowY: 'auto' }}
          ref={chatScrollRef}
        >
          {/* 기존 채팅/인트로 UI */}
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`}>
              <ChatBubble
                text={msg.text}
                type={msg.type}
                onEdit={msg.type === "answer" && introDone ? () => handleEdit(Math.floor((idx - introMessages.length) / 2)) : undefined}
              />
            </div>
          ))}
          {/* 현재 타이핑 중인 메시지 */}
          {!introDone && typingText && (
            <div className="flex justify-start">
              <ChatBubble text={typingText} type="question" isTyping={true} showCursor={introStep === 0} />
            </div>
          )}
          {/* 결과 안내 메시지(답변 말풍선) - 두 개로 분리, 순차 등장 */}
          {showResultMsg1 && recommended.length > 0 && (
            <div className="flex justify-end">
              <ChatBubble
                text={`가장 적합한 봉제공장은\n${recommended.map(f => (typeof f.name === 'string' && f.name) ? f.name : (typeof f.company_name === 'string' && f.company_name) ? f.company_name : '이름 없음').join(', ')} 입니다!`}
                type="answer"
              />
            </div>
          )}
          {showResultMsg2 && (
            <div className="flex justify-end">
              <ChatBubble
                text={`봉제를 진행할 공장을 선택하여\n공정을 시작해보세요:)`}
                type="answer"
              />
            </div>
          )}
        </div>
      </div>
      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full text-center border border-gray-200">
            <div className="text-lg font-bold mb-2">로그인 후 이용 가능합니다</div>
            <div className="text-gray-500 mb-4">의뢰하기는 로그인 후 이용하실 수 있습니다.</div>
            <Button className="w-full mb-2" onClick={() => router.push("/sign-in")}>로그인 화면으로 이동</Button>
            <Button variant="outline" className="w-full" onClick={() => setShowLoginModal(false)}>닫기</Button>
          </div>
        </div>
      )}
      {/* 로딩 화면 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50 transition-opacity duration-700 animate-fade-in">
          {renderLoading()}
        </div>
      )}
      {/* 추천 결과 화면 */}
      {/* showResult && ( */}
      {/*   <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50 transition-opacity duration-700 animate-fade-in"> */}
      {/*     {renderResultCards()} */}
      {/*   </div> */}
      {/* ) */}
      {/* fade-in, blink 애니메이션 직접 추가 (Tailwind에 없을 수 있음) */}
      {/* return 문 마지막에 추가 */}
      <style jsx global>{`
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1);
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
`}</style>
    </div>
  );
}