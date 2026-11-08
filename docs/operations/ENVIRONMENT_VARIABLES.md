# Environment Variables Specification — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation
> 
> Note: Stub — full variable inventory to be completed at M1 environment setup.

This document specifies all environment variables utilized across the KINNIPAW monorepo workspaces (`apps/web`, `apps/mobile`, and shared packages). It establishes visibility boundaries, validation rules, and security classifications.

---

## 1. Critical Security Principles

1. **Zero Secret Leakage:** Never expose privileged server credentials (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, AI provider API keys, SMTP passwords) to client-side bundles.
2. **Public Prefix Convention:**
   - Any variable prefixed with `NEXT_PUBLIC_` is inlined into the client JavaScript bundle for web browsers.
   - Any variable prefixed with `EXPO_PUBLIC_` is embedded directly into the mobile application package.
   - Both must be treated as completely public and unencrypted.
3. **Repository Cleanliness:** Never commit real secrets, private tokens, or production `.env` files to Git. Commit only `.env.example` containing descriptive placeholder values.
4. **Runtime Schema Validation:** All environment variables are validated at server startup using typed Zod schemas in `packages/contracts/env` or `@t3-oss/env-nextjs`. Missing required variables crash fast at build/boot time.

---

## 2. Web Application Variables (`apps/web`)

| Variable Name | Scope / Bundle | Required | Example Placeholder | Purpose & Description |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | Yes | `https://kinnipaw.com` | Canonical base URL for web application, SEO, and deep-link generation. |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Yes | `https://xyzprojectref.supabase.co` | Public Supabase project REST and Realtime gateway URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Yes | `eyJh...anon-token...` | Public Supabase anonymous JWT key for client-side Auth and RLS-protected queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only** | Yes | `eyJh...service-role-token...` | Privileged Supabase key bypassing RLS. Restricted strictly to admin scripts and webhooks. |
| `DATABASE_URL` | **Server-Only** | Yes | `postgresql://postgres:password@localhost:54322/postgres` | Direct PostgreSQL connection string for database migrations and connection poolers. |
| `SESSION_SECRET` | **Server-Only** | Yes | `generate-a-secure-random-32-char-string` | Secret key used for signing session cookies in Next.js middleware. |

---

## 3. Mobile Application Variables (`apps/mobile`)

| Variable Name | Scope / Bundle | Required | Example Placeholder | Purpose & Description |
|---|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Public Mobile Bundle | Yes | `https://xyzprojectref.supabase.co` | Public Supabase endpoint for mobile client authentication and data queries. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`| Public Mobile Bundle | Yes | `eyJh...anon-token...` | Public Supabase anonymous key for mobile client queries. |
| `EXPO_PUBLIC_API_URL` | Public Mobile Bundle | Yes | `https://kinnipaw.com/api/v1` | Base URL for custom Next.js API endpoints consumed by mobile app. |
| `EXPO_PUBLIC_PROJECT_ID` | Public Mobile Bundle | No | `your-expo-project-uuid` | EAS project ID for Expo push notifications and telemetry. |

---

## 4. Supabase & Local Database Variables

| Variable Name | Scope | Required | Example Placeholder | Purpose & Description |
|---|---|---|---|---|
| `POSTGRES_PASSWORD` | Local Dev / Docker | Yes | `your-local-dev-password` | Local PostgreSQL superuser password used by Supabase CLI Docker engine. |
| `POSTGRES_DB` | Local Dev / Docker | Yes | `postgres` | Default database name. |
| `SUPABASE_PROJECT_REF` | CI/CD Server | Yes (CI) | `xyzprojectref` | Cloud project reference ID used for CLI remote migration pushes. |
| `SUPABASE_ACCESS_TOKEN` | CI/CD Server | Yes (CI) | `sbp_...personal-access-token...` | Supabase CLI personal access token for automated CI deployments. |

---

## 5. AI Service Provider Variables (Server-Only)

> **Security Rule:** AI provider keys must NEVER be accessible to browsers or mobile devices. All AI calls route through authenticated Next.js server route handlers with quota enforcement.

| Variable Name | Scope | Required | Example Placeholder | Purpose & Description |
|---|---|---|---|---|
| `AI_PROVIDER` | **Server-Only** | No (Phase 2) | `gemini` / `openai` / `anthropic` | Configured AI backend service provider. |
| `AI_PROVIDER_API_KEY` | **Server-Only** | No (Phase 2) | `sk-...secret-api-key...` | Server-side authentication key for AI provider. |
| `AI_PROVIDER_MODEL` | **Server-Only** | No (Phase 2) | `gemini-1.5-flash` | Target model identifier. |

---

## 6. Email, Storage & Operational Services

| Variable Name | Scope | Required | Example Placeholder | Purpose & Description |
|---|---|---|---|---|
| `SMTP_HOST` | **Server-Only** | Yes (Prod) | `smtp.resend.com` | SMTP relay server for transactional emails. |
| `SMTP_PORT` | **Server-Only** | Yes (Prod) | `587` | SMTP server port. |
| `SMTP_USER` | **Server-Only** | Yes (Prod) | `resend` | SMTP username. |
| `SMTP_PASSWORD` | **Server-Only** | Yes (Prod) | `re_...smtp-password...` | SMTP password / API token. |
| `SMTP_SENDER_EMAIL` | **Server-Only** | Yes (Prod) | `noreply@kinnipaw.com` | Verified "From" address for platform notifications. |
| `EXPO_ACCESS_TOKEN` | **Server-Only** | No (MVP) | `your-expo-access-token` | Authenticated server token for dispatching Expo push notifications. |
