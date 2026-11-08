# Start Here — KINNIPAW Project Execution

## Current state

This is a documentation-first starter pack. No product code or cloud resources have been created.

## Correct order

1. Extract the pack into a local folder named `KINNIPAW` (or copy its contents into an empty `KINNIPAW/` workspace).
2. Open that folder in Antigravity.
3. Read `AGENTS.md` and `docs/OPEN_QUESTIONS.md`.
4. Inspect `docs/source/`. These files preserve the product and technical requirements and must not be modified.
5. Review the canonical documents in `docs/`.
6. Run the documentation completeness audit in `docs/roadmap/DOCUMENTATION_AUDIT.md`.
7. Resolve blockers, especially the table inventory/matching model, location privacy, admin roles, and commercial hosting choice.
8. Approve M0 in `docs/roadmap/ROADMAP.md`.
9. Use the prompt files in `antigravity/prompts/` one at a time.

## Do not do this

- Do not paste the whole documentation pack into one Agent message.
- Do not ask the Agent to build the entire product in one go.
- Do not start with a landing page before requirements, architecture and access control are reviewed.
- Do not create production migrations from incomplete schema assumptions.
- Do not assume free-tier service quotas or commercial-use terms remain unchanged.
- Do not publish under the working name until formal brand clearance is complete.

## Milestone workflow

For every task: read spec → inspect repo → plan → implement small scope → test → security review → update docs/traceability → human review → Git commit.
