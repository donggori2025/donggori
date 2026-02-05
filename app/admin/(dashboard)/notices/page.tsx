"use client";
import { useEffect, useState } from "react";
import type { NoticeItem, NoticeCategory } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES: NoticeCategory[] = ["공지", "일반", "채용공고"];

export default function AdminNoticesPage() {
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<NoticeItem>>({ category: "일반" });
  const [addToPopup, setAddToPopup] = useState(false);
  const [editingAddToPopup, setEditingAddToPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notices");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "불러오기 실패");
      setItems(json.data || []);
    } catch (e: any) {
      setError(e?.message || "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");

      if (addToPopup) {
        const popupRes = await fetch("/api/admin/popups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title ?? "",
            content: form.content ?? null,
            image_url: form.image_urls?.[0] ?? null,
            start_at: form.start_at ?? null,
            end_at: form.end_at ?? null,
          }),
        });
        const popupJson = await popupRes.json();
        if (!popupRes.ok || !popupJson.success) {
          setError("공지는 등록되었으나 팝업 추가에 실패했습니다: " + (popupJson.error || popupRes.statusText));
        }
      }

      setForm({ category: "일반" });
      setAddToPopup(false);
      await load();
    } catch (e: any) {
      setError(e?.message || "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<NoticeItem>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "수정 실패");
      setEditingItem(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      await load();
    } catch (e: any) {
      setError(e?.message || "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: NoticeItem) => {
    setEditingItem(item);
    setEditingAddToPopup(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingAddToPopup(false);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    const updatedData = {
      title: editingItem.title,
      content: editingItem.content,
      category: editingItem.category,
      image_urls: editingItem.image_urls,
      start_at: editingItem.start_at,
      end_at: editingItem.end_at,
    };
    
    await update(editingItem.id, updatedData);

    if (editingAddToPopup) {
      try {
        const popupRes = await fetch("/api/admin/popups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingItem.title ?? "",
            content: editingItem.content ?? null,
            image_url: editingItem.image_urls?.[0] ?? null,
            start_at: editingItem.start_at ?? null,
            end_at: editingItem.end_at ?? null,
          }),
        });
        const popupJson = await popupRes.json();
        if (!popupRes.ok || !popupJson.success) {
          setError("공지 수정은 완료되었으나 팝업 추가에 실패했습니다: " + (popupJson.error || popupRes.statusText));
        }
      } catch {
        setError("공지 수정은 완료되었으나 팝업 추가에 실패했습니다.");
      }
    }
    setEditingAddToPopup(false);
  };

  const handleFormImagesChange = (images: string[]) => {
    setForm(prev => ({ ...prev, image_urls: images }));
  };

  const handleEditImagesChange = (images: string[]) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, image_urls: images });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-4">공지 관리</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      
      {/* 등록 폼 */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3 mb-6">
        <h2 className="text-lg font-semibold mb-3">새 공지 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="제목" value={form.title ?? ""} onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))} />
          <select className="border rounded px-3 py-2" value={form.category ?? "일반"} onChange={(e)=>setForm(v=>({ ...v, category: e.target.value as NoticeCategory }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border rounded px-3 py-2" placeholder="노출 시작(YYYY-MM-DD)" value={form.start_at ?? ""} onChange={(e)=>setForm(v=>({ ...v, start_at: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="노출 종료(YYYY-MM-DD)" value={form.end_at ?? ""} onChange={(e)=>setForm(v=>({ ...v, end_at: e.target.value }))} />
          <textarea className="md:col-span-2 border rounded px-3 py-2" rows={4} placeholder="내용" value={form.content ?? ""} onChange={(e)=>setForm(v=>({ ...v, content: e.target.value }))} />
        </div>
        
        {/* 이미지 업로드 */}
        <div className="mt-4">
          <ImageUpload
            onImagesChange={handleFormImagesChange}
            currentImages={form.image_urls || []}
            multiple={true}
          />
        </div>

        {/* 팝업에도 추가 토글 */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            role="switch"
            aria-checked={addToPopup}
            onClick={() => setAddToPopup((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              addToPopup ? "bg-black" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                addToPopup ? "translate-x-5" : "translate-x-1"
              }`}
              style={{ marginTop: 2 }}
            />
          </button>
          <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setAddToPopup((v) => !v)}>
            팝업에도 추가
          </label>
        </div>
        
        <button disabled={loading} onClick={submit} className="mt-3 bg-black text-white rounded px-4 py-2 disabled:opacity-50">{loading ? "처리 중..." : "등록"}</button>
      </div>

      {/* 공지 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">등록된 공지 목록</h2>
        {items.map(item => (
          <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm">
            {editingItem?.id === item.id ? (
              // 수정 모드
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    className="border rounded px-3 py-2" 
                    placeholder="제목" 
                    value={editingItem.title ?? ""} 
                    onChange={(e)=>setEditingItem({...editingItem, title: e.target.value})} 
                  />
                  <select 
                    className="border rounded px-3 py-2" 
                    value={editingItem.category ?? "일반"} 
                    onChange={(e)=>setEditingItem({...editingItem, category: e.target.value as NoticeCategory})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    className="border rounded px-3 py-2" 
                    placeholder="노출 시작(YYYY-MM-DD)" 
                    value={editingItem.start_at ?? ""} 
                    onChange={(e)=>setEditingItem({...editingItem, start_at: e.target.value})} 
                  />
                  <input 
                    className="border rounded px-3 py-2" 
                    placeholder="노출 종료(YYYY-MM-DD)" 
                    value={editingItem.end_at ?? ""} 
                    onChange={(e)=>setEditingItem({...editingItem, end_at: e.target.value})} 
                  />
                  <textarea 
                    className="md:col-span-2 border rounded px-3 py-2" 
                    rows={4} 
                    placeholder="내용" 
                    value={editingItem.content ?? ""} 
                    onChange={(e)=>setEditingItem({...editingItem, content: e.target.value})} 
                  />
                </div>
                
                {/* 이미지 업로드 (수정 모드) */}
                <div className="mt-4">
                  <ImageUpload
                    onImagesChange={handleEditImagesChange}
                    currentImages={editingItem.image_urls || []}
                    multiple={true}
                  />
                </div>

                {/* 수정 시 팝업에도 추가 토글 */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingAddToPopup}
                    onClick={() => setEditingAddToPopup((v) => !v)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                      editingAddToPopup ? "bg-black" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                        editingAddToPopup ? "translate-x-5" : "translate-x-1"
                      }`}
                      style={{ marginTop: 2 }}
                    />
                  </button>
                  <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setEditingAddToPopup((v) => !v)}>
                    팝업에도 추가
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    disabled={loading} 
                    onClick={saveEdit} 
                    className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
                  >
                    {loading ? "저장 중..." : "저장"}
                  </button>
                  <button 
                    onClick={cancelEdit} 
                    className="bg-gray-500 text-white rounded px-4 py-2"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-semibold">[{item.category}] {item.title}</div>
                  <div className="text-sm text-gray-600">기간: {item.start_at || "-"} ~ {item.end_at || "-"}</div>
                  <div className="text-sm whitespace-pre-wrap mt-2">{item.content}</div>
                  {item.image_urls && item.image_urls.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-2">첨부 이미지:</div>
                      <div className="flex gap-2 flex-wrap">
                        {item.image_urls.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={imageUrl} 
                            alt={`공지 이미지 ${index + 1}`} 
                            className="w-24 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    className="border rounded px-3 py-1 bg-blue-50 hover:bg-blue-100" 
                    onClick={() => startEdit(item)}
                  >
                    수정
                  </button>
                  <button 
                    className="border rounded px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600" 
                    onClick={() => remove(item.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
