"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdChevronLeft, MdChevronRight, MdPause, MdPlayArrow } from "react-icons/md";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import { getFactoryImages } from "@/lib/factoryImages";
import styles from "./DirectoryTour.module.css";

function FactoryCard({ factory, photos }: { factory: Factory; photos: string[] }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const name = factory.company_name || factory.name;
  const district = factory.admin_district || factory.region;
  const items = productionItems(factory);
  const description = (items.length ? items : factory.items || []).join(" · ")
    || factory.main_fabrics || factory.intro || factory.description;
  return (
    <Link className={styles.card} href={`/factories/${factory.id}`} prefetch={false}>
      <div className={styles.photo}>
        {photos[photoIndex] ? (
          <Image fill src={photos[photoIndex]} alt="" sizes="(max-width: 620px) 92vw, (max-width: 1000px) 45vw, (min-width: 1700px) 380px, 23vw"
            onError={() => setPhotoIndex(photoIndex + 1)} />
        ) : <FactoryImagePlaceholder />}
      </div>
      <div className={styles.caption}>
        {district && <span className={styles.district}>{district}</span>}
        <h3>{name}</h3>
        {description && <p>{description}</p>}
      </div>
    </Link>
  );
}

export default function DirectoryTour({ rows, status }: { rows: Factory[]; status: string }) {
  const entries = useMemo(() => rows.map(factory => ({ factory, photos: getFactoryImages(factory) }))
    .filter(entry => entry.photos.length), [rows]);
  const [perPage, setPerPage] = useState(4);
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const total = Math.ceil(entries.length / perPage);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 620px)");
    const medium = window.matchMedia("(max-width: 1000px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateSize = () => {
      setPerPage(narrow.matches ? 1 : medium.matches ? 2 : 4);
      setPage(0);
      track.current?.scrollTo({ left: 0, behavior: "instant" });
    };
    const updateMotion = () => setPlaying(!motion.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateSize();
    updateMotion();
    updateVisibility();
    narrow.addEventListener("change", updateSize);
    medium.addEventListener("change", updateSize);
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (section.current) observer.observe(section.current);
    return () => {
      narrow.removeEventListener("change", updateSize);
      medium.removeEventListener("change", updateSize);
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  const move = useCallback((delta: number) => {
    const rail = track.current;
    if (!rail || total < 2) return;
    const next = (page + delta + total) % total;
    const smooth = Math.abs(next - page) === 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: next * rail.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }, [page, total]);

  useEffect(() => {
    if (!playing || !visible || !inView || hovered || total < 2) return;
    const timer = window.setTimeout(() => move(1), 7000);
    return () => window.clearTimeout(timer);
  }, [playing, visible, inView, hovered, move, total]);

  function browse(delta: number) {
    setPlaying(false);
    move(delta);
  }

  return (
    <section id="pg-tour" className={styles.section} ref={section} aria-labelledby="pg-tour-title">
      <div className={styles.intro}>
        <h2 id="pg-tour-title">동고리와 함께하는<br /><span>우리 동네 봉제공장</span></h2>
        <p>셔츠부터 재킷까지, 어떤 옷을 만드는지<br />공장마다 다른 작업 현장을 만나보세요.</p>
        <div className={styles.actions}>
          <Link className={styles.all} href="/factories">전체 공장 보기 <MdChevronRight aria-hidden="true" /></Link>
          {total > 1 && (
            <div role="group" aria-label="공장 소개 슬라이드" className={styles.controls}>
              <button type="button" onClick={() => browse(-1)} aria-label="이전 탐방 카드" aria-controls="pg-tour-slides"><MdChevronLeft /></button>
              <button type="button" onClick={() => browse(1)} aria-label="다음 탐방 카드" aria-controls="pg-tour-slides"><MdChevronRight /></button>
              <span className={styles.counter} aria-live={playing ? "off" : "polite"} aria-atomic="true">
                <span className="sr-only">현재 페이지 </span>{String(page + 1).padStart(2, "0")}
                <span> / {String(total).padStart(2, "0")}</span>
              </span>
              <span className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleX(${(page + 1) / total})` }} /></span>
              <button type="button" className={styles.play} onClick={() => setPlaying(!playing)} aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 재생"} aria-controls="pg-tour-slides">
                {playing ? <MdPause /> : <MdPlayArrow />}
              </button>
            </div>
          )}
        </div>
      </div>
      {total > 0 ? (
        <div id="pg-tour-slides" ref={track} className={styles.track}
          onScroll={({ currentTarget }) => setPage(Math.min(total - 1, Math.max(0, Math.round(currentTarget.scrollLeft / currentTarget.clientWidth))))}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setPlaying(false)} onTouchStart={() => setPlaying(false)}>
          {Array.from({ length: total }, (_, index) => (
            <div className={styles.group} key={index} inert={index !== page}
              role="group" aria-label={`공장 소개 ${index + 1} / ${total}`}>
              {entries.slice(index * perPage, (index + 1) * perPage).map(entry => <FactoryCard key={entry.factory.id} {...entry} />)}
            </div>
          ))}
        </div>
      ) : <p className={styles.status} role="status">{status === "loading" ? "공장 사진을 불러오는 중입니다." : status === "error" ? "공장 정보를 불러오지 못했습니다." : "사진을 공개한 공장이 없습니다."}</p>}
    </section>
  );
}
