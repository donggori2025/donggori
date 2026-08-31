-- Public notice API가 활성/노출기간을 서버에서 강제하기 위한 호환 마이그레이션.
-- 코드 배포 전에 Supabase SQL Editor에서 먼저 실행한다.

begin;

alter table public.notices
  add column if not exists is_active boolean not null default true,
  add column if not exists start_at date,
  add column if not exists end_at date;

-- ADD COLUMN IF NOT EXISTS does not repair constraints on an existing column.
update public.notices
set is_active = true
where is_active is null;

alter table public.notices
  alter column is_active set default true,
  alter column is_active set not null;

create index if not exists idx_notices_visibility
  on public.notices (is_active, start_at, end_at);

commit;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'notices'
  and column_name in ('is_active', 'start_at', 'end_at')
order by column_name;
