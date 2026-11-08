# Development Tooling — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation
> 
> Note: Stub — exact versions to be pinned in package.json at M1.

This document catalogues the required development tools, runtimes, package managers, test runners, and infrastructure CLIs for developing, testing, and operating KINNIPAW across all monorepo workspaces.

---

## 1. Core Runtime and Package Management

| Tool | Recommended Baseline | Purpose | Management Method |
|---|---|---|---|
| **Node.js** | `>= 20.11.0 LTS` (Active LTS) | JavaScript runtime for Next.js, scripts, and build tooling | Managed via `.nvmrc` / `.node-version` |
| **pnpm** | `>= 9.0.0` | Fast, disk-space-efficient package manager with strict workspace isolation | Enabled via Node.js Corepack: `corepack enable pnpm` |
| **Turborepo** | `>= 2.0.0` | High-performance monorepo build system, remote caching, and task pipeline | Root devDependency (`turbo`) |

---

## 2. Monorepo Language and Build Tooling

| Tool | Version Target | Workspace Scope | Notes |
|---|---|---|---|
| **TypeScript** | `~5.4.0` | Root & all packages | Strict mode enabled (`strict: true`, `noImplicitAny: true`); shared `tsconfig.base.json` |
| **Next.js** | `14.2.x` / `15.x` | `apps/web` | React 18/19 App Router, server-rendered components, API route handlers |
| **Expo SDK** | `~51.0.0` | `apps/mobile` | React Native framework, Expo Router, native module management |
| **EAS CLI** | Latest | `apps/mobile` | Expo Application Services CLI for cloud builds and native submissions |

---

## 3. Database and Local Backend Services

| Tool | Version Target | Purpose | Notes |
|---|---|---|---|
| **Docker Engine / Desktop** | `>= 24.0.0` | Local container runtime | Required for running the local Supabase stack |
| **Supabase CLI** | `>= 1.160.0` | Local database, auth, storage, realtime, and migration management | Installed via `pnpm dlx supabase` or Homebrew/Scoop |
| **PostgreSQL** | `15.x` / `16.x` | Primary relational database engine | Bundled with Supabase CLI container image; includes PostGIS |
| **pgTAP** | `>= 1.2.0` | Unit and authorization testing framework for PostgreSQL | Runs inside local Supabase database container |

---

## 4. Code Quality, Linting, and Formatting

| Tool | Purpose | Configuration Location |
|---|---|---|
| **ESLint** | Static code analysis and anti-pattern detection | Flat config `eslint.config.mjs` with `@typescript-eslint` and `react-hooks` |
| **Prettier** | Opinionated automated code formatting | Root `.prettierrc.json` with `prettier-plugin-tailwindcss` |
| **Husky** | Git commit and pre-push hook automation | `.husky/pre-commit` |
| **lint-staged** | Runs linters and formatters only on staged Git files | `.lintstagedrc.json` |

---

## 5. Automated Testing Tooling

| Tool | Purpose | Scope |
|---|---|---|
| **Vitest** | Blazing-fast unit and integration test runner | `packages/*`, `apps/web`, API routes |
| **React Testing Library** | Component testing following DOM best practices | `apps/web/components` |
| **Playwright** | Browser automation for end-to-end web user journeys | `tests/e2e/web` (Chromium, Firefox, WebKit) |
| **Maestro** | Declarative mobile UI testing for iOS and Android | `apps/mobile/.maestro` |

---

## 6. Continuous Integration & Deployment

| Tool | Platform | Purpose |
|---|---|---|
| **GitHub Actions** | GitHub Cloud | Automated CI workflows: lint, typecheck, unit tests, RLS verification, E2E tests |
| **Supabase Management** | Cloud / CLI | Migration deployment to preview, staging, and production environments |
| **Expo EAS** | Expo Cloud | Automated native Android (APK/AAB) and iOS (IPA) release generation |

---

## 7. Developer Environment Setup (Quickstart)

```bash
# 1. Enable pnpm via Corepack
corepack enable
corepack prepare pnpm@latest --activate

# 2. Clone repository and install dependencies
git clone <repo-url> kinnipaw
cd kinnipaw
pnpm install

# 3. Start local Supabase backend (Docker required)
pnpm supabase:start

# 4. Run database migrations and seed data
pnpm db:reset

# 5. Start development servers across web and mobile
pnpm dev
```
