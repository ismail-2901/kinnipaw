# Database Schema Specification — KINNIPAW

> **Reconciled canonical schema — supersedes pre-reconciliation inventory.**
> Status: M0 Documentation Reconciliation | Last updated: 2026-11-08
> Governing ADR: ADR-013 (schema reconciliation), ADR-014 (providers), ADR-015 (AI tables), ADR-016 (RBAC), ADR-017 (groups).
> Original sources: `KINNIPAW_Project_Foundation_FINAL.html` §8 and ZIP `docs/database/SCHEMA_SPEC.md` (pre-reconciliation).

---

## Global conventions

- UUID primary keys (v4) for all entity tables; composite primary keys for pure junction tables where noted.
- `TIMESTAMPTZ` for all timestamps; store UTC, render locale-aware.
- Foreign keys carry explicit `ON DELETE` policies — no blanket CASCADE of user-contributed data.
- Use PostgreSQL CHECK constraints or reviewed `TEXT CHECK(value IN (...))` patterns for status/type columns.
- `created_at` and `updated_at` on all mutable tables; append-only event/history tables are immutable.
- Use `JSONB` only for genuinely flexible or extensible metadata, not as a substitute for relational columns.
- Exact home addresses and private coordinates must never appear in public query results.
- Private health records and documents are stored in private Supabase Storage buckets; signed URLs only.
- PostGIS `geography(Point, 4326)` for proximity search; public results must use coarse/fuzzified coordinates.
- Every table requires reviewed RLS policies before any migration is applied to a shared environment.

---

## Table inventory (43 tables + Supabase auth.users)

| # | Table | Domain | Key relations |
|---|-------|--------|---------------|
| 01 | `profiles` | Identity | → auth.users |
| 02 | `roles` | RBAC | — |
| 03 | `permissions` | RBAC | — |
| 04 | `role_permissions` | RBAC | → roles, permissions |
| 05 | `user_role_assignments` | RBAC | → profiles, roles |
| 06 | `organizations` | Orgs | → profiles (created_by) |
| 07 | `organization_members` | Orgs | → organizations, profiles |
| 08 | `species` | Animals | — |
| 09 | `breeds` | Animals | → species |
| 10 | `animals` | Animals | → profiles (owner), species, breeds |
| 11 | `animal_media` | Animals | → animals, profiles |
| 12 | `animal_health_records` | Health | → animals, profiles, provider_profiles |
| 13 | `vaccinations` | Health | → animals, profiles, provider_profiles |
| 14 | `medications` | Health | → animals, profiles |
| 15 | `care_reminders` | Health | → animals, profiles |
| 16 | `provider_profiles` | Providers | → profiles, organizations |
| 17 | `provider_services` | Providers | → provider_profiles |
| 18 | `provider_reviews` | Providers | → provider_profiles, profiles |
| 19 | `appointments` | Providers | → provider_profiles, animals, profiles |
| 20 | `posts` | Community | → profiles, organizations |
| 21 | `post_media` | Community | → posts |
| 22 | `comments` | Community | → posts, profiles |
| 23 | `reactions` | Community | → posts, profiles |
| 24 | `hashtags` | Community | — |
| 25 | `post_hashtags` | Community | → posts, hashtags |
| 26 | `follows` | Community | → profiles (follower, followed) |
| 27 | `groups` | Community | → profiles (created_by), organizations |
| 28 | `group_members` | Community | → groups, profiles |
| 29 | `group_posts` | Community | → groups, posts |
| 30 | `lost_found_posts` | Lost & Found | → profiles, animals |
| 31 | `lost_found_sightings` | Lost & Found | → lost_found_posts, profiles |
| 32 | `lost_found_matches` | Lost & Found | → lost_found_posts, ai_match_candidates |
| 33 | `adoption_listings` | Adoption | → animals, profiles, organizations |
| 34 | `adoption_applications` | Adoption | → adoption_listings, profiles |
| 35 | `adoption_status_history` | Adoption | → adoption_applications, profiles |
| 36 | `rescue_cases` | Rescue | → profiles, organizations |
| 37 | `rescue_assignments` | Rescue | → rescue_cases, profiles |
| 38 | `rescue_status_events` | Rescue | → rescue_cases, profiles |
| 39 | `conversations` | Messaging | — |
| 40 | `messages` | Messaging | → conversations, profiles |
| 41 | `message_attachments` | Messaging | → messages |
| 42 | `notifications` | System | → profiles |
| 43 | `content_reports` | Moderation | → profiles (reporter, subject) |
| 44 | `ai_jobs` | AI | → profiles |
| 45 | `ai_match_candidates` | AI | → ai_jobs, lost_found_posts |
| 46 | `audit_logs` | System | → profiles |

