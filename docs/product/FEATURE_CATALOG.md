# Feature Catalog — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation

This catalog provides the complete inventory of functional features for the KINNIPAW platform derived from the authoritative source documentation (`docs/source/`) and requirements specifications. It maps features to development phases, canonical task IDs (PB-001 through PB-120), and species-applicability rules.

---

## 1. Module: Lost & Found

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Lost Animal Reporting** | Create comprehensive lost report with date, time, last known generalized area, microchip (if any), photo gallery, markings, and distinct behavioral traits. | MVP | PB-051, PB-053, PB-098 | NOT_STARTED | All permitted species (dogs, cats, birds, small mammals, equines). Fuzzed public location. |
| **Found Animal Reporting** | Submit found animal report with date, sighting location (coarse coordinates), physical condition, temporary shelter status, and photos. | MVP | PB-052, PB-054, PB-098 | NOT_STARTED | All species. If suspected protected wildlife, flags notification to qualified rescue orgs immediately. |
| **Geographic Radius Discovery** | Filter and browse lost and found reports by administrative division, district, and generalized distance radius using PostGIS. | MVP | PB-053, PB-054 | NOT_STARTED | Universal. Exact coordinates deliberately generalized on public maps for privacy. |
| **Community Sightings** | Community members can submit timestamped sightings with photos and coarse location on active lost reports. | MVP | PB-055 | NOT_STARTED | Universal. Image EXIF/GPS metadata stripped prior to delivery. |
| **Deterministic Rule-Based Matching** | Automated algorithm calculating candidate match score based on species, breed, primary/secondary colors, gender, collar presence, and location proximity. | MVP | PB-056 | NOT_STARTED | Universal. Deterministic matching runs before any AI candidate scoring. |
| **Reunion Confirmation Lifecycle** | Secure confirmation workflow enabling animal owner to mark a lost report as reunited, prompting optional thank-you note and closing sightings. | MVP | PB-061 | NOT_STARTED | Universal. Subject to D-13 resolution. |
| **Found Pet Printable Posters** | Automated generation of downloadable/printable bilingual missing pet flyer with QR code linking to the live report. | Phase 2 | PB-051 | NOT_STARTED | Dogs, cats, companion birds, small pets. |

---

## 2. Module: Adoption

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Adoption Listing Creation** | Guardian or organization creates listing with animal profile, personality, medical history summary, requirements, and adoption terms. | MVP | PB-042, PB-044, PB-097 | NOT_STARTED | Lawful domestic companion animals only. Strictly disabled for prohibited or protected wildlife. |
| **Adoption Listing Search & Filters** | Search active listings by species, breed, age group, sex, size, temperament (good with kids/pets), spayed/neutered status, and location. | MVP | PB-043, PB-097 | NOT_STARTED | Permitted species only. Filter options dynamically adapt to selected species. |
| **Adoption Application Submission** | Prospective adopters submit detailed application detailing household environment, experience, other pets, and references. | MVP | PB-045, PB-046 | NOT_STARTED | Standardized form; specific questions adapt based on species needs (e.g. yard for large dogs, aviary for birds). |
| **Listing Owner Management Dashboard** | Listing owner or shelter reviews incoming applications, manages statuses (`submitted`, `under_review`, `approved`, `rejected`), and communicates with applicants. | MVP | PB-047, PB-048 | NOT_STARTED | Universal. Private applicant data accessible only to authorized listing guardians. |
| **Adoption Verification & Anti-Scam** | Content moderation screening for suspicious listings, commercial pet selling disguises, or fee scams; educational warnings for users. | MVP | PB-049, PB-117 | NOT_STARTED | Universal. Unlawful sale of animals under adoption pretense is strictly prohibited. |
| **Adoption Finalization & Contract** | Owner marks listing as adopted, recording timestamped adoption completion, updating animal profile ownership, and archiving applications. | MVP | PB-050 | NOT_STARTED | Domestic companion species. Subject to re-application policy (D-11). |
| **Foster-to-Adopt Programs** | Temporary foster application workflow with progress check-ins prior to permanent adoption decision. | Phase 2 | PB-045 | NOT_STARTED | Rescued dogs, cats, and specialized animals requiring rehabilitation. |

