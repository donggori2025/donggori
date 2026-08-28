-- 동고리 브라우저 클라이언트가 애플리케이션 테이블을 직접 읽거나 쓰지 못하게 한다.
--
-- 전제:
--   1. 이 커밋의 서버 API 기반 데이터 접근 코드를 먼저 Vercel에 배포한다.
--   2. Vercel에 SUPABASE_SERVICE_ROLE_KEY가 Production/Preview별로 설정되어 있다.
--   3. Supabase SQL Editor에서 이 파일을 실행한다. 애플리케이션이 자동 실행하지 않는다.
--
-- service_role은 Supabase에서 BYPASSRLS 권한을 가지므로 서버 API는 계속 동작한다.
-- anon/authenticated에는 정책을 만들지 않는다. 로그인도 Supabase Auth가 아니라
-- 동고리 서버 세션을 사용하므로 브라우저의 public schema 접근 권한이 필요 없다.

begin;

do $lockdown$
declare
  app_table text;
  app_policy record;
begin
  foreach app_table in array array[
    'users',
    'sessions',
    'email_otps',
    'phone_otps',
    'donggori',
    'match_requests',
    'matching_feedback',
    'notices',
    'popups',
    'message_logs',
    'factory_auth',
    'likes'
  ]
  loop
    if to_regclass(format('public.%I', app_table)) is null then
      raise notice 'skip missing table public.%', app_table;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', app_table);
    execute format(
      'revoke all privileges on table public.%I from anon, authenticated',
      app_table
    );

    -- 과거의 "authenticated 전체 허용" 정책을 포함해 대상 테이블의 공개 정책을 제거한다.
    for app_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = app_table
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        app_policy.policyname,
        app_table
      );
    end loop;
  end loop;
end
$lockdown$;

-- 같은 소유자로 나중에 만드는 테이블이 기본적으로 브라우저 역할에 열리지 않도록 한다.
alter default privileges in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges in schema public
  revoke all privileges on sequences from anon, authenticated;

commit;

-- 실행 후 확인: policy_count가 0이고 anon/authenticated 권한이 false여야 한다.
select
  tables.tablename,
  tables.rowsecurity,
  count(policies.policyname) as policy_count,
  has_table_privilege('anon', format('public.%I', tables.tablename), 'select') as anon_can_select,
  has_table_privilege('authenticated', format('public.%I', tables.tablename), 'select') as authenticated_can_select
from pg_tables as tables
left join pg_policies as policies
  on policies.schemaname = tables.schemaname
 and policies.tablename = tables.tablename
where tables.schemaname = 'public'
  and tables.tablename = any(array[
    'users', 'sessions', 'email_otps', 'phone_otps', 'donggori',
    'match_requests', 'matching_feedback', 'notices', 'popups',
    'message_logs', 'factory_auth', 'likes'
  ])
group by tables.tablename, tables.rowsecurity
order by tables.tablename;
