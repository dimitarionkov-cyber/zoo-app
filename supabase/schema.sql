-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Stores each user's favorites/visited/visit-session progress, keyed by their
-- auth uid (anonymous or a linked email account — same row either way).

create table if not exists public.zoo_progress (
  id uuid primary key references auth.users(id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb,
  visited jsonb not null default '{}'::jsonb,
  -- Each element: { id, startedAt, endedAt: iso|null, seen: { [animalId]: { at: iso, firstTime: bool } } }
  visits jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.zoo_progress enable row level security;

create policy "Users can read own progress"
  on public.zoo_progress for select
  using (auth.uid() = id);

create policy "Users can insert own progress"
  on public.zoo_progress for insert
  with check (auth.uid() = id);

create policy "Users can update own progress"
  on public.zoo_progress for update
  using (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists zoo_progress_set_updated_at on public.zoo_progress;
create trigger zoo_progress_set_updated_at
  before update on public.zoo_progress
  for each row execute function public.set_updated_at();

-- ── Migration: run only if you already created zoo_progress before the ──────
-- switch to a visits[] list (replaces the old single active_visit/last_visit
-- slots). Safe to run again — IF NOT EXISTS guards it.
alter table public.zoo_progress add column if not exists visits jsonb not null default '[]'::jsonb;
