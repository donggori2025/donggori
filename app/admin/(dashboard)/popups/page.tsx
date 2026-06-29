"use client";

import { useEffect, useState } from "react";
import type { PopupItem } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import { POPUP_IMAGE_SPEC_LABEL } from "@/lib/popupSpec";
import { adminFetch } from "@/lib/adminFetch";
import { getPromoLinkUrl } from "@/lib/promoPopups";
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

function isStaticPopupActive(popup: PopupItem) {
  const now = new Date();
  if (popup.start_at && now < new Date(popup.start_at)) return false;
  if (popup.end_at && now > new Date(popup.end_at)) return false;
  return true;
}

export default function AdminPopupsPage() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [staticPopups, setStaticPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<PopupItem>>({});
  const [addToNotice, setAddToNotice] = useState(false);
  const [editingAddToNotice, setEditingAddToNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PopupItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/popups");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "불러오기 실패");
      setItems(json.data || []);
      setStaticPopups(json.staticPopups || []);
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

      setForm({});
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
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    await update(editingItem.id, {
      title: editingItem.title,
      content: editingItem.content,
      image_url: editingItem.image_url,
      link_url: editingItem.link_url,
      start_at: editingItem.start_at,
      end_at: editingItem.end_at,
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
        description="메인 화면에 노출되는 팝업을 관리합니다."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      {staticPopups.length > 0 && (
        <AdminCard
          title="코드로 관리되는 팝업"
          description="아래 팝업은 lib/promoPopups.ts 에서 관리됩니다. 관리자에서 수정할 수 없으며, 사이트에는 정상 노출됩니다."
          className="mb-8"
        >
          <div className="space-y-4">
            {staticPopups.map((popup) => {
              const active = isStaticPopupActive(popup);
              const link = getPromoLinkUrl(popup.id, false);
              return (
                <div
                  key={popup.id}
                  className="flex flex-col sm:flex-row gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                >
                  {popup.image_url && (
                    <img
                      src={popup.image_url}
                      alt=""
                      className="w-full sm:w-40 h-28 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{popup.title || popup.id}</span>
                      <AdminBadge tone={active ? "success" : "neutral"}>
                        {active ? "노출 중" : "기간 외"}
                      </AdminBadge>
                      <AdminBadge tone="info">코드 관리</AdminBadge>
                    </div>
                    <p className="text-sm text-gray-500">ID: {popup.id}</p>
                    <p className="text-sm text-gray-500 mt-1">기간: {formatPeriod(popup.start_at, popup.end_at)}</p>
                    {link && (
                      <p className="text-sm text-blue-600 mt-1 truncate">링크: {link}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      <AdminCard title="새 팝업 등록" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="제목"
            placeholder="팝업 제목"
            value={form.title ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
          />
          <AdminInput
            label="노출 시작"
            placeholder="YYYY-MM-DD"
            value={form.start_at ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, start_at: e.target.value }))}
          />
          <AdminInput
            label="노출 종료"
            placeholder="YYYY-MM-DD"
            value={form.end_at ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, end_at: e.target.value }))}
          />
          <AdminInput
            label="클릭 시 이동 URL"
            placeholder="https://..."
            className="md:col-span-2"
            value={form.link_url ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, link_url: e.target.value }))}
          />
          <AdminTextarea
            label="내용"
            className="md:col-span-2"
            rows={3}
            value={form.content ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, content: e.target.value }))}
          />
        </div>

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

      <h2 className="text-base font-semibold text-gray-900 mb-4">DB 등록 팝업 ({items.length})</h2>

      {loading && items.length === 0 ? (
        <AdminEmpty message="불러오는 중..." />
      ) : items.length === 0 ? (
        <AdminEmpty message="DB에 등록된 팝업이 없습니다. 위 폼에서 새 팝업을 등록하세요." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <AdminCard key={item.id}>
              {editingItem?.id === item.id ? (
                <div className="space-y-4 -m-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminInput
                      label="제목"
                      value={editingItem.title ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                    <AdminInput
                      label="노출 시작"
                      value={editingItem.start_at ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, start_at: e.target.value })}
                    />
                    <AdminInput
                      label="노출 종료"
                      value={editingItem.end_at ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, end_at: e.target.value })}
                    />
                    <AdminInput
                      label="클릭 시 이동 URL"
                      className="md:col-span-2"
                      value={editingItem.link_url ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, link_url: e.target.value })}
                    />
                    <AdminTextarea
                      label="내용"
                      className="md:col-span-2"
                      rows={3}
                      value={editingItem.content ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    />
                  </div>
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
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full sm:w-36 h-28 object-cover rounded-xl border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.title || "(제목 없음)"}</div>
                    <p className="text-sm text-gray-500 mt-1">기간: {formatPeriod(item.start_at, item.end_at)}</p>
                    {item.link_url && (
                      <p className="text-sm text-blue-600 mt-1 truncate">링크: {item.link_url}</p>
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
