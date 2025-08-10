"use client";

import React, { useEffect, useRef, useState } from "react";

type BlobImage = {
  url: string;
  pathname: string;
  size?: number;
  uploadedAt?: string;
};

interface FactoryBlobImageManagerProps {
  folder: string; // Blob prefix (일반적으로 업장명)
}

export default function FactoryBlobImageManager({ folder }: FactoryBlobImageManagerProps) {
  const [images, setImages] = useState<BlobImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadImages = async () => {
    if (!folder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/factories/images?folder=${encodeURIComponent(folder)}`);
      const json = await res.json();
      if (json.success) {
        setImages(json.images || []);
      } else {
        console.warn("이미지 목록 조회 실패:", json.error);
      }
    } catch (e) {
      console.error("이미지 목록 조회 오류", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const onClickUpload = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        const res = await fetch("/api/admin/factories/upload-image", { method: "POST", body: form });
        const json = await res.json();
        if (!json.success) {
          console.warn("업로드 실패:", json.error);
          continue;
        }
      }
      await loadImages();
    } catch (err) {
      console.error("업로드 중 오류", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDelete = async (url: string) => {
    if (!confirm("해당 이미지를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/admin/factories/delete-blob-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (json.success) {
        setImages(prev => prev.filter(img => img.url !== url));
      } else {
        alert(`삭제 실패: ${json.error || "알 수 없는 오류"}`);
      }
    } catch (e) {
      console.error("삭제 오류", e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Blob 폴더: <span className="font-medium">{folder || "(미지정)"}</span></div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onFilesSelected} />
          <button
            onClick={onClickUpload}
            disabled={!folder || uploading}
            className="px-3 py-1.5 rounded bg-black text-white text-sm disabled:opacity-50"
          >
            {uploading ? "업로드 중..." : "이미지 추가"}
          </button>
          <button
            onClick={loadImages}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-gray-200 text-sm disabled:opacity-50"
          >
            {loading ? "새로고침 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">목록을 불러오는 중...</div>
      ) : images.length === 0 ? (
        <div className="text-gray-500 text-sm">표시할 이미지가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={img.url} className="relative group">
              <img src={img.url} alt={`blob-${idx}`} className="w-full h-32 object-cover rounded border" />
              <button
                onClick={() => onDelete(img.url)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                title="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
