"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { Factory } from "@/lib/factories";
import { getFactoryMainImage, getFactoryImages } from "@/lib/factoryImages";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { FACTORY_TYPES, MAIN_FABRICS, type FactoryType, type MainFabric } from "@/lib/types";


// factories 데이터에서 옵션 추출 유틸(공장 찾기에서 복사)
const moqRanges = [
  { label: "0-50", min: 0, max: 50 },
  { label: "51-100", min: 51, max: 100 },
  { label: "101-300", min: 101, max: 300 },
  { label: "301+", min: 301, max: Infinity },
];

// 매칭 페이지용 공장 이미지 컴포넌트
function MatchingFactoryImage({ factory, idx }: { factory: Factory; idx: number }) {
  const { images, loading } = useFactoryImages(factory.name || factory.company_name || '');
  
  if (loading) {
    return (
      <div className="text-gray-400 text-sm font-medium flex items-center justify-center h-full">
        <div className="text-center">
          <div>이미지 로딩 중...</div>
        </div>
      </div>
    );
  }
  
  if (images.length > 0 && images[0] !== '/logo_donggori.png') {
    return (
      <Image
        src={images[0]}
        alt={typeof factory.company_name === 'string' ? factory.company_name : (typeof factory.name === 'string' ? factory.name : '공장 이미지')}
        className="object-cover w-full h-full rounded-xl group-hover:scale-110 transition-transform duration-300"
        width={400}
        height={160}
        priority={idx < 3}
        unoptimized
        onError={(e) => {
          console.warn(`이미지 로드 실패: ${images[0]}`);
          // 이미지 로드 실패 시 대체 UI 표시
          const imgElement = e.currentTarget;
          imgElement.style.display = 'none';
          const fallbackElement = imgElement.nextElementSibling;
          if (fallbackElement) {
            fallbackElement.classList.remove('hidden');
          }
        }}
      />
    );
  }
  
  return (
    <div className="text-gray-400 text-sm font-medium flex items-center justify-center h-full">
      <div className="text-center">
        <div>이미지 준비 중</div>
      </div>
    </div>
  );
}

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
  const { user } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 공장 데이터 state
  const [factories, setFactories] = useState<Factory[]>([]);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      // Clerk 사용자 확인
      if (user) {
        setIsLoggedIn(true);
        return;
      }

      // 쿠키에서 로그인 상태 확인
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const isLoggedInCookie = getCookie('isLoggedIn');
      const userType = getCookie('userType');
      const naverUser = getCookie('naver_user');
      const kakaoUser = getCookie('kakao_user');

      // localStorage에서도 확인
      const localStorageUserType = localStorage.getItem('userType');
      const localStorageFactoryAuth = localStorage.getItem('factoryAuth');

      if (isLoggedInCookie === 'true' || userType || naverUser || kakaoUser || localStorageUserType || localStorageFactoryAuth) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [user]);

  useEffect(() => {
    async function fetchFactories() {
      const { data } = await supabase.from("donggori").select("*");
      
      // 이미지 정보를 추가로 처리
      const factoriesWithImages = (data ?? []).map((factory: any) => {
        const companyName = factory.company_name || factory.name || '';
        
        // 이미지 정보 로깅
        console.log(`공장 ${companyName} 원본 데이터:`, {
          id: factory.id,
          company_name: factory.company_name,
          name: factory.name,
          images: factory.images,
          image: factory.image
        });
        
        // 실제 이미지 정보 가져오기
        const factoryWithImages = {
          ...factory,
          // 공장 이름으로 실제 이미지 가져오기
          image: getFactoryMainImage(companyName),
          images: getFactoryImages(companyName)
        };
        
        console.log(`공장 ${companyName} 처리된 이미지 데이터:`, {
          image: factoryWithImages.image,
          images: factoryWithImages.images,
          companyName: companyName
        });
        
        return factoryWithImages;
      });
      
      setFactories(factoriesWithImages);
    }
    fetchFactories();
  }, []);

  // factories state 기반 옵션 추출 함수 (함수 내부에서 선언)
  const getOptions = useCallback((key: string): string[] => {
    if (key === 'admin_district') {
      const districts = Array.from(new Set(factories.map((f: Factory) => f.admin_district).filter((v: string | undefined): v is string => typeof v === 'string' && Boolean(v))));
      
      // 용신동 제거 및 신설동/용두동 확인
      const filteredDistricts = districts.filter(district => district !== '용신동');
      
      // 신설동과 용두동이 있는지 확인
      const hasSinsel = filteredDistricts.includes('신설동');
      const hasYongdu = filteredDistricts.includes('용두동');
      
      console.log('지역 옵션 생성:', {
        원본: districts,
        필터링: filteredDistricts,
        신설동존재: hasSinsel,
        용두동존재: hasYongdu
      });
      
      return filteredDistricts;
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
    { question: "어떤 공정을 원하시나요?", key: "factory_type", options: FACTORY_TYPES },
    { question: "주요 원단을 선택하세요", key: "main_fabrics", options: MAIN_FABRICS },
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
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [introRestartKey, setIntroRestartKey] = useState(0); // 인트로 재시작을 위한 키

  useEffect(() => {
    // 인트로 타이핑 효과
    setChat([]);
    setIntroDone(false);
    setTypingText("");
    setIntroStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
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


  // 카드별 칩을 실제 데이터베이스 데이터 기반으로 생성
  const cardFabricsById = useMemo(() => {
    const chipColors = {
      '봉제': { color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
      '샘플': { color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
      '패턴': { color: '#FF8308', bg: 'rgba(255, 131, 8, 0.1)' },
      '나염': { color: '#A259FF', bg: 'rgba(162, 89, 255, 0.1)' },
      'QC': { color: '#ED6262', bg: 'rgba(237, 98, 98, 0.1)' },
      '시야게': { color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.1)' },
      '다이마루': { color: '#4ECDC4', bg: 'rgba(78, 205, 196, 0.1)' },
      '직기': { color: '#45B7D1', bg: 'rgba(69, 183, 209, 0.1)' },
      '토탈': { color: '#96CEB4', bg: 'rgba(150, 206, 180, 0.1)' },
      '기타': { color: '#FFEAA7', bg: 'rgba(255, 234, 167, 0.1)' },
    };

    return Object.fromEntries(
      recommended.map((f, idx) => {
        const chips = [];
        
        // factory_type 칩 추가
        if (f.factory_type && f.factory_type.trim() !== '') {
          const colorInfo = chipColors[f.factory_type as keyof typeof chipColors] || chipColors['기타'];
          chips.push({
            label: f.factory_type,
            color: colorInfo.color,
            bg: colorInfo.bg
          });
        }
        
        // main_fabrics 칩 추가
        if (f.main_fabrics && f.main_fabrics.trim() !== '') {
          const colorInfo = chipColors[f.main_fabrics as keyof typeof chipColors] || chipColors['기타'];
          chips.push({
            label: f.main_fabrics,
            color: colorInfo.color,
            bg: colorInfo.bg
          });
        }
        
        // 데이터가 없으면 기본값으로 '봉제' 표시
        if (chips.length === 0) {
          chips.push({
            label: '봉제',
            color: chipColors['봉제'].color,
            bg: chipColors['봉제'].bg
          });
        }
        
        return [f.id ?? idx, chips];
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

  // 개선된 AI 매칭 알고리즘: 가중치 기반 점수 계산 시스템
  const getRecommendedFactories = useCallback((answers: string[]) => {
    console.log('🔍 AI 매칭 시작 - 사용자 답변:', answers);
    
    // 가중치 정의 (중요도 순)
    const weights = {
      factory_type: 30,      // 공장 타입 (가장 중요)
      main_fabrics: 25,      // 주요 원단
      admin_district: 20,    // 지역
      moq: 15,               // MOQ
      equipment: 10,         // 장비 (재봉기, 패턴기, 특수기)
      items: 10             // 품목
    };

    // 각 공장에 대해 점수 계산
    const scoredFactories = factories.map(factory => {
      let totalScore = 0;
      let maxPossibleScore = 0;
      const matchDetails: string[] = [];

      // 1. 공장 타입 매칭 (가중치: 30)
      if (answers[0] && typeof factory.factory_type === 'string') {
        maxPossibleScore += weights.factory_type;
        if (answers[0].includes(factory.factory_type)) {
          totalScore += weights.factory_type;
          matchDetails.push(`공장타입: ${factory.factory_type}`);
        }
      }

      // 2. 주요 원단 매칭 (가중치: 25)
      if (answers[1] && typeof factory.main_fabrics === 'string') {
        maxPossibleScore += weights.main_fabrics;
        if (answers[1].includes(factory.main_fabrics)) {
          totalScore += weights.main_fabrics;
          matchDetails.push(`원단: ${factory.main_fabrics}`);
        }
      }

      // 3. 지역 매칭 (가중치: 20)
      if (answers[2] && typeof factory.admin_district === 'string') {
        maxPossibleScore += weights.admin_district;
        if (answers[2].includes(factory.admin_district)) {
          totalScore += weights.admin_district;
          matchDetails.push(`지역: ${factory.admin_district}`);
        }
      }

      // 4. MOQ 매칭 (가중치: 15)
      if (answers[3] && factory.minOrder !== undefined) {
        maxPossibleScore += weights.moq;
        const moqMatch = (
          (answers[3] === "0-50" && factory.minOrder <= 50) ||
          (answers[3] === "51-100" && factory.minOrder <= 100) ||
          (answers[3] === "101-300" && factory.minOrder <= 300) ||
          (answers[3] === "301+" && factory.minOrder > 300)
        );
        if (moqMatch) {
          totalScore += weights.moq;
          matchDetails.push(`MOQ: ${factory.minOrder}`);
        }
      }

      // 5. 장비 매칭 (가중치: 10)
      let equipmentScore = 0;
      if (answers[4] && typeof factory.sewing_machines === 'string') {
        const sewingMatch = answers[4].split(',').some(val => 
          factory.sewing_machines.includes(val.trim())
        );
        if (sewingMatch) equipmentScore += 3;
      }
      if (answers[5] && typeof factory.pattern_machines === 'string') {
        const patternMatch = answers[5].split(',').some(val => 
          factory.pattern_machines.includes(val.trim())
        );
        if (patternMatch) equipmentScore += 3;
      }
      if (answers[6] && typeof factory.special_machines === 'string') {
        const specialMatch = answers[6].split(',').some(val => 
          factory.special_machines.includes(val.trim())
        );
        if (specialMatch) equipmentScore += 4;
      }
      totalScore += Math.min(equipmentScore, weights.equipment);
      maxPossibleScore += weights.equipment;
      if (equipmentScore > 0) {
        matchDetails.push(`장비 매칭: ${equipmentScore}점`);
      }

      // 6. 품목 매칭 (가중치: 10)
      if (answers[7] && Array.isArray(factory.items)) {
        maxPossibleScore += weights.items;
        const itemMatches = factory.items.filter(item => 
          answers[7].includes(item)
        );
        if (itemMatches.length > 0) {
          const itemScore = (itemMatches.length / factory.items.length) * weights.items;
          totalScore += itemScore;
          matchDetails.push(`품목: ${itemMatches.join(', ')}`);
        }
      }

      // 최종 점수 계산 (백분율)
      const finalScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
      
      console.log(`🏭 ${factory.company_name || factory.name}: ${finalScore.toFixed(1)}점`, {
        totalScore,
        maxPossibleScore,
        matchDetails,
        finalScore: finalScore.toFixed(1) + '%'
      });

      return {
        ...factory,
        score: finalScore,
        matchDetails,
        totalScore,
        maxPossibleScore
      };
    });

    // 점수순으로 정렬 (높은 점수부터)
    const sortedFactories = scoredFactories.sort((a, b) => b.score - a.score);
    
    // 지능형 필터링 및 보완 로직
    let result: typeof scoredFactories = [];
    
    // 1단계: 고품질 매칭 (70점 이상)
    const highQualityMatches = sortedFactories.filter(f => f.score >= 70);
    if (highQualityMatches.length >= 3) {
      result = highQualityMatches.slice(0, 3);
      console.log('🌟 고품질 매칭 3개 이상 발견 - 상위 3개 선택');
    } else {
      // 2단계: 중품질 매칭 (50점 이상) + 고품질 매칭
      const mediumQualityMatches = sortedFactories.filter(f => f.score >= 50 && f.score < 70);
      result = [...highQualityMatches, ...mediumQualityMatches].slice(0, 3);
      
      if (result.length < 3) {
        // 3단계: 저품질 매칭 (30점 이상)으로 보완
        const lowQualityMatches = sortedFactories.filter(f => 
          f.score >= 30 && f.score < 50 && !result.includes(f)
        );
        result = [...result, ...lowQualityMatches].slice(0, 3);
        
        if (result.length < 3) {
          // 4단계: 최종 보완 (최고 점수들)
          const remaining = sortedFactories.filter(f => !result.includes(f));
          result = [...result, ...remaining].slice(0, 3);
        }
      }
    }

    // 매칭 품질 분석
    const qualityAnalysis = {
      high: result.filter(f => f.score >= 70).length,
      medium: result.filter(f => f.score >= 50 && f.score < 70).length,
      low: result.filter(f => f.score < 50).length
    };
    
    console.log('📊 매칭 품질 분석:', qualityAnalysis);
    
    // 매칭 품질에 따른 사용자 안내 메시지 생성
    if (qualityAnalysis.high >= 2) {
      console.log('✅ 우수한 매칭 결과 - 사용자에게 높은 만족도 예상');
    } else if (qualityAnalysis.medium >= 2) {
      console.log('⚠️ 보통 매칭 결과 - 추가 필터링 권장');
    } else {
      console.log('❌ 낮은 매칭 결과 - 더 많은 옵션 제공 필요');
    }

    console.log('🎯 최종 추천 결과:', result.map(f => ({
      name: f.company_name || f.name,
      score: f.score.toFixed(1) + '%',
      matches: f.matchDetails
    })));

    return result;
  }, [factories]);

  // 사용자 피드백 상태
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState<{[key: number]: number}>({});

  // 피드백 제출 함수
  const submitFeedback = async (factoryId: number, rating: number) => {
    try {
      console.log(`피드백 제출 시도: 공장 ${factoryId}, 평점 ${rating}`);
      
      // 즉시 UI 업데이트
      setFeedbackRatings(prev => ({ ...prev, [factoryId]: rating }));
      
      // 서버에 피드백 전송 (선택적)
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            factory_id: factoryId,
            rating: rating,
            user_answers: answers,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          console.log(`피드백 서버 저장 완료: 공장 ${factoryId}, 평점 ${rating}`);
        } else {
          console.warn('피드백 서버 저장 실패, 하지만 UI는 업데이트됨');
        }
      } catch (serverError) {
        console.warn('피드백 서버 전송 실패, 하지만 UI는 업데이트됨:', serverError);
      }
      
    } catch (error) {
      console.error('피드백 처리 중 오류:', error);
    }
  };

  // 추천 결과 카드 UI (공장 정보 상세)
  function renderResultCards() {
    return (
      <div className="w-full flex flex-col items-center justify-center animate-fade-in">
        <div className="text-2xl md:text-[40px] font-extrabold text-gray-900 mb-8 text-center px-4">가장 적합한 봉제공장 3곳을 추천드려요!</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 w-full max-w-3xl px-4">
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
            
            // 디버깅: 이미지 정보 출력
            console.log(`공장 ${displayName}:`, {
              images: f.images,
              image: f.image,
              hasImages: f.images && f.images.length > 0 && f.images[0],
              hasImage: f.image,
              imageUrl: f.images && f.images.length > 0 ? f.images[0] : f.image
            });
            

            
            return (
              <div key={f.id ?? idx} className="rounded-xl bg-white overflow-hidden border border-gray-200">
                {/* 이미지 영역 - 데스크톱에서만 표시 */}
                <div className="hidden md:block w-full h-32 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl group">
                  <MatchingFactoryImage factory={f} idx={idx} />
                  {/* 이미지 로드 실패 시 표시할 대체 텍스트 */}
                  <div className="text-gray-400 text-sm font-medium hidden flex items-center justify-center h-full">
                    <div className="text-center">
                      <div>이미지 준비 중</div>
                    </div>
                  </div>
                </div>
                {/* 이미지와 텍스트 사이 gap - 데스크톱에서만 */}
                <div className="hidden md:block mt-2" />
                {/* 정보 영역 (패딩 적용) */}
                <div className="p-3 md:p-4">
                  {/* 공장 타입 및 주요 원단 칩 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {randomFabrics.map((chip) => (
                      <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-2 md:px-3 py-1 text-xs font-semibold">
                        {chip.label}
                      </span>
                    ))}
                  </div>
                  <div className="font-bold text-sm md:text-base mb-1">{displayName}</div>
                  {/* 주요 품목 */}
                  <div className="text-xs md:text-sm font-bold mt-2 mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                    <span className="shrink-0">주요품목</span>
                    <span className="font-normal ml-2 flex-1 truncate">{mainItems}</span>
                  </div>
                  <div className="text-xs md:text-sm font-bold" style={{ color: '#333333', opacity: 0.6 }}>
                    MOQ(최소 주문 수량) <span className="font-normal">{typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? Number(f.moq) : (typeof f.minOrder === 'number' ? f.minOrder : '-'))}</span>
                  </div>
                  
                  <button
                    className="w-full mt-3 bg-[#333333] text-white rounded-lg py-2 font-semibold hover:bg-[#222] transition text-sm md:text-base"
                    onClick={() => {
                      if (!isLoggedIn) {
                        alert('로그인 후 이용 가능합니다.');
                        return;
                      }
                      router.push(`/factories/${f.id}`);
                    }}
                  >
                    의뢰하기
                  </button>
                  
                  {/* 피드백 UI */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">이 추천이 도움이 되었나요?</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`text-xl transition-all duration-200 hover:scale-110 ${
                            feedbackRatings[f.id || 0] >= star 
                              ? 'text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`별점 클릭: 공장 ${f.id}, 점수 ${star}`);
                            submitFeedback(f.id || 0, star);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {feedbackRatings[f.id || 0] && (
                      <div className="text-xs text-green-600 mt-1">
                        감사합니다! ({feedbackRatings[f.id || 0]}점)
                      </div>
                    )}
                    
                    {/* 매칭 점수 표시 - 피드백 아래로 이동 */}
                    <div className="text-xs text-gray-500 mt-2">
                      매칭도: {f.score ? f.score.toFixed(1) + '%' : 'N/A'}
                    </div>
                  </div>
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
    <div className="w-full min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-start overflow-x-hidden py-8 md:py-16 px-4 md:px-6">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 items-start justify-center flex-1 transition-opacity duration-700 px-1 overflow-hidden bg-[#F4F5F7] pb-0 mb-0" style={{ minHeight: '84vh' }}>
        {/* 왼쪽: 질문/선택지 or 결과 카드 or 로딩 */}
        <div className="w-full lg:flex-[2] bg-white rounded-2xl shadow border p-4 md:p-6 flex flex-col h-[70vh] lg:h-[100vh] max-h-[70vh] lg:max-h-[80vh]">
          {answers.length === QUESTIONS.length ? (
            resultLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-[#222222] rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold">추천 결과를 분석 중입니다...</div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  {renderResultCards()}
                </div>
                {/* 하단 버튼 영역 */}
                <div className="flex w-full gap-4 pt-4 shrink-0">
                  <button
                    className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg py-3 text-sm md:text-base font-semibold bg-white hover:bg-gray-50 transition"
                    onClick={() => router.push('/factories')}
                  >
                    <span className="mr-2">🔍</span>직접 찾기
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center rounded-lg py-3 text-sm md:text-base font-semibold bg-[#222] text-white hover:bg-[#111] transition"
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
                <div className="text-sm md:text-base text-gray-500 mb-4">
                  몇 가지 정보를 알려주시면,<br />
                  <span className="font-bold">가장 적합한 3개의 봉제공장을 추천</span>해드립니다.
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex gap-2 mb-6">
                  {QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`h-1 w-8 md:w-12 rounded-full ${idx <= step ? "bg-[#333333]" : "bg-gray-200"}`}></div>
                  ))}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mb-2">{step + 1} of {QUESTIONS.length}</div>
                <div className="text-lg md:text-xl font-bold mb-6">{QUESTIONS[step].question}</div>
                {/* 선택지 영역 */}
                <div className={QUESTIONS[step].key === 'items' ? 'bg-gray-50 rounded-xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 overflow-y-auto flex-1' : 'bg-gray-50 rounded-xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 overflow-y-auto flex-1'}
                  style={QUESTIONS[step].key === 'items' ? { maxHeight: 'unset' } : {}}>
                  {QUESTIONS[step].options.map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-xl bg-white shadow text-xs md:text-[15px] font-medium py-4 md:py-8 transition border border-gray-200 flex items-center justify-center
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
                <button className="text-sm md:text-base text-gray-500 underline" onClick={() => router.push("/")}>나가기</button>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-[#333333] text-sm md:text-base px-4 md:px-6 py-2 md:py-3" onClick={handleSkip}>건너뛰기</Button>
                  <Button
                    className="bg-[#333333] text-white rounded-lg px-6 md:px-8 py-2 md:py-3 font-bold text-sm md:text-base"
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
          className="w-full lg:flex-[1] bg-[#F7F8FA] rounded-xl shadow-md p-4 min-h-[300px] lg:min-h-[500px] flex flex-col gap-6"
          style={{ height: '40vh', maxHeight: '40vh', overflowY: 'auto' }}
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