# Source Archive 08 — Performance, Scalability and Launch

## Performance targets (targets, not measured results)

- LCP <= 2.5 s.
- INP <= 200 ms.
- CLS <= 0.1.
- Lighthouse performance target 90+ on representative pages under documented test conditions.
- Ordinary API read p95 target <= 500 ms under a defined beta load test.

## Techniques

- Server Components by default; client components only for interactions.
- Image optimization, WebP/AVIF where supported, responsive thumbnails, lazy loading.
- Code splitting and dynamic loading for maps/heavy UI.
- Cursor pagination; stable `(created_at,id)` ordering.
- Avoid N+1 queries and `SELECT *` where unnecessary.
- Add indexes from measured query plans.
- Cache only public/safe data; never shared-cache private records.
- Keep realtime subscriptions scoped and minimal.
- Virtualize very long lists where required.

## Scaling path

Start with modular monolith + Supabase. Scale by query optimization, indexes, media CDN, controlled caching and background jobs. Extract services only after measured scaling/deployment/failure-isolation needs exist.

## Launch metrics

Track completed animal profiles, weekly active users, adoption applications and outcomes, reunions, rescue assignment time/resolution, moderation response time and D7 retention. Establish a baseline before setting numeric goals.

## Launch gates

RLS tests, API authorization tests, moderation/report/block, privacy and location controls, account deletion, backup restore, responsive testing, accessibility, no critical known bugs, Terms/Privacy/Community Guidelines and staffed moderation process.
