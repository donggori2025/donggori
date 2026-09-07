export default function EsgCircle() {
  const slices = [
    { label: "E", image: "/images/esg/e.jpg", start: -90, sweep: 120 },
    { label: "S", image: "/images/esg/s.jpg", start: 30, sweep: 120 },
    { label: "G", image: "/images/esg/g.jpg", start: 150, sweep: 120 },
  ];

  const cx = 160;
  const cy = 160;
  const r = 148;
  const size = 320;

  const polar = (deg: number, radius: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const wedge = (start: number, sweep: number) => {
    const a0 = polar(start, r);
    const a1 = polar(start + sweep, r);
    return `M ${cx} ${cy} L ${a0.x} ${a0.y} A ${r} ${r} 0 0 1 ${a1.x} ${a1.y} Z`;
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-auto w-[260px] sm:w-[320px]"
      role="img"
      aria-label="ESG 세 영역 원형 도식"
    >
      <defs>
        {slices.map((slice) => (
          <clipPath key={`clip-${slice.label}`} id={`esg-clip-${slice.label}`}>
            <path d={wedge(slice.start, slice.sweep)} />
          </clipPath>
        ))}
      </defs>

      {slices.map((slice) => {
        const mid = polar(slice.start + slice.sweep / 2, r * 0.52);
        return (
          <g key={slice.label}>
            <image
              href={slice.image}
              x={0}
              y={0}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#esg-clip-${slice.label})`}
            />
            <path d={wedge(slice.start, slice.sweep)} fill="rgba(0,0,0,0.48)" />
            <text
              x={mid.x}
              y={mid.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="42"
              fontWeight="800"
            >
              {slice.label}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth="6" />
    </svg>
  );
}