---

## 3. Module: Community Feed

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Social Feed Creation** | Create multimedia posts containing text, tagged animal profiles, sanitized photos, and category tags. | MVP | PB-032, PB-033, PB-096 | NOT_STARTED | Universal. Educational and celebratory content across all species. |
| **Comments & Threaded Replies** | Engage on posts via nested comments, mention handling (`@user`), and comment moderation controls. | MVP | PB-034 | NOT_STARTED | Universal. |
| **Reactions & Bookmarking** | Express appreciation (love, care, cheer, helpful) on posts; save posts to private bookmarks collection. | MVP | PB-035, PB-037 | NOT_STARTED | Universal. |
| **Following Graph** | Follow animal profiles, individual animal guardians, verified rescuers, and organizations; personalized chronological home feed. | MVP | PB-036, PB-038 | NOT_STARTED | Universal. |
| **Feed Filtering & Discovery** | Filter feed content by topic tags (Care Stories, Health Tips, Adoption Stories, Urgent Needs) and species. | MVP | PB-039 | NOT_STARTED | Universal. |
| **Community Feed Moderation** | In-feed reporting triggers, user blocking, content hiding, and automated profanity/harm filter checks. | MVP | PB-040, PB-041 | NOT_STARTED | Universal. |

---

## 4. Module: Community Groups

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Species-Specific Interest Groups** | Dedicated sub-communities (e.g. Bangladesh Feline Care, Deshi Dog Lovers, Avian Enthusiasts, Aquarium Keepers). | Phase 2 | PB-032 | NOT_STARTED | Tailored to specific domestic and lawful species groups. |
| **Local Neighborhood Groups** | District or neighborhood-based animal caregiver circles for local advice and emergency support. | Phase 2 | PB-032 | NOT_STARTED | Universal by geographic district. |
| **Group Discussion Forums** | Threaded community Q&A forums with accepted answers and helpful votes. | Phase 2 | PB-034 | NOT_STARTED | Universal. Medical questions display automated vet-consultation disclaimers. |

---

## 5. Module: Rescue Coordination

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Rescue Request Submission** | Report injured, distressed, or trapped animals with severity level (`critical`, `urgent`, `moderate`), location, and photos. | MVP | PB-057, PB-099 | NOT_STARTED | All animal species. Wildlife triggers specialized dispatch to licensed wildlife orgs. |
| **Volunteer & Org Assignment** | Authorized rescue organizations and verified volunteers can accept or be assigned to lead rescue operations. | MVP | PB-058 | NOT_STARTED | Universal. Requires verified rescuer permissions (D-16). |
| **Rescue Case Status Workflow** | State transition pipeline (`reported`, `triaged`, `in_progress`, `transported_to_clinic`, `under_care`, `resolved`, `closed`). | MVP | PB-059, PB-060 | NOT_STARTED | Universal. Full audit log of all status transitions preserved. |
| **Emergency Escalation Protocol** | High-severity alerts notify verified nearby rescue volunteers and partner clinics within configured radius. | MVP | PB-057, PB-065 | NOT_STARTED | High-urgency cases across all species. |
| **Rescue Outcome Documentation** | Document rehabilitation progress, post-rescue medical outcomes, and handover for adoption or release into lawful sanctuary. | MVP | PB-060 | NOT_STARTED | Universal. Protected species require documentation of official wildlife department notification. |

---

