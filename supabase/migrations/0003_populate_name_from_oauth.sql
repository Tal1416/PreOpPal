-- Populate profiles.first_name / last_name from OAuth metadata on signup.
--
-- Before this migration, handle_new_user() inserted an empty profile row, so
-- every new Google login landed in onboarding with blank name fields even
-- though Google had already given us the user's name. Now we pull
-- `given_name` / `family_name` (Google's structured names) out of
-- `auth.users.raw_user_meta_data`, falling back to splitting `name` /
-- `full_name` on the first space when only the combined field is present
-- (some providers don't send the structured pair).
--
-- The insert still uses `on conflict (id) do nothing`, so if a profile row
-- somehow already exists (e.g. an older account, manual seed) we don't
-- overwrite anything the user has set.
--
-- Search path is pinned to `pg_catalog, public` to match the hardening
-- applied to touch_updated_at in 0002 (`function_search_path_mutable` lint).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  meta         jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  given_name   text  := nullif(trim(meta->>'given_name'), '');
  family_name  text  := nullif(trim(meta->>'family_name'), '');
  -- Google sends `name` and `full_name`; other providers vary.
  full_name    text  := nullif(trim(coalesce(meta->>'full_name', meta->>'name')), '');
  first_value  text;
  last_value   text;
begin
  if given_name is not null then
    first_value := given_name;
  elsif full_name is not null then
    first_value := split_part(full_name, ' ', 1);
  else
    first_value := '';
  end if;

  if family_name is not null then
    last_value := family_name;
  elsif full_name is not null and position(' ' in full_name) > 0 then
    last_value := trim(substring(full_name from position(' ' in full_name) + 1));
  else
    last_value := '';
  end if;

  insert into public.profiles (id, first_name, last_name)
  values (new.id, first_value, last_value)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Re-apply the hardening from 0002: only triggers should call this, never
-- end users via PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
