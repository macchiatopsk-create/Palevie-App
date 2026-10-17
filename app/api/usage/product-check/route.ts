import { NextResponse } from "next/server";
/** Local deterministic checks have no paid/monthly entitlement gate.
 * External AI has a separate, server-enforced cost budget.
 */
export async function POST() {
  return NextResponse.json({ allowed: true, plan: "free", mode: "free" });
}
