-- Ajoute un lien externe obligatoire pour chaque offre
alter table if exists public.jobs
  add column if not exists external_url text;

update public.jobs
set external_url = coalesce(external_url, concat('https://taletaff.com/jobs/', id::text));

alter table if exists public.jobs
  alter column external_url set not null;

alter table if exists public.jobs
  alter column external_url set default 'https://taletaff.com/jobs';

comment on column public.jobs.external_url is 'Lien canonique vers l''offre source.';
