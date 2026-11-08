-- KINNIPAW — Comprehensive Local Development & Demonstration Seed Data
-- Status: 100% Synthetic, Non-Sensitive Development Data
-- Governing ADRs: ADR-013, ADR-016, ADR-023, ADR-026

BEGIN;

-- 1. SEED DEFAULT ROLES
INSERT INTO public.roles (id, name, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user', 'Standard registered guardian, adopter, or volunteer'),
  ('a0000000-0000-0000-0000-000000000002', 'moderator', 'Community moderator with content review privileges'),
  ('a0000000-0000-0000-0000-000000000003', 'admin', 'Platform administrator with operations management privileges'),
  ('a0000000-0000-0000-0000-000000000004', 'super_admin', 'System super-administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED DEFAULT PERMISSIONS
INSERT INTO public.permissions (id, name, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'adoption.review', 'Review and approve adoption applications'),
  ('b0000000-0000-0000-0000-000000000002', 'content.moderate', 'Hide, unhide, and review flagged posts and comments'),
  ('b0000000-0000-0000-0000-000000000003', 'rescue.coordinate', 'Assign and manage rescue cases'),
  ('b0000000-0000-0000-0000-000000000004', 'user.suspend', 'Suspend or reinstate user accounts')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED ROLE PERMISSIONS
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. SEED SPECIES (ADR-026: Expandable Taxonomy MVP Direction)
INSERT INTO public.species (id, name, slug, is_domestic, is_active, jurisdiction_notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Dog', 'dog', true, true, 'Domestic dog. Full adoption and care features enabled.'),
  ('c0000000-0000-0000-0000-000000000002', 'Cat', 'cat', true, true, 'Domestic cat. Full adoption and care features enabled.'),
  ('c0000000-0000-0000-0000-000000000003', 'Bird', 'bird', true, true, 'Domestic/captive birds only. Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026) applies; native wild species strictly prohibited from trade and adoption.'),
  ('c0000000-0000-0000-0000-000000000004', 'Rabbit', 'rabbit', true, true, 'Domestic rabbit. Full care and adoption enabled.'),
  ('c0000000-0000-0000-0000-000000000005', 'Small Mammal', 'small-mammal', true, true, 'Hamsters, guinea pigs, etc. Domestic only.'),
  ('c0000000-0000-0000-0000-000000000006', 'Fish', 'fish', true, true, 'Ornamental freshwater/marine fish only.'),
  ('c0000000-0000-0000-0000-000000000007', 'Reptile', 'reptile', false, true, 'Wild native reptiles prohibited from listing under Wildlife Act 2026; uncertain classifications restricted.')
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED COMMON BREEDS
INSERT INTO public.breeds (id, species_id, name, slug) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Deshi / Native Mixed', 'deshi-mixed'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'German Shepherd', 'german-shepherd'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Golden Retriever', 'golden-retriever'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Labrador Retriever', 'labrador-retriever'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Spitz', 'spitz'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Pug', 'pug'),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'Deshi / Domestic Shorthair', 'deshi-shorthair'),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'Persian', 'persian'),
  ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000002', 'Siamese', 'siamese'),
  ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000002', 'British Shorthair', 'british-shorthair')
ON CONFLICT (species_id, slug) DO NOTHING;

-- 6. SEED SYNTHETIC PROFILES FOR LOCAL DEMONSTRATION
INSERT INTO public.profiles (id, username, display_name, bio, city, district, area_label, preferred_locale, is_verified, account_status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'admin_kinnipaw', 'Platform Operations Admin', 'Administrator managing governance, animal welfare oversight, and audit logs.', 'Dhaka', 'Dhaka', 'Dhanmondi, Dhaka', 'en', true, 'active'),
  ('e0000000-0000-0000-0000-000000000002', 'moderator_shuvo', 'Shuvo Moderator', 'Community safety moderator reviewing content reports and adoption authenticity.', 'Dhaka', 'Dhaka', 'Gulshan, Dhaka', 'bn', true, 'active'),
  ('e0000000-0000-0000-0000-000000000003', 'rescuer_rahat', 'Rahat Chowdhury', 'Independent rescuer and foster parent for stray animals across Dhaka.', 'Dhaka', 'Dhaka', 'Mirpur-10, Dhaka', 'bn', true, 'active'),
  ('e0000000-0000-0000-0000-000000000004', 'adopter_nusrat', 'Nusrat Jahan', 'Animal guardian and responsible adopter.', 'Dhaka', 'Dhaka', 'Uttara, Dhaka', 'en', false, 'active'),
  ('e0000000-0000-0000-0000-000000000005', 'vet_arif', 'Dr. Arifur Rahman, DVM', 'Certified veterinary surgeon specializing in small companion animals.', 'Dhaka', 'Dhaka', 'Mohammadpur, Dhaka', 'bn', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. SEED USER ROLES
INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'), -- Admin
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'), -- Moderator
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'), -- Rescuer
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'), -- Adopter
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001')  -- Vet
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 8. SEED SYNTHETIC ANIMALS
INSERT INTO public.animals (id, owner_id, species_id, breed_id, name, sex, size_category, color_description, bio, status, visibility) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Bagha', 'male', 'medium', 'Golden brown with white chest', 'Rescued Deshi dog, vaccinated and healthy. Friendly with people and other animals.', 'active', 'public'),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000011', 'Mini', 'female', 'small', 'Calico tricolor', 'Playful domestic shorthair kitten looking for a permanent loving indoor home.', 'active', 'public'),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', NULL, 'Bunny', 'female', 'small', 'Pure white', 'Gentle indoor domestic rabbit. Loves fresh greens.', 'active', 'public')
ON CONFLICT (id) DO NOTHING;

-- 9. SEED CARE RECORDS & VACCINATIONS
INSERT INTO public.vaccinations (id, animal_id, vaccine_name, administered_at, expires_at, batch_number, veterinarian_name, clinic_name) VALUES
  ('11000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Rabies Booster (Rabisin)', '2026-03-15', '2027-03-15', 'RAB-2026-99', 'Dr. Arifur Rahman', 'Central Vet Clinic Dhaka'),
  ('11000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'Feline Tricat Trio', '2026-05-10', '2027-05-10', 'TRI-2026-14', 'Dr. Arifur Rahman', 'Central Vet Clinic Dhaka')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.care_reminders (id, animal_id, title, reminder_type, due_date, status) VALUES
  ('12000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Annual Rabies Vaccination Renewal', 'vaccination', '2027-03-15', 'pending'),
  ('12000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'Quarterly Deworming Dose', 'medication', '2026-12-01', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED COMMUNITY POSTS & COMMENTS
INSERT INTO public.posts (id, author_id, body, post_type, visibility, is_published) VALUES
  ('21000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Happy update! Bagha has completed all rabies booster vaccinations and is thriving. Thank you to everyone who supported his rescue!', 'story', 'public', true),
  ('21000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'Veterinary health reminder for pet guardians in Bangladesh: Ensure your cats and dogs always have fresh water available in warm weather to prevent heat stress.', 'general', 'public', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (id, post_id, author_id, body) VALUES
  ('22000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'So wonderful to see Bagha looking happy and healthy!')
ON CONFLICT (id) DO NOTHING;

-- 11. SEED ADOPTION LISTINGS
INSERT INTO public.adoption_listings (id, animal_id, listed_by, listing_status, description, adoption_requirements) VALUES
  ('31000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'active', 'Mini is a healthy 4-month-old calico kitten. Playful, litter-trained, and affectionate.', 'Indoor-only home in Dhaka, agreement for post-adoption check-in, commitment to lifelong veterinary care. Zero adoption fees.')
ON CONFLICT (id) DO NOTHING;

-- 12. SEED LOST & FOUND POSTS (With Privacy-Preserving Coarse Labels)
INSERT INTO public.lost_found_posts (id, reporter_id, species_id, report_type, status, description, last_seen_area_label, incident_date) VALUES
  ('41000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'lost', 'active', 'Ginger domestic cat missing near Dhanmondi Lake area. Wearing a blue collar with small bell.', 'Dhanmondi, Dhaka', '2026-11-06T15:00:00Z'),
  ('41000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'found', 'active', 'Spitz mix dog found wandering near Gulshan-2 circle. Well-groomed, gentle temperament.', 'Gulshan-2, Dhaka', '2026-11-07T10:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- 13. SEED RESCUE CASES
INSERT INTO public.rescue_cases (id, reporter_id, species_id, urgency, case_status, is_wildlife, location_area_label, description) VALUES
  ('51000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'high', 'open', false, 'Mirpur-10, Dhaka', 'Injured stray dog with severe paw cut near Mirpur-10 roundabout. Rescuer on scene seeking veterinary clinic transport assistance.')
ON CONFLICT (id) DO NOTHING;

-- 14. SEED CARE PROVIDERS
INSERT INTO public.provider_profiles (id, profile_id, business_name, provider_type, description, district, thana, rating_average, rating_count, is_verified) VALUES
  ('61000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Central Vet Clinic Dhaka', 'veterinary_clinic', 'Full-service veterinary hospital offering surgery, digital radiography, routine vaccinations, and emergency inpatient care.', 'Dhaka', 'Mohammadpur', 4.9, 38, true)
ON CONFLICT (id) DO NOTHING;

-- 15. SEED AUDIT LOG
INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'system_seed_initialized', 'system', '00000000-0000-0000-0000-000000000000', '{"environment": "local_development", "version": "1.0.0", "notes": "Synthetic demonstration dataset loaded successfully."}')
ON CONFLICT DO NOTHING;

COMMIT;
