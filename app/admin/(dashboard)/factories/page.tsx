"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import FactoryEditDrawer from "@/components/admin/FactoryEditDrawer";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminInput,
  AdminPageHeader,
  AdminSearchInput,
  AdminTextarea,
} from "@/components/admin/admin-ui";
import { Factory, ColumnSchema, FactoryForm } from "@/lib/types";
import { adminFetch } from "@/lib/adminFetch";
import {
  FACTORY_FIELD_SECTIONS,
  IMAGE_FACTORY_FIELDS,
  LONG_TEXT_FACTORY_FIELDS,
  READONLY_FACTORY_FIELDS,
  getFactoryFieldLabel,
} from "@/lib/factoryAdminFields";

export default function AdminFactoriesPage() {
  const [items, setItems] = useState<Factory[]>([]);
  const [filteredItems, setFilteredItems] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FactoryForm>({});
  const [columns, setColumns] = useState<ColumnSchema[]>([]);
  const [selected, setSelected] = useState<Factory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSelected, setOriginalSelected] = useState<Factory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, schemaRes] = await Promise.all([
        adminFetch("/api/admin/factories"),
        adminFetch("/api/admin/factories/schema"),
      ]);
      const listJson = listRes.ok
        ? await listRes.json().catch(() => ({ success: false, error: `목록 응답 파싱 실패(${listRes.status})` }))
        : { success: false, error: `목록 요청 실패(${listRes.status})` };
      const schemaJson = schemaRes.ok
        ? await schemaRes.json().catch(() => ({ success: false, error: `스키마 응답 파싱 실패(${schemaRes.status})` }))
        : { success: false, error: `스키마 요청 실패(${schemaRes.status})` };

      if (!listRes.ok || !listJson.success) throw new Error(listJson.error || "목록 불러오기 실패");
      if (!schemaRes.ok || !schemaJson.success) throw new Error(schemaJson.error || "스키마 불러오기 실패");

      setItems(listJson.data || []);
      setFilteredItems(listJson.data || []);
      setColumns(schemaJson.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredItems(
      items.filter(
        (item) =>
          item.company_name?.toLowerCase().includes(q) ||
          item.address?.toLowerCase().includes(q) ||
          item.business_type?.toLowerCase().includes(q) ||
          item.contact_name?.toLowerCase().includes(q) ||
          item.phone_number?.toString().includes(q)
      )
    );
  }, [searchTerm, items]);

  useEffect(() => {
    if (!selected || !originalSelected) {
      setHasChanges(false);
      return;
    }
    setHasChanges(JSON.stringify(selected) !== JSON.stringify(originalSelected));
  }, [selected, originalSelected]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = Object.fromEntries(Object.entries(form).filter(([k]) => !k.startsWith("__")));
      if (Object.keys(formData).length === 0) {
        setError("등록할 데이터가 없습니다.");
        return;
      }
      const res = await adminFetch("/api/admin/factories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");
      setForm({});
      setShowCreateForm(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: FactoryForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/factories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(Object.entries(patch).filter(([k]) => !k.startsWith("__")))),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "수정 실패");
      await load();
      closeDrawer();
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
      const res = await adminFetch(`/api/admin/factories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: Factory) => {
    setSelected(item);
    setOriginalSelected(JSON.parse(JSON.stringify(item)));
    setHasChanges(false);
  };

  const closeDrawer = () => {
    setSelected(null);
    setOriginalSelected(null);
    setHasChanges(false);
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setSelected((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveChanges = () => {
    if (!selected) return;
    const formData = Object.fromEntries(Object.entries(selected).filter(([k]) => !k.startsWith("__")));
    update(selected.id, formData as FactoryForm);
  };

  const handleCancelChanges = () => {
    setSelected(originalSelected);
    setHasChanges(false);
  };

  const renderCreateField = (columnName: string) => {
    if (IMAGE_FACTORY_FIELDS.has(columnName)) {
      return (
        <div key={columnName} className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2">{getFactoryFieldLabel(columnName)}</p>
          <ImageUpload
            onImagesChange={(images) => setForm((v) => ({ ...v, images }))}
            currentImages={Array.isArray(form.images) ? form.images : []}
            multiple
          />
        </div>
      );
    }
    if (READONLY_FACTORY_FIELDS.has(columnName)) return null;

    const label = getFactoryFieldLabel(columnName);
    const value = String((form as Record<string, unknown>)[columnName] ?? "");

    if (LONG_TEXT_FACTORY_FIELDS.has(columnName)) {
      return (
        <AdminTextarea
          key={columnName}
          label={label}
          value={value}
          rows={3}
          onChange={(e) => setForm((v) => ({ ...v, [columnName]: e.target.value }))}
        />
      );
    }

    return (
      <AdminInput
        key={columnName}
        label={label}
        value={value}
        onChange={(e) => setForm((v) => ({ ...v, [columnName]: e.target.value }))}
      />
    );
  };

  const createFieldsBySection = FACTORY_FIELD_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.filter(
      (f) => columns.some((c) => c.column_name === f) && !READONLY_FACTORY_FIELDS.has(f)
    ),
  })).filter((s) => s.fields.length > 0);

  return (
    <>
      <AdminPageHeader
        title="업장 관리"
        description="봉제공장 정보를 등록하고 수정합니다."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              disabled={loading}
              onClick={async () => {
                setError(null);
                try {
                  const res = await adminFetch("/api/admin/factories/export");
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    throw new Error(json.error || "CSV 다운로드 실패");
                  }
                  const blob = await res.blob();
                  const disposition = res.headers.get("Content-Disposition") || "";
                  const match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
                  const filename = match ? decodeURIComponent(match[1]) : "동고리_업장목록.csv";
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : "CSV 다운로드 실패");
                }
              }}
            >
              CSV 추출
            </AdminButton>
            <AdminButton onClick={() => setShowCreateForm((v) => !v)}>
              {showCreateForm ? "등록 폼 닫기" : "+ 새 업장 등록"}
            </AdminButton>
          </div>
        }
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      {showCreateForm && (
        <AdminCard title="새 업장 등록" className="mb-8">
          <div className="space-y-8">
            {createFieldsBySection.map((section) => (
              <section key={section.title}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(renderCreateField)}
                </div>
              </section>
            ))}
            <AdminButton onClick={submit} disabled={loading} className="w-full sm:w-auto">
              {loading ? "처리 중..." : "업장 등록"}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="업장명, 주소, 업종으로 검색..."
        />
        <span className="text-sm text-gray-500">{filteredItems.length}개 업장</span>
      </div>

      {loading && items.length === 0 ? (
        <AdminEmpty message="불러오는 중..." />
      ) : filteredItems.length === 0 ? (
        <AdminEmpty message={searchTerm ? "검색 결과가 없습니다." : "등록된 업장이 없습니다."} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const images = item.images || [];
            const hasImage = typeof item.image === "string" ? item.image : "";
            const displayImages = [...images];
            if (hasImage && !displayImages.includes(hasImage)) displayImages.unshift(hasImage);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {displayImages[0] && (
                  <div className="h-36 bg-gray-100 overflow-hidden">
                    <img src={displayImages[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.company_name || "업장명 없음"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.address || "주소 없음"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.business_type && <AdminBadge>{item.business_type}</AdminBadge>}
                    {item.moq && <AdminBadge tone="info">MOQ {item.moq}</AdminBadge>}
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    {item.contact_name && <div>담당: {item.contact_name}</div>}
                    {item.phone_number && <div>{item.phone_number}</div>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <AdminButton className="flex-1" onClick={() => handleSelectItem(item)}>
                      정보 수정
                    </AdminButton>
                    <AdminButton variant="secondary" className="flex-1" onClick={() => remove(item.id)}>
                      삭제
                    </AdminButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <FactoryEditDrawer
          factory={selected}
          columns={columns}
          open={!!selected}
          hasChanges={hasChanges}
          loading={loading}
          onClose={closeDrawer}
          onSave={handleSaveChanges}
          onCancelChanges={handleCancelChanges}
          onFieldChange={handleFieldChange}
        />
      )}
    </>
  );
}
