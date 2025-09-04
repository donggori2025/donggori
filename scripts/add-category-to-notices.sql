-- 공지사항 테이블에 카테고리 필드 추가
ALTER TABLE notices ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT '공지';

-- 기존 데이터에 기본 카테고리 설정
UPDATE notices SET category = '공지' WHERE category IS NULL;

-- 카테고리 필드에 NOT NULL 제약 조건 추가
ALTER TABLE notices ALTER COLUMN category SET NOT NULL;