> **Canonical table count: 46.** Tables 01–43 are the core application tables. Tables 44–46 (ai_jobs, ai_match_candidates, audit_logs) are operational/AI tables required for safe platform operation. The original HTML and ZIP both referenced "43 application tables"; the reconciled schema adds 3 operational tables (AI job tracking, match candidate provenance, audit trail) justified by ADR-013, ADR-015, and security requirements. ADR-013 accepts this final count of 46.

---

## Detailed table specifications

### 01. `profiles`
**Purpose:** Extended user profile data; 1:1 with `auth.users`. Created automatically on sign-up via trigger.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users.id ON DELETE CASCADE | Matches Supabase auth user ID |
| `username` | TEXT | UNIQUE, NOT NULL | URL-safe unique handle |
| `display_name` | TEXT | NOT NULL | Display name |
| `avatar_path` | TEXT | NULL | Private storage path; expose via signed URL |
| `bio` | TEXT | NULL | Short user bio |
| `preferred_locale` | TEXT | DEFAULT 'en' | 'en' or 'bn' |
| `city` | TEXT | NULL | City label (not coordinates) |
| `area_label` | TEXT | NULL | Neighbourhood/thana label |
| `account_status` | TEXT | CHECK(active\|suspended\|deactivated) DEFAULT 'active' | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Users read their own profile; public can read non-sensitive fields of active profiles. Only owner can update.

---

### 02. `roles`
**Purpose:** Named role definitions (normalized RBAC per ADR-016).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `name` | TEXT | UNIQUE, NOT NULL | e.g. 'admin', 'moderator', 'rescue_coordinator' |
| `description` | TEXT | NULL | Human description |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by authenticated users. Writable only by super_admin.

---

### 03. `permissions`
**Purpose:** Atomic permission identifiers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `name` | TEXT | UNIQUE, NOT NULL | e.g. 'adoption.review', 'moderation.suspend_user' |
| `description` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by authenticated users. Writable only by super_admin.

---

### 04. `role_permissions`
**Purpose:** Many-to-many assignment of permissions to roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `role_id` | UUID | PK part, FK → roles.id ON DELETE CASCADE | — |
| `permission_id` | UUID | PK part, FK → permissions.id ON DELETE CASCADE | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by authenticated users. Writable only by super_admin.

---

### 05. `user_role_assignments`
**Purpose:** Assigns global roles to users. Never self-assignable.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `user_id` | UUID | FK → profiles.id ON DELETE CASCADE | — |
| `role_id` | UUID | FK → roles.id ON DELETE CASCADE | — |
| `granted_by` | UUID | FK → profiles.id NULL | Assigning admin |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(user_id, role_id) | — |

**RLS:** Only admins/super_admins can read or write. Never exposed to general users.

---

### 06. `organizations`
**Purpose:** Rescue shelters, vet clinics, community orgs, adoption centres.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `name` | TEXT | NOT NULL | Display name |
| `slug` | TEXT | UNIQUE, NOT NULL | URL slug |
| `organization_type` | TEXT | CHECK(rescue\|clinic\|community\|adoption_centre\|other) | — |
| `description` | TEXT | NULL | — |
| `verification_status` | TEXT | CHECK(unverified\|pending\|verified\|suspended) DEFAULT 'unverified' | — |
| `public_email` | TEXT | NULL | Contact email |
| `public_phone` | TEXT | NULL | Contact phone |
| `city` | TEXT | NULL | — |
| `area_label` | TEXT | NULL | Coarse location label |
| `service_area` | GEOGRAPHY(Point,4326) | NULL | Fuzzified centre of service area |
| `created_by` | UUID | FK → profiles.id | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable (non-sensitive fields). Writable by org owners/managers and admins.

---

### 07. `organization_members`
**Purpose:** User membership in organizations with scoped roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `organization_id` | UUID | FK → organizations.id ON DELETE CASCADE | — |
| `user_id` | UUID | FK → profiles.id ON DELETE CASCADE | — |
| `organization_role` | TEXT | CHECK(owner\|manager\|rescuer\|staff\|volunteer) | — |
| `membership_status` | TEXT | CHECK(active\|invited\|suspended) DEFAULT 'invited' | — |
| `joined_at` | TIMESTAMPTZ | NULL | Set when status → active |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(organization_id, user_id) | — |

