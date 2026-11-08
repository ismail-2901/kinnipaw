# Prompt 04 — Exhaustive Documentation Audit

```text
Perform an exhaustive audit comparing every file in docs/source/ against canonical docs/.

Check all 43 database tables and fields; ERD relationships; API method/path inventory; role/permission/RLS matrix; user journeys; responsive/UI/accessibility requirements; web/PWA/Android/iOS scope; AI safety and limits; deployment/free-tier constraints; migration/rollback policy; and every PB-001 through PB-120 task.

For each requirement, add a traceability row with exact source file/heading, destination file/heading, status COVERED/PARTIAL/MISSING/CONFLICTING, task IDs and test evidence.

Fix omissions only when supported by source archive. Keep docs/source/ unchanged. Record unresolved decisions in docs/OPEN_QUESTIONS.md. Do not write application code or migrations.

End by stating whether M0 is ready for human approval. Do not mark complete if any unexplained missing or conflicting requirement remains.
```
