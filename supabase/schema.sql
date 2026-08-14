-- Palevie production starter schema
-- Run in a NEW Supabase project for easiest setup.
-- If re-running in an existing project, review migrations before applying destructive changes.

create extension if not exists "pgcrypto";

-- -----------------------------
-- User profile / entitlement
-- -----------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tone_profile text not null default 'autumn-soft',
  color_profile jsonb,
  skin_profile jsonb,
  plan text not null default 'free' check (plan in ('free','plus')),
  ls_customer_id text,
  ls_subscription_id text,
  ls_customer_portal_url text,
  subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- -----------------------------
-- Saved product-color analyses
-- -----------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  profile_id text not null,
  profile_name text not null,
  dominant_hex text not null,
  score integer not null check(score between 0 and 100),
  color_fit integer not null check(color_fit between 0 and 100),
  verdict text not null check(verdict in ('BUY','MAYBE','SKIP')),
  summary text not null,
  alternatives jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analyses_user_created_idx on public.analyses(user_id, created_at desc);

-- -----------------------------
-- Product-check usage entitlement
-- -----------------------------
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user_kind_created_idx on public.usage_events(user_id, kind, created_at desc);

-- -----------------------------
-- Anonymous/product analytics
-- -----------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists events_name_created_idx on public.events(event_name, created_at desc);
create index if not exists events_visitor_created_idx on public.events(visitor_id, created_at desc);

create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  offer_id text not null,
  product_id text not null,
  retailer text not null,
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists outbound_clicks_created_idx on public.outbound_clicks(created_at desc);
create index if not exists outbound_clicks_product_idx on public.outbound_clicks(product_id, created_at desc);

-- A partner-network postback/import can later write attributed purchases here.
create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  network text not null,
  external_order_id text,
  visitor_id text,
  product_id text,
  offer_id text,
  retailer text,
  order_value_usd numeric(12,2),
  commission_usd numeric(12,2),
  attribution jsonb not null default '{}'::jsonb,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  unique(network, external_order_id)
);

-- -----------------------------
-- AI call budget ledger
-- -----------------------------
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  kind text not null default 'color_scan',
  model text,
  estimated_usd numeric(12,6) not null default 0,
  status text not null default 'reserved' check(status in ('reserved','completed','failed')),
  provider_usage jsonb,
  finalized_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_visitor_created_idx on public.ai_usage(visitor_id, created_at desc);
create index if not exists ai_usage_created_idx on public.ai_usage(created_at desc);

-- Atomic-ish budget reservation. Advisory lock serializes concurrent reservations for this app project.
create or replace function public.reserve_ai_usage(
  p_visitor_id text,
  p_kind text,
  p_model text,
  p_estimated_usd numeric,
  p_daily_cap integer,
  p_monthly_call_cap integer,
  p_monthly_budget_usd numeric
)
returns table(allowed boolean, reason text, usage_id uuid)
language plpgsql
security definer set search_path = public
as $$
declare
  v_daily_count integer;
  v_monthly_count integer;
  v_monthly_spend numeric;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('palevie-ai-budget'));

  select count(*) into v_daily_count
  from public.ai_usage
  where visitor_id = p_visitor_id
    and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc';

  if v_daily_count >= p_daily_cap then
    return query select false, 'Daily AI scan limit reached. Try again tomorrow.'::text, null::uuid;
    return;
  end if;

  select count(*), coalesce(sum(estimated_usd), 0)
  into v_monthly_count, v_monthly_spend
  from public.ai_usage
  where created_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc';

  if v_monthly_count >= p_monthly_call_cap then
    return query select false, 'Monthly AI scan call cap reached. Use the free quiz for now.'::text, null::uuid;
    return;
  end if;

  if v_monthly_spend + p_estimated_usd > p_monthly_budget_usd then
    return query select false, 'Monthly AI budget reached. Use the free quiz for now.'::text, null::uuid;
    return;
  end if;

  insert into public.ai_usage(visitor_id, kind, model, estimated_usd, status)
  values (left(p_visitor_id, 80), left(p_kind, 80), left(p_model, 120), greatest(p_estimated_usd, 0), 'reserved')
  returning id into v_id;

  return query select true, null::text, v_id;
end;
$$;

-- -----------------------------
-- Row-level security
-- -----------------------------
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.usage_events enable row level security;
alter table public.events enable row level security;
alter table public.outbound_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.ai_usage enable row level security;

-- User-facing rows
DROP POLICY IF EXISTS "profiles own row" ON public.profiles;
create policy "profiles own row" on public.profiles for select using (auth.uid() = id);
DROP POLICY IF EXISTS "profiles own update" ON public.profiles;
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- SECURITY: block self-upgrade. Even though a user may UPDATE their own profile row
-- (to change tone_profile etc.), this trigger rejects any change to billing/plan/usage
-- columns unless the change is made by the service role (webhook / server RPC).
-- Without this, a user could set plan='plus' for free via the RLS update policy.
create or replace function public.protect_billing_columns()
returns trigger language plpgsql security definer as $$
begin
  if current_setting('role', true) = 'service_role' then
    return new;
  end if;
  if new.plan is distinct from old.plan
     or new.subscription_status is distinct from old.subscription_status
     or new.ls_subscription_id is distinct from old.ls_subscription_id
     or new.ls_customer_id is distinct from old.ls_customer_id
     or new.ls_customer_portal_url is distinct from old.ls_customer_portal_url then
    raise exception 'billing columns are read-only for users';
  end if;
  return new;
end; $$;
drop trigger if exists guard_billing on public.profiles;
create trigger guard_billing before update on public.profiles
  for each row execute function public.protect_billing_columns();

DROP POLICY IF EXISTS "analyses own rows" ON public.analyses;
create policy "analyses own rows" on public.analyses for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "analyses own insert" ON public.analyses;
create policy "analyses own insert" on public.analyses for insert with check (auth.uid() = user_id);
DROP POLICY IF EXISTS "analyses own delete" ON public.analyses;
create policy "analyses own delete" on public.analyses for delete using (auth.uid() = user_id);

-- usage/analytics/AI tables intentionally have no anon policies.
-- Server routes write them with the service role key only.

revoke all on function public.reserve_ai_usage(text,text,text,numeric,integer,integer,numeric) from public, anon, authenticated;
grant execute on function public.reserve_ai_usage(text,text,text,numeric,integer,integer,numeric) to service_role;
