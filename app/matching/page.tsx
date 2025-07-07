"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { factories } from "@/lib/factories";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// 8단계 질문/선택지 샘플 데이터
const QUESTIONS = [
  {
    question: "어떤 원단을 원하시나요?",
    options: ["나염", "직기/우븐", "다이마루", "편물", "데님", "전사"],
  },
  {
    question: "주문 수량은 얼마인가요?",
    options: ["100장 미만", "100~500장", "500~1000장", "1000장 이상"],
  },
  {
    question: "희망 납기일은 언제인가요?",
    options: ["1주일 이내", "2주 이내", "1달 이내", "상관없음"],
  },
  {
    question: "원하는 봉제 방식은?",
    options: ["오버록", "쌍침", "삼봉", "오바로크+쌍침", "기타"],
  },
  {
    question: "의류 종류는 무엇인가요?",
    options: ["티셔츠", "맨투맨", "후드", "바지", "원피스", "기타"],
  },
  {
    question: "예상 단가는?",
    options: ["1만원 미만", "1~2만원", "2~3만원", "3만원 이상"],
  },
  {
    question: "특별히 원하는 공장 조건이 있나요?",
    options: ["소량생산 가능", "빠른 납기", "고품질", "저렴한 단가", "상관없음"],
  },
  {
    question: "추가 요청사항이 있나요?",
    options: ["없음", "있음(상세 입력)"],
  },
];

export default function MatchingPage() {
  // 현재 질문 인덱스
  const [step, setStep] = useState(0);
  // 사용자가 선택한 답변들
  const [answers, setAnswers] = useState<string[]>([]);
  // 채팅 메시지(질문/답변 순서대로)
  const [chat, setChat] = useState<{ type: "question" | "answer"; text: string }[]>([
    { type: "question", text: QUESTIONS[0].question },
  ]);
  const { user } = useUser();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 선택지 클릭 시
  const handleOptionClick = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    setChat(prev => [
      ...prev,
      { type: "answer", text: option },
    ]);
    // 다음 질문이 있으면 추가
    if (step + 1 < QUESTIONS.length) {
      setTimeout(() => {
        setChat(prev => [
          ...prev,
          { type: "question", text: QUESTIONS[step + 1].question },
        ]);
        setStep(step + 1);
      }, 400); // 채팅 느낌을 위해 약간의 딜레이
    } else {
      // 8개 완료 시 추천 결과 노출
      setTimeout(() => {
        const recommended = getRecommendedFactories(newAnswers);
        setChat(prev => [
          ...prev,
          { type: "question", text: "가장 적합한 봉제공장 3곳을 추천드려요!" },
          ...recommended.map(f => ({
            type: "answer" as const,
            text: `${f.name} (매칭 점수: ${f.score})`,
          })),
        ]);
      }, 600);
    }
  };

  // 추천 알고리즘: 답변과 공장 데이터 매칭 점수 계산
  function getRecommendedFactories(answers: string[]) {
    // 질문별로 어떤 필드와 매칭할지 정의
    // 0: 원단/공정(공장.processes), 1: 수량(minOrder), 2: 납기(미사용), 3: 봉제방식(processes),
    // 4: 의류종류(items), 5: 단가(미사용), 6: 조건(processes, minOrder), 7: 기타(미사용)
    return factories
      .map(f => {
        let score = 0;
        // 0: 원단/공정
        if (f.processes.some(p => answers[0] && answers[0].includes(p))) score++;
        // 1: 수량
        if (answers[1]) {
          if (
            (answers[1] === "100장 미만" && f.minOrder <= 100) ||
            (answers[1] === "100~500장" && f.minOrder <= 500) ||
            (answers[1] === "500~1000장" && f.minOrder <= 1000) ||
            (answers[1] === "1000장 이상" && f.minOrder > 1000)
          ) score++;
        }
        // 3: 봉제방식
        if (f.processes.some(p => answers[3] && answers[3].includes(p))) score++;
        // 4: 의류종류
        if (f.items.some(i => answers[4] && answers[4].includes(i))) score++;
        // 6: 특별조건
        if (answers[6]) {
          if (
            (answers[6].includes("소량") && f.minOrder <= 100) ||
            (answers[6].includes("빠른 납기") && f.description.includes("빠른 납기")) ||
            (answers[6].includes("고품질") && f.description.includes("고품질")) ||
            (answers[6].includes("저렴한 단가") && f.description.includes("저렴"))
          ) score++;
        }
        return { ...f, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  // 추천 결과 렌더링 (공장 리스트 + 의뢰하기 버튼)
  function renderRecommendation(chat: { type: "question" | "answer"; text: string }[]) {
    const recIdx = chat.findIndex((m) => m.text.includes("추천드려요"));
    if (recIdx === -1) return null;
    const factoriesToShow = chat.slice(recIdx + 1, recIdx + 4);
    return (
      <div className="mt-6 space-y-4">
        {factoriesToShow.map((msg, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border">
            <span>{msg.text}</span>
            <Button
              onClick={() => {
                if (!user) setShowLoginModal(true);
                else alert("의뢰 기능은 추후 구현 예정입니다.");
              }}
              className="ml-4"
            >
              의뢰하기
            </Button>
          </div>
        ))}
      </div>
    );
  }

  // 왼쪽: 질문/선택지, 오른쪽: 채팅
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽: 질문/선택지 */}
      <div className="w-full max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <div className="text-xl font-bold mb-2">AI 매칭</div>
        <div className="text-gray-500 text-sm mb-4">몇 가지 정보를 알려주시면, 가장 적합한 3개의 봉제공장을 추천해드립니다.</div>
        <div className="flex gap-2 mb-4">
          {QUESTIONS.map((_, idx) => (
            <div key={idx} className={`h-1 w-8 rounded-full ${idx <= step ? "bg-toss-blue" : "bg-gray-200"}`}></div>
          ))}
        </div>
        <div className="text-sm text-gray-400 mb-2">{step + 1} of {QUESTIONS.length}</div>
        <div className="text-lg font-semibold mb-4">{QUESTIONS[step].question}</div>
        <div className="grid grid-cols-2 gap-3">
          {QUESTIONS[step].options.map(option => (
            <Button key={option} className="bg-gray-100 text-gray-800 rounded-lg py-4 text-base font-medium hover:bg-toss-blue hover:text-white transition" onClick={() => handleOptionClick(option)}>
              {option}
            </Button>
          ))}
        </div>
      </div>
      {/* 오른쪽: 채팅 */}
      <div className="flex-1 flex flex-col items-center justify-start mt-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 min-h-[500px] flex flex-col gap-2">
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "question" ? "justify-start" : "justify-end"}`}>
              <div className={`px-4 py-2 rounded-2xl text-base ${msg.type === "question" ? "bg-gray-100 text-gray-800" : "bg-toss-blue text-white"}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {renderRecommendation(chat)}
        </div>
        {/* 로그인 필요 모달 */}
        {showLoginModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full text-center">
              <div className="text-lg font-bold mb-2">로그인 후 이용 가능합니다</div>
              <div className="text-gray-500 mb-4">의뢰하기는 로그인 후 이용하실 수 있습니다.</div>
              <Button className="w-full mb-2" onClick={() => router.push("/sign-in")}>로그인 화면으로 이동</Button>
              <Button variant="outline" className="w-full" onClick={() => setShowLoginModal(false)}>닫기</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 