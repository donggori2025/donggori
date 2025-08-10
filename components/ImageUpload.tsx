"use client";
import React from "react";
import { useState, useRef } from "react";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  currentImages?: string[];
  multiple?: boolean;
}

export default function ImageUpload({ onImagesChange, currentImages = [], multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      
      // 단일 이미지인 경우 첫 번째 파일만 처리
      const filesToProcess = multiple ? Array.from(files) : [files[0]];
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "업로드 실패");
        }

        uploadedUrls.push(result.url);
      }

      // 단일 이미지인 경우 기존 이미지를 새 이미지로 교체
      const newImages = multiple 
        ? [...currentImages, ...uploadedUrls]
        : uploadedUrls;

      onImagesChange(newImages);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = currentImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } else {
      // 단일 이미지인 경우 빈 배열로 설정 (이미지 삭제)
      onImagesChange([]);
    }
  };

  const clearAllImages = () => {
    onImagesChange([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {multiple ? "이미지 업로드" : "이미지 업로드"}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
        {uploading && (
          <p className="text-blue-600 text-sm mt-1">업로드 중...</p>
        )}
      </div>

      {currentImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {multiple ? `업로드된 이미지 (${currentImages.length}개)` : "업로드된 이미지"}
            </label>
            <button
              type="button"
              onClick={clearAllImages}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              모든 이미지 삭제
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((imageUrl, index) => (
              <div key={`image-${index}-${imageUrl}`} className="relative group">
                <img
                  src={imageUrl}
                  alt={`이미지 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="이미지 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
