# Open Questions and Approval Register — KINNIPAW

> Status: Canonical Register | Reconciled Post-M0 Dual-Source Audit | Date: 2026-11-08

This register records all open and resolved architectural, product, governance, and operational decisions for KINNIPAW. Explicit product/business decisions must not be silently invented by agents or developers. For open items, use reversible safe defaults until formal sign-off is recorded. When an item is formally resolved, mark it as `RESOLVED` with the corresponding Architecture Decision Record (ADR) or owner approval note.

---

## OQ-001: Formal Brand, Trademark, and Domain Clearance (D-1)
**Status:** OPEN  
**Resolution:** None (provisional name accepted under ADR-008).  
**Raised:** 2026-11-08  
**Blocking:** Formal brand registration, public website launch, domain acquisition, social handle reservation, trademark filing, app-store developer account registration.  
**Notes:** KINNIPAW is the provisional working name. The owner must conduct clearance checks with Bangladesh DPDT, WIPO Madrid, domain registrars (`.com`, `.com.bd`), social networks, and app store registries before public commercial investment.

---

## OQ-002: Canonical 43-Table Database Schema Reconciliation (C-1 / D-2)
**Status:** RESOLVED  
**Resolution:** Reconciled canonical 43-table baseline established in `docs/database/SCHEMA_SPEC.md` and `docs/database/ERD.md` per ADR-013. The design integrates animal-inclusive models, generic provider profiles, organization entities, dedicated health records, and separate media domains.  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks M1 database migration authoring).  
**Notes:** All 43 tables from the reconciled inventory are preserved. Any subsequent table additions or removals require an explicit approved ADR.

---

## OQ-003: Canonical Task Identification Backlog (C-2 / D-3)
**Status:** RESOLVED  
**Resolution:** Confirmed `PB-001` through `PB-120` in `docs/roadmap/TASKS.md` as the canonical execution task backlog per ADR-018. HTML Foundation requirements (`POS-001` through `POS-068`) are maintained as requirements anchors mapped in `docs/TRACEABILITY.md`.  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks task tracking and traceability).  
**Notes:** External tracker issue keys must map directly to PB-xxx identifiers without renumbering or removing original task IDs.

---

## OQ-004: Unified API Response Envelope Format (C-3 / D-4)
**Status:** RESOLVED  
**Resolution:** Standardized unified response envelope across all `/api/v1` routes per ADR-019:  
- Success: `{ "success": true, "data": ..., "meta": { "requestId": "...", "nextCursor": "..." } }`  
- Error: `{ "success": false, "error": { "code": "...", "message": "...", "details": ..., "requestId": "..." } }`  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks `packages/contracts` and route handler scaffolding).  
**Notes:** Documented in `docs/api/API.md` and enforced in `openapi.yaml`.

---

## OQ-005: Primary Brand Colour Palette (C-4)
**Status:** RESOLVED  
**Resolution:** Forest Green `#245B45` confirmed as the primary brand colour per ADR-020. Sage Green `#66856C` serves as supporting/secondary brand colour with Warm Ivory `#FAF9F6` background.  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks design token packages and Tailwind theme configuration).  
**Notes:** Recorded in `docs/product/BRAND_IDENTITY.md` and `docs/design/UI_UX_SPEC.md`.

---

## OQ-006: Matching Table Architecture Semantics (C-6 / D-5)
**Status:** RESOLVED  
**Resolution:** Preserved separation of concerns per ADR-010:  
- `lost_found_matches`: Stores candidate pairs presented directly to end users, tracking human review (`dismissed`, `confirmed_reunion`).  
- `ai_match_candidates` & `ai_jobs`: Manage internal background AI processing pipelines, recording model metadata, similarity distance, and execution status.  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks M5 matching table design).  
**Notes:** Prevents polluting user-facing review data with raw machine learning ingestion logs.

---

## OQ-007: Polymorphic Moderation Foreign Key Strategy (D-6)
**Status:** OPEN  
**Resolution:** Pending owner and database architect review.  
**Raised:** 2026-11-08  
**Blocking:** Final migration authoring for `content_reports` and `moderation_actions` foreign key constraints (`PB-017`, `PB-077`).  
**Notes:** Owner must select one architectural pattern:  
1. *Soft polymorphic reference:* `target_type` (e.g. `'post'`, `'comment'`, `'rescue_case'`) + `target_id` (UUID) without DB-level FK constraints; enforced via application layer and trigger cascades.  
2. *Separate junction tables:* `report_posts`, `report_comments`, `report_rescue_cases` with strict relational FKs.  
3. *JSONB reference payload:* Storing target entity snapshot inside a JSONB column.  
*Recommendation:* Option 1 with trigger-based cascade cleanup matches Supabase best practices.

