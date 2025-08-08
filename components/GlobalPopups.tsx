"use client";
import { useEffect, useMemo, useState } from "react";

interface PopupItem {
  id: string;
  title?: string;
  content?: string;
  image_url?: string;
}

export default function GlobalPopups() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const cookieKey = useMemo(() => {
    const d = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return `popup_hidden_${ymd}`;
  }, []);

  useEffect(() => {
    // admin 페이지에서는 팝업을 표시하지 않음
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setOpen(false);
      return;
    }

    // 오늘 하루 보지 않기 체크되었으면 열지 않음
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
        if (res.ok && json.success) {
          setItems(json.data || []);
          setOpen((json.data || []).length > 0);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cookieKey]);

  // 팝업이 열렸을 때 스크롤 방지
  useEffect(() => {
    if (open && items.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, items.length]);

  if (!open || loading || items.length === 0) return null;

  const current = items[Math.max(0, Math.min(index, items.length - 1))];

  const closeForToday = (remember: boolean) => {
    if (remember && typeof window !== 'undefined') {
      window.localStorage.setItem(cookieKey, '1');
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={(e) => e.stopPropagation()}>
      <div className="w-[95vw] max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        {/* X 닫기 버튼 */}
        <button 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors z-10"
          onClick={()=>{
            const cb = (document.getElementById('remember-today') as HTMLInputElement | null)?.checked;
            closeForToday(Boolean(cb));
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {current.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image_url} alt={current.title || ''} className="w-full h-80 object-contain" />
        )}
        <div className="p-6 space-y-3">
          {current.title && <div className="text-xl font-bold text-gray-900">{current.title}</div>}
          {current.content && <div className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{current.content}</div>}
          
          {/* 하단 컨트롤 영역 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input id="remember-today" type="checkbox" className="h-4 w-4 rounded" onChange={()=>{}} />
              <label htmlFor="remember-today">오늘 하루 보지 않기</label>
            </div>
            {/* 팝업이 2개 이상일 때만 네비게이션 표시 */}
            {items.length > 1 && (
              <div className="flex items-center gap-3">
                <button 
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={index === 0} 
                  onClick={()=>setIndex(i=>Math.max(0, i-1))}
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


