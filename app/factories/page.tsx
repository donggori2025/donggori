"use client";

import { factories } from "@/lib/factories";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FactoryMap from "@/components/FactoryMap";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { List, Map as MapIcon } from "lucide-react";

const processOptions = ["봉제", "다이마루", "직기", "샘플", "나염", "자수", "QC"];
const itemOptions = ["티셔츠", "셔츠", "원피스", "바지", "점퍼", "코트", "자켓"];
const regionOptions = ["서울", "부산", "대구"];

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
  const [search, setSearch] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "map">("list");
  const perPage = 9;
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(factories[0]?.id || "");

  // 아코디언 열림/닫힘 상태 관리
  const [openFilter, setOpenFilter] = useState<{ [key: string]: boolean }>({
    process: true,
    region: true,
    item: true,
    moq: false,
    equipment: false,
  });

  // 샘플 필터링(실제 필터링 로직은 추후 확장)
  let filtered = factories.filter(f => {
    return (
      (!search || f.name.includes(search) || f.description.includes(search)) &&
      (selectedRegion.length === 0 || selectedRegion.includes(f.region)) &&
      (selectedItem.length === 0 || f.items.some(i => selectedItem.includes(i)))
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  filtered = filtered.slice((page - 1) * perPage, page * perPage);

  // 뱃지(선택된 필터)
  const badges = [
    ...selectedProcess.map(p => ({ value: p, type: "process" })),
    ...selectedRegion.map(r => ({ value: r, type: "region" })),
    ...selectedItem.map(i => ({ value: i, type: "item" })),
  ];

  // 지도 뷰에서 선택된 공장 정보
  const selectedFactory = filtered.find(f => f.id === selectedFactoryId) || filtered[0];

  return (
    <div className="max-w-[1200px] mx-auto py-16 flex flex-col gap-8">
      {/* 상단 대제목/소제목 */}
      <div>
        <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">봉제공장 찾기</h1>
        <p className="text-lg text-gray-500">퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요.</p>
      </div>
      {/* 좌측 필터 + 우측 컨텐츠 가로 정렬 */}
      <div className="flex gap-8">
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl mb-6 py-2">
            <div className="font-bold mb-4 flex items-center justify-between">
              <span>필터</span>
              <button
                onClick={() => { setSelectedProcess([]); setSelectedRegion([]); setSelectedItem([]); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition"
                title="필터 초기화"
              >
                {typeof ArrowPathIcon !== 'undefined' ? (
                  <ArrowPathIcon className="w-4 h-4" />
                ) : (
                  <span className="text-lg">↻</span>
                )}
                <span className="sr-only">초기화</span>
              </button>
            </div>
            <hr className="my-3 border-gray-200" />
            {/* 공정 아코디언 */}
            <div className="mb-6">
              <button className="w-full flex justify-between items-center font-bold text-[16px] mb-2" onClick={() => setOpenFilter(f => ({ ...f, process: !f.process }))}>
                <span className="flex items-center">
                  공정{selectedProcess.length > 0 && (
                    <span className="ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full">{selectedProcess.length}</span>
                  )}
                </span>
                <span style={{ display: "inline-block", transform: openFilter.process ? "none" : "rotate(180deg)" }}>⌃</span>
              </button>
              {openFilter.process && (
                <div className="flex flex-wrap gap-2">
                  {processOptions.map(opt => (
                    <Button key={opt} size="sm" variant={selectedProcess.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                      onClick={() => setSelectedProcess(selectedProcess.includes(opt) ? selectedProcess.filter(p => p !== opt) : [...selectedProcess, opt])}>{opt}</Button>
                  ))}
                </div>
              )}
            </div>
            {/* 지역 아코디언 */}
            <div className="mb-6">
              <button className="w-full flex justify-between items-center font-bold text-[16px] mb-2" onClick={() => setOpenFilter(f => ({ ...f, region: !f.region }))}>
                <span className="flex items-center">
                  지역{selectedRegion.length > 0 && (
                    <span className="ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full">{selectedRegion.length}</span>
                  )}
                </span>
                <span style={{ display: "inline-block", transform: openFilter.region ? "none" : "rotate(180deg)" }}>⌃</span>
              </button>
              {openFilter.region && (
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map(opt => (
                    <Button key={opt} size="sm" variant={selectedRegion.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                      onClick={() => setSelectedRegion(selectedRegion.includes(opt) ? selectedRegion.filter(r => r !== opt) : [...selectedRegion, opt])}>{opt}</Button>
                  ))}
                </div>
              )}
            </div>
            {/* 주요 품목 아코디언 */}
            <div className="mb-6">
              <button className="w-full flex justify-between items-center font-bold text-[16px] mb-2" onClick={() => setOpenFilter(f => ({ ...f, item: !f.item }))}>
                <span className="flex items-center">
                  주요 품목{selectedItem.length > 0 && (
                    <span className="ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full">{selectedItem.length}</span>
                  )}
                </span>
                <span style={{ display: "inline-block", transform: openFilter.item ? "none" : "rotate(180deg)" }}>⌃</span>
              </button>
              {openFilter.item && (
                <div className="flex flex-wrap gap-2">
                  {itemOptions.map(opt => (
                    <Button key={opt} size="sm" variant={selectedItem.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                      onClick={() => setSelectedItem(selectedItem.includes(opt) ? selectedItem.filter(i => i !== opt) : [...selectedItem, opt])}>{opt}</Button>
                  ))}
                </div>
              )}
            </div>
            {/* MOQ 아코디언 */}
            <div className="mb-6">
              <button className="w-full flex justify-between items-center font-bold text-[16px] mb-2" onClick={() => setOpenFilter(f => ({ ...f, moq: !f.moq }))}>
                <span>MOQ(최소수량)</span>
                <span style={{ display: "inline-block", transform: openFilter.moq ? "none" : "rotate(180deg)" }}>⌃</span>
              </button>
              {openFilter.moq && (
                <input type="number" className="border rounded px-3 py-2 w-full" placeholder="예: 100" disabled />
              )}
            </div>
            {/* 주요 설비 아코디언 */}
            <div className="mb-6">
              <button className="w-full flex justify-between items-center font-bold text-[16px] mb-2" onClick={() => setOpenFilter(f => ({ ...f, equipment: !f.equipment }))}>
                <span>주요 설비</span>
                <span style={{ display: "inline-block", transform: openFilter.equipment ? "none" : "rotate(180deg)" }}>⌃</span>
              </button>
              {openFilter.equipment && (
                <input type="text" className="border rounded px-3 py-2 w-full" placeholder="예: 오버록" disabled />
              )}
            </div>
          </div>
        </aside>
        <section className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="공장명, 키워드로 검색하세요."
              className="flex-1 min-w-0 border rounded-[0.625rem] px-4 py-2 focus:border-black focus:outline-none"
            />
            <div className="flex bg-gray-100 rounded-lg p-1 mt-2 md:mt-0">
              <button
                className={`px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'list' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('list')}
              >
                <List size={28} strokeWidth={view === 'list' ? 2.5 : 2} className={`${view === 'list' ? 'text-[#222]' : 'text-[#bbb]'} scale-80`} />
                목록
              </button>
              <button
                className={`px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'map' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`}
                onClick={() => setView('map')}
              >
                <MapIcon size={28} strokeWidth={view === 'map' ? 2.5 : 2} className={`${view === 'map' ? 'text-[#222]' : 'text-[#bbb]'} scale-80`} />
                지도
              </button>
            </div>
          </div>
          {/* 선택된 필터 뱃지 */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((b, i) => (
                <span key={i} className="bg-black text-white rounded-full px-3 py-1 text-[14px] font-semibold flex items-center gap-1">
                  {b.value}
                  <button onClick={() => {
                    if (b.type === "process") setSelectedProcess(selectedProcess.filter(p => p !== b.value));
                    if (b.type === "region") setSelectedRegion(selectedRegion.filter(r => r !== b.value));
                    if (b.type === "item") setSelectedItem(selectedItem.filter(i => i !== b.value));
                  }} className="ml-1">×</button>
                </span>
              ))}
              <Button size="sm" variant="ghost" onClick={() => { setSelectedProcess([]); setSelectedRegion([]); setSelectedItem([]); }}>전체 해제</Button>
            </div>
          )}
          {/* 뷰 전환 */}
          {view === "list" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.length === 0 && (
                  <div className="col-span-3 text-center text-gray-400">검색 결과가 없습니다.</div>
                )}
                {filtered.map(factory => (
                  <Link key={factory.id} href={`/factories/${factory.id}`} className="group">
                    <Card className="rounded-xl shadow-sm border bg-white hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                      <CardContent className="flex-1 flex flex-col p-4">
                        <Image src={factory.image} alt={factory.name} width={400} height={128} className="rounded-xl mb-3 h-32 w-full object-cover" />
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {/* 공정, 나염, 자수 등 태그별 색상 적용 */}
                          {factory.processes?.map((tag: string) => (
                            <span key={tag} className={`rounded px-2 py-1 text-xs font-bold ${getTagColor(tag)}`}>{tag}</span>
                          ))}
                          {/* 주요 품목 태그(최대 2개, 회색) */}
                          {factory.items.slice(0, 2).map(i => <span key={i} className="bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs">{i}</span>)}
                        </div>
                        <div className="font-bold text-base mb-1 group-hover:text-toss-blue transition-colors">{factory.name}</div>
                        <div className="text-xs text-gray-500 mb-1 line-clamp-2">{factory.description}</div>
                        <div className="text-xs text-gray-500 mb-1">MOQ(최소수량): {factory.minOrder}</div>
                        <div className="text-xs text-gray-400">주요 품목: {factory.items.join(", ")}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {/* 페이지네이션 */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} size="icon" variant={page === i + 1 ? "default" : "outline"} className="rounded-full w-8 h-8 p-0"
                    onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow p-4">
              {/* 구글 맵 연동 */}
              <div className="w-full h-[420px] rounded-xl overflow-hidden mb-4">
                <FactoryMap
                  factories={filtered}
                  selectedFactoryId={selectedFactoryId}
                  onSelectFactory={setSelectedFactoryId}
                />
              </div>
              {/* 지도 아래에 선택된 공장 정보 카드 */}
              {selectedFactory && (
                <div className="flex gap-4 items-center">
                  <Image src={selectedFactory.image} alt={selectedFactory.name} width={128} height={96} className="w-32 h-24 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1 flex-wrap">
                      {selectedFactory.processes?.map((tag: string) => (
                        <span key={tag} className={`rounded px-2 py-1 text-xs font-bold ${getTagColor(tag)}`}>{tag}</span>
                      ))}
                      {selectedFactory.items.slice(0, 2).map(i => <span key={i} className="bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs">{i}</span>)}
                    </div>
                    <div className="font-bold text-base mb-1">{selectedFactory.name}</div>
                    <div className="text-xs text-gray-500 mb-1 line-clamp-2">{selectedFactory.description}</div>
                    <div className="text-xs text-gray-500 mb-1">MOQ(최소수량): {selectedFactory.minOrder}</div>
                    <div className="text-xs text-gray-400">주요 품목: {selectedFactory.items.join(", ")}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
// 주니어 개발자 설명:
// - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
// - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
// - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
// - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다. 