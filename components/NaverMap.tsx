"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { naverMapScriptUrl } from "@/lib/config";
import type { MapFactory } from "@/lib/factoryMapRows";
import { districtViewport, mapDongs, type FactoryPin, type MapMode } from "@/lib/dongdaemunMap";

import { MapAttribution } from "@/components/home/MapAttribution";

type MapInstance = { destroy(): void; setSize(size: unknown): void };
type Props = {
  pins: FactoryPin<MapFactory>[];
  mode: MapMode;
  selectedKey: string | null;
  onSelect: (pin: FactoryPin<MapFactory>) => void;
};

const center = { lat: 37.5860, lng: 127.0509 };
const { x, y, width, height } = districtViewport;
// Match the initial Web Mercator centre and zoom so the HTML pins stay in place as the SDK takes over.
const pixelsPerDegree = 256 * 2 ** 14 / 360;
const overviewStyle = {
  "--overview-width": width / 6550 * pixelsPerDegree + "px",
  "--overview-height": height / 8270 * pixelsPerDegree / Math.cos(center.lat * Math.PI / 180) + "px",
  transform: `translate(${-((center.lng - 127) * 6550 - x) / width * 100}%, ${-((37.615 - center.lat) * 8270 - y) / height * 100}%)`,
} as CSSProperties;

let authenticationFailed = false;

export default function NaverMap({ pins, mode, selectedKey, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [map, setMap] = useState<MapInstance | null>(null);
  const select = useRef(onSelect);
  useEffect(() => { select.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const previous = window.navermap_authFailure;
    window.navermap_authFailure = () => {
      authenticationFailed = true;
      setFailed(true);
      previous?.();
    };
    if (authenticationFailed) setFailed(true);
    return () => { window.navermap_authFailure = previous; };
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!loaded || failed || !element) return;
    const maps = window.naver?.maps;
    if (!maps?.Map) { setFailed(true); return; }
    let instance: MapInstance;
    try {
      instance = new maps.Map(element, {
        center: new maps.LatLng(center.lat, center.lng),
        zoom: element.clientWidth < 700 || element.clientHeight < 545 ? 13 : 14,
        zoomControl: true,
        zoomControlOptions: { style: maps.ZoomControlStyle.SMALL, position: maps.Position.RIGHT_CENTER },
        clickableIcons: false,
      });
    } catch {
      setFailed(true);
      return;
    }
    setMap(instance);
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) instance.setSize(new maps.Size(width, height));
    });
    resize.observe(element.parentElement!);
    return () => {
      resize.disconnect();
      // On an authentication failure the SDK invalidates its own map utilities.
      if (!authenticationFailed) instance.destroy();
      element.replaceChildren();
    };
  }, [loaded, failed]);

  useLayoutEffect(() => {
    if (!map || failed) return;
    const maps = window.naver.maps;
    const disposers = pins.map(pin => {
      const active = selectedKey === pin.key;
      const title = pin.label + " 공장 " + pin.factories.length + "곳";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "explorer-pin";
      button.setAttribute("aria-label", title);
      button.setAttribute("aria-pressed", String(active));
      if (mode === "district") {
        const name = document.createElement("span");
        name.textContent = pin.label;
        button.append(name);
      }
      const count = document.createElement("b");
      count.textContent = String(pin.factories.length);
      button.append(count);
      const width = mode === "district" ? 94 : 42;
      button.style.width = width + "px";
      const marker = new maps.Marker({
        map, position: new maps.LatLng(pin.lat, pin.lng), title,
        zIndex: active ? 200 : 100,
        icon: { content: button, size: new maps.Size(width, 34), anchor: new maps.Point(width / 2, 39) },
      });
      const listener = maps.Event.addListener(marker, "click", () => select.current(pin));
      button.onkeydown = e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          select.current(pin);
        }
      };
      return () => { maps.Event.removeListener(listener); marker.setMap(null); };
    });
    return () => { if (!authenticationFailed) disposers.forEach(dispose => dispose()); };
  }, [map, pins, mode, selectedKey, failed]);

  return <>
    {naverMapScriptUrl && <Script id="donggori-naver-maps" src={naverMapScriptUrl}
      strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => setFailed(true)} />}
    <div ref={container} className="explorer-basemap" aria-label="동대문구 네이버지도" />
    {(!map || failed) && <div className="explorer-overview" aria-label="동대문구 공장 위치">
      <div className="explorer-overview-land" style={overviewStyle}>
        <svg viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          {mapDongs.map(dong => <polygon key={dong.name} points={dong.points} />)}
        </svg>
        {pins.map(pin => <button key={pin.key} type="button" className="explorer-pin"
          style={{ left: pin.x + "%", top: pin.y + "%", width: mode === "district" ? 94 : 42 }}
          aria-label={`${pin.label} 공장 ${pin.factories.length}곳`} aria-pressed={pin.key === selectedKey}
          onClick={() => onSelect(pin)}>
          {mode === "district" && <span>{pin.label}</span>}<b>{pin.factories.length}</b>
        </button>)}
      </div>
      <div className="explorer-overview-note" role="status">
        {failed || !naverMapScriptUrl ? <>공장 위치 표시 중 · <button onClick={() => window.location.reload()}>네이버지도 다시 연결</button></> : "네이버지도 연결 중…"}
      </div>
      <MapAttribution className="explorer-attribution" />
    </div>}
  </>;
}