**RLS:** Members can read their own membership. Org owners/managers can read all org memberships. Never publicly exposed.

---

### 08. `species`
**Purpose:** Controlled vocabulary of supported animal species. Enables all-animal platform scope.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `name` | TEXT | UNIQUE, NOT NULL | e.g. 'Dog', 'Cat', 'Bird', 'Rabbit' |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-safe |
| `is_domestic` | BOOLEAN | DEFAULT true | false = wild/protected species |
| `is_active` | BOOLEAN | DEFAULT true | Active in platform UI |
| `jurisdiction_notes` | TEXT | NULL | Jurisdiction-specific restrictions |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable. Writable only by admins.

---

### 09. `breeds`
**Purpose:** Optional breed list scoped to species.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `species_id` | UUID | FK → species.id ON DELETE CASCADE | — |
| `name` | TEXT | NOT NULL | — |
| `slug` | TEXT | NOT NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(species_id, slug) | — |

**RLS:** Publicly readable. Writable only by admins.

---

### 10. `animals`
**Purpose:** Owner-managed animal profile; central entity of the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `owner_id` | UUID | FK → profiles.id ON DELETE RESTRICT | — |
| `species_id` | UUID | FK → species.id | — |
| `breed_id` | UUID | FK → breeds.id NULL | — |
| `name` | TEXT | NOT NULL | — |
| `sex` | TEXT | CHECK(male\|female\|unknown) NULL | — |
| `date_of_birth` | DATE | NULL | — |
| `approximate_age_months` | INTEGER | NULL | Used when DOB unknown |
| `color_description` | TEXT | NULL | — |
| `size_category` | TEXT | CHECK(tiny\|small\|medium\|large\|extra_large) NULL | — |
| `temperament_tags` | TEXT[] | NULL | — |
| `bio` | TEXT | NULL | — |
| `visibility` | TEXT | CHECK(public\|private) DEFAULT 'public' | — |
| `animal_status` | TEXT | CHECK(active\|lost\|found\|adopted\|deceased) DEFAULT 'active' | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Public animals readable by all. Private animals readable only by owner. Writable only by owner.

---

### 11. `animal_media`
**Purpose:** Animal profile images and media. EXIF/GPS stripped server-side before storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id ON DELETE CASCADE | — |
| `uploaded_by` | UUID | FK → profiles.id | — |
| `storage_path` | TEXT | NOT NULL | Supabase Storage private path |
| `media_type` | TEXT | CHECK(image\|video) DEFAULT 'image' | — |
| `alt_text` | TEXT | NULL | Accessibility description |
| `is_primary` | BOOLEAN | DEFAULT false | — |
| `sort_order` | INTEGER | DEFAULT 0 | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable if animal is public. Writable by animal owner.

---

### 12. `animal_health_records`
**Purpose:** General health and care records; private by default.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id ON DELETE CASCADE | — |
| `recorded_by` | UUID | FK → profiles.id | — |
| `provider_profile_id` | UUID | FK → provider_profiles.id NULL | Attending vet/provider |
| `record_type` | TEXT | CHECK(checkup\|surgery\|diagnosis\|test\|other) | — |
| `title` | TEXT | NOT NULL | — |
| `notes` | TEXT | NULL | — |
| `occurred_at` | TIMESTAMPTZ | NOT NULL | — |
| `document_path` | TEXT | NULL | Private storage path |
| `visibility` | TEXT | CHECK(private\|owner_only) DEFAULT 'private' | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable only by animal owner. Never publicly exposed. Shared only via explicit access grant (future feature).

---

### 13. `vaccinations`
**Purpose:** Vaccination records as a dedicated entity (not embedded in health_records).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id ON DELETE CASCADE | — |
| `recorded_by` | UUID | FK → profiles.id | — |
| `provider_profile_id` | UUID | FK → provider_profiles.id NULL | — |
| `vaccine_name` | TEXT | NOT NULL | — |
| `administered_date` | DATE | NOT NULL | — |
| `next_due_date` | DATE | NULL | — |
| `batch_number` | TEXT | NULL | — |
| `notes` | TEXT | NULL | — |
| `document_path` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Owner-only read and write.

---

