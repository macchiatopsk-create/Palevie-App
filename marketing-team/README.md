# PALEVIE Marketing Ops — v1 (2026-11-08)

A working, offline marketing audit and pre-publication quality gate for PALEVIE. The workflow is adapted from the public MIT-licensed [steveaimkt/marketing-team](https://github.com/steveaimkt/marketing-team) project (not the Claude plugin itself). No external repository is vendored or executed.

**Important: this does not install the Claude plugin, and it does not generate MP4 videos or automatically publish Instagram posts.** The upstream is a Claude Desktop/Claude Code plugin; its 100 skills are mostly planning/QA templates, not a video-renderer or Instagram-posting engine. These two dependency-free CLI commands run in this Next.js repository.

## Implemented
1. Reel analytics report — local JSON export ranks measured views, reach, interaction totals and average watch duration separately. Does NOT invent retention, followers gained, sales, or actual human visits from views.
2. PALEVIE reel preflight — checks a proposed video brief for real footage, rights, actual final-video review, quality, truthful claims and explicit owner approval. It fails closed before any scheduling.
3. Pilot content brief — a real-hand / real-lips beauty concept is deliberately **BLOCKED** until an actual rights-cleared video is obtained and reviewed.
4. Private by default — connected-account exports and rights/consent artifacts belong in ignored local folders, not the public GitHub repository.

## Use (Node.js; no new package dependencies)

    npm run marketing:report -- marketing-team/inputs/sample-reels.json
    npm run marketing:review -- marketing-team/briefs/pilot-real-beauty.json
    npm run test:marketing

The report sample is **synthetic/demo data**, not PALEVIE statistics. The pilot review exits with status 2 (intentionally blocked). To analyze real Reels, obtain a Metricool export through the authorized connected Metricool service, map the fields using the sample schema and save it to marketing-team/inputs/private/; never commit account exports to this public repository.

    npm run marketing:report -- marketing-team/inputs/private/reels-export.json

Each record requires an ID, post date, title, format, views, reach, likes, comments, saves and shares; average watch time is optional. A view is not a unique person, and average watch time is not video completion or 3-second view rate.

## Five-stage weekly operating flow

| Stage | Role / upstream influence | Evidence needed | Output |
|---|---|---|---|
| 1. MEASURE | Growth analyst (upstream #039) | Metricool account performance, website visits reported separately | Ranked signal + low-data cautions |
| 2. DESIGN | Creative strategist (#031, #040) | Distinct visual concept, strong first two seconds | A short shot list + one CTA |
| 3. SHOOT/EDIT | Production editor (#026 adapted) | Real human/product action or genuine screen demo | Actual 9:16 MP4 |
| 4. REVIEW | Rights + brand QA (upstream review gates adapted) | License/filming permission, audio, false-claim check, mobile viewing | preflight gate + human viewing |
| 5. APPROVE/PUBLISH | PALEVIE owner + connected Metricool | Owner explicitly approves the reviewed final video + caption | Human-directed scheduled post and 24h/72h analysis |

The quality checker **only verifies metadata assertions**; it cannot watch video pixels, establish license validity or certify releases. A human must watch the finished file, inspect the applicable rights evidence and personally approve the post.

This package never reads Supabase keys, OpenAI keys, Instagram passwords or Metricool tokens; it cannot publish. ChatGPT's connected Metricool plugin is the separate scheduling and analytics integration. **Do not schedule from a status flag alone.**

## Formats
- shade-battle: retain the existing series as a baseline, not every post.
- beauty-real / beauty-pov: actual original or licensed footage with a person's real hands, face or cosmetics in action; no slideshow pretending to be beauty footage.
- color-lab: verifiable color experiments; no fabricated identical colors.
- screen-demo: record the actual current site; don't invent a functioning app interface.

At launch test three markedly different finished cuts before attempting 5–6 uploads daily; prioritize quality and credible engagement. See [OPERATING-RULES.md](./OPERATING-RULES.md) and [PILOT.md](./PILOT.md).

## Privacy and costs
- No API keys, paid APIs or new subscriptions are introduced. Scripts are offline.
- Do not commit raw audience analytics, visitor records, licensed media, model releases or invoices. The inputs/private and reports/private folders are gitignored.
- Rights evidence belongs in a privately held producer record.
- Automated posting, external outreach, purchases and live website changes require separate explicit authorization.

## Attribution
Approach influenced by [marketing-team](https://github.com/steveaimkt/marketing-team), copyright its contributors, [MIT License](https://github.com/steveaimkt/marketing-team/blob/main/LICENSE). Original PALEVIE-specific CLI and operating text; upstream Claude code is **not** embedded or running. No affiliation or guarantees by the upstream authors.

Also see [docs/marketing/muse-current-quiz-copy.md](../docs/marketing/muse-current-quiz-copy.md) and [docs/analytics/measurement-v2.md](../docs/analytics/measurement-v2.md).
