# KINNIPAW — Database Schema & Seed Consistency Repair Report

**Status:** Completed & Locally Verified  
**Date:** 2026-11-09  
**Branch:** `main` (commit `953f50b`)  
**Target Database:** Local Supabase Stack (`127.0.0.1:54322`)

---

## 1. Root Cause of Every Mismatch

1. **`profiles` Column Mismatches (`district`, `is_verified`):**
   - *Root Cause:* In `docs/database/SCHEMA_SPEC.md` (Table 01), user location was deliberately modeled as `city` (e.g., 'Dhaka') and `area_label` (e.g., 'Dhanmondi, Dhaka'), rather than redundant raw administrative columns. User verification is not a boolean on `profiles`; under normalized RBAC (ADR-016) and the generic provider model (ADR-014), verification belongs to `provider_profiles.verification_status` and `user_role_assignments`. The seed previously contained hallucinated `district` and `is_verified` columns that did not exist on `public.profiles`.
2. **`profiles` Foreign Key to `auth.users`:**
   - *Root Cause:* `public.profiles.id` has a strict foreign key `REFERENCES auth.users(id) ON DELETE CASCADE`. Inserting synthetic profiles directly without corresponding rows in `auth.users` triggers SQLSTATE 23503 foreign key violation. Furthermore, migration 1 created an `AFTER INSERT ON auth.users` trigger (`handle_new_user()`) that generates base profiles. The seed lacked `auth.users` records.
3. **`user_role_assignments` Table Naming:**
   - *Root Cause:* Migration 1 and Table 05 in `SCHEMA_SPEC.md` define `public.user_role_assignments` (UUID PK, `user_id`, `role_id`, `granted_by`, `UNIQUE(user_id, role_id)`). The seed previously targeted `public.user_roles`, which did not exist as a table.
4. **`animals` Column Name (`status` vs `animal_status`):**
   - *Root Cause:* Table 10 in `SCHEMA_SPEC.md` and migration 1 define `animal_status` with constraint `CHECK (animal_status IN ('active', 'lost', 'found', 'adopted', 'deceased'))`. The seed attempted to populate `status`, causing a column not found error.
5. **`vaccinations` Schema Mismatches:**
   - *Root Cause:* Table 13 in `SCHEMA_SPEC.md` requires `recorded_by UUID NOT NULL REFERENCES public.profiles(id)` and uses `administered_date` and `next_due_date` (DATE) and `provider_name` (TEXT). The seed omitted `recorded_by`, and used outdated names `administered_at`, `expires_at`, `veterinarian_name`, and `clinic_name`.
6. **`care_reminders` Schema Mismatches:**
   - *Root Cause:* Table 15 requires `created_by UUID NOT NULL REFERENCES public.profiles(id)` and boolean `is_completed`. The seed omitted `created_by` and used `status` ('pending').
7. **`posts` Check Constraint Violation:**
   - *Root Cause:* Table 20 enforces `CHECK (post_type IN ('text', 'media', 'link', 'care_tip'))`. The seed inserted invalid values `'story'` and `'general'`.
8. **`rescue_cases` Column Name (`reporter_id` vs `reported_by`):**
   - *Root Cause:* Table 36 and migration 4 define `reported_by UUID NOT NULL REFERENCES public.profiles(id)`. The seed referenced non-existent `reporter_id`.
9. **`provider_profiles` Schema Mismatches:**
   - *Root Cause:* Table 16 (ADR-014 Generic Provider Model) defines `user_id` (anchor), `provider_type`, `public_name`, `public_address`, `description`, `verification_status`. `rating_average` and `rating_count` are not stored columns; they are computed dynamically from `provider_reviews(rating)`. The seed had outdated fields `profile_id`, `business_name`, `district`, `thana`, `rating_average`, `rating_count`, `is_verified`, and invalid type `'veterinary_clinic'`.
10. **`audit_logs` Schema Mismatches:**
    - *Root Cause:* SYS-01 and migration 6 define `actor_id`, `action`, `subject_type`, `subject_id`, `payload` (JSONB). The seed used `target_type`, `target_id`, `details`.
