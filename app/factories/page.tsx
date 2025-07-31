"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { List, Map as MapIcon } from "lucide-react";
import { factories, fetchFactoriesFromDB, type Factory } from "@/lib/factories";
import { testSupabaseConnection } from "@/lib/supabaseClient";
// import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import KakaoMap from "@/components/KakaoMap";
// import SimpleKakaoMap from "@/components/SimpleKakaoMap";
// import { getFactoryLocations } from "@/lib/factoryMap";
import FactoryInfoPopup from "@/components/FactoryInfoPopup";
import { getFactoryLocationByName, getDongdaemunCenter } from "@/lib/factoryLocationMapping";

export default function FactoriesPage() {
  const [factoriesData, setFactoriesData] = useState<Factory[]>([]); // 초기값 빈 배열
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    count?: number;
    error?: string;
    message?: string;
  } | null>(null);

  // 검색 상태
  const [search, setSearch] = useState("");
  // 필터 상태 (여러 개 선택 가능하도록 배열로 변경)
  const [selected, setSelected] = useState({
    admin_district: [] as string[],
    moq: [] as string[],
    monthly_capacity: [] as string[],
    business_type: [] as string[],
    distribution: [] as string[],
    delivery: [] as string[],
    items: [] as string[],
    equipment: [] as string[],
    sewing_machines: [] as string[],
    pattern_machines: [] as string[],
    special_machines: [] as string[],
    factory_type: [] as string[],
    main_fabrics: [] as string[],
    processes: [] as string[],
  });

  // Range 옵션
  const moqRanges = [
    { label: "0-50", min: 0, max: 50 },
    { label: "51-100", min: 51, max: 100 },
    { label: "101-300", min: 101, max: 300 },
    { label: "301+", min: 301, max: Infinity },
  ];
  const monthlyCapacityRanges = [
    { label: "0-100", min: 0, max: 100 },
    { label: "101-300", min: 101, max: 300 },
    { label: "301-500", min: 301, max: 500 },
    { label: "501+", min: 501, max: Infinity },
  ];

  // 목록/지도 뷰 상태
  const [view, setView] = useState<'list' | 'map'>('list');

  // 옵션 동적 추출 함수 (중복 없는 값, 분리 처리)
  function getOptions(key: string): string[] {
    if (key === 'business_type' || key === 'distribution' || key === 'delivery') {
      const values = factoriesData.flatMap(f => (f[key] ? String(f[key]).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'equipment') {
      // |로 카테고리 분리, :로 카테고리명/값 분리, 쉼표로 하위 항목 분리
      const all = factoriesData.flatMap(f => (f.equipment ? String(f.equipment).split('|').map((v: string) => v.trim()) : []));
      const byCategory: Record<string, string[]> = {};
      all.forEach(str => {
        const [cat, vals] = str.split(':').map(s => s.trim());
        if (cat && vals) {
          byCategory[cat] = [...(byCategory[cat] || []), ...vals.split(',').map((v: string) => v.trim())];
        }
      });
      // 중복 제거
      Object.keys(byCategory).forEach(cat => {
        byCategory[cat] = Array.from(new Set(byCategory[cat].filter(Boolean)));
      });
      // equipment는 실제로 string[]로 반환하지 않으므로 빈 배열 반환
      return [];
    }
    if (key === 'sewing_machines' || key === 'pattern_machines' || key === 'special_machines') {
      const values = factoriesData.flatMap(f => (f[key] ? String(f[key]).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'items') {
      const arr = factoriesData.flatMap(f => [
        f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet
      ].filter((v): v is string => typeof v === 'string' && Boolean(v)));
      const commaSplit = arr.flatMap(i => String(i).split(',').map((v: string) => v.trim()));
      return Array.from(new Set(commaSplit.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'processes') {
      const values = factoriesData.flatMap(f => (f.processes ? String(f.processes).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'main_fabrics') {
      const values = factoriesData.flatMap(f => (f.main_fabrics ? String(f.main_fabrics).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    const values = factoriesData.map(f => f[key]);
    // 항상 배열 반환 보장
    if (Array.isArray(values)) {
      return Array.from(new Set(values.flatMap((v) => typeof v === 'string' ? [v] : [])));
    }
    return [];
  }

  // 필터링 로직 (여러 값 중 하나라도 포함되면 통과, range/검색 포함)
  const filtered = factoriesData.filter(f => {
    const itemList = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet];
    // 검색어 필터
    const searchMatch = !search ||
      (typeof f.company_name === 'string' && f.company_name.includes(search)) ||
      (typeof f.intro === 'string' && f.intro.includes(search)) ||
      itemList.some(i => typeof i === 'string' && i && i.includes(search));
    // MOQ/월생산량 range 필터
    const moqValue = typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' ? Number(f.moq) : undefined);
    const moqMatch = selected.moq.length === 0 || selected.moq.some(rangeLabel => {
      const range = moqRanges.find(r => r.label === rangeLabel);
      return range && typeof moqValue === 'number' && moqValue >= range.min && moqValue <= range.max;
    });
    const monthlyCapacityMatch = selected.monthly_capacity.length === 0 || selected.monthly_capacity.some(rangeLabel => {
      const range = monthlyCapacityRanges.find(r => r.label === rangeLabel);
      return range && typeof f.monthly_capacity === 'number' && f.monthly_capacity >= range.min && f.monthly_capacity <= range.max;
    });
    // business_type, distribution, delivery, equipment 분리 필터
    const businessTypeArr = f.business_type ? String(f.business_type).split(',').map((v: string) => v.trim()) : [];
    const distributionArr = f.distribution ? String(f.distribution).split(',').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    const deliveryArr = f.delivery ? String(f.delivery).split(',').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    const equipmentArr = f.equipment ? String(f.equipment).split('|').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    // 재봉기/패턴기/특수기 필터: 쉼표 분리 후 일부라도 포함되면 통과
    const sewingArr = typeof f.sewing_machines === 'string' ? f.sewing_machines.split(',').map(s => s.trim()) : [];
    const patternArr = typeof f.pattern_machines === 'string' ? f.pattern_machines.split(',').map(s => s.trim()) : [];
    const specialArr = typeof f.special_machines === 'string' ? f.special_machines.split(',').map(s => s.trim()) : [];
    return (
      searchMatch &&
      (selected.admin_district.length === 0 || (typeof f.admin_district === 'string' && selected.admin_district.includes(f.admin_district))) &&
      moqMatch &&
      monthlyCapacityMatch &&
      (selected.business_type.length === 0 || businessTypeArr.filter((v): v is string => typeof v === 'string').some(v => selected.business_type.includes(v))) &&
      (selected.distribution.length === 0 || distributionArr.filter((v): v is string => typeof v === 'string').some(v => selected.distribution.includes(v))) &&
      (selected.delivery.length === 0 || deliveryArr.filter((v): v is string => typeof v === 'string').some(v => selected.delivery.includes(v))) &&
      (selected.items.length === 0 || itemList.filter((i): i is string => typeof i === 'string').some(i => selected.items.includes(i))) &&
      (selected.equipment.length === 0 || equipmentArr.filter((v): v is string => typeof v === 'string').some(v => selected.equipment.includes(v))) &&
      (selected.sewing_machines.length === 0 || sewingArr.some(v => selected.sewing_machines.includes(v))) &&
      (selected.pattern_machines.length === 0 || patternArr.some(v => selected.pattern_machines.includes(v))) &&
      (selected.special_machines.length === 0 || specialArr.some(v => selected.special_machines.includes(v))) &&
      (selected.factory_type.length === 0 || (typeof f.factory_type === 'string' && selected.factory_type.includes(f.factory_type))) &&
      (selected.main_fabrics.length === 0 || (typeof f.main_fabrics === 'string' && selected.main_fabrics.includes(f.main_fabrics))) &&
      (selected.processes.length === 0 || (typeof f.processes === 'string' && selected.processes.includes(f.processes)))
    );
  });

  // 필터가 걸려있지 않을 때 이미지가 있는 업장들을 상단에 배치
  const sortedFiltered = useMemo(() => {
    // 필터가 걸려있지 않은 경우에만 정렬 적용
    const hasActiveFilters = Object.values(selected).some(arr => arr.length > 0) || search;
    
    if (!hasActiveFilters) {
      return [...filtered].sort((a, b) => {
        const aHasImages = a.images && a.images.length > 0;
        const bHasImages = b.images && b.images.length > 0;
        
        if (aHasImages && !bHasImages) return -1; // a가 이미지 있음, b가 없음
        if (!aHasImages && bHasImages) return 1;  // a가 이미지 없음, b가 있음
        return 0; // 둘 다 이미지 있거나 둘 다 없음
      });
    }
    
    return filtered;
  }, [filtered, selected, search]);

  // 필터 뱃지
  const badges = Object.entries(selected).flatMap(([key, arr]) =>
    arr.map(val => ({ key, val }))
  );

  // 아코디언 열림/닫힘 상태 관리
  const [openFilter, setOpenFilter] = useState<{ [key: string]: boolean }>({
    process: true,
    region: true,
    items: true,
    moq: false,
    equipment: false,
  });

  useEffect(() => {
    const loadFactories = async () => {
      setLoading(true);
      try {
        // Supabase 연결 테스트
        const connectionTest = await testSupabaseConnection();
        console.log('Supabase 연결 테스트 결과:', connectionTest);
        
        if (!connectionTest.success) {
          console.error('Supabase 연결 실패:', connectionTest.error);
          setConnectionStatus(connectionTest);
          setFactoriesData([]); // 연결 실패 시 빈 배열
          setLoading(false);
          return;
        }
        
        // Supabase에서 데이터 가져오기 시도
        const dbFactories = await fetchFactoriesFromDB();
        
        if (dbFactories.length > 0) {
          console.log('Supabase에서 데이터를 성공적으로 가져왔습니다:', dbFactories.length);
          setFactoriesData(dbFactories);
          setConnectionStatus({ success: true, count: dbFactories.length });
        } else {
          console.log('Supabase 데이터가 없어 하드코딩된 데이터를 사용합니다.');
          setFactoriesData([]); // 데이터가 없으면 빈 배열
          setConnectionStatus({ success: true, count: 0, message: 'DB에 데이터가 없음' });
        }
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
        console.log('오류로 인해 하드코딩된 데이터를 사용합니다.');
        setFactoriesData(factories); // 예외 상황에서만 하드코딩 데이터 사용
        setConnectionStatus({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadFactories();
  }, []);

  // 카카오지도용 공장 데이터 로드 (사용하지 않음)
  // useEffect(() => {
  //   const loadMapFactories = async () => {
  //     setMapLoading(true);
  //     try {
  //       const factoryLocations = await getFactoryLocations();
  //       setMapFactories(factoryLocations);
  //     } catch (error) {
  //       console.error('지도용 공장 데이터 로드 실패:', error);
  //     } finally {
  //       setMapLoading(false);
  //     }
  //   };
    
  //   loadMapFactories();
  // }, []);



  // 데모 이미지 배열
  const DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
  ];

  // 옵션 변수는 모두 const로 한 번만 선언 (함수와 변수명 겹치지 않게 *_Options로 명명)
  const processesOptions = Array.isArray(getOptions('processes')) ? getOptions('processes') : [];
  const regionOptions = Array.isArray(getOptions('admin_district')) ? getOptions('admin_district') : [];
  const sewingMachineOptions = Array.isArray(getOptions('sewing_machines')) ? getOptions('sewing_machines') : [];
  const patternMachineOptions = Array.isArray(getOptions('pattern_machines')) ? getOptions('pattern_machines') : [];
  const specialMachineOptions = Array.isArray(getOptions('special_machines')) ? getOptions('special_machines') : [];
  const itemOptionsAll = Array.isArray(getOptions('items')) ? getOptions('items') : [];
  const mainFabricsOptions = Array.isArray(getOptions('main_fabrics')) ? getOptions('main_fabrics') : [];

  // 카드별 칩을 공장 id 기준으로 고정
  const cardFabricsById = useMemo(() => {
    const fabricChips = [
      { label: '봉제', color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
      { label: '샘플', color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
      { label: '패턴', color: '#FF8308', bg: 'rgba(255, 131, 8, 0.1)' },
      { label: '나염', color: '#A259FF', bg: 'rgba(162, 89, 255, 0.1)' },
      { label: '전사', color: '#ED6262', bg: 'rgba(237, 98, 98, 0.1)' },
    ];
    // id가 없으면 idx로 fallback
    return Object.fromEntries(
      factoriesData.map((f, idx) => {
        // id 또는 idx로 seed 고정
        const seed = String(f.id ?? idx);
        // 간단한 해시로 seed 고정
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        // hash 기반 shuffle
        const shuffled = [...fabricChips].sort((a, b) => {
          const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
          const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
          return h1 - h2;
        });
        // hash 기반 개수(1~2개)
        const count = (Math.abs(hash) % 2) + 1;
        return [f.id ?? idx, shuffled.slice(0, count)];
      })
    );
  }, [factoriesData]);

  // FactoryMap 동적 import (SSR 비활성화)
  // const FactoryMap = dynamic(() => import("@/components/FactoryMap"), { ssr: false });

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // 카카오지도용 상태 (사용하지 않음)
  // const [mapFactories, setMapFactories] = useState<any[]>([]);
  // const [mapLoading, setMapLoading] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // 첫 번째 공장 자동 선택 (지도 뷰일 때)
  useEffect(() => {
    if (view === 'map' && filtered.length > 0 && !selectedFactory) {
      const firstFactory = filtered[0];
      setSelectedFactory(firstFactory);
      setShowPopup(true);
    }
  }, [view, filtered, selectedFactory]);

  return (
    <div className="max-w-[1400px] mx-auto py-8 sm:py-12 md:py-16 flex flex-col gap-6 sm:gap-8 px-4 sm:px-6">
      {/* 로딩 표시 */}
      {loading && (
        <div className="text-center py-8 sm:py-10">
          <div className="text-base sm:text-lg">공장 정보를 불러오는 중입니다...</div>
        </div>
      )}
      
      {/* 디버그 정보 - 연결 실패 시에만 표시 */}
      {connectionStatus && !connectionStatus.success && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300">
          <div className="font-medium">
            ❌ Supabase 연결 실패
          </div>
          {connectionStatus.error && <div>오류: {connectionStatus.error}</div>}
          
          {/* 환경 변수 설정 안내 */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="font-medium text-blue-800 mb-2">🔧 Supabase 설정이 필요합니다</div>
            <div className="text-blue-700 text-xs space-y-1">
              <div>1. 프로젝트 루트에 <code className="bg-blue-100 px-1 rounded">.env.local</code> 파일 생성</div>
              <div>2. 다음 내용 추가:</div>
              <div className="bg-blue-100 p-2 rounded font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
              </div>
              <div>3. Supabase 프로젝트에서 URL과 Anon Key 확인</div>
              <div>4. 개발 서버 재시작</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold text-gray-900 mb-2">봉제공장 찾기</h1>
        <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8">퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요.</p>
      </div>
      {/* 모바일 필터 버튼 */}
      <div className="lg:hidden flex mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#333] text-white rounded-lg font-semibold shadow"
          onClick={() => setShowMobileFilter(true)}
        >
          <span>🔍</span> 필터
        </button>
      </div>
      <div className="flex flex-row gap-12 items-start w-full">
        {/* 필터 패널 (좌측) - 데스크탑 */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl mb-6 flex flex-col gap-2">
            <div className="font-bold mb-2 flex items-center justify-between text-lg pt-4 pb-2">
              <span>필터</span>
              <button
                onClick={() => setSelected({
                  admin_district: [], moq: [], monthly_capacity: [], business_type: [], distribution: [], delivery: [], items: [], equipment: [], sewing_machines: [], pattern_machines: [], special_machines: [], factory_type: [], main_fabrics: [], processes: []
                })}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition"
                title="필터 초기화"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
            <hr className="my-2 border-gray-200" />
            {/* 공정 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, process: !f.process }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  공정
                  {selected.processes.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.processes.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.process && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {processesOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.processes?.includes?.(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        processes: sel.processes?.includes?.(opt)
                          ? sel.processes.filter((v: string) => v !== opt)
                          : [...(sel.processes || []), opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 지역 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, region: !f.region }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  지역
                  {selected.admin_district.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.admin_district.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.region ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.region && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {regionOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.admin_district.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        admin_district: sel.admin_district.includes(opt)
                          ? sel.admin_district.filter((v: string) => v !== opt)
                          : [...sel.admin_district, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* MOQ(최소수량) */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, moq: !f.moq }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  MOQ(최소수량)
                  {selected.moq.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.moq.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.moq ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.moq && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {moqRanges.map(opt => (
                    <Button
                      key={opt.label}
                      size="sm"
                      variant={selected.moq.includes(opt.label) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        moq: sel.moq.includes(opt.label)
                          ? sel.moq.filter((v: string) => v !== opt.label)
                          : [...sel.moq, opt.label]
                      }))}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 재봉기 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, sewing_machines: !f.sewing_machines }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  재봉기
                  {selected.sewing_machines.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.sewing_machines.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.sewing_machines ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.sewing_machines && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {sewingMachineOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.sewing_machines.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        sewing_machines: sel.sewing_machines.includes(opt)
                          ? sel.sewing_machines.filter((v: string) => v !== opt)
                          : [...sel.sewing_machines, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 패턴기 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, pattern_machines: !f.pattern_machines }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  패턴기
                  {selected.pattern_machines.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.pattern_machines.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.pattern_machines ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.pattern_machines && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {patternMachineOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.pattern_machines.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        pattern_machines: sel.pattern_machines.includes(opt)
                          ? sel.pattern_machines.filter((v: string) => v !== opt)
                          : [...sel.pattern_machines, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 특수기 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, special_machines: !f.special_machines }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  특수기
                  {selected.special_machines.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.special_machines.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.special_machines ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.special_machines && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {specialMachineOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.special_machines.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        special_machines: sel.special_machines.includes(opt)
                          ? sel.special_machines.filter((v: string) => v !== opt)
                          : [...sel.special_machines, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 품목 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, items: !f.items }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  품목
                  {selected.items.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.items.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.items ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.items && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {itemOptionsAll.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.items.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        items: sel.items.includes(opt)
                          ? sel.items.filter((v: string) => v !== opt)
                          : [...sel.items, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {/* 주요 품목 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, main_fabrics: !f.main_fabrics }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  주요 원단
                  {selected.main_fabrics.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.main_fabrics.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.main_fabrics && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {mainFabricsOptions.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={selected.main_fabrics.includes(opt) ? "default" : "outline"}
                      className="rounded-full border px-4"
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        main_fabrics: sel.main_fabrics.includes(opt)
                          ? sel.main_fabrics.filter((v: string) => v !== opt)
                          : [...sel.main_fabrics, opt]
                      }))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
        {/* 모바일 필터 오버레이 */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl w-[90vw] max-w-md p-6 flex flex-col gap-2 relative border border-gray-200 shadow-lg">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                onClick={() => setShowMobileFilter(false)}
                aria-label="필터 닫기"
              >
                ×
              </button>
              {/* 필터 내용 복붙 (aside 내부와 동일) */}
              <div className="font-bold mb-2 flex items-center justify-between text-lg pt-4 pb-2">
                <span>필터</span>
                <button
                  onClick={() => setSelected({
                    admin_district: [], moq: [], monthly_capacity: [], business_type: [], distribution: [], delivery: [], items: [], equipment: [], sewing_machines: [], pattern_machines: [], special_machines: [], factory_type: [], main_fabrics: [], processes: []
                  })}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition"
                  title="필터 초기화"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              <hr className="my-2 border-gray-200" />
              {/* 이하 필터 항목들(공정, 지역, MOQ 등) - aside 내부와 동일하게 복사 */}
              {/* 공정 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, process: !f.process }))}>
                  <span className="font-bold text-[16px] flex items-center gap-3">
                    공정
                    {selected.processes.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.processes.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.process && (
                  <div className="flex flex-wrap gap-2 pb-2 mt-3">
                    {processesOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.processes?.includes?.(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          processes: sel.processes?.includes?.(opt)
                            ? sel.processes.filter((v: string) => v !== opt)
                            : [...(sel.processes || []), opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 지역 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, region: !f.region }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    지역
                    {selected.admin_district.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.admin_district.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.region ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.region && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {regionOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.admin_district.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          admin_district: sel.admin_district.includes(opt)
                            ? sel.admin_district.filter((v: string) => v !== opt)
                            : [...sel.admin_district, opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* MOQ(최소수량) */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, moq: !f.moq }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    MOQ(최소수량)
                    {selected.moq.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.moq.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.moq ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.moq && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {moqRanges.map(opt => (
                      <Button
                        key={opt.label}
                        size="sm"
                        variant={selected.moq.includes(opt.label) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          moq: sel.moq.includes(opt.label)
                            ? sel.moq.filter((v: string) => v !== opt.label)
                            : [...sel.moq, opt.label]
                        }))}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 재봉기 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, sewing_machines: !f.sewing_machines }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    재봉기
                    {selected.sewing_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.sewing_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.sewing_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.sewing_machines && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {sewingMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.sewing_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          sewing_machines: sel.sewing_machines.includes(opt)
                            ? sel.sewing_machines.filter((v: string) => v !== opt)
                            : [...sel.sewing_machines, opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 패턴기 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, pattern_machines: !f.pattern_machines }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    패턴기
                    {selected.pattern_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.pattern_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.pattern_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.pattern_machines && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {patternMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.pattern_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          pattern_machines: sel.pattern_machines.includes(opt)
                            ? sel.pattern_machines.filter((v: string) => v !== opt)
                            : [...sel.pattern_machines, opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 특수기 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, special_machines: !f.special_machines }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    특수기
                    {selected.special_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.special_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.special_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.special_machines && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {specialMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.special_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          special_machines: sel.special_machines.includes(opt)
                            ? sel.special_machines.filter((v: string) => v !== opt)
                            : [...sel.special_machines, opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 품목 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, items: !f.items }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    품목
                    {selected.items.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.items.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.items ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.items && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {itemOptionsAll.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.items.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-4"
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          items: sel.items.includes(opt)
                            ? sel.items.filter((v: string) => v !== opt)
                            : [...sel.items, opt]
                        }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* 주요 품목 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, main_fabrics: !f.main_fabrics }))}>
                  <span className="font-bold text-[16px] flex items-center gap-1">
                    주요 원단
                    {selected.main_fabrics.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5">{selected.main_fabrics.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.main_fabrics && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {/* 데이터가 없으므로 버튼 없음 */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 오른쪽: 검색+카드/지도 컨테이너 */}
        <div className="flex-1 min-w-0 flex flex-col items-stretch">
          {/* 검색 인풋 + 목록/지도 버튼 */}
          <div className="flex gap-2 mb-4 items-center self-start w-full">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="공장명, 키워드로 검색하세요."
              className="flex-1 w-full border rounded-[0.625rem] px-4 py-2 focus:border-black focus:outline-none"
            />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'list' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" /> 목록
              </button>
              <button
                className={`px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'map' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('map')}
              >
                <MapIcon className="w-4 h-4" /> 지도
              </button>
            </div>
          </div>
          {/* 공장 개수 표시 */}
          <div className="mb-2 text-sm text-gray-500">{sortedFiltered.length}개</div>
          {/* 선택된 필터 뱃지 (오른쪽 컨테이너 내) */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((b) => (
                <span key={b.key + b.val} className="bg-[#333333] text-white rounded-full px-3 py-1 text-[14px] font-semibold flex items-center gap-1">
                  {b.val}
                  <button onClick={() => setSelected(sel => ({
                    ...sel,
                    [b.key]: sel[b.key as keyof typeof sel].filter((v: string) => v !== b.val)
                  }))} className="ml-1">×</button>
                </span>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setSelected({
                admin_district: [], moq: [], monthly_capacity: [], business_type: [], distribution: [], delivery: [], items: [], equipment: [], sewing_machines: [], pattern_machines: [], special_machines: [], factory_type: [], main_fabrics: [], processes: []
              })}>전체 해제</Button>
            </div>
          )}
          {/* 카드 리스트/지도 뷰 */}
          <div className="flex-1 min-w-0">
            {view === 'list' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loading ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="text-base sm:text-lg">공장 정보를 불러오는 중입니다...</div>
                  </div>
                ) : factoriesData.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 text-gray-400">공장 데이터가 없습니다.</div>
                ) : (
                  sortedFiltered.map((f: Factory, idx: number) => {
                    const displayName = typeof f.name === 'string' && f.name
                      ? f.name
                      : typeof f.company_name === 'string' && f.company_name
                        ? f.company_name
                        : '이름 없음';
                    const mainItems = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt]
                      .filter((v) => typeof v === 'string' && v.length > 0)
                      .join(', ') || '-';
                    const mainFabrics: string = typeof f.main_fabrics === 'string' && f.main_fabrics.length > 0 ? f.main_fabrics : '-';
                    const randomFabrics = cardFabricsById[f.id ?? idx] || [];
                    return (
                      <Link href={`/factories/${f.id}`} key={f.id ?? idx} className="rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                        {/* 이미지 영역 */}
                        <div className="w-full h-40 sm:h-48 md:h-56 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
                          <Image
                            src={f.images && f.images.length > 0 ? f.images[0] : (f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length])}
                            alt={typeof f.company_name === 'string' ? f.company_name : '공장 이미지'}
                            className="object-cover w-full h-full rounded-t-xl"
                            width={400}
                            height={224}
                            priority={idx < 6}
                            unoptimized
                          />
                        </div>
                        {/* 이미지와 텍스트 사이 gap 줄임 */}
                        <div className="mt-2" />
                        {/* 정보 영역 */}
                        <div className="flex-1 flex flex-col p-3 sm:p-4">
                          {/* 주요 원단 칩 */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                            {randomFabrics.map((chip) => (
                              <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold">
                                {chip.label}
                              </span>
                            ))}
                          </div>
                          <div className="font-bold text-sm sm:text-base mb-1">{displayName}</div>
                          {/* 주요 품목 */}
                          <div className="text-xs sm:text-sm font-bold mt-2 mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                            <span className="shrink-0">주요품목</span>
                            <span className="font-normal ml-2 flex-1 truncate">{mainItems}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                            <span className="shrink-0">주요원단</span>
                            <span className="font-normal ml-2 flex-1 truncate">{mainFabrics}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold" style={{ color: '#333333', opacity: 0.6 }}>
                            MOQ(최소 주문 수량) <span className="font-normal">{typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? f.moq : (typeof f.minOrder === 'number' ? f.minOrder : '-'))}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] bg-gray-100 rounded-xl">
                {/* 카카오지도 뷰 */}
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">지도를 불러오는 중...</div>
                  </div>
                ) : (
                                    <div className="relative w-full h-full">
                    <KakaoMap
                      center={getDongdaemunCenter()}
                      level={4}
                      selectedMarkerId={selectedFactory?.id?.toString()}
                      markers={filtered.map((factory) => {
                        // 공장명으로 정확한 위치 찾기
                        const companyName = factory.company_name || factory.name || '';
                        const factoryLocation = getFactoryLocationByName(companyName);
                        
                        let position;
                        if (factoryLocation) {
                          // 정확한 위치 정보가 있으면 사용
                          position = factoryLocation;
                          console.log(`📍 ${companyName}: 정확한 위치 사용 (${position.lat}, ${position.lng})`);
                        } else {
                          // 없으면 기본 동대문구 중심
                          position = getDongdaemunCenter();
                          console.log(`📍 ${companyName}: 기본 위치 사용 (${position.lat}, ${position.lng})`);
                        }
                        
                        return {
                          id: factory.id?.toString() || '0',
                          position: position,
                          title: factory.company_name || factory.name || '공장',
                          factory: factory,
                          onClick: () => {
                            if (factory.id) {
                              window.location.href = `/factories/${factory.id}`;
                            }
                          }
                        };
                      })}
                      onMarkerSelect={(factory) => {
                        // 새로운 공장을 선택하면 이전 선택을 해제하고 새로운 공장을 선택
                        setSelectedFactory(factory);
                        setShowPopup(true);
                      }}
                      className="w-full h-full rounded-xl"
                    />
                    
                    {/* 팝업 정보창 */}
                    {showPopup && selectedFactory && (
                      <FactoryInfoPopup
                        factory={selectedFactory}
                        onClose={() => {
                          setShowPopup(false);
                          setSelectedFactory(null);
                        }}
                        onDetailClick={() => {
                          if (selectedFactory.id) {
                            window.location.href = `/factories/${selectedFactory.id}`;
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// 주니어 개발자 설명:
// - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
// - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
// - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
// - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다. 