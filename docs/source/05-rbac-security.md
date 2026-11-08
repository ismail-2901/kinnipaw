# Source Archive 05 — RBAC and Security Requirements

Roles: Guest, User, Moderator, Admin, Super Admin. Pet Owner, Adopter, Rescuer, Provider and Organization Manager are scoped capabilities determined by resource ownership, assignment or organization membership rather than automatically being global privileged roles.

Required protections:
- Supabase Auth; verified sessions; secure web cookies and secure mobile token storage.
- RBAC + resource ownership + organization membership checks.
- RLS on every exposed table.
- No service-role/secret key in frontend/mobile.
- Zod validation for every API input.
- Rate limiting and bot/spam protection.
- Safe upload restrictions; MIME/signature/size checks; EXIF GPS stripping.
- Private health records, adoption applications, messages and exact location.
- Approximate public locations only.
- Report, block, moderation queue, audit logs, appeals/restrictions.
- Admin MFA and least privilege.
- AI cannot diagnose or prescribe.
