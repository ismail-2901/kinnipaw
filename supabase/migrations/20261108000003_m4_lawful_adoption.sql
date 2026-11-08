-- KINNIPAW — Gate M4 Migration: Lawful Adoption and Rehoming
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-026, AGENTS.md §14 (Species & Jurisdiction Safety)

BEGIN;

-- 1. ADOPTION LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.adoption_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  listed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NULL,
  listing_status TEXT DEFAULT 'draft' CHECK (listing_status IN ('draft', 'active', 'paused', 'closed', 'adopted')),
  description TEXT NULL,
  adoption_requirements TEXT NULL,
  fee_description TEXT NULL,
  listed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_adoption_listings_updated_at
BEFORE UPDATE ON public.adoption_listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. ADOPTION APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.adoption_listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_status TEXT DEFAULT 'submitted' CHECK (application_status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  answers JSONB NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_adoption_applications_updated_at
BEFORE UPDATE ON public.adoption_applications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. ADOPTION STATUS HISTORY (Immutable audit trail)
CREATE TABLE IF NOT EXISTS public.adoption_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.adoption_applications(id) ON DELETE CASCADE,
  from_status TEXT NULL,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to record application status transitions automatically
CREATE OR REPLACE FUNCTION record_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.application_status IS DISTINCT FROM NEW.application_status THEN
    INSERT INTO public.adoption_status_history (application_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.application_status, NEW.application_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_adoption_status_history
AFTER UPDATE ON public.adoption_applications
FOR EACH ROW EXECUTE FUNCTION record_adoption_status_change();

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_adoption_listings_status ON public.adoption_listings(listing_status);
CREATE INDEX IF NOT EXISTS idx_adoption_listings_animal ON public.adoption_listings(animal_id);
CREATE INDEX IF NOT EXISTS idx_adoption_listings_listed_by ON public.adoption_listings(listed_by);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_listing ON public.adoption_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_applicant ON public.adoption_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_adoption_history_app ON public.adoption_status_history(application_id);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.adoption_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_status_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- ADOPTION LISTINGS
CREATE POLICY "Active adoption listings viewable by everyone"
ON public.adoption_listings FOR SELECT
USING (listing_status = 'active' OR listed_by = auth.uid());

CREATE POLICY "Authenticated users can create adoption listings"
ON public.adoption_listings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = listed_by AND
  EXISTS (
    SELECT 1 FROM public.animals a
    JOIN public.species s ON s.id = a.species_id
    WHERE a.id = adoption_listings.animal_id
    AND a.owner_id = auth.uid()
    AND s.is_domestic = true -- AGENTS.md §14: Prohibit adoption listing of non-domestic/protected wildlife
  )
);

CREATE POLICY "Owners can update own adoption listings"
ON public.adoption_listings FOR UPDATE
TO authenticated
USING (auth.uid() = listed_by)
WITH CHECK (auth.uid() = listed_by);

-- ADOPTION APPLICATIONS
CREATE POLICY "Applications viewable by applicant and lister"
ON public.adoption_applications FOR SELECT
TO authenticated
USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.adoption_listings al
    WHERE al.id = adoption_applications.listing_id AND al.listed_by = auth.uid()
  )
);

CREATE POLICY "Authenticated users can submit adoption applications"
ON public.adoption_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Lister or applicant can update application status"
ON public.adoption_applications FOR UPDATE
TO authenticated
USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.adoption_listings al
    WHERE al.id = adoption_applications.listing_id AND al.listed_by = auth.uid()
  )
);

-- ADOPTION STATUS HISTORY
CREATE POLICY "History viewable by applicant and lister"
ON public.adoption_status_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adoption_applications aa
    JOIN public.adoption_listings al ON al.id = aa.listing_id
    WHERE aa.id = adoption_status_history.application_id
    AND (aa.applicant_id = auth.uid() OR al.listed_by = auth.uid())
  )
);

COMMIT;
