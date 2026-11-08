# Open Decisions Register — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation

This register records all architectural, product, governance, and operational decisions identified during the dual-source documentation audit. Every decision must remain visible until formally resolved with an Architecture Decision Record (ADR) or recorded product approval. Do not silently assume answers to open decisions.

---

## D-1: Brand clearance
**Status:** OPEN  
**Resolution:** None (provisional name accepted under ADR-008).  
**Blocking:** Formal brand registration, public website launch, domain purchase, social handle reservation, trademark filing, app-store developer account registration.  
**Owner decision required:** Yes. Owner must verify and confirm trademark clearance with Bangladesh Department of Patents, Designs and Trademarks (DPDT), WIPO Madrid, domain availability (`.com`, `.com.bd`), and handle availability on Google Play, Apple App Store, and social platforms before public commercial launch.  
**Notes:** Product working name is KINNIPAW. Brand clearance remains provisional per ADR-008.

---

## D-2: Canonical 43-table schema baseline
**Status:** RESOLVED  
**Resolution:** ADR-013 / Preserved original 43-table canonical schema baseline as defined in `docs/database/ERD.md` and `docs/database/SCHEMA_SPEC.md`.  
**Blocking:** None (resolved; unblocks M1 database migration planning).  
**Owner decision required:** No.  
**Notes:** All 43 tables from the authoritative source context are preserved. Any table additions or removals require an explicit approved ADR.

---

## D-3: Canonical task IDs
**Status:** RESOLVED  
**Resolution:** ADR-018 / Preserved canonical task IDs PB-001 through PB-120 as documented in `docs/roadmap/TASKS.md`.  
**Blocking:** None (resolved).  
**Owner decision required:** No.  
**Notes:** External tracker issue keys must map to PB-xxx identifiers without renumbering or removing original IDs.

---

## D-4: API response envelope
**Status:** RESOLVED  
**Resolution:** ADR-019 / Standardized unified API response envelopes across all `/api/v1` routes:
- Success: `{ "success": true, "data": ..., "meta": { "requestId": "...", "nextCursor": "..." } }`
- Error: `{ "success": false, "error": { "code": "...", "message": "...", "details": ..., "requestId": "..." } }`  
**Blocking:** None (resolved; unblocks `packages/contracts`).  
**Owner decision required:** No.  
**Notes:** Fully documented in `docs/api/API.md`.

---

## D-5: `lost_found_matches` vs `ai_match_candidates` semantics
**Status:** RESOLVED  
**Resolution:** Both tables exist with distinct, non-conflicting operational purposes:
- `lost_found_matches`: Stores candidate pairs (rule-based and human-reviewed) presented directly to end users, tracking user review status (`dismissed`, `confirmed_reunion`).
- `ai_match_candidates`: Operates as an internal asynchronous AI processing and ingestion queue, storing model metadata, confidence scores, embedding distance, and ingestion status.  
**Blocking:** None (resolved).  
**Owner decision required:** No.  
**Notes:** Clarifies separation between business-layer match presentation and background AI processing.

---

## D-6: Polymorphic moderation foreign key strategy
**Status:** OPEN  
**Resolution:** Pending owner and database architect review.  
**Blocking:** Final migration authoring for `content_reports` and `moderation_actions` foreign keys.  
**Owner decision required:** Yes. Owner must select one of the following architectural strategies:
1. *Soft polymorphic reference:* `target_type` (e.g. `'post'`, `'comment'`, `'rescue_case'`) + `target_id` (UUID) without database-level FK constraints; enforced via application layer and triggers.
2. *Separate junction tables:* `report_posts`, `report_comments`, `report_rescue_cases` with strict relational foreign keys.
3. *JSONB reference payload:* Storing target entity details and snapshot inside a JSONB column.  
**Notes:** Option 1 matches common Supabase patterns but requires trigger-based cascading cleanup.

---

## D-7: Supabase free-tier commercial terms
**Status:** OPEN  
**Resolution:** Pending owner commercial verification.  
**Blocking:** Production infrastructure provisioning and staging rollout plan.  
**Owner decision required:** Yes. Owner must verify Supabase terms of service regarding commercial deployment under free tier vs. immediate provisioning of the Supabase Pro tier ($25/mo) to guarantee backup retention, avoid project pause on inactivity, and secure production SLAs.  
**Notes:** Free tier pauses inactive projects after 1 week and has restricted egress/storage limits.

---

## D-8: Commercial hosting provider
**Status:** OPEN  
**Resolution:** Pending owner vendor selection.  
**Blocking:** Production CI/CD deployment configuration for web application (`apps/web`).  
**Owner decision required:** Yes. Vercel Hobby strictly prohibits commercial usage. Owner must approve production hosting platform:
- Vercel Pro (commercial compliance, Next.js zero-config), or
- Cloudflare Workers/Pages (cost-effective, edge-first), or
- Self-hosted / VPS with Docker/Coolify.  
**Notes:** Local and non-commercial preview may use Vercel Hobby only while in private developer evaluation.

