"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { List, Map as MapIcon, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { fetchFactoriesFromDB, isSelectableRegion, type Factory } from "@/lib/factoryCatalog";
import { FACTORY_TYPES, MAIN_FABRICS } from "@/lib/types";
// import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import NaverMap from "@/components/NaverMap";
import FactoryInfoPopup from "@/components/FactoryInfoPopup";
import { useRouter } from "next/navigation";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { useFactoryImages, hasFactoryImages } from "@/lib/hooks/useFactoryImages";

function getFilterChipClass(isOn: boolean, sm = false) {
  const base = sm
    ? "rounded-full border px-2 sm:px-4 text-xs sm:text-sm"
    : "rounded-full border px-4";
  return isOn
    ? `${base} bg-[#222222] text-white border-[#222222] hover:bg-[#444444] hover:text-white`
    : `${base} border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50`;
}

const EMPTY_FILTERS = {
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
};

// 공장 목록 페이지용 이미지 컴포넌트
function FactoriesPageImage({ factory, idx }: { factory: Factory; idx: number }) {
  const { images, loading } = useFactoryImages(factory);
  
  if (loading) {
    return (
      <div className="text-gray-400 text-xs sm:text-sm font-medium">
        이미지 로딩 중...
      </div>
    );
  }
  
  if (images.length > 0 && images[0] !== '/logo_donggori.png') {
    return (
      <Image
        src={images[0]}
        alt={typeof factory.company_name === 'string' ? factory.company_name : '공장 이미지'}
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
        width={400}
        height={224}
        priority={idx < 6}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={80}
      />
    );
  }
  
  return (
    <div className="text-gray-400 text-xs sm:text-sm font-medium">
      이미지 준비 중
    </div>
  );
}

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
    if (key === 'admin_district') {
      const values = factoriesData.flatMap(f => (typeof f.admin_district === 'string' ? [f.admin_district.trim()] : []));
      return Array.from(new Set(values.filter(isSelectableRegion)));
    }
    const values = factoriesData.map(f => f[key]);
    // 항상 배열 반환 보장
    if (Array.isArray(values)) {
      return Array.from(new Set(values.flatMap((v) => typeof v === 'string' ? [v] : [])));
    }
    return [];
  }

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
  // (하드코딩 목록 대신 실제 이미지 보유 여부로 정렬)
  const sortedFiltered = useMemo(() => {
    // 필터가 걸려있지 않은 경우에만 정렬 적용
    const hasActiveFilters = Object.values(selected).some(arr => arr.length > 0) || search;

    if (!hasActiveFilters) {
      return [...filtered].sort((a, b) => {
        const aName = a.name || a.company_name || "";
        const bName = b.name || b.company_name || "";
        const aHasImage = hasFactoryImages(a);
        const bHasImage = hasFactoryImages(b);

        // 1) 이미지 보유 업장 우선
        if (aHasImage !== bHasImage) return aHasImage ? -1 : 1;

        // 2) 같은 그룹이면 최신 ID 우선 (신규 업장 상단 노출)
        const aId = Number(a.id);
        const bId = Number(b.id);
        if (!Number.isNaN(aId) && !Number.isNaN(bId) && aId !== bId) {
          return bId - aId;
        }

        // 3) 보조 정렬: 이름순
        return String(aName).localeCompare(String(bName), "ko");
      });
    }
    
    return filtered;
  }, [filtered, selected, search]);

  const mapFactories = useMemo(
    () =>
      sortedFiltered.filter(
        (factory) =>
          Number.isFinite(factory.lat) &&
          Number.isFinite(factory.lng) &&
          factory.lat >= -90 &&
          factory.lat <= 90 &&
          factory.lng >= -180 &&
          factory.lng <= 180 &&
          (factory.lat !== 0 || factory.lng !== 0)
      ),
    [sortedFiltered]
  );

  // 필터 뱃지
  const badges = Object.entries(selected).flatMap(([key, arr]) =>
    arr.map(val => ({ key, val }))
  );

  // 아코디언 열림/닫힘 상태 관리
  const [openFilter, setOpenFilter] = useState<{ [key: string]: boolean }>({
    factory_type: true,
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
        const dbFactories = await fetchFactoriesFromDB();
        setFactoriesData(dbFactories);
        setConnectionStatus({ success: true, count: dbFactories.length });
      } catch (error) {
        setFactoriesData([]);
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
      '신설동': [],
      '용두동': [],
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
        const sortedRegions = [...regions];
        
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
      factoriesData.map((f, idx) => {
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
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className={`${PAGE_CONTAINER_CLASS} py-8 md:py-10 space-y-6`}>
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#222222] rounded-full animate-spin" />
          <p className="text-sm text-gray-600">공장 정보를 불러오는 중입니다...</p>
        </div>
      )}
      
      {connectionStatus && !connectionStatus.success && (
        <div className="p-4 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200">
          <div className="font-semibold">Supabase 연결 실패</div>
          {connectionStatus.error && <div className="mt-1">오류: {connectionStatus.error}</div>}
          <div className="mt-3 p-3 bg-white border border-red-100 rounded-lg text-xs text-gray-600">
            <div className="font-medium text-gray-800 mb-1">Supabase 설정이 필요합니다</div>
            <div>프로젝트 루트에 <code className="bg-gray-100 px-1 rounded">.env.local</code> 파일을 생성하고 URL·Anon Key를 설정한 뒤 개발 서버를 재시작하세요.</div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">봉제공장 찾기</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          동대문 봉제공장을 검색·필터링하고, 조건에 맞는 업장을 바로 확인하세요.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#222222] shrink-0" aria-hidden />
              AI로 공장 추천받기
            </p>
            <p className="text-xs text-gray-500 mt-1">몇 가지 조건만 알려주시면 맞춤 공장 3곳을 추천해드려요</p>
          </div>
          <Link
            href="/matching"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition shrink-0"
          >
            맞춤 추천 시작
          </Link>
        </div>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-lg font-semibold shadow-sm text-sm hover:border-gray-400 transition"
          onClick={() => setShowMobileFilter(true)}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#222222]" />
          필터
          {badges.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs min-w-5 h-5 px-1">
              {badges.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-row gap-6 lg:gap-8 items-start w-full">
        <aside className="w-72 shrink-0 hidden lg:block sticky top-24">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
            <div className="font-bold flex items-center justify-between text-base pb-2">
              <span className="text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#222222]" />
                필터
              </span>
              <button
                type="button"
                onClick={() => setSelected({ ...EMPTY_FILTERS })}
                className="text-gray-400 hover:text-black transition flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
                title="필터 초기화"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
            <hr className="border-gray-200" />
            {/* 공장 타입 */}
            <div>
              <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, factory_type: !f.factory_type }))}>
                <span className="font-bold text-[16px] flex items-center gap-3">
                  공장 타입
                  {selected.factory_type.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.factory_type.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.factory_type ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.factory_type && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {FACTORY_TYPES.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant="outline"
                      className={getFilterChipClass(selected.factory_type?.includes?.(opt) )}
                      onClick={() => setSelected(sel => ({
                        ...sel,
                        factory_type: sel.factory_type?.includes?.(opt)
                          ? sel.factory_type.filter((v: string) => v !== opt)
                          : [...(sel.factory_type || []), opt]
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.main_fabrics.length}</span>
                  )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.main_fabrics && (
                <div className="flex flex-wrap gap-2 pb-2 mt-3">
                  {MAIN_FABRICS.map((opt: string) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant="outline"
                      className={getFilterChipClass(selected.main_fabrics.includes(opt) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.admin_district.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.admin_district.includes(opt) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.moq.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.moq.includes(opt.label) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.sewing_machines.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.sewing_machines.includes(opt) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.pattern_machines.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.pattern_machines.includes(opt) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.special_machines.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.special_machines.includes(opt) )}
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
                    <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-5 h-5">{selected.items.length}</span>
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
                      variant="outline"
                      className={getFilterChipClass(selected.items.includes(opt) )}
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowMobileFilter(false)}
              aria-hidden
            />
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[90vw] max-w-md max-h-[85vh] flex flex-col border border-gray-200 shadow-xl">
              <div className="p-4 sm:p-6 pb-3 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#222222]" />
                  필터
                </span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 text-2xl flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowMobileFilter(false)}
                  aria-label="필터 닫기"
                >
                  ×
                </button>
              </div>
              
              {/* 스크롤 가능한 필터 내용 */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3 sm:pt-4">
              {/* 이하 필터 항목들(공정, 지역, MOQ 등) - aside 내부와 동일하게 복사 */}
              {/* 공장 타입 */}
              <div>
                <button className="w-full flex items-center justify-between py-2" onClick={() => setOpenFilter(f => ({ ...f, factory_type: !f.factory_type }))}>
                  <span className="font-bold text-sm sm:text-[16px] flex items-center gap-2 sm:gap-3">
                    공장 타입
                    {selected.factory_type.length > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.factory_type.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.factory_type ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.factory_type && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {FACTORY_TYPES.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant="outline"
                        className={getFilterChipClass(selected.factory_type?.includes?.(opt) , true)}
                        onClick={() => setSelected(sel => ({
                          ...sel,
                          factory_type: sel.factory_type?.includes?.(opt)
                            ? sel.factory_type.filter((v: string) => v !== opt)
                            : [...(sel.factory_type || []), opt]
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.main_fabrics.length}</span>
                    )}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
                </button>
                {openFilter.main_fabrics && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 pb-2 mt-2 sm:mt-3">
                    {MAIN_FABRICS.map((opt: string) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant="outline"
                        className={getFilterChipClass(selected.main_fabrics.includes(opt) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.admin_district.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.admin_district.includes(opt) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.moq.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.moq.includes(opt.label) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.sewing_machines.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.sewing_machines.includes(opt) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.pattern_machines.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.pattern_machines.includes(opt) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.special_machines.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.special_machines.includes(opt) , true)}
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
                      <span className="inline-flex items-center justify-center rounded-full bg-[#222222] text-white text-xs w-4 h-4 sm:w-5 sm:h-5">{selected.items.length}</span>
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
                        variant="outline"
                        className={getFilterChipClass(selected.items.includes(opt) , true)}
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
        {/* 오른쪽: 검색+카드/지도 */}
        <div className="flex-1 min-w-0 flex flex-col items-stretch">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="공장명, 키워드로 검색하세요"
                className="w-full h-10 md:h-11 rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#222222]"
              />
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto shrink-0">
              <button
                type="button"
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition flex items-center justify-center gap-1.5 text-sm ${
                  view === "list"
                    ? "bg-white text-[#222222] font-semibold shadow-sm"
                    : "bg-transparent text-gray-600 font-normal hover:text-gray-800"
                }`}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" /> 목록
              </button>
              <button
                type="button"
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition flex items-center justify-center gap-1.5 text-sm ${
                  view === "map"
                    ? "bg-white text-[#222222] font-semibold shadow-sm"
                    : "bg-transparent text-gray-600 font-normal hover:text-gray-800"
                }`}
                onClick={() => setView("map")}
              >
                <MapIcon className="w-4 h-4" /> 지도
              </button>
            </div>
          </div>
          <div className="mb-3 text-xs sm:text-sm font-semibold text-[#222222]">
            {sortedFiltered.length}개 업장
          </div>
          {/* 선택된 필터 뱃지 (오른쪽 컨테이너 내) */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {badges.map((b) => (
                <span key={b.key + b.val} className="bg-[#222222] text-white rounded-full px-2 sm:px-3 py-1 text-xs sm:text-[14px] font-semibold flex items-center gap-1">
                  {b.val}
                  <button onClick={() => setSelected(sel => ({
                    ...sel,
                    [b.key]: sel[b.key as keyof typeof sel].filter((v: string) => v !== b.val)
                  }))} className="ml-1">×</button>
                </span>
              ))}
              <Button size="sm" variant="ghost" className="text-[#222222] hover:text-[#222222] hover:bg-gray-100" onClick={() => setSelected({ ...EMPTY_FILTERS })}>전체 해제</Button>
            </div>
          )}
          {/* 카드 리스트/지도 뷰 */}
          <div className="flex-1 min-w-0">
            {view === 'list' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#222222] rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">공장 정보를 불러오는 중입니다...</p>
                  </div>
                ) : factoriesData.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-gray-400">공장 데이터가 없습니다.</div>
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
                      <Link
                        href={`/factories/${f.id}`}
                        key={f.id ?? idx}
                        className="rounded-xl bg-white overflow-hidden flex flex-col cursor-pointer border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden group">
                          <FactoriesPageImage factory={f} idx={idx} />
                        </div>
                        <div className="flex-1 flex flex-col px-3 sm:px-4 py-4">
                          {/* 공장 타입 및 주요 원단 칩 */}
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-2">
                            {randomFabrics.map((chip) => (
                              <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs font-semibold">
                                {chip.label}
                              </span>
                            ))}
                          </div>
                          <div className="font-bold text-sm md:text-base mb-1 text-gray-900">{displayName}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-start gap-2">
                            <span className="shrink-0 font-semibold text-gray-600">주요품목</span>
                            <span className="flex-1 truncate">{mainItems}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-start gap-2">
                            <span className="shrink-0 font-semibold text-gray-600">주요원단</span>
                            <span className="flex-1 truncate">{mainFabrics}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            <span className="font-semibold text-gray-600">MOQ </span>
                            <span>{typeof f.moq === "number" ? f.moq : typeof f.moq === "string" && !isNaN(Number(f.moq)) ? f.moq : typeof f.minOrder === "number" ? f.minOrder : "-"}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
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
                ) : mapFactories.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
                    위치 정보가 등록된 공장이 없습니다.
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <NaverMap
                      center={{ lat: mapFactories[0].lat, lng: mapFactories[0].lng }}
                      level={14}
                      markers={mapFactories.map((factory) => ({
                        id: factory.id,
                        position: { lat: factory.lat, lng: factory.lng },
                        title: factory.name || factory.company_name || '공장명 없음',
                        factory: factory,
                        onClick: () => {
                          setSelectedFactory(factory);
                          setShowPopup(true);
                        }
                      }))}
                      onLoadError={handleMapLoadError}
                      className="w-full h-full rounded-lg sm:rounded-xl"
                      isPopupOpen={showPopup}
                    />
                    
                    {/* 팝업 */}
                    {showPopup && selectedFactory && (
                      <FactoryInfoPopup
                        factory={selectedFactory as any}
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
      </div>
    </div>
  );
}
// 주니어 개발자 설명:
// - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
// - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
// - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
// - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다.