---

## OQ-008: Supabase Free-Tier Commercial Terms and Quotas (D-7)
**Status:** OPEN  
**Resolution:** Pending owner commercial verification.  
**Raised:** 2026-11-08  
**Blocking:** Production infrastructure provisioning and staging rollout plan (`PB-015`, `PB-120`).  
**Notes:** The owner must verify current Supabase commercial terms. The free tier automatically pauses inactive projects after 7 days and enforces egress and storage limits. Owner should confirm whether staging/production will launch on the Supabase Pro tier ($25/mo) to guarantee backup retention and 99.9% uptime SLAs.

---

## OQ-009: Commercial Web Hosting Platform Selection (D-8)
**Status:** OPEN  
**Resolution:** Pending owner vendor approval.  
**Raised:** 2026-11-08  
**Blocking:** Production CI/CD deployment configuration for `apps/web` (`PB-021`, `PB-120`).  
**Notes:** Vercel Hobby strictly prohibits commercial usage. Owner must approve production hosting choice:  
- Vercel Pro (commercial compliance, Next.js zero-config), or  
- Cloudflare Pages / Workers (cost-effective edge hosting), or  
- Self-hosted VPS with Docker / Coolify.  
*Note:* Non-commercial preview on Vercel Hobby is permitted only during private developer evaluation.

---

## OQ-010: MVP Species Categories and Prohibited-Species Policy (D-9)
**Status:** OPEN  
**Resolution:** Pending owner product sign-off.  
**Raised:** 2026-11-08  
**Blocking:** Seed data for `species` taxonomy table and UI taxonomy selector presets (`PB-017`, `PB-026`).  
**Notes:** Authoritative project context mandates "Every Animal" inclusivity. However, initial adoption listings must restrict prohibited wildlife and protected species per Bangladesh Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026). Owner must confirm the exact list of species enabled for MVP adoption (e.g., companion dogs, cats, domestic rabbits, captive birds) vs. species designated as reporting/rescue-only. Safe default: all uncertain or non-domestic species remain restricted pending statutory review.

---

## OQ-011: Farm and Livestock Scope in Initial MVP (D-10)
**Status:** OPEN  
**Resolution:** Pending owner product boundary decision.  
**Raised:** 2026-11-08  
**Blocking:** Form schema and filtering boundaries for adoption and lost-and-found forms (`PB-042`, `PB-051`).  
**Notes:** Confirm whether cattle, goats, sheep, and poultry are supported in MVP community/lost-and-found or deferred to a dedicated post-MVP livestock welfare module. Commercial animal trading is strictly out of scope.

---

## OQ-012: Adoption Re-Application Policy and Cooldown (D-11)
**Status:** OPEN  
**Resolution:** Pending owner business logic decision.  
**Raised:** 2026-11-08  
**Blocking:** `adoption_applications` status transition validation rules in API (`PB-045`, `PB-047`).  
**Notes:** Decide whether an applicant whose application was rejected or withdrawn may re-apply for the same animal listing, and whether a mandatory cooldown period (e.g., 14 days) or owner-initiated block applies, preventing spamming and harassment.

---

## OQ-013: Direct Messaging Initiation and Abuse Safeguards (D-12)
**Status:** OPEN  
**Resolution:** Pending owner safety and product review.  
**Raised:** 2026-11-08  
**Blocking:** Authorization rules in `/api/v1/conversations` creation endpoint (`PB-062`).  
**Notes:** Approve direct messaging initiation permissions:  
- *Open:* Any authenticated user can initiate a conversation with any other user (unless blocked).  
- *Contextual:* Messaging permitted only in context of active adoption listing, sighting, or rescue assignment.  
- *Request-based:* Message request required before full thread opens.  
*Recommendation:* Contextual or request-based model strongly recommended for harassment prevention in Bangladesh market.

---

