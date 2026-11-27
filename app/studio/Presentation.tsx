"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FitRating from "./FitRating";
import OrderArtwork from "./OrderArtwork";
import { demoProductUrl, parkaOrder, requestQuantity } from "@/lib/presentationDemo";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileText,
  Link2,
  MapPin,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { asset, details, partners, product, sheets, type Partner } from "./case";
import Consultation from "./Consultation";
import FadditPreparation, { type PreparationTarget } from "./FadditPreparation";
import SheetViewer from "./SheetViewer";
import CoordinatorButton from "./coordinator/CoordinatorButton";
import PatternSequence from "./PatternSequence";
import SpecBoardAssembly from "./SpecBoardAssembly";
import { photoTotal } from "@/components/ProductPhotoStack";

type Stage = "prepare" | "sheet" | "matches" | "factory" | "chat";
const sequence = [
  {
    name: "상품 이미지 분석",
    title: "상품 사진을 분석하고 있어요.",
    sheet: 1,
    time: 2200,
    caption: "착용 사진과 앞·뒤 실루엣을 함께 살펴봅니다.",
  },
  {
    name: "앞면 도식화",
    title: "파카의 앞면을 그리고 있어요.",
    sheet: 1,
    time: 3600,
    caption: "스탠드 칼라와 앞중심 지퍼, 플랩 포켓의 형태를 옮깁니다.",
  },
  {
    name: "뒷면 도식화",
    title: "뒷면 도식화를 완성하고 있어요.",
    sheet: 1,
    time: 3600,
    caption: "등판 요크와 피쉬테일 밑단을 연결합니다.",
  },
  {
    name: "작업지시서 구성",
    title: "도식화로 작업지시서를 만들어요.",
    sheet: 0,
    time: null,
    caption: "앞·뒤 도식화와 치수를 스펙 보드에 배치합니다.",
  },
  { name: "봉제 지시", title: "봉제 순서를 정리하고 있어요.", sheet: 2, time: 3800, caption: "피쉬테일 트임 · 밑단 조임끈" },
  { name: "라벨 사양", title: "라벨 위치와 치수를 정리해요.", sheet: 3, time: 3800, caption: "메인 라벨 · 75 × 20mm" },
] as const;
const stageIndex: Record<Stage, number> = { prepare: 0, sheet: 0, matches: 1, factory: 1, chat: 2 };

function RestartLink() {
  return <Link className="studio-reset" href="/studio"><RotateCcw size={14} aria-hidden="true" />다시하기</Link>;
}

function transition(change: () => void) {
  if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(() => flushSync(change));
  } else change();
}

function RecommendationReason({ shop }: { shop: Partner }) {
  const start = shop.reason.lastIndexOf(shop.highlight);
  if (start < 0) return <>{shop.reason}</>;
  return <>{shop.reason.slice(0, start)}<mark>{shop.highlight}</mark>{shop.reason.slice(start + shop.highlight.length)}</>;
}

function ShopPhoto({ shop, index = 0 }: { shop: Partner; index?: number }) {
  const file = shop.photos[index];
  return file ? (
    <img className="studio-shop-photo" src={file} alt={`${shop.name} 등록 사진`} />
  ) : (
    <div className="studio-photo-empty">
      <Building2 size={34} />
      <span>등록 사진 없음</span>
    </div>
  );
}

type WorkroomProps = { request: string; completed?: boolean; startAtMatches?: boolean; inquiryId?: string } & (
  | { source: string; matches?: Partner[] | null }
  | { source?: never; matches: Partner[] | null }
);

