# Deployment and Free-Tier Strategy — KINNIPAW

## Environments

- Local development.
- Development/preview.
- Staging or beta.
- Production.

The Supabase free plan has a limited number of active projects, so do not create many redundant projects. Keep development and production isolated and review current quotas before setup.

## Candidate stack

- GitHub for repository and CI.
- Supabase for PostgreSQL, Auth, Storage and Realtime.
- Vercel Hobby for personal/non-commercial preview only if current terms permit.
- For commercial web deployment, choose a provider/plan whose terms explicitly allow commercial use. Cloudflare Workers may be considered after Next.js runtime compatibility testing.
- Expo/EAS for mobile builds within current plan quotas.
- Domain is optional for local development; purchase only after brand clearance.

## Free-tier reality

Free tiers can change, pause inactive projects, limit database/storage/bandwidth/CPU/builds/email and provide no production SLA. Treat them as development/beta resources, not guaranteed commercial infrastructure. Re-check pricing, terms, quotas, retention and data-processing conditions before launch.

Previously observed Supabase Free figures were approximately 500 MB database, 1 GB file storage, 5 GB egress and 50,000 monthly active users, with project pausing after inactivity; these are a research snapshot, not a guarantee. Check the official current pricing/docs before provisioning.

Vercel Hobby is intended for personal/non-commercial use under its terms; do not host a commercial KINNIPAW business on it unless an eligible plan/terms permit it.

## Mobile store costs

Historically published registration fees: Google Play Console $25 one-time; Apple Developer Program $99/year. New personal Google Play developer accounts may require closed testing before production access. Verify current rules and local payment/tax details before registering.

## Secrets

- Commit `.env.example` only.
- Use deployment secret stores for server credentials.
- Treat `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` as public.
- Rotate credentials if exposed.

## Backup and recovery

- Define backup cadence and retention.
- Test restore into a non-production environment.
- Keep migration history in Git.
- Document RPO/RTO expectations before public launch.
- Do not claim recovery readiness without a successful restore test.

## Go-live checklist

- Domain and brand clearance.
- Privacy/Terms/Community Guidelines reviewed.
- Production SMTP configured.
- Error monitoring and structured logs.
- Moderation process staffed.
- RLS and security tests pass.
- Account deletion and data export/retention decisions implemented.
- Backup/restore tested.
- Production quotas and cost alerts configured.
- Git remote synchronization verified (origin: https://github.com/ismail-2901/kinnipaw.git, branch: main).
