# Source Archive 04 — Database Inventory

The initial blueprint specifies 43 application tables plus Supabase's managed `auth.users` identity table. The list below preserves all 43 names and operational fields. Type/constraint details marked proposed must be reviewed in the canonical schema design before migrations.

### 01. `profiles`

**Purpose:** User profile metadata; 1:1 with auth.users.

**Proposed columns:** `id UUID PK -> auth.users.id; username TEXT UNIQUE; display_name TEXT; avatar_path TEXT NULL; bio TEXT NULL; preferred_locale TEXT DEFAULT en; city TEXT NULL; area_label TEXT NULL; account_status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 02. `user_roles`

**Purpose:** Global privileged roles only; never self-assigned.

**Proposed columns:** `id UUID PK; user_id UUID FK profiles.id; role TEXT CHECK(user|moderator|admin|super_admin); granted_by UUID FK profiles.id NULL; created_at TIMESTAMPTZ; UNIQUE(user_id,role).`

### 03. `organizations`

**Purpose:** Rescue shelters, veterinary clinics and community organizations.

**Proposed columns:** `id UUID PK; name TEXT; slug TEXT UNIQUE; organization_type TEXT; description TEXT NULL; verification_status TEXT; public_email TEXT NULL; public_phone TEXT NULL; city TEXT NULL; area_label TEXT NULL; service_area GEOGRAPHY NULL; created_by UUID FK profiles.id; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 04. `organization_members`

**Purpose:** Many-to-many user/org membership with scoped roles.

**Proposed columns:** `id UUID PK; organization_id UUID FK organizations.id; user_id UUID FK profiles.id; organization_role TEXT CHECK(owner|manager|rescuer|staff); membership_status TEXT; joined_at TIMESTAMPTZ; UNIQUE(organization_id,user_id).`

### 05. `provider_profiles`

**Purpose:** Individual professional or organization-backed provider.

**Proposed columns:** `id UUID PK; user_id UUID FK profiles.id NULL; organization_id UUID FK organizations.id NULL; provider_type TEXT; public_name TEXT; professional_license_reference TEXT NULL; verification_status TEXT; public_address TEXT NULL; service_area GEOGRAPHY NULL; description TEXT NULL; created_at TIMESTAMPTZ; CHECK exactly one of user_id or organization_id is set.`

### 06. `species`

**Purpose:** Controlled list of supported animal species.

**Proposed columns:** `id UUID PK; name TEXT; slug TEXT UNIQUE; is_active BOOLEAN DEFAULT true; created_at TIMESTAMPTZ.`

### 07. `breeds`

**Purpose:** Optional breed list scoped to species.

**Proposed columns:** `id UUID PK; species_id UUID FK species.id; name TEXT; slug TEXT; UNIQUE(species_id,slug).`

### 08. `animals`

**Purpose:** Owner-managed animal profile.

**Proposed columns:** `id UUID PK; owner_id UUID FK profiles.id; species_id UUID FK species.id; breed_id UUID FK breeds.id NULL; name TEXT; sex TEXT NULL; date_of_birth DATE NULL; approximate_age_months INTEGER NULL; color TEXT NULL; size TEXT NULL; temperament TEXT[] NULL; bio TEXT NULL; visibility TEXT; pet_status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 09. `pet_media`

**Purpose:** Pet profile image/media references.

**Proposed columns:** `id UUID PK; pet_id UUID FK animals.id; uploaded_by UUID FK profiles.id; storage_path TEXT; media_type TEXT; alt_text TEXT NULL; is_primary BOOLEAN DEFAULT false; sort_order INTEGER DEFAULT 0; created_at TIMESTAMPTZ.`

### 10. `pet_health_records`

**Purpose:** Private health/care history; not public by default.

**Proposed columns:** `id UUID PK; pet_id UUID FK animals.id; recorded_by UUID FK profiles.id; provider_profile_id UUID FK provider_profiles.id NULL; record_type TEXT; title TEXT; notes TEXT NULL; occurred_at TIMESTAMPTZ; document_path TEXT NULL; visibility TEXT DEFAULT private; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 11. `care_reminders`

**Purpose:** Owner-configured care reminders.

