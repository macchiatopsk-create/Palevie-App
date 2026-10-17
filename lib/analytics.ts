"use client";
import { loadAttribution } from "./attribution";
import { newLocalId, safeStorage, readStoredJson } from "./safeStorage";
export type AnalyticsEventName =
  | "page_view" | "visitor_interacted"
  | "quiz_started" | "quiz_answered" | "quiz_completed"
  | "quiz_quick_answered" | "quiz_quick_completed" | "quiz_quick_restarted" | "quiz_detailed_started"
  | "quiz_palette_feedback" | "quiz_palette_changed" | "discovery_product_clicked" | "discovery_shop_clicked"
  | "ai_scan_started" | "ai_scan_completed" | "ai_scan_failed" | "bio_consent_given"
  | "member_setup_shown" | "member_setup_done" | "member_profile_updated"
  | "shade_drape_opened" | "shade_drape_shop_click"
  | "virtual_tryon_opened" | "virtual_tryon_camera_started" | "virtual_tryon_error" | "virtual_tryon_shade_selected" | "virtual_tryon_shop_click"
  | "product_check_started" | "product_check_completed" | "skincare_profile_completed" | "shop_viewed"
  | "affiliate_outbound_click" | "result_shared" | "wishlist_added" | "wishlist_removed" | "checkout_started" | "signup_started" | "signup_completed"
  | "welcome_quiz_popup_shown" | "welcome_quiz_popup_cta" | "welcome_quiz_popup_dismissed"
  | "ad_welcome_shown" | "ad_welcome_started" | "quiz_intro_shown" | "quiz_intro_started"
  | "drape_cta_clicked" | "drape_session_started" | "drape_pair_answered" | "drape_session_completed" | "drape_color_feedback" | "drape_screen_viewed"
  | "drape_guide_shown" | "drape_guide_continued" | "drape_mode_selected"
  | "drape_camera_requested" | "drape_camera_permission_granted" | "drape_camera_started" | "drape_camera_error" | "drape_camera_color_switched";
export type StoredEvent = { id: string; name: AnalyticsEventName; ts: string; props: Record<string, unknown> };
const EVENTS_KEY = "palevie-events-v1", VISITOR_KEY = "palevie-visitor-v1";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
let tabVisitor: string | undefined;
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  if (tabVisitor) return tabVisitor;
  const stored = safeStorage.getItem(VISITOR_KEY);
  tabVisitor = stored && UUID.test(stored) ? stored : newLocalId();
  safeStorage.setItem(VISITOR_KEY, tabVisitor);
  return tabVisitor;
}
export function loadLocalEvents(): StoredEvent[] {
  const value = readStoredJson(EVENTS_KEY);
  return Array.isArray(value) ? value.filter((e): e is StoredEvent => !!e && typeof e.id === "string" && typeof e.name === "string" && typeof e.ts === "string" && !!e.props && typeof e.props === "object").slice(0,100) : [];
}
export function track(name: AnalyticsEventName, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    const event: StoredEvent = { id:newLocalId(), name, ts:new Date().toISOString(), props:{...props,attribution:loadAttribution()} };
    const body = JSON.stringify(event);
    if (body.length > 18000) return;
    safeStorage.setItem(EVENTS_KEY, JSON.stringify([event,...loadLocalEvents()].slice(0,100)));
    void fetch("/api/events", {method:"POST",headers:{"content-type":"application/json","x-palevie-visitor":getVisitorId()},body,keepalive:true}).catch(()=>{});
  } catch { /* Analytics failures are never allowed to block the UI. */ }
}
