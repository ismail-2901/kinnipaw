# Requirements Traceability — KINNIPAW

## Purpose Statement
This document establishes comprehensive, end-to-end requirement traceability across the KINNIPAW platform. It connects the high-level functional work packages from the HTML Foundation specification (`POS-001` through `POS-068`) with the canonical execution task backlog (`PB-001` through `PB-120`), feature modules, required documentation deliverables, and architectural conflict resolutions.

## How to Use
- **Engineers & Agents:** Before starting any implementation task, look up the canonical task ID (`PB-xxx`) in Section 1 or Section 2 to identify its linked requirements, architectural constraints, and related tasks.
- **Auditors & Reviewers:** Consult Section 3 to verify documentation governance completeness and Section 4 to inspect ADR justifications for all dual-source audit decisions.
- **Updates:** Every time a task is implemented, tested, or deferred, update its status in `docs/roadmap/TASKS.md` and keep this traceability matrix synchronized.

## Status Legend
- `NOT_STARTED`: The requirement or task is defined and prioritized but work has not commenced.
- `IN_PROGRESS`: Active implementation, documentation, or verification is currently underway.
- `DONE`: Implementation, tests, authorization checks, and acceptance criteria have been verified.
- `DEFERRED`: Intentionally postponed to a subsequent milestone with recorded approval.
- `CONFLICTING`: Requirement exhibits dual-source contradictions requiring owner determination.

---

## Section 1: POS-to-PB Mapping Table
This table maps each requirement work package from the HTML Foundation roadmap (`POS-001` through `POS-068`) to the canonical execution tasks (`PB-001` through `PB-120`) that implement and verify it.

