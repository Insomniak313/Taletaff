-- Enrichit la table jobs et ajoute le suivi d'exécution des scrapers
alter table if exists public.jobs
  add column if not exists source text not null default 'manual',
  add column if not exists external_id text,
  add column if not exists fetched_at timestamptz default timezone('utc', now());

create unique index if not exists jobs_source_external_id_key
  on public.jobs (source, external_id)
  where external_id is not null;

create table if not exists public.job_provider_runs (
  provider text primary key,
  last_run_at timestamptz,
  last_success_at timestamptz,
  status text not null default 'idle' check (status in ('idle', 'running', 'success', 'failed')),
  error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_job_provider_runs_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_provider_runs_set_updated_at on public.job_provider_runs;
create trigger job_provider_runs_set_updated_at
before update on public.job_provider_runs
for each row execute procedure public.set_job_provider_runs_updated_at();
