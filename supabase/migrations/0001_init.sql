-- pre-op-pal initial schema
-- How to apply: paste this entire file into the Supabase SQL editor and run it,
-- or use the Supabase CLI: `supabase db push`.
--
-- Tables:
--   profiles         — one row per auth.users user, mirrors the camelCase Profile type
--   medications      — per-user medication list
--   checklist_state  — per-user toggled item ids (bag, dashboard tasks, timeline phases)
--   pal_messages     — Pal AI chat history
--   care_messages    — care-team chat history
--   pairing_codes    — server-only desktop↔phone QR pairing (replaces in-memory store)
--
-- All user-scoped tables enable RLS with `auth.uid() = user_id` policies.
-- pairing_codes has RLS enabled but no policies — only the service_role key can touch it.

-- Tear-down (idempotent re-runs) ------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.pairing_codes cascade;
drop table if exists public.care_messages cascade;
drop table if exists public.pal_messages cascade;
drop table if exists public.checklist_state cascade;
drop table if exists public.medications cascade;
drop table if exists public.profiles cascade;

-- profiles ---------------------------------------------------------------------
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  first_name               text not null default '',
  last_name                text not null default '',
  age                      integer not null default 0,
  patient_id               text not null default '',
  procedure_id             text not null default '',
  procedure                text not null default '',
  surgeon                  text not null default '',
  surgery_date             date,
  hospital_name            text not null default '',
  hospital_address         text not null default '',
  hospital_coords          text not null default '',
  emergency_contact_name   text not null default '',
  emergency_contact_phone  text not null default '',
  blood_type               text not null default '',
  allergies                text not null default '',
  blood_pressure           text not null default '',
  heart_rate               integer not null default 0,
  weight_lb                integer not null default 0,
  height_ft_in             text not null default '',
  anxiety_level            integer not null default 0,
  preferred_contact        text not null default 'app' check (preferred_contact in ('app','phone','email')),
  notes                    text not null default '',
  avatar                   text not null default '',
  onboarding_complete      boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner read"   on public.profiles for select using  (auth.uid() = id);
create policy "profiles: owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: owner update" on public.profiles for update using  (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: owner delete" on public.profiles for delete using  (auth.uid() = id);

-- medications ------------------------------------------------------------------
create table public.medications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default '',
  dosage      text not null default '',
  schedule    text not null default '',
  status      text not null default 'continue' check (status in ('stop','continue','new')),
  reason      text not null default '',
  days_left   integer,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index medications_user_id_idx on public.medications(user_id, sort_order);

alter table public.medications enable row level security;

create policy "medications: owner read"   on public.medications for select using  (auth.uid() = user_id);
create policy "medications: owner insert" on public.medications for insert with check (auth.uid() = user_id);
create policy "medications: owner update" on public.medications for update using  (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medications: owner delete" on public.medications for delete using  (auth.uid() = user_id);

-- checklist_state --------------------------------------------------------------
create table public.checklist_state (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  kind        text not null check (kind in ('bag','task','phase')),
  checked_at  timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

alter table public.checklist_state enable row level security;

create policy "checklist: owner read"   on public.checklist_state for select using  (auth.uid() = user_id);
create policy "checklist: owner insert" on public.checklist_state for insert with check (auth.uid() = user_id);
create policy "checklist: owner update" on public.checklist_state for update using  (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checklist: owner delete" on public.checklist_state for delete using  (auth.uid() = user_id);

-- pal_messages -----------------------------------------------------------------
create table public.pal_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user','ai')),
  text        text not null,
  actions     jsonb,
  created_at  timestamptz not null default now()
);

create index pal_messages_user_id_idx on public.pal_messages(user_id, created_at);

alter table public.pal_messages enable row level security;

create policy "pal_messages: owner read"   on public.pal_messages for select using  (auth.uid() = user_id);
create policy "pal_messages: owner insert" on public.pal_messages for insert with check (auth.uid() = user_id);
create policy "pal_messages: owner delete" on public.pal_messages for delete using  (auth.uid() = user_id);

-- care_messages ----------------------------------------------------------------
create table public.care_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user','nurse')),
  text        text not null,
  created_at  timestamptz not null default now()
);

create index care_messages_user_id_idx on public.care_messages(user_id, created_at);

alter table public.care_messages enable row level security;

create policy "care_messages: owner read"   on public.care_messages for select using  (auth.uid() = user_id);
create policy "care_messages: owner insert" on public.care_messages for insert with check (auth.uid() = user_id);
create policy "care_messages: owner delete" on public.care_messages for delete using  (auth.uid() = user_id);

-- pairing_codes ----------------------------------------------------------------
-- Server-only. No RLS policies → only service_role key can read/write.
create table public.pairing_codes (
  code         text primary key,
  payload      jsonb not null,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index pairing_codes_expires_at_idx on public.pairing_codes(expires_at);

alter table public.pairing_codes enable row level security;
-- (intentionally no policies — server-only access via service_role)

-- Auto-create profile row on signup -------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at maintenance on profiles ------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
