// Cloudinary 설정
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Cloudinary 이미지 URL 생성 함수
export function getCloudinaryImageUrl(folderName: string, fileName: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/donggori/${folderName}/${fileName}`;
}

// Cloudinary 썸네일 이미지 URL 생성
export function getCloudinaryThumbnailUrl(factoryName: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_thumb,w_300,h_300/v1/donggori/thumbnails/${factoryName}.jpg`;
}

// Cloudinary 최적화된 이미지 URL 생성
export function getCloudinaryOptimizedUrl(folderName: string, fileName: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/v1/donggori/${folderName}/${fileName}`;
} 