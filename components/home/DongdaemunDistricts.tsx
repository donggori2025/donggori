import "./dongdaemun-districts.css";
import { districtViewport, mapDongs, mapLabels } from "@/lib/dongdaemunMap";

export default function DongdaemunDistricts({ activeDistrict }: { activeDistrict?: string }) {
  const { x, y, width, height } = districtViewport;
  return (
    <svg className="pg-map-districts" viewBox={`${x} ${y} ${width} ${height}`} role="img" aria-label="동대문구 행정동 경계도">
      <image href="/images/portal/dongdaemun-context.svg" width="680" height="490" aria-hidden="true" />
      <defs>
        <linearGradient id="pg-map-land" gradientUnits="userSpaceOnUse" x1="240" y1="140" x2="500" y2="395">
          <stop stopColor="#edf7ff" />
          <stop offset=".5" stopColor="#d2e6ff" />
          <stop offset="1" stopColor="#aecbfa" />
        </linearGradient>
        <linearGradient id="pg-map-lift" x2=".85" y2="1">
          <stop stopColor="#c5e6ff" />
          <stop offset="1" stopColor="#7caaf4" />
        </linearGradient>
        <linearGradient id="pg-map-selected" x2=".85" y2="1">
          <stop stopColor="#c5e8ff" />
          <stop offset=".55" stopColor="#8dbfff" />
          <stop offset="1" stopColor="#639ff7" />
        </linearGradient>
        {mapDongs.map(({ name, points }, i) => (
          <polygon id={`pg-map-shape-${i}`} key={name} points={points} />
        ))}
      </defs>
      <g fill="none" stroke="#89a9d5" strokeWidth="2.8" strokeLinejoin="round">
        {mapDongs.map(({ name }, i) => <use key={name} href={`#pg-map-shape-${i}`} />)}
      </g>
      <g fill="url(#pg-map-land)" stroke="#a4bedf" strokeWidth=".8" strokeLinejoin="round">
        {mapDongs.map(({ name }, i) => <use key={name} href={`#pg-map-shape-${i}`} />)}
      </g>
      {mapDongs.map(({ name }, i) => (
        <g key={name} className="pg-map-dong" data-selected={activeDistrict === name}>
          <title>{name}</title>
          <use href={`#pg-map-shape-${i}`} fill="transparent" />
          <use className="pg-map-dong-lift" href={`#pg-map-shape-${i}`} />
        </g>
      ))}
      <g className="pg-map-labels" textAnchor="middle" pointerEvents="none">
        {mapLabels.map(({ name, x, y }) => <text key={name} x={x} y={y}>{name}</text>)}
      </g>
    </svg>
  );
}
