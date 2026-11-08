# KINNIPAW — Permanent Agent Instructions

> [!NOTE]
> Reconciled 2026-11-08 — supersedes 9-section version. HTML Foundation §15 incorporated.

## 1. Product identity

- Product working name: **KINNIPAW** (K-I-N-N-I-P-A-W).
- Working tagline: **One Platform. Every Animal. One Connected Ecosystem.**
- Product: Bangladesh-first animal community, responsible care and adoption where lawful, lost-and-found, rescue coordination and animal-welfare ecosystem for animal guardians, adopters, rescuers, volunteers and care professionals.
- Core modules: identity, profiles, animal profile management, health/care records, community feed, groups, adoption, lost-and-found, rescue coordination, messaging, notifications, professional discovery, AI assistance, administration and moderation.
- Brand status is provisional pending trademark, domain, app-store and social-handle clearance.
- Use KINNIPAW consistently in active project files, UI copy, app metadata examples and package naming.
- Never claim the name is legally unique or cleared.
- Never introduce retired or unrelated product names into active branding.
- Animal welfare, user safety, privacy, accessibility and trust take priority over growth or engagement metrics.

## 2. Source of truth and context preservation

- Read `docs/source/00-authoritative-project-context.md` first, then `docs/START_HERE.md` and the relevant canonical specifications before working.
- `docs/source/` is the preserved requirements archive. Do not edit, delete, abbreviate or overwrite its contents without explicit approval.
- Canonical documents under `docs/` are implementation references only after the documentation audit is approved.
- Documentation taxonomy:
  - Product requirements: `docs/product/PRD.md`, `USER_FLOWS.md`, `FEATURE_CATALOG.md`
  - Brand identity: `docs/product/BRAND_IDENTITY.md`
  - Architecture & ADRs: `docs/architecture/ARCHITECTURE.md`, `DECISIONS.md`, `REPOSITORY_STRUCTURE.md`
  - Database schema & migrations: `docs/database/ERD.md`, `SCHEMA_SPEC.md`, `MIGRATIONS.md`
  - Security & RBAC: `docs/security/SECURITY.md`, `RBAC.md`
  - API & OpenAPI contracts: `docs/api/API.md`, `openapi.yaml`
  - Design & accessibility: `docs/design/UI_UX_SPEC.md`, `DESIGN_SYSTEM.md`, `RESPONSIVE_SPEC.md`, `ACCESSIBILITY.md`
  - Mobile specifications: `docs/mobile/MOBILE_SPEC.md`
  - AI capabilities & safety: `docs/ai/AI_SPEC.md`
  - Operations & runbooks: `docs/operations/DEPLOYMENT.md`, `ENVIRONMENT_VARIABLES.md`, `BACKUP_RECOVERY.md`
  - Testing strategy: `docs/testing/TEST_STRATEGY.md`
  - Tooling & skills: `docs/TOOLING.md`
  - Roadmap & execution tasks: `docs/roadmap/ROADMAP.md`, `TASKS.md`, `DOCUMENTATION_AUDIT.md`
  - Traceability matrix: `docs/TRACEABILITY.md`
  - Open questions & decisions: `docs/OPEN_QUESTIONS.md`, `docs/decisions/OPEN_DECISIONS.md`
- Never silently remove, defer, merge, simplify or replace an approved requirement.
- Record ambiguity and conflicts in `docs/OPEN_QUESTIONS.md`.
- Record accepted architecture changes in `docs/architecture/DECISIONS.md`.
- Update `docs/TRACEABILITY.md` whenever a requirement is documented, implemented, tested or intentionally deferred.
- If context is unavailable, inspect the repository. Do not assume information from an earlier chat that is not recorded in files. The repository is the durable project memory.

## 3. Approved technical direction

