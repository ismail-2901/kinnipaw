# Prompt 06 — Reusable Feature Task Template

```text
Continue KINNIPAW using AGENTS.md and canonical documentation.

Task ID: [PB-XXX]
Milestone: [M#]
Feature/task: [specific task]

Before coding:
1. Inspect git status and current implementation.
2. Read the exact requirement, workflow, schema, API, RBAC and UI sections relevant to this task.
3. List dependencies, acceptance criteria and risks.
4. Identify any unresolved question that blocks safe implementation.

Implement only this task. Do not refactor unrelated modules or silently alter the approved architecture.

Required quality:
- server-side validation
- server-side authorization and resource ownership
- RLS where database access is exposed
- responsive UI with loading/empty/error/success states
- tests including denied/unauthorized cases where applicable
- safe migration if schema changes are needed
- docs and traceability updates

After implementation run lint, typecheck, relevant unit/integration/E2E tests and build checks. Review the diff for secrets, unrelated changes and private data exposure.

Report: changed files, task ID, acceptance criteria results, commands, test outcomes, risks, remaining work and documentation updates. Do not claim success for unverified steps.
```
