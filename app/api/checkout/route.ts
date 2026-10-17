import { NextResponse } from "next/server";
import { FREE_SERVICE_MESSAGE } from "@/lib/servicePolicy";
export async function POST() {
  return NextResponse.json({ error: FREE_SERVICE_MESSAGE, code: "billing_retired" }, { status: 410 });
}
