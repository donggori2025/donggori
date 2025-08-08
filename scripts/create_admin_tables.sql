-- 팝업 테이블 생성
CREATE TABLE IF NOT EXISTS public.popups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url TEXT,
    start_at DATE,
    end_at DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(50) DEFAULT '일반',
    start_at DATE,
    end_at DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_popups_active ON public.popups(is_active);
CREATE INDEX IF NOT EXISTS idx_popups_dates ON public.popups(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_notices_active ON public.notices(is_active);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_dates ON public.notices(start_at, end_at);

-- RLS (Row Level Security) 설정
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능하도록 정책 설정
CREATE POLICY "Enable all access for authenticated users" ON public.popups
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.notices
    FOR ALL USING (auth.role() = 'authenticated');


