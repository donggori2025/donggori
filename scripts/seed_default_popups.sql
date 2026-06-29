-- 기본 프로모 팝업 시드 (slug 기준, 이미 있으면 건너뜀)
INSERT INTO public.popups (
  slug, title, image_url, link_url, link_url_mobile, start_at, end_at, sort_order, is_active, created_at, updated_at
)
SELECT
  'faddit-creator-crew-contest',
  'FADDIT CREATOR CREW 1기',
  '/popups/faddit-creator-crew-contest.png',
  'https://open.kakao.com/o/pXWBTRri',
  NULL,
  '2026-06-22'::date,
  '2026-07-10'::date,
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.popups WHERE slug = 'faddit-creator-crew-contest'
);

INSERT INTO public.popups (
  slug, title, image_url, link_url, link_url_mobile, start_at, end_at, sort_order, is_active, created_at, updated_at
)
SELECT
  'faddit-promo',
  'FADDIT',
  'https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png',
  'https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=pc_top_banner',
  'https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=mobile_banner',
  NULL,
  NULL,
  1,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.popups WHERE slug = 'faddit-promo'
);
