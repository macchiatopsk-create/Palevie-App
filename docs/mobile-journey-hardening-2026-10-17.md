# Mobile journey hardening — 2026-10-17

Owner approved fixing remaining issues without introducing paid features.

## Changes
- Camera ratings require current frame readiness and the current live, unmuted stream. Waiting/stalled/muted states disable ratings; playback can recover or time out. Rapid start taps are locked, stale play failures cannot end a replacement stream, and late permission after switching to mirror is cleaned up.
- Reset-password session loading/submission handle rejected requests, repeated submits and unmount. Saving does not redirect until success. Retry/status and a return-to-account link remain accessible.
- New-password forms use a shared local length/common-pattern check. Existing-password sign-in is unchanged. Password data is never sent to a new provider or included in telemetry.
- Account no longer attempts a second one-use URL code exchange after SDK initialization.

## Password scope
The 12-character/common-pattern form check is supplemental, not a leaked-password database and not a Supabase server enforcement change. It does not clear Supabase's paid-plan native protection warning. No plan upgrade, paid hook/API, external password lookup or existing password change was performed. Email-link login remains available.

## Test scope and an initial test-harness correction
The 12 actual-module mobile safety checks and existing 42 free-service regression checks passed on the initial preview. Browser validation uses Chromium/WebKit mobile emulation of a local production build with simulated Auth and camera sources. These are not physical iPhone or Instagram WebView tests.

The initial browser harness continued a local /go request and incorrectly assumed browser routing would re-intercept the redirect chain. It reached an external Amazon response before the test failed on an Amazon logging request. This was a test-isolation defect, not evidence that the product card had the wrong ASIN. No purchase was made and the Palevie server was local without production database credentials. The harness is corrected to call the local redirect handler with maxRedirects:0, validate the returned status and exact Amazon /dp/ Location, then fulfill a local placeholder. It no longer follows the external destination. Passing this check does not verify Amazon inventory or checkout.

The browser suite reports every scenario and fails the job if any fail. Inspect actual completed checks before claiming success. The workflow uses a standard runner only for a public repository, read-only token, no stored credentials, no cache/artifact uploads, and no paid runners.
