# Architecture Decision Records — KINNIPAW

## ADR-001: Modular monolith

**Status:** Accepted. One deployable Next.js backend with feature modules. Reason: solo/AI-assisted development, lower operational burden, shared business logic.

## ADR-002: pnpm + Turborepo monorepo

**Status:** Accepted. Web, mobile and shared packages live in one repository. Shared contracts/types/tokens are reused; platform UI remains platform-specific.

## ADR-003: Supabase PostgreSQL as primary database

**Status:** Accepted. Relational workflows, Auth, Storage, Realtime and RLS are integrated. No second database initially.

## ADR-004: No Prisma initially

**Status:** Accepted for initial implementation. Use SQL migrations, Supabase SDKs and generated DB types. Revisit only if a concrete need outweighs duplicated abstraction/maintenance cost.

## ADR-005: Versioned REST API for shared business operations

**Status:** Accepted. Next.js Route Handlers under `/api/v1`; web and mobile share contracts. Realtime channels are separate and membership-authorized.

## ADR-006: RBAC plus resource ownership and organization membership

**Status:** Accepted. Roles alone are insufficient; permission decisions require resource scope and workflow state.

## ADR-007: Rule-based matching before AI

**Status:** Accepted. Lost/found matching begins with deterministic factors; AI is a later candidate-ranking aid and never confirms identity.

## ADR-008: Brand name is provisional

**Status:** Accepted provisionally. KINNIPAW is the working name. No claim of trademark/domain clearance. Complete DPDT, WIPO, app-store, domain and handle checks before public brand investment.

## ADR-009: Keep commerce out of initial approved scope

**Status:** Accepted. Product catalog, cart, orders, payments and delivery are not part of the original approved 43-table scope. Any marketplace-commerce expansion requires a separate PRD and schema change approval.

## ADR-010: Matching table semantics unresolved

**Status:** Proposed separation pending review. `lost_found_matches` is intended for general candidate pairs and human review; `ai_match_candidates` is intended for AI-generated candidates with model/provider/input metadata. These may be redundant. Do not merge or delete either until a reviewed ADR establishes lifecycle, provenance and retention semantics.

## ADR-011: Public location is approximate

**Status:** Accepted. Exact coordinates/contact are restricted; public presentation uses area labels or coarse coordinates. No continuous tracking.

## ADR-012: Admin dashboard lives inside web app initially

**Status:** Accepted. Use protected `/admin` routes in `apps/web`; do not create separate admin deployment at MVP.

## ADR-013: Canonical Database Schema Reconciliation

**Status:** Accepted.
**Context:** Conflict C-1: The HTML Foundation and ZIP documentation contained two different 43-table inventories with approximately 20 naming and design differences. Neither set could be adopted wholesale without losing requirements from the other. The owner directed creation of a reconciled canonical schema that preserves animal-inclusive architecture, organization support, community groups, normalized RBAC, dedicated health records, separate media domains, and explicit AI job/matching provenance.
**Decision:** Adopt the reconciled 43-table canonical schema as defined in `docs/database/SCHEMA_SPEC.md` (reconciled 2026-11-08). Key reconciliation decisions:
- Table naming uses animal-inclusive terms (`animals`, `animal_media`, `animal_health_records`) rather than pet-centric (`pet_media`, `pet_health_records`).
- Three separate animal health sub-tables: `animal_health_records` (general), `vaccinations`, `medications`.
- Generic provider model: `provider_profiles` + `provider_services` + `provider_reviews` (overrides HTML vet-specific tables; see ADR-014).
- Normalized 3-table RBAC retained (see ADR-016).
- Groups in scope: `groups`, `group_members`, `group_posts` retained (see ADR-017).
- Dual AI tables retained: `ai_jobs` + `ai_match_candidates` (see ADR-015).
- `species` and `breeds` tables added to support all-animal taxonomy.
- `audit_logs` retained for moderation and security traceability.
**Alternatives considered:** (a) Use HTML table set wholesale — loses ZIP's richer provider, media, and event tables. (b) Use ZIP table set wholesale — loses normalized RBAC, groups, hashtags, and species taxonomy.
**Security/privacy impact:** Every table in the canonical schema requires reviewed RLS policies before any migration is applied. No table may be exposed without explicit policy.
**Migration implications:** Schema exists as specification only at M0. Forward SQL migrations will be authored at M1/M2 per `docs/database/MIGRATIONS.md` conventions. No destructive migrations against production.
**Rollback:** Schema is specification-only at this stage; no migration to roll back.

## ADR-014: Generic Provider Model

