-- Preserve all existing profiles, billing history fields and customer records.
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id,email,plan,tone_profile,color_profile,skin_profile,ls_customer_portal_url,created_at,updated_at) ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (tone_profile,color_profile,skin_profile,updated_at) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL DEFAULT '',
  profile_id text NOT NULL,
  profile_name text NOT NULL,
  dominant_hex text NOT NULL CHECK (dominant_hex ~ '^#[0-9A-Fa-f]{6}$'),
  score double precision NOT NULL CHECK (score BETWEEN 0 AND 100),
  color_fit double precision NOT NULL CHECK (color_fit BETWEEN 0 AND 100),
  verdict text NOT NULL CHECK (verdict IN ('BUY','MAYBE','SKIP')),
  summary text NOT NULL DEFAULT '',
  alternatives jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(alternatives)='array'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.analyses FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
CREATE POLICY "analyses self read" ON public.analyses FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
CREATE POLICY "analyses self delete" ON public.analyses FOR DELETE TO authenticated USING ((SELECT auth.uid())=user_id);
CREATE INDEX IF NOT EXISTS analyses_user_created_idx ON public.analyses (user_id,created_at DESC);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS events_event_id_key ON public.events(event_id);
CREATE INDEX IF NOT EXISTS events_created_name_idx ON public.events(created_at,event_name);
CREATE INDEX IF NOT EXISTS events_visitor_created_idx ON public.events(visitor_id,created_at);
CREATE INDEX IF NOT EXISTS outbound_clicks_created_idx ON public.outbound_clicks(created_at);
CREATE INDEX IF NOT EXISTS ai_usage_subject_created_idx ON public.ai_usage(visitor_id,created_at);
CREATE INDEX IF NOT EXISTS ai_usage_created_idx ON public.ai_usage(created_at);

CREATE OR REPLACE FUNCTION public.reserve_ai_usage(
  p_visitor_id text, p_kind text, p_model text, p_estimated_usd numeric,
  p_daily_cap integer, p_monthly_call_cap integer, p_monthly_budget_usd numeric
) RETURNS TABLE(allowed boolean, reason text, usage_id text)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public
AS $$
DECLARE
  v_day timestamptz := date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  v_month timestamptz := date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  v_calls bigint; v_daily bigint; v_spend numeric; v_id bigint;
BEGIN
  IF p_visitor_id IS NULL OR p_visitor_id !~ '^[a-f0-9]{64}$'
     OR p_kind IS NULL OR p_kind NOT IN ('color_scan','shopping_explanation')
     OR p_model IS NULL OR length(p_model) NOT BETWEEN 1 AND 120
     OR p_estimated_usd IS NULL OR p_estimated_usd <= 0 OR p_estimated_usd::text IN ('NaN','Infinity','-Infinity')
     OR p_daily_cap IS NULL OR p_daily_cap <= 0
     OR p_monthly_call_cap IS NULL OR p_monthly_call_cap <= 0
     OR p_monthly_budget_usd IS NULL OR p_monthly_budget_usd <= 0 OR p_monthly_budget_usd::text IN ('NaN','Infinity','-Infinity') THEN
    RETURN QUERY SELECT false,'Optional AI is unavailable. Free non-AI features remain available.'::text,NULL::text; RETURN;
  END IF;
  -- All instances and both AI features reserve under one transaction lock.
  PERFORM pg_advisory_xact_lock(7631249185021::bigint);
  SELECT count(*),coalesce(sum(estimated_usd),0) INTO v_calls,v_spend FROM public.ai_usage WHERE created_at >= v_month;
  SELECT count(*) INTO v_daily FROM public.ai_usage WHERE visitor_id=p_visitor_id AND created_at >= v_day;
  IF v_daily >= p_daily_cap THEN RETURN QUERY SELECT false,'AI fair-use limit reached. Try again tomorrow.'::text,NULL::text; RETURN; END IF;
  IF v_calls >= p_monthly_call_cap OR v_spend + p_estimated_usd > p_monthly_budget_usd THEN
    RETURN QUERY SELECT false,'Optional AI budget reached. The quiz and local color checks remain free.'::text,NULL::text; RETURN;
  END IF;
  INSERT INTO public.ai_usage(visitor_id,kind,model,estimated_usd,status) VALUES (p_visitor_id,p_kind,p_model,p_estimated_usd,'reserved') RETURNING id INTO v_id;
  RETURN QUERY SELECT true,NULL::text,v_id::text;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_ai_usage(text,text,text,numeric,integer,integer,numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_usage(text,text,text,numeric,integer,integer,numeric) TO service_role;
NOTIFY pgrst, 'reload schema';
