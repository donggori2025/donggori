-- 이메일 OTP 기록 테이블 생성
-- Supabase에서 실행할 SQL 스크립트

-- 이메일 OTP 테이블 생성
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 이메일 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON public.email_otps(email, purpose);
CREATE INDEX IF NOT EXISTS idx_email_otps_created_at ON public.email_otps(created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- 서비스 역할만 접근 가능하도록 설정
CREATE POLICY "Service role can manage email_otps" ON public.email_otps
  FOR ALL USING (auth.role() = 'service_role');

-- 테이블 생성 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'email_otps' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
