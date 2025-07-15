"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { List, Map as MapIcon } from "lucide-react";
import type { Factory } from "@/lib/factories";

// 태그별 색상 매핑 함수
function getTagColor(tag: string) {
  switch (tag) {
    case "봉제": return "bg-blue-100 text-blue-700";
    case "나염": return "bg-orange-100 text-orange-700";
    case "자수": return "bg-green-100 text-green-700";
    case "샘플": return "bg-purple-100 text-purple-700";
    case "QC": return "bg-pink-100 text-pink-700";
    case "다이마루": return "bg-yellow-100 text-yellow-700";
    case "직기": return "bg-cyan-100 text-cyan-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function FactoriesPage() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

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
      const values = factories.flatMap(f => (f[key] ? String(f[key]).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'equipment') {
      // |로 카테고리 분리, :로 카테고리명/값 분리, 쉼표로 하위 항목 분리
      const all = factories.flatMap(f => (f.equipment ? String(f.equipment).split('|').map((v: string) => v.trim()) : []));
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
      const values = factories.flatMap(f => (f[key] ? String(f[key]).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'items') {
      const arr = factories.flatMap(f => [
        f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet
      ].filter((v): v is string => typeof v === 'string' && Boolean(v)));
      const commaSplit = arr.flatMap(i => String(i).split(',').map((v: string) => v.trim()));
      return Array.from(new Set(commaSplit.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    if (key === 'processes') {
      const values = factories.flatMap(f => (f.processes ? String(f.processes).split(',').map((v: string) => v.trim()) : []));
      return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && Boolean(v))));
    }
    const values = factories.map(f => f[key]);
    // 항상 배열 반환 보장
    if (Array.isArray(values)) {
      return Array.from(new Set(values.flatMap((v) => typeof v === 'string' ? [v] : [])));
    }
    return [];
  }

  // 필터링 로직 (여러 값 중 하나라도 포함되면 통과, range/검색 포함)
  const filtered = factories.filter(f => {
    const itemList = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet];
    // 검색어 필터
    const searchMatch = !search ||
      (typeof f.company_name === 'string' && f.company_name.includes(search)) ||
      (typeof f.intro === 'string' && f.intro.includes(search)) ||
      itemList.some(i => typeof i === 'string' && i && i.includes(search));
    // MOQ/월생산량 range 필터
    const moqMatch = selected.moq.length === 0 || selected.moq.some(rangeLabel => {
      const range = moqRanges.find(r => r.label === rangeLabel);
      return range && typeof f.moq === 'number' && f.moq >= range.min && f.moq <= range.max;
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
      (selected.sewing_machines.length === 0 || (typeof f.sewing_machines === 'string' && selected.sewing_machines.includes(f.sewing_machines))) &&
      (selected.pattern_machines.length === 0 || (typeof f.pattern_machines === 'string' && selected.pattern_machines.includes(f.pattern_machines))) &&
      (selected.special_machines.length === 0 || (typeof f.special_machines === 'string' && selected.special_machines.includes(f.special_machines))) &&
      (selected.factory_type.length === 0 || (typeof f.factory_type === 'string' && selected.factory_type.includes(f.factory_type))) &&
      (selected.main_fabrics.length === 0 || (typeof f.main_fabrics === 'string' && selected.main_fabrics.includes(f.main_fabrics))) &&
      (selected.processes.length === 0 || (typeof f.processes === 'string' && selected.processes.includes(f.processes)))
    );
  });

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
    async function fetchFactories() {
      setLoading(true);
      const { data, error } = await supabase.from("donggori").select("*");
      console.log("공장 데이터:", data, error);
      setFactories(data ?? []);
      setLoading(false);
    }
    fetchFactories();
  }, []);

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

  return (
    <div className="max-w-[1200px] mx-auto py-16 flex flex-col gap-8">
      {loading && <div className="text-center py-10 text-lg">공장 정보를 불러오는 중입니다...</div>}
      <div className="flex flex-col gap-1">
        <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">봉제공장 찾기</h1>
        <p className="text-lg text-gray-500 mb-8">퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요.</p>
      </div>
      <div className="flex flex-row gap-8 items-start w-full">
        {/* 필터 패널 (좌측) */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl mb-6 py-2 px-4 shadow flex flex-col gap-2">
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
                <span className="font-bold text-[16px]">공정</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.process && (
                <div className="flex flex-wrap gap-2 pb-2">
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
                <span className="font-bold text-[16px]">지역</span>
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
                <span className="font-bold text-[16px]">MOQ(최소수량)</span>
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
                <span className="font-bold text-[16px]">재봉기</span>
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
                <span className="font-bold text-[16px]">패턴기</span>
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
                <span className="font-bold text-[16px]">특수기</span>
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
                <span className="font-bold text-[16px]">품목</span>
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
                <span className="font-bold text-[16px]">주요 품목</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`} />
              </button>
              {openFilter.main_fabrics && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {/* 데이터가 없으므로 버튼 없음 */}
                </div>
              )}
            </div>
          </div>
        </aside>
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
          {/* 선택된 필터 뱃지 (오른쪽 컨테이너 내) */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((b) => (
                <span key={b.key + b.val} className="bg-black text-white rounded-full px-3 py-1 text-[14px] font-semibold flex items-center gap-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.isArray(filtered) && filtered.length > 0 ? (
                  filtered.map((f: Factory, idx: number) => {
                    const mainItems: string = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt]
                      .filter((v): v is string => typeof v === 'string' && v.length > 0)
                      .join(', ') || '-';
                    return (
                      <div key={f.id ?? idx} className="border rounded-xl p-0 bg-white shadow overflow-hidden flex flex-col">
                        {/* 이미지 영역 */}
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length]}
                            alt={f.company_name ?? '공장 이미지'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {/* 정보 영역 */}
                        <div className="p-4 flex-1 flex flex-col">
                          {/* 태그 영역 */}
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {Array.isArray(f.processes) && f.processes.filter(Boolean).map((tag) => (
                              <span key={String(tag ?? '')} className={`rounded px-2 py-1 text-xs font-bold ${getTagColor(String(tag ?? ''))}`}>{String(tag ?? '')}</span>
                            ))}
                          </div>
                          {/* 카드 리스트 내 */}
                          <div className="font-bold text-base mb-1">{f.name ?? '이름 없음'}</div>
                          <div className="text-xs text-gray-500 mb-1 line-clamp-2">{f.intro ?? '설명 없음'}</div>
                          <div className="text-xs text-gray-500 mb-1">지역: {f.admin_district ?? '-'}</div>
                          <div className="text-xs text-gray-500 mb-1">연락처: {f.phone_number ?? '-'}</div>
                          <div className="text-xs text-gray-500 mb-1">MOQ(최소 주문 수량): {typeof f.moq === 'number' ? String(f.moq) : '-'}</div>
                          <div className="text-xs text-gray-500 mb-1">월생산량: {typeof f.monthly_capacity === 'number' ? String(f.monthly_capacity) : '-'}</div>
                          {/* 카드 리스트 map 내부 */}
                          <div className="text-xs text-gray-500 mb-1">주요 품목: {mainItems}</div>
                          <div className="text-xs text-gray-400">위치: 위도 {typeof f.lat === 'number' ? String(f.lat) : '-'}, 경도 {typeof f.lng === 'number' ? String(f.lng) : '-'}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-gray-400 text-lg col-span-3">공장 데이터가 없습니다.</div>
                )}
              </div>
            ) : (
              <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">지도 뷰 준비중</span>
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