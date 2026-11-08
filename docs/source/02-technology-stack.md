# Source Archive 02 — Technology Stack

Approved technical direction:

- Web: Next.js App Router + TypeScript.
- Mobile: React Native + Expo + Expo Router.
- Monorepo: pnpm workspaces + Turborepo.
- Database: Supabase PostgreSQL; PostGIS for spatial operations if needed.
- Auth: Supabase Auth.
- Storage: Supabase Storage.
- Realtime: Supabase Realtime for authorized chat/notifications.
- Shared REST API: Next.js Route Handlers, versioned under `/api/v1`.
- Validation: Zod.
- Forms: React Hook Form where useful.
- Server state: TanStack Query where useful.
- Web UI: Tailwind CSS + shadcn/ui/Radix primitives.
- Mobile UI: native React Native components; shared design tokens/contracts only.
- Web animation: Motion; mobile animation only when justified.
- Tests: Vitest, React Testing Library, Playwright, Maestro; Supabase CLI/pgTAP for database policy tests.
- CI/CD: GitHub Actions.
- AI: server-side provider abstraction; initial option Gemini/Groq subject to privacy and free-tier review.

No Prisma initially; use SQL migrations, Supabase SDKs and generated Database Types. No separate backend or microservices at the beginning.
