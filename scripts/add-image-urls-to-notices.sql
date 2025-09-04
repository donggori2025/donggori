-- 공지사항 테이블에 image_urls 컬럼 추가
ALTER TABLE notices ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 기존 데이터에 빈 배열로 초기화
UPDATE notices SET image_urls = '{}' WHERE image_urls IS NULL;