- Monorepo: pnpm workspaces + Turborepo.
- Web: Next.js App Router + strict TypeScript + React Server Components.
- Mobile: React Native + Expo + Expo Router.
- Database: Supabase PostgreSQL + PostGIS where location queries require it.
- Authentication: Supabase Auth.
- Storage: Supabase Storage.
- Realtime: Supabase Realtime for authorized live features only.
- Shared API: versioned REST API through Next.js Route Handlers (`/api/v1`) with OpenAPI contracts.
- Validation: Zod at every external input boundary and contract definition.
- Server-state client: TanStack Query where useful; local UI state only when needed.
- Web UI: Tailwind CSS + shadcn/ui/Radix primitives.
- Mobile UI: native React Native components; share design tokens and contracts, not DOM components.
- Animation: Motion on web; React Native Reanimated only when needed on mobile.
- Tests: Vitest, React Testing Library, Playwright and Maestro.
- CI: GitHub Actions within free-tier limits.
- AI: server-side provider abstraction; AI is optional and must never be required for core workflows.
- Do not silently replace the stack, add a paid dependency, add a second backend, or introduce microservices. Propose changes in `docs/architecture/DECISIONS.md` and wait for approval where they affect architecture or cost.

## 4. Architecture rules

- Use a modular monolith and feature-oriented modules.
- Web and mobile share backend business rules, Zod schemas, and API contracts.
- Do not duplicate business logic in client applications.
- Keep server-only logic out of client bundles.
- Keep route handlers thin; delegate to validated application/service functions.
- Use a data-access layer with explicit authorization context.
- Use Supabase Auth sessions and user-scoped database access for ordinary user operations so RLS remains effective.
- Use privileged server credentials (service-role key) only for narrowly scoped, audited administrative/system tasks. Never use them for ordinary user CRUD.
- Do not introduce a queue, cache, vector database, search engine or service until a measured requirement justifies it.
- Shared packages in `packages/` must remain platform-neutral (no DOM, no React Native native code).

## 5. Database and migration rules

- PostgreSQL is the single source of truth.
- Follow `docs/database/ERD.md`, `SCHEMA_SPEC.md` and `MIGRATIONS.md` after their review.
- Preserve the canonical 43-table inventory (per ADR-013).
- All schema changes use versioned SQL migrations; never modify an already-applied migration to change production history.
- Every migration must include a clear purpose, constraints, indexes, foreign keys, RLS/policy implications, and rollback/recovery notes.
- Prefer additive, backward-compatible migrations; use expand-and-contract for risky changes.
- Never make untracked production schema changes.
- Never disable RLS to make a feature work.
- Every exposed table requires reviewed RLS policies and authorization tests (both positive and negative paths).
- Use foreign keys, unique constraints, check constraints, transactions and indexes for integrity.
- Enforce invariants with database constraints as well as application logic.
- PostGIS: use PostGIS geometry/geography types where coarse location queries require it.
- Use UUID identifiers (v4 or v7) unless documented otherwise, and UTC timestamps.
- Do not run reset, destructive seed or rollback commands against production. Back up before destructive changes.
- Never commit real secrets, tokens, private user data or production exports.

## 6. Security and privacy

- Default deny: enforce authorization on the server and with RLS where applicable.
- Validate every user-controlled API input with Zod on the server.
- Derive actor identity from verified Supabase auth context, never from request body.
- Never trust client-supplied role, owner ID, verification flag, moderation status or privileged state.
- Enforce authentication, role, organization membership, relationship, resource state and resource ownership server-side.
- Frontend hiding is not authorization.
- Test both permitted and denied access paths for every RLS policy.
- Protect against IDOR/BOLA, XSS, SQL injection, CSRF, SSRF, mass assignment, open redirects, brute force and upload abuse.
- Rate-limit authentication, password reset, posting, comments, messages, reports, search and AI endpoints.
- Validate file upload size, actual MIME type, extension and image dimensions.
- Use private storage by default and signed access for private assets.
- Never expose Supabase secret/service-role keys or AI provider keys to browsers or mobile bundles.
- Treat all `NEXT_PUBLIC_` and `EXPO_PUBLIC_` variables as public.
- Never log passwords, tokens, service keys, private message bodies or sensitive health data.
- Protect private applications, conversations, health records, documents and device tokens.
- Never expose exact home addresses or exact private coordinates in public lost/found or rescue posts.
- Strip image EXIF/GPS metadata before public delivery.
- Add rate limits to abuse-sensitive actions.
- Safe output handling: do not render untrusted HTML.
- Moderation decisions affecting users require authorized human review and audit history.

## 7. UI and product quality

- Follow `docs/design/UI_UX_SPEC.md`, `docs/product/BRAND_IDENTITY.md` and approved design tokens.
- Visual direction: warm, trustworthy, calm, modern, helpful, inclusive and responsible. Premium and emotionally engaging, not childish.
- Support Bangla and English, including correct Bangla font rendering (Geist for Latin, Noto Sans Bengali for Bangla).
- Responsive layouts: small phones (320px), large phones (375-430px), tablets (768px), and desktop (1024px+). No horizontal overflow at 320px.
- Include all states for every screen and control: loading, empty, error, success, offline, and permission-denied.
- Accessibility: target WCAG 2.1 / 2.2 AA (keyboard navigation, focus visibility, readable contrast, accessible labels, semantic HTML, reduced-motion preferences via `prefers-reduced-motion`).
- Never use color alone to communicate status.
- Avoid manipulative engagement patterns and public pressure leaderboards.
- Pet welfare and user safety take priority over growth or engagement metrics.

## 8. AI-assisted implementation workflow

For every assigned task:
1. Inspect Git status and existing files.
2. Read the relevant specifications and task acceptance criteria.
3. Identify dependencies and risks.
4. Propose a short implementation plan before broad edits.
5. Implement only the assigned scope.
6. Add or update tests, including unauthorized-access / denial tests where applicable.
7. Run relevant lint, typecheck, tests and build checks.
8. Review the diff for unrelated changes, secrets and data exposure.
9. Update documentation, task status and traceability.
10. Report changed files, commands, test results, limitations and unresolved issues honestly.

Do not claim a task is complete unless it has been verified. Do not perform unrelated refactoring or install dependencies without a clear reason.

## 9. Definition of Done

A feature or task is complete only when all applicable acceptance criteria are verified:
1. Requirement and acceptance criteria are documented.
2. Web and mobile impact is understood; supported platforms behave correctly.
3. Server-side validation (Zod) and authorization (RBAC/RLS) are verified.
4. Database constraints, indexes, RLS policies and migrations are reviewed and tested.
5. Loading, empty, error, success, offline, and permission-denied states exist and are tested.
6. Responsive behavior (320px–desktop) and accessibility checks pass.
7. Unit, integration, RLS, and E2E tests cover critical paths and denied-access paths.
8. Logs and analytics do not expose secrets or unnecessary personal/location data.
9. Documentation, OpenAPI specs, ERD, TASKS.md and TRACEABILITY.md are updated.
10. Build and quality checks pass with zero unhandled errors.

A UI control must connect to a real supported action; do not create inert or fake functionality. Never say "bug-free" or "100% secure" without defensible evidence.

## 10. Response format contract

When generating code modifications, follow the surgical implementer contract strictly:
```text
FILE: path/to/file
// INSERT AFTER: [exact existing line from that file]
[new code only — nothing else]
```

Rules:
1. Code blocks and file paths only. Zero prose. Zero explanations.
2. Never touch existing functions, routes, or variables.
3. Append new items to module.exports — never rewrite the full exports line.
4. Match the file's exact style: quotes, spacing, semicolons, naming conventions.
5. Multiple changes in one file: list top-to-bottom.
6. New file: show full content only.
7. Frontend: follow existing useState/useEffect/api call patterns already in the component.
8. If a route conflicts with existing ones, flag with one line: CONFLICT: [reason] — nothing else.

## 11. Conflict resolution protocol

When documentation or code conflicts are encountered:
- STOP immediately. Do not guess, silently assume, or unilaterally resolve the conflict.
- Record the conflict in `docs/OPEN_QUESTIONS.md` (and `docs/decisions/OPEN_DECISIONS.md`) with:
  1. Conflict identifier (e.g. C-X, OQ-XXX)
  2. Competing positions and source references
  3. Impact on implementation
  4. Safe default or blocker status
- Request owner/user approval only when the conflict blocks immediate progress.
- Once decided by the owner, document the resolution in `docs/architecture/DECISIONS.md` as an ADR.
- Never maintain competing backlogs, competing schemas, or competing API envelopes.
- Never silently remove, defer, merge, or replace an approved requirement.

## 12. Task execution contract

