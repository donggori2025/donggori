import { put, del, list } from '@vercel/blob';

// Vercel Blob Storage 설정
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';

// Vercel Blob 이미지 URL 생성 함수
export function getVercelBlobImageUrl(folderName: string, fileName: string): string {
  return `https://donggori-images.vercel-storage.com/${folderName}/${fileName}`;
}

// Vercel Blob 썸네일 이미지 URL 생성
export function getVercelBlobThumbnailUrl(factoryName: string): string {
  return `https://donggori-images.vercel-storage.com/thumbnails/${factoryName}.jpg`;
}

// 이미지 업로드 함수
export async function uploadImageToBlob(file: File, folderName: string, fileName: string) {
  try {
    const { url } = await put(`${folderName}/${fileName}`, file, {
      access: 'public',
    });
    return url;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

// 이미지 삭제 함수
export async function deleteImageFromBlob(url: string) {
  try {
    await del(url);
    console.log('이미지 삭제 완료:', url);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

// 폴더 내 모든 이미지 조회 함수
export async function listImagesInFolder(folderName: string) {
  try {
    const { blobs } = await list({ prefix: `${folderName}/` });
    return blobs;
  } catch (error) {
    console.error('이미지 목록 조회 실패:', error);
    return [];
  }
} 