# Logical ERD — KINNIPAW

The diagrams show major relationships. The authoritative table inventory is `SCHEMA_SPEC.md`. Supabase `auth.users` is managed externally and is not a KINNIPAW-owned table.

## Identity, animals and organizations

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : has
  PROFILES ||--o{ USER_ROLES : receives
  PROFILES ||--o{ PETS : owns
  ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
  PROFILES ||--o{ ORGANIZATION_MEMBERS : joins
  ORGANIZATIONS ||--o{ PROVIDER_PROFILES : operates
  PROFILES ||--o| PROVIDER_PROFILES : represents
  SPECIES ||--o{ BREEDS : contains
  SPECIES ||--o{ PETS : classifies
  BREEDS ||--o{ PETS : identifies
  PETS ||--o{ PET_MEDIA : has
  PETS ||--o{ PET_HEALTH_RECORDS : has
  PETS ||--o{ CARE_REMINDERS : has
```

## Social and adoption

```mermaid
erDiagram
  PROFILES ||--o{ POSTS : writes
  PETS o|--o{ POSTS : featured_in
  POSTS ||--o{ POST_MEDIA : contains
  POSTS ||--o{ COMMENTS : has
  PROFILES ||--o{ COMMENTS : writes
  POSTS ||--o{ REACTIONS : receives
  PROFILES ||--o{ REACTIONS : creates
  PROFILES ||--o{ FOLLOWS : participates
  POSTS ||--o{ BOOKMARKS : saved_by
  PROFILES ||--o{ BOOKMARKS : saves
  PETS ||--o{ ADOPTION_LISTINGS : listed
  ORGANIZATIONS o|--o{ ADOPTION_LISTINGS : publishes
  ADOPTION_LISTINGS ||--o{ ADOPTION_APPLICATIONS : receives
  PROFILES ||--o{ ADOPTION_APPLICATIONS : submits
  ADOPTION_APPLICATIONS ||--o{ APPLICATION_EVENTS : tracks
```

## Lost-and-found and rescue

```mermaid
erDiagram
  PROFILES ||--o{ LOST_FOUND_REPORTS : reports
  PETS o|--o{ LOST_FOUND_REPORTS : identifies
  LOST_FOUND_REPORTS ||--o{ REPORT_MEDIA : contains
  LOST_FOUND_REPORTS ||--o{ SIGHTINGS : receives
  LOST_FOUND_REPORTS ||--o{ LOST_FOUND_MATCHES : candidate
  LOST_FOUND_REPORTS ||--o{ AI_MATCH_CANDIDATES : ai_candidate
  PROFILES ||--o{ RESCUE_REQUESTS : submits
  ORGANIZATIONS o|--o{ RESCUE_REQUESTS : coordinates
  RESCUE_REQUESTS ||--o{ RESCUE_ASSIGNMENTS : assigned
  RESCUE_REQUESTS ||--o{ RESCUE_STATUS_EVENTS : tracks
```

## Messaging, providers, events and platform safety

```mermaid
erDiagram
  CONVERSATIONS ||--o{ CONVERSATION_MEMBERS : contains
  PROFILES ||--o{ CONVERSATION_MEMBERS : joins
  CONVERSATIONS ||--o{ MESSAGES : contains
  PROFILES ||--o{ MESSAGES : sends
  MESSAGES ||--o{ MESSAGE_ATTACHMENTS : contains
  PROVIDER_PROFILES ||--o{ PROVIDER_SERVICES : offers
  PROVIDER_PROFILES ||--o{ PROVIDER_REVIEWS : receives
  PROFILES ||--o{ PROVIDER_REVIEWS : writes
  EVENTS ||--o{ EVENT_ATTENDEES : has
  PROFILES ||--o{ EVENT_ATTENDEES : attends
  PROFILES ||--o{ NOTIFICATIONS : receives
  PROFILES ||--o{ USER_DEVICES : registers
  PROFILES ||--o{ USER_BLOCKS : blocks
  PROFILES ||--o{ CONTENT_REPORTS : reports
  PROFILES ||--o{ MODERATION_ACTIONS : performs
  PROFILES ||--o{ AUDIT_LOGS : acts
  PROFILES ||--o{ AI_JOBS : requests
  AI_JOBS o|--o{ AI_MATCH_CANDIDATES : produces
```

## Relationship notes

- Follows, reactions, bookmarks, organization memberships, conversation memberships and event attendees are many-to-many relationships represented by junction tables.
- Provider ownership is either an individual user or an organization; enforce the chosen exclusive-owner rule.
- A lost/found report may reference a known pet or an unknown animal.
- `content_reports` and `moderation_actions` use polymorphic targets in the baseline and need an explicit integrity strategy.
- The two match tables are retained pending a reviewed decision.