**Proposed columns:** `id UUID PK; pet_id UUID FK animals.id; created_by UUID FK profiles.id; reminder_type TEXT; title TEXT; due_at TIMESTAMPTZ; recurrence_rule TEXT NULL; reminder_status TEXT; completed_at TIMESTAMPTZ NULL; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 12. `posts`

**Purpose:** Community posts.

**Proposed columns:** `id UUID PK; author_id UUID FK profiles.id; pet_id UUID FK animals.id NULL; post_type TEXT; body TEXT NULL; visibility TEXT; moderation_status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ; deleted_at TIMESTAMPTZ NULL.`

### 13. `post_media`

**Purpose:** Post media objects.

**Proposed columns:** `id UUID PK; post_id UUID FK posts.id; storage_path TEXT; media_type TEXT; sort_order INTEGER DEFAULT 0; alt_text TEXT NULL; created_at TIMESTAMPTZ.`

### 14. `comments`

**Purpose:** Comments and threaded replies.

**Proposed columns:** `id UUID PK; post_id UUID FK posts.id; author_id UUID FK profiles.id; parent_id UUID FK comments.id NULL; body TEXT; status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ; deleted_at TIMESTAMPTZ NULL.`

### 15. `reactions`

**Purpose:** One user reaction per post unless product later supports reaction history.

**Proposed columns:** `id UUID PK; post_id UUID FK posts.id; user_id UUID FK profiles.id; reaction_type TEXT; created_at TIMESTAMPTZ; UNIQUE(post_id,user_id).`

### 16. `follows`

**Purpose:** User follow graph.

**Proposed columns:** `follower_id UUID FK profiles.id; following_id UUID FK profiles.id; created_at TIMESTAMPTZ; PK(follower_id,following_id); CHECK follower_id <> following_id.`

### 17. `bookmarks`

**Purpose:** Saved posts.

**Proposed columns:** `user_id UUID FK profiles.id; post_id UUID FK posts.id; created_at TIMESTAMPTZ; PK(user_id,post_id).`

### 18. `adoption_listings`

**Purpose:** Responsible adoption listings for a pet.

**Proposed columns:** `id UUID PK; pet_id UUID FK animals.id; owner_id UUID FK profiles.id; organization_id UUID FK organizations.id NULL; title TEXT; description TEXT; requirements JSONB; city TEXT NULL; area_label TEXT NULL; status TEXT; published_at TIMESTAMPTZ NULL; expires_at TIMESTAMPTZ NULL; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 19. `adoption_applications`

**Purpose:** Private applications; applicant and authorized listing owner only.

**Proposed columns:** `id UUID PK; listing_id UUID FK adoption_listings.id; applicant_id UUID FK profiles.id; motivation TEXT; answers JSONB; status TEXT; submitted_at TIMESTAMPTZ; updated_at TIMESTAMPTZ; UNIQUE(listing_id,applicant_id) unless approved re-application policy says otherwise.`

### 20. `application_events`

**Purpose:** Append-only adoption status history.

**Proposed columns:** `id UUID PK; application_id UUID FK adoption_applications.id; actor_id UUID FK profiles.id; from_status TEXT NULL; to_status TEXT; note TEXT NULL; created_at TIMESTAMPTZ.`

### 21. `lost_found_reports`

**Purpose:** Lost/found animal reports; may refer to a known pet or unknown animal.

