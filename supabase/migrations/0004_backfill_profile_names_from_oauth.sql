-- One-time backfill of profiles.first_name / last_name from OAuth metadata.
--
-- 0003 fixed handle_new_user() so *future* signups inherit the user's Google
-- name. But the trigger only fires on insert into auth.users, so anyone who
-- signed up before 0003 was applied has an empty profile row even though
-- their raw_user_meta_data already carried `given_name` / `family_name` /
-- `name` / `full_name`. This migration mirrors the trigger logic across
-- all existing empty profile rows.
--
-- Safe to re-run: only touches rows where both first_name and last_name are
-- still empty, so any user who has manually set a name will not be touched.

with derived as (
  select
    u.id,
    nullif(trim(u.raw_user_meta_data->>'given_name'),  '') as given_name,
    nullif(trim(u.raw_user_meta_data->>'family_name'), '') as family_name,
    nullif(trim(coalesce(u.raw_user_meta_data->>'full_name',
                         u.raw_user_meta_data->>'name')), '') as full_name
  from auth.users u
  join public.profiles p on p.id = u.id
  where coalesce(p.first_name, '') = '' and coalesce(p.last_name, '') = ''
)
update public.profiles p
set
  first_name = coalesce(
    d.given_name,
    case when d.full_name is not null then split_part(d.full_name, ' ', 1) end,
    p.first_name
  ),
  last_name = coalesce(
    d.family_name,
    case
      when d.full_name is not null and position(' ' in d.full_name) > 0
      then trim(substring(d.full_name from position(' ' in d.full_name) + 1))
    end,
    p.last_name
  )
from derived d
where p.id = d.id;