**Status:** Accepted.
**Context:** Conflict C-5: The HTML Foundation specified a vet-specific model (`vet_profiles` + `vet_clinics`). The ZIP documentation specified a generic model (`provider_profiles` + `provider_services` + `provider_reviews`). KINNIPAW serves vets, groomers, boarding facilities, trainers, and other animal care professionals.
**Decision:** Adopt the generic provider model: `provider_profiles` + `provider_services` + `provider_reviews`. Vet-specific credential information is retained as a `vet_credentials JSONB` field within `provider_profiles` and a `verification_status` column. This avoids a vet-only schema while preserving credential verification requirements.
**Consequences:** Provider discovery, booking, and reviews work uniformly across all professional types. Vet verification remains possible through the `vet_credentials` JSONB field reviewed by moderators.
**Security/privacy impact:** `vet_credentials` JSONB must be readable only by the provider owner and authorized moderators/admins. License data must not be publicly exposed.
**Migration implications:** `provider_profiles` table authored at M2. No HTML `vet_profiles`/`vet_clinics` tables will be created.

## ADR-015: Dual AI Tables

**Status:** Accepted.
**Context:** Conflict C-6 / ADR-010 (unresolved): HTML Foundation specified a single `ai_interactions` table. ZIP documentation specified `ai_jobs` + `ai_match_candidates`. The dual-table approach separates AI job lifecycle tracking from match candidate output queues, providing explicit provenance.
**Decision:** Retain the two-table AI model: `ai_jobs` (tracks AI request lifecycle, provider, model, tokens, status) + `ai_match_candidates` (stores match candidates with confidence scores, linked to `ai_jobs`). This resolves ADR-010 (previously unresolved). The HTML `ai_interactions` table is not created.
**Consequences:** Every AI operation has a traceable job record. Match candidates have explicit provenance linking them to the job that produced them. Human verification is required before any match candidate is confirmed.
**Security/privacy impact:** `ai_jobs` may contain user query context — must be accessible only to the owning user and admins. Match confidence scores must not be exposed publicly.

## ADR-016: Normalized Three-Table RBAC

**Status:** Accepted.
**Context:** Conflict C-7: HTML Foundation specified a normalized 3-table RBAC model (`roles`, `permissions`, `role_permissions`). ZIP documentation used a single `user_roles` junction table with a TEXT CHECK enum for role names.
**Decision:** Adopt the normalized 3-table model: `roles` (role definitions), `permissions` (atomic permission identifiers), `role_permissions` (many-to-many role-to-permission assignments). Global user role assignments are stored in a `user_role_assignments` table linking users to roles. This supports future fine-grained permission expansion without schema changes.
**Consequences:** Role and permission management is flexible. Adding a new permission does not require schema changes. RBAC enforcement remains server-side and RLS-enforced.
**Security/privacy impact:** `roles`, `permissions`, and `role_permissions` must be readable by authenticated users (to enforce checks) but writable only by admins. `user_role_assignments` must never be self-assignable.
**Migration implications:** Seed data for initial roles and permissions will be included in the M2 migration set.

## ADR-017: Community Groups In Scope

**Status:** Accepted.
**Context:** Conflict C-8: HTML Foundation explicitly included community groups (3 tables + group API endpoints). ZIP 43-table inventory omitted groups entirely. Community groups are a core community engagement feature.
**Decision:** Community groups are in scope. The canonical schema includes: `groups` (group metadata, type, visibility), `group_members` (membership with roles: owner/admin/member), `group_posts` (posts scoped to a group). Group posts are linked to the main `posts` table through a FK. Groups API endpoints are included in `docs/api/API.md`.
**Consequences:** Community feed can be group-scoped. Animal welfare organizations can create managed groups for rescue coordination, adoption events, etc.
**Security/privacy impact:** Private groups must enforce RLS such that non-members cannot read group posts or member lists. Group admin actions require role verification.

## ADR-018: Canonical Task ID System

**Status:** Accepted.
**Context:** Conflict C-2: The HTML Foundation specification defined 68 requirements-level milestones (`POS-001` through `POS-068`), while the project ZIP documentation defined a granular 120-task execution backlog (`PB-001` through `PB-120`). Maintaining two competing task catalogues risks execution ambiguity, disjoint progress tracking, and dual-source drift.
**Decision:** Adopt `PB-001` through `PB-120` in `docs/roadmap/TASKS.md` as the single canonical execution backlog for all engineering implementation. HTML `POS` identifiers are retained strictly as high-level requirements references and are exhaustively mapped to `PB` tasks in `docs/TRACEABILITY.md`. Never maintain two parallel execution task systems.
**Consequences:**
- All task scheduling, prompt execution, commit messages, and PRs must reference canonical `PB-XXX` task IDs.
- Milestone exit gates (M0 through M10) map cleanly to continuous ranges of `PB` tasks.
- Bidirectional traceability between requirement specifications (`POS`) and implementation tasks (`PB`) is preserved in `docs/TRACEABILITY.md`.

## ADR-019: API Response Envelope