**Proposed columns:** `id UUID PK; reporter_id UUID FK profiles.id; pet_id UUID FK animals.id NULL; report_type TEXT CHECK lost|found; species_id UUID FK species.id; breed_id UUID FK breeds.id NULL; title TEXT; description TEXT; color TEXT NULL; distinctive_features TEXT NULL; last_seen_at TIMESTAMPTZ NULL; area_label TEXT; approximate_location GEOGRAPHY(Point,4326) NULL; contact_preference TEXT; status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 22. `report_media`

**Purpose:** Media associated with lost/found reports.

**Proposed columns:** `id UUID PK; report_id UUID FK lost_found_reports.id; storage_path TEXT; media_type TEXT; created_at TIMESTAMPTZ.`

### 23. `sightings`

**Purpose:** Community sightings associated with a lost/found report.

**Proposed columns:** `id UUID PK; report_id UUID FK lost_found_reports.id; reporter_id UUID FK profiles.id; sighted_at TIMESTAMPTZ; area_label TEXT; approximate_location GEOGRAPHY(Point,4326) NULL; description TEXT; media_path TEXT NULL; created_at TIMESTAMPTZ.`

### 24. `lost_found_matches`

**Purpose:** General rule-based/manual match candidates and their human review lifecycle.

**Proposed columns:** `id UUID PK; source_report_id UUID FK lost_found_reports.id; target_report_id UUID FK lost_found_reports.id; similarity_score NUMERIC NULL; match_factors JSONB; review_status TEXT; reviewed_by UUID FK profiles.id NULL; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ; CHECK source_report_id <> target_report_id.`

### 25. `rescue_requests`

**Purpose:** Animal rescue intake and workflow.

**Proposed columns:** `id UUID PK; reporter_id UUID FK profiles.id; organization_id UUID FK organizations.id NULL; species_id UUID FK species.id NULL; description TEXT; urgency TEXT; area_label TEXT; approximate_location GEOGRAPHY(Point,4326) NULL; contact_preference TEXT; status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 26. `rescue_assignments`

**Purpose:** Assignment of a request to a rescuer or organization.

**Proposed columns:** `id UUID PK; request_id UUID FK rescue_requests.id; assignee_user_id UUID FK profiles.id NULL; organization_id UUID FK organizations.id NULL; assigned_by UUID FK profiles.id; assignment_status TEXT; assigned_at TIMESTAMPTZ; CHECK exactly one assignee_user_id or organization_id is set.`

### 27. `rescue_status_events`

**Purpose:** Append-only rescue status history.

**Proposed columns:** `id UUID PK; request_id UUID FK rescue_requests.id; actor_id UUID FK profiles.id; from_status TEXT NULL; to_status TEXT; note TEXT NULL; created_at TIMESTAMPTZ.`

### 28. `conversations`

**Purpose:** Direct, group or contextual conversations.

**Proposed columns:** `id UUID PK; conversation_type TEXT; created_by UUID FK profiles.id; related_listing_id UUID FK adoption_listings.id NULL; related_rescue_id UUID FK rescue_requests.id NULL; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 29. `conversation_members`

**Purpose:** Conversation membership and read state.

**Proposed columns:** `conversation_id UUID FK conversations.id; user_id UUID FK profiles.id; member_role TEXT NULL; joined_at TIMESTAMPTZ; last_read_at TIMESTAMPTZ NULL; PK(conversation_id,user_id).`

### 30. `messages`

**Purpose:** Private messages.

**Proposed columns:** `id UUID PK; conversation_id UUID FK conversations.id; sender_id UUID FK profiles.id; message_type TEXT; body TEXT NULL; created_at TIMESTAMPTZ; edited_at TIMESTAMPTZ NULL; deleted_at TIMESTAMPTZ NULL.`

### 31. `message_attachments`

**Purpose:** Private message media.

**Proposed columns:** `id UUID PK; message_id UUID FK messages.id; storage_path TEXT; media_type TEXT; created_at TIMESTAMPTZ.`

### 32. `notifications`

**Purpose:** User notifications; payload must be minimal and non-sensitive.

**Proposed columns:** `id UUID PK; recipient_id UUID FK profiles.id; actor_id UUID FK profiles.id NULL; notification_type TEXT; entity_type TEXT NULL; entity_id UUID NULL; payload JSONB; read_at TIMESTAMPTZ NULL; created_at TIMESTAMPTZ.`

### 33. `user_devices`

**Purpose:** Push-capable devices and tokens.

**Proposed columns:** `id UUID PK; user_id UUID FK profiles.id; platform TEXT CHECK web|android|ios; push_token TEXT UNIQUE; device_status TEXT; last_seen_at TIMESTAMPTZ NULL; created_at TIMESTAMPTZ.`

### 34. `provider_services`

**Purpose:** Services offered by a provider profile.

**Proposed columns:** `id UUID PK; provider_profile_id UUID FK provider_profiles.id; service_type TEXT; title TEXT; description TEXT NULL; price_description TEXT NULL; city TEXT NULL; is_active BOOLEAN DEFAULT true; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 35. `provider_reviews`