| POS ID | POS Requirement Summary (HTML Foundation) | PB Task(s) | Status |
|--------|-------------------------------------------|------------|--------|
| POS-001 | Brand and project setup | PB-001, PB-008 | DONE |
| POS-002 | Docs structure | PB-001, PB-004 | DONE |
| POS-003 | PRD (Product Requirements Document) | PB-001, PB-002, PB-003, PB-004 | DONE |
| POS-004 | ERD / schema spec | PB-005 | DONE |
| POS-005 | RBAC / security architecture | PB-001, PB-005, PB-018, PB-020 | DONE |
| POS-006 | API / OpenAPI specification | PB-014 | DONE |
| POS-007 | Traceability and open decisions register | PB-001 | DONE |
| POS-008 | pnpm / Turborepo monorepo setup | PB-009, PB-010 | DONE |
| POS-009 | Next.js application shell setup | PB-011, PB-013 | DONE |
| POS-010 | Expo mobile application setup | PB-012, PB-013 | DONE |
| POS-011 | Shared packages (`contracts`, `tokens`, types) | PB-013, PB-014 | DONE |
| POS-012 | Supabase local/dev environment & migrations | PB-015, PB-016, PB-017, PB-018, PB-019 | DONE |
| POS-013 | CI quality gates & GitHub Actions | PB-021 | DONE |
| POS-014 | Environment configuration & validation | PB-022 | DONE |
| POS-015 | Authentication & session management | PB-020, PB-023 | DONE |
| POS-016 | User profile management & avatar upload | PB-024, PB-025 | DONE |
| POS-017 | User onboarding flow & initial setup | PB-024 | DONE |
| POS-018 | Animal profile CRUD, search & filtering | PB-026, PB-027, PB-030, PB-031 | DONE |
| POS-019 | Animal photos & sanitized media gallery | PB-028 | DONE |
| POS-020 | Care timeline & health record history | PB-068 | NOT_STARTED |
| POS-021 | Care reminders (vaccinations, grooming) | PB-069 | NOT_STARTED |
| POS-022 | Social community feed & infinite scroll | PB-032, PB-038, PB-039, PB-041 | NOT_STARTED |
| POS-023 | Post creation with media & sanitization | PB-033 | NOT_STARTED |
| POS-024 | Comments & threaded replies | PB-034 | NOT_STARTED |
| POS-025 | Community post reactions & counts | PB-035 | NOT_STARTED |
| POS-026 | Follow / unfollow user & animal profiles | PB-036 | NOT_STARTED |
| POS-027 | Bookmarks & topic/hashtag filtering | PB-037, PB-039 | NOT_STARTED |
| POS-028 | Community groups & member interactions | PB-032, PB-039 | NOT_STARTED |
| POS-029 | Adoption listings CRUD & review workflow | PB-042, PB-044, PB-049 | NOT_STARTED |
| POS-030 | Adoption search & multi-criteria filtering | PB-043 | NOT_STARTED |
| POS-031 | Adoption application submission & dashboard | PB-045, PB-046 | NOT_STARTED |
| POS-032 | Application review, status history & completion | PB-047, PB-048, PB-050 | NOT_STARTED |
| POS-033 | Safe contact, anti-scam guidance & screening | PB-042, PB-045, PB-062 | NOT_STARTED |
| POS-034 | Lost & found animal reporting (dual flow) | PB-051, PB-052 | NOT_STARTED |
| POS-035 | Public sighting submission & coordinates | PB-055 | NOT_STARTED |
| POS-036 | Match candidates generation (rule-based + AI) | PB-056, PB-088 | NOT_STARTED |
| POS-037 | Human match review & candidate dismissal | PB-056, PB-061 | NOT_STARTED |
| POS-038 | Rescue request creation & urgency triage | PB-057, PB-059 | NOT_STARTED |
| POS-039 | Volunteer rescue assignment, history & closure | PB-058, PB-060 | NOT_STARTED |
| POS-040 | Conversation management & authorization | PB-062 | NOT_STARTED |
| POS-041 | Realtime messaging & delivery/read states | PB-063, PB-064 | NOT_STARTED |
| POS-042 | In-app notification center & preferences | PB-065 | NOT_STARTED |
| POS-043 | Push foundations & device registration | PB-066, PB-067 | NOT_STARTED |
| POS-044 | Professional directory, services & reviews | PB-070, PB-071, PB-072, PB-073 | NOT_STARTED |
| POS-045 | Search alerts & geographic radius discovery | PB-053, PB-054, PB-065 | NOT_STARTED |
| POS-046 | Protected admin shell & metrics overview | PB-075 | NOT_STARTED |
| POS-047 | RBAC administration, user roles & MFA | PB-076, PB-083, PB-084 | NOT_STARTED |
| POS-048 | Content report review queue & triage | PB-077, PB-078 | NOT_STARTED |
| POS-049 | Moderation actions, account restrictions & bans | PB-077, PB-081, PB-082 | NOT_STARTED |
| POS-050 | Professional & rescue org verification review | PB-079, PB-080 | NOT_STARTED |
| POS-051 | Audit log viewer & security event history | PB-082 | NOT_STARTED |
| POS-052 | AI provider abstraction & failover layer | PB-085 | NOT_STARTED |
| POS-053 | Educational pet care companion (non-diagnostic) | PB-086 | NOT_STARTED |
| POS-054 | AI adoption compatibility suggestions & copy | PB-087, PB-089 | NOT_STARTED |
| POS-055 | AI lost/found visual similarity ranking | PB-088 | NOT_STARTED |
| POS-056 | AI content moderation risk scoring & triage | PB-090 | NOT_STARTED |
| POS-057 | AI cost controls, token limits & fallbacks | PB-091, PB-092, PB-093 | NOT_STARTED |
| POS-058 | Native mobile feature parity (profiles, feed, adoption, rescue) | PB-095, PB-096, PB-097, PB-098, PB-099, PB-100 | NOT_STARTED |
| POS-059 | Mobile universal & deep linking integration | PB-102 | NOT_STARTED |
| POS-060 | Native mobile push notifications (APNs / FCM) | PB-101 | NOT_STARTED |
| POS-061 | Native device permissions (camera, photos, location) | PB-103 | NOT_STARTED |
| POS-062 | Store assets, bundle config & app metadata | PB-104, PB-105, PB-106 | NOT_STARTED |
| POS-063 | Comprehensive security audit (RLS, API, headers) | PB-110, PB-111 | NOT_STARTED |
| POS-064 | Performance audit, CDN & image optimization | PB-113, PB-114 | NOT_STARTED |
| POS-065 | Accessibility audit (WCAG AA) & responsive checks | PB-106, PB-112 | NOT_STARTED |
| POS-066 | Backup, restore & disaster recovery rehearsal | PB-118 | NOT_STARTED |
| POS-067 | Private beta execution & feedback loop | PB-119 | NOT_STARTED |
| POS-068 | Production rollout, observability & public launch | PB-115, PB-116, PB-117, PB-120 | NOT_STARTED |

