import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth lands here instead of straight on /account. This is a bare 307 with no
 * HTML to render, which is what the installed app needs: coming back from the
 * Google custom tab, a full page render sometimes loses the race and the
 * WebView shows its own "page couldn't load" screen. A redirect response is
 * cheap enough to survive that hand-off, and /account still does the code
 * exchange exactly as before.
 */
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = new URL("/account", url.origin);
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  return NextResponse.redirect(target, 307);
}