**Status:** Accepted.
**Context:** Conflict C-3: Two competing API response envelope formats existed across documentation sources. The ZIP documentation specified `{ success: boolean, data, error: { code, message, details, requestId }, meta }`, whereas the HTML Foundation specified `{ data, meta: { requestId, nextCursor }, error }`. Maintaining divergent contracts breaks client-server serialization and type consistency across web and mobile.
**Decision:** Adopt `{ data, meta: { requestId, nextCursor }, error }` as the single canonical API response envelope across all Next.js `/api/v1` route handlers and shared API clients. Eliminate the redundant top-level `success` boolean.

The five canonical response shapes are:

1. **Success (`200 OK` / `201 Created`):**
```json
{
  "data": {
    "id": "anim_01HXYZ789...",
    "name": "Luna",
    "species": "cat"
  },
  "meta": {
    "requestId": "req_01H9A8B7C6D5E4F3...",
    "nextCursor": null
  },
  "error": null
}
```

2. **Validation Failure (`422 Unprocessable Content`):**
```json
{
  "data": null,
  "meta": {
    "requestId": "req_01H9A8B7C6D5E4F3..."
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed against schema contract",
    "details": [
      {
        "field": "species_id",
        "issue": "Invalid species identifier or prohibited wildlife category"
      }
    ]
  }
}
```

3. **Authentication Failure (`401 Unauthorized`):**
```json
{
  "data": null,
  "meta": {
    "requestId": "req_01H9A8B7C6D5E4F3..."
  },
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Missing, expired, or invalid session token",
    "details": null
  }
}
```

4. **Authorization Failure (`403 Forbidden`):**
```json
{
  "data": null,
  "meta": {
    "requestId": "req_01H9A8B7C6D5E4F3..."
  },
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action on the requested resource",
    "details": null
  }
}
```

5. **Server Error (`500 Internal Server Error`):**
```json
{
  "data": null,
  "meta": {
    "requestId": "req_01H9A8B7C6D5E4F3..."
  },
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please contact support citing the requestId.",
    "details": null
  }
}
```

**Consequences:**
- `packages/contracts` enforces this envelope structure for all Zod response schemas.
- `packages/api-client` unwraps `data` on success and throws typed API errors on non-null `error`.
- Every response includes `meta.requestId` generated by server middleware for observability and audit correlation.
- Cursor-based pagination is standardized under `meta.nextCursor`.
- `docs/api/API.md` and OpenAPI specifications are updated to reflect this canonical format.

## ADR-020: Primary Brand Colour

**Status:** Accepted.
**Context:** Conflict C-4: The HTML Foundation established Forest Green (`#245B45`) as the primary brand colour, while the project ZIP documentation specified Sage Green (`#66856C`) as the primary brand token.
**Decision:** Adopt Forest Green (`#245B45`) as the canonical primary brand colour for KINNIPAW. Sage Green (`#66856C`) is retained as the supporting/secondary brand colour for secondary actions, subtle surfaces, and complementary UI elements.
**Consequences:**
- `packages/design-tokens` designates `#245B45` for primary buttons, core branding, and active emphasis states.
- Sage Green (`#66856C`) is assigned to secondary UI components, badges, tags, and soft accents.
- Forest Green `#245B45` meets WCAG 2.1 AA contrast requirements (> 4.5:1) against Warm Ivory (`#FAF9F6`) and white surfaces for text and interactive controls.
- `docs/product/BRAND_IDENTITY.md` and design tokens are synchronized.

## ADR-021: Monorepo Package Inventory

**Status:** Accepted.
**Context:** Conflict C-9: The HTML Foundation and ZIP documentation defined disparate package sets for the monorepo. ZIP specified `api-client`, `database-types`, `eslint-config`, `tsconfig`, and `contracts`. HTML specified `domain/`, `utils/`, `config/`, and `design-tokens/`.
**Decision:** Merge both monorepo package sets into a unified, non-overlapping package inventory under `packages/`:
- `packages/contracts`: Zod request/response schemas, API contracts, parameter validation.
- `packages/api-client`: Strongly typed HTTP client shared by web and mobile.
- `packages/database-types`: Generated Supabase database TypeScript definitions.
- `packages/domain`: Platform-agnostic domain logic, domain models, state machines, business rules.
- `packages/utils`: Cross-platform utilities (formatting, date helpers, sanitization).
- `packages/config`: Shared configuration constants, environment schemas, feature flags.
- `packages/design-tokens`: Shared brand design tokens (Forest Green `#245B45` primary, typography, spacing).
- `packages/eslint-config`: Shared ESLint configurations across workspaces.
- `packages/tsconfig`: Shared TypeScript `tsconfig.json` bases.
**Consequences:**
- Clean separation of concerns: domain rules live in `packages/domain`, decoupled from UI frameworks.
- Web and mobile share business logic, API clients, and validation schemas without code duplication.
- Packages remain strictly platform-agnostic with no DOM or React Native native module dependencies.
- Monorepo structure in `docs/architecture/REPOSITORY_STRUCTURE.md` is fully aligned.

