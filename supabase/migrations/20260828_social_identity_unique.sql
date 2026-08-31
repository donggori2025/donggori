-- Prevent one Kakao/Naver identity from being linked to multiple users.
-- Existing duplicates must be reviewed rather than silently deleting accounts.

begin;

do $$
begin
  if exists (
    select 1
    from public.users
    where "signupMethod" in ('kakao', 'naver')
      and "externalId" is not null
      and btrim("externalId") <> ''
    group by "signupMethod", "externalId"
    having count(*) > 1
  ) then
    raise exception 'Duplicate social identities exist in public.users; review them before applying the unique index.';
  end if;
end
$$;

create unique index if not exists idx_users_social_identity_unique
  on public.users ("signupMethod", "externalId")
  where "signupMethod" in ('kakao', 'naver')
    and "externalId" is not null
    and btrim("externalId") <> '';

commit;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname = 'idx_users_social_identity_unique';
