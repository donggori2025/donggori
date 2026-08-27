-- Supabase SQL Editor에서 실행한다. 계정별 임시 비밀번호는 이 파일에 저장하지 않는다.
create extension if not exists pgcrypto;

create table if not exists public.factory_auth (
  id text primary key,
  factory_id text not null unique,
  username text unique not null,
  password text not null check (password like '$2%'),
  factory_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.factory_auth enable row level security;
revoke all on table public.factory_auth from anon, authenticated;

-- 기존의 예측 가능한 평문 계정은 즉시 비활성화한다.
delete from public.factory_auth
where password !~ '^\$2[aby]\$';

alter table public.factory_auth drop constraint if exists factory_auth_password_bcrypt;
alter table public.factory_auth
  add constraint factory_auth_password_bcrypt check (password ~ '^\$2[aby]\$');

-- 계정 발급 예시: 비밀번호는 계정마다 별도로 생성해 안전한 채널로 전달한다.
-- insert into public.factory_auth (id, factory_id, username, password, factory_name)
-- values ('1', '1', 'factory01', crypt('고유한-임시-비밀번호', gen_salt('bf', 12)), '공장명');