**Purpose:** Moderated provider reviews.

**Proposed columns:** `id UUID PK; provider_profile_id UUID FK provider_profiles.id; author_id UUID FK profiles.id; rating SMALLINT CHECK 1..5; review TEXT NULL; moderation_status TEXT; created_at TIMESTAMPTZ; UNIQUE(provider_profile_id,author_id) subject to review policy.`

### 36. `events`

**Purpose:** Pet/community events.

**Proposed columns:** `id UUID PK; organizer_id UUID FK profiles.id; organization_id UUID FK organizations.id NULL; title TEXT; description TEXT; event_type TEXT; approximate_location GEOGRAPHY(Point,4326) NULL; area_label TEXT NULL; starts_at TIMESTAMPTZ; ends_at TIMESTAMPTZ; capacity INTEGER NULL; event_status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 37. `event_attendees`

**Purpose:** Event RSVP records.

**Proposed columns:** `event_id UUID FK events.id; user_id UUID FK profiles.id; attendance_status TEXT; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ; PK(event_id,user_id).`

### 38. `user_blocks`

**Purpose:** User blocking relationship.

**Proposed columns:** `blocker_id UUID FK profiles.id; blocked_id UUID FK profiles.id; created_at TIMESTAMPTZ; PK(blocker_id,blocked_id); CHECK blocker_id <> blocked_id.`

### 39. `content_reports`

**Purpose:** Reports against polymorphic content/users.

**Proposed columns:** `id UUID PK; reporter_id UUID FK profiles.id; target_type TEXT; target_id UUID; reason TEXT; details TEXT NULL; report_status TEXT; assigned_moderator_id UUID FK profiles.id NULL; created_at TIMESTAMPTZ; updated_at TIMESTAMPTZ.`

### 40. `moderation_actions`

**Purpose:** Append-only moderation decisions/actions.

**Proposed columns:** `id UUID PK; moderator_id UUID FK profiles.id; target_type TEXT; target_id UUID; action_type TEXT; reason TEXT; expires_at TIMESTAMPTZ NULL; created_at TIMESTAMPTZ.`

### 41. `audit_logs`

**Purpose:** Security and administrative audit events.

**Proposed columns:** `id UUID PK; actor_id UUID FK profiles.id NULL; action TEXT; target_type TEXT; target_id UUID NULL; metadata JSONB; request_id TEXT NULL; created_at TIMESTAMPTZ.`

### 42. `ai_jobs`

**Purpose:** Asynchronous AI task metadata and minimal outputs.

**Proposed columns:** `id UUID PK; user_id UUID FK profiles.id NULL; task_type TEXT; target_type TEXT NULL; target_id UUID NULL; provider TEXT; model TEXT; job_status TEXT; input_hash TEXT NULL; result JSONB NULL; error_code TEXT NULL; created_at TIMESTAMPTZ; completed_at TIMESTAMPTZ NULL.`

### 43. `ai_match_candidates`

**Purpose:** AI-specific match candidates, provenance and model scoring; semantics overlap with lost_found_matches and require ADR.

**Proposed columns:** `id UUID PK; source_report_id UUID FK lost_found_reports.id; target_report_id UUID FK lost_found_reports.id; similarity_score NUMERIC; match_factors JSONB; model_name TEXT; ai_job_id UUID FK ai_jobs.id NULL; review_status TEXT; created_at TIMESTAMPTZ; CHECK source_report_id <> target_report_id.`


## Preserved unresolved design issues

1. `lost_found_matches` and `ai_match_candidates` overlap. Keep both in the archive; do not merge/delete without an ADR.
2. `content_reports.target_type + target_id` is polymorphic and cannot use a conventional FK as written. Decide on trigger validation or per-target nullable FKs.
3. Adoption application uniqueness and re-application policy need a product decision.
4. Exact retention/deletion policy for health records, messages and audit logs needs legal/privacy review.
5. Define what public `animals.visibility` and `posts.visibility` values mean consistently.
6. Define a transaction-safe rule for one pet being adopted once, and what happens to pending applications.
