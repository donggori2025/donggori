import { useState, useEffect } from 'react';
import { hasFactoryImages as checkFactoryImages, getFactoryImageFolder, getFactoryImages } from '@/lib/factoryImages';

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
        // 서버 사이드에서 이미지 목록 가져오기 (배포 환경 호환)
        const serverImages = getFactoryImages(factoryName);
        
        if (serverImages && serverImages.length > 0 && serverImages[0] !== '/logo_donggori.png') {
          setImages(serverImages);
        } else {
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
