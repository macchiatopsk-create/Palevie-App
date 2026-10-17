import { NextResponse } from "next/server";
/** Legacy billing is retired. Never let a delayed webhook grant a paid tier.
 * This does not cancel any subscription at an external payment processor.
 */
export async function POST() {
  return NextResponse.json({ error: "Palevie billing is retired.", code: "billing_retired" }, { status: 410 });
}