---

## Section 2: Feature-to-PB Mapping
This section maps the canonical execution backlog tasks to major product and infrastructure feature modules.

### 1. Lost & Found
- **Core Workflow:** `PB-051` (Lost Pet Reports), `PB-052` (Found Pet Reports), `PB-055` (Sighting Submission), `PB-061` (Reunion Confirmation).
- **Discovery & Search:** `PB-053` (Geographic Filtering), `PB-054` (Nearby Report Discovery).
- **Matching Intelligence:** `PB-056` (Rule-based Matching), `PB-088` (Lost Pet Similarity Ranking).
- **Mobile Parity:** `PB-098` (Lost & Found Workflow).

### 2. Adoption
- **Listing Management:** `PB-042` (Adoption Listing CRUD), `PB-043` (Adoption Listing Search), `PB-044` (Listing Status Workflow), `PB-049` (Listing Verification Workflow).
- **Application Lifecycle:** `PB-045` (Adoption Application), `PB-046` (Applicant Dashboard), `PB-047` (Owner Application Management), `PB-048` (Application History), `PB-050` (Adoption Completion Process).
- **AI & Assistance:** `PB-087` (AI Listing Description), `PB-089` (Adoption Recommendation).
- **Mobile Parity:** `PB-097` (Adoption Workflow).

### 3. Community Feed
- **Content Creation & Consumption:** `PB-032` (Social Feed), `PB-033` (Create Photo/Text Posts), `PB-034` (Comments and Replies), `PB-035` (Reactions), `PB-036` (Follow/Unfollow), `PB-037` (Bookmark Posts).
- **Feed Mechanics & UX:** `PB-038` (Infinite Scrolling), `PB-039` (Feed Filtering), `PB-040` (User Reporting and Blocking), `PB-041` (Feed Empty/Loading/Error States).
- **Mobile Parity:** `PB-096` (Native Social Feed).

### 4. Community Groups
- **Group Governance & Discussion:** `PB-032` (Social Feed baseline), `PB-039` (Topic/group filtering).
- **Architecture Notes:** Standalone group tables (`groups`, `group_members`, `group_posts`) scoped per ADR-017 for Milestone 3 implementation.

### 5. Rescue Coordination
- **Case Lifecycle:** `PB-057` (Rescue Request Creation), `PB-058` (Volunteer Assignment), `PB-059` (Rescue Status Workflow), `PB-060` (Rescue History).
- **Mobile Parity:** `PB-099` (Rescue Workflow).

### 6. Provider Directory
- **Discovery & Registration:** `PB-070` (Provider Directory), `PB-071` (Provider Registration), `PB-072` (Provider Verification), `PB-073` (Provider Reviews).
- **Moderation Oversight:** `PB-080` (Admin Provider Verification).

### 7. Organizations
- **Entity Management:** `PB-042` (Organization listing attribution), `PB-049` (Organization listing verification), `PB-057` (Organization rescue dispatch).
- **Admin & Governance:** `PB-079` (Organization Verification).

### 8. Messaging
- **Conversation & Threading:** `PB-062` (Conversation Management), `PB-063` (Private Realtime Messaging), `PB-064` (Message Read State).
- **Mobile Parity:** `PB-100` (Native Messaging).

### 9. AI Features
- **Provider Infrastructure:** `PB-085` (AI Service Abstraction), `PB-091` (AI Request Limits), `PB-092` (AI Fallback and Error Handling), `PB-093` (AI Privacy Controls).
- **Functional Use Cases:** `PB-086` (Pet Care Assistant), `PB-087` (AI Listing Description), `PB-088` (Lost Pet Similarity Ranking), `PB-089` (Adoption Recommendation), `PB-090` (Content Moderation Assistance).

