begin;

alter table public.outbound_clicks
  add column if not exists tone_id text;

create index if not exists outbound_clicks_tone_id_created_at_idx
  on public.outbound_clicks (tone_id, created_at desc);

comment on column public.outbound_clicks.tone_id is
  'Optional diagnosed color tone supplied by the outbound link. Historical nulls remain unknown.';

commit;
