-- 샘플 팝업 데이터 삽입
INSERT INTO public.popups (id, title, content, image_url, start_at, end_at, created_at, updated_at) VALUES
(
    gen_random_uuid(),
    '신규 회원 이벤트',
    '신규 회원 가입 시 50% 할인 혜택을 드립니다! 지금 바로 가입하세요.',
    'https://example.com/popup1.jpg',
    '2024-06-01',
    '2025-12-31',
    '2024-06-01T00:00:00Z',
    '2024-06-01T00:00:00Z'
),
(
    gen_random_uuid(),
    'AI 매칭 서비스 오픈',
    '봉제공장과 디자이너를 연결하는 AI 매칭 서비스가 오픈되었습니다.',
    'https://example.com/popup2.jpg',
    '2024-06-15',
    '2025-12-31',
    '2024-06-15T00:00:00Z',
    '2024-06-15T00:00:00Z'
),
(
    gen_random_uuid(),
    '봉제공장 등록 혜택',
    '봉제공장 등록 시 3개월 무료 광고 서비스를 제공합니다.',
    'https://example.com/popup3.jpg',
    '2024-07-01',
    '2025-12-31',
    '2024-07-01T00:00:00Z',
    '2024-07-01T00:00:00Z'
),
(
    gen_random_uuid(),
    '디자이너 채용 이벤트',
    '우수한 디자이너를 모집합니다. 다양한 혜택과 함께 성장하세요.',
    'https://example.com/popup4.jpg',
    '2024-07-15',
    '2025-12-31',
    '2024-07-15T00:00:00Z',
    '2024-07-15T00:00:00Z'
),
(
    gen_random_uuid(),
    '연말 감사 이벤트',
    '연말을 맞아 감사 이벤트를 진행합니다. 다양한 혜택을 놓치지 마세요!',
    'https://example.com/popup5.jpg',
    '2024-12-01',
    '2025-12-31',
    '2024-12-01T00:00:00Z',
    '2024-12-01T00:00:00Z'
)
ON CONFLICT DO NOTHING;

