-- Server-side revocable session registry. The primary key stores SHA-256(token),
-- never the bearer token itself. Browser roles have no direct table access.

begin;

create table if not exists public.sessions (
  id text primary key,
  type text not null check (type in ('local', 'sns')),
  user_id text,
  user_email text,
  external_id text,
  provider text,
  is_initialized boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_user_email on public.sessions(user_email);
create index if not exists idx_sessions_expires_at on public.sessions(expires_at);

alter table public.sessions enable row level security;
revoke all on table public.sessions from anon, authenticated;

commit;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'sessions'
order by ordinal_position;
