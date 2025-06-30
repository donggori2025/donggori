"use client";

import { factories } from "@/lib/factories";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FactoryMap from "@/components/FactoryMap";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const processOptions = ["봉제", "다이마루", "직기"];
const itemOptions = ["티셔츠", "셔츠", "원피스", "바지", "점퍼", "코트", "자켓"];
const regionOptions = ["서울", "부산", "대구"];

export default function FactoriesPage() {
  const [search, setSearch] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "map">("list");
  const perPage = 9;
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(factories[0]?.id || "");

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
    <div className="flex max-w-7xl mx-auto py-8 gap-8">
      {/* 좌측 필터 */}
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="font-bold mb-4 flex items-center justify-between">
            <span>필터</span>
            <button
              onClick={() => { setSelectedProcess([]); setSelectedRegion([]); setSelectedItem([]); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition"
              title="필터 초기화"
            >
              {/* Heroicons 아이콘 */}
              {typeof ArrowPathIcon !== 'undefined' ? (
                <ArrowPathIcon className="w-4 h-4" />
              ) : (
                <span className="text-lg">↻</span>
              )}
              <span className="sr-only">초기화</span>
            </button>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">
              공정{selectedProcess.length > 0 && (
                <span className="ml-1 text-black">({selectedProcess.length})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {processOptions.map(opt => (
                <Button key={opt} size="sm" variant={selectedProcess.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                  onClick={() => setSelectedProcess(selectedProcess.includes(opt) ? selectedProcess.filter(p => p !== opt) : [...selectedProcess, opt])}>{opt}</Button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">
              지역{selectedRegion.length > 0 && (
                <span className="ml-1 text-black">({selectedRegion.length})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map(opt => (
                <Button key={opt} size="sm" variant={selectedRegion.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                  onClick={() => setSelectedRegion(selectedRegion.includes(opt) ? selectedRegion.filter(r => r !== opt) : [...selectedRegion, opt])}>{opt}</Button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">
              주요 품목{selectedItem.length > 0 && (
                <span className="ml-1 text-black">({selectedItem.length})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {itemOptions.map(opt => (
                <Button key={opt} size="sm" variant={selectedItem.includes(opt) ? "default" : "outline"} className="rounded-full px-4"
                  onClick={() => setSelectedItem(selectedItem.includes(opt) ? selectedItem.filter(i => i !== opt) : [...selectedItem, opt])}>{opt}</Button>
              ))}
            </div>
          </div>
          {/* 기타 필터(샘플) */}
          <div className="mb-2 font-semibold text-sm">MOQ(최소수량)</div>
          <div className="mb-6">
            <input type="number" className="border rounded px-3 py-2 w-full" placeholder="예: 100" disabled />
          </div>
          <div className="mb-2 font-semibold text-sm">주요 설비</div>
          <div className="mb-6">
            <input type="text" className="border rounded px-3 py-2 w-full" placeholder="예: 오버록" disabled />
          </div>
        </div>
      </aside>
      {/* 우측 리스트/지도 */}
      <section className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="공장명, 키워드로 검색하세요."
              className="border rounded px-4 py-2 w-full md:w-80"
            />
            {/* 목록/지도 토글 */}
            <Button
              variant={view === "map" ? "outline" : "default"}
              size="sm"
              className="rounded-full"
              onClick={() => setView("list")}
            >목록</Button>
            <Button
              variant={view === "map" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setView("map")}
            >지도</Button>
          </div>
        </div>
        {/* 선택된 필터 뱃지 */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {badges.map((b, i) => (
              <span key={i} className="bg-black text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
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
                      <div className="flex gap-2 mb-2">
                        <span className="bg-toss-gray text-toss-blue rounded px-2 py-1 text-xs font-bold">{factory.region}</span>
                        {factory.items.slice(0, 2).map(i => <span key={i} className="bg-toss-gray rounded px-2 py-1 text-xs">{i}</span>)}
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
                height="420px"
              />
            </div>
            {/* 선택된 공장 카드 */}
            {selectedFactory && (
              <div className="flex gap-4 items-center">
                <Image src={selectedFactory.image} alt={selectedFactory.name} width={128} height={96} className="w-32 h-24 object-cover rounded-xl" />
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <span className="bg-toss-gray text-toss-blue rounded px-2 py-1 text-xs font-bold">{selectedFactory.region}</span>
                    {selectedFactory.items.slice(0, 2).map(i => <span key={i} className="bg-toss-gray rounded px-2 py-1 text-xs">{i}</span>)}
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
  );
} 