## 6. Module: Provider Directory (Vets, Clinics, Groomers, Boarding)

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Provider Public Directory** | Discover veterinary clinics, mobile vets, grooming salons, pet boarding facilities, and trainers with search and map view. | MVP | PB-070 | NOT_STARTED | Directory listings indicate supported species (e.g. small animal, exotic, avian, livestock). |
| **Provider Profile & Services** | Service providers maintain business hours, service menu, fee indications, emergency availability, and clinic photos. | MVP | PB-071 | NOT_STARTED | All veterinary and care services. |
| **Provider Verification System** | Verification badge workflow requiring professional license submission and admin verification before display. | MVP | PB-072, PB-080 | NOT_STARTED | Vets verified against Bangladesh Veterinary Council (BVC) standards per D-15. |
| **Moderated Customer Reviews** | Clients who used provider services can publish ratings and reviews subject to anti-fraud moderation. | Phase 2 | PB-073 | NOT_STARTED | Universal. |
| **Clinic Appointment Requests** | Basic appointment inquiry workflow enabling pet guardians to request clinic visit slots. | Future | PB-070 | NOT_STARTED | All domestic pets. |

---

## 7. Module: Organizations

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Organization Profiles** | Formal public profile for registered animal welfare shelters, rescue foundations, and charities. | MVP | PB-079 | NOT_STARTED | Shelters and welfare foundations across all species. |
| **Organization Member Management** | Multi-user roles within an organization (`org_admin`, `org_manager`, `org_member`) with scoped access. | MVP | PB-079, PB-083 | NOT_STARTED | Universal. Governed by D-14 publishing permissions. |
| **Verified NGO / Shelter Badge** | Formal verification process establishing legal registration and non-profit standing in Bangladesh. | MVP | PB-079 | NOT_STARTED | Registered animal welfare societies. |
| **Organization Public Roster** | Displays all animals currently under shelter care, active rescue cases, and alumni success stories. | MVP | PB-030, PB-042 | NOT_STARTED | Universal. |

---

## 8. Module: Messaging

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **Direct 1:1 Conversations** | Private messaging between authorized users regarding adoption inquiries, lost/found sightings, and rescue coordination. | MVP | PB-062, PB-063, PB-100 | NOT_STARTED | Universal. Subject to messaging initiation rules (D-12). |
| **Realtime Message Delivery** | Instant messaging powered by Supabase Realtime channels with authentication and authorization checks. | MVP | PB-063, PB-100 | NOT_STARTED | Universal. |
| **Read Receipts & Unread Counts** | Message delivery indicators, read status timestamps, and aggregated unread conversation badges. | MVP | PB-064 | NOT_STARTED | Universal. |
| **Attachment Sharing** | Secure photo sharing in chat with private storage bucket access and signed short-lived URLs. | MVP | PB-063, PB-103 | NOT_STARTED | Universal. EXIF data stripped on upload. |
| **In-Chat Safety & Blocking** | Persistent safety banner with anti-scam warnings, one-tap conversation block, and instant report abuse button. | MVP | PB-040, PB-062 | NOT_STARTED | Universal. |

---

## 9. Module: Notifications

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **In-App Notification Center** | Centralized activity feed for post interactions, adoption application status changes, rescue alerts, and system notices. | MVP | PB-065 | NOT_STARTED | Universal. |
| **Mobile Push Notifications** | Push notifications via Expo Push Notification service for direct messages, urgent nearby rescues, and application updates. | MVP | PB-066, PB-067, PB-101 | NOT_STARTED | Universal. Device registration via secure device tokens. |
| **Transactional Email Notifications**| Email delivery for account verification, password resets, critical adoption updates, and administrative notices. | MVP | PB-020, PB-065 | NOT_STARTED | Universal. |
| **Notification Preferences** | Granular user controls to mute specific notification categories (e.g. social likes vs urgent rescue alerts). | MVP | PB-029, PB-065 | NOT_STARTED | Universal. |

---

## 10. Module: AI Features (OPTIONAL & ADVISORY ONLY)

