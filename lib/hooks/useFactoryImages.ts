import { useState, useEffect } from 'react';
import { hasFactoryImages as checkFactoryImages } from '@/lib/factoryImages';

export function useFactoryImages(factoryName: string) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factoryName) {
      setImages(['/logo_donggori.png']);
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/factory-images/list?folder=${encodeURIComponent(factoryName)}`);
        const data = await response.json();
        
        if (data.ok && data.images && data.images.length > 0) {
          setImages(data.images);
        } else {
          // 이미지가 없으면 기본 이미지 사용
          setImages(['/logo_donggori.png']);
        }
      } catch (err) {
        console.error('이미지 목록 조회 실패:', err);
        setError('이미지를 불러올 수 없습니다');
        setImages(['/logo_donggori.png']);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [factoryName]);

  return { images, loading, error };
}

// 공장에 이미지가 있는지 확인하는 함수
export function hasFactoryImages(factoryName: string): boolean {
  return checkFactoryImages(factoryName);
}