## ADR-022: Engineering Constitution and Operating Contract Reconciliation

**Status:** Accepted.
**Context:** Two competing agent operating instructions existed: the 9-section root `AGENTS.md` and the 19-section engineering constitution in HTML Foundation Section 15, along with a separate `docs/ANTIGRAVITY_EXECUTION_CONTRACT.md`.
**Decision:** Reconcile into a single authoritative 19-section `AGENTS.md` encompassing product identity, technical stack, architecture, database rules, security/privacy, UI quality, workflow, DoD, surgical response format contract, conflict resolution protocol, task execution contract, sequential milestone gates (M0–M10), species/jurisdiction safety, brand rules, sensitive data prohibitions, AI guardrails, documentation maintenance, and prohibited actions.
**Consequences:**
- Single authoritative engineering operating contract across all agent sessions.
- Full alignment between foundational principles and surgical execution rules.
- Permanent safeguards against silent schema changes, data exposure, and scope drift.

## ADR-023: content_reports FK Strategy — Nullable FK Columns

**Status:** Accepted.
**Context:** D-6 (open decision): The `content_reports` table needs to reference multiple reportable entity types (posts, comments, profiles, listings, rescue cases, lost/found posts). Three strategies were considered: (a) polymorphic discriminator (subject_type + subject_id — no DB-level FK integrity), (b) nullable FK columns with CHECK that exactly one is set (full FK integrity), (c) separate junction tables per entity type (maximum FK integrity, more tables).
**Decision:** Option B — nullable FK columns. `content_reports` has one nullable FK column per reportable entity type, plus a CHECK constraint enforcing that exactly one FK is non-null: `CHECK(num_nonnulls(post_id, comment_id, profile_id, listing_id, rescue_case_id, lost_found_post_id) = 1)`. This provides full PostgreSQL referential integrity without forfeiting relational guarantees.
**Consequences:** Adding a new reportable entity type requires a migration to add a nullable FK column and update the CHECK constraint. This is an additive, backward-compatible change. FK cascade behavior is explicit per entity type. Moderate schema width increase vs. discriminator approach.
**Security/privacy impact:** No change — reporter and subject visibility rules unchanged.
**Migration implications:** Forward migration writes nullable FK columns and the multi-column CHECK. Rollback: drop columns and restore prior CHECK. No destructive data loss on rollback.

## ADR-024: Supabase Local and Free Tier for Development

**Status:** Accepted.
**Context:** D-7: Supabase free-tier commercial terms must be verified before provisioning any shared environment.
**Decision:** Use Supabase CLI local development (Docker-based) for all M1 development and testing. Supabase free-tier remote project may be used for development/staging only — not production. No paid upgrade at M1. Production tier decision deferred to M10 (Production Readiness). Owner has confirmed this scope.
**Consequences:** No cloud costs in M1. Local Supabase provides full PostgreSQL + Auth + Storage + Realtime parity. Free-tier remote project (if used for staging) has row limits and no PITR — acceptable for pre-production use.
**Migration implications:** Local Supabase migrations are authoritative; remote applies the same migration files.

## ADR-025: Production Hosting Deferred to M10

**Status:** Accepted.
**Context:** D-8: Commercial hosting provider for Next.js web app. Vercel Hobby is excluded (commercial terms). Provider choice is not needed until M10 (Production Readiness).
**Decision:** Defer production hosting provider selection to M10. M1 CI/CD will use a provider-agnostic build pipeline (GitHub Actions). Deployment targets will be configurable via environment variables. No hosting provider is locked in at M1.
**Consequences:** M1 CI pipeline builds and tests only — no production deployment step. Staging deployment (if needed) can use Railway or Render free tier as a temporary non-binding choice.

## ADR-026: Expandable Animal Taxonomy as MVP Direction

**Status:** Accepted.
**Context:** D-9: MVP species categories — which species are in scope for MVP?
**Decision:** Use an expandable taxonomy approach: the `species` and `breeds` tables are seeded with an initial set for MVP (minimum: cat, dog, bird, rabbit, small mammal). Additional species are added via admin seed data without schema changes. Wildlife restrictions remain mandatory — `species.is_domestic` controls eligibility; protected/CITES species may not be listed, traded, or adopted. Wildlife rescue cases route to authorized forestry/rescue authorities only.
**Consequences:** MVP scope is flexible — owner can expand species list by updating seed data. No schema migration needed to add species. Jurisdiction safety enforced at application layer (not schema).

## Change process

Every new ADR must include context, decision, alternatives, security/privacy impact, operational/cost impact, migration implications and rollback/recovery plan.