export default function Presentation({ request, source, matches, completed, startAtMatches, inquiryId }: WorkroomProps) {
  const router = useRouter();
  const editor = useRef<HTMLDetailsElement>(null);
  const [draft, setDraft] = useState(request || parkaOrder(request).text);
  const draftQuantity = requestQuantity(draft);
  const withSheet = source !== undefined;
  const order = parkaOrder(request);
  const quantity = withSheet ? order.quantity : requestQuantity(request);
  const candidates = matches === undefined ? partners : matches ?? [];
  const [stage, setStage] = useState<Stage>(startAtMatches || !withSheet ? "matches" : completed ? "sheet" : "prepare");
  const [matchPhase, setMatchPhase] = useState<"compare" | "shortlist" | "ready">(startAtMatches ? "ready" : "compare");
  const analyzingMatches = stage === "matches" && matches !== null && matchPhase !== "ready";
  const [phase, setPhase] = useState(0);
  const [preflight, setPreflight] = useState<PreparationTarget | null>(withSheet && !completed && !startAtMatches ? "상품 분석" : null);
  const [requestedPhotos, setRequestedPhotos] = useState(0);
  const [readyPhotos, setReadyPhotos] = useState(0);
  const [sheet, setSheet] = useState(0);
  const [shop, setShop] = useState<Partner | null>(null);
  const [photo, setPhoto] = useState(0);
  const [enteredChat, setEnteredChat] = useState(false);
  const [zoomPage, setZoomPage] = useState(0);
  const zoom = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const finishBoard = useCallback(() => setPhase(4), []);
  const confirmPhoto = useCallback((count: number) => setReadyPhotos(prev => Math.max(prev, count)), []);
  const photosCollected = readyPhotos === photoTotal;

  useEffect(() => {
    if (!analyzingMatches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextPhase = !reduceMotion && matchPhase === "compare" ? "shortlist" : "ready";
    const timer = window.setTimeout(() => setMatchPhase(nextPhase), reduceMotion ? 0 : 950);
    return () => window.clearTimeout(timer);
  }, [analyzingMatches, matchPhase]);

  useEffect(() => {
    if (!photosCollected) return;
    for (const url of [...sheets.map((s) => asset(s.file)), ...partners.flatMap((p) => p.photos)]) {
      const image = new window.Image();
      image.src = url;
    }
  }, [photosCollected]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [stage]);
  useEffect(() => {
    const duration = sequence[phase].time;
    if (stage !== "prepare" || preflight || duration === null) return;
    if (phase === 0 && readyPhotos !== requestedPhotos) return;
    if (phase === 0 && requestedPhotos < photoTotal) {
      const timer = window.setTimeout(
        () => setRequestedPhotos(requestedPhotos + 1),
        1650,
      );
      return () => window.clearTimeout(timer);
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(
      () => {
        if (phase === sequence.length - 1) setStage("sheet");
        else if (phase === 0 || phase === 2) setPreflight(phase === 0 ? "도식화" : "테크팩");
        else setPhase(phase + 1);
      },
      reduced.matches && phase < 4 ? 1150 : duration,
    );
    return () => window.clearTimeout(timer);
  }, [phase, stage, readyPhotos, requestedPhotos, preflight]);

  function go(next: Stage) {
    if (withSheet && (next === "matches" || next === "sheet")) {
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.replaceState(window.history.state, "", url);
    }
    transition(() => setStage(next));
  }
  function chooseShop(next: Partner) {
    transition(() => {
      if (shop?.id !== next.id) setEnteredChat(false);
      setShop(next);
      setPhoto(0);
      setStage("factory");
    });
  }
  function startChat() {
    transition(() => {
      setEnteredChat(true);
      setStage("chat");
    });
  }
  function openZoom(index: number) {
    setZoomPage(index);
    zoom.current?.showModal();
  }
  const preparing = stage === "prepare";
  const readingLink = preparing && phase === 0 && readyPhotos === 0;
  const step = readingLink
    ? { ...sequence[0], name: "링크 분석", title: "상품 링크를 분석하고 있어요.", caption: "입력한 링크에서 상품 사진을 찾습니다." }
    : sequence[phase];
  const displayed = preparing ? step.sheet : sheet;
  const page = sheets[displayed];
  const detail = preparing && phase >= 4 ? details.find((d) => d.page === displayed) : null;
  const steps = withSheet ? ["작업지시서", "업체 선정", "제작 상담"] : ["업체 선정", "제작 상담"];
  const activeStep = stageIndex[stage] - (withSheet ? 0 : 1);
  const title = preparing
    ? preflight === "상품 분석" ? "상품 이미지를 분석하고 있어요." : preflight ? `${preflight} 준비` : step.title
    : stage === "sheet"
      ? "작업지시서가 완성됐어요."
      : stage === "matches"
        ? "동고리가 추천하는 제작 파트너"
        : stage === "factory"
          ? shop?.name
          : `${shop?.name} 제작 상담`;

  return (
    <div className="studio" data-stage={stage} data-room={stage === "chat" || undefined}>
      <div className="studio-inner site-wide">
        <ol className="studio-steps" aria-label="제작 상담 흐름">
          {steps.map((label, i) => (
            <li key={label} aria-current={activeStep === i ? "step" : undefined} data-done={i < activeStep}>
              <b>{i < activeStep ? <Check size={12} /> : i + 1}</b>
              {label}
            </li>
          ))}
        </ol>
        <header className="studio-heading">
          <h1 ref={heading} tabIndex={-1} style={stage === "factory" && shop ? { viewTransitionName: `shop-name-${shop.id}`, width: "fit-content" } : undefined}>{title}</h1>
          {stage === "matches" && withSheet && (
            <button className="studio-text-button" onClick={() => go("sheet")}>
              <ArrowLeft />
              작업지시서
            </button>
          )}
          {stage === "factory" && (
            <button className="studio-text-button" onClick={() => go("matches")}>
              <ArrowLeft />
              추천 업체
            </button>
          )}
          {stage === "chat" && (
            <button className="studio-text-button" onClick={() => go("factory")}>
              <ArrowLeft />
              업체 정보
            </button>
          )}
        </header>

        {(preparing || stage === "sheet") && (
          <section className="studio-desk">
            <aside className="studio-brief">
              <a className="studio-kicker" href={demoProductUrl} target="_blank" rel="noreferrer">
                <Link2 size={15} /> 상품 원본 · {source} ↗
              </a>
              {!readingLink && <h2>{product}</h2>}
              {request && <blockquote>{request}</blockquote>}
              {(!preparing || phase > 0) && <dl className="studio-specs">
                <div>
                  <dt>제작 품목</dt>
                  <dd>공용 점퍼</dd>
                </div>
                <div>
                  <dt>사이즈</dt>
                  <dd>S — XXL</dd>
                </div>
                <div>
                  <dt>제작 요청 수량</dt>
                  <dd>{quantity ? quantity.toLocaleString("ko-KR") + "장" : "상담 시 확인"}</dd>
                </div>
              </dl>}
              {preparing ? (
                <>
                  <div className="studio-timeline">
                    {sequence.map(({ name }, i) => (
                      <div key={name} data-state={i === phase ? "active" : i < phase ? "done" : "next"}>
                        <i>{i < phase && <Check size={10} />}</i>
                        {readingLink && i === 0 ? step.name : name}
                      </div>
                    ))}
                  </div>
                  <button className="studio-text-button" onClick={() => setStage("sheet")}>
                    완성본 바로 보기
                    <ArrowRight />
                  </button>
                </>
              ) : (
                <>
                  <div className="studio-page-picker" aria-label="작업지시서 페이지">
                    {sheets.map((s, i) => (
                      <button key={s.file} aria-pressed={i === sheet} onClick={() => setSheet(i)}>
                        <span>0{i + 1}</span>
                        {s.title}
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                  <div className="studio-actions">
                    <button className="studio-primary" onClick={() => go("matches")}>
                      이 작업지시서로 봉제공장 추천받기
                      <ArrowRight />
                    </button>
                    <CoordinatorButton request={request} inquiryId={inquiryId} />
                    <RestartLink />
                  </div>
                </>
              )}
            </aside>
            <div className="studio-board">
              <header>
                <span>
                  <FileText size={16} />
                  {preparing ? "작업지시서 준비" : page.title}
                </span>
                {preparing ? (
                  <small aria-live="polite">{preflight === "상품 분석" ? preflight : preflight ? preflight + " 준비" : step.name}</small>
                ) : (
                  <div className="studio-board-tools">
                    <button onClick={() => openZoom(sheet)}><Expand size={15} />크게 보기</button>
                    <a href="https://faddit.co.kr/faddit/worksheet" target="_blank" rel="noopener noreferrer"
                      aria-label="패딧 편집기 열기 (새 탭)">
                      <img src="/images/demo/faddit-thread.svg" width="13" height="17" alt="" />
                      패딧 편집기 열기
                    </a>
                  </div>
                )}
              </header>
              {preparing && preflight ? (
                <><FadditPreparation target={preflight} onComplete={() => {
                  if (preflight === "상품 분석") setRequestedPhotos(1);
                  else setPhase(phase + 1);
                  setPreflight(null);
                }} />
                <footer><span>{preflight}</span><b>{(phase === 0 && preflight === "상품 분석") ? 1 : phase + 2} / {sequence.length}</b></footer></>
              ) : preparing && phase === 3 ? (
                <SpecBoardAssembly request={request} onComplete={finishBoard} progress={`${phase + 1} / ${sequence.length}`} />
              ) : (
                <>
                  <div className="studio-board-surface" data-annotated={Boolean(detail)}>
                    {preparing && phase < 3 ? (
                      <PatternSequence phase={phase} requested={requestedPhotos} ready={readyPhotos} onReady={confirmPhoto} />
                    ) : detail ? (
                      <figure className="studio-annotation" key={detail.page} data-page={detail.page}>
                        <div className="studio-annotation-source">
                          <img src={asset(page.file)} alt={`${product} ${page.title} 원본`} />
                          <span className="studio-annotation-mark" aria-hidden="true"><b>{detail.mark}</b></span>
                        </div>
                        <svg className="studio-annotation-art" viewBox={detail.crop.viewBox}
                          role="img" aria-label={detail.crop.alt}>
                          <image href={asset(detail.crop.file)} width={detail.crop.width} height={detail.crop.height} />
                        </svg>
                        <figcaption>
                          <div className="studio-annotation-ref"><b>{detail.mark}</b>{detail.section}</div>
                          <h3>{detail.title}</h3>
                          <p>{detail.instruction}</p>
                          <dl>{detail.specs.map(([label, value]) => (
                            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                          ))}</dl>
                        </figcaption>
                      </figure>
                    ) : (
                      <div
                        key={preparing ? `phase-${phase}` : page.file}
                        className="studio-paper"
                      >
                        <OrderArtwork request={request} page={displayed} />
                      </div>
                    )}
                  </div>
                  <footer>
                    <span>{detail ? `${product} · ${page.title}` : preparing ? step.caption : page.title}</span>
                    <b>
                      {preparing
                        ? `${phase + 1} / ${sequence.length}`
                        : `${String(displayed + 1).padStart(2, "0")} / 04`}
                    </b>
                  </footer>
                </>
              )}
            </div>
          </section>
        )}

        {stage === "matches" && (
          <section className="studio-match">
            <aside className={withSheet ? "studio-order" : "studio-order studio-request-summary"}>
              {withSheet ? <>
                <div className="order-overview">
                  <img className="order-garment" src={asset("parka-front.webp")} alt="M-65 피쉬테일 숏 파카 정면" />
                  <div>
                    <h2>{product}</h2>
                    <p className="order-description" data-updated={startAtMatches}>
                      {order.sample ? <>총 47장 · 올리브 18 / 다크올리브 11 / 블랙 18</> : <>
                        {quantity && (request.match(/\d[\d,]*\s*(?:장|벌)/g)?.length ?? 0) > 1 && !/(?:총|합계)/.test(request) && <strong>총 {quantity.toLocaleString("ko-KR")}장 · </strong>}
                        {order.text}
                      </>}
                    </p>
                  </div>
                </div>
              </> : <>
                <h2>내 제작 조건</h2>
                <p>{request}</p>
                <Link className="studio-text-button" href={`/studio?draft=${encodeURIComponent(request)}`}>
                  조건 수정 <ArrowRight />
                </Link>
              </>}
              {withSheet && <div className="order-actions">
                <button className="order-sheet-link" onClick={() => openZoom(0)}>
                  <FileText size={17} aria-hidden="true" /> 작업지시서 보기
                </button>
              </div>}
            </aside>
            <div className="studio-matches" data-analyzing={analyzingMatches}>
              {withSheet && (
              <details ref={editor} className="studio-edit-conditions">
                <summary>제작 조건 바꿔 보기</summary>
                <form onSubmit={event => {
                  event.preventDefault();
                  if (!draft.trim()) return;
                  editor.current?.removeAttribute("open");
                  router.push(`/studio?view=matches&prompt=${encodeURIComponent(demoProductUrl + "\n" + draft.trim())}`);
                }}>
                  <label htmlFor="studio-match-draft">제작 조건</label>
                  <textarea id="studio-match-draft" value={draft} maxLength={4000} rows={3}
                    onChange={event => setDraft(event.target.value)} />
                  <span aria-live="polite">{draftQuantity ? `총 ${draftQuantity.toLocaleString("ko-KR")}장` : "제작할 총수량을 입력해 주세요."}</span>
                  <button type="submit" disabled={!draft.trim()}>이 조건으로 다시 추천받기</button>
                </form>
              </details>
              )}
              <header>
                <h2>추천 봉제공장</h2>
                {matches !== null && <span role="status">{!analyzingMatches && `${candidates.length}곳`}</span>}
              </header>
              <div className="studio-match-body">
                {analyzingMatches && (
                  <div className="studio-match-analysis" role="status">
                    <p>{matchPhase === "compare" ? "제작 조건과 공장 정보를 대조하고 있어요." : "조건에 맞는 추천 업체를 추리고 있어요."}</p>
                    <i aria-hidden="true" />
                  </div>
                )}
                <div className="studio-match-list" inert={analyzingMatches} aria-busy={analyzingMatches} data-reveal={!analyzingMatches && !shop}>
                  {matches === null ? (
                    <div className="studio-match-status" role="alert">
                      공장 목록을 불러오지 못했어요. <a href={`/studio?view=matches&prompt=${encodeURIComponent(withSheet ? demoProductUrl + " " + request : request)}`}>다시 불러오기</a>
                    </div>
                  ) : !candidates.length && (
                    <div className="studio-match-status">이 조건으로 추천할 업체를 찾지 못했어요.
                      {withSheet ? <button className="studio-text-button" onClick={() => {
                        if (!editor.current) return;
                        editor.current.open = true;
                        editor.current.querySelector("textarea")?.focus();
                      }}>제작 조건 바꾸기</button> : <Link href={`/studio?draft=${encodeURIComponent(request)}`}>조건 수정</Link>}
                    </div>
                  )}
                  {candidates.map((p, i) => (
                    <button
                      className="studio-partner"
                      key={p.id}
                      style={{ "--i": i } as CSSProperties}
                      onClick={() => chooseShop(p)}
                      aria-label={`${p.name} 업체 보기`} aria-describedby={`partner-data-${p.id} partner-reason-${p.id} partner-rating-${p.id}`}
                    >
                      <div className="partner-identity">
                        <div className="studio-mini-photo" style={{ viewTransitionName: `shop-${p.id}` }}>
                          <ShopPhoto shop={p} />
                        </div>
                        <div className="partner-info"><strong style={{ viewTransitionName: `shop-name-${p.id}` }}>{p.name}</strong>
                          <span id={`partner-data-${p.id}`} className="partner-specialty">{p.district} · {p.item}</span>
                        </div>
                      </div>
                      <div className="partner-evidence"><span className="partner-reason" id={`partner-reason-${p.id}`}><RecommendationReason shop={p} /></span>
                      <span className="partner-rating" id={`partner-rating-${p.id}`}>의뢰 적합도 <FitRating stars={p.stars} /></span></div>
                      <span className="partner-open">업체 보기 <ArrowRight size={15} /></span>
                    </button>
                  ))}
                </div>
              </div>
              {candidates.length > 0 && !analyzingMatches && (
                <p className="match-legend">별은 제작 조건과 업체의 등록 품목이 얼마나 잘 맞는지 보여줘요.</p>
              )}
            </div>
          </section>
        )}

        {stage === "factory" && shop && (
          <section className="studio-profile">
            <div className="studio-gallery">
              <div className="profile-photo" style={{ viewTransitionName: `shop-${shop.id}` }}><ShopPhoto shop={shop} index={photo} /></div>
              {shop.photos.length > 1 && (
                <div className="studio-gallery-nav">
                  <button
                    aria-label="이전 등록 사진"
                    onClick={() => setPhoto((photo + shop.photos.length - 1) % shop.photos.length)}
                  >
                    <ChevronLeft />
                  </button>
                  <span>
                    {photo + 1} / {shop.photos.length}
                  </span>
                  <button aria-label="다음 등록 사진" onClick={() => setPhoto((photo + 1) % shop.photos.length)}>
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>
            <div className="factory-info-scroll" role="region" aria-label="업체 상세 정보" tabIndex={0}>
            <div className="studio-profile-info">
              <p className="studio-kicker">
                <MapPin size={15} />
                {shop.district} · 봉제공장
              </p>
              <p>{shop.about}</p>
              <dl className="studio-specs">
                <div>
                  <dt>등록 품목</dt>
                  <dd>{shop.item}</dd>
                </div>
                <div>
                  <dt>이번 의뢰 추천도</dt>
                  <dd><FitRating stars={shop.stars} /></dd>
                </div>
              </dl>
              <p className="studio-proof">
                <Check size={17} />
                <span><RecommendationReason shop={shop} /></span>
              </p>
            </div>
            {!!shop.profile?.length && <section className="factory-registration">
              <h2>업체 등록 정보</h2>
              <dl>{shop.profile.map(({label, value}) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            </section>}
            </div>
            <div className="factory-consult-action">
              <button className="studio-primary" onClick={startChat}>
                <MessageCircle size={18} />
                제작 상담하기
                <ArrowRight />
              </button>
            </div>
          </section>
        )}
        {enteredChat && shop && (
          <div hidden={stage !== "chat"}>
            <Consultation key={shop.id} shop={shop} photoIndex={photo} request={request} onRead={withSheet ? (page = 0) => openZoom(page) : undefined} />
          </div>
        )}
      </div>
      {withSheet && <SheetViewer request={request} dialogRef={zoom} page={zoomPage} setPage={setZoomPage} />}
    </div>
  );
}
