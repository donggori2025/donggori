"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Factory } from "@/lib/factoryCatalog";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";

function getCardFabricsById(factories: Factory[]) {
  return Object.fromEntries(
    factories.map((f, idx) => {
      const labels = [f.factory_type, f.main_fabrics]
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 2);
      return [
        f.id ?? idx,
        labels,
      ];
    })
  );
}


function FactoryImageCard({ factory }: { factory: Factory }) {
  const { images } = useFactoryImages(factory);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = images[0];
  
  return (
    <div className="factory-card-photo">
      {imageSrc && imageSrc !== '/logo_donggori.png' && failedSrc !== imageSrc ? (
        <Image
          src={imageSrc}
          alt={typeof factory.company_name === 'string' ? factory.company_name : '공장 이미지'}
          className="h-full w-full object-cover"
          width={400}
          height={192}
          sizes="(max-width: 650px) 78vw, (max-width: 1000px) 40vw, 360px"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <FactoryImagePlaceholder />
      )}
    </div>
  );
}


export default function InfoSection({ rows, loading }: { rows: Factory[]; loading: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const withImages = rows.filter((factory) => factory.images?.length && !factory.images[0].includes("logo_donggori"));
  const factories = (withImages.length >= 10 ? withImages : rows).slice(0, 10);
  const fabricsById = getCardFabricsById(factories);

  return (
    <section className="factory-showcase" aria-labelledby="factory-showcase-title">
      <div className="site-wide">
        <div className="factory-intro">
          <h2 id="factory-showcase-title">동고리와 함께하는<br /><span>우리 동네 봉제공장</span></h2>
          <p>셔츠부터 재킷까지, 어떤 옷을 만드는지<br />공장마다 다른 작업 현장을 만나보세요.</p>
          <Link href="/factories" className="landing-action">전체 공장 보기 <ArrowRight size={17} /></Link>
          {factories.length > 1 && (
            <div className="factory-controls">
              {[-1, 1].map((direction) => (
                <button key={direction} type="button" aria-label={direction < 0 ? "이전 공장" : "다음 공장"} onClick={() => {
                  const viewport = viewportRef.current;
                  if (viewport) viewport.scrollBy({
                    left: direction * viewport.clientWidth * 0.75,
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                  });
                }}>
                  {direction < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              ))}
            </div>
          )}
        </div>
        {loading || !factories.length ? (
          <p className="factory-status" role="status">
            {loading ? "공장 목록을 불러오는 중입니다." : "공장 정보를 불러오지 못했습니다. 전체 공장 보기에서 다시 확인해 주세요."}
          </p>
        ) : (
          <div ref={viewportRef} tabIndex={0} role="region" aria-label="등록된 봉제공장" className="factory-rail">
            {factories.map((factory, idx) => {
              const name = factory.name || factory.company_name || "공장";
              const items = [factory.top_items_upper, factory.top_items_lower, factory.top_items_outer, factory.top_items_dress_skirt]
                .filter(Boolean).join(", ") || "미등록";
              return (
                <Link key={factory.id} href={`/factories/${factory.id}`} prefetch={false} className="factory-card">
                  <FactoryImageCard factory={factory} />
                  <div className="factory-caption">
                    <div className="factory-tags">
                      {(fabricsById[factory.id ?? idx] || []).map((label) => <span key={label}>{label}</span>)}
                    </div>
                    <h3>{name}</h3>
                    <p className="line-clamp-2">주요 품목 {items}</p>
                    <p>최소 주문 수량 {factory.moq ?? factory.minOrder ?? "미등록"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