### 14. `medications`
**Purpose:** Medication and treatment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id ON DELETE CASCADE | — |
| `recorded_by` | UUID | FK → profiles.id | — |
| `medication_name` | TEXT | NOT NULL | — |
| `dosage_description` | TEXT | NULL | Free text; never AI-generated dosage |
| `frequency` | TEXT | NULL | — |
| `start_date` | DATE | NULL | — |
| `end_date` | DATE | NULL | — |
| `prescribing_provider_id` | UUID | FK → provider_profiles.id NULL | — |
| `notes` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Owner-only read and write. AI must never generate or suggest dosage values.

---

### 15. `care_reminders`
**Purpose:** Scheduled care events and reminders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id ON DELETE CASCADE | — |
| `created_by` | UUID | FK → profiles.id | — |
| `reminder_type` | TEXT | CHECK(vaccination\|medication\|checkup\|grooming\|other) | — |
| `title` | TEXT | NOT NULL | — |
| `due_date` | DATE | NOT NULL | — |
| `is_recurring` | BOOLEAN | DEFAULT false | — |
| `recurrence_interval_days` | INTEGER | NULL | — |
| `is_completed` | BOOLEAN | DEFAULT false | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Owner-only.

---

### 16. `provider_profiles`
**Purpose:** Individual or organization-backed animal care provider. Generic model (ADR-014). Covers vets, groomers, trainers, boarding, clinics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `user_id` | UUID | FK → profiles.id NULL | Individual provider |
| `organization_id` | UUID | FK → organizations.id NULL | Org-backed provider |
| `provider_type` | TEXT | CHECK(veterinarian\|groomer\|trainer\|boarding\|clinic\|other) | — |
| `public_name` | TEXT | NOT NULL | Display name |
| `vet_credentials` | JSONB | NULL | License number, issuing body, expiry — vet-only |
| `verification_status` | TEXT | CHECK(unverified\|pending\|verified\|suspended) DEFAULT 'unverified' | — |
| `public_address` | TEXT | NULL | Street-level only if provider consents |
| `service_area` | GEOGRAPHY(Point,4326) | NULL | Fuzzified |
| `description` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | CHECK(user_id IS NOT NULL OR organization_id IS NOT NULL) | At least one anchor |

**RLS:** Publicly readable (non-credential fields). `vet_credentials` readable only by owner and admins. Writable by owner and org managers.

---

### 17. `provider_services`
**Purpose:** Services offered by a provider (e.g. consultation, grooming, boarding).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `provider_profile_id` | UUID | FK → provider_profiles.id ON DELETE CASCADE | — |
| `service_name` | TEXT | NOT NULL | — |
| `description` | TEXT | NULL | — |
| `price_range_description` | TEXT | NULL | Descriptive, not structured for commerce |
| `is_active` | BOOLEAN | DEFAULT true | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable. Writable by provider owner/org manager.

---

### 18. `provider_reviews`
**Purpose:** User reviews of providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `provider_profile_id` | UUID | FK → provider_profiles.id ON DELETE CASCADE | — |
| `reviewer_id` | UUID | FK → profiles.id | — |
| `rating` | SMALLINT | CHECK(rating BETWEEN 1 AND 5), NOT NULL | — |
| `body` | TEXT | NULL | — |
| `is_visible` | BOOLEAN | DEFAULT true | Moderation flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(provider_profile_id, reviewer_id) | One review per user |

**RLS:** Publicly readable if is_visible. Writable by reviewer (create once).

---

### 19. `appointments`
**Purpose:** Appointment requests between animal owners and providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `provider_profile_id` | UUID | FK → provider_profiles.id | — |
| `animal_id` | UUID | FK → animals.id | — |
| `requested_by` | UUID | FK → profiles.id | — |
| `appointment_status` | TEXT | CHECK(pending\|confirmed\|cancelled\|completed) DEFAULT 'pending' | — |
| `requested_at` | TIMESTAMPTZ | NOT NULL | — |
| `notes` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by requester and provider. Not publicly visible.

---

