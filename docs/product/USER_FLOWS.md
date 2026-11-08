# User Flows — KINNIPAW

## Account onboarding
1. User chooses Bangla or English.
2. User registers through Supabase Auth.
3. Email/OAuth verification completes.
4. Server ensures a profile record exists.
5. User chooses display name, username and optional approximate area.
6. User reviews privacy defaults and community guidelines.
7. User can create a pet or explore public content.

## Pet creation
1. Open My Animals → Add Pet.
2. Enter name, species, optional breed, sex, age/date of birth, color, temperament and bio.
3. Upload images through an authorized upload flow.
4. Images are validated, processed and stripped of EXIF/GPS metadata before public delivery.
5. Select public/followers/private visibility.
6. Save and view animal profile.

## Social post
1. Compose post and optionally attach a pet.
2. Choose visibility.
3. Validate text and media.
4. Apply spam/abuse controls and moderation policy.
5. Publish or hold for review depending on risk/policy.
6. Notify relevant followers only according to preferences and rate limits.

## Adoption listing
1. Eligible owner/organization selects a pet.
2. Create listing with requirements, description and generalized area.
3. Submit listing for review.
4. Moderator approves, rejects or requests changes with an audit record.
5. Approved listing becomes public.
6. Adopter submits application once per listing unless policy permits resubmission.
7. Owner/authorized organization reviews applicant details.
8. Status transition is performed through a transaction and event log.
9. Adoption is confirmed and listing closes; other applications are handled according to approved policy.

## Lost/found report and match
1. Reporter selects Lost or Found.
2. Add species, appearance, distinctive markings, date/time, approximate area and media.
3. Keep exact contact/location private.
4. Report is reviewed and published.
5. Users can submit sightings.
6. Matching service creates candidates using transparent rule factors; optional AI candidates are separate suggestions.
7. Reporter reviews candidate, contacts safely and confirms/dismisses.
8. Reunion is confirmed by an authorized participant; record outcome.

## Rescue request
1. Reporter provides animal situation, urgency, approximate area and optional media.
2. Server validates and applies rate limits.
3. Moderator/triage flow reviews high-risk or suspicious requests.
4. Eligible organization or rescuer is assigned.
5. Assignment is accepted/declined.
6. Authorized rescuer records status transitions and notes.
7. Request resolves with an outcome; exact private information remains restricted.

## Messaging
1. User initiates an eligible conversation (for example, listing inquiry).
2. Server checks target user, resource context, block status and messaging restrictions.
3. Conversation membership is established transactionally.
4. Realtime channel authorization checks membership.
5. Messages are stored with participant-only access.
6. Notifications contain minimal preview data.

## Account deletion
1. User requests deletion and re-authenticates where required.
2. User sees what will be deleted, anonymized or retained and why.
3. Account enters deletion workflow.
4. Personal data is erased or anonymized according to retention policy; legally/operationally required records are retained with minimization.
5. Storage objects, sessions and push tokens are removed/revoked.
6. Completion is recorded without retaining unnecessary personal details.
