import { useId } from "react";

export type PreparationTarget = "상품 분석" | "도식화" | "테크팩";

export default function FadditPreparation({ target, onComplete }: {
  target: PreparationTarget; onComplete: () => void;
}) {
  const maskId = useId();
  const loopClipId = useId();
  const tailClipId = useId();
  return <div className="studio-preflight">
    <svg viewBox="0 0 317.47 407.33" aria-label="패딧 로고" role="img"
      onAnimationEnd={event => { if (event.animationName === "faddit-logo-tail") onComplete(); }}>
      <defs>
        <clipPath id={loopClipId}>
          {/* Bridge the loop edges through the crossing without revealing the later stroke. */}
          <path
            clipRule='evenodd'
            d='M-10 -10 H330 V330 H100 L76.52 242.75 C58 231 45 214 34.76 192.67 L-10 150 Z M81.94 148.14 C89 171 102 187 117.67 197.11 C131.01 203.38 148.53 207.26 167.84 207.8 C183.24 208.24 198.45 206.44 210.67 202.74 C217.06 200.81 221.48 198.68 224.31 196.95 Q240 187 246 170 L246 110 H100 Z'
          />
        </clipPath>
        <clipPath id={tailClipId}>
          {/* Trim the tail brush to the tail's own edges at the crossing (each curve joins two corners of the
              symbol), so the tail stays clean after the loop has already been erased. */}
          <path
            clipRule='evenodd'
            d='M81.94 148.14 Q52 165 34.76 192.67 L-10 264 V420 H330 V25 L300 25.3 Z M117.67 197.11 Q90.4 209.9 76.52 242.75 L100 330 L200 300 V205 Z'
          />
        </clipPath>
        {/* The loop brush starts 72 units outside the top terminal and the tail brush ends 74 units past the
            bottom one, so a brush tip never appears or vanishes on the symbol. The tail brush begins on the
            second half of the loop's last curve (same geometry), so the turn into the eye is revealed by the
            moving tip rather than by the tail's round start cap at once. */}
        <mask id={maskId} maskUnits='userSpaceOnUse' x='0' y='0' width='317.47' height='407.33'>
          <g clipPath={`url(#${loopClipId})`}>
            <path
              className='faddit-logo-ink'
              d='M335.3 139.2 L289 84 C263 53 220 30 165 30 C92 30 45 70 49 127 C52 178 78 219 124 231 C172 245 258 239 258 197'
              pathLength='0.5811'
              fill='none'
              stroke='white'
              strokeWidth='72'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
          <g clipPath={`url(#${tailClipId})`}>
            <path
              className='faddit-logo-ink faddit-logo-tail'
              d='M209 235 C236.5 230 258 218 258 197 C258 151 134 133 77 187 C31 231 17 321 37 378 L61.5 447.8'
              pathLength='0.477'
              fill='none'
              stroke='white'
              strokeWidth='72'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
        </mask>
      </defs>
      <image href="/images/demo/faddit-thread.svg" width="317.47" height="407.33" mask={`url(#${maskId})`} />
    </svg>
    <strong>{target === "상품 분석" ? "패딧 서비스로 상품을 분석하는 중" :
      `패딧 서비스로 ${target === "도식화" ? "도식화를" : "테크팩을"} 준비하는 중`}</strong>
  </div>;
}
