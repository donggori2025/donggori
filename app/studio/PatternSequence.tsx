import { Link2 } from "lucide-react";
import ProductPhotoStack, { photoTotal, type PhotoStackProps } from "@/components/ProductPhotoStack";
import { demoProductUrl } from "@/lib/presentationDemo";

// Registration coordinates follow the front and back on the supplied 1106 × 660 drawing.
const front = [
  "M352 163 Q378 156 406 162 Q410 165 417 189 Q457 203 467 234 Q498 308 503 368 Q504 401 493 428 L494 435 L486 446 L451 436 L456 416 L461 383 L467 477 Q434 497 391 509 L381 479 L371 509 Q320 498 292 477 L294 444 L271 447 L266 435 L269 422 Q254 387 259 350 Q268 280 294 231 Q303 204 342 189 Z",
  "M352 164 Q360 188 381 187 Q402 186 407 163 M342 189 Q355 217 381 211 Q407 213 418 189 M366 190 L399 189 L401 201 L366 203 Z",
  "M368 211 L368 476 L392 476 L391 211 M371 212 L371 474 M294 468 L366 468 M393 469 L468 468",
  "M294 233 Q309 247 309 264 L299 346 Q296 380 308 417 M468 233 Q451 252 451 266 L462 344 Q465 372 456 413",
  "M300 376 L344 342 L352 357 L335 387 L303 397 Z M460 376 L418 342 L408 358 L426 388 L457 396 Z",
  "M266 425 L306 417 L312 436 L273 444 Z M454 415 L492 425 L486 444 L450 436 Z M295 477 L368 478 L371 508 M393 478 L465 477 M376 509 Q380 524 372 541 M387 509 Q381 525 390 540",
];
const back = [
  "M689 162 Q716 156 748 162 L758 189 Q796 203 807 232 Q835 298 842 365 Q845 399 832 426 L834 436 L828 446 L807 443 L808 477 Q773 497 731 509 L719 478 L710 509 Q666 499 631 477 L632 442 L610 446 L604 437 L607 424 Q593 390 598 350 Q604 296 632 231 Q645 203 682 189 Z",
  "M682 189 Q717 201 758 189 M688 178 Q721 171 752 178 M649 247 Q710 239 790 246 M719 245 L719 474",
  "M633 232 Q643 241 649 259 L639 337 L632 424 M806 232 Q791 246 791 260 L800 344 L807 425",
  "M607 426 L632 422 L632 441 L611 444 Z M805 423 L831 427 L827 443 L806 441 Z",
  "M631 468 Q669 493 711 503 L718 474 L731 503 Q774 495 807 468 M715 508 Q719 523 710 541 M725 507 Q722 524 730 540",
];

export default function PatternSequence({ phase, requested, ready, onReady }: { phase: number } & PhotoStackProps) {
  return (
    <div className="studio-pattern-sequence">
      {phase > 0 && <svg className="studio-pattern" viewBox="221 120 662 451" role="img" aria-label="파카 앞면과 뒷면 도식화">
        <defs>
          <clipPath id="parka-front"><path d={front[0]} /></clipPath>
          <clipPath id="parka-back"><path d={back[0]} /></clipPath>
        </defs>
        {[front, back].map((paths, side) => (
          <g key={side} data-drawn={phase > side} className="studio-strokes">
            {paths.map((d, i) => (
              <path key={d} d={d} pathLength={1} style={{ animationDelay: `${i * 115}ms` }} />
            ))}
            <image className="studio-ink-detail" href="/images/demo/drawing.png" width="1106" height="660"
              clipPath={side ? "url(#parka-back)" : "url(#parka-front)"}/>
            <text x={side ? 720 : 380} y="145" textAnchor="middle">
              {side ? "뒷면" : "앞면"}
            </text>
          </g>
        ))}
        <g className="studio-dimensions" data-drawn={phase >= 2}>
          <path d="M294 527 V550 M469 527 V550 M294 548 H469 M850 235 H865 M851 436 H865 M862 235 V436" />
          <text x="382" y="566" textAnchor="middle">
            밑단 75 cm
          </text>
          <text x="857" y="331" transform="rotate(-90 857 331)" textAnchor="middle">
            소매 54 cm
          </text>
        </g>
      </svg>}
      {phase < 2 && (
        <div className="studio-source-view" data-wipe={phase === 1} aria-hidden={phase === 1}>
          <ProductPhotoStack requested={requested} ready={ready} onReady={onReady} />
          {ready === 0 ? (
            <div className="studio-link-analysis" role="status">
              <Link2 size={23} aria-hidden="true" />
              <strong>링크 분석 중</strong>
              <span>{demoProductUrl.replace("https://www.", "")}</span>
              <i aria-hidden="true" />
            </div>
          ) : (
            <p className="studio-analysis-caption" role="status">
              <i />
              {ready === photoTotal ? "상품 이미지 분석 중" : "상품 사진 수집 중"} <b>{ready}장</b>
            </p>
          )}
          {ready === photoTotal && <div className="studio-scanner" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}
