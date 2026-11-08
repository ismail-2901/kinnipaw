# KINNIPAW — Local Demonstration & Verification Guide

The KINNIPAW ecosystem is running live on your local machine.

- **Web Application URL:** [http://localhost:3000](http://localhost:3000)
- **Sign In Page:** [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
- **Supabase Local Stack:** [http://127.0.0.1:54321](http://127.0.0.1:54321)

---

## Demo Accounts & Test Credentials

All accounts are seeded and ready for instant login with password: `password123`

| Role | Email | Password | Assigned Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kinnipaw.local` | `password123` | Full governance, audit logs (`/admin/audit-logs`), reports oversight |
| **Moderator** | `moderator@kinnipaw.local` | `password123` | Moderation dashboard (`/admin/reports`), content review |
| **Rescuer** | `rescuer.rahat@kinnipaw.local` | `password123` | Rescue case triage (`/rescue`), animal guardianship (`/animals`) |
| **Adopter** | `adopter.nusrat@kinnipaw.local` | `password123` | Lawful adoption browsing (`/adoption`), care records, community feed |
| **Veterinarian** | `vet.arif@kinnipaw.local` | `password123` | Verified provider listing (`/providers`), health tips (`/feed`) |

---

## Live Product Tour

1. **Sign In (`/sign-in`):**
   - Enter `admin@kinnipaw.local` and `password123`.
   - Click **Sign In** to authenticate and redirect to your animal management dashboard.

2. **Animal Guardianship & Care (`/animals`):**
   - View registered animals ("Bagha", "Mini", "Bunny").
   - Inspect health timelines, vaccinations, and due date reminders.
   - Register a new animal with size, color, species taxonomy, and photo metadata.

3. **Community Feed (`/feed`):**
   - Read community updates, care advice, and rescue milestones.
   - Post care tips and comment on community discussions.

4. **Lawful Adoption (`/adoption`):**
   - Browse eligible domestic companion animal listings.
   - View strict legal compliance safeguards (Wildlife Act 2026 prohibitions on protected wildlife).
   - Submit and review adoption applications with zero commercial fees.

5. **Lost & Found (`/lost-found`):**
   - View privacy-preserving lost and found animal sightings.
   - Demonstrates coarse neighborhood-level location display (`Dhanmondi, Dhaka`) without disclosing exact home addresses.

6. **Rescue Coordination (`/rescue`):**
   - Triage active rescue cases by urgency (critical, high, medium).
   - Assign qualified rescuers and track dispatch status.

7. **Care Assistant (`/care-assistant`):**
   - AI-powered triage and symptom inquiry.
   - Demonstrates veterinary safety disclaimers, urgent distress emergency banners, and provider referral.

8. **Admin & Moderation (`/admin`):**
   - Review platform audit logs, moderation cases, and user access state.
