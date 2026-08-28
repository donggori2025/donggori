"use client";
import { useEffect, useState } from "react";
import type { NoticeItem, NoticeCategory } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import { adminFetch } from "@/lib/adminFetch";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
  AdminToggle,
} from "@/components/admin/admin-ui";

const CATEGORIES: NoticeCategory[] = ["공지", "일반", "채용공고"];

export default function AdminNoticesPage() {
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<NoticeItem>>({ category: "일반", is_active: true });
  const [addToPopup, setAddToPopup] = useState(false);
  const [editingAddToPopup, setEditingAddToPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/notices");
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
      const res = await adminFetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");

      if (addToPopup) {
        const popupRes = await adminFetch("/api/admin/popups", {
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

      setForm({ category: "일반", is_active: true });
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
      const res = await adminFetch(`/api/admin/notices/${id}`, {
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
      const res = await adminFetch(`/api/admin/notices/${id}`, { method: "DELETE" });
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
      is_active: editingItem.is_active,
    };
    
    await update(editingItem.id, updatedData);

    if (editingAddToPopup) {
      try {
        const popupRes = await adminFetch("/api/admin/popups", {
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
    <>
      <AdminPageHeader title="공지 관리" description="공지사항을 등록하고 수정합니다." />
      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminCard title="새 공지 등록" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="제목" value={form.title ?? ""} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">카테고리</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              value={form.category ?? "일반"}
              onChange={(e) => setForm((v) => ({ ...v, category: e.target.value as NoticeCategory }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <AdminInput label="노출 시작" placeholder="YYYY-MM-DD" value={form.start_at ?? ""} onChange={(e) => setForm((v) => ({ ...v, start_at: e.target.value }))} />
          <AdminInput label="노출 종료" placeholder="YYYY-MM-DD" value={form.end_at ?? ""} onChange={(e) => setForm((v) => ({ ...v, end_at: e.target.value }))} />
          <AdminTextarea label="내용" className="md:col-span-2" rows={4} value={form.content ?? ""} onChange={(e) => setForm((v) => ({ ...v, content: e.target.value }))} />
        </div>
        <div className="mt-5">
          <ImageUpload onImagesChange={handleFormImagesChange} currentImages={form.image_urls || []} multiple />
        </div>
        <div className="mt-5">
          <AdminToggle checked={form.is_active !== false} onChange={(is_active) => setForm((v) => ({ ...v, is_active }))} label="노출 활성화" />
        </div>
        <div className="mt-5">
          <AdminToggle checked={addToPopup} onChange={setAddToPopup} label="팝업에도 추가" />
        </div>
        <div className="mt-6">
          <AdminButton onClick={submit} disabled={loading}>{loading ? "처리 중..." : "공지 등록"}</AdminButton>
        </div>
      </AdminCard>

      <h2 className="text-base font-semibold text-gray-900 mb-4">등록된 공지 ({items.length})</h2>
      {loading && items.length === 0 ? (
        <AdminEmpty message="불러오는 중..." />
      ) : items.length === 0 ? (
        <AdminEmpty message="등록된 공지가 없습니다." />
      ) : (
      <div className="space-y-4">
        {items.map(item => (
          <AdminCard key={item.id}>
            {editingItem?.id === item.id ? (
              <div className="space-y-4 -m-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInput label="제목" value={editingItem.title ?? ""} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">카테고리</span>
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      value={editingItem.category ?? "일반"}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as NoticeCategory })}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <AdminInput label="노출 시작" value={editingItem.start_at ?? ""} onChange={(e) => setEditingItem({ ...editingItem, start_at: e.target.value })} />
                  <AdminInput label="노출 종료" value={editingItem.end_at ?? ""} onChange={(e) => setEditingItem({ ...editingItem, end_at: e.target.value })} />
                  <AdminTextarea label="내용" className="md:col-span-2" rows={4} value={editingItem.content ?? ""} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} />
                </div>
                <ImageUpload onImagesChange={handleEditImagesChange} currentImages={editingItem.image_urls || []} multiple />
                <AdminToggle checked={editingItem.is_active !== false} onChange={(is_active) => setEditingItem({ ...editingItem, is_active })} label="노출 활성화" />
                <AdminToggle checked={editingAddToPopup} onChange={setEditingAddToPopup} label="팝업에도 추가" />
                <div className="flex gap-2">
                  <AdminButton onClick={saveEdit} disabled={loading}>{loading ? "저장 중..." : "저장"}</AdminButton>
                  <AdminButton variant="secondary" onClick={cancelEdit}>취소</AdminButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 -m-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <AdminBadge>{item.category}</AdminBadge>
                    {item.is_active === false && <AdminBadge tone="warning">비노출</AdminBadge>}
                  </div>
                  <div className="text-sm text-gray-500">기간: {item.start_at || "—"} ~ {item.end_at || "—"}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{item.content}</div>
                  {item.image_urls && item.image_urls.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {item.image_urls.map((imageUrl, index) => (
                        <img key={index} src={imageUrl} alt="" className="w-24 h-20 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <AdminButton variant="secondary" onClick={() => startEdit(item)}>수정</AdminButton>
                  <AdminButton variant="danger" onClick={() => remove(item.id)}>삭제</AdminButton>
                </div>
              </div>
            )}
          </AdminCard>
        ))}
      </div>
      )}
    </>
  );
}
