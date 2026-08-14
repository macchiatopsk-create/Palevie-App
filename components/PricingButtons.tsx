"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { track } from "@/lib/analytics";

export default function PricingButton({ plan, label }: { plan: "monthly" | "yearly"; label: string }) {
  const [loading, setLoading] = useState(false);
  async function checkout() {
    setLoading(true);
    track("checkout_started", { plan });
    try {
      const supabase = getSupabaseBrowser();
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      const headers: Record<string,string> = { "content-type": "application/json" };
      if (session?.access_token) headers.authorization = `Bearer ${session.access_token}`;
      const r = await fetch("/api/checkout", { method: "POST", headers, body: JSON.stringify({ plan }) });
      const b = await r.json();
      if (!r.ok) {
        if (r.status === 401) throw new Error("Sign in from My Account before subscribing.");
        throw new Error(b.error || "Checkout unavailable");
      }
      if (b.url) window.location.href = b.url;
      else alert(b.message || "Stripe is not configured yet.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout unavailable");
    } finally { setLoading(false); }
  }
  return <button className="button" style={{width:"100%"}} onClick={checkout} disabled={loading}>{loading ? "Opening checkout…" : label}</button>;
}
