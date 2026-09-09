-- ============================================================================
-- VocabStudy — Supabase schema. Run this in the Supabase SQL editor once.
-- Tables: profiles (1:1 with auth.users) + progress (per user, per language).
-- Security: Row Level Security so each user only touches their own rows.
-- Admin-wide operations are performed by Cloudflare Pages Functions using the
-- service-role key (which bypasses RLS) — see functions/api/admin/*.
-- ============================================================================

-- ---- profiles --------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text not null default '',
  role       text not null default 'student' check (role in ('student', 'admin')),
  status     text not null default 'active'  check (status in ('active', 'locked')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read (only) their own profile. No user-facing UPDATE policy, so
-- users cannot escalate their own role — role/status change only via service role.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- ---- progress --------------------------------------------------------------
create table if not exists public.progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  lang_code  text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lang_code)
);

alter table public.progress enable row level security;

drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- auto-create a profile on signup; first ever user becomes admin --------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    case when is_first then 'admin' else 'student' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- ai_usage: daily cap for the AI tutor ----------------------------------
-- /api/ai/chat spends the project's own OpenAI key, so each learner gets a
-- daily allowance. Only the Pages Functions (service role) touch this table —
-- there is deliberately no user-facing RLS policy.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  used    integer not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- Atomic "count one more request today and tell me the new total". Doing the
-- read and the write in one statement keeps two tabs from racing past the cap.
-- The day rolls over at local midnight in Vietnam, not UTC, because that is
-- where the learners are.
create or replace function public.bump_ai_usage(p_user uuid)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
  d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  insert into public.ai_usage (user_id, day, used)
  values (p_user, d, 1)
  on conflict (user_id, day) do update set used = public.ai_usage.used + 1
  returning used into n;
  return n;
end;
$$;
