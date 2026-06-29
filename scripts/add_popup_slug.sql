-- 팝업 slug(고유 키), 모바일 링크, 노출 순서 컬럼 추가
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS link_url_mobile TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popups_slug ON public.popups(slug) WHERE slug IS NOT NULL;