### 10. Moderation & Trust Safety
- **User Safety Controls:** `PB-040` (User Reporting and Blocking), `PB-077` (Content Moderation), `PB-078` (Report Review Queue), `PB-081` (Account Restriction), `PB-082` (Audit Logging), `PB-090` (AI Moderation Assistance), `PB-117` (UGC Moderation Readiness).

### 11. User Profiles & Auth
- **Identity & Profiles:** `PB-020` (Auth Integration), `PB-023` (Registration and Login), `PB-024` (User Profile Management), `PB-025` (User Avatar Upload).
- **Animal Profiles:** `PB-026` (Create Multiple Pet Profiles), `PB-027` (Edit and Archive Animals), `PB-028` (Pet Photo Gallery), `PB-029` (Pet Privacy Settings), `PB-030` (Pet Public Profile Pages), `PB-031` (Pet Search and Filtering), `PB-068` (Pet Health Timeline), `PB-069` (Care Reminders).
- **Mobile Auth & Profiles:** `PB-094` (Mobile Authentication), `PB-095` (Native Pet Profile).

### 12. Monorepo Foundation (M0/M1)
- **Planning & Specifications:** `PB-001` (PRD), `PB-002` (User Personas), `PB-003` (Competitor Analysis), `PB-004` (User Flows), `PB-006` (Web Wireframes), `PB-007` (Mobile Wireframes), `PB-008` (Design System).
- **Workspaces & Shells:** `PB-009` (pnpm workspace), `PB-010` (Turborepo), `PB-011` (Next.js Application), `PB-012` (Expo Application), `PB-013` (TypeScript Setup), `PB-014` (Shared Contracts Package).

### 13. Database & Schema
- **Database Modeling:** `PB-005` (Database ERD), `PB-015` (Supabase Projects), `PB-016` (Supabase CLI), `PB-017` (Initial Database Migrations), `PB-018` (RLS Policies), `PB-019` (TypeScript Database Types).

### 14. Security & RBAC
- **Access Control & Defense:** `PB-018` (RLS Policies), `PB-020` (Auth Integration), `PB-076` (User Management), `PB-081` (Account Restriction), `PB-082` (Audit Logging), `PB-083` (Permission Tests), `PB-084` (Admin MFA Enforcement), `PB-110` (RLS Security Testing), `PB-111` (API Security Testing).

### 15. Testing
- **Automated Verification:** `PB-083` (Permission Tests), `PB-107` (Full Unit Testing), `PB-108` (Web E2E Testing), `PB-109` (Mobile E2E Testing), `PB-110` (RLS Security Testing), `PB-111` (API Security Testing), `PB-112` (Cross-device Responsive Testing), `PB-118` (Backup and Recovery Testing).

### 16. CI/CD & Operations
- **Pipelines & Operations:** `PB-021` (GitHub Actions CI), `PB-022` (Environment Validation), `PB-114` (Performance Audit), `PB-118` (Backup and Recovery Testing), `PB-120` (Public Beta Release).

### 17. Mobile Application
- **Native Implementation:** `PB-012` (Setup Expo), `PB-094` (Auth), `PB-095` (Profiles), `PB-096` (Feed), `PB-097` (Adoption), `PB-098` (Lost & Found), `PB-099` (Rescue), `PB-100` (Messaging), `PB-101` (Push Notifications), `PB-102` (Deep Linking), `PB-103` (Camera/Photo Picker), `PB-104` (Android Build), `PB-105` (iOS Build), `PB-106` (Mobile Navigation/A11y), `PB-109` (Mobile E2E).

---

## Section 3: Documentation Requirement Traceability
This table audits every documentation artifact required by the HTML Foundation or ZIP specification, tracking governance completeness.

