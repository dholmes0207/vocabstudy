-- ============================================================================
-- VocaStudy — Supabase schema. Run it in the Supabase SQL editor; it is safe
-- to run again after an update (every statement is idempotent).
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
  status     text not null default 'pending' check (status in ('active', 'locked', 'pending')),
  created_at timestamptz not null default now()
);

-- Registration needs an admin's approval (docs/design/registration-approval.md):
-- a new sign-up is 'pending' until an admin sets it to 'active'. These statements
-- upgrade a table created before that rule; existing accounts keep the status
-- they have.
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check check (status in ('active', 'locked', 'pending'));
alter table public.profiles alter column status set default 'pending';

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

-- Is the caller an approved, unlocked account? security definer so the check
-- can read profiles without a policy on it; a pending or locked account cannot
-- sync progress even with a valid token.
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress
  for all using (auth.uid() = user_id and public.is_active_user())
  with check (auth.uid() = user_id and public.is_active_user());

-- ---- auto-create a profile on signup -------------------------------------
-- The first ever user becomes an active admin; everyone after waits as
-- 'pending' until an admin approves them on the Admin page.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    case when is_first then 'admin' else 'student' end,
    case when is_first then 'active' else 'pending' end
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

-- Only the Pages Functions (service role) may count AI usage. Supabase grants
-- EXECUTE on new public functions to anon/authenticated by default, which let
-- anyone with the public key inflate another learner's counter.
revoke execute on function public.bump_ai_usage(uuid) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(uuid) to service_role;

-- ---- client error reports (docs/design/error-reports.md) ------------------
-- One row per distinct bug (grouped by signature) with a count, so the Admin
-- page shows what is breaking for learners. Scrubbed in the browser and again
-- in the Function: no account, email, learning content or query string.
create table if not exists public.client_errors (
  signature  text primary key,
  message    text not null,
  stack      text not null default '',
  path       text not null default '/',
  release    text not null default '',
  kind       text not null default 'error',
  count      integer not null default 1,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

-- No policies: only the service role reads or writes error reports.
alter table public.client_errors enable row level security;

create or replace function public.report_client_error(
  p_signature text, p_message text, p_stack text, p_path text, p_release text, p_kind text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.client_errors as e (signature, message, stack, path, release, kind)
  values (left(p_signature, 16), left(p_message, 300), left(p_stack, 2000),
          left(p_path, 200), left(p_release, 40), left(p_kind, 12))
  on conflict (signature) do update
    set count = e.count + 1, last_seen = now(), path = excluded.path, release = excluded.release;
  -- Stay small: 30 days of history, at most 500 distinct errors.
  delete from public.client_errors where last_seen < now() - interval '30 days';
  delete from public.client_errors
   where signature in (select signature from public.client_errors
                        order by last_seen desc offset 500);
end;
$$;

revoke execute on function public.report_client_error(text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.report_client_error(text, text, text, text, text, text)
  to service_role;

-- Make PostgREST pick up new/changed functions right away.
notify pgrst, 'reload schema';
