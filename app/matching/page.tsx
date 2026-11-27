"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { RotateCcw, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/contexts/AuthContext";
import { fetchFactoriesFromDB, isSelectableRegion, type Factory } from "@/lib/factoryCatalog";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { recommendFactoriesFromPrompt, takeMeaningfulMatches } from "@/lib/factoryMatching";
import { FACTORY_TYPES, MAIN_FABRICS, type FactoryType, type MainFabric } from "@/lib/types";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";


// factories 데이터에서 옵션 추출 유틸(공장 찾기에서 복사)
const moqRanges = [
  { label: "0-50", min: 0, max: 50 },
  { label: "51-100", min: 51, max: 100 },
  { label: "101-300", min: 101, max: 300 },
  { label: "301+", min: 301, max: Infinity },
];

// 매칭 페이지용 공장 이미지 컴포넌트
function MatchingFactoryImage({ factory, idx }: { factory: Factory; idx: number }) {
  const { images } = useFactoryImages(factory);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = images[0];
  
  if (imageSrc && imageSrc !== '/logo_donggori.png' && failedSrc !== imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={typeof factory.company_name === 'string' ? factory.company_name : (typeof factory.name === 'string' ? factory.name : '공장 이미지')}
        className="object-cover w-full h-full rounded-xl group-hover:scale-110 transition-transform duration-300"
        width={400}
        height={160}
        priority={idx < 3}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={80}
        onError={() => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`이미지 로드 실패: ${imageSrc}`);
          }
          setFailedSrc(imageSrc);
        }}
      />
    );
  }
  
  return <FactoryImagePlaceholder />;
}

