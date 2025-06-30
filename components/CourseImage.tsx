"use client";

import React, { useState } from "react";

interface CourseImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CourseImage({ src, alt, className }: CourseImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}
        style={{ minHeight: 160 }}
      >
        이미지 없음
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
} 