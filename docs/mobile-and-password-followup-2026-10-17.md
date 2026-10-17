# Free mobile-flow and password-safety follow-up — 2026-10-17

Base: main 2a1fa44a20ee9be7e4d947375f3b35b78c5c81f3. Scope is targeted corrections, not a storefront redesign or a new paid service.

## Fixes
- ResetPasswordClient previously lacked a pending-submit lock and getSession/updateUser rejection handling. It now has form/keyboard submission, a synchronous duplicate lock, blocked inputs while saving, session-load timeout messaging, cleanup, and explicit success confirmation without a delayed forced redirect.
- All password signup and password-changing requests made through the shared browser Supabase client pass through one app-level guard. The check uses the free, unauthenticated HIBP Pwned Passwords range API; only the first five characters of a SHA-1 lookup hash are sent to a prefix-only POST endpoint. No raw password/full hash/email is sent to HIBP. Password storage remains with Supabase. New passwords require 12 characters and at most 72 UTF-8 bytes; existing password sign-in and non-password profile updates are unchanged. Outage/malformed data is not treated as a successful check. Email sign-in remains available.
- This does NOT enable Supabase's Pro-only server-side leaked-password setting. Direct Auth API clients can bypass the app-side guard; the dashboard warning may remain. No paid upgrade or server-side enforcement claim is made.
- Camera rating rechecks current video/stream identity, dimensions, playback/readiness and live, unmuted video tracks at the exact click. Waiting/stalled/empty/muted preview states disable controls. Late play rejections from an old session cannot stop a replacement camera. A synchronous request guard prevents duplicate permission requests before React rerenders. Existing mirror fallback and on-device privacy remain.
- Instagram/Facebook browser users see an alternate-browser explanation when permission is unavailable, without being forced out of mirror mode.

## Tests and limits
The added regression suite runs real source modules and React component handlers in an isolated simulated browser runtime. No real customer account, external password, production analytics or paid API request is used as a fixture. Physical iPhone/Android/Instagram browser permissions and a real Amazon order are not certified by these tests or Vercel READY.

Shop catalog and exact-ASIN eligibility, 1/2/3 columns, quiz count, free-service billing retirement and AI budgets are unchanged. Database settings and records are unchanged by this PR. Customer passwords already set are not known to us and are not retroactively scanned.

Primary references (checked 2026-10-17):
- https://supabase.com/docs/guides/auth/password-security — native leaked-password protection is Pro and above.
- https://haveibeenpwned.com/API/v3#PwnedPasswords — five-character range query, free keyless service, padded response, local suffix comparison.
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event — playback may stop without a pause action.
