create table if not exists public.job_provider_config (
  provider text primary key,
  endpoint text,
  auth_token text,
  headers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint job_provider_config_provider_fkey foreign key (provider)
    references public.job_provider_runs(provider) on delete cascade
);

create or replace function public.set_job_provider_config_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_provider_config_set_updated_at on public.job_provider_config;
create trigger job_provider_config_set_updated_at
before update on public.job_provider_config
for each row execute procedure public.set_job_provider_config_updated_at();