## OQ-014: Reunion Confirmation Authority (D-13)
**Status:** OPEN  
**Resolution:** Pending owner workflow sign-off.  
**Raised:** 2026-11-08  
**Blocking:** State transition endpoint `/api/v1/lost-found/{id}/reunite` (`PB-061`).  
**Notes:** Decide who holds the authority to mark a lost animal case as reunited:  
- Only the original report author,  
- Either the report author or matching found report author with mutual confirmation, or  
- Authorized moderators/admins upon dispute.  
*Recommendation:* Dual-confirmation with single-party author override.

---

## OQ-015: Organization Member Publishing Defaults and Approvals (D-14)
**Status:** OPEN  
**Resolution:** Pending owner organizational RBAC review.  
**Raised:** 2026-11-08  
**Blocking:** Role permission checks in organization post/listing creation handlers (`PB-042`, `PB-057`, `PB-079`).  
**Notes:** Decide whether standard organization members (`org_member`) can publish public posts and adoption listings under the organization's name by default, or if publishing requires `org_admin` / `org_manager` approval.

---

## OQ-016: Veterinary Credential Review Process (D-15)
**Status:** OPEN  
**Resolution:** Pending owner operational decision.  
**Raised:** 2026-11-08  
**Blocking:** Provider verification administration workflow (`PB-072`, `PB-080`).  
**Notes:** Define veterinary license verification protocol:  
- Manual document review by KINNIPAW internal admins verifying against Bangladesh Veterinary Council (BVC) registrations, or  
- Automated/semi-automated document submission workflow.  
*Rule:* Unverified providers must display clear unverified indicators and cannot receive medical trust badges.

---

## OQ-017: Rescue Partner Verification Criteria and Escalation (D-16)
**Status:** OPEN  
**Resolution:** Pending owner operational decision.  
**Raised:** 2026-11-08  
**Blocking:** Rescue organization onboarding and dispatch privilege assignment (`PB-058`, `PB-079`).  
**Notes:** Define formal vetting criteria for rescue organizations and individual rescue volunteers before granting elevated rescue triage and volunteer assignment rights, preventing animal welfare abuse and fraudulent donation solicitations.

---

## OQ-018: Data Retention, Consent, and Legal Compliance Review (D-17)
**Status:** OPEN  
**Resolution:** Pending legal counsel review.  
**Raised:** 2026-11-08  
**Blocking:** Final Terms of Service, Privacy Policy, automated data purge routines, and account deletion procedures (`PB-115`, `PB-116`).  
**Notes:** Retain qualified Bangladesh legal counsel to audit data protection compliance (Cyber Security Act, draft Data Protection Act), user consent flows, and regulatory compliance for user-submitted media and coarse location data prior to public beta release.

---

## OQ-019: Mobile Release Budget and Developer Accounts (D-18)
**Status:** OPEN  
**Resolution:** Pending owner budget approval.  
**Raised:** 2026-11-08  
**Blocking:** Mobile store registration and automated EAS build configuration (`PB-104`, `PB-105`).  
**Notes:** Approve mobile store development budgets:  
- Apple Developer Program: $99/year  
- Google Play Console: $25 one-time fee  
- Device testing hardware allocation.

---

## OQ-020: Moderation Staffing, Response SLAs, and Appeals Policy
**Status:** OPEN  
**Resolution:** Pending operational review.  
**Raised:** 2026-11-08  
**Blocking:** Operational moderation workflow handbook and escalation automation (`PB-077`, `PB-078`, `PB-117`).  
**Notes:** Establish community reporting review SLAs (e.g. < 4 hours for animal cruelty or high-risk posts; < 24 hours for standard user reports), moderation team coverage schedule for Bangladesh time zone, and formal user appeal procedure for suspended accounts.

---

## OQ-021: MVP Scope Boundary and Post-MVP Feature Deferrals
**Status:** RESOLVED  
**Resolution:** Confirmed canonical MVP boundary:  
- Baseline covers identity, animal profiles, social feed, responsible adoption, lost-and-found, rescue coordination, provider discovery, and trust/moderation.  
- Standalone community groups (`groups`, `group_members`, `group_posts`) scoped per ADR-017 for M3 without disrupting the 43-table baseline.  
- Commercial marketplace (cart, checkout, inventory, payments) is explicitly excluded from initial scope per ADR-009.  
**Raised:** 2026-11-08  
**Blocking:** None (resolved; unblocks milestone gating).  
**Notes:** Preserves initial 43-table foundation and prevents scope creep.
