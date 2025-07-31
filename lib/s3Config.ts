import { S3Client } from '@aws-sdk/client-s3';

// AWS S3 클라이언트 설정
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2', // 서울 리전
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 버킷 이름
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'donggori-images';

// 이미지 URL 생성 함수
export function getS3ImageUrl(folderName: string, fileName: string): string {
  return `https://${S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${folderName}/${fileName}`;
}

// 썸네일 이미지 URL 생성
export function getS3ThumbnailUrl(factoryName: string): string {
  return `https://${S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/thumbnails/${factoryName}.jpg`;
}

// CloudFront CDN URL 생성 (선택사항)
export function getCloudFrontImageUrl(folderName: string, fileName: string): string {
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${folderName}/${fileName}`;
  }
  return getS3ImageUrl(folderName, fileName);
}

export function getCloudFrontThumbnailUrl(factoryName: string): string {
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/thumbnails/${factoryName}.jpg`;
  }
  return getS3ThumbnailUrl(factoryName);
} 