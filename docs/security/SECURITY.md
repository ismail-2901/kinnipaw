# Security and Privacy Architecture — KINNIPAW

## Threat model priorities

Protect account sessions, private adoption applications, messages, health records, exact coordinates, push tokens, uploaded documents, provider verification data, moderation controls and admin privileges.

## Authentication

- Supabase Auth handles credential lifecycle, email verification, OAuth and password recovery.
- Web uses supported SSR session handling and secure HTTP-only cookies.
- Mobile uses secure device storage for session persistence.
- Admin accounts require MFA.
- Revoke sessions/tokens on account compromise and deletion.
- Never implement custom password storage.

## Authorization

- Route handlers authenticate every protected request.
- Use a request-scoped Supabase client carrying the user's access token for ordinary data operations so RLS remains effective.
- Apply RBAC, resource ownership, membership, assignment, status and block checks.
- Privileged service credentials only for narrowly-scoped system operations; never for ordinary CRUD.
- Test both allowed and denied access for every protected table and endpoint.

## Secrets

- `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` values are public.
- Only publish Supabase project URL and publishable key.
- Keep secret/service-role keys, AI keys and SMTP credentials in server secrets.
- `.env*` with real secrets must be gitignored; commit `.env.example` with placeholders only.
- Rotate exposed credentials and audit repository history if a secret is committed.

## Database and RLS

- Enable RLS on every exposed table.
- Use least-privilege `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies.
- Protect role, moderation and audit tables from user writes.
- Validate ownership using `auth.uid()` and relationships.
- Use transaction-safe workflows for adoption acceptance and rescue assignment.
- RLS tests must use separate guest, user, owner, applicant, moderator and admin identities.

## Storage

- Separate public media from private documents/attachments.
- Use random server-generated storage paths; do not trust supplied filenames.
- Validate MIME signature, extension, size and image dimensions.
- Strip EXIF/GPS metadata before public delivery.
- Use private buckets and short-lived signed URLs for health documents and message attachments.
- Apply Storage RLS based on owner/resource membership.
- Consider image malware scanning/processing if service and cost permit.

## Location privacy

- Public posts show area labels or coarse location only.
- Never publish a user's exact home address or raw coordinates.
- Do not collect continuous background location in MVP.
- Request device location only after explicit user action and explain why.
- Store exact coordinates only if needed for a valid workflow, restrict access and set retention rules.
- Public map pins must be deliberately fuzzed/generalized, not merely hidden by CSS.

## User-generated content and moderation

- Terms, Community Guidelines and visible reporting paths.
- Block/mute/hide controls.
- Moderation queue, reason codes and audit history.
- Abuse/rate limits for posts, messages, reports and applications.
- Human review for suspensions, adoption disputes and AI flags.
- Appeals process and clear user notices.
- Do not expose reporter identity to the reported user by default.

## AI safety

- Server-side only; no provider key in client.
- Minimize prompt data and remove personal identifiers where possible.
- AI advice is educational; never diagnosis, medication selection, dosage or emergency triage replacement.
- Encourage veterinarian assessment for concerning signs.
- AI matches are suggestions; people verify animal identity.
- Validate structured outputs and handle provider failure safely.
- Apply quotas, timeouts, output limits and retention policy.

## API security

Test OWASP API risks: object-level authorization, authentication failures, property-level authorization, unrestricted resource consumption, function-level authorization, sensitive business-flow abuse, SSRF/external API handling, misconfiguration and unsafe third-party consumption.

## Account deletion and retention

Create a documented request, re-authentication where appropriate, export/confirmation, anonymization/deletion plan, session/token revocation, Storage cleanup and audit-safe completion record. Define retention for applications, health records, messages, abuse reports and audit logs before public launch.

## Incident response

Maintain contact/response procedure, credential rotation, backups, restore test, incident record and user notification assessment. No secrets or private content in logs.
