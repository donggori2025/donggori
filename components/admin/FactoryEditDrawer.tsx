"use client";

import ImageUpload from "@/components/ImageUpload";
import FactoryImageManager from "@/components/FactoryImageManager";
import FactoryBlobImageManager from "@/components/FactoryBlobImageManager";
import { Factory, ColumnSchema } from "@/lib/types";
import {
  FACTORY_FIELD_SECTIONS,
  READONLY_FACTORY_FIELDS,
  IMAGE_FACTORY_FIELDS,
  LONG_TEXT_FACTORY_FIELDS,
  getFactoryFieldLabel,
} from "@/lib/factoryAdminFields";
import { AdminBadge, AdminButton, AdminInput, AdminTextarea } from "./admin-ui";

type Props = {
  factory: Factory;
  columns: ColumnSchema[];
  open: boolean;
  hasChanges: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancelChanges: () => void;
  onFieldChange: (field: string, value: unknown) => void;
};

function getSchemaMap(columns: ColumnSchema[]) {
  return new Map(columns.map((c) => [c.column_name, c]));
}

export default function FactoryEditDrawer({
  factory,
  columns,
  open,
  hasChanges,
  loading,
  onClose,
  onSave,
  onCancelChanges,
  onFieldChange,
}: Props) {
  if (!open) return null;

  const schemaMap = getSchemaMap(columns);
  const assignedFields = new Set<string>(FACTORY_FIELD_SECTIONS.flatMap((s) => [...s.fields]));

  const renderField = (fieldName: string) => {
    const schema = schemaMap.get(fieldName);
    if (!schema || IMAGE_FACTORY_FIELDS.has(fieldName)) return null;

    const label = getFactoryFieldLabel(fieldName);
    const value = String((factory as Record<string, unknown>)[fieldName] ?? "");
    const isReadonly = READONLY_FACTORY_FIELDS.has(fieldName);
    const isLong = LONG_TEXT_FACTORY_FIELDS.has(fieldName);

    if (isReadonly) {
      return (
        <AdminInput
          key={fieldName}
          label={label}
          value={value || "—"}
          readOnly
          disabled
          className="opacity-80"
        />
      );
    }

    if (isLong) {
      return (
        <AdminTextarea
          key={fieldName}
          label={label}
          value={value}
          rows={3}
          onChange={(e) => onFieldChange(fieldName, e.target.value)}
        />
      );
    }

    return (
      <AdminInput
        key={fieldName}
        label={label}
        value={value}
        onChange={(e) => onFieldChange(fieldName, e.target.value)}
      />
    );
  };

  const unsectionedFields = columns
    .map((c) => c.column_name)
    .filter((name) => !assignedFields.has(name) && !IMAGE_FACTORY_FIELDS.has(name));

  const images = factory.images || [];
  const hasImage = typeof factory.image === "string" ? factory.image : "";
  const displayImages = [...images];
  if (hasImage && !displayImages.includes(hasImage)) {
    displayImages.unshift(hasImage);
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">업장 정보 수정</p>
            <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
              {factory.company_name || "업장명 없음"}
            </h2>
            {hasChanges && (
              <div className="mt-2">
                <AdminBadge tone="warning">저장되지 않은 변경사항</AdminBadge>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {FACTORY_FIELD_SECTIONS.map((section) => {
            const fields = section.fields.filter((f) => schemaMap.has(f) && !IMAGE_FACTORY_FIELDS.has(f));
            if (fields.length === 0) return null;

            return (
              <section key={section.title}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(renderField)}
                </div>
              </section>
            );
          })}

          {unsectionedFields.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                기타
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unsectionedFields.map(renderField)}
              </div>
            </section>
          )}

          {(schemaMap.has("images") || schemaMap.has("image")) && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                이미지
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">새 이미지 업로드</p>
                  <ImageUpload
                    onImagesChange={(newImages) => {
                      const currentImages = factory.images || [];
                      handleFieldChangeImages(onFieldChange, currentImages, newImages);
                    }}
                    currentImages={[]}
                    multiple
                  />
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Blob 이미지 관리</p>
                  <FactoryBlobImageManager folder={factory.company_name || ""} />
                </div>

                {displayImages.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      등록된 이미지 ({displayImages.length}개)
                    </p>
                    <FactoryImageManager
                      factoryId={factory.id}
                      images={displayImages}
                      onImagesChange={(updatedImages) => onFieldChange("images", updatedImages)}
                      isEditing
                    />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex flex-wrap items-center gap-2 bg-white">
          <AdminButton onClick={onSave} disabled={!hasChanges || loading}>
            {loading ? "저장 중..." : "변경사항 저장"}
          </AdminButton>
          {hasChanges && (
            <AdminButton variant="secondary" onClick={onCancelChanges} disabled={loading}>
              되돌리기
            </AdminButton>
          )}
          <AdminButton variant="ghost" onClick={onClose} disabled={loading}>
            닫기
          </AdminButton>
        </div>
      </aside>
    </>
  );
}

function handleFieldChangeImages(
  onFieldChange: (field: string, value: unknown) => void,
  currentImages: string[],
  newImages: string[]
) {
  onFieldChange("images", [...currentImages, ...newImages]);
}
