# Source Archive 03 — Architecture and Repository

Use a modular monolith and one monorepo. Web and mobile clients call the same versioned backend for business mutations. Public server-rendered reads may use a server data-access layer, but business rules must remain shared and authorization must be consistent. Ordinary user-scoped database operations must preserve the authenticated user's RLS context. Realtime is direct to Supabase only after private channel access is authorized.

Suggested structure:

```text
kinnipaw/
  apps/
    web/       # Next.js App Router; includes admin routes
    mobile/    # Expo Router
  packages/
    contracts/
    api-client/
    database-types/
    design-tokens/
    eslint-config/
    tsconfig/
  supabase/
    migrations/
    functions/
    tests/
    seed/
  docs/
  e2e/
  .github/workflows/
  AGENTS.md
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
```

Do not create a separate admin app at the beginning. Admin screens belong in `apps/web` behind server-enforced permissions. Do not share DOM UI components directly with React Native.
