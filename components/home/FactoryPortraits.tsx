"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdArrowOutward, MdChevronLeft, MdChevronRight, MdPause, MdPlayArrow } from "react-icons/md";
import { productionItems, type Factory } from "@/lib/factoryCatalog";

import { useCarouselPlayback } from "./useCarouselPlayback";

// Retouched photographs from 시민 PD님, in folder order starting at 꼬메오.
const portraits: { name: string; photo: string; factoryId?: string }[] = [
  { name: "꼬메오", photo: "A7C07548", factoryId: "66" },
  { name: "라인스", photo: "A7C07619", factoryId: "38" },
  { name: "희란패션", photo: "A7C07724", factoryId: "47" },
  { name: "시즌", photo: "A7C07843", factoryId: "23" },
  { name: "화담어패럴", photo: "A7C07772", factoryId: "227" },
  { name: "조이어패럴", photo: "A7C07804" },
  { name: "대명어패럴", photo: "A7C07639", factoryId: "46" },
  { name: "부연사", photo: "A7C07885", factoryId: "52" },
  { name: "경림사", photo: "A7C07926" },
  { name: "실루엣 컴퍼니", photo: "A7C07945", factoryId: "35" },
];

// Each step is measured in widths of the central portrait.
const steps = [
  { x: 0, scale: 1 },
  { x: 0.98, scale: 0.84 },
  { x: 1.81, scale: 0.7 },
  { x: 2.5, scale: 0.57 },
  { x: 3.08, scale: 0.46 },
];

function portraitIndex(position: number) {
  return ((position % portraits.length) + portraits.length) % portraits.length;
}

export default function FactoryPortraits({ rows }: { rows: Factory[] }) {
  const [position, setPosition] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const active = portraitIndex(position);
  const move = (delta: number) => setPosition((current) => current + delta);

  const { section, playing, setPlaying, visible } = useCarouselPlayback();
  const [hovered, setHovered] = useState(false);
  const [reading, setReading] = useState(false);
  const rotating = playing && visible && !hovered && !reading;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setPosition(current => current + 1), 4500);
    return () => window.clearTimeout(timer);
  }, [rotating, position]);

  return (
    <section
      ref={section}
      className="pg-portraits site-wide"
      aria-label="워크자켓을 입은 동고리 제작업체 대표"
      aria-roledescription="캐러셀"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        move(event.key === "ArrowLeft" ? -1 : 1);
      }}
    >
      <div
        className="pg-portrait-stage"
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setReading(true)}
        onBlurCapture={event => setReading(event.currentTarget.contains(event.relatedTarget))}
        onPointerDown={(event) => {
          swiped.current = false;
          start.current =
            event.isPrimary && event.pointerType !== "mouse"
              ? { x: event.clientX, y: event.clientY }
              : null;
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
        onPointerUp={(event) => {
          if (!start.current || !event.isPrimary) return;
          const dx = event.clientX - start.current.x;
          const dy = event.clientY - start.current.y;
          start.current = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            swiped.current = true;
            move(dx < 0 ? 1 : -1);
          }
        }}
        onClickCapture={(event) => {
          if (!swiped.current) return;
          swiped.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {Array.from({ length: steps.length * 2 - 1 }, (_, slot) => {
          const offset = slot - steps.length + 1;
          const depth = Math.abs(offset);
          const item = portraits[portraitIndex(position + offset)];
          const hidden = depth === steps.length - 1;
          const selected = offset === 0;
          const factory = rows.find(row => item.factoryId
            ? String(row.id) === item.factoryId : (row.company_name || row.name).trim() === item.name);
          const factoryId = item.factoryId ?? factory?.id;
          const detail = selected && factory
            ? [factory.admin_district || factory.region, productionItems(factory)[0] || factory.items?.[0]].filter(Boolean).join(" · ")
            : "";
          const photo = `/images/portal/portraits/${item.photo}.webp`;
          const actionLabel = factoryId ? "정보 보기" : "사진 보기";
          return (
            <figure
              key={position + offset}
              className="pg-portrait"
              data-selected={selected}
              aria-hidden={hidden || undefined}
              style={
                {
                  "--offset": Math.sign(offset) * steps[depth].x,
                  "--inward": -Math.sign(offset),
                  "--scale": steps[depth].scale,
                  "--layer": steps.length - depth,
                } as CSSProperties
              }
            >
              <Image
                fill
                src={photo}
                sizes="(max-width: 650px) 48vw, (max-width: 1100px) 21vw, (max-width: 2046px) 15vw, 302px"
                alt=""
                draggable={false}
                loading={depth < 2 ? "eager" : "lazy"}
              />
              <figcaption>
                <span>{item.name}{selected && detail && <small>{detail}</small>}</span>
              </figcaption>
              {!selected && !hidden && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`${item.name} 사진을 중앙에 보기`}
                  onClick={() => move(offset)}
                />
              )}
              {!hidden && (
                <Link
                  className="pg-portrait-info"
                  href={factoryId ? `/factories/${factoryId}` : photo}
                  tabIndex={selected ? 0 : -1}
                  aria-label={`${item.name} ${actionLabel}`}
                  prefetch={false}
                >
                  <span className="pg-portrait-cta">
                    <span className="pg-portrait-cta-label">{actionLabel}</span>
                    <MdArrowOutward aria-hidden="true" />
                  </span>
                </Link>
              )}
            </figure>
          );
        })}
      </div>
      <div className="pg-portrait-controls">
        <button
          type="button"
          aria-label="이전 업체 사진"
          onClick={() => move(-1)}
        >
          <MdChevronLeft />
        </button>
        <span aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          <span className="sr-only">{portraits[active].name}, </span>
          <strong>{String(active + 1).padStart(2, "0")}</strong> /{" "}
          {portraits.length}
        </span>
        <button
          type="button"
          aria-label="다음 업체 사진"
          onClick={() => move(1)}
        >
          <MdChevronRight />
        </button>
        <button type="button" aria-label={playing ? "업체 사진 자동 전환 일시정지" : "업체 사진 자동 전환 재생"}
          onClick={() => setPlaying(value => !value)}>
          {playing ? <MdPause /> : <MdPlayArrow />}
        </button>
      </div>
    </section>
  );
}
