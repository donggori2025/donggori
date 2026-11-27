"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdArrowForward,
  MdArrowOutward,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import { getFactoryImages } from "@/lib/factoryImages";
import { districtViewport, groupDistrictFactories, type FactoryPin as Pin } from "@/lib/dongdaemunMap";
import DongdaemunDistricts from "./DongdaemunDistricts";

import { MapAttribution } from "./MapAttribution";

function createMapIndex(rows: Factory[]) {
  const pins = groupDistrictFactories(rows, "position");
  const covers = new Map<string, string>();
  for (const pin of pins) {
    for (const factory of pin.factories) {
      const photo = getFactoryImages(factory)[0];
      if (photo) covers.set(factory.id, photo);
    }
    pin.factories.sort((a, b) => Number(covers.has(b.id)) - Number(covers.has(a.id)));
  }
  // Rotate across locations within the photo and text-only groups.
  const profiles = pins
    .flatMap((pin) =>
      pin.factories.map((factory, rank) => ({ pin, factory, rank, photo: covers.get(factory.id) })),
    )
    .sort((a, b) => Number(!!b.photo) - Number(!!a.photo) || a.rank - b.rank);
  return { pins, profiles };
}

export default function FactoryMap({ rows, status }: { rows: Factory[]; status: string }) {
  const { pins, profiles } = useMemo(() => createMapIndex(rows), [rows]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [reading, setReading] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const count = profiles.length;
  const current = profiles[index % (count || 1)];
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!motion.matches);
    const respectMotion = () => {
      if (motion.matches) setPlaying(false);
    };
    motion.addEventListener("change", respectMotion);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", respectMotion);
    };
  }, []);
  useEffect(() => {
    if (!playing || reading || !visible || count < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [playing, reading, visible, count]);
  function move(delta: number) {
    if (!count) return;
    setDismissed(false);
    setPlaying(false);
    setIndex((i) => (i + count + delta) % count);
  }
  function selectPin(pin: Pin) {
    const rank = !dismissed && current?.pin === pin ? (current.rank + 1) % pin.factories.length : 0;
    const next = profiles.findIndex((p) => p.pin === pin && p.rank === rank);
    if (next >= 0) {
      setDismissed(false);
      setPlaying(false);
      setIndex(next);
    }
  }
  const f = current?.factory;
  const photo = current?.photo;
  const products = f ? productionItems(f).slice(0, 3).join(" · ") : "";
  const empty =
    status === "loading"
      ? "업체 위치를 불러오는 중입니다."
      : status === "error"
        ? "업체 위치를 불러오지 못했습니다."
        : "표시할 공개 위치가 없습니다.";
  return (
    <section className="pg-map" id="pg-map" aria-labelledby="pg-map-title">
      <svg className="pg-map-wave" viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pg-wave-threads" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#77b9ff" stopOpacity=".14" />
            <stop offset=".32" stopColor="#3182f6" stopOpacity=".46" />
            <stop offset=".65" stopColor="#92d9ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#3779dc" stopOpacity=".34" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#pg-wave-threads)" strokeWidth="1.3">
          {Array.from({ length: 38 }, (_, i) => (
            <path key={i} d={`M -60 ${405 + i * 4} C 215 ${790 - i * 2}, 420 ${755 + i * 2}, 740 ${445 + i * 2}
              S 1130 ${170 - i * 6}, 1500 ${30 + i * 5}`} />
          ))}
        </g>
      </svg>
      <div className="pg-wide">
        <div className="pg-map-layout">
          <div className="pg-map-intro">
            <h2 id="pg-map-title">
              동대문구 <br />
              봉제공장 지도
            </h2>
            <p>
              {count ? (
                <>
                  위치를 공개한 제작업체 <strong>{count}곳</strong>을 만나보세요.
                </>
              ) : (
                "동대문구 일대의 제작업체를 만나보세요."
              )}
            </p>
            <p>
              핀을 선택하면 업체의 제작 품목과 <br className="pg-break-wide" />
              등록 사진을 살펴볼 수 있습니다.
            </p>
            <Link className="pg-map-all" href="/factories">
              전체 공장 보기 <MdArrowForward />
            </Link>
            {count > 0 && (
              <div className="pg-map-controls" role="group" aria-label="업체 프로필 재생">
                <span aria-label={`전체 ${count}곳 중 ${(index % count) + 1}번째`}>
                  {String((index % count) + 1).padStart(2, "0")} <small>/ {count}</small>
                </span>
                <button
                  type="button"
                  disabled={count < 2}
                  aria-label="이전 업체 프로필"
                  onClick={() => move(-1)}
                >
                  <MdChevronLeft />
                </button>
                <button
                  type="button"
                  disabled={count < 2}
                  aria-label={playing ? "업체 자동 소개 일시정지" : "업체 자동 소개 재생"}
                  onClick={() => {
                    setDismissed(false);
                    setPlaying(!playing);
                  }}
                >
                  {playing ? <MdPause /> : <MdPlayArrow />}
                </button>
                <button
                  type="button"
                  disabled={count < 2}
                  aria-label="다음 업체 프로필"
                  onClick={() => move(1)}
                >
                  <MdChevronRight />
                </button>
              </div>
            )}
          </div>
          <div className="pg-map-frame" ref={stage}>
            <div className="pg-map-canvas" style={{ aspectRatio: `${districtViewport.width} / ${districtViewport.height}` }}>
              <DongdaemunDistricts activeDistrict={dismissed ? undefined : current?.pin.districtName} />
              <span className="pg-map-north" aria-hidden="true">
                ↑ N
              </span>
              {pins.map((pin) => (
                <button
                  key={pin.key}
                  type="button"
                  className="pg-map-pin"
                  style={{ left: pin.x + "%", top: pin.y + "%" }}
                  aria-pressed={!dismissed && current?.pin === pin}
                  aria-controls="pg-map-profile"
                  aria-label={`${pin.factories[0].name} 인근 ${pin.factories.length}곳 보기`}
                  onClick={() => selectPin(pin)}
                >
                  <span>{pin.factories.length > 1 ? pin.factories.length : <i />}</span>
                </button>
              ))}
              <span className="pg-map-scale" style={{ width: `${(74.25 / districtViewport.width) * 100}%` }} aria-hidden="true">
                1 km
              </span>
              <MapAttribution className="pg-map-info" />
            </div>
            {count === 0 && (
              <p className="pg-map-empty" role="status">
                {empty}
              </p>
            )}
            {current && f && !dismissed && (
              <div
                className="pg-map-popup"
                style={{ "--pin-ratio": current.pin.x / 100, "--pin-y": current.pin.y + "%" } as CSSProperties}
                data-below={current.pin.y < 40}
                id="pg-map-profile"
                aria-live={playing ? "off" : "polite"}
                aria-atomic="true"
                onMouseEnter={() => setReading(true)}
                onMouseLeave={() => setReading(false)}
                onFocusCapture={() => setPlaying(false)}
              >
                <div key={f.id} className="pg-map-profile-entry">
                  <button
                    type="button"
                    className="pg-map-close"
                    aria-label="프로필 닫기"
                    onClick={() => {
                      setReading(false);
                      setPlaying(false);
                      setDismissed(true);
                      stage.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
                    }}
                  >
                    <MdClose />
                  </button>
                  <Link
                    href={`/factories/${f.id}`}
                    prefetch={false}
                    className="pg-map-profile"
                    aria-label={`${f.company_name || f.name} 업체 상세 보기`}
                  >
                    {photo && <Image src={photo} width={96} height={96} alt="" sizes="96px" />}
                    <div>
                      <span>{[current.pin.districtName, f.factory_type].filter(Boolean).join(" · ")}</span>
                      <strong>{f.company_name || f.name}</strong>
                      {products && <p>{products}</p>}
                    </div>
                    <MdArrowOutward />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
