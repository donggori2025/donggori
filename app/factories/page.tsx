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
import NaverMap from "@/components/NaverMap";
import SimpleNaverMap from "@/components/SimpleNaverMap";
// import { getFactoryLocations } from "@/lib/factoryMap";
import FactoryInfoPopup from "@/components/FactoryInfoPopup";
import { getFactoryLocationByName, getDongdaemunCenter } from "@/lib/factoryLocationMapping";
import { useRouter } from "next/navigation";

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
  const [mapLoadError, setMapLoadError] = useState(false);

  // 지도 로딩 실패 시 목록 뷰로 전환
  const handleMapLoadError = () => {
    setMapLoadError(true);
    setView('list');
  };

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
        const aHasImages = a.images && a.images.length > 0 && a.images[0] !== '/logo_donggori.png' && !a.images[0].includes('logo_donggori');
        const bHasImages = b.images && b.images.length > 0 && b.images[0] !== '/logo_donggori.png' && !b.images[0].includes('logo_donggori');
        
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
    main_fabrics: true,
    region: true,
    items: false,
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
          console.error('Supabase 연결에 실패했습니다:', connectionTest.error);
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
        console.error('데이터 로딩 중 오류가 발생했습니다:', error);
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





  // 옵션 변수는 모두 const로 한 번만 선언 (함수와 변수명 겹치지 않게 *_Options로 명명)
  const processesOptions = Array.isArray(getOptions('processes')) ? getOptions('processes') : [];
  const regionOptions = Array.isArray(getOptions('admin_district')) ? getOptions('admin_district') : [];
  const sewingMachineOptions = Array.isArray(getOptions('sewing_machines')) ? getOptions('sewing_machines') : [];
  const patternMachineOptions = Array.isArray(getOptions('pattern_machines')) ? getOptions('pattern_machines') : [];
  const specialMachineOptions = Array.isArray(getOptions('special_machines')) ? getOptions('special_machines') : [];
  const itemOptionsAll = Array.isArray(getOptions('items')) ? getOptions('items') : [];
  const mainFabricsOptions = Array.isArray(getOptions('main_fabrics')) ? getOptions('main_fabrics') : [];

  // 지역 옵션을 동별로 그룹화하는 함수
  const getGroupedRegionOptions = () => {
    const allRegions = regionOptions;
    const districtGroups: { [key: string]: string[] } = {
      '장안동': [],
      '답십리동': [],
      '용신동': [],
      '제기동': [],
      '청량리동': [],
      '회기동': [],
      '전농동': [],
      '이문동': [],
      '기타': []
    };

    allRegions.forEach(region => {
      let assigned = false;
      for (const [district, _] of Object.entries(districtGroups)) {
        if (region.includes(district)) {
          districtGroups[district].push(region);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        districtGroups['기타'].push(region);
      }
    });

    // 각 동 내에서 세부 지역 순서 조정
    const sortedDistrictGroups = Object.entries(districtGroups)
      .filter(([_, regions]) => regions.length > 0)
      .map(([district, regions]) => {
        let sortedRegions = [...regions];
        
        // 장안동: 1동을 2동 앞으로
        if (district === '장안동') {
          sortedRegions.sort((a, b) => {
            const aIs1Dong = a.includes('1동');
            const bIs1Dong = b.includes('1동');
            if (aIs1Dong && !bIs1Dong) return -1;
            if (!aIs1Dong && bIs1Dong) return 1;
            return a.localeCompare(b);
          });
        }
        
        // 답십리동: 제1동을 제2동 앞으로
        if (district === '답십리동') {
          sortedRegions.sort((a, b) => {
            const aIs1Dong = a.includes('제1동');
            const bIs1Dong = b.includes('제1동');
            if (aIs1Dong && !bIs1Dong) return -1;
            if (!aIs1Dong && bIs1Dong) return 1;
            return a.localeCompare(b);
          });
        }
        
        return { district, regions: sortedRegions };
      });

    return sortedDistrictGroups;
  };

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
  const router = useRouter();

  // 첫 번째 공장 자동 선택 (지도 뷰일 때)
  useEffect(() => {
    if (view === 'map' && filtered.length > 0 && !selectedFactory) {
      const firstFactory = filtered[0];
      setSelectedFactory(firstFactory);
      setShowPopup(true);
    }
  }, [view, filtered, selectedFactory]);

  return (
    <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-12 lg:py-16 flex flex-col gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-6">
      {/* 로딩 표시 */}
      {loading && (
        <div className="text-center py-6 sm:py-8 md:py-10">
          <div className="text-sm sm:text-base md:text-lg">공장 정보를 불러오는 중입니다...</div>
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
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-extrabold text-gray-900 mb-1 sm:mb-2">봉제공장 찾기</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-4 sm:mb-6 md:mb-8">퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요.</p>
      </div>
      {/* 모바일 필터 버튼 */}
      <div className="lg:hidden flex mb-3 sm:mb-4">
        <button
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#333] text-white rounded-lg font-semibold shadow text-sm sm:text-base"
          onClick={() => setShowMobileFilter(true)}
        >
          <span>🔍</span> 필터
        </button>
      </div>
      <div className="flex flex-row gap-12 items-start w-full">
        {/* 필터 패널 (좌측) - 데스크탑 */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl mb-6 flex flex-col gap-2">
            <div className="font-bold mb-2 flex items-center justify-between text-lg pt-4 pb-2 h-8">
              <span className="text-gray-900">필터</span>
              <button
                onClick={() => setSelected({
                  admin_district: [], moq: [], monthly_capacity: [], business_type: [], distribution: [], delivery: [], items: [], equipment: [], sewing_machines: [], pattern_machines: [], special_machines: [], factory_type: [], main_fabrics: [], processes: []
                })}
                className="text-gray-500 hover:text-black text-lg font-bold flex items-center justify-center w-6 h-6"
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
            {/* 주요 원단 */}
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
                  {getGroupedRegionOptions().flatMap(({ regions }) => 
                    regions.map((opt: string) => (
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
                    ))
                  )}
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

          </div>
        </aside>
        {/* 모바일 필터 오버레이 */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl w-[95vw] sm:w-[90vw] max-w-md max-h-[85vh] sm:max-h-[80vh] flex flex-col relative border border-gray-200 shadow-lg">
              {/* 헤더 - 고정 */}
              <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-end h-10 sm:h-12">
                <button
                  className="text-gray-500 hover:text-black text-xl sm:text-2xl flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8"
                  onClick={() => setShowMobileFilter(false)}
                  aria-label="필터 닫기"
                >
                  ×
                </button>
              </div>
              
              {/* 스크롤 가능한 필터 내용 */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3 sm:pt-4">
              {/* 이하 필터 항목들(공정, 지역, MOQ 등) - aside 내부와 동일하게 복사 */}
              {/* 공정 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, process: !f.process }))}>
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-2 sm:gap-3">
                    공정
                    {selected.processes.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.processes.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.process && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {processesOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.processes?.includes?.(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
              {/* 주요 원단 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, main_fabrics: !f.main_fabrics }))}>
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-2 sm:gap-3">
                    주요 원단
                    {selected.main_fabrics.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.main_fabrics.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.main_fabrics && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {mainFabricsOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.main_fabrics.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
              {/* 지역 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, region: !f.region }))}>
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    지역
                    {selected.admin_district.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.admin_district.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.region ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.region && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {getGroupedRegionOptions().flatMap(({ regions }) => 
                      regions.map((opt: string) => (
                        <Button
                          key={opt}
                          size="sm"
                          variant={selected.admin_district.includes(opt) ? "default" : "outline"}
                          className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
                          onClick={() => setSelected(sel => ({
                            ...sel,
                            admin_district: sel.admin_district.includes(opt)
                              ? sel.admin_district.filter((v: string) => v !== opt)
                              : [...sel.admin_district, opt]
                          }))}
                        >
                          {opt}
                        </Button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {/* MOQ(최소수량) */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, moq: !f.moq }))}>
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    MOQ(최소수량)
                    {selected.moq.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.moq.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.moq ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.moq && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {moqRanges.map(opt => (
                      <Button
                        key={opt.label}
                        size="sm"
                        variant={selected.moq.includes(opt.label) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    재봉기
                    {selected.sewing_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.sewing_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.sewing_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.sewing_machines && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {sewingMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.sewing_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    패턴기
                    {selected.pattern_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.pattern_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.pattern_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.pattern_machines && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {patternMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.pattern_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    특수기
                    {selected.special_machines.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.special_machines.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.special_machines ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.special_machines && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {specialMachineOptions.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.special_machines.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-1 sm:gap-2">
                    품목
                    {selected.items.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.items.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.items ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.items && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {itemOptionsAll.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={selected.items.includes(opt) ? "default" : "outline"}
                        className="rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
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

                          </div>
            </div>
          </div>
        )}
        {/* 오른쪽: 검색+카드/지도 컨테이너 */}
        <div className="flex-1 min-w-0 flex flex-col items-stretch">
          {/* 검색 인풋 + 목록/지도 버튼 */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4 items-start sm:items-center self-start w-full">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="공장명, 키워드로 검색하세요."
              className="flex-1 w-full border rounded-[0.625rem] px-3 sm:px-4 py-2 focus:border-black focus:outline-none text-sm sm:text-base"
            />
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${view === 'list' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('list')}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" /> 목록
              </button>
              <button
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${view === 'map' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('map')}
              >
                <MapIcon className="w-3 h-3 sm:w-4 sm:h-4" /> 지도
              </button>
            </div>
          </div>
          {/* 공장 개수 표시 */}
          <div className="mb-2 text-xs sm:text-sm text-gray-500">{sortedFiltered.length}개</div>
          {/* 선택된 필터 뱃지 (오른쪽 컨테이너 내) */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {badges.map((b) => (
                <span key={b.key + b.val} className="bg-[#333333] text-white rounded-full px-2 sm:px-3 py-1 text-xs sm:text-[14px] font-semibold flex items-center gap-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {loading ? (
                  <div className="text-center py-6 sm:py-8 md:py-10">
                    <div className="text-sm sm:text-base md:text-lg">공장 정보를 불러오는 중입니다...</div>
                  </div>
                ) : factoriesData.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 text-gray-400">공장 데이터가 없습니다.</div>
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
                      <Link href={`/factories/${f.id}`} key={f.id ?? idx} className="rounded-lg sm:rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer">
                        {/* 이미지 영역 */}
                        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg sm:rounded-t-xl group">
                          {(f.images && f.images.length > 0 && f.images[0] && f.images[0] !== '/logo_donggori.png' && !f.images[0].includes('logo_donggori')) || 
                           (f.image && f.image !== '/logo_donggori.png' && !f.image.includes('동고') && !f.image.includes('unsplash')) ? (
                            <Image
                              src={f.images && f.images.length > 0 ? f.images[0] : f.image}
                              alt={typeof f.company_name === 'string' ? f.company_name : '공장 이미지'}
                              className="object-cover w-full h-full rounded-t-lg sm:rounded-t-xl group-hover:scale-110 transition-transform duration-300"
                              width={400}
                              height={224}
                              priority={idx < 6}
                              unoptimized
                            />
                          ) : (
                            <div className="text-gray-400 text-xs sm:text-sm font-medium">
                              이미지 준비 중
                            </div>
                          )}
                        </div>
                        {/* 이미지와 텍스트 사이 gap 줄임 */}
                        <div className="mt-1 sm:mt-2" />
                        {/* 정보 영역 */}
                        <div className="flex-1 flex flex-col pt-1 sm:pt-2 px-2 sm:px-3">
                          {/* 주요 원단 칩 */}
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-2">
                            {randomFabrics.map((chip) => (
                              <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs font-semibold">
                                {chip.label}
                              </span>
                            ))}
                          </div>
                          <div className="font-bold text-xs sm:text-sm md:text-base mb-1">{displayName}</div>
                          {/* 주요 품목 */}
                          <div className="text-xs sm:text-sm font-bold mt-1 sm:mt-2 mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                            <span className="shrink-0">주요품목</span>
                            <span className="font-normal ml-1 sm:ml-2 flex-1 truncate">{mainItems}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold mb-1 flex items-center" style={{ color: '#333333', opacity: 0.6 }}>
                            <span className="shrink-0">주요원단</span>
                            <span className="font-normal ml-1 sm:ml-2 flex-1 truncate">{mainFabrics}</span>
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
              <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] bg-gray-100 rounded-lg sm:rounded-xl">
                {/* 네이버지도 뷰 */}
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500 text-sm sm:text-base">지도를 불러오는 중...</div>
                  </div>
                ) : mapLoadError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500 p-4 sm:p-6">
                      <div className="mb-3 sm:mb-4">
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">지도를 불러올 수 없습니다</h3>
                      <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                        네이버맵 API 키가 설정되지 않았습니다.
                      </p>
                      <div className="text-xs text-gray-400">
                        <p>• .env.local 파일에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정해주세요</p>
                        <p>• 네이버 클라우드 플랫폼에서 Maps API Client ID를 발급받으세요</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <NaverMap
                      center={getDongdaemunCenter()}
                      level={14}
                      markers={sortedFiltered.map((factory) => ({
                        id: factory.id,
                        position: { lat: factory.lat, lng: factory.lng },
                        title: factory.name || factory.company_name || '공장명 없음',
                        factory: factory,
                        onClick: () => {
                          setSelectedFactory(factory);
                          setShowPopup(true);
                        }
                      }))}
                      onMarkerSelect={(factory) => {
                        setSelectedFactory(factory);
                        setShowPopup(true);
                      }}
                      onLoadError={handleMapLoadError}
                      className="w-full h-full rounded-lg sm:rounded-xl"
                      isPopupOpen={showPopup}
                    />
                    
                    {/* 팝업 */}
                    {showPopup && selectedFactory && (
                      <FactoryInfoPopup
                        factory={selectedFactory}
                        onDetailClick={() => {
                          if (selectedFactory) {
                            router.push(`/factories/${selectedFactory.id}`);
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