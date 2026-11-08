# RBAC and Resource Authorization — KINNIPAW

## Roles and scopes

| Actor | Scope | Permissions summary |
|---|---|---|
| Guest | Public | Read approved public records only |
| User | Own account | Create posts, animals, reports, applications and interact within policy |
| Animal guardian | Owned pet/listing | Manage owned pet and own adoption listing; review applications to own listing |
| Adopter | Own application | Create, view and withdraw own application; no access to other applicants |
| Rescuer | Assigned request | View/update requests assigned to them; no global rescue access |
| Provider | Own provider profile | Manage own provider details/services and respond to authorized interactions |
| Organization manager | Own organization | Manage members, listings and rescue workflows within organization scope |
| Moderator | Assigned queue / approved content scope | Review reports, hide/restore content, warn/restrict where delegated; no blanket access to private health/messages |
| Admin | Platform operations | Manage users/content/providers and operational settings within assigned admin permissions |
| Super admin | Global privileged scope | Manage global roles/configuration and high-risk admin actions; MFA and audit required |

## Permission matrix

Legend: `Public` = approved public fields only; `Own` = owner/applicant's own resources; `Assigned` = assigned case only; `Org` = authorized organization scope; `Limited` = delegated action; `—` = no permission.

| Action | Guest | User | Owner | Adopter | Rescuer | Provider | Org Manager | Moderator | Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| View approved public feed/listings | Public | Public | Public | Public | Public | Public | Public | Public | Public |
| Create post/comment | — | Own | Own | Own | Own | Own | Own | Limited | Own |
| Create pet | — | Own | Own | — | — | — | Org/own | — | Limited |
| Edit pet | — | — | Own | — | — | — | Org only if authorized | — | Limited |
| Create adoption listing | — | Own pet | Own pet | — | Assigned/Org | — | Org | — | Limited |
| Submit application | — | Own | Own | Own | Own | Own | Own | — | Limited |
| Review application | — | — | Own listing | — | — | — | Org listing | — | Limited |
| Create lost/found report | — | Own | Own | Own | Own | Own | Org | — | Limited |
| Submit sighting | — | Own | Own | Own | Own | Own | Org | — | Limited |
| Update rescue request | — | Reporter-limited | Reporter-limited | Reporter-limited | Assigned | — | Assigned Org | — | Limited |
| Send/read messages | — | Participant | Participant | Participant | Participant | Participant | Participant | No general access | Limited audited access only |
| View health records | — | — | Own pet | — | — | Explicit grant only | Explicit grant only | — | Restricted audited process |
| Manage provider profile | — | — | — | — | — | Own | Org-owned | — | Limited |
| Moderate public content | — | — | — | — | — | — | — | Assigned/delegated | Yes |
| Suspend account | — | — | — | — | — | — | — | Limited | Yes |
| Grant global roles | — | — | — | — | — | — | — | — | Super admin only |

## Authorization evaluation order

1. Authenticate session.
2. Check account state and restrictions.
3. Check global role only where relevant.
4. Check resource ownership or organization membership.
5. Check assignment and current workflow status.
6. Check blocks, privacy settings and consent.
7. Apply action-specific validation and rate limits.
8. Execute within a transaction where needed.

## Critical rules

- Never accept owner_id, actor_id, moderator_id or role from an untrusted client as proof of authority.
- Do not trust hidden UI controls as security.
- Application details are visible only to the applicant, authorized listing owner/org members and narrowly scoped moderators when policy requires it.
- Messages are participant-only; moderators do not receive blanket access to private messages.
- Exact location and private health data require separate policies.
- Admin and super-admin actions require audit records; privileged actions should require reason codes.
- Organization membership must be active and role-scoped.
