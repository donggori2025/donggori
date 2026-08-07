-- 로그인·회원가입이 기대하는 스키마를 실제 DB에 맞춘다.
--
-- 배경: lib/session.ts 는 sessions 테이블에, lib/emailOtp.ts 는 email_otps의
-- verify_attempts 컬럼에 기록하는데 둘 다 DB에 반영된 적이 없어
-- 로그인 성공 직전과 인증번호 발송에서 각각 실패하고 있었다.
--
-- 실행: psql "$DATABASE_URL" -f scripts/fix-auth-schema.sql
-- 이미 적용된 환경에서 다시 실행해도 안전하다.

begin;

-- 1) 세션 테이블 — 로그인 성공 시 발급하는 access_token 을 여기에 적재한다.
create table if not exists public.sessions (
  id text primary key, -- 토큰 자체를 키로 사용
  type text not null check (type in ('local', 'sns')),
  user_id text,
  user_email text,
  external_id text,
  provider text,
  is_initialized boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_email on public.sessions(user_email);
create index if not exists idx_sessions_expires_at on public.sessions(expires_at);

-- 토큰이 곧 기본키라 anon 키로 한 행이라도 읽히면 계정 탈취로 이어진다.
-- service_role 은 RLS 를 우회하므로 서버 코드는 영향받지 않는다.
alter table public.sessions enable row level security;

drop policy if exists "Service role can manage sessions" on public.sessions;
create policy "Service role can manage sessions" on public.sessions
  for all using (auth.role() = 'service_role');

-- 2) OTP 검증 시도 횟수 — 6자리 코드 무차별 대입을 5회로 제한하는 데 쓴다.
alter table public.email_otps
  add column if not exists verify_attempts integer not null default 0;

commit;

-- 적용 결과 확인
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (table_name = 'sessions' or (table_name = 'email_otps' and column_name = 'verify_attempts'))
order by table_name, ordinal_position;
