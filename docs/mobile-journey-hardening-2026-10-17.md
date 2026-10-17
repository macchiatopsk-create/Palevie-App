# Mobile journey hardening — 2026-10-17

Owner approved fixing the remaining issues without introducing paid features.

## Changes
- Camera ratings require the current video element to be playing frames from the current live, unmuted stream. Waiting/stalled/muted states disable ratings; playback can recover or time out. Rapid start taps are locked, stale play failures cannot end a replacement stream, and late permission after switching to mirror is cleaned up.
- Reset-password session loading and submission handle rejected requests, repeated submits and unmount. Saving does not redirect until success. Retry/status and an explicit return-to-account link remain accessible.
- New-password forms use a shared local length/common-pattern check. Existing-password sign-in is unchanged. No password data is sent to a new provider or added to analytics.
- The SDK already initializes a one-use URL code with detectSessionInUrl; AccountClient no longer attempts to exchange it a second time.

## Scope of password mitigation
The 12-character/common-pattern form check is supplemental, not a leaked-password database check and not a Supabase server enforcement change. It does not make Supabase's Pro-only leaked-password advisor disappear. No plan upgrade, paid hook, paid API, external password lookup or existing password change is performed. Email-link login remains available.

## Tests
The existing free-service regression suite remains mandatory at build. `node scripts/test-mobile-safety.cjs` covers pure password and video-readiness decisions. `scripts/test-mobile-journey.cjs` runs the built app in mobile-sized Chromium/WebKit using simulated Auth responses, camera sources and an intercepted Amazon destination. No customer credentials, actual email delivery, purchase, production telemetry or provider call is used.

The GitHub workflow uses a standard Ubuntu runner only on a public repository, read-only token permissions, no stored credentials, no paid runner, no cache and no artifact upload. A workflow attempt is not a passing result: inspect the actual final check before claiming success. Mobile emulation is not a physical iPhone, the Instagram application, real camera hardware or real Amazon inventory verification.
