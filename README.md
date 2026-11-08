# KINNIPAW

**Working tagline:** One Platform. Every Animal. One Connected Ecosystem.

KINNIPAW is a Bangladesh-first, animal-inclusive community, responsible care and adoption where lawful, lost-and-found, rescue coordination, and animal-care platform. The target platforms are responsive web, PWA, Android, and iOS.

> **Brand status: provisional.** KINNIPAW is the working name. A preliminary exact-name search did not establish a notable identical animal-platform brand, but that is not legal or domain clearance. Verify trademarks, company names, domain availability, social handles, GitHub, Google Play, and Apple App Store before public launch. Do not claim global uniqueness.

---

## Prerequisites

- **Node.js**: `24.21.0` LTS (or `>=24.21.0`)
- **pnpm**: `12.18.0` (`corepack enable` or `pnpm self-update latest-12`)
- **Docker**: Required for local Supabase development environment
- **Supabase CLI**: Required for local database migrations and testing

---

## Architecture & Monorepo Structure

```
kinnipaw/
├── apps/
│   ├── web/               # Next.js 16 (App Router + Tailwind v4 + Supabase SSR proxy.ts)
│   └── mobile/            # Expo SDK 58 + Expo Router v4
├── packages/
│   ├── api-client/        # Strongly typed shared HTTP client
│   ├── config/            # Shared environment schemas (Zod) and constants
│   ├── contracts/         # Canonical API response envelope ({ data, meta, error })
│   ├── database-types/    # Generated Supabase database TypeScript definitions
│   ├── design-tokens/     # Forest Green (#245B45) primary, Sage Green (#66856C)
│   ├── domain/            # Platform-agnostic domain models and enums
│   ├── eslint-config/     # Shared ESLint configs (base, next, react-native)
│   ├── tsconfig/          # Shared TypeScript base configs
│   └── utils/             # Sanitization, slugification, coordinate fuzzing
├── supabase/              # Local Supabase configurations, migrations, and seeds
├── docs/                  # Authoritative documentation and ADR registers
└── .github/workflows/     # GitHub Actions CI pipeline
```

---

## Quick Start

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

### 3. Start local Supabase (Docker required)
```bash
supabase start
```

### 4. Run development servers
```bash
# Run all apps in parallel
pnpm dev

# Or run individual applications
pnpm --filter @kinnipaw/web dev
pnpm --filter @kinnipaw/mobile start
```

### 5. Quality checks
```bash
pnpm lint
pnpm typecheck
pnpm build
```

---

## Source of Truth Hierarchy

1. `AGENTS.md` — Permanent engineering constraints and operating constitution.
2. `docs/source/` — Preserved requirements archive; do not modify without explicit approval.
3. `docs/` canonical specifications — Approved implementation reference after review.
4. `docs/architecture/DECISIONS.md` — Accepted architecture decision records (ADR-001 through ADR-026).
5. `docs/OPEN_QUESTIONS.md` — Unresolved questions; no silent assumptions.
6. `docs/TRACEABILITY.md` — Requirement-to-document-to-task mapping (PB-001 through PB-120).
