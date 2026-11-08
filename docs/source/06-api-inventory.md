# API Specification — KINNIPAW

## Conventions

- Base path: `/api/v1` (same Next.js origin initially; custom API subdomain is optional later).
- HTTPS only. JSON request/response. Bearer access token from Supabase Auth.
- Shared request/response schemas in `packages/contracts`.
- Pagination: opaque cursor; stable sort such as `(created_at,id)`.
- Use idempotency keys for non-repeatable create/transition operations where retry is possible.
- Every protected endpoint authenticates and checks role + resource ownership + org membership + assignment + visibility + block state.
- User-scoped DB operations use request-scoped Supabase access so RLS is enforced.
- Never accept user IDs or role IDs from client as proof of authority.

## Standard success response

```json
{ "success": true, "data": { "id": "..." }, "meta": null }
```

## Standard error response

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": null,
    "requestId": "..."
  }
}
```

## HTTP status conventions

| Status | Meaning |
|---|---|
| 200 | Successful read/update/action |
| 201 | Resource created |
| 204 | Successful operation with no body |
| 400 | Malformed request |
| 401 | Unauthenticated/invalid session |
| 403 | Authenticated but not authorized |
| 404 | Not found or intentionally concealed |
| 409 | State conflict/duplicate/idempotency conflict |
| 422 | Valid shape but invalid business transition |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Endpoint inventory

### Authentication and profile

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/me` | Current authenticated user |
| `PATCH` | `/me` | Update own profile |
| `GET` | `/profiles/{username}` | Public profile fields |
| `GET` | `/profiles/{id}/animals` | Public/authorized pet list |
| `POST` | `/me/account-deletion` | Request account deletion |
| `GET` | `/me/privacy` | Get privacy settings |
| `PATCH` | `/me/privacy` | Update privacy settings |

### Pet management

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/animals` | Search/filter authorized animals |
| `POST` | `/animals` | Create pet |
| `GET` | `/animals/{id}` | Pet details according to visibility |
| `PATCH` | `/animals/{id}` | Update owned pet |
| `DELETE` | `/animals/{id}` | Archive/delete according to retention policy |
| `POST` | `/animals/{id}/media-upload` | Create authorized upload instruction |
| `GET` | `/animals/{id}/health-records` | Read authorized private health timeline |
| `POST` | `/animals/{id}/health-records` | Create health record |
| `POST` | `/animals/{id}/reminders` | Create care reminder |
| `PATCH` | `/reminders/{id}` | Update own reminder |
| `POST` | `/reminders/{id}/complete` | Complete reminder |

### Social

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/feed` | Personalized/public feed |
| `POST` | `/posts` | Create post |
| `GET` | `/posts/{id}` | Read visible post |
| `PATCH` | `/posts/{id}` | Edit own post |
| `DELETE` | `/posts/{id}` | Delete/archive own post |
| `POST` | `/posts/{id}/reactions` | Create/update reaction |
| `DELETE` | `/posts/{id}/reactions` | Remove reaction |
| `GET` | `/posts/{id}/comments` | Read comments |
| `POST` | `/posts/{id}/comments` | Create comment/reply |
| `DELETE` | `/comments/{id}` | Delete authorized comment |
| `POST` | `/users/{id}/follow` | Follow user |
| `DELETE` | `/users/{id}/follow` | Unfollow user |
| `POST` | `/posts/{id}/bookmark` | Bookmark post |
| `DELETE` | `/posts/{id}/bookmark` | Remove bookmark |

### Adoption

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/adoption-listings` | Browse/filter approved listings |
| `POST` | `/adoption-listings` | Create listing |
| `GET` | `/adoption-listings/{id}` | Listing detail |
| `PATCH` | `/adoption-listings/{id}` | Update owned listing |
| `POST` | `/adoption-listings/{id}/publish` | Submit/publish listing through moderation |
| `POST` | `/adoption-listings/{id}/applications` | Submit application |
| `GET` | `/me/adoption-applications` | Read own applications |
| `GET` | `/adoption-listings/{id}/applications` | Owner/org applicant list |
| `PATCH` | `/applications/{id}/status` | Authorized status transition |
| `POST` | `/applications/{id}/withdraw` | Withdraw own application |
| `GET` | `/applications/{id}/history` | Authorized application history |

### Lost and found

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/lost-found/reports` | Search public reports |
| `POST` | `/lost-found/reports` | Create report |
| `GET` | `/lost-found/reports/{id}` | Read report |
| `PATCH` | `/lost-found/reports/{id}` | Update own report |
| `POST` | `/lost-found/reports/{id}/sightings` | Submit sighting |
| `GET` | `/lost-found/reports/{id}/matches` | Read eligible candidate matches |
| `POST` | `/lost-found/matches/{id}/review` | Accept/dismiss candidate |
| `POST` | `/lost-found/reports/{id}/reunited` | Confirm reunion |
| `POST` | `/lost-found/reports/{id}/close` | Close own/authorized report |

