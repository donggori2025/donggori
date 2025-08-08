"use client";
import { useEffect, useState } from "react";
import type { PopupItem } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";

export default function AdminPopupsPage() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<PopupItem>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PopupItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/popups");
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
      const res = await fetch("/api/admin/popups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");
      setForm({});
      await load();
    } catch (e: any) {
      setError(e?.message || "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<PopupItem>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
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
      const res = await fetch(`/api/admin/popups/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      await load();
    } catch (e: any) {
      setError(e?.message || "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: PopupItem) => {
    setEditingItem(item);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    const updatedData = {
      title: editingItem.title,
      content: editingItem.content,
      image_url: editingItem.image_url,
      start_at: editingItem.start_at,
      end_at: editingItem.end_at,
    };
    
    await update(editingItem.id, updatedData);
  };

  const handleFormImagesChange = (images: string[]) => {
    setForm(prev => ({ ...prev, image_url: images[0] || "" }));
  };

  const handleEditImagesChange = (images: string[]) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, image_url: images[0] || "" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-4">팝업 관리</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      
      {/* 등록 폼 */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3">새 팝업 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="제목" value={form.title ?? ""} onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="노출 시작(YYYY-MM-DD)" value={form.start_at ?? ""} onChange={(e)=>setForm(v=>({ ...v, start_at: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="노출 종료(YYYY-MM-DD)" value={form.end_at ?? ""} onChange={(e)=>setForm(v=>({ ...v, end_at: e.target.value }))} />
          <textarea className="md:col-span-2 border rounded px-3 py-2" rows={3} placeholder="내용" value={form.content ?? ""} onChange={(e)=>setForm(v=>({ ...v, content: e.target.value }))} />
        </div>
        
        {/* 이미지 업로드 */}
        <div className="mt-4">
          <ImageUpload
            onImagesChange={handleFormImagesChange}
            currentImages={form.image_url ? [form.image_url] : []}
            multiple={false}
          />
        </div>
        
        <div className="mt-3">
          <button disabled={loading} onClick={submit} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">{loading ? "처리 중..." : "등록"}</button>
        </div>
      </div>

      {/* 팝업 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">등록된 팝업 목록</h2>
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
                    rows={3} 
                    placeholder="내용" 
                    value={editingItem.content ?? ""} 
                    onChange={(e)=>setEditingItem({...editingItem, content: e.target.value})} 
                  />
                </div>
                
                {/* 이미지 업로드 (수정 모드) */}
                <div className="mt-4">
                  <ImageUpload
                    onImagesChange={handleEditImagesChange}
                    currentImages={editingItem.image_url ? [editingItem.image_url] : []}
                    multiple={false}
                  />
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
                  <div className="font-semibold">{item.title || "(제목 없음)"}</div>
                  <div className="text-sm text-gray-600">기간: {item.start_at || "-"} ~ {item.end_at || "-"}</div>
                  <div className="text-sm whitespace-pre-wrap mt-2">{item.content}</div>
                  {item.image_url && (
                    <div className="mt-3">
                      <img 
                        src={item.image_url} 
                        alt="팝업 이미지" 
                        className="w-32 h-24 object-cover rounded border"
                      />
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


