"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";

function FactoryCard({ factory }: { factory: Factory }) {
  const { images } = useFactoryImages(factory);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = images[photoIndex];
  const district = factory.admin_district || factory.region;
  const itemNames = productionItems(factory).join(" · ");

  return (
    <Link href={`/factories/${factory.id}`} prefetch={false} className="factory-card">
      <div className="factory-card-photo">
        {photo && photo !== "/logo_donggori.png" ? (
          <Image src={photo} alt="" width={400} height={267}
            className="h-full w-full object-cover"
            sizes="(max-width: 700px) 90vw, (max-width: 1000px) 44vw, 390px"
            onError={() => setPhotoIndex(photoIndex + 1)} />
        ) : <FactoryImagePlaceholder />}
      </div>
      <div className="factory-caption">
        {district && <span className="factory-district">{district}</span>}
        <h3>{factory.company_name || factory.name || "공장"}</h3>
        {itemNames && <p className="line-clamp-2">{itemNames}</p>}
      </div>
    </Link>
  );
}

export default function InfoSection({ rows, loading }: { rows: Factory[]; loading: boolean }) {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(4);
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  const withImages = rows.filter((factory) => factory.images?.length && !factory.images[0].includes("logo_donggori"));
  const factories = (withImages.length >= 10 ? withImages : rows).slice(0, 10);
  const totalPages = Math.ceil(factories.length / perPage);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 700px)");
    const tablet = window.matchMedia("(max-width: 1000px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateSize() {
      setPerPage(mobile.matches ? 1 : tablet.matches ? 2 : 4);
      setPage(0);
      rail.current?.scrollTo({ left: 0, behavior: "instant" });
    }
    const updateMotion = () => setPlaying(!motion.matches);
    const updateVisibility = () => setTabVisible(!document.hidden);
    updateSize();
    updateMotion();
    updateVisibility();
    mobile.addEventListener("change", updateSize);
    tablet.addEventListener("change", updateSize);
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (section.current) observer.observe(section.current);
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", updateSize);
      tablet.removeEventListener("change", updateSize);
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const move = useCallback((direction: number) => {
    const track = rail.current;
    if (!track || totalPages < 2) return;
    const next = (page + direction + totalPages) % totalPages;
    const smooth = Math.abs(next - page) === 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: next * track.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }, [page, totalPages]);

  useEffect(() => {
    if (!playing || !inView || !tabVisible || hovered || totalPages < 2) return;
    const timer = window.setTimeout(() => move(1), 7000);
    return () => window.clearTimeout(timer);
  }, [playing, inView, tabVisible, hovered, move, totalPages]);

  function browse(direction: number) {
    setPlaying(false);
    move(direction);
  }

  return (
    <section ref={section} className="factory-showcase" aria-labelledby="factory-showcase-title">
      <div className="site-wide">
        <div className="factory-intro">
          <h2 id="factory-showcase-title">동고리와 함께하는<br /><span>우리 동네 봉제공장</span></h2>
          <p>셔츠부터 재킷까지, 어떤 옷을 만드는지<br />공장마다 다른 작업 현장을 만나보세요.</p>
          <Link href="/factories" className="landing-action">전체 공장 보기 <ArrowRight size={17} /></Link>
          {totalPages > 1 && (
            <div className="factory-controls" role="group" aria-label="공장 소개 슬라이드">
              <button type="button" aria-label="이전 공장" aria-controls="factory-slides" onClick={() => browse(-1)}><ChevronLeft size={20} /></button>
              <button type="button" aria-label="다음 공장" aria-controls="factory-slides" onClick={() => browse(1)}><ChevronRight size={20} /></button>
              <span className="factory-counter" aria-live={playing ? "off" : "polite"} aria-atomic="true">
                <span className="sr-only">현재 페이지 </span>
                <strong>{String(page + 1).padStart(2, "0")}</strong> / {String(totalPages).padStart(2, "0")}
              </span>
              <span className="factory-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${(page + 1) / totalPages})` }} />
              </span>
              <button type="button" className="factory-play" aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 재생"}
                aria-controls="factory-slides" onClick={() => setPlaying(!playing)}>
                {playing ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>
          )}
        </div>
        {loading || !factories.length ? (
          <p className="factory-status" role="status">
            {loading ? "공장 목록을 불러오는 중입니다." : "공장 정보를 불러오지 못했습니다. 전체 공장 보기에서 다시 확인해 주세요."}
          </p>
        ) : (
          <div id="factory-slides" ref={rail} role="region" aria-label="등록된 봉제공장" aria-roledescription="캐러셀"
            className="factory-rail" onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
            onPointerLeave={() => setHovered(false)} onFocusCapture={() => setPlaying(false)}
            onTouchStart={() => setPlaying(false)}
            onScroll={({ currentTarget }) => setPage(Math.min(totalPages - 1, Math.max(0, Math.round(currentTarget.scrollLeft / currentTarget.clientWidth))))}>
            {Array.from({ length: totalPages }, (_, index) => (
              <div className="factory-slide" key={index} inert={page !== index}
                role="group" aria-label={`공장 소개 ${index + 1} / ${totalPages}`}
                style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}>
                {factories.slice(index * perPage, (index + 1) * perPage).map((factory) => (
                  <FactoryCard key={factory.id} factory={factory} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
