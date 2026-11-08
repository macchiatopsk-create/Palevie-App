# PALEVIE first marketing-team run — 2026-11-08

## Integration decision
Port the *operating method*, not the Claude runtime. The upstream has 100 Claude-oriented marketing skills and 17 chains; putting its entire directory in a Next.js repo does not install agents, video editing or Instagram publishing.

## Three distinct footage-first pilot ideas
1. **Beauty Close-Up:** original or commercially licensed footage of a hand applying a real lip product, constant lighting, then a finish change. 9–12 seconds. Currently BLOCKED until video and usage rights are secured.
2. **Beauty POV:** real vanity/handbag footage with someone choosing between already-owned products, a single funny subtitle, no fake testimonial. Currently BLOCKED.
3. **Live UI walkthrough:** real screen recording from the current PALEVIE app, A/B color preview, privacy caveat, no false accuracy claims. Currently BLOCKED until recording and verification.

Do not buy new services, authorize posting or push private analytics to public GitHub to complete this pilot.

## Actual signal read (not stored publicly)
PALEVIE's connected Metricool results show 4-shade battle content at roughly four-digit views and some newer styling treatments at low hundreds of views. This is directional, not proof of generalization or verified conversions. Full account exports are deliberately excluded from the repository.

## Local reproducible checks
    npm run marketing:report -- marketing-team/inputs/sample-reels.json
    npm run marketing:review -- marketing-team/briefs/pilot-real-beauty.json
    npm run test:marketing

The first output is expressly synthetic; the second intentionally exits BLOCKED; the third runs offline regression checks.

## Before scheduling anything
Review the actual final MP4 on a phone; obtain rights evidence in private storage; fill the brief; run preflight; get explicit approval for that exact video, caption and target time; then use the connected Metricool tool. A new GitHub file does not create or publish media.
