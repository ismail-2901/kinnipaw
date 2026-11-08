-- KINNIPAW — Gate M2 Migration: Identity, RBAC, Taxonomy, Animals, and Health Records
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-016, ADR-020, ADR-026

BEGIN;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & CONSTRAINTS HELPERS
-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_path TEXT NULL,
  bio TEXT NULL,
  preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('en', 'bn')),
  city TEXT NULL,
  area_label TEXT NULL,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
BEGIN
  base_username := SPLIT_PART(NEW.email, '@', 1);
  clean_username := LOWER(REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  
  -- Ensure username is unique if collision occurs
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) THEN
    clean_username := clean_username || '_' || SUBSTRING(NEW.id::text, 1, 6);
  END IF;

  INSERT INTO public.profiles (id, username, display_name, preferred_locale)
  VALUES (
    NEW.id,
    clean_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', clean_username),
    COALESCE(NEW.raw_user_meta_data->>'preferred_locale', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. NORMALIZED RBAC TABLES (ADR-016)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role_id)
);

-- 5. ANIMAL TAXONOMY (ADR-026: Expandable Taxonomy)
CREATE TABLE IF NOT EXISTS public.species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_domestic BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  jurisdiction_notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.breeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(species_id, slug)
);

-- 6. ANIMAL PROFILES
CREATE TABLE IF NOT EXISTS public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  species_id UUID NOT NULL REFERENCES public.species(id),
  breed_id UUID REFERENCES public.breeds(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female', 'unknown')),
  date_of_birth DATE NULL,
  approximate_age_months INTEGER NULL,
  color_description TEXT NULL,
  size_category TEXT CHECK (size_category IN ('tiny', 'small', 'medium', 'large', 'extra_large')),
  temperament_tags TEXT[] NULL,
  bio TEXT NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  animal_status TEXT DEFAULT 'active' CHECK (animal_status IN ('active', 'lost', 'found', 'adopted', 'deceased')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_animals_updated_at
BEFORE UPDATE ON public.animals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. ANIMAL MEDIA (EXIF-stripped before upload)
CREATE TABLE IF NOT EXISTS public.animal_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  storage_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  alt_text TEXT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. HEALTH AND CARE RECORDS
CREATE TABLE IF NOT EXISTS public.animal_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  provider_name TEXT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('checkup', 'surgery', 'diagnosis', 'test', 'other')),
  title TEXT NOT NULL,
  notes TEXT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  document_path TEXT NULL,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'owner_only')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_animal_health_records_updated_at
BEFORE UPDATE ON public.animal_health_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  provider_name TEXT NULL,
  vaccine_name TEXT NOT NULL,
  administered_date DATE NOT NULL,
  next_due_date DATE NULL,
  batch_number TEXT NULL,
  notes TEXT NULL,
  document_path TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  medication_name TEXT NOT NULL,
  dosage_description TEXT NULL,
  frequency TEXT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  prescribing_provider_name TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.care_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('vaccination', 'medication', 'checkup', 'grooming', 'other')),
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false NOT NULL,
  recurrence_interval_days INTEGER NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_animals_owner ON public.animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON public.animals(species_id);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals(animal_status);
CREATE INDEX IF NOT EXISTS idx_animal_media_animal ON public.animal_media(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal ON public.animal_health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_animal ON public.vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_medications_animal ON public.medications(animal_id);
CREATE INDEX IF NOT EXISTS idx_care_reminders_animal_due ON public.care_reminders(animal_id, due_date);

-- 10. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_reminders ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone if active"
ON public.profiles FOR SELECT
USING (account_status = 'active' OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ROLES & PERMISSIONS (read by authenticated, modified only by super_admin)
CREATE POLICY "Roles viewable by authenticated users"
ON public.roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permissions viewable by authenticated users"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Role permissions viewable by authenticated users"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "User role assignments viewable by user or admin"
ON public.user_role_assignments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SPECIES & BREEDS (publicly readable, admin managed)
CREATE POLICY "Species viewable by public"
ON public.species FOR SELECT
USING (is_active = true);

CREATE POLICY "Breeds viewable by public"
ON public.breeds FOR SELECT
USING (true);

-- ANIMALS
CREATE POLICY "Public animals are viewable by everyone"
ON public.animals FOR SELECT
USING (visibility = 'public' OR auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create animals"
ON public.animals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their animals"
ON public.animals FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their animals"
ON public.animals FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- ANIMAL MEDIA
CREATE POLICY "Media viewable if animal is viewable"
ON public.animal_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_media.animal_id
    AND (animals.visibility = 'public' OR animals.owner_id = auth.uid())
  )
);

CREATE POLICY "Owners can insert media for their animals"
ON public.animal_media FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_media.animal_id
    AND animals.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update/delete media for their animals"
ON public.animal_media FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_media.animal_id
    AND animals.owner_id = auth.uid()
  )
);

-- HEALTH RECORDS (Strictly private to animal owner)
CREATE POLICY "Health records readable only by animal owner"
ON public.animal_health_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_health_records.animal_id
    AND animals.owner_id = auth.uid()
  )
);

CREATE POLICY "Health records insertable only by animal owner"
ON public.animal_health_records FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = recorded_by AND
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_health_records.animal_id
    AND animals.owner_id = auth.uid()
  )
);

CREATE POLICY "Health records modifiable only by animal owner"
ON public.animal_health_records FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = animal_health_records.animal_id
    AND animals.owner_id = auth.uid()
  )
);

-- VACCINATIONS
CREATE POLICY "Vaccinations readable only by animal owner"
ON public.vaccinations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = vaccinations.animal_id
    AND animals.owner_id = auth.uid()
  )
);

CREATE POLICY "Vaccinations manageable only by animal owner"
ON public.vaccinations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = vaccinations.animal_id
    AND animals.owner_id = auth.uid()
  )
);

-- MEDICATIONS
CREATE POLICY "Medications readable only by animal owner"
ON public.medications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = medications.animal_id
    AND animals.owner_id = auth.uid()
  )
);

CREATE POLICY "Medications manageable only by animal owner"
ON public.medications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.animals
    WHERE animals.id = medications.animal_id
    AND animals.owner_id = auth.uid()
  )
);

-- CARE REMINDERS
CREATE POLICY "Reminders readable only by creator"
ON public.care_reminders FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Reminders manageable only by creator"
ON public.care_reminders FOR ALL
TO authenticated
USING (auth.uid() = created_by);

COMMIT;
