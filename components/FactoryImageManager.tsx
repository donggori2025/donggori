"use client";
import React, { useState } from "react";

interface FactoryImageManagerProps {
  factoryId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  isEditing?: boolean;
}

export default function FactoryImageManager({ 
  factoryId, 
  images, 
  onImagesChange, 
  isEditing = false 
}: FactoryImageManagerProps) {
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const [deletingAll, setDeletingAll] = useState(false);

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    setDeletingImages(prev => new Set(prev).add(imageUrl));
    
    try {
      const response = await fetch("/api/admin/factories/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          factoryId,
          imageUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 삭제된 이미지를 제외한 나머지 이미지들로 업데이트
        const remainingImages = images.filter(img => img !== imageUrl);
        onImagesChange(remainingImages);
        alert("이미지가 삭제되었습니다.");
      } else {
        alert(`이미지 삭제 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const handleDeleteAllImages = async () => {
    if (!confirm("모든 이미지를 삭제하시겠습니까?")) return;

    setDeletingAll(true);
    
    try {
      // 모든 이미지를 순차적으로 삭제
      for (const imageUrl of images) {
        const response = await fetch("/api/admin/factories/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            factoryId,
            imageUrl,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          console.warn(`이미지 삭제 실패: ${imageUrl}`, result.error);
        }
      }

      // 모든 이미지 삭제 완료 후 빈 배열로 설정
      onImagesChange([]);
      alert("모든 이미지가 삭제되었습니다.");
    } catch (error) {
      console.error("전체 이미지 삭제 중 오류:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingAll(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 이미지가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">
          업장 이미지 ({images.length}개)
        </h3>
        {images.length > 1 && (
          <button
            onClick={handleDeleteAllImages}
            disabled={deletingAll}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deletingAll ? "삭제 중..." : "전체 삭제"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <img
              src={imageUrl}
              alt={`업장 이미지 ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            {isEditing && (
              <button
                onClick={() => handleDeleteImage(imageUrl)}
                disabled={deletingImages.has(imageUrl)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="이미지 삭제"
              >
                {deletingImages.has(imageUrl) ? "..." : "×"}
              </button>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
