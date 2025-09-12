### Supabase 테이블 추가/수정 (SQL 예시)

```sql
-- 휴대폰 OTP 기록 테이블
create table if not exists public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  purpose text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_phone_otps_phone on public.phone_otps(phone);

-- 이메일 OTP 기록 테이블
create table if not exists public.email_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  purpose text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_email_otps_email on public.email_otps(email);

-- 메시지 로그 테이블
create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  work_order_id text,
  channel text not null,
  "to" text not null,
  payload jsonb not null,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

-- users 테이블 (필요 시 확장)
alter table public.users
  add column if not exists kakaoMessageConsent boolean default false;

-- 세션 테이블 (일반/소셜 토큰 관리)
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
```