| Doc File | Required By | Status | Notes |
|----------|-------------|--------|-------|
| `docs/START_HERE.md` | ZIP / HTML §14 | DONE | Entry point for all development work |
| `docs/ANTIGRAVITY_EXECUTION_CONTRACT.md` | ZIP / HTML §21 | DONE | Strict phase gating and non-negotiable rules |
| `docs/OPEN_QUESTIONS.md` | ZIP / HTML §18 | DONE | Canonical register of open and resolved questions |
| `docs/TRACEABILITY.md` | HTML §14.1 / ZIP | DONE (reconciled) | Full requirement-level mapping matrix |
| `docs/decisions/OPEN_DECISIONS.md` | HTML §18 | DONE (created M0) | Open architectural decisions tracking register |
| `docs/architecture/DECISIONS.md` | ZIP / HTML §5 | DONE | Canonical ADR repository (ADR-001–ADR-020) |
| `docs/architecture/ARCHITECTURE.md` | HTML §5 / ZIP | DONE | System architecture and modular monolith design |
| `docs/architecture/REPOSITORY_STRUCTURE.md` | HTML §4.1 / ZIP | DONE | Turborepo monorepo directory layout |
| `docs/database/ERD.md` | HTML §6 / ZIP | DONE | Entity-Relationship Diagrams across all clusters |
| `docs/database/SCHEMA_SPEC.md` | HTML §6 / ZIP | DONE (reconciled) | Reconciled 43-table schema specification (ADR-013) |
| `docs/database/MIGRATIONS.md` | HTML §6.2 / ZIP | DONE | Versioned migration standards and recovery drills |
| `docs/product/PRD.md` | HTML §2 / ZIP | DONE | Product requirements and feature priorities |
| `docs/product/BRAND_IDENTITY.md` | HTML §1 / ZIP | DONE (reconciled) | Brand colours, voice, and positioning (ADR-020) |
| `docs/product/USER_FLOWS.md` | HTML §2.3 / ZIP | DONE | Detailed step-by-step user journey maps |
| `docs/product/FEATURE_CATALOG.md` | HTML §14 | DONE (created M0) | Complete functional catalog of modules |
| `docs/security/SECURITY.md` | HTML §9 / ZIP | DONE | Threat model, data isolation, and auth policies |
| `docs/security/RBAC.md` | HTML §7 / ZIP | DONE | 10-role permission matrix and RLS evaluation order |
| `docs/api/API.md` | HTML §8 / ZIP | DONE (reconciled) | Route handlers and response envelopes (ADR-019) |
| `docs/api/openapi.yaml` | HTML §8, §14 | DONE (created M0) | OpenAPI 3.1 contract definition |
| `docs/design/UI_UX_SPEC.md` | HTML §11 / ZIP | DONE | Design tokens, typography, routes, and breakpoints |
| `docs/design/DESIGN_SYSTEM.md` | HTML §14 | DONE (covered) | Detailed component system and design token spec |
| `docs/design/RESPONSIVE_SPEC.md` | HTML §14 | DONE (covered) | Breakpoint constraints (in `UI_UX_SPEC.md`) |
| `docs/design/ACCESSIBILITY.md` | HTML §14 | DONE (covered) | WCAG AA compliance rules (in `UI_UX_SPEC.md`) |
| `docs/mobile/MOBILE_SPEC.md` | HTML §11 / ZIP | DONE | Expo configuration, offline caching, native modules |
| `docs/ai/AI_SPEC.md` | HTML §10 / ZIP | DONE | AI safety boundaries, provider abstraction, quotas |
| `docs/operations/DEPLOYMENT.md` | HTML §13 / ZIP | DONE | Free-tier constraints, hosting, store submissions |
| `docs/operations/ENVIRONMENT_VARIABLES.md` | HTML §14 | DONE (covered) | Environment secret boundaries and schema validation |
| `docs/operations/BACKUP_RECOVERY.md` | HTML §14 | DONE (covered) | Backup rotation and disaster recovery rehearsal spec |
| `docs/roadmap/ROADMAP.md` | HTML §16 / ZIP | DONE | Sequential milestone roadmap (M0–M10) |
| `docs/roadmap/TASKS.md` | ZIP / HTML §16 | DONE (canonical) | Canonical PB-001 through PB-120 execution inventory |
| `docs/roadmap/DOCUMENTATION_AUDIT.md` | HTML §14 / ZIP | DONE | Formal completeness and consistency audit gate |
| `docs/roadmap/M0_READINESS_REPORT.md` | HTML §14 / ZIP | DONE (created M0) | Milestone M0 formal exit assessment report |
| `docs/testing/TEST_STRATEGY.md` | HTML §12.2, §14 | DONE (created M0) | Testing levels, coverage targets, and test runner spec |
| `docs/TOOLING.md` | HTML §19 | DONE (created M0) | Recommended agent skill tooling and security gates |
| `AGENTS.md` | HTML §15 / ZIP | DONE (reconciled) | Root permanent engineering instructions |