### 20. `posts`
**Purpose:** Community feed posts. Supports text, media, and optional group/org scoping.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `author_id` | UUID | FK → profiles.id | — |
| `organization_id` | UUID | FK → organizations.id NULL | Org-authored post |
| `body` | TEXT | NULL | — |
| `post_type` | TEXT | CHECK(text\|media\|link\|care_tip) DEFAULT 'text' | — |
| `visibility` | TEXT | CHECK(public\|followers\|group_only) DEFAULT 'public' | — |
| `is_published` | BOOLEAN | DEFAULT true | — |
| `published_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Public posts readable by all. Followers-only posts require follow relationship. Group posts require group membership (via group_posts FK).

---

### 21. `post_media`
**Purpose:** Media attachments for community posts. EXIF stripped before storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `post_id` | UUID | FK → posts.id ON DELETE CASCADE | — |
| `storage_path` | TEXT | NOT NULL | — |
| `media_type` | TEXT | CHECK(image\|video) DEFAULT 'image' | — |
| `alt_text` | TEXT | NULL | — |
| `sort_order` | INTEGER | DEFAULT 0 | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Inherits from posts visibility.

---

### 22. `comments`
**Purpose:** Threaded comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `post_id` | UUID | FK → posts.id ON DELETE CASCADE | — |
| `author_id` | UUID | FK → profiles.id | — |
| `parent_comment_id` | UUID | FK → comments.id NULL | For threading |
| `body` | TEXT | NOT NULL | — |
| `is_visible` | BOOLEAN | DEFAULT true | Moderation flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable if post is accessible. Writable by author (once). Moderation can set is_visible=false.

---

### 23. `reactions`
**Purpose:** Reactions/likes on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `post_id` | UUID | FK → posts.id ON DELETE CASCADE | — |
| `user_id` | UUID | FK → profiles.id | — |
| `reaction_type` | TEXT | CHECK(like\|love\|support\|celebrate) DEFAULT 'like' | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(post_id, user_id) | One reaction per user per post |

**RLS:** Publicly readable. Writable by authenticated users on accessible posts.

---

### 24. `hashtags`
**Purpose:** Canonical hashtag index.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `tag` | TEXT | UNIQUE, NOT NULL | Lowercase normalized |
| `post_count` | INTEGER | DEFAULT 0 | Denormalized counter; not authoritative |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable. Writable via post creation trigger only.

---

### 25. `post_hashtags`
**Purpose:** Many-to-many posts ↔ hashtags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK part, FK → posts.id ON DELETE CASCADE | — |
| `hashtag_id` | UUID | PK part, FK → hashtags.id ON DELETE CASCADE | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable if post is accessible.

---

### 26. `follows`
**Purpose:** User follow relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `follower_id` | UUID | PK part, FK → profiles.id ON DELETE CASCADE | — |
| `followed_id` | UUID | PK part, FK → profiles.id ON DELETE CASCADE | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | CHECK(follower_id <> followed_id) | No self-follow |

**RLS:** Publicly readable follower counts. Full list readable by account owner.

---

### 27. `groups`
**Purpose:** Community groups (ADR-017). Can be public, private, or organization-linked.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `name` | TEXT | NOT NULL | — |
| `slug` | TEXT | UNIQUE, NOT NULL | — |
| `description` | TEXT | NULL | — |
| `group_type` | TEXT | CHECK(public\|private\|organization) DEFAULT 'public' | — |
| `organization_id` | UUID | FK → organizations.id NULL | Org-linked group |
| `created_by` | UUID | FK → profiles.id | — |
| `member_count` | INTEGER | DEFAULT 0 | Denormalized |
| `is_active` | BOOLEAN | DEFAULT true | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Public groups readable by all. Private groups: metadata readable, posts require membership.

---

### 28. `group_members`
**Purpose:** Group membership with roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `group_id` | UUID | FK → groups.id ON DELETE CASCADE | — |
| `user_id` | UUID | FK → profiles.id ON DELETE CASCADE | — |
| `group_role` | TEXT | CHECK(owner\|admin\|member) DEFAULT 'member' | — |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | UNIQUE(group_id, user_id) | — |

**RLS:** Readable by group members. Writable by group admins for role changes.

---

### 29. `group_posts`
**Purpose:** Posts scoped to a group. Post content lives in `posts`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `group_id` | UUID | PK part, FK → groups.id ON DELETE CASCADE | — |
| `post_id` | UUID | PK part, FK → posts.id ON DELETE CASCADE | — |
| `added_by` | UUID | FK → profiles.id | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable only by group members. `posts.visibility` must be 'group_only' for group posts.

---

### 30. `lost_found_posts`
**Purpose:** Lost or found animal reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `reporter_id` | UUID | FK → profiles.id | — |
| `animal_id` | UUID | FK → animals.id NULL | Known animal (lost); NULL for found strays |
| `report_type` | TEXT | CHECK(lost\|found) | — |
| `species_id` | UUID | FK → species.id | — |
| `description` | TEXT | NOT NULL | — |
| `last_seen_area_label` | TEXT | NULL | Coarse label; no exact coordinates |
| `last_seen_location` | GEOGRAPHY(Point,4326) | NULL | Fuzzified; ±500m minimum |
| `incident_date` | DATE | NOT NULL | — |
| `status` | TEXT | CHECK(active\|resolved\|expired) DEFAULT 'active' | — |
| `resolved_by` | UUID | FK → profiles.id NULL | — |
| `resolved_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable (coordinates fuzzified). Writable by reporter. `resolved_by` requires moderator or reporter authority — open decision D-13.