Follow the mandatory execution rules established in `docs/ANTIGRAVITY_EXECUTION_CONTRACT.md`:
1. Read `AGENTS.md`, `docs/START_HERE.md`, `docs/source/00-authoritative-project-context.md`, then every file under `docs/source/` completely before changing files.
2. Do not browse for or request any ChatGPT conversation link. All required project context is copied into this repository.
3. First perform M0 documentation consolidation only. Do not scaffold apps, install dependencies, create migrations, or implement features until the documentation audit passes and the user approves M0.
4. Preserve all 43 application table names and the full original field inventory, all API endpoint definitions, role/RLS requirements, and PB-001 through PB-120 task IDs unless an explicit approved decision changes them. Do not claim completeness without comparing source to canonical docs.
5. Resolve legacy pet-only wording using `docs/source/00-authoritative-project-context.md`. "All animals" does not authorize illegal wildlife commerce or unsafe transfers.
6. Work in one small task at a time. Before coding, report scope, dependencies, data/API/RBAC impact, risks and acceptance criteria.
7. Database changes require reviewed ERD/schema diff, forward migration, rollback or forward-fix plan, backup strategy, RLS tests, integrity tests and migration verification. Never reset production or use destructive SQL casually.
8. Required gates per task: formatting, lint, typecheck, unit tests, integration/RLS tests, affected E2E journeys, production build, responsive/accessibility checks, security review where applicable. Record exact commands and actual results.
9. No credentials in source control. No service-role key in browser/mobile. No paid service, production deployment, domain purchase, app-store submission or irreversible action without explicit user approval.
10. At every milestone end, produce evidence: changed files, completed task IDs, test logs, screenshots where relevant, known defects, unresolved decisions and next milestone proposal. Stop if acceptance fails.
11. "Bug-free" is not a valid claim. Report verified coverage and known limitations honestly.

## 13. M0/M1/M2 milestone gates

Milestones are strictly sequential. A later milestone must never begin while the current milestone has failed acceptance criteria:
- **Gate M0 — Documentation & Discovery:**
  - Scope: Reconcile HTML Foundation and ZIP documentation, populate all canonical specs under `docs/`, audit completeness, resolve architectural conflicts (ADR-013 through ADR-021), define PB-001–PB-120 backlog and traceability.
  - Exit Criteria: All docs populated, contradictions recorded, 43-table canonical schema approved, OpenAPI contracts defined, open questions catalogued. Zero application code or migrations. Explicit owner approval required to exit M0.
- **Gate M1 — Monorepo & Infrastructure:**
  - Scope: pnpm workspaces + Turborepo, Next.js web app, Expo mobile app, shared packages (`contracts`, `api-client`, `database-types`, `domain`, `utils`, `config`, `design-tokens`), Supabase local/dev environment, CI quality gates (lint, typecheck, test, build), environment validation.
  - Exit Criteria: Clean install on fresh clone; web and mobile shells boot; CI passes; zero secrets committed; architecture matches ADRs.
- **Gate M2 — Identity & Animals:**
  - Scope: Supabase Auth, profiles, onboarding, animal profile CRUD, photo uploads with EXIF stripping, care timeline, reminders.
  - Exit Criteria: Secure user journey verified on web and mobile; positive and negative RLS tests pass; IDOR prevention verified; photo upload privacy verified.
- **Subsequent Gates (M3–M10):** Community (M3), Adoption (M4), Lost/Found & Rescue (M5), Messaging & Providers (M6), Admin & Moderation (M7), AI Capabilities (M8), Mobile Parity (M9), Production Readiness (M10). Each requires passing all exit criteria before advancing.

## 14. Species and jurisdiction safety

- KINNIPAW is an all-animal platform ("One Platform. Every Animal. One Connected Ecosystem").
- Never assume dogs and cats only. Architecture, taxonomy, care records, and lost/found must support all companion, domestic, and rescued animals (e.g. cats, dogs, birds, rabbits, small mammals, domestic farm animals).
- Strict species and jurisdiction safety controls:
  - Comply with Bangladesh Wildlife (Preservation and Security) Act, 2012 and relevant animal-welfare legislation.
  - Prohibit listings, trade, breeding, or adoption transfers of protected native wildlife, endangered species, or CITES-restricted animals.
  - Rescue coordination for injured or distressed wildlife must route to authorized forestry/wildlife rescue authorities or accredited rescue organizations.
  - Adoption and transfer modules must enforce species-specific eligibility and prevent unlawful animal commerce.

## 15. Brand usage rules

