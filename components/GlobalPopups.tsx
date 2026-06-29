"use client";
import { useEffect, useMemo, useState } from "react";
import type { PopupItem } from "@/lib/types";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

function normalizeUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function resolveLinkUrl(popup: PopupItem, isMobile: boolean): string | undefined {
  const pc = normalizeUrl(popup.link_url);
  const mobile = normalizeUrl(popup.link_url_mobile);
  if (isMobile && mobile) return mobile;
  return pc || mobile;
}

function openPopupLink(url: string) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}

export default function GlobalPopups() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const cookieKey = useMemo(() => {
    const d = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return `popup_hidden_${ymd}`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setOpen(false);
      return;
    }

    const hidden = typeof window !== 'undefined' ? window.localStorage.getItem(cookieKey) : null;
    if (hidden === '1') {
      setOpen(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/popups');
        const json = await res.json();
        const apiItems = res.ok && json.success ? ((json.data || []) as PopupItem[]) : [];
        const visible = apiItems.filter((item) => item?.id && (item.image_url || item.title || item.content));
        setItems(visible);
        setOpen(visible.length > 0);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cookieKey]);

  useEffect(() => {
    if (open && items.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, items.length]);

  if (!open || loading || items.length === 0) return null;

  const current = items[Math.max(0, Math.min(index, items.length - 1))];
  if (!current) return null;

  const currentLinkUrl = resolveLinkUrl(current, isMobile);
  const imageMaxHeight = current.title || current.content
    ? "calc(90vh - 12rem)"
    : "calc(90vh - 5.5rem)";

  const closeForToday = (remember: boolean) => {
    if (remember && typeof window !== 'undefined') {
      window.localStorage.setItem(cookieKey, '1');
    }
    setOpen(false);
  };

  const handleLinkClick = (url: string) => {
    setOpen(false);
    openPopupLink(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.stopPropagation()}>
      <div
        className="relative flex w-full max-w-[min(700px,90vw)] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/30"
          onClick={()=>{
            const cb = (document.getElementById('remember-today') as HTMLInputElement | null)?.checked;
            closeForToday(Boolean(cb));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const cb = (document.getElementById('remember-today') as HTMLInputElement | null)?.checked;
              closeForToday(Boolean(cb));
            }
          }}
          aria-label="팝업 닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {current.image_url && (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-gray-100">
            {currentLinkUrl ? (
              <button
                type="button"
                className="flex w-full flex-1 min-h-[120px] cursor-pointer items-center justify-center border-0 bg-transparent p-2 transition-opacity hover:opacity-95 active:opacity-90"
                aria-label={current.title ? `${current.title} 바로가기` : "팝업 바로가기"}
                onClick={() => handleLinkClick(currentLinkUrl)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.image_url}
                  alt={current.title || "프로모션"}
                  className="pointer-events-none block h-auto w-auto max-w-[min(700px,calc(90vw-2rem))] select-none object-contain"
                  style={{ maxHeight: imageMaxHeight }}
                  draggable={false}
                />
              </button>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current.image_url}
                alt={current.title || "프로모션"}
                className="block h-auto w-auto max-w-[min(700px,calc(90vw-2rem))] object-contain"
                style={{ maxHeight: imageMaxHeight }}
              />
            )}
          </div>
        )}

        <div className={`shrink-0 border-t border-gray-100 px-6 py-4 ${current.title || current.content ? "space-y-3" : ""}`}>
          {current.title && <div className="text-xl font-bold text-gray-900">{current.title}</div>}
          {current.content && <div className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{current.content}</div>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input id="remember-today" type="checkbox" className="h-4 w-4 rounded" onChange={()=>{}} />
              <label htmlFor="remember-today">오늘 하루 보지 않기</label>
            </div>
            {items.length > 1 && (
              <div className="flex items-center gap-3">
                <button 
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={index === 0} 
                  onClick={()=>setIndex(i=>Math.max(0, i-1))}
                  aria-label="이전 팝업"
                >
                  이전
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: items.length }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${i === index ? 'bg-gray-800' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
                <button 
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={index >= items.length - 1} 
                  onClick={()=>setIndex(i=>Math.min(items.length-1, i+1))}
                  aria-label="다음 팝업"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
