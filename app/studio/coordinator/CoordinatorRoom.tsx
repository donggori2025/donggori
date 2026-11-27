"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Expand, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrderArtwork from "../OrderArtwork";
import { demoProductUrl, parkaOrder } from "@/lib/presentationDemo";
import FactoryPicker from "./FactoryPicker";
import "./factory-picker.css";
import type { FactoryCard, Speaker, StudioMessage } from "@/lib/studioInquiries";
import { product, sheets } from "../case";
import RoomPanels from "../RoomPanels";
import ChatThread from "../ChatThread";
import SheetViewer from "../SheetViewer";
import RefreshInbox from "./RefreshInbox";
import { openStaffInquiry, sendStudioMessage } from "./actions";

type Props = { id: string; author: Speaker; messages: StudioMessage[]; request: string; opened: boolean; topic?: string };

export default function CoordinatorRoom({ id, author, messages, request, opened, topic }: Props) {
  const staff = author === "coordinator";
  const subject = topic ? "제작 상담" : "작업지시서 상담";
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const order = parkaOrder(request);
  const breakdown = order.text.match(/^(\d+컬러)\s*총\s*[\d,]+장\s*\(([^)]+)\)$/);
  const lastQuestion = [...messages].reverse().find(m => m.author === "designer")?.text ?? "";
  const [selected, setSelected] = useState<FactoryCard[]>([]);
  const [sheet, setSheet] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);
  const dialog = useRef<HTMLDialogElement>(null);
  const board = useRef<HTMLElement>(null);
  const back = staff ? "/admin/coordinator" : topic ? `/studio?view=matches&prompt=${encodeURIComponent(request)}` : `/studio?view=sheet&consultation=${id}&prompt=${encodeURIComponent(demoProductUrl + "\n" + request)}`;
  function showAttachment() {
    setSheet(0);
    if (window.matchMedia("(max-width:680px)").matches) { dialog.current?.showModal(); return; }
    board.current?.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    board.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "instant" : "smooth" });
    if (!reduced) board.current?.animate([{ boxShadow: "0 0 0 3px #81b5ff" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 650 });
  }
  useEffect(() => {
    if (staff && !opened) void openStaffInquiry(id).then(() => router.refresh()).catch(() => {});
  }, [id, staff, opened, router]);

  return <div className="studio studio-consult" data-room>
    <RefreshInbox />
    <div className="studio-inner site-wide">
      <Link className="studio-text-button" href={back}><ArrowLeft size={16} />{staff ? "문의 목록" : topic ? "추천 업체" : "완성된 작업지시서"}</Link>
      <header className="studio-heading"><h1 ref={heading} tabIndex={-1}>{staff ? subject : "코디네이터와 상담"}</h1></header>
      <RoomPanels coordinator>
        <ChatThread name={staff ? "제작 의뢰인" : "동고리 코디네이터"} requestSummary={staff ? undefined : topic ? request : parkaOrder(request).text} subject={subject} author={author}
          showReplyAvatar={!staff} avatar={staff ? <UserRound size={20} /> : <img src="/donggori-symbol.png" alt="" />} messages={messages}
          inputLabel={staff ? "의뢰인에게 보낼 답변" : "코디네이터에게 보낼 문의"}
          hint={staff ? "의뢰인의 제작 조건과 첨부 자료를 확인하고 답변해 주세요." : messages.length ? (opened ? "코디네이터가 열람했어요." : "") : "첫 문의를 보내면 코디네이터에게 접수됩니다."}
          initialDraft={staff || messages.length ? "" : `${topic ? request : parkaOrder(request).text}\n샘플 제작과 공장 선정에 대해 상담받고 싶어요.`}
          selected={selected}
          onRead={topic ? undefined : showAttachment}
          onSend={async (text, key) => {
            setSending(true);
            try {
              if (!await sendStudioMessage(id, author, key, text, selected.map(({ id, reason }) => ({ id, reason })))) throw new Error("전송 실패");
              setSelected([]);
              router.refresh();
            } finally { setSending(false); }
          }} />
        {topic ? <aside className="studio-context studio-request-summary" aria-label="제작 조건">
          <p className="studio-kicker">제작 조건</p><h2>{topic}</h2><p>{request}</p>
        </aside> : <section className="studio-board studio-consult-board" ref={board} tabIndex={-1} aria-label="첨부 작업지시서">
          <header><div><small>첨부 작업지시서 · <a href={demoProductUrl} target="_blank" rel="noreferrer">무신사 상품 원본 ↗</a></small><h2>{product}</h2></div>
            <button onClick={() => dialog.current?.showModal()} aria-label="작업지시서 크게 보기"><Expand size={16} />{staff && <span className="room-expand-label">원본 보기</span>}</button>
          </header>
          {staff ? <div className="studio-order-note room-quantity"><strong>{[breakdown?.[1], order.quantity && `총 ${order.quantity.toLocaleString("ko-KR")}장`].filter(Boolean).join(" · ") || "제작 요청"}</strong>
            <span>{breakdown ? breakdown[2].replaceAll(", ", " / ") : order.text}</span></div>
            : <p className="studio-order-note">제작 요청 · {order.text}</p>}
          <div className="studio-consult-tabs" aria-label="작업지시서 페이지 선택">{sheets.map((item, i) =>
            <button key={item.file} aria-pressed={i === sheet} onClick={() => setSheet(i)}>{item.title}</button>)}</div>
          <button className="studio-consult-paper" onClick={() => dialog.current?.showModal()} aria-label={sheets[sheet].title + " 원본 열기"}>
            <OrderArtwork key={sheet} request={request} page={sheet} />
          </button>
          <footer><span>{sheets[sheet].title}</span><b>0{sheet + 1} / 0{sheets.length}</b></footer>
        </section>}
        {staff && <FactoryPicker id={id} lastQuestion={lastQuestion} request={topic ? request : parkaOrder(request).text}
          initial={selected} busy={sending} onApply={setSelected} />}
      </RoomPanels>
      {!topic && <SheetViewer request={request} dialogRef={dialog} page={sheet} setPage={setSheet} />}
    </div>
  </div>;
}