### Rescue

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/rescue-requests` | Browse published rescue requests |
| `POST` | `/rescue-requests` | Create request |
| `GET` | `/rescue-requests/{id}` | Read authorized request |
| `POST` | `/rescue-requests/{id}/assignments` | Assign rescuer/org |
| `POST` | `/rescue-requests/{id}/accept` | Accept assignment |
| `PATCH` | `/rescue-requests/{id}/status` | Update status as authorized actor |
| `GET` | `/rescue-requests/{id}/history` | Read authorized history |

### Messaging

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/conversations` | List own conversations |
| `POST` | `/conversations` | Create eligible conversation |
| `GET` | `/conversations/{id}/messages` | Read participant messages |
| `POST` | `/conversations/{id}/messages` | Send participant message |
| `POST` | `/conversations/{id}/read` | Update read state |
| `POST` | `/conversations/{id}/members` | Add member when conversation type/policy allows |

### Providers and events

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/providers` | Search verified/visible providers |
| `POST` | `/providers` | Register provider profile |
| `GET` | `/providers/{id}` | Provider profile |
| `PATCH` | `/providers/{id}` | Update own/organization provider |
| `GET` | `/providers/{id}/services` | Provider services |
| `POST` | `/providers/{id}/reviews` | Submit review |
| `GET` | `/events` | Browse events |
| `POST` | `/events` | Create event |
| `POST` | `/events/{id}/attend` | RSVP |
| `DELETE` | `/events/{id}/attend` | Cancel RSVP |

### Notifications and devices

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/notifications` | List own notifications |
| `POST` | `/notifications/read` | Mark selected notifications read |
| `POST` | `/notifications/read-all` | Mark all own notifications read |
| `POST` | `/devices/register` | Register own push token |
| `DELETE` | `/devices/{id}` | Remove own device |

### AI

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/ai/animal-care` | Animal-care educational assistant |
| `POST` | `/ai/lost-found/match` | Request candidate matching |
| `POST` | `/ai/adoption/recommend` | Request explainable recommendation |
| `POST` | `/ai/listing-description` | Generate editable draft |
| `POST` | `/ai/moderation/analyze` | Flag content for human moderation |

### Admin and moderation

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/admin/dashboard` | Admin metrics |
| `GET` | `/admin/reports` | Moderation queue |
| `POST` | `/moderation/reports` | Report content/user |
| `POST` | `/moderation/block/{userId}` | Block user |
| `DELETE` | `/moderation/block/{userId}` | Unblock user |
| `PATCH` | `/admin/reports/{id}` | Review report |
| `POST` | `/admin/actions` | Execute authorized moderation action |
| `GET` | `/admin/audit-logs` | Read restricted audit logs |
| `PATCH` | `/admin/users/{id}/status` | Change account status with permission |


## API implementation requirements

- Keep route handlers thin and use feature service functions.
- Validate path params, query params and body.
- Sanitize output fields; never serialize raw database rows indiscriminately.
- Return 404 where revealing resource existence would leak private data.
- Use transaction-safe state transitions for adoption and rescue.
- Apply per-user, per-IP and per-action rate limits; AI endpoints require stricter quotas.
- Use cursor pagination; avoid unbounded list endpoints.
- Include request IDs and structured logs; never log tokens, private message contents or sensitive health data.
- Document OpenAPI schemas and keep them synchronized with Zod contracts.
- Generate typed client methods from the shared contract/OpenAPI strategy after it is selected.

## Important unresolved API policies

- Decide whether a user may re-apply after withdrawal/rejection.
- Decide whether direct messaging can begin only from adoption/rescue context or also from profiles.
- Decide who may mark a lost/found case reunited and whether both parties must confirm.
- Decide whether organization members can publish on behalf of the organization by default or require approval.
- Decide detailed admin dashboard aggregation and privacy thresholds.
