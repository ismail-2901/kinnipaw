# KINNIPAW — Antigravity Execution Contract

1. Read `AGENTS.md`, `docs/START_HERE.md`, `docs/source/00-authoritative-project-context.md`, then every file under `docs/source/` completely before changing files.
2. Do not browse for or request any ChatGPT conversation link. All required project context is copied into this repository.
3. First perform M0 documentation consolidation only. Do not scaffold apps, install dependencies, create migrations, or implement features until the documentation audit passes and the user approves M0.
4. Preserve all 43 application table names and the full original field inventory, all API endpoint definitions, role/RLS requirements, and PB-001 through PB-120 task IDs unless an explicit approved decision changes them. Do not claim completeness without comparing source to canonical docs.
5. Resolve legacy pet-only wording using `docs/source/00-authoritative-project-context.md`. “All animals” does not authorize illegal wildlife commerce or unsafe transfers.
6. Work in one small task at a time. Before coding, report scope, dependencies, data/API/RBAC impact, risks and acceptance criteria.
7. Database changes require reviewed ERD/schema diff, forward migration, rollback or forward-fix plan, backup strategy, RLS tests, integrity tests and migration verification. Never reset production or use destructive SQL casually.
8. Required gates per task: formatting, lint, typecheck, unit tests, integration/RLS tests, affected E2E journeys, production build, responsive/accessibility checks, security review where applicable. Record exact commands and actual results.
9. No credentials in source control. No service-role key in browser/mobile. No paid service, production deployment, domain purchase, app-store submission or irreversible action without explicit user approval.
10. At every milestone end, produce evidence: changed files, completed task IDs, test logs, screenshots where relevant, known defects, unresolved decisions and next milestone proposal. Stop if acceptance fails.
11. “Bug-free” is not a valid claim. Report verified coverage and known limitations honestly.