> **Architectural Guardrail:** All AI features are strictly OPTIONAL, non-blocking, and never required for core platform workflows. AI must never diagnose animals, prescribe medicine or dosages, or replace professional veterinary care. AI never autonomously determines animal identity.

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **AI Service Abstraction Layer** | Server-side provider interface (`packages/ai`) with quota management, rate limiting, and graceful fallback to rule-based logic. | Phase 2 | PB-085, PB-091, PB-092 | NOT_STARTED | Universal. |
| **Pet Care Assistant (Advisory)** | Conversational educational assistant providing general care tips, dietary basics, and enrichment ideas with strict medical disclaimers. | Phase 2 | PB-086, PB-093 | NOT_STARTED | Common companion species. Hard rejection on symptom diagnosis or prescription queries. |
| **Adoption Listing Copy Assistant** | Generates drafting suggestions for adoption descriptions based on structured animal profile attributes entered by the user. | Phase 2 | PB-087 | NOT_STARTED | Domestic pets. Human must review and confirm before publishing. |
| **Lost/Found Similarity Ranking** | Computer vision candidate similarity ranking used as a secondary helper *after* rule-based geographic/species filtering. | Phase 2 | PB-088 | NOT_STARTED | Dogs, cats. Human verification strictly required for any confirmed reunion. |
| **Adoption Compatibility Suggestions** | Explainable heuristic/AI scoring matching adopter preferences (activity level, home type) with animal needs. | Phase 2 | PB-089 | NOT_STARTED | Domestic pets. Purely advisory to help discovery. |
| **Content Moderation Risk Flagging** | Background text/image analysis flagging potential policy violations (animal cruelty, unlawful pet sales, hate speech) for human review. | Phase 2 | PB-090, PB-117 | NOT_STARTED | Universal. Flagged content enters human moderation queue; AI never bans autonomously. |

---

## 11. Module: Moderation & Safety

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **User & Content Reporting** | Universal report button on posts, comments, profiles, adoption listings, and messages with structured reason codes. | MVP | PB-040, PB-077, PB-078 | NOT_STARTED | Universal. Reporter identity is never disclosed to reported party. |
| **Moderator Review Dashboard** | Admin back-office interface prioritizing flagged items, showing report history, and audit trails. | MVP | PB-075, PB-077, PB-078 | NOT_STARTED | Universal. Protected by server-side RBAC. |
| **Moderation Actions Engine** | Actions: content removal, issuing formal warning, temporary suspension, permanent account ban, and listing take-down. | MVP | PB-077, PB-081 | NOT_STARTED | Universal. Audit logs record moderator identity, reason, and timestamp. |
| **User Appeals Workflow** | Suspended users can submit a one-time appeal with statement for independent administrative review. | Phase 2 | PB-077, PB-081 | NOT_STARTED | Universal. |
| **Location Anonymization Guard** | Server-side validation ensuring public reports display only generalized areas (sub-district/ward level) rather than raw street coordinates. | MVP | PB-053, PB-057 | NOT_STARTED | Universal. Critical for animal and rescuer safety. |

---

## 12. Module: User Profiles & RBAC

| Feature Name | Description | Phase | PB Tasks | Status | Species Applicability Notes |
|---|---|---|---|---|---|
| **User Registration & Auth** | Supabase Auth email/password and OAuth (Google), email confirmation, password recovery, session management. | MVP | PB-020, PB-023, PB-094 | NOT_STARTED | Universal. |
| **User Profile Management** | Display name, unique username, avatar upload (EXIF stripped), bio, preferred language (Bangla/English), generalized area. | MVP | PB-024, PB-025 | NOT_STARTED | Universal. |
| **Multiple Pet Profiles** | Users can register and manage profiles for multiple owned or fostered animals. | MVP | PB-026, PB-027, PB-095 | NOT_STARTED | All legal species categories. |
| **Pet Photo Gallery & Privacy** | Photo gallery per animal; granular privacy settings (`public`, `community_only`, `private`). | MVP | PB-028, PB-029 | NOT_STARTED | Universal. |
| **Role-Based Access Control (RBAC)**| Server-side authorization evaluating user roles, organization memberships, and resource ownership context. | MVP | PB-018, PB-082, PB-083 | NOT_STARTED | Universal. Strictly enforces least-privilege principles. |
| **Account Deletion & Data Export** | User self-service account deletion, anonymization of public historical contributions, and personal data purge. | MVP | PB-060, PB-116 | NOT_STARTED | Universal. Governed by legal review (D-17). |