11. **`species` Aliases for Client / API Query Compatibility:**
    - *Root Cause:* Multiple application queries (`rescue/route.ts`, `apps/mobile/app/(tabs)/rescue/index.tsx`, `profile/index.tsx`) selected `species(common_name)`. The database table had `name`. Adding a generated column `common_name TEXT GENERATED ALWAYS AS (name) STORED` preserves canonical `name` while satisfying API and mobile contracts.
12. **`lost_found_posts` Foreign Key Ambiguity in PostgREST:**
    - *Root Cause:* `lost_found_posts` has two foreign keys to `profiles` (`reporter_id` and `resolved_by`). PostgREST required explicit relationship hint `profiles!lost_found_posts_reporter_id_fkey`.
13. **Migration Inventory Count in Release Report:**
    - *Root Cause:* The release report mistakenly claimed 10 migrations (`00001`–`00010`) by conflating Milestone IDs (M1–M10) with migration files. The repository originally had 7 migrations (`00001`–`00007`) covering M2–M8. With the new forward migration, there are now 8 versioned migrations.

---

## 2. Files Changed and Why

1. **`supabase/seed.sql`:**
   - Seeded `auth.users` with 5 synthetic accounts (`admin@kinnipaw.local`, `moderator@kinnipaw.local`, `rescuer@kinnipaw.local`, `adopter@kinnipaw.local`, `vet@kinnipaw.local`) with bcrypt-encrypted passwords (`Password123!`), satisfying foreign key constraints and enabling local login.
   - Corrected `public.profiles` to strictly match Table 01 schema (removed `district` and `is_verified`).
   - Corrected table name `public.user_role_assignments` from `public.user_roles`.
   - Fixed `public.animals` column `animal_status`.
   - Fixed `public.vaccinations` columns (`recorded_by`, `administered_date`, `next_due_date`, `provider_name`).
   - Fixed `public.care_reminders` columns (`created_by`, `is_completed`).
   - Fixed `public.posts` constraint (`post_type` values set to `'text'` and `'care_tip'`).
   - Fixed `public.lost_found_posts` date format.
   - Fixed `public.rescue_cases` column `reported_by`.
   - Corrected `public.provider_profiles` to ADR-014 schema (`user_id`, `provider_type`, `public_name`, `public_address`, `description`, `verification_status`).
   - Added synthetic records for `public.provider_services` and `public.provider_reviews`.
   - Fixed `public.audit_logs` columns (`subject_type`, `subject_id`, `payload`).
2. **`supabase/migrations/20261108000008_species_common_name.sql` (NEW):**
   - Added forward migration adding `common_name` generated column and `scientific_name` to `public.species`, and `media_url` generated column to `public.animal_media`.
3. **`packages/database-types/src/index.ts`:**
   - Synchronized TypeScript database interface with `species.common_name`.
4. **`supabase/config.toml`:**
   - Preserved `supabase/config.toml.backup`. Set studio health check configuration to prevent container cold-start timeout on Windows Docker.
5. **`apps/web/src/app/api/v1/lost-found/[id]/route.ts` & `apps/web/src/app/api/v1/lost-found/route.ts`:**
   - Added PostgREST relation disambiguation `profiles!lost_found_posts_reporter_id_fkey`.

---

## 3. Final Migration Inventory

The repository contains exactly **8 idempotent SQL migrations**:

1. `20261108000001_m2_identity_and_animals.sql` (Profiles, RBAC, Taxonomy, Animals, Health Records)
2. `20261108000002_m3_community_and_groups.sql` (Feed, Comments, Reactions, Groups, Reports)
3. `20261108000003_m4_lawful_adoption.sql` (Adoption Listings, Applications, Status History)
4. `20261108000004_m5_lost_found_and_rescue.sql` (Lost & Found, Sightings, Rescue Cases, Assignments)
5. `20261108000005_m6_messaging_providers_and_notifications.sql` (Orgs, Providers, Reviews, Conversations, Notifications)
6. `20261108000006_m7_admin_and_moderation.sql` (Audit Logs, Moderation RBAC)
7. `20261108000007_m8_ai_capabilities.sql` (AI Jobs, Match Candidates)
8. `20261108000008_species_common_name.sql` (Species common_name & Media URL compatibility aliases)

---

## 4. Seed-to-Schema Consistency Results