---

### 31. `lost_found_sightings`
**Purpose:** Community sighting reports linked to a lost/found post.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `lost_found_post_id` | UUID | FK → lost_found_posts.id ON DELETE CASCADE | — |
| `reported_by` | UUID | FK → profiles.id | — |
| `sighting_area_label` | TEXT | NULL | Coarse label |
| `sighting_location` | GEOGRAPHY(Point,4326) | NULL | Fuzzified |
| `sighting_date` | DATE | NOT NULL | — |
| `notes` | TEXT | NULL | — |
| `media_paths` | TEXT[] | NULL | Storage paths; EXIF stripped |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by authenticated users. Writable by authenticated users.

---

### 32. `lost_found_matches`
**Purpose:** Confirmed or candidate matches between lost and found reports, including AI-assisted candidates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `lost_post_id` | UUID | FK → lost_found_posts.id | — |
| `found_post_id` | UUID | FK → lost_found_posts.id | — |
| `ai_match_candidate_id` | UUID | FK → ai_match_candidates.id NULL | Linked AI candidate if AI-assisted |
| `match_status` | TEXT | CHECK(ai_suggested\|user_reported\|confirmed\|rejected) DEFAULT 'ai_suggested' | — |
| `confirmed_by` | UUID | FK → profiles.id NULL | Human who confirmed |
| `confirmed_at` | TIMESTAMPTZ | NULL | — |
| `confidence_score` | NUMERIC(4,3) | NULL | From AI candidate; advisory only |
| `notes` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by owners of either linked post. Confirmation requires human action — never auto-confirmed.

---

### 33. `adoption_listings`
**Purpose:** Animals listed for adoption. Jurisdiction safety enforced at application layer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `animal_id` | UUID | FK → animals.id | — |
| `listed_by` | UUID | FK → profiles.id | — |
| `organization_id` | UUID | FK → organizations.id NULL | Org listing |
| `listing_status` | TEXT | CHECK(draft\|active\|paused\|closed\|adopted) DEFAULT 'draft' | — |
| `description` | TEXT | NULL | — |
| `adoption_requirements` | TEXT | NULL | — |
| `fee_description` | TEXT | NULL | Descriptive, not payment processing |
| `listed_at` | TIMESTAMPTZ | NULL | When status → active |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Active listings publicly readable. Draft/closed only by owner.

---

### 34. `adoption_applications`
**Purpose:** Adoption applications from prospective adopters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `listing_id` | UUID | FK → adoption_listings.id | — |
| `applicant_id` | UUID | FK → profiles.id | — |
| `application_status` | TEXT | CHECK(submitted\|under_review\|approved\|rejected\|withdrawn) DEFAULT 'submitted' | — |
| `answers` | JSONB | NULL | Questionnaire responses |
| `submitted_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by applicant and listing owner. Contents private (JSONB answers). Re-application policy: open decision D-11.

---

### 35. `adoption_status_history`
**Purpose:** Immutable audit trail of adoption application status changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `application_id` | UUID | FK → adoption_applications.id ON DELETE CASCADE | — |
| `from_status` | TEXT | NULL | — |
| `to_status` | TEXT | NOT NULL | — |
| `changed_by` | UUID | FK → profiles.id | — |
| `notes` | TEXT | NULL | — |
| `changed_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by applicant and listing owner. Immutable (no UPDATE or DELETE).

---

### 36. `rescue_cases`
**Purpose:** Animal rescue case coordination.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `reported_by` | UUID | FK → profiles.id | — |
| `organization_id` | UUID | FK → organizations.id NULL | Handling org |
| `species_id` | UUID | FK → species.id | — |
| `description` | TEXT | NOT NULL | — |
| `location_area_label` | TEXT | NULL | Coarse label |
| `location` | GEOGRAPHY(Point,4326) | NULL | Fuzzified |
| `case_status` | TEXT | CHECK(open\|assigned\|in_progress\|resolved\|closed) DEFAULT 'open' | — |
| `urgency` | TEXT | CHECK(low\|medium\|high\|critical) DEFAULT 'medium' | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Publicly readable (non-exact location). Writable by reporter and assigned org.

---

