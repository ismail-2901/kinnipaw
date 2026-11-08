# Product Requirements Document — KINNIPAW

## 1. Product summary

KINNIPAW is a Bangladesh-first, bilingual animal community and welfare platform for animal guardians, animal lovers, responsible adopters, rescuers, rescue organizations, and veterinary/service providers. It combines animal profiles, community interaction, responsible adoption, lost-and-found reporting, rescue coordination and animal-care utilities.

## Animal-inclusive scope (authoritative)

The product is not limited to companion pets, dogs or cats. The species taxonomy must be extensible for birds, fish, reptiles, small mammals, equines, farm animals and wildlife, subject to jurisdiction-specific safety and legal rules. Adoption/rehoming, commerce and transfers must be disabled for prohibited species or unlawful contexts. Wildlife use cases prioritize rescue, rehabilitation, reporting and qualified organizations; sensitive habitat coordinates must never be exposed. “Every animal” is a product-inclusion principle, not permission for unrestricted animal trade. See `docs/source/00-authoritative-project-context.md`.

## 2. Mission and product goals

**Mission:** Help people care for animals and help communities act more effectively when animals need support.

**Primary goals:**
- Give users a useful home for animal profiles, stories and care history.
- Make responsible adoption listings and applications easier to manage.
- Help owners and communities report lost/found animals and surface possible matches.
- Coordinate rescue requests with accountable statuses and authorized volunteers/organizations.
- Build a safe, moderated community with transparent verification and privacy.
- Support Bangla and English on responsive web and native mobile apps.

## 3. Non-goals for the initial release

- No veterinary diagnosis, prescription or dosage recommendation.
- No autonomous determination that two lost/found reports refer to the same animal.
- No government-system integration requirement.
- No large-scale commercial pet marketplace, checkout, delivery or payment infrastructure in the approved initial scope.
- No microservices, Kubernetes or dedicated vector database before a measured need exists.
- No public exposure of exact home locations or private health records.

A product marketplace/commerce module may be proposed later but is not part of the approved 43-table baseline.

## 4. User groups

- Guest: browse public content.
- Registered user: create a profile, participate in community, report cases.
- Animal guardian: manage owned animal profiles and care information.
- Adopter: submit and manage adoption applications.
- Rescuer: participate in assigned rescue workflows.
- Veterinary/service provider: maintain a provider profile and services.
- Organization member/manager: coordinate listings, rescue cases and organization data within membership scope.
- Moderator: review reports and take scoped content-safety actions.
- Admin: manage platform operations.
- Super admin: manage high-risk system configuration and global privileged roles.

These are capabilities and scopes; not all are global roles. Ownership and organization membership must be evaluated at resource level.

## 5. Functional scope and priorities

### P0 — Initial public beta foundation

1. Authentication: email/password and supported OAuth, account recovery and session management.
2. User profiles: display name, username, avatar, bio, locale and approximate public area.
3. Animal profiles: multiple animals per user, species, optional breed, age, sex, color, temperament, bio, photos and privacy.
4. Social feed: posts, media, comments/replies, reactions, follows, bookmarks and visibility controls.
5. Adoption: listing creation, moderation/publication, application submission, owner review, status history and adopted/closed lifecycle.
6. Lost-and-found: lost/found reports, species/description/markings, approximate location, sightings, filters and possible-match review.
7. Rescue: request creation, urgency, approximate location, assignment, status events and resolution.
8. Safety: report, block, moderation queue, account restrictions and audit history.
9. Admin: moderation and operational dashboards with server-side permission enforcement.
10. Bangla/English interface and responsive web.

### P1 — Community growth and care utilities

- Private messaging and conversation membership.
- In-app notifications, email notifications and mobile push where supported.
- Pet health timeline and private records.
- Vaccination, grooming, deworming and appointment reminders.
- Provider directory and verification.
- Provider services and moderated reviews.
- Community events and RSVP.
- Pet memories/timeline using post and media capabilities.

### P2 — AI and intelligent assistance

- General animal-care education assistant with safety boundaries and references where available.
- Lost/found candidate ranking using rules first, then optional image similarity.
- Adoption compatibility suggestions with explainable criteria.
- Adoption listing description assistance.
- Content moderation risk flags with human decision.
- AI task quotas, safe fallbacks, auditability and privacy minimization.

## 6. Key user journeys

### Pet profile
Sign up → verify account → complete user profile → add pet → upload sanitized images → set visibility → view/edit pet timeline.

### Adoption
Owner creates listing → listing enters review → moderator approves or returns it → public listing becomes discoverable → adopter submits application → owner reviews → status event recorded → owner marks adopted/closed.

### Lost-and-found
Reporter creates lost/found report → validates required information → location is generalized for public display → report is reviewed/published → users submit sightings → system suggests possible matches → humans review → owner confirms reunion → report closes.

### Rescue
User submits rescue request → moderation/triage → authorized organization or rescuer accepts/gets assigned → status updates recorded → outcome documented → request resolved/closed.

### Messaging
Authorized user opens or joins conversation → server checks eligibility and block state → participant-only messages and realtime channel → read state/notification updates → block/report controls remain available.

## 7. Product safety requirements

- Reporting and blocking must be available where user-generated content or direct interaction exists.
- Public listings must distinguish owner-reported facts from independently verified facts.
- Adoption and rescue must include scam-prevention guidance.
- Do not require unnecessary national ID, exact address or sensitive personal details.
- Never publicly expose private health records or private messages.
- Public map locations must be approximate and deliberately generalized.
- User-submitted images must have GPS metadata removed before public delivery.
- Animal-health content is educational, not diagnosis or treatment.

## 8. Success metrics

Measure outcomes, not only vanity metrics:
- completed animal profiles;
- weekly active animal guardians;
- meaningful feed interactions;
- active and approved adoption listings;
- application completion and adoption outcomes;
- lost/found reports resolved/reunited;
- rescue assignment time and resolution rate;
- moderation response time and appeal outcomes;
- D7 retention and repeat utility usage.

Do not invent initial success targets. Establish a beta baseline, then set targets based on observed usage and capacity.

## 9. Acceptance principle

A feature is not complete because its screen exists. It must have working business logic, validation, server authorization, RLS where applicable, responsive states, error handling, tests, documentation and a traceable requirement ID.
