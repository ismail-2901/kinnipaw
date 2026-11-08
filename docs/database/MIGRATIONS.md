# Database Migration and Recovery Policy

## Principles

- Version every schema change in `supabase/migrations/`.
- Never edit production schema manually.
- Never reset or seed production data.
- Review destructive changes with an explicit backup and recovery plan.
- Use expand → migrate → contract for renames, drops and large transformations.
- Prefer forward-fix migrations in production. A rollback is not automatically safe after data writes.

## Migration stages

1. Update ERD and schema spec.
2. Record architecture/schema decision if the model changes.
3. Write migration with constraints and RLS in mind.
4. Apply to local Supabase development database.
5. Run schema diff/type generation.
6. Run SQL integrity tests and RLS tests using distinct user roles.
7. Seed only deterministic non-sensitive development data.
8. Review execution plan/locking risk for large tables.
9. Back up before production migration.
10. Apply through controlled deployment workflow.
11. Verify application health, constraints, RLS and critical workflows.
12. Document recovery/forward-fix steps.

## Rollback safeguards

- Every migration should include a human-readable recovery note.
- Reversible DDL may have a paired down script for local/test use; production rollback requires explicit data-loss review.
- Before destructive operations, export/backup affected rows and verify restore procedure.
- Do not drop columns until all application versions stop reading/writing them.
- Do not rename a column in one step if old app versions may still be live.
- Test migrations against a copy of representative data when table size/locks matter.
- Never use `DROP ... CASCADE` without enumerating dependent objects.

## Data retention

Define retention separately for user profile data, health records, applications, messages, reports, moderation actions and audit logs. Account deletion must follow an approved privacy/legal policy; do not blindly cascade all historical records.
