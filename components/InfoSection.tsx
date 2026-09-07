"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFactoriesFromDB, type Factory } from "@/lib/factoryCatalog";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";

function getCardFabricsById(factories: Factory[]) {
  const colors = [
    { color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
    { color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
  ] as const;
  return Object.fromEntries(
    factories.map((f, idx) => {
      const labels = [f.factory_type, f.main_fabrics]
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 2);
      return [
        f.id ?? idx,
        labels.map((label, chipIndex) => ({ label, ...colors[chipIndex % colors.length] })),
      ];
    })
  );
}


function FactoryImageCard({ factory, idx }: { factory: Factory; idx: number }) {
  const { images } = useFactoryImages(factory);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = images[0];
  
  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg sm:rounded-t-xl group">
      {imageSrc && imageSrc !== '/logo_donggori.png' && failedSrc !== imageSrc ? (
        <Image
          src={imageSrc}
          alt={typeof factory.company_name === 'string' ? factory.company_name : '공장 이미지'}
          className="object-cover w-full h-full rounded-t-lg sm:rounded-t-xl group-hover:scale-110 transition-transform duration-300"
          width={400}
          height={192}
          priority={idx < 4}
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <FactoryImagePlaceholder />
      )}
    </div>
  );
}


export default function InfoSection() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchFactoriesFromDB().then((data) => {
      if (!active) return;
      const withImages = data.filter((factory) => factory.images?.length && !factory.images[0].includes("logo_donggori"));
      setFactories((withImages.length >= 10 ? withImages : data).slice(0, 10));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const fabricsById = getCardFabricsById(factories);

  return (
    <section className="dg-section w-full bg-white">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center lg:gap-10 xl:gap-14">
          <div className="flex flex-col items-start text-left">
            <h2 className="dg-section-title">조건에 맞는<br />봉제공장 찾기</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
              지역, 생산 품목, 원단과 최소 주문 수량을 비교해 적합한 공장을 찾아보세요.
            </p>
            <Link href="/factories" className="mt-6 inline-flex items-center gap-3 rounded-md bg-dg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
              봉제공장 찾아보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="w-full min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" role="status" aria-label="공장 목록 불러오는 중">
                {[0, 1, 2].map((id) => <div key={id} className="h-72 animate-pulse rounded-lg bg-gray-50" />)}
              </div>
            ) : factories.length === 0 ? (
              <p className="rounded-lg border border-dg-line px-6 py-16 text-center text-sm text-gray-500">
                공장 정보를 불러오지 못했습니다. 공장 찾기에서 다시 확인해주세요.
              </p>
            ) : (
              <>
                <div ref={viewportRef} tabIndex={0} role="region" aria-label="등록된 봉제공장"
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-3 scrollbar-hide focus-visible:outline-2 focus-visible:outline-gray-500">
                  {factories.map((factory, idx) => {
                    const name = factory.name || factory.company_name || "공장";
                    const mainItems = [factory.top_items_upper, factory.top_items_lower, factory.top_items_outer, factory.top_items_dress_skirt]
                      .filter((value) => typeof value === "string" && value.length > 0).join(", ") || "미등록";
                    return (
                      <Link key={factory.id ?? idx} href={`/factories/${factory.id}`}
                        className="flex w-[72vw] max-w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-dg-line bg-white transition-shadow hover:shadow-md sm:w-[230px]">
                        <FactoryImageCard factory={factory} idx={idx} />
                        <div className="flex flex-1 flex-col px-4 py-4">
                          <div className="mb-2 flex flex-wrap gap-1">
                            {(fabricsById[factory.id ?? idx] || []).map((chip) => (
                              <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-2 py-1 text-xs font-semibold">{chip.label}</span>
                            ))}
                          </div>
                          <h3 className="mb-2 text-sm font-bold text-gray-900">{name}</h3>
                          <p className="truncate text-xs leading-6 text-gray-500">주요품목 {mainItems}</p>
                          <p className="text-xs leading-6 text-gray-500">MOQ {factory.moq ?? factory.minOrder ?? "미등록"}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  {[-1, 1].map((direction) => (
                    <button key={direction} type="button" aria-label={direction < 0 ? "이전 공장" : "다음 공장"}
                      onClick={() => {
                        const viewport = viewportRef.current;
                        if (viewport) viewport.scrollBy({ left: direction * viewport.clientWidth * 0.75, behavior: "smooth" });
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-dg-line text-gray-700 hover:bg-gray-50">
                      <span aria-hidden="true">{direction < 0 ? "←" : "→"}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
