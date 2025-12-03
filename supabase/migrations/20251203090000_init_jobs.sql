-- Enable extensions used by the project
create extension if not exists "pgcrypto";

-- Jobs table stores curated offers fetched by the application
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null default '',
  location text not null default '',
  category text not null,
  description text not null default '',
  remote boolean not null default false,
  salary_min integer not null default 0,
  salary_max integer not null default 0,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  constraint salary_range_valid check (salary_min <= salary_max)
);

-- Helpful indexes for filtering and ordering
create index if not exists jobs_category_idx on public.jobs using btree (category);
create index if not exists jobs_created_at_idx on public.jobs using btree (created_at desc);

-- Ensure public read access while keeping write operations restricted
alter table public.jobs enable row level security;

drop policy if exists "jobs public read" on public.jobs;
create policy "jobs public read" on public.jobs for select using (true);
