"use client";

import { useEffect, useState } from "react";
import type { PopupItem } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import { POPUP_IMAGE_SPEC_LABEL } from "@/lib/popupSpec";
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

function formatPeriod(start?: string, end?: string) {
  const fmt = (v?: string) => (v ? v.slice(0, 10) : "—");
  return `${fmt(start)} ~ ${fmt(end)}`;
}

function isPopupCurrentlyActive(popup: PopupItem) {
  if (popup.is_active === false) return false;
  const now = new Date();
  if (popup.start_at && now < new Date(popup.start_at)) return false;
  if (popup.end_at && now > new Date(popup.end_at)) return false;
  return true;
}

function PopupFormFields({
  values,
  onChange,
}: {
  values: Partial<PopupItem>;
  onChange: (patch: Partial<PopupItem>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminInput
        label="제목"
        placeholder="팝업 제목"
        value={values.title ?? ""}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <AdminInput
        label="노출 순서"
        type="number"
        hint="숫자가 작을수록 먼저 표시"
        value={values.sort_order ?? 0}
        onChange={(e) => onChange({ sort_order: Number(e.target.value) || 0 })}
      />
      <AdminInput
        label="노출 시작"
        placeholder="YYYY-MM-DD"
        value={values.start_at ?? ""}
        onChange={(e) => onChange({ start_at: e.target.value })}
      />
      <AdminInput
        label="노출 종료"
        placeholder="YYYY-MM-DD"
        value={values.end_at ?? ""}
        onChange={(e) => onChange({ end_at: e.target.value })}
      />
      <AdminInput
        label="클릭 시 이동 URL (PC)"
        placeholder="https://..."
        className="md:col-span-2"
        value={values.link_url ?? ""}
        onChange={(e) => onChange({ link_url: e.target.value })}
      />
      <AdminInput
        label="클릭 시 이동 URL (모바일, 선택)"
        placeholder="비우면 PC 링크 사용"
        className="md:col-span-2"
        value={values.link_url_mobile ?? ""}
        onChange={(e) => onChange({ link_url_mobile: e.target.value })}
      />
      <AdminTextarea
        label="내용"
        className="md:col-span-2"
        rows={3}
        value={values.content ?? ""}
        onChange={(e) => onChange({ content: e.target.value })}
      />
      <div className="md:col-span-2">
        <AdminToggle
          checked={values.is_active !== false}
          onChange={(checked) => onChange({ is_active: checked })}
          label="노출 활성화"
        />
      </div>
    </div>
  );
}

export default function AdminPopupsPage() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<PopupItem>>({ is_active: true, sort_order: 0 });
  const [addToNotice, setAddToNotice] = useState(false);
  const [editingAddToNotice, setEditingAddToNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PopupItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/popups");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "불러오기 실패");
      setItems(json.data || []);
      setSelectedIds(new Set());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/popups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");

      if (addToNotice) {
        const noticeRes = await adminFetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title ?? "",
            content: form.content ?? "",
            category: "일반",
            start_at: form.start_at ?? null,
            end_at: form.end_at ?? null,
            image_urls: form.image_url ? [form.image_url] : undefined,
          }),
        });
        const noticeJson = await noticeRes.json();
        if (!noticeRes.ok || !noticeJson.success) {
          setError("팝업은 등록되었으나 공지사항 추가에 실패했습니다: " + (noticeJson.error || noticeRes.statusText));
        }
      }

      setForm({ is_active: true, sort_order: 0 });
      setAddToNotice(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<PopupItem>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/popups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "수정 실패");
      setEditingItem(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/popups/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      if (editingItem?.id === id) setEditingItem(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const removeBulk = async (payload: { ids?: string[]; all?: boolean }) => {
    const count = payload.all ? items.length : payload.ids?.length ?? 0;
    if (count === 0) return;
    const label = payload.all ? `등록된 팝업 ${count}개를 전부` : `선택한 팝업 ${count}개를`;
    if (!confirm(`${label} 삭제하시겠습니까?`)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/popups/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      setEditingItem(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(items.map((item) => item.id)));
    else setSelectedIds(new Set());
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0;

  const saveEdit = async () => {
    if (!editingItem) return;
    await update(editingItem.id, {
      title: editingItem.title,
      content: editingItem.content,
      image_url: editingItem.image_url,
      link_url: editingItem.link_url,
      link_url_mobile: editingItem.link_url_mobile,
      start_at: editingItem.start_at,
      end_at: editingItem.end_at,
      is_active: editingItem.is_active,
      sort_order: editingItem.sort_order,
    });

    if (editingAddToNotice) {
      try {
        const noticeRes = await adminFetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingItem.title ?? "",
            content: editingItem.content ?? "",
            category: "일반",
            start_at: editingItem.start_at ?? null,
            end_at: editingItem.end_at ?? null,
            image_urls: editingItem.image_url ? [editingItem.image_url] : undefined,
          }),
        });
        const noticeJson = await noticeRes.json();
        if (!noticeRes.ok || !noticeJson.success) {
          setError("팝업 수정은 완료되었으나 공지사항 추가에 실패했습니다: " + (noticeJson.error || noticeRes.statusText));
        }
      } catch {
        setError("팝업 수정은 완료되었으나 공지사항 추가에 실패했습니다.");
      }
    }
    setEditingAddToNotice(false);
  };

  return (
    <>
      <AdminPageHeader
        title="팝업 관리"
        description="메인 화면에 노출되는 팝업을 등록·수정·비활성화합니다."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminCard title="새 팝업 등록" className="mb-8">
        <PopupFormFields values={form} onChange={(patch) => setForm((v) => ({ ...v, ...patch }))} />

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 mb-2">{POPUP_IMAGE_SPEC_LABEL}</p>
          <ImageUpload
            onImagesChange={(images) => setForm((v) => ({ ...v, image_url: images[0] || "" }))}
            currentImages={form.image_url ? [form.image_url] : []}
            multiple={false}
          />
        </div>

        <div className="mt-5">
          <AdminToggle checked={addToNotice} onChange={setAddToNotice} label="공지사항에도 추가" />
        </div>

        <div className="mt-6">
          <AdminButton onClick={submit} disabled={loading}>
            {loading ? "처리 중..." : "팝업 등록"}
          </AdminButton>
        </div>
      </AdminCard>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-900">등록된 팝업 ({items.length})</h2>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none mr-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              전체 선택
            </label>
            <AdminButton
              variant="danger"
              disabled={loading || !someSelected}
              onClick={() => removeBulk({ ids: Array.from(selectedIds) })}
            >
              선택 삭제 ({selectedIds.size})
            </AdminButton>
            <AdminButton
              variant="secondary"
              disabled={loading}
              onClick={() => removeBulk({ all: true })}
            >
              전체 삭제
            </AdminButton>
          </div>
        )}
      </div>

      {loading && items.length === 0 ? (
        <AdminEmpty message="불러오는 중..." />
      ) : items.length === 0 ? (
        <AdminEmpty message="등록된 팝업이 없습니다. 페이지를 새로고침하면 기본 팝업이 자동 등록됩니다." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <AdminCard key={item.id}>
              {editingItem?.id === item.id ? (
                <div className="space-y-4 -m-2">
                  <PopupFormFields
                    values={editingItem}
                    onChange={(patch) => setEditingItem({ ...editingItem, ...patch })}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{POPUP_IMAGE_SPEC_LABEL}</p>
                    <ImageUpload
                      onImagesChange={(images) =>
                        setEditingItem({ ...editingItem, image_url: images[0] || "" })
                      }
                      currentImages={editingItem.image_url ? [editingItem.image_url] : []}
                      multiple={false}
                    />
                  </div>
                  <AdminToggle
                    checked={editingAddToNotice}
                    onChange={setEditingAddToNotice}
                    label="공지사항에도 추가"
                  />
                  <div className="flex gap-2">
                    <AdminButton onClick={saveEdit} disabled={loading}>
                      {loading ? "저장 중..." : "저장"}
                    </AdminButton>
                    <AdminButton variant="secondary" onClick={() => setEditingItem(null)}>
                      취소
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 -m-2">
                  <label className="flex items-start pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1 rounded border-gray-300"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => toggleSelect(item.id, e.target.checked)}
                      aria-label={`${item.title || "팝업"} 선택`}
                    />
                  </label>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full sm:w-36 h-28 object-cover rounded-xl border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{item.title || "(제목 없음)"}</span>
                      <AdminBadge tone={isPopupCurrentlyActive(item) ? "success" : "neutral"}>
                        {item.is_active === false ? "비활성" : isPopupCurrentlyActive(item) ? "노출 중" : "기간 외"}
                      </AdminBadge>
                      {item.slug && <AdminBadge tone="info">{item.slug}</AdminBadge>}
                    </div>
                    <p className="text-sm text-gray-500">기간: {formatPeriod(item.start_at, item.end_at)}</p>
                    {item.link_url && (
                      <p className="text-sm text-blue-600 mt-1 truncate">PC 링크: {item.link_url}</p>
                    )}
                    {item.link_url_mobile && (
                      <p className="text-sm text-blue-600 mt-1 truncate">모바일 링크: {item.link_url_mobile}</p>
                    )}
                    {item.content && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3">{item.content}</p>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <AdminButton variant="secondary" onClick={() => setEditingItem(item)}>
                      수정
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => remove(item.id)}>
                      삭제
                    </AdminButton>
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
