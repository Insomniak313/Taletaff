-- Replace the partial unique index to allow ON CONFLICT on (source, external_id)
drop index if exists jobs_source_external_id_key;

alter table public.jobs
  add constraint jobs_source_external_id_unique unique (source, external_id);
