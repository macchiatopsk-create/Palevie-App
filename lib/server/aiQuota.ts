import { getSupabaseAdmin } from "./supabaseAdmin";
import { createHmac } from "crypto";

// Client-controlled visitor IDs must not buy a new quota by rotating.
export function quotaSubject(_visitorId: string, request: Request): string {
  const header = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")
    : request.headers.get("x-forwarded-for");
  const ip = (header || "").split(",")[0].trim();
  const salt = process.env.PALEVIE_AI_QUOTA_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ip || ip.length > 100 || !salt) return "";
  // Rotation bounds retention/linkability. Raw addresses never enter the database.
  const day = new Date().toISOString().slice(0,10);
  return createHmac("sha256", salt).update(`palevie-ai|${day}|${ip}`).digest("hex");
}
export type AiReservation = {
  allowed: boolean; reason?: string; usageId?: string;
  mode: "disabled" | "enforced"; estimatedUsd: number;
};
function nonnegative(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : fallback;
}
export async function reserveAiUsage(subject: string, kind = "color_scan", model = ""): Promise<AiReservation> {
  const estimatedUsd = nonnegative(process.env.PALEVIE_AI_ESTIMATED_COST_PER_SCAN_USD, 0.01);
  const denied = (reason: string, mode: "disabled" | "enforced" = "enforced"): AiReservation => ({allowed:false,reason,mode,estimatedUsd});
  if (process.env.PALEVIE_AI_ENABLED !== "true") return denied("Optional AI is currently paused. The quiz and local color checks remain free.", "disabled");
  const dailyCap = Math.floor(nonnegative(process.env.PALEVIE_AI_USER_DAILY_CALL_CAP, 2));
  // No implicit dollar budget. Enabling AI requires an explicit operating cap.
  const monthlyCallCap = Math.floor(nonnegative(process.env.PALEVIE_AI_MONTHLY_CALL_CAP, 0));
  const monthlyBudgetUsd = nonnegative(process.env.PALEVIE_AI_MONTHLY_BUDGET_USD, 0);
  if (!/^[a-f0-9]{64}$/.test(subject) || !model || estimatedUsd <= 0 || !dailyCap || !monthlyCallCap || !monthlyBudgetUsd) return denied("Optional AI is unavailable. Continue with the free quiz or local color checks.");
  try {
    const db = getSupabaseAdmin();
    if (!db) return denied("AI usage protection is unavailable. Please try the free quiz instead.");
    const { data, error } = await db.rpc("reserve_ai_usage", {
      p_visitor_id: subject, p_kind: kind, p_model: model,
      p_estimated_usd: estimatedUsd, p_daily_cap: dailyCap,
      p_monthly_call_cap: monthlyCallCap, p_monthly_budget_usd: monthlyBudgetUsd,
    });
    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row || typeof row.allowed !== "boolean") return denied("AI usage protection is unavailable. Please try again later.");
    if (!row.allowed) return denied(String(row.reason || "AI fair-use limit reached. Try again later.").slice(0,200));
    const id = String(row.usage_id ?? "");
    if (!/^\d+$/.test(id)) return denied("Could not reserve AI usage safely.");
    return { allowed:true, usageId:id, mode:"enforced", estimatedUsd };
  } catch { return denied("AI usage protection is unavailable. Please try again later."); }
}
export async function finalizeAiUsage(usageId: string | undefined, status: "completed" | "failed", providerUsage?: unknown) {
  if (!usageId || !/^\d+$/.test(String(usageId))) return;
  try {
    const db = getSupabaseAdmin(); if (!db) return;
    const usage = providerUsage && typeof providerUsage === "object" ? providerUsage : null;
    await db.from("ai_usage").update({status,provider_usage:usage,finalized_at:new Date().toISOString()}).eq("id",usageId);
    // Keep the reserved estimated cost even when a provider request times out.
  } catch { /* Failure to finalize must not trigger a second provider request. */ }
}