Live database inspection via PostgreSQL container (`docker exec -i supabase_db_kinnipaw-local psql -U postgres -d postgres`):

| Table | Seed Row Count | Foreign Keys Verified | Constraints Verified |
| :--- | :--- | :--- | :--- |
| `auth.users` | 5 | Self-contained (PK UUID) | Encrypted passwords valid |
| `public.profiles` | 5 | `REFERENCES auth.users(id)` | Valid account_status, locale |
| `public.roles` | 4 | Primary key UUID | Unique names |
| `public.permissions` | 4 | Primary key UUID | Unique names |
| `public.role_permissions` | 8 | `roles(id)`, `permissions(id)` | Composite PK |
| `public.user_role_assignments` | 5 | `profiles(id)`, `roles(id)` | Unique(user_id, role_id) |
| `public.species` | 7 | Primary key UUID | Unique slug, generated common_name |
| `public.breeds` | 10 | `species(id)` | Unique(species_id, slug) |
| `public.animals` | 3 | `profiles(id)`, `species(id)` | Valid animal_status, visibility |
| `public.vaccinations` | 2 | `animals(id)`, `profiles(id)` | Valid date constraints |
| `public.care_reminders` | 2 | `animals(id)`, `profiles(id)` | Valid reminder_type CHECK |
| `public.posts` | 2 | `profiles(id)` | Valid post_type CHECK |
| `public.comments` | 1 | `posts(id)`, `profiles(id)` | Valid foreign keys |
| `public.adoption_listings` | 1 | `animals(id)`, `profiles(id)` | Valid listing_status CHECK |
| `public.lost_found_posts` | 2 | `profiles(id)`, `species(id)` | Valid report_type & date |
| `public.rescue_cases` | 1 | `profiles(id)`, `species(id)` | Valid urgency & case_status |
| `public.provider_profiles` | 1 | `profiles(id)` | Valid provider_type CHECK |
| `public.provider_services` | 2 | `provider_profiles(id)` | Valid foreign keys |
| `public.provider_reviews` | 1 | `provider_profiles(id)`, `profiles(id)`| Valid rating 1-5 CHECK |
| `public.audit_logs` | 1 | `profiles(id)` | Valid JSONB payload |

Total: **20 tables seeded and verified with 100% relational integrity.**

---

## 5. Local Migrations & Seed Execution Evidence

Command executed: `npx supabase db reset`  
Result: **Exit code 0**  
Log output:
```text
Target: local stack (127.0.0.1:54322)
Resetting local database...
Recreating database...
Initialising schema...
Seeding globals from roles.sql...
Skipping migration .gitkeep...
Applying migration 20261108000001_m2_identity_and_animals.sql...
Applying migration 20261108000002_m3_community_and_groups.sql...
Applying migration 20261108000003_m4_lawful_adoption.sql...
Applying migration 20261108000004_m5_lost_found_and_rescue.sql...
Applying migration 20261108000005_m6_messaging_providers_and_notifications.sql...
Applying migration 20261108000006_m7_admin_and_moderation.sql...
Applying migration 20261108000007_m8_ai_capabilities.sql...
Applying migration 20261108000008_species_common_name.sql...
Seeding data from supabase/seed.sql...
Restarting containers...
Finished supabase db reset on branch main.
```

---

## 6. Actual Test, Typecheck, and Lint Results

- **Automated Tests (`pnpm test`):**
  - `@kinnipaw/utils`: 5/5 passed
  - `@kinnipaw/contracts`: 7/7 passed
  - `@kinnipaw/domain`: 11/11 passed
  - `@kinnipaw/web`: 15/15 passed
  - **Total: 38/38 passing (100%)**
- **Typecheck (`pnpm typecheck`):**
  - 15/15 packages clean via `tsc --noEmit` (0 errors)
- **Linting (`pnpm lint`):**
  - 9/9 packages clean via ESLint (0 errors, 0 warnings)
- **Production Build (`pnpm build`):**
  - Compiled 46 static and dynamic Next.js routes with zero errors

---

## 7. Remaining Blockers

**Zero remaining blockers.**  
The database schema, versioned migrations, and local seed data are completely reconciled, verified against live PostgreSQL Docker containers, and synchronized with all TypeScript types, API route handlers, and test suites.
