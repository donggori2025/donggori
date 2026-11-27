"use client";

import "@/components/auto-grow-input.css";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, FileText, Layers, Link2, MapPin, Plus, Ruler, Search, X } from "lucide-react";
import { demoPrompt, readDemoRequest } from "@/lib/presentationDemo";

const conditions = [
  { label: "수량", example: "수량 100장", icon: Ruler },
  { label: "원단", example: "면 원단", icon: Layers },
  { label: "지역", example: "장안동", icon: MapPin },
];

const requestExamples = [
  { label: "상품 링크", preview: "이 숏 파카를 참고해서 3컬러 47장을 만들고 싶어요.", text: demoPrompt },
  { label: "제작 조건", preview: "면 반소매 티셔츠 100장을 제작할 공장을 찾고 있어요." },
];

type Props = {
  inputId?: string;
  autoFocus?: boolean;
  showRequestExamples?: boolean;
  initialPrompt?: string;
};

export default function FactoryPrompt({ inputId, autoFocus, showRequestExamples = false, initialPrompt = "" }: Props) {
  const router = useRouter();
  const initial = readDemoRequest(initialPrompt);
  const [link, setLink] = useState(initial?.address ?? "");
  const [prompt, setPrompt] = useState(initial?.request ?? initialPrompt);
  const [editingLink, setEditingLink] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const highlight = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const plus = useRef<HTMLButtonElement>(null);
  const value = [link, prompt.trim()].filter(Boolean).join("\n");
  const attachment = readDemoRequest(value);
  const typedAddress = !link && attachment?.address;
  const addressStart = typedAddress ? prompt.indexOf(typedAddress) : -1;
  function commitLink(text: string) {
    const parsed = !link && readDemoRequest(text);
    if (!parsed) return false;
    setLink(parsed.address);
    setPrompt(parsed.request);
    return true;
  }
  function finishLink(address: string) {
    const next = address.trim();
    if (next && readDemoRequest(next)?.address !== next) {
      setLinkError(true);
      return false;
    }
    setLink(next);
    setEditingLink(false);
    setLinkError(false);
    setInvalidLink(false);
    return true;
  }
  const submitRequest = () => {
    if (editingLink) return;
    if (attachment && !attachment.sample) { setInvalidLink(true); return; }
    if (value) router.push(`/studio?prompt=${encodeURIComponent(value)}`);
  };
  function addCondition(example: string) {
    const value = prompt.trimEnd();
    const existingQuantity = example === "수량 100장" && value.match(/(?:수량\s*)?\d[\d,]*\s*(?:장|벌)/g);
    const selection = existingQuantity && existingQuantity.length === 1 ? existingQuantity[0] : example;
    const next = value.includes(selection) ? value : [value, selection].filter(Boolean).join(", ");
    setPrompt(next);
    setOpen(false);
    requestAnimationFrame(() => {
      field.current?.focus();
      const start = next.lastIndexOf(selection);
      field.current?.setSelectionRange(start, start + selection.length);
    });
  }

  function fillFromExample(text: string) {
    const parsed = readDemoRequest(text);
    setEditingLink(false);
    setLinkError(false);
    setLink(parsed?.address ?? "");
    setPrompt(parsed?.request ?? text);
    setInvalidLink(false);
    field.current?.focus();
    requestAnimationFrame(() => field.current?.setSelectionRange(text.length, text.length));
  }

  return <><form className="dg-composer" onSubmit={event => { event.preventDefault(); submitRequest(); }}>
      {link && <div className="dg-link-chip" title={link}>
        <Link2 size={15} aria-hidden="true" />
        {editingLink ? <input className="dg-chip-input" aria-label="상품 링크 주소" inputMode="url"
          autoFocus defaultValue={link} aria-invalid={linkError} onFocus={event => event.currentTarget.select()}
          onChange={() => setLinkError(false)} onBlur={event => finishLink(event.currentTarget.value)}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter") {
              event.preventDefault();
              if (finishLink(event.currentTarget.value)) requestAnimationFrame(() => field.current?.focus());
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditingLink(false);
              setLinkError(false);
              requestAnimationFrame(() => field.current?.focus());
            }
          }} /> : <button type="button" className="dg-chip-address" aria-label={`상품 링크 수정: ${link}`}
          title="더블클릭하여 주소 수정" onDoubleClick={() => setEditingLink(true)}
          onClick={event => { if (event.detail === 0) setEditingLink(true); }}>
          {link.replace(/^https?:\/\//i, "")}
        </button>}
        <button type="button" aria-label="상품 링크 제거" onClick={() => {
          setLink(""); setEditingLink(false); setLinkError(false); setInvalidLink(false); field.current?.focus();
        }}><X size={14} aria-hidden="true" /></button>
      </div>}
      {linkError && <p role="alert" className="pg-link-error">상품 링크 주소를 확인해 주세요.</p>}
      <div className="dg-prompt-editor">
        <div ref={highlight} className="dg-prompt-highlight" aria-hidden="true">
          {typedAddress && <>{prompt.slice(0, addressStart)}<mark>{typedAddress}</mark>{prompt.slice(addressStart + typedAddress.length)}{"\u200b"}</>}
        </div>
      <textarea id={inputId} ref={field} autoFocus={autoFocus} aria-label="제작 조건 입력" className="auto-grow-input" rows={1} value={prompt}
        placeholder={link ? "제작 조건을 입력해 주세요." : "상품 링크나 제작 조건을 입력해 주세요."}
        onChange={event => {
          const text = event.target.value;
          const input = event.nativeEvent as InputEvent;
          setInvalidLink(false);
          const completed = input.inputType === "insertFromPaste" || /\s$/.test(text);
          if (!input.isComposing && completed && commitLink(text)) return;
          setPrompt(text);
        }}
        onScroll={event => { if (highlight.current) highlight.current.scrollTop = event.currentTarget.scrollTop; }}
        onBlur={event => commitLink(event.currentTarget.value)}
        onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
            event.preventDefault();
            submitRequest();
          }
        }} />
      </div>
      <div className="dg-tools">
        <div className="dg-add" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
          onKeyDown={e => { if (e.key === "Escape") { setOpen(false); plus.current?.focus(); } }}>
          <button type="button" ref={plus} className="dg-plus" aria-label="제작 조건 추가" aria-expanded={open} onClick={() => setOpen(!open)}><Plus size={17}/></button>
          {open && <div className="dg-add-list">{conditions.map(c => <button type="button" key={c.label} onClick={() => addCondition(c.example)}>{c.label} 입력</button>)}</div>}
        </div>
        {conditions.map(({ label, example, icon: Icon }) => <button className="dg-handle" data-added={prompt.includes(example)} key={label} type="button" onClick={() => addCondition(example)}><Icon size={14}/>{label}{prompt.includes(example) && <span aria-label="입력됨">✓</span>}</button>)}
        <button type="submit" className="dg-submit" aria-label={attachment ? "작업지시서 만들기" : "공장 추천받기"} disabled={!value}><Search size={16} aria-hidden="true"/><span>{attachment ? "작업지시서 만들기" : "공장 추천받기"}</span></button>
      </div>
      {invalidLink && !attachment?.sample && <p role="alert" className="pg-link-error">작업지시서 체험은 M-65 파카 링크를 지원해요. {attachment?.request && <button type="button" onClick={() => router.push(`/studio?prompt=${encodeURIComponent(attachment.request)}`)}>입력한 조건으로 공장 찾기</button>}</p>}
    </form>
    {showRequestExamples ? (
      <section className="studio-examples" aria-labelledby="studio-examples-title">
        <h2 id="studio-examples-title">예시 불러오기</h2>
        {requestExamples.map(({ label, preview, text }) => (
          <button type="button" key={label} onClick={() => fillFromExample(text ?? preview)}>
            <strong>{label}</strong><span>{preview}</span><ArrowUpLeft size={16} aria-hidden="true" />
          </button>
        ))}
      </section>
    ) : (
      <button className="pg-demo-example" type="button" onClick={() => fillFromExample(demoPrompt)}>
        <FileText size={15} aria-hidden="true" /> M-65 파카 샘플로 체험하기 <span>링크 넣기</span>
      </button>
    )}
  </>;
}
