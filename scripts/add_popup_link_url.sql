-- 팝업 클릭 링크 URL 컬럼 추가 (없을 경우만)
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS link_url TEXT;

-- 공지 이미지 URL 배열 (없을 경우만)
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS image_urls TEXT[];