- The product name is **KINNIPAW** (capitalized as KINNIPAW in active copy, lowercase `kinnipaw` for package names and repository identifiers).
- Never introduce retired or legacy names into active branding or UI copy.
- Brand status is strictly provisional pending trademark, domain, social handle, and app store clearance (Bangladesh DPDT, WIPO, domain registrars, Google Play, Apple App Store).
- Never claim the name is legally unique, registered, or cleared.
- Primary brand colour: Forest Green `#245B45` (ADR-020).
- Supporting/secondary colour: Sage Green `#66856C`.
- Neutral palette: Warm Ivory `#FAF9F6`, Deep Charcoal `#252A27` / `#17211D`, Soft Neutral `#E8E6E0`, Soft Terracotta `#D98769`.
- Typography: Geist Sans for Latin text; Noto Sans Bengali for Bangla.

## 16. Sensitive data prohibitions

- Never expose exact home addresses or precise private coordinates in public lost/found posts, sighting reports, or rescue cases.
- Public location displays must use coarse area labels (e.g. neighborhood/thana/district) or fuzzified coordinates.
- Never implement continuous background location tracking.
- Strip all EXIF / GPS metadata from user-uploaded images on the server before public storage or CDN delivery.
- Protect private health records, adoption application details, direct messages, and user device push tokens behind strict authentication and RLS.
- Use private Supabase Storage buckets by default, providing time-limited signed URLs only for authorized viewers.
- Never log passwords, auth tokens, service keys, private message bodies, or sensitive medical notes.

## 17. AI guardrails

- AI must never diagnose animal medical conditions, prescribe treatments, recommend medication dosages, or replace a licensed veterinarian.
- Any detected urgent medical or distress symptoms must immediately trigger a prominent emergency banner directing the user to qualified professional veterinary care.
- Lost/found AI match candidates are suggestions only; human verification is strictly required for confirmation.
- Adoption match recommendations are suggestions, not automated screening decisions.
- AI moderation flags are advisory; consequential enforcement actions (suspensions, bans, content removal) require human review.
- Provider abstraction: domain logic must never couple to a specific AI vendor.
- AI features must be opt-in, usage-capped, rate-limited, and safe-failing.
- Core product workflows (adoption, rescue, community, profiles) must remain 100% operational when AI services are offline or disabled.

## 18. Documentation maintenance

- Update documentation in the same task/commit as implementation.
- For every feature, maintain full traceability:
  Requirement (POS) -> User Journey -> Screen -> API Endpoint -> Database Table -> Permission / RLS -> Tests -> Execution Task (PB).
- Keep `docs/TRACEABILITY.md` updated as requirements and tasks progress.
- Record all unresolved questions and conflicts in `docs/OPEN_QUESTIONS.md` and `docs/decisions/OPEN_DECISIONS.md`.
- Document every accepted architectural, schema, or structural change in `docs/architecture/DECISIONS.md` using the standard ADR format.
- Keep OpenAPI contracts in `docs/api/` synchronized with actual route handlers and Zod schemas.

## 19. Prohibited actions

The agent and any contributor must NEVER:
1. Invent credentials, mock test results, or claim tests passed when they were not run or failed.
2. Silently change the brand, technology stack, database architecture, or approved feature scope.
3. Silently remove, simplify, merge, or defer an approved requirement.
4. Disable RLS or weaken database constraints to make a feature or test pass.
5. Expose Supabase secret/service-role keys or AI provider API keys to client bundles (`NEXT_PUBLIC_` or `EXPO_PUBLIC_`).
6. Use service-role credentials for ordinary end-user CRUD operations.
7. Create fake, dummy, or placeholder data in production databases.
8. Run reset, destructive seed, or rollback commands against production.
9. Install paid dependencies, activate paid APIs, or incur billable provider costs without explicit user authorization.
10. Start coding feature tasks while the initial documentation audit (Gate M0) is incomplete.
11. Implement inert UI controls, fake buttons, or dummy success states that do not perform real operations.
12. Assume dogs and cats only or facilitate unauthorized wildlife trade.
13. Expose exact user coordinates, home addresses, or EXIF metadata publicly.
14. Provide AI-generated medical diagnoses or veterinary prescriptions.
15. Use external ChatGPT links or request external browser sessions for project context.
16. Claim "bug-free", "production-ready", or "100% secure" without verifiable test evidence.
