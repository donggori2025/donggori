"use client";

import { useState } from "react";
import RoomPanels from "./RoomPanels";
import ChatThread from "./ChatThread";
import type { StudioMessage } from "@/lib/studioInquiries";
import FitRating from "./FitRating";
import OrderArtwork from "./OrderArtwork";
import { parkaOrder } from "@/lib/presentationDemo";
import { product, sheets, type Partner } from "./case";


export default function Consultation({ shop, photoIndex, request, onRead }: { shop: Partner; photoIndex: number; request: string; onRead?: (page?: number) => void }) {
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [page, setPage] = useState(0);
  const summary = onRead ? parkaOrder(request).text : request;
  return (
    <RoomPanels>
      <ChatThread name={shop.name} requestSummary={summary} subject="업체 문의 체험" hint={messages.length ? "체험을 완료했어요. 이 문의는 현재 화면에서만 볼 수 있어요." : ""} author="designer" messages={messages}
        avatar={shop.photos[photoIndex] && <img src={shop.photos[photoIndex]} alt="" />} transitionName={`shop-${shop.id}`}
        initialDraft={`안녕하세요. 아래 조건으로 제작을 문의드립니다.\n${summary}\n\n${shop.question}`}
        inputLabel="업체에 보낼 문의" onRead={onRead ? () => onRead(0) : undefined} canSend={!messages.length}
        onSend={async (text, id) => setMessages([{ id, text, author: "designer", at: Date.now() }])} />
      <aside className="studio-context room-resources" aria-label="상담 자료">
        <p className="studio-kicker">상담 자료</p>
        <h3>{onRead ? product : shop.name}</h3>
        {onRead && <>
          <div className="studio-consult-tabs" aria-label="첨부 문서 선택">{sheets.map((sheet, index) =>
            <button type="button" key={sheet.file} aria-pressed={index === page} onClick={() => setPage(index)}>{sheet.title}</button>)}</div>
          <button className="room-preview" onClick={() => onRead(page)} aria-label={sheets[page].title + " 크게 보기"}>
            <OrderArtwork request={request} page={page} />
            <span>크게 보기 ↗</span>
          </button>
        </>}
        <dl className="room-facts">
          <div><dt>제작 요청</dt><dd>{summary}</dd></div>
          <div><dt>상담 업체</dt><dd>{shop.name} · {shop.district}</dd></div>
          <div><dt>등록 품목</dt><dd>{shop.item}</dd></div>
          <div><dt>의뢰 추천도</dt><dd><FitRating stars={shop.stars} /></dd></div>
        </dl>
      </aside>
    </RoomPanels>
  );
}
