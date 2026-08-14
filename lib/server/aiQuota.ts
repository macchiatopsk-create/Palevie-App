import { getSupabaseAdmin } from "./supabaseAdmin";

export type AiReservation = {
  allowed: boolean;
  reason?: string;
  usageId?: string;
  mode: "disabled" | "dev-no-server-quota" | "enforced";
  estimatedUsd: number;
};

function positiveNumber(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function reserveAiUsage(visitorId: string, kind = "color_scan", model = "") : Promise<AiReservation> {
  const estimatedUsd = positiveNumber(process.env.PALEVIE_AI_ESTIMATED_COST_PER_SCAN_USD, 0.01);
  if (process.env.PALEVIE_AI_ENABLED === "false") return { allowed: false, reason: "AI scans are temporarily paused.", mode: "disabled", estimatedUsd };

  const dailyCap = Math.max(1, Math.floor(positiveNumber(process.env.PALEVIE_AI_USER_DAILY_CALL_CAP, 2)));
  const monthlyCallCap = Math.max(1, Math.floor(positiveNumber(process.env.PALEVIE_AI_MONTHLY_CALL_CAP, 10000)));
  const monthlyBudgetUsd = positiveNumber(process.env.PALEVIE_AI_MONTHLY_BUDGET_USD, 100);
  const db = getSupabaseAdmin();

  if (!db) {
    // Development only. Production should configure Supabase so the cap is enforceable across server instances.
    return { allowed: true, mode: "dev-no-server-quota", estimatedUsd };
  }

  // Preferred production path: atomic RPC created by supabase/schema.sql.
  const { data: rpcData, error: rpcError } = await db.rpc("reserve_ai_usage", {
    p_visitor_id: visitorId,
    p_kind: kind,
    p_model: model,
    p_estimated_usd: estimatedUsd,
    p_daily_cap: dailyCap,
    p_monthly_call_cap: monthlyCallCap,
    p_monthly_budget_usd: monthlyBudgetUsd,
  });

  if (!rpcError && Array.isArray(rpcData) && rpcData[0]) {
    const row = rpcData[0] as { allowed?: boolean; reason?: string; usage_id?: string };
    return {
      allowed: Boolean(row.allowed),
      reason: row.reason || undefined,
      usageId: row.usage_id || undefined,
      mode: "enforced",
      estimatedUsd,
    };
  }

  // Compatibility fallback for an older schema. Conservative: fail closed if queries fail.
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const [{ count: userCount, error: userErr }, { data: monthRows, count: monthCount, error: monthErr }] = await Promise.all([
    db.from("ai_usage").select("id", { count: "exact", head: true }).eq("visitor_id", visitorId).gte("created_at", dayStart),
    db.from("ai_usage").select("estimated_usd", { count: "exact" }).gte("created_at", monthStart),
  ]);
  if (userErr || monthErr) return { allowed: false, reason: "AI quota service unavailable.", mode: "enforced", estimatedUsd };
  const estimatedMonthSpend = (monthRows || []).reduce((sum, row: { estimated_usd?: number | string | null }) => sum + Number(row.estimated_usd || 0), 0);
  if ((userCount || 0) >= dailyCap) return { allowed: false, reason: "Daily AI scan limit reached. Try again tomorrow.", mode: "enforced", estimatedUsd };
  if ((monthCount || 0) >= monthlyCallCap) return { allowed: false, reason: "Monthly AI scan call cap reached. Use the free quiz for now.", mode: "enforced", estimatedUsd };
  if (estimatedMonthSpend + estimatedUsd > monthlyBudgetUsd) return { allowed: false, reason: "Monthly AI budget reached. Use the free quiz for now.", mode: "enforced", estimatedUsd };
  const { data: inserted, error } = await db.from("ai_usage").insert({ visitor_id: visitorId, kind, model, estimated_usd: estimatedUsd, status: "reserved" }).select("id").single();
  if (error) return { allowed: false, reason: "Could not reserve AI usage.", mode: "enforced", estimatedUsd };
  return { allowed: true, usageId: inserted?.id, mode: "enforced", estimatedUsd };
}

export async function finalizeAiUsage(usageId: string | undefined, status: "completed" | "failed", providerUsage?: unknown) {
  if (!usageId) return;
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from("ai_usage").update({ status, provider_usage: providerUsage ?? null, finalized_at: new Date().toISOString() }).eq("id", usageId);
}
