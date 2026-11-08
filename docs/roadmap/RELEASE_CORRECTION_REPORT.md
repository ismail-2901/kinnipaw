# KINNIPAW — Critical Legal & Emergency Contact Release Correction Report

**Date:** November 8, 2026  
**Status:** ✅ **INTERNAL READINESS VERIFIED**  
**Review Type:** Release Quality & Statutory Alignment Audit

---

## 1. Legal Reference Corrections

- **Superseded Law:** Bangladesh Wildlife (Preservation and Security) Act, 2012.
- **Enacted Governing Law:** **Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026)**.
  - Deemed to have come into force on **January 7, 2026**.
  - All statutory citations across code, API validation, seed data, terms of service, and documentation updated to Act No. 86 of 2026.
- **Species Restrictions & Safe Default Rule:**
  - Whitelist-enforced adoption transfers limited to verified domestic companion animals (`Domestic Dog`, `Domestic Cat`, `Domestic Rabbit`, `Guinea Pig`, `Hamster`, captive `Domestic Bird`, `Domestic Farm Animal`).
  - Prohibited native wildlife lists updated per the 2026 Act schedules.
  - **Safe Default:** All uncertain, exotic, or non-domestic classifications remain strictly restricted pending authoritative statutory verification (`isSpeciesEligibleForAdoption`). Zero legal certification claimed.

---

## 2. Verified Forest Department Emergency Contacts

- **Decommissioned Contact:** Unverified hotline `10603` has been completely removed across all code, tests, and documentation.
- **Verified Statutory Authority:** **Bangladesh Forest Department (BFD) — Wildlife Crime Control Unit (WCCU)**
- **Official Emergency Hotlines:**
  - `01999000095`
  - `01711159035`
  - `01916095643`
- **National Government Helpline:** `333-4`
- **Official Email:** `dir-wccu@bforest.gov.bd`
- **Headquarters:** Bana Bhaban, Agargaon, Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh
- **Official Verification Source:** Official Portal of the Bangladesh Forest Department ([bforest.gov.bd](http://bforest.gov.bd))
- **Last-Verified Date:** November 8, 2026 (Recorded in `packages/config/src/emergency-contacts.ts`)
- **Relationship Disclaimer:** Stored in administrator-maintained configuration (`OFFICIAL_WILDLIFE_EMERGENCY_CONFIG`). KINNIPAW maintains an independent community directory and explicitly disclaims any official agency or partnership status with statutory authorities.

---

## 3. Calibrated Release Claims

- Replaced all unsupported "Certified" claims with internal verification terminology ("Internal Readiness: Verified").
- Differentiated automated local test verification from independent third-party certification.
- Replaced unverified "Bangladesh's first" slogans with descriptive phrasing ("Animal Welfare & Care Ecosystem focused on Bangladesh").

---

## 4. Test Results: Before vs After

| Test Suite | Before Correction | After Correction | Details |
|---|---|---|---|
| `@kinnipaw/utils` | 5 passed | 5 passed | EXIF stripping, input sanitization, coordinate fuzzification |
| `@kinnipaw/contracts` | 7 passed | 7 passed | Canonical envelope `{ data, meta, error }`, Zod schemas |
| `@kinnipaw/domain` | 7 passed | 11 passed (+4 new tests) | Added tests for Wildlife Act 2026 restrictions, uncertain species restriction safe defaults, BFD emergency contact verification, and omission of unverified hotline 10603 |
| **Total Unit Tests** | **19 passed** | **23 passed** | **100% PASS** |
| `pnpm typecheck` | 15/15 PASS | 15/15 PASS | Full monorepo type safety verified |
| `pnpm lint` | 9/9 PASS (0 warnings) | 9/9 PASS (0 warnings) | 100% clean linting |
| `pnpm build` | 8/8 PASS | 8/8 PASS | Next.js 16 Turbopack compiled 46 static/dynamic routes |
| Web E2E (Playwright) | `smoke.spec.ts` | Updated | Asserts verified BFD hotlines `01999000095` & `333-4`, 320px responsive |
| Mobile E2E (Maestro) | `smoke.yaml` | Updated | Asserts verified BFD hotline `01999000095` on emergency rescue tab |

---

## 5. Files Changed

1. `packages/config/src/emergency-contacts.ts` (New administrator-maintained configuration with source URL and verification date)
2. `packages/config/src/index.ts` (Exported emergency contacts configuration)
3. `packages/domain/src/index.ts` (Updated to Act No. 86 of 2026; implemented safe default restriction for uncertain species)
4. `packages/domain/src/__tests__/domain.test.ts` (Added 4 tests for Act 2026, safe default restrictions, and verified BFD contacts)
5. `apps/web/src/app/rescue/page.tsx` (Integrated `OFFICIAL_WILDLIFE_EMERGENCY_CONFIG` and BFD hotline display)
6. `apps/web/src/app/rescue/[id]/page.tsx` (Updated wildlife alert with Act 2026 reference and verified BFD hotlines)
7. `apps/web/src/app/adoption/[id]/page.tsx` (Updated policy notice to Act 2026)
8. `apps/web/src/app/api/v1/adoption/listings/route.ts` (Updated forbidden wildlife error message to Act No. 86 of 2026)
9. `apps/web/src/app/admin/page.tsx` (Updated statutory compliance card to Act 2026)
10. `apps/web/src/app/terms/page.tsx` (Updated legal terms to Act 2026 and verified BFD contacts)
11. `apps/web/src/app/layout.tsx` (Calibrated descriptive metadata)
12. `apps/web/src/app/page.tsx` (Calibrated hero copy)
13. `apps/mobile/app/index.tsx` (Calibrated mobile hero badge)
14. `apps/mobile/app/(tabs)/rescue/index.tsx` (Integrated `OFFICIAL_WILDLIFE_EMERGENCY_CONFIG` and verified BFD banner)
15. `apps/web/e2e/smoke.spec.ts` (Updated test assertion to verified BFD hotline)
16. `.maestro/flows/smoke.yaml` (Updated mobile flow assertion to verified BFD hotline)
17. `supabase/seed.sql` (Updated species jurisdiction notes to Act 2026)
18. `AGENTS.md` (Updated §14 statutory reference to Act 2026)
19. `docs/OPEN_QUESTIONS.md` (Updated OQ-010 notes to Act 2026)
20. `docs/roadmap/TASKS.md` (Updated PB-099 and PB-115 task summaries)
21. `docs/roadmap/RELEASE_NOTES_M10.md` (Replaced unsupported claims; updated release notes)

---

## 6. Remaining Release Blockers

- **Zero Critical Technical Blockers:** All automated gates (`typecheck`, `lint`, `test`, `build`) pass cleanly with 0 errors.
- **External Dependencies (Scheduled Post-Beta):**
  - Independent legal counsel review of the species schedules under Act No. 86 of 2026 prior to production launch.
  - Cloud hosting provisioning (D-8) and Supabase production tier confirmation (D-7).
