-- Email OTP brute-force protection. Safe to run after earlier auth migrations.
-- This migration intentionally fails if email_otps is absent: the application
-- fails closed when verify_attempts is unavailable, so a missing table is a
-- deployment configuration error rather than something to mask.

begin;

do $verify_attempts$
begin
  if to_regclass('public.email_otps') is null then
    raise exception 'public.email_otps does not exist; apply the email OTP table migration first';
  end if;
end
$verify_attempts$;

alter table public.email_otps
  add column if not exists verify_attempts integer not null default 0;

do $verify_attempts_constraint$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.email_otps'::regclass
      and conname = 'email_otps_verify_attempts_nonnegative'
  ) then
    alter table public.email_otps
      add constraint email_otps_verify_attempts_nonnegative
      check (verify_attempts >= 0);
  end if;
end
$verify_attempts_constraint$;

commit;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'email_otps'
  and column_name = 'verify_attempts';
