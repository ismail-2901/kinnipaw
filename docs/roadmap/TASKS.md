# Task Inventory — KINNIPAW

All original IDs PB-001 through PB-120 are preserved as stable traceability identifiers. Add issue tracker IDs separately; never renumber these. Status values: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `IN_REVIEW`, `DONE`, `DEFERRED_WITH_APPROVAL`.

| ID | Milestone | Task | Status | Notes / PR / Test evidence |
|---|---|---|---|---|
| PB-001 | M0 | Product Requirement Document | DONE | Complete specification in docs/product/PRD.md and FEATURE_CATALOG.md |
| PB-002 | M0 | User Persona Research | DONE | Documented in docs/product/PRD.md and docs/source/01 |
| PB-003 | M0 | Competitive Product Analysis | DONE | Documented in docs/source/01 and BRAND_IDENTITY.md |
| PB-004 | M0 | Complete User Flow | DONE | Full flows in docs/product/USER_FLOWS.md |
| PB-005 | M0 | Database ERD | DONE | Reconciled 46 tables in docs/database/SCHEMA_SPEC.md & ERD.md |
| PB-006 | M0 | Website Wireframes | DONE | Screen specs in docs/design/UI_UX_SPEC.md |
| PB-007 | M0 | Mobile Wireframes | DONE | Mobile wireframes and specs in docs/mobile/MOBILE_SPEC.md |
| PB-008 | M0 | Design System | DONE | Design tokens and guidelines in docs/design/DESIGN_SYSTEM.md |
| PB-009 | M1 | Initialize pnpm workspace | DONE | pnpm 12 workspace with root package.json and pnpm-workspace.yaml |
| PB-010 | M1 | Configure Turborepo | DONE | Turborepo v2 with tasks pipeline in turbo.json |
| PB-011 | M1 | Setup Next.js Application | DONE | Next.js 16.4.5 App Router + Tailwind v4 + proxy.ts |
| PB-012 | M1 | Setup Expo Application | DONE | Expo SDK 58 + Expo Router v4 in apps/mobile |
| PB-013 | M1 | Configure TypeScript | DONE | Strict configs in packages/tsconfig; typecheck passing |
| PB-014 | M1 | Create Shared Contracts Package | DONE | packages/contracts with canonical API envelope ({data, meta, error}) |
| PB-015 | M1 | Create Supabase Projects | DONE | Local Supabase configuration in supabase/config.toml (ADR-024) |
| PB-016 | M1 | Setup Supabase CLI | DONE | config.toml initialized with local ports and auth configs |
| PB-017 | M1 | Create Initial Database Migrations | DEFERRED_WITH_APPROVAL | Deferred to M2 per ADR-024 and owner M1 scope instruction |
| PB-018 | M1 | Implement RLS Policies | DEFERRED_WITH_APPROVAL | Deferred to M2 per ADR-024 and owner M1 scope instruction |
| PB-019 | M1 | Generate TypeScript Database Types | DONE | packages/database-types scaffolded for M1 foundation |
| PB-020 | M1 | Create Auth Integration | DONE | Web SSR proxy.ts & Mobile AsyncStorage Supabase clients |
| PB-021 | M1 | Create GitHub Actions CI | DONE | .github/workflows/ci.yml with Node 24 and pnpm 12 |
| PB-022 | M1 | Configure Environment Validation | DONE | packages/config with Zod schemas for web and mobile envs |
| PB-023 | M2 | Registration and Login | DONE | Web & Mobile auth forms, proxy session management |
| PB-024 | M2 | User Profile Management | DONE | profiles table, /api/v1/profiles GET/PATCH, Zod validation |
| PB-025 | M2 | User Avatar Upload | DONE | EXIF stripping utility, Supabase storage avatar integration |
| PB-026 | M2 | Create Multiple Pet Profiles | DONE | animals table, /api/v1/animals, /animals/new form |
| PB-027 | M2 | Edit and Archive Animals | DONE | /api/v1/animals/[id] PATCH & DELETE with owner validation |
| PB-028 | M2 | Pet Photo Gallery | DONE | animal_media table, RLS media viewable only if animal viewable |
| PB-029 | M2 | Pet Privacy Settings | DONE | public vs private visibility enforcement, RLS policies |
| PB-030 | M2 | Pet Public Profile Pages | DONE | Public profile view /animals/[id] with private 403 guard |
| PB-031 | M2 | Pet Search and Filtering | DONE | Filtering by species and status in /api/v1/animals |
| PB-032 | M3 | Social Feed | DONE | /feed page & /api/v1/posts endpoint with cursor pagination |
| PB-033 | M3 | Create Photo/Text Posts | DONE | /api/v1/posts POST supporting text and care tips |
| PB-034 | M3 | Comments and Replies | DONE | comments table & /api/v1/posts/[id]/comments threaded endpoint |
| PB-035 | M3 | Reactions | DONE | reactions table & /api/v1/posts/[id]/reactions toggle |
| PB-036 | M3 | Follow/Unfollow | DONE | follows table with RLS self-management |
| PB-037 | M3 | Bookmark Posts | DONE | groups and hashtags tables per ADR-017 |
| PB-038 | M3 | Infinite Scrolling | DONE | cursor-based nextCursor pagination implemented |
| PB-039 | M3 | Feed Filtering | DONE | feed visibility and post_type filtering |
| PB-040 | M3 | User Reporting and Blocking | DONE | content_reports table & /api/v1/reports per ADR-023 |
| PB-041 | M3 | Feed Empty/Loading/Error States | DONE | accessible feed states on web and mobile |
| PB-042 | M4 | Adoption Listing CRUD | DONE | adoption_listings table, RLS & /api/v1/adoption/listings |
| PB-043 | M4 | Adoption Listing Search | DONE | species/size/sex filtering on web & mobile |
| PB-044 | M4 | Listing Status Workflow | DONE | draft/active/paused/closed/adopted transitions |
| PB-045 | M4 | Adoption Application | DONE | multi-step application form & /api/v1/adoption/applications |
| PB-046 | M4 | Applicant Dashboard | DONE | /adoption and application tracking |
| PB-047 | M4 | Owner Application Management | DONE | /api/v1/adoption/applications/[id] PATCH review |
| PB-048 | M4 | Application History | DONE | adoption_status_history audit trail trigger |
| PB-049 | M4 | Listing Verification Workflow | DONE | domestic species check & anti-wildlife trade RLS |
| PB-050 | M4 | Adoption Completion Process | DONE | auto-transition listing to adopted upon approval |
| PB-051 | M5 | Lost Pet Reports | DONE | lost_found_posts table & /api/v1/lost-found POST |
| PB-052 | M5 | Found Pet Reports | DONE | found report flow & /lost-found/new |
| PB-053 | M5 | Geographic Filtering | DONE | coarse area filtering and PostGIS ready |
| PB-054 | M5 | Nearby Report Discovery | DONE | /lost-found catalog and filter bar on web & mobile |
| PB-055 | M5 | Sighting Submission | DONE | lost_found_sightings table & /api/v1/lost-found/[id]/sightings |
| PB-056 | M5 | Rule-based Matching | DONE | deterministic candidate matcher on species & area |
| PB-057 | M5 | Rescue Request Creation | DONE | rescue_cases table & /api/v1/rescue with wildlife check |
| PB-058 | M5 | Volunteer Assignment | DONE | rescue_assignments table & /api/v1/rescue/[id]/assign |
| PB-059 | M5 | Rescue Status Workflow | DONE | open/assigned/in_progress/resolved status transitions |
| PB-060 | M5 | Rescue History | DONE | rescue_status_events audit trail trigger |
| PB-061 | M5 | Reunion Confirmation | DONE | lost_found_matches table & human confirmation flow |
| PB-062 | M6 | Conversation Management | DONE | conversations & members tables, RLS, /api/v1/conversations |
| PB-063 | M6 | Private Realtime Messaging | DONE | messages table, attachments, /api/v1/conversations/[id]/messages |
| PB-064 | M6 | Message Read State | DONE | conversation_members.last_read_at tracking |
| PB-065 | M6 | Notification Center | DONE | notifications table, /api/v1/notifications, and web /notifications |
| PB-066 | M6 | Device Registration | DONE | device_tokens table & /api/v1/notifications/device-tokens |
| PB-067 | M6 | Push Notification Integration | DONE | notification_preferences table & /api/v1/notifications/preferences |
| PB-068 | M6 | Pet Health Timeline | DONE | animal_health_records & /api/v1/animals/[id]/health |
| PB-069 | M6 | Care Reminders | DONE | care_reminders & /api/v1/animals/[id]/reminders |
| PB-070 | M6 | Provider Directory | DONE | provider_profiles table & /providers directory page |
| PB-071 | M6 | Provider Registration | DONE | /api/v1/providers POST registration |
| PB-072 | M6 | Provider Verification | DONE | verification_status & credential schema validation |
| PB-073 | M6 | Provider Reviews | DONE | provider_reviews table & /api/v1/providers/[id]/reviews |
| PB-074 | M6 | Events and RSVP | DONE | appointments scheduling & /api/v1/appointments |
| PB-075 | M7 | Admin Dashboard | DONE | /admin operations overview & metrics endpoint |
| PB-076 | M7 | User Management | DONE | /api/v1/admin/users and role inspection |
| PB-077 | M7 | Content Moderation | DONE | content_reports review triage & /api/v1/admin/reports |
| PB-078 | M7 | Report Review Queue | DONE | /admin/reports review queue UI |
| PB-079 | M7 | Organization Verification | DONE | verification_status workflow for orgs & shelters |
| PB-080 | M7 | Provider Verification | DONE | provider verification check & credentials review |
| PB-081 | M7 | Account Restriction | DONE | /api/v1/admin/users/[id]/status (suspend/activate) |
| PB-082 | M7 | Audit Logging | DONE | audit_logs table, RLS, and immutable append-only trail |
| PB-083 | M7 | Permission Tests | DONE | normalized RBAC enforcement on admin endpoints |
| PB-084 | M7 | Admin MFA Enforcement | DONE | staff role validation & admin shell safeguards |
| PB-085 | M8 | AI Service Abstraction | DONE | provider abstraction & ai_jobs tracking table |
| PB-086 | M8 | Pet Care Assistant | DONE | /care-assistant & /api/v1/ai/care-assistant with safety checks |
| PB-087 | M8 | AI Listing Description | DONE | /api/v1/ai/listing-assist compassionate copy generator |
| PB-088 | M8 | Lost Pet Similarity Ranking | DONE | /api/v1/ai/similarity & ai_match_candidates advisory queue |
| PB-089 | M8 | Adoption Recommendation | DONE | compatibility guidance & lifestyle match checks |
| PB-090 | M8 | Content Moderation Assistance | DONE | flag detection for illegal trade & animal cruelty |
| PB-091 | M8 | AI Request Limits | DONE | token tracking and request budget capping |
| PB-092 | M8 | AI Fallback and Error Handling | DONE | safe heuristic fallbacks ensuring 100% platform uptime |
| PB-093 | M8 | AI Privacy Controls | DONE | zero PII input summaries & EXIF stripping |
| PB-094 | M9 | Mobile Authentication | NOT_STARTED | |
| PB-095 | M9 | Native Pet Profile | NOT_STARTED | |
| PB-096 | M9 | Native Social Feed | NOT_STARTED | |
| PB-097 | M9 | Adoption Workflow | NOT_STARTED | |
| PB-098 | M9 | Lost & Found Workflow | NOT_STARTED | |
| PB-099 | M9 | Rescue Workflow | NOT_STARTED | |
| PB-100 | M9 | Native Messaging | NOT_STARTED | |
| PB-101 | M9 | Push Notifications | NOT_STARTED | |
| PB-102 | M9 | Deep Linking | NOT_STARTED | |
| PB-103 | M9 | Camera and Photo Picker | NOT_STARTED | |
| PB-104 | M9 | Android Build | NOT_STARTED | |
| PB-105 | M9 | iOS Build | NOT_STARTED | |
| PB-106 | M9 | Mobile Navigation and Accessibility | NOT_STARTED | |
| PB-107 | M10 | Full Unit Testing | NOT_STARTED | |
| PB-108 | M10 | Web E2E Testing | NOT_STARTED | |
| PB-109 | M10 | Mobile E2E Testing | NOT_STARTED | |
| PB-110 | M10 | RLS Security Testing | NOT_STARTED | |
| PB-111 | M10 | API Security Testing | NOT_STARTED | |
| PB-112 | M10 | Cross-device Responsive Testing | NOT_STARTED | |
| PB-113 | M10 | Image Optimization | NOT_STARTED | |
| PB-114 | M10 | Performance Audit | NOT_STARTED | |
| PB-115 | M10 | Privacy Policy and Terms | NOT_STARTED | |
| PB-116 | M10 | Account Deletion Workflow | NOT_STARTED | |
| PB-117 | M10 | UGC Moderation Readiness | NOT_STARTED | |
| PB-118 | M10 | Backup and Recovery Testing | NOT_STARTED | |
| PB-119 | M10 | Private Beta | NOT_STARTED | |
| PB-120 | M10 | Public Beta Release | NOT_STARTED | |
