# Palevie traffic quality and engaged visits

## What we can and cannot measure

- **Engaged visitors** = distinct anonymous visitor IDs with a `visitor_interacted` event during the checked period, excluding IDs in `analytics_visitor_labels` marked `owner_test` or `internal_test`, and excluding the placeholder ID `server`. The event is created only on a trusted visible-page pointer, touch or keyboard gesture, with automated WebDriver contexts excluded on the client and common robot user agents rejected on the server.
- This is a **conservative proxy for likely human activity, not a guarantee of a unique real person**. It can undercount real visitors who just read a page, and sophisticated automation can generate trusted browser input. A visitor on two devices can count twice.
- **Unverified arrivals** = anonymous pageview visitor IDs with no interaction evidence in the same period. Some are real human bounces, some may be crawlers. Never count these as confirmed people or insist they are all bots.
- **Internal/owner activity** = IDs recorded in `public.analytics_visitor_labels`, plus `server`. Never include these in customer/affiliate conversion metrics.
- `quiz_intro_shown`, `shop_viewed`, and `welcome_quiz_popup_shown` are automatically emitted when the UI renders, and do NOT qualify as human interaction.
- Product-link server requests and website uptime checks are not visitors. `outbound_clicks.visitor_id='server'` is excluded, even if there are hundreds of requests.

## Query for the next on-demand traffic check

Use exact requested date bounds (UTC) and check table column names. Substitute timestamps, not paths:

```sql
WITH external AS (
 SELECT visitor_id,event_name
 FROM public.events e
 WHERE created_at >= :from_utc::timestamptz
   AND created_at < :to_utc::timestamptz
   AND visitor_id NOT IN ('server','anonymous')
   AND NOT EXISTS (
     SELECT 1 FROM public.analytics_visitor_labels l
     WHERE l.visitor_id=e.visitor_id
       AND l.classification IN ('owner_test','internal_test')
   )
),
engaged AS (
 SELECT DISTINCT visitor_id FROM external
 WHERE event_name='visitor_interacted'
)
SELECT
  (SELECT count(*) FROM engaged) AS engaged_visitors,
  (SELECT count(DISTINCT visitor_id) FROM external WHERE event_name='page_view') AS total_unverified_plus_engaged_pageview_visitors,
  (SELECT count(DISTINCT e.visitor_id) FROM external e
   WHERE event_name='page_view'
     AND e.visitor_id NOT IN (SELECT visitor_id FROM engaged)) AS pageview_visitors_without_gesture;
```

### Historical checkpoint — before gesture tracking

For 2026-10-15 19:28:46 through 23:28:01 New York time:
- 30 unique non-owner, non-server pageview visitor IDs, 42 page views.
- 23 IDs had one homepage pageview and no subsequent feature event.
- One ID repeatedly loaded the exact same paid Instagram landing URL 13 times with no quiz answer, at roughly periodic intervals. Flag as suspicious automated/reload behavior; not demonstrably a unique engaged human.
- Six other IDs fired only auto-render feature events (quiz_intro, shop_viewed, welcome popups) but **no explicit interaction**.
- 157 product-link requests used the placeholder ID `server`, one was an owner test; these are not known customer checkout clicks.
- No reliably verified human unique count can be reconstructed from these historical events. Do not retroactively mark all 6 as human.
- Future `visitor_interacted` signals start **only after** deploying the tracker.

Analytics/privacy: record only the presence and coarse method of interaction, not typing content, exact key, click target, device fingerprint, IP address or pointer location. `analytics_visitor_labels` is a private analyst-maintained table.
