-- 긴급 보안 조치: users 테이블은 브라우저(anon/authenticated role)가 직접 읽거나 쓰지 못하게 한다.
-- 애플리케이션의 회원가입/로그인/세션 API는 SUPABASE_SERVICE_ROLE_KEY를 사용하므로 계속 동작한다.
-- Supabase SQL Editor에서 Production 프로젝트에 실행한다.

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;

-- 기존에 users에 생성된 공개 정책이 있다면 Supabase Dashboard > Authentication > Policies에서 삭제한다.
-- 이 프로젝트에는 users에 대한 anon/authenticated 정책을 만들지 않는다.