### 37. `rescue_assignments`
**Purpose:** Rescue case assignments to volunteers or org members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `rescue_case_id` | UUID | FK → rescue_cases.id ON DELETE CASCADE | — |
| `assigned_to` | UUID | FK → profiles.id | — |
| `assigned_by` | UUID | FK → profiles.id | — |
| `assignment_status` | TEXT | CHECK(active\|completed\|declined\|reassigned) DEFAULT 'active' | — |
| `notes` | TEXT | NULL | — |
| `assigned_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by assignee and org managers. Not publicly exposed.

---

### 38. `rescue_status_events`
**Purpose:** Immutable audit trail of rescue case status transitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `rescue_case_id` | UUID | FK → rescue_cases.id ON DELETE CASCADE | — |
| `from_status` | TEXT | NULL | — |
| `to_status` | TEXT | NOT NULL | — |
| `changed_by` | UUID | FK → profiles.id | — |
| `notes` | TEXT | NULL | — |
| `changed_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by involved parties and org members. Immutable.

---

### 39. `conversations`
**Purpose:** Messaging thread container. Supports 1:1 and group messaging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `conversation_type` | TEXT | CHECK(direct\|group) DEFAULT 'direct' | — |
| `created_by` | UUID | FK → profiles.id | — |
| `title` | TEXT | NULL | Group conversations only |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable only by conversation participants. Never publicly accessible.

---

### 40. `messages`
**Purpose:** Individual messages within conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `conversation_id` | UUID | FK → conversations.id ON DELETE CASCADE | — |
| `sender_id` | UUID | FK → profiles.id | — |
| `body` | TEXT | NULL | — |
| `sent_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `is_deleted` | BOOLEAN | DEFAULT false | Soft delete; body must be cleared |

**RLS:** Readable only by conversation participants. `body` must be cleared on soft delete.

---

### 41. `message_attachments`
**Purpose:** File attachments within messages. EXIF stripped.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `message_id` | UUID | FK → messages.id ON DELETE CASCADE | — |
| `storage_path` | TEXT | NOT NULL | Private bucket |
| `media_type` | TEXT | CHECK(image\|document) | — |
| `file_size_bytes` | INTEGER | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Inherits from messages (participants only).

---

### 42. `notifications`
**Purpose:** User notification queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `recipient_id` | UUID | FK → profiles.id ON DELETE CASCADE | — |
| `notification_type` | TEXT | NOT NULL | e.g. 'adoption.application_received' |
| `payload` | JSONB | NULL | Notification data |
| `is_read` | BOOLEAN | DEFAULT false | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable and writable only by recipient.

---

### 43. `content_reports`
**Purpose:** User reports of posts, comments, profiles, listings, rescue cases, and lost/found posts. Uses nullable FK columns per entity type (ADR-023 — D-6 resolved).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `reporter_id` | UUID | FK → profiles.id NOT NULL | — |
| `reason` | TEXT | CHECK(spam\|harassment\|misinformation\|animal_cruelty\|illegal_trade\|other) NOT NULL | — |
| `details` | TEXT | NULL | — |
| `post_id` | UUID | FK → posts.id NULL | Set if reporting a post |
| `comment_id` | UUID | FK → comments.id NULL | Set if reporting a comment |
| `profile_id` | UUID | FK → profiles.id NULL | Set if reporting a profile |
| `listing_id` | UUID | FK → adoption_listings.id NULL | Set if reporting a listing |
| `rescue_case_id` | UUID | FK → rescue_cases.id NULL | Set if reporting a rescue case |
| `lost_found_post_id` | UUID | FK → lost_found_posts.id NULL | Set if reporting a lost/found post |
| `report_status` | TEXT | CHECK(pending\|under_review\|resolved\|dismissed) DEFAULT 'pending' | — |
| `reviewed_by` | UUID | FK → profiles.id NULL | — |
| `reviewed_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| — | — | CHECK(num_nonnulls(post_id,comment_id,profile_id,listing_id,rescue_case_id,lost_found_post_id) = 1) | Exactly one subject FK must be set |

**RLS:** Writable by authenticated users. Readable by reporter (own reports) and moderators only.

