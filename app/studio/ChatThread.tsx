"use client";

import "@/components/auto-grow-input.css";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, FileStack, MessageCircle, Paperclip } from "lucide-react";
import { product, sheets } from "./case";
import type { FactoryCard, Speaker, StudioMessage } from "@/lib/studioInquiries";

type Props = {
  name: string; showReplyAvatar?: boolean; subject: string; avatar?: ReactNode; transitionName?: string;
  requestSummary?: string; hint: string; author: Speaker; messages: StudioMessage[]; initialDraft: string; inputLabel: string;
  onSend: (text: string, key: string) => Promise<void>;
  selected?: FactoryCard[];
  onRead?: () => void; canSend?: boolean;
};

export default function ChatThread({ name, showReplyAvatar, subject, avatar, transitionName, author, messages,
  initialDraft, inputLabel, hint, requestSummary, onSend, onRead, selected, canSend = true }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);
  const messageKey = useRef("");
  useEffect(() => {
    messageKey.current = "";
    if (selected?.length) composer.current?.focus({ preventScroll: true });
  }, [selected]);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length]);

  async function send() {
    const text = draft.trim();
    if ((!text && !selected?.length) || pending.current || !canSend) return;
    pending.current = true;
    setSending(true);
    setError("");
    try {
      messageKey.current ||= Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
      await onSend(text, messageKey.current);
      messageKey.current = "";
      setDraft("");
    } catch {
      setError("메시지를 보내지 못했어요. 다시 보내주세요.");
    } finally {
      pending.current = false;
      setSending(false);
    }
  }

  return <section className="studio-thread" aria-label={subject + " 대화"}>
    <header>
      <span className="studio-avatar" style={{ viewTransitionName: transitionName }}>{avatar ?? <MessageCircle size={20} />}</span>
      <strong style={{ viewTransitionName: transitionName?.replace("shop-", "shop-name-") }}>{name}</strong><span>{subject}</span>
    </header>
    <div className="studio-log" ref={log} role="log" aria-live="polite">
      <div className="studio-order-message" data-own={author === "designer"}>
      {(onRead || requestSummary) && <small>{author === "designer" ? "나" : name}</small>}
      {onRead && <button className="studio-attachment" onClick={onRead}>
        <FileStack size={22} /><span><strong>{product}</strong>작업지시서 · {sheets.length}장</span><Paperclip size={16} />
      </button>}
      {requestSummary && <div className="studio-chat-brief"><strong>내 제작 조건</strong><p>{requestSummary}</p></div>}
      </div>
      {messages.map(m => <div className="studio-exchange" data-own={m.author === author} key={m.id}>
        {m.author === author || !showReplyAvatar ? <small>{m.author === author ? "나" : name}</small> : <span className="studio-avatar" aria-label={name} role="img">{avatar ?? <MessageCircle size={20} />}</span>}
        <p className={m.author === author ? "studio-bubble mine" : "studio-bubble"}>{m.text}</p>
        {m.cards?.map(card => <a key={card.id} className="inquiry-factory-card" href={`/factories/${encodeURIComponent(card.id)}`}>
          <div className="sent-factory-head">{card.photo && <img src={card.photo} alt="" loading="lazy"/>}
            <div><small>{card.district} · {card.item}</small><strong>{card.name}</strong></div></div>
          <span>{card.reason}</span><b>업체 상세 보기 <span aria-hidden="true">→</span></b>
        </a>)}
      </div>)}
    </div>
      {author === "designer" && !messages.length && <div className="studio-questions" aria-label="문의에 추가할 질문">
        {["샘플 비용은 얼마인가요?", "예상 납기는 언제인가요?"].map(question =>
          <button key={question} type="button" disabled={draft.includes(question) || draft.length + question.length + 1 > 2000}
            onClick={() => {
              setDraft(current => [current.trimEnd(), question].filter(Boolean).join("\n"));
              messageKey.current = "";
              composer.current?.focus();
            }}>{question}</button>)}
      </div>}
    {hint && <p className="studio-chat-hint" role="status">{hint}</p>}
    {Boolean(selected?.length) && <div className="inquiry-pick-action" aria-live="polite" aria-label="전송할 추천 카드">
      {selected?.map(card => <div className="attachment-preview" key={card.id}>
        {card.photo ? <img src={card.photo} alt=""/> : <Paperclip size={16}/>}
        <div><strong>{card.name}</strong><span title={card.reason}>{card.reason}</span></div>
      </div>)}</div>}
    {canSend && <form className="studio-message" onSubmit={e => { e.preventDefault(); void send(); }}>
      <textarea ref={composer} aria-label={inputLabel} placeholder={inputLabel} className="auto-grow-input" rows={1} maxLength={2000}
        value={draft} readOnly={sending} onChange={e => { messageKey.current = ""; setDraft(e.target.value); }}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
            e.preventDefault(); void send();
          }
        }} />
      <button type="submit" aria-label="문의 보내기" disabled={sending || (!draft.trim() && !selected?.length)}><ArrowUp size={16} />{sending ? "보내는 중" : "보내기"}</button>
    </form>}
    {error && <p role="alert" className="studio-send-error">{error}</p>}
  </section>;
}