export default function MatchingPage() {
  const { isSignedIn } = useAppAuth();
  // 공장 데이터 state
  const [factories, setFactories] = useState<Factory[]>([]);

  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "failed">("loading");
  useEffect(() => {
    let active = true;
    fetchFactoriesFromDB().then((data) => {
      if (active) {
        setFactories(data);
        setCatalogState("ready");
      }
    }).catch(() => {
      if (active) setCatalogState("failed");
    });
    return () => { active = false; };
  }, []);

  // factories state 기반 옵션 추출 함수 (함수 내부에서 선언)
  const getOptions = useCallback((key: string): string[] => {
    if (key === 'admin_district') {
      const districts = factories.flatMap((f: Factory) =>
        typeof f.admin_district === 'string' ? [f.admin_district.trim()] : []
      );
      return Array.from(new Set(districts.filter(isSelectableRegion)));
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
    { question: "어떤 공정을 원하시나요?", key: "factory_type", label: "공정", options: FACTORY_TYPES },
    { question: "주요 원단을 선택하세요", key: "main_fabrics", label: "원단", options: MAIN_FABRICS },
    { question: "지역을 선택하세요", key: "admin_district", label: "지역", options: getOptions("admin_district") },
    { question: "MOQ(최소 주문 수량)을 선택하세요", key: "moq", label: "주문수량", options: moqRanges.map(r => r.label) },
    { question: "재봉기를 선택하세요", key: "sewing_machines", label: "재봉기", options: getOptions("sewing_machines") },
    { question: "패턴기를 선택하세요", key: "pattern_machines", label: "패턴기", options: getOptions("pattern_machines") },
    { question: "특수기를 선택하세요", key: "special_machines", label: "특수기", options: getOptions("special_machines") },
    { question: "어떤 품목을 원하시나요?", key: "items", label: "품목", options: getOptions("items") },
  ], [getOptions]);
  // 현재 질문 인덱스
  const [step, setStep] = useState(0);
  // 사용자가 선택한 답변들
  const [answers, setAnswers] = useState<string[][]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<ScoredFactory[]>([]);
  const [quickInput, setQuickInput] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [textMatchMode, setTextMatchMode] = useState(false);
  // 추천 결과 로딩 상태 추가
  const [resultLoading, setResultLoading] = useState(false);
  const processedPromptRef = useRef<string>("");


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

  const advance = (values: string[]) => {
    setAnswers([...answers, values]);
    setSelectedOptions([]);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
  };

  const normalizeToken = (value: string) => String(value || "").toLowerCase().replace(/\s+/g, "");

  const splitMultiValues = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  // 도메인 동의어를 하나의 표준 토큰으로 정규화
  const canonicalize = (raw: string): string => {
    const n = normalizeToken(raw);
    const aliasGroups: Record<string, string[]> = {
      봉제: ["봉제", "임가공", "cmt", "완성업", "시아게"],
      샘플: ["샘플", "샘플업"],
      패턴: ["패턴", "패턴업", "수패턴", "캐드패턴"],
      나염: ["나염", "전사", "자수", "나염/전사/자수업"],
      qc: ["qc", "포장업(qc)", "포장업"],
      다이마루: ["다이마루", "니트", "편물", "니트/편물"],
      직기: ["직기", "직물/우븐", "우븐"],
      토탈: ["토탈"],
      기타: ["기타"],
      양산: ["양산", "대량"],
      소량: ["소량", "샘플"],
    };

    for (const [canonical, aliases] of Object.entries(aliasGroups)) {
      const matched = aliases.some((alias) => {
        const a = normalizeToken(alias);
        return n === a || n.includes(a) || a.includes(n);
      });
      if (matched) return canonical;
    }
    return n;
  };

  const toCanonicalSet = (values: string[]): string[] => {
    return Array.from(new Set(values.map(canonicalize).filter(Boolean)));
  };

  const matchRatio = (selected: string[], candidates: string[]) => {
    if (selected.length === 0 || candidates.length === 0) {
      return { ratio: 0, matched: [] as string[] };
    }
    const selectedCanonical = toCanonicalSet(selected);
    const candidateCanonical = new Set(toCanonicalSet(candidates));
    const matched = selectedCanonical.filter((token) => candidateCanonical.has(token));
    return {
      ratio: matched.length / selectedCanonical.length,
      matched,
    };
  };

  const getMoqValue = (factory: Factory): number | null => {
    const fromMoq = typeof factory.moq === "number" ? factory.moq : Number(factory.moq);
    if (!Number.isNaN(fromMoq) && fromMoq > 0) return fromMoq;
    const fromMinOrder = typeof factory.minOrder === "number" ? factory.minOrder : Number(factory.minOrder);
    if (!Number.isNaN(fromMinOrder) && fromMinOrder > 0) return fromMinOrder;
    return null;
  };

  const isMoqRangeMatch = (range: string, moq: number) => {
    if (range === "0-50") return moq >= 0 && moq <= 50;
    if (range === "51-100") return moq >= 51 && moq <= 100;
    if (range === "101-300") return moq >= 101 && moq <= 300;
    if (range === "301+") return moq >= 301;
    return false;
  };

  // 선택 조건 기반 점수 계산
  const getRecommendedFactories = useCallback((answers: string[]) => {
    console.log('🔍 맞춤 추천 시작 - 사용자 답변:', answers);
    
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

      const selectedFactoryTypes = splitMultiValues(answers[0]);
      const selectedFabrics = splitMultiValues(answers[1]);
      const selectedDistricts = splitMultiValues(answers[2]);
      const selectedMoqRange = splitMultiValues(answers[3])[0];
      const selectedSewing = splitMultiValues(answers[4]);
      const selectedPattern = splitMultiValues(answers[5]);
      const selectedSpecial = splitMultiValues(answers[6]);
      const selectedItems = splitMultiValues(answers[7]);

      const factoryTypeCandidates = [
        ...splitMultiValues(factory.factory_type),
        ...splitMultiValues(factory.business_type),
      ];
      const fabricCandidates = splitMultiValues(factory.main_fabrics);
      const districtCandidates = splitMultiValues(factory.admin_district);
      const itemCandidates = [
        ...splitMultiValues(factory.top_items_upper),
        ...splitMultiValues(factory.top_items_lower),
        ...splitMultiValues(factory.top_items_outer),
        ...splitMultiValues(factory.top_items_dress_skirt),
        ...splitMultiValues(factory.top_items_bag),
        ...splitMultiValues(factory.top_items_fashion_accessory),
        ...splitMultiValues(factory.top_items_underwear),
        ...splitMultiValues(factory.top_items_sports_leisure),
        ...splitMultiValues(factory.top_items_pet),
        ...splitMultiValues(factory.items),
        ...splitMultiValues(factory.intro),
        ...splitMultiValues(factory.description),
        ...splitMultiValues(factory.brands_supplied),
      ];

      // 1. 공장 타입 매칭 (가중치: 30)
      if (selectedFactoryTypes.length > 0) {
        maxPossibleScore += weights.factory_type;
        const { ratio, matched } = matchRatio(selectedFactoryTypes, factoryTypeCandidates);
        if (ratio > 0) {
          totalScore += weights.factory_type * ratio;
          matchDetails.push(`공장타입: ${matched.join(", ")}`);
        }
      }

      // 2. 주요 원단 매칭 (가중치: 25)
      if (selectedFabrics.length > 0) {
        maxPossibleScore += weights.main_fabrics;
        const { ratio, matched } = matchRatio(selectedFabrics, fabricCandidates);
        if (ratio > 0) {
          totalScore += weights.main_fabrics * ratio;
          matchDetails.push(`원단: ${matched.join(", ")}`);
        }
      }

      // 3. 지역 매칭 (가중치: 20)
      if (selectedDistricts.length > 0) {
        maxPossibleScore += weights.admin_district;
        const { ratio, matched } = matchRatio(selectedDistricts, districtCandidates);
        if (ratio > 0) {
          totalScore += weights.admin_district * ratio;
          matchDetails.push(`지역: ${matched.join(", ")}`);
        }
      }

      // 4. MOQ 매칭 (가중치: 15)
      const moqValue = getMoqValue(factory);
      if (selectedMoqRange) {
        maxPossibleScore += weights.moq;
        const moqMatch = moqValue !== null && isMoqRangeMatch(selectedMoqRange, moqValue);
        if (moqMatch) {
          totalScore += weights.moq;
          matchDetails.push(`MOQ: ${moqValue}`);
        }
      }

      // 5. 장비 매칭 (가중치: 10)
      let equipmentRawScore = 0;
      let equipmentRawMax = 0;
      if (selectedSewing.length > 0) {
        equipmentRawMax += 3;
        const { ratio } = matchRatio(selectedSewing, splitMultiValues(factory.sewing_machines));
        equipmentRawScore += ratio * 3;
      }
      if (selectedPattern.length > 0) {
        equipmentRawMax += 3;
        const { ratio } = matchRatio(selectedPattern, splitMultiValues(factory.pattern_machines));
        equipmentRawScore += ratio * 3;
      }
      if (selectedSpecial.length > 0) {
        equipmentRawMax += 4;
        const { ratio } = matchRatio(selectedSpecial, splitMultiValues(factory.special_machines));
        equipmentRawScore += ratio * 4;
      }
      if (equipmentRawMax > 0) {
        maxPossibleScore += weights.equipment;
        const normalizedEquipmentScore = (equipmentRawScore / equipmentRawMax) * weights.equipment;
        totalScore += normalizedEquipmentScore;
        if (normalizedEquipmentScore > 0) {
          matchDetails.push(`장비 매칭: ${normalizedEquipmentScore.toFixed(1)}점`);
        }
      }

      // 6. 품목 매칭 (가중치: 10)
      if (selectedItems.length > 0) {
        maxPossibleScore += weights.items;
        const { ratio, matched } = matchRatio(selectedItems, itemCandidates);
        if (ratio > 0) {
          const itemScore = ratio * weights.items;
          totalScore += itemScore;
          matchDetails.push(`품목: ${matched.join(', ')}`);
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
    
    // 최소 의미 점수(30점)를 충족한 공장만 추천한다. 결과 개수를 맞추기
    // 위해 조건 불일치 공장을 섞지 않는다.
    const result = takeMeaningfulMatches(sortedFactories);

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

  const getRecommendedFactoriesFromPrompt = useCallback((prompt: string) => {
    return recommendFactoriesFromPrompt(factories, prompt, 3);
  }, [factories]);

  const startTextMatching = useCallback((prompt: string) => {
    const trimmed = String(prompt || "").trim();
    if (!trimmed) return;

    setTextPrompt(trimmed);
    setQuickInput(trimmed);
    setTextMatchMode(true);
    setStep(0);
    setAnswers([]);
    setSelectedOptions([]);
    setRecommended([]);
    setResultLoading(true);
    const rec = getRecommendedFactoriesFromPrompt(trimmed);
    setRecommended(rec);
    setResultLoading(false);
  }, [getRecommendedFactoriesFromPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const promptFromQuery = String(new URLSearchParams(window.location.search).get("prompt") || "").trim();
    if (!promptFromQuery || catalogState === "loading") return;
    if (processedPromptRef.current === promptFromQuery) return;
    processedPromptRef.current = promptFromQuery;
    startTextMatching(promptFromQuery);
  }, [catalogState, startTextMatching]);

  const [feedbackRatings, setFeedbackRatings] = useState<{[key: number]: number}>({});

  // 피드백 제출 함수
  const submitFeedback = async (factoryId: number, rating: number) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factory_id: factoryId,
          rating,
          user_answers: answers,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || '피드백을 저장하지 못했습니다.');
      setFeedbackRatings(prev => ({ ...prev, [factoryId]: rating }));
    } catch (error) {
      alert(error instanceof Error ? error.message : '피드백을 저장하지 못했습니다.');
    }
  };

  // 추천 결과 카드 UI (공장 정보 상세)
  function renderResultCards() {
    if (catalogState === "failed") return <p role="status">공장 정보 연결 후 추천 결과를 확인할 수 있습니다.</p>;
    if (recommended.length === 0) {
      return (
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-gray-900">조건에 맞는 공장을 찾지 못했어요</h2>
          <p className="mt-2 text-sm text-gray-600">
            조건을 줄여 다시 추천받거나 공장 목록에서 직접 확인해주세요.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center justify-center animate-fade-in">
        <div className="text-2xl md:text-[40px] font-extrabold text-gray-900 mb-8 text-center px-4">
          조건에 맞는 봉제공장을 추천드려요!
        </div>
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
                      if (!isSignedIn) {
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
                            feedbackRatings[Number(f.id ?? 0)] >= star 
                              ? 'text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`별점 클릭: 공장 ${f.id}, 점수 ${star}`);
                            submitFeedback(Number(f.id ?? 0), star);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {feedbackRatings[Number(f.id ?? 0)] && (
                      <div className="text-xs text-green-600 mt-1">
                        감사합니다! ({feedbackRatings[Number(f.id ?? 0)]}점)
                      </div>
                    )}
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
        <div className="w-16 h-16 border-4 border-gray-300 border-t-dg-ink rounded-full animate-spin mb-6"></div>
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
  };

  // 추천 결과(매칭 완료) 시 왼쪽 하단에 '직접 찾기'와 '다시하기' 버튼을 추가합니다. '직접 찾기'는 /factories로 이동, '다시하기'는 매칭 상태(answers, step, chat 등) 초기화. 버튼은 Figma 예시처럼 스타일링(직접 찾기: 흰색, 다시하기: 검정 배경, 아이콘 포함)합니다.
  const handleRestart = () => {
    // 모든 상태 초기화
    setLoading(false);
    setStep(0);
    setAnswers([]);
    setSelectedOptions([]);
    setRecommended([]); // 결과 초기화
    setResultLoading(false);
    setTextMatchMode(false);
    setTextPrompt("");
    setQuickInput("");
    processedPromptRef.current = "";
    router.replace("/matching");
  };

  // 답변이 모두 끝나면 분석 로딩 후 결과 노출
  useEffect(() => {
    if (textMatchMode) return;
    if (answers.length === QUESTIONS.length) {
      const rec = getRecommendedFactories(answers.map(a => a.join(", ")));
      setRecommended(rec);
      setResultLoading(false);
    } else {
      setResultLoading(false);
    }
  }, [answers.length, QUESTIONS.length, getRecommendedFactories, answers, textMatchMode]);

  const isResultStage = textMatchMode || answers.length === QUESTIONS.length;

  // 왼쪽: 질문/선택지 or 결과 카드 or 로딩
  return (
    <div className="service-workspace min-h-screen">
      <div className={`${PAGE_CONTAINER_CLASS} py-8 md:py-10 space-y-6`}>
        <div className="dg-service-heading">
          <h1>맞춤 추천</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            몇 가지 정보만 알려주시면 가장 적합한 봉제공장 3곳을 추천해드립니다.
          </p>
        </div>

        {catalogState === "failed" && <p role="status" className="border-l-4 border-dg-ink bg-white p-4 text-sm">공장 정보를 불러오지 못해 추천이 제한됩니다. <button className="underline" onClick={() => window.location.reload()}>다시 시도</button></p>}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-center flex-1 transition-opacity duration-700 min-h-[52vh]">
        {/* 왼쪽: 질문/선택지 or 결과 카드 or 로딩 */}
        <div className="flex min-h-[480px] w-full flex-col rounded-lg border border-dg-line bg-white p-4 md:min-h-[540px] md:p-6 lg:max-h-[860px] lg:min-h-[560px] lg:flex-[2]">
          {isResultStage ? (
            resultLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-dg-ink rounded-full animate-spin mb-6" />
                <div className="text-lg font-semibold text-gray-800">분석 중입니다...</div>
                <p className="text-sm text-gray-500 mt-2">가장 적합한 공장을 찾고 있어요</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  {textMatchMode && textPrompt && (
                    <div className="mb-4 text-sm text-gray-500 text-center px-4">
                      입력한 요청: <span className="font-semibold text-gray-800">{textPrompt}</span>
                    </div>
                  )}
                  {renderResultCards()}
                </div>
                {/* 하단 버튼 영역 */}
                <div className="flex w-full gap-4 pt-4 shrink-0">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm md:text-base font-semibold bg-white hover:bg-gray-50 transition"
                    onClick={() => router.push('/factories')}
                  >
                    <Search className="w-4 h-4" />
                    직접 찾기
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm md:text-base font-semibold bg-[#111] text-white hover:bg-black transition"
                    onClick={handleRestart}
                  >
                    <RotateCcw className="w-4 h-4" />
                    다시하기
                  </button>
                </div>
              </div>
            )
          ) : (
            // 기존 질문/선택지 UI
            <>
              {/* 상단~선택지 영역 */}
              <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 md:p-4">
                  <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    제작 조건 직접 입력
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      aria-label="제작 조건 직접 입력"
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing && catalogState !== "loading" && quickInput.trim()) {
                          startTextMatching(quickInput);
                        }
                      }}
                      placeholder="예: 여성 니트 상의 소량 생산 가능한 공장을 찾고 싶어요"
                      className="w-full h-10 md:h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => startTextMatching(quickInput)}
                      disabled={!quickInput.trim() || catalogState === "loading"}
                      className={`h-10 md:h-11 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                        quickInput.trim()
                          ? "bg-dg-ink text-white hover:bg-black"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      공장 추천받기
                    </button>
                  </div>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex gap-2 mb-6">
                  {QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`h-1 w-8 md:w-12 rounded-full ${idx <= step ? "bg-dg-ink" : "bg-gray-200"}`}></div>
                  ))}
                </div>
                <div className="text-xs md:text-sm font-semibold ai-matching-glow mb-2">
                  조건 선택 {step + 1} / {QUESTIONS.length}
                </div>
                <h2 className="mb-5 text-xl font-bold text-dg-ink md:text-2xl">{QUESTIONS[step].question}</h2>
                {/* 선택지 영역 */}
                <div className={QUESTIONS[step].key === 'items' ? 'bg-gray-50 rounded-xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 overflow-y-auto flex-1' : 'bg-gray-50 rounded-xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 overflow-y-auto flex-1'}
                  style={QUESTIONS[step].key === 'items' ? { maxHeight: 'unset' } : {}}>
                  {QUESTIONS[step].options.map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded bg-white text-sm md:text-[15px] font-medium py-4 transition border flex items-center justify-center
                        ${selectedOptions.includes(option)
                          ? "border-dg-ink ring-2 ring-gray-200"
                          : "border-gray-200 hover:border-gray-400"}
                      `}
                      aria-pressed={selectedOptions.includes(option)}
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
                  <Button variant="ghost" className="text-[#333333] text-sm md:text-base px-4 md:px-6 py-2 md:py-3" onClick={() => advance([])}>건너뛰기</Button>
                  <Button
                    className="bg-dg-ink hover:bg-black text-white rounded-lg px-6 md:px-8 py-2 md:py-3 font-bold text-sm md:text-base"
                    onClick={() => advance(selectedOptions)}
                    disabled={selectedOptions.length === 0}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <aside className="condition-ledger w-full self-start p-5 lg:flex-1">
          <h2 className="mb-4 text-xl font-bold">나의 제작 조건</h2>
          {textMatchMode ? <p className="leading-7">{textPrompt}</p> :
            <ol className="divide-y divide-dg-line border-b border-dg-line">
              {QUESTIONS.map((q, i) => (
                <li key={q.key} className="grid grid-cols-[5rem_1fr_auto] items-baseline gap-2 py-3 text-sm">
                  <strong>{q.label}</strong>
                  <span className="text-dg-muted">{answers[i]?.join(", ") || (i < answers.length ? "건너뜀" : "미선택")}</span>
                  {i < answers.length && <button className="text-dg-ink underline" aria-label={q.label + " 수정"} onClick={() => handleEdit(i)}>수정</button>}
                </li>
              ))}
            </ol>}
        </aside>
      </div>
      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-full max-w-xs rounded-lg border border-dg-line bg-white p-8 text-center shadow-lg">
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
    </div>
  );
}
