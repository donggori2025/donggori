-- 통합 사용자 관리 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image TEXT,
    login_method VARCHAR(20) NOT NULL CHECK (login_method IN ('google', 'naver', 'kakao', 'email')),
    external_id VARCHAR(255),
    kakao_message_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 match_requests 테이블에 userId 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_requests' AND column_name = 'user_id') THEN
        ALTER TABLE public.match_requests ADD COLUMN user_id UUID REFERENCES public.users(id);
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_external_id ON public.users(external_id, login_method);
CREATE INDEX IF NOT EXISTS idx_users_login_method ON public.users(login_method);
CREATE INDEX IF NOT EXISTS idx_match_requests_user_id ON public.match_requests(user_id);

-- RLS (Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책 설정
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow service role full access" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- 기존 데이터 마이그레이션 (선택사항)
-- 이 부분은 기존 데이터가 있을 때만 실행
-- INSERT INTO public.users (email, name, login_method, created_at, updated_at)
-- SELECT DISTINCT user_email, user_name, 'email', NOW(), NOW()
-- FROM public.match_requests
-- WHERE user_email IS NOT NULL
-- ON CONFLICT (email) DO NOTHING;
