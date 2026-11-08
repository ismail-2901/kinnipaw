# Repository Structure — KINNIPAW

```text
kinnipaw/
  apps/
    web/
      src/app/                 # public/auth/community/admin routes + api/v1
      src/features/            # feature UI and server-only modules
      src/components/          # web design system (Tailwind + Radix/shadcn)
      src/lib/                 # Supabase SSR, env, utilities
    mobile/
      app/                     # Expo Router routes
      src/features/            # native feature screens
      src/components/          # native React Native components
      src/lib/                 # auth, API client, device capabilities
  packages/
    contracts/                 # Zod request/response schemas & API contracts
    api-client/                # typed HTTP client shared by web/mobile
    database-types/            # generated Supabase database TypeScript definitions
    domain/                    # platform-agnostic business logic, entities & rules
    utils/                     # shared cross-platform utility functions
    config/                    # shared configuration constants & env schemas
    design-tokens/             # cross-platform design tokens (colors, typography, spacing)
    eslint-config/             # shared ESLint configurations
    tsconfig/                  # shared TypeScript tsconfig bases
  supabase/
    migrations/                # versioned SQL migrations
    functions/                 # edge functions (narrowly scoped)
    tests/                     # RLS and database integrity tests
    seed/                      # dev/testing seed data (never for production)
  docs/                        # canonical project specifications & ADRs
  e2e/                         # end-to-end integration test suites (Playwright)
  .github/workflows/           # CI/CD quality gates & automation
  AGENTS.md                    # permanent agent instructions (reconciled)
  README.md
  pnpm-workspace.yaml
  turbo.json
```

## Monorepo Packages Summary (ADR-021)

Per ADR-021, the monorepo package inventory merges the ZIP and HTML Foundation specifications into a cohesive, non-overlapping package set:

1. **`packages/contracts`**: Shared Zod validation schemas for all `/api/v1` endpoints, query parameter parsers, and response shapes.
2. **`packages/api-client`**: Strongly typed HTTP API client consumed by both `apps/web` and `apps/mobile`.
3. **`packages/database-types`**: Generated TypeScript types from the canonical Supabase schema (`docs/database/SCHEMA_SPEC.md`).
4. **`packages/domain`**: Pure, framework-agnostic domain logic, domain models, state machines, business rule validators, and value objects.
5. **`packages/utils`**: Universal utilities for dates, strings, currency formatting (BDT), transliteration, and error handling.
6. **`packages/config`**: Cross-app configuration constants, environment variable schemas, and feature flags.
7. **`packages/design-tokens`**: Canonical design tokens (Forest Green `#245B45` primary, Sage Green `#66856C` supporting, typography scales, spacing).
8. **`packages/eslint-config`**: Shared linting configurations enforcing TypeScript strict mode across monorepo packages and apps.
9. **`packages/tsconfig`**: Shared `tsconfig.json` bases for library packages, Next.js, and Expo.

The admin dashboard lives under the web app's protected `/admin` route initially. A separate admin deployment is not required. Packages remain strictly platform-agnostic with no DOM or React Native dependencies. Share contracts, domain logic, types, and tokens; do not share web DOM components with React Native.