---

## Section 4: Conflict Resolution Log
This log documents the 9 substantive technical and architectural conflicts identified during the dual-source audit, along with their approved owner resolutions and corresponding Architecture Decision Records (ADRs).

| Conflict ID | Domain | HTML Position | ZIP Position | Approved Resolution | ADR Reference |
|-------------|--------|---------------|--------------|---------------------|---------------|
| **C-1** | Database Schema | 43 tables with vet-specific models (`vet_profiles`, `vet_clinics`), dedicated health tables (`vaccinations`, `medications`), community groups, and hashtags. | 43 tables with generic providers (`provider_profiles`, `provider_services`), organizations, single `pet_health_records`, and explicit AI job provenance. | Reconciled canonical 43-table baseline preserving animal-inclusive models, generic provider profiles, organization entities, dedicated health records, and separate media tables. | ADR-013 |
| **C-2** | Task ID System | `POS-001` through `POS-068` (68 work packages). | `PB-001` through `PB-120` (120 execution tasks). | `PB-001` through `PB-120` confirmed as canonical execution task backlog in `docs/roadmap/TASKS.md`. `POS` IDs retained as requirements-level anchors mapped in `docs/TRACEABILITY.md`. | ADR-018 |
| **C-3** | API Response Envelope | Format: `{ "data": {}, "meta": { "requestId", "nextCursor" }, "error": null }`. | Format: `{ "success": true, "data": ... }` / `{ "success": false, "error": { "code", "message", ... } }`. | Standardized unified envelope with top-level `success: boolean`, optional `data`, `error` object on failure, and `meta` (containing `requestId` and cursor pagination). | ADR-019 |
| **C-4** | Brand Colour Palette | Forest Green `#245B45` as primary brand colour. | Sage Green `#66856C` as primary brand colour. | Forest Green `#245B45` adopted as canonical primary brand colour; Sage Green `#66856C` retained as supporting/secondary colour with Warm Ivory `#FAF9F6` background. | ADR-020 |
| **C-5** | Provider Model | Vet-centric model (`vet_profiles` + `vet_clinics`). | Generic professional model (`provider_profiles`, `provider_services`, `provider_reviews`). | Generic provider model adopted to support all animal-care disciplines (vets, clinics, trainers, groomers, shelters) per authoritative context. | ADR-013 |
| **C-6** | AI Persistence Architecture | Single interaction log (`ai_interactions`). | Separate pipeline tables: `ai_jobs` (execution audit) and `ai_match_candidates` (model scores). | Preserved separation of concerns: `lost_found_matches` stores user-facing pairs and human review; `ai_jobs` and `ai_match_candidates` manage internal AI pipelines. | ADR-010 |
| **C-7** | RBAC Architecture | 3-table normalized schema (`roles`, `permissions`, `role_permissions`). | Single `user_roles` junction table with role enum / CHECK constraints. | Pragmatic Supabase RBAC using `user_roles` combined with application/RLS-level resource ownership and organization membership checks. | ADR-006 |
| **C-8** | Community Groups Scope | Explicitly scoped with `groups`, `group_members`, and `group_posts` tables. | Groups omitted from initial 43-table inventory; feed-first architecture. | Preserved groups in canonical product architecture; group tables scoped for Milestone 3 implementation without compromising the 43-table baseline. | ADR-017 |
| **C-9** | Monorepo Package Structure | `contracts/`, `config/`, `design-tokens/`, `domain/`, `utils/`. | `contracts/`, `api-client/`, `database-types/`, `design-tokens/`, `eslint-config/`, `tsconfig/`. | Harmonized layout combining `@kinnipaw/contracts`, `@kinnipaw/design-tokens`, `@kinnipaw/database-types`, and unified lint/tsconfig packages. | ADR-021 |
