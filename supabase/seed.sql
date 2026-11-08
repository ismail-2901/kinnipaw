-- KINNIPAW — Seed Data for M2 (Taxonomy, RBAC Seeds)
-- Status: Deterministic non-sensitive development data per MIGRATIONS.md
-- Governing ADRs: ADR-016, ADR-026

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
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'), -- moderator -> content.moderate
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'), -- admin -> adoption.review
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002'), -- admin -> content.moderate
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'), -- admin -> rescue.coordinate
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. SEED SPECIES (ADR-026: Expandable Taxonomy MVP Direction)
INSERT INTO public.species (id, name, slug, is_domestic, is_active, jurisdiction_notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Dog', 'dog', true, true, 'Domestic dog. Full adoption and care features enabled.'),
  ('c0000000-0000-0000-0000-000000000002', 'Cat', 'cat', true, true, 'Domestic cat. Full adoption and care features enabled.'),
  ('c0000000-0000-0000-0000-000000000003', 'Bird', 'bird', true, true, 'Domestic/captive birds only. Bangladesh Wildlife Act 2012 applies; native wild species strictly prohibited from trade.'),
  ('c0000000-0000-0000-0000-000000000004', 'Rabbit', 'rabbit', true, true, 'Domestic rabbit. Full care and adoption enabled.'),
  ('c0000000-0000-0000-0000-000000000005', 'Small Mammal', 'small-mammal', true, true, 'Hamsters, guinea pigs, etc. Domestic only.'),
  ('c0000000-0000-0000-0000-000000000006', 'Fish', 'fish', true, true, 'Ornamental freshwater/marine fish only.'),
  ('c0000000-0000-0000-0000-000000000007', 'Reptile', 'reptile', false, true, 'Non-protected domestic reptiles. Wild native reptiles prohibited from commercial listing.')
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED COMMON BREEDS
-- Dog Breeds
INSERT INTO public.breeds (id, species_id, name, slug) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Deshi / Native Mixed', 'deshi-mixed'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'German Shepherd', 'german-shepherd'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Golden Retriever', 'golden-retriever'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Labrador Retriever', 'labrador-retriever'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Spitz', 'spitz'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Pug', 'pug')
ON CONFLICT (species_id, slug) DO NOTHING;

-- Cat Breeds
INSERT INTO public.breeds (id, species_id, name, slug) VALUES
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'Deshi / Domestic Shorthair', 'deshi-shorthair'),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'Persian', 'persian'),
  ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000002', 'Siamese', 'siamese'),
  ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000002', 'British Shorthair', 'british-shorthair')
ON CONFLICT (species_id, slug) DO NOTHING;

COMMIT;
