# Prompt 07 — Database Change and Migration Review

```text
For the requested KINNIPAW database change, first read SCHEMA_SPEC.md, ERD.md, MIGRATIONS.md, RBAC.md and SECURITY.md.

Do not write SQL until you provide:
- affected tables/columns/relationships
- data migration impact
- RLS policy impact
- indexes/constraints impact
- backwards-compatibility plan
- backup and recovery/forward-fix strategy
- tests required

Use versioned SQL migrations only. Never edit production manually, disable RLS, use DROP CASCADE casually or reset production. Prefer expand-migrate-contract for destructive changes. Test locally and run RLS/integrity tests. Update ERD, schema spec, migration notes and traceability. Stop if an unresolved decision affects data safety.
```
