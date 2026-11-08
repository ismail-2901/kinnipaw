# Prompt 03 — Generate/Consolidate Canonical Documentation

```text
Read ALL original requirements in docs/source/ and root AGENTS.md before starting.

Populate all canonical documents under docs/ from the source archive. Preserve every feature, user type, table, column, relationship, index, endpoint, role, permission, security requirement, UI rule, mobile requirement, AI safety rule, hosting constraint and task PB-001 through PB-120.

Non-negotiable:
1. Do not edit docs/source/.
2. Do not summarize away implementation details.
3. Preserve all 43 application table names and all originally listed fields.
4. Preserve the complete API endpoint inventory.
5. Preserve all RBAC and RLS requirements.
6. Preserve Web, PWA, Android and iOS scope.
7. Preserve the complete roadmap PB-001–PB-120.
8. Use KINNIPAW as provisional brand; never claim legal clearance.
9. Do not invent missing details. Record them in docs/OPEN_QUESTIONS.md.
10. Specifically flag lost_found_matches vs ai_match_candidates and polymorphic moderation targets; do not silently merge/delete.
11. Do not implement app code, install packages or create migrations.
12. Update docs/TRACEABILITY.md with source-to-canonical mappings.

Finish with an inventory and completeness report: COVERED, PARTIAL, MISSING, CONFLICTING. A heading alone is not evidence of coverage.
```
