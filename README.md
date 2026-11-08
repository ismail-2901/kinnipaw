# KINNIPAW

**Working tagline:** One Platform. Every Animal. One Connected Ecosystem.

KINNIPAW is an animal-inclusive community, responsible care, lawful adoption, lost-and-found reunion, and rescue coordination platform focused on Bangladesh. The target platforms are responsive web (Next.js 16 App Router) and native mobile (Expo SDK 58 + React Native).

> **Brand status: provisional.** KINNIPAW is the working name. A preliminary exact-name search did not establish a notable identical animal-platform brand, but that is not legal or domain clearance. Verify trademarks, company names, domain availability, social handles, GitHub, Google Play, and Apple App Store before public launch. Do not claim global uniqueness or third-party certification.

---

## Prerequisites

- **Node.js**: `24.21.0` LTS (or `>=24.21.0`)
- **pnpm**: `12.18.0` (`corepack enable` or `pnpm self-update latest-12`)
- **Docker**: Required for local Supabase PostgreSQL development environment
- **Supabase CLI**: Required for local database migrations and seed execution (`pnpm dlx supabase` or `brew install supabase`)

---

## Architecture & Monorepo Structure

```
kinnipaw/
├── apps/
│   ├── web/               # Next.js 16 (App Router + Turbopack + Tailwind v4 + Supabase SSR proxy.ts)
│   └── mobile/            # Expo SDK 58 + Expo Router v4 (Tabs navigation)
├── packages/
│   ├── api-client/        # Strongly typed shared HTTP client
│   ├── config/            # Shared environment schemas (Zod), emergency contacts & constants
│   ├── contracts/         # Canonical API response envelope ({ data, meta, error }) & schemas
│   ├── database-types/    # Generated Supabase database TypeScript definitions (46 tables)
│   ├── design-tokens/     # Forest Green (#245B45) primary, Sage Green (#66856C)
│   ├── domain/            # Platform-agnostic domain models, RBAC & species rules (Act No. 86 of 2026)
│   ├── eslint-config/     # Shared ESLint configs (base, next, react-native)
│   ├── tsconfig/          # Shared TypeScript base configs
│   └── utils/             # Sanitization, slugification, coordinate fuzzing, EXIF stripping
├── supabase/              # Local Supabase configurations, 7 SQL migrations, and synthetic seed data
├── docs/                  # Authoritative documentation and ADR registers (ADR-001 through ADR-026)
└── .github/workflows/     # GitHub Actions CI pipeline
```

---

## Quick Start (Local Execution Workflow)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment variables
Copy example environment files:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Start local Supabase & load synthetic demo data (Docker required)
```bash
pnpm db:start
pnpm db:reset   # Runs migrations 01-07 and seeds comprehensive demo dataset
```

### 4. Run development servers
```bash
# Run web application only (http://localhost:3000)
pnpm dev:web

# Run mobile application (Expo Metro bundler)
pnpm dev:mobile

# Or run all applications in parallel
pnpm dev
```

### 5. Automated quality checks
```bash
pnpm test        # Runs 38 unit & AI evaluation tests across packages and apps
pnpm lint        # Runs ESLint (0 errors, 0 warnings)
pnpm typecheck   # Runs TypeScript checks across 15 tasks
pnpm build       # Full production Turbopack build (compiles 46 routes)
```

---

## Local Demonstration Accounts (Synthetic Seed Data)

| Role | Email | Purpose |
|---|---|---|
| **Admin** | `admin@kinnipaw.local` | Operations dashboard, moderation review queue, audit logs (`/admin`, `/admin/reports`) |
| **Moderator** | `moderator@kinnipaw.local` | Content report review queue (`/admin/reports`) |
| **Rescuer / Guardian** | `rescuer.rahat@kinnipaw.local` | Animal care records, foster listings, emergency rescue coordination (`/rescue`, `/animals`) |
| **Adopter** | `adopter.nusrat@kinnipaw.local` | Lawful adoption browsing & questionnaire application (`/adoption`, `/adoption/apply/[id]`) |
| **Veterinarian** | `vet.arif@kinnipaw.local` | Verified veterinary clinic profile & care advice (`/providers`) |

---

## Key Invariants & Safeguards

1. **Wildlife Protection (Act No. 86 of 2026):**
   - Strictly enforces Bangladesh's Wildlife (Conservation and Security) Act, 2026.
   - Restricts adoption and transfer of native wildlife; whitelist-enforced domestic companion animals only.
   - Statutory wildlife incidents are routed to verified Bangladesh Forest Department WCCU hotlines (`01999000095` / `01711159035`, National Helpline: `333-4`).
2. **Location Privacy by Design:**
   - Public posts never disclose exact street addresses or raw GPS coordinates; coarse area labels and fuzzified coordinates (~2 decimal places, ~1km resolution) only.
3. **EXIF Metadata Stripping:**
   - User-uploaded photos are stripped of APP1 EXIF headers on the server prior to storage or CDN delivery.
4. **Non-Diagnostic AI Boundaries:**
   - AI companion provides wellness education only and automatically intercepts medical emergency keywords with urgent veterinary warnings.