---
### AI-01. `ai_jobs`
**Purpose:** Tracks AI operation lifecycle — requests, model, tokens, status (ADR-015).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `requested_by` | UUID | FK → profiles.id | — |
| `job_type` | TEXT | CHECK(lost_found_match\|care_tip\|behavior_analysis) | — |
| `provider` | TEXT | NOT NULL | AI provider name (abstracted) |
| `model` | TEXT | NULL | Model identifier |
| `status` | TEXT | CHECK(pending\|running\|completed\|failed) DEFAULT 'pending' | — |
| `input_summary` | TEXT | NULL | Non-sensitive summary only; never raw private data |
| `tokens_used` | INTEGER | NULL | — |
| `error_message` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `completed_at` | TIMESTAMPTZ | NULL | — |

**RLS:** Readable only by requesting user and admins. Never exposed publicly.

---

### AI-02. `ai_match_candidates`
**Purpose:** AI match candidates output queue linked to ai_jobs (ADR-015). Advisory only — human verification required.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `ai_job_id` | UUID | FK → ai_jobs.id ON DELETE CASCADE | — |
| `lost_post_id` | UUID | FK → lost_found_posts.id | — |
| `candidate_post_id` | UUID | FK → lost_found_posts.id | — |
| `confidence_score` | NUMERIC(4,3) | CHECK(confidence_score BETWEEN 0 AND 1) | Advisory; never auto-confirm |
| `reasoning_summary` | TEXT | NULL | Human-readable explanation |
| `candidate_status` | TEXT | CHECK(pending_review\|accepted\|rejected) DEFAULT 'pending_review' | Human sets |
| `reviewed_by` | UUID | FK → profiles.id NULL | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable by owners of linked posts and admins. Never publicly exposed.

---

### SYS-01. `audit_logs`
**Purpose:** Immutable audit trail for moderation decisions, admin actions, and security events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `actor_id` | UUID | FK → profiles.id NULL | NULL for system actions |
| `action` | TEXT | NOT NULL | e.g. 'user.suspended', 'listing.closed' |
| `subject_type` | TEXT | NULL | — |
| `subject_id` | UUID | NULL | — |
| `payload` | JSONB | NULL | Action metadata; never raw private content |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**RLS:** Readable only by admins. Immutable (no UPDATE or DELETE). Never log passwords, tokens, or message bodies.

---

## Relationship summary

```
auth.users ─── profiles ─── user_role_assignments ─── roles ─── role_permissions ─── permissions
                   │
                   ├── animals ─── animal_media
                   │           ├── animal_health_records
                   │           ├── vaccinations
                   │           ├── medications
                   │           └── care_reminders
                   │
                   ├── organizations ─── organization_members
                   │                 └── provider_profiles
                   │
                   ├── posts ─── post_media
                   │        ├── comments
                   │        ├── reactions
                   │        ├── post_hashtags ─── hashtags
                   │        └── group_posts ─── groups ─── group_members
                   │
                   ├── lost_found_posts ─── lost_found_sightings
                   │                   └── lost_found_matches ─── ai_match_candidates ─── ai_jobs
                   │
                   ├── adoption_listings ─── adoption_applications ─── adoption_status_history
                   │
                   ├── rescue_cases ─── rescue_assignments
                   │             └── rescue_status_events
                   │
                   ├── conversations ─── messages ─── message_attachments
                   │
                   ├── notifications
                   ├── content_reports
                   └── audit_logs
```

---

## Open schema decisions requiring owner resolution

| Decision | Table(s) Affected | Blocking |
|----------|-------------------|---------|
| ~~D-6: Polymorphic moderation FK~~ | `content_reports` | **RESOLVED — ADR-023: nullable FK columns (Option B)** |
| D-9: MVP species categories | `species` (seed data) | Seed migration blocked |
| D-13: Reunion confirmation authority | `lost_found_posts.resolved_by` | RLS policy blocked |
| D-11: Re-application policy | `adoption_applications` | Business logic blocked |

---

## Reconciliation notes

| Item | HTML Source | ZIP Source | Resolution |
|------|-------------|------------|------------|
| Table naming | vet_profiles, vet_clinics, pet_media | provider_profiles, pet_media, pet_health_records | animal_media, animal_health_records (animal-inclusive); ADR-013, ADR-014 |
| RBAC | roles + permissions + role_permissions | user_roles (single table) | 3-table normalized; ADR-016 |
| Groups | In scope (3 tables) | Omitted | In scope; ADR-017 |
| AI tables | ai_interactions (1 table) | ai_jobs + ai_match_candidates (2 tables) | 2-table model; ADR-015 |
| Species taxonomy | Implicit (dogs/cats assumed) | Implicit | Explicit species + breeds tables added |
| Polymorphic reports | content_reports (HTML) | content_reports (ZIP) | Retained; nullable FK strategy (Option B) — ADR-023 |
