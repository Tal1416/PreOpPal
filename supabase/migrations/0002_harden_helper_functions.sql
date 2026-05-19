-- Harden the internal trigger helpers so they can't be invoked from PostgREST.
-- Both functions are only meant to run inside Postgres triggers under their
-- owning role; exposing them via /rest/v1/rpc would let any authenticated
-- user call them directly. The Supabase security-advisor surfaces this
-- (`anon_security_definer_function_executable` and the authenticated variant).
--
-- We also pin touch_updated_at's search_path so it can't be tricked into
-- resolving identifiers against a malicious schema higher up the search path
-- (`function_search_path_mutable` lint).

revoke execute on function public.handle_new_user()  from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

alter function public.touch_updated_at() set search_path = pg_catalog, public;