---

## D-9: MVP species categories
**Status:** OPEN  
**Resolution:** Pending owner product sign-off.  
**Blocking:** Seed data for `species` taxonomy table and UI taxonomy selector presets.  
**Owner decision required:** Yes. Specify exact species list enabled for MVP launch (e.g. dogs, cats, rabbits, domestic birds) vs. species deferred to Phase 2, while maintaining the extensible architecture required by the authoritative product context.  
**Notes:** Product context mandates "Every Animal", but wildlife and restricted species must have strict reporting-only flags.

---

## D-10: Farm and livestock scope in MVP
**Status:** OPEN  
**Resolution:** Pending owner product boundary decision.  
**Blocking:** Scope boundary for MVP adoption and lost-and-found forms.  
**Owner decision required:** Yes. Confirm whether cattle, goats, sheep, and poultry are supported in MVP community/lost-and-found, or deferred to a dedicated post-MVP farm-animal module.  
**Notes:** Commercial animal trading is out of scope for MVP.

---

## D-11: Adoption re-application policy
**Status:** OPEN  
**Resolution:** Pending owner business logic decision.  
**Blocking:** `adoption_applications` status transition validation rules in API.  
**Owner decision required:** Yes. Decide whether an applicant whose application was rejected or withdrawn can re-apply for the same animal listing, and if so, whether a mandatory cooldown period (e.g. 14 days) or owner block applies.  
**Notes:** Prevents spamming and harassment of listing owners.

---

## D-12: Messaging initiation rules
**Status:** OPEN  
**Resolution:** Pending owner safety and product review.  
**Blocking:** Authorization rules in `/api/v1/conversations` creation endpoint.  
**Owner decision required:** Yes. Approve direct messaging initiation permissions:
- Open: Any authenticated user can message any other user unless blocked.
- Contextual: Messaging permitted only in context of active adoption listing, sighting, or rescue assignment.
- Request-based: Message request required before full thread opens.  
**Notes:** Contextual or request-based model strongly recommended for harassment prevention in Bangladesh market.

---

## D-13: Reunion confirmation authority
**Status:** OPEN  
**Resolution:** Pending owner workflow sign-off.  
**Blocking:** State transition endpoint `/api/v1/lost-found/{id}/reunite`.  
**Owner decision required:** Yes. Decide who holds the authority to mark a lost animal case as reunited:
- Only the original report author,
- Either the report author or the matching found report author with mutual confirmation, or
- Authorized moderators/admins upon dispute.  
**Notes:** Dual-confirmation with single-party author override is recommended.

---

## D-14: Organization member publishing defaults
**Status:** OPEN  
**Resolution:** Pending owner organizational RBAC review.  
**Blocking:** Role permission checks in organization post/listing creation handlers.  
**Owner decision required:** Yes. Decide whether standard organization members (`org_member`) can publish public posts and adoption listings under the organization's name by default, or if publishing requires `org_admin` / `org_manager` approval.  
**Notes:** Protects organizational reputation and verified rescue status.

---

## D-15: Veterinary credential review process
**Status:** OPEN  
**Resolution:** Pending owner operational decision.  
**Blocking:** Provider verification administration workflow (`/api/v1/admin/providers/{id}/verify`).  
**Owner decision required:** Yes. Define veterinary license verification protocol:
- Manual document review by KINNIPAW internal admins verifying against Bangladesh Veterinary Council (BVC) registrations, or
- Automated/semi-automated verification workflow.  
**Notes:** Unverified providers must not display verified medical badges.

---

## D-16: Rescue partner verification criteria
**Status:** OPEN  
**Resolution:** Pending owner operational decision.  
**Blocking:** Rescue organization onboarding and dispatch privilege assignment.  
**Owner decision required:** Yes. Define formal vetting criteria for rescue organizations and individual rescue volunteers before granting elevated rescue triage and volunteer assignment rights.  
**Notes:** Protects animal welfare and prevents fraudulent donation requests.

---

## D-17: Data retention, consent, and legal compliance review
**Status:** OPEN  
**Resolution:** Pending legal counsel review.  
**Blocking:** Final Terms of Service, Privacy Policy, automated data purge routines, and account deletion procedures (`PB-115`, `PB-116`).  
**Owner decision required:** Yes. Retain qualified Bangladesh legal counsel to audit data protection compliance (Cyber Security Act, draft Data Protection Act), user consent flows, and regulatory compliance for user-submitted media and location data.  
**Notes:** Essential prior to public beta release.

---

## D-18: Mobile release budget and app-store provisioning
**Status:** OPEN  
**Resolution:** Pending owner budget approval.  
**Blocking:** Mobile store registration and automated EAS build configuration (`PB-104`, `PB-105`).  
**Owner decision required:** Yes. Approve mobile store development budgets:
- Apple Developer Program: $99/year
- Google Play Console: $25 one-time fee
- Device testing hardware allocation.  
**Notes:** Required prior to M9 mobile store submission.
