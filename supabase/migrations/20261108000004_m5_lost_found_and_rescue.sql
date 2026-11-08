-- KINNIPAW — Gate M5 Migration: Lost & Found, Sightings, and Rescue Coordination
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-014, ADR-026, AGENTS.md §6 & §16 (Location privacy & Wildlife safety)

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. LOST & FOUND POSTS
CREATE TABLE IF NOT EXISTS public.lost_found_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  animal_id UUID NULL REFERENCES public.animals(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('lost', 'found')),
  species_id UUID NOT NULL REFERENCES public.species(id),
  description TEXT NOT NULL,
  last_seen_area_label TEXT NULL,
  last_seen_location GEOGRAPHY(Point, 4326) NULL,
  incident_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  resolved_by UUID NULL REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ NULL,
  media_paths TEXT[] NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_lost_found_posts_updated_at
BEFORE UPDATE ON public.lost_found_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. LOST & FOUND SIGHTINGS
CREATE TABLE IF NOT EXISTS public.lost_found_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_found_post_id UUID NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sighting_area_label TEXT NULL,
  sighting_location GEOGRAPHY(Point, 4326) NULL,
  sighting_date DATE NOT NULL,
  notes TEXT NULL,
  media_paths TEXT[] NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. LOST & FOUND MATCHES
CREATE TABLE IF NOT EXISTS public.lost_found_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_post_id UUID NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  found_post_id UUID NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  ai_match_candidate_id UUID NULL,
  match_status TEXT DEFAULT 'user_reported' CHECK (match_status IN ('ai_suggested', 'user_reported', 'confirmed', 'rejected')),
  confirmed_by UUID NULL REFERENCES public.profiles(id),
  confirmed_at TIMESTAMPTZ NULL,
  confidence_score NUMERIC(4,3) NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. RESCUE CASES
CREATE TABLE IF NOT EXISTS public.rescue_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NULL,
  species_id UUID NOT NULL REFERENCES public.species(id),
  description TEXT NOT NULL,
  location_area_label TEXT NULL,
  location GEOGRAPHY(Point, 4326) NULL,
  case_status TEXT DEFAULT 'open' CHECK (case_status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  is_wildlife BOOLEAN DEFAULT FALSE,
  media_paths TEXT[] NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_rescue_cases_updated_at
BEFORE UPDATE ON public.rescue_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. RESCUE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.rescue_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id UUID NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assignment_status TEXT DEFAULT 'active' CHECK (assignment_status IN ('active', 'completed', 'declined', 'reassigned')),
  notes TEXT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_rescue_assignments_updated_at
BEFORE UPDATE ON public.rescue_assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. RESCUE STATUS EVENTS (Immutable audit trail)
CREATE TABLE IF NOT EXISTS public.rescue_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id UUID NOT NULL REFERENCES public.rescue_cases(id) ON DELETE CASCADE,
  from_status TEXT NULL,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to record rescue status transitions automatically
CREATE OR REPLACE FUNCTION record_rescue_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.case_status IS DISTINCT FROM NEW.case_status THEN
    INSERT INTO public.rescue_status_events (rescue_case_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.case_status, NEW.case_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_rescue_status_events
AFTER UPDATE ON public.rescue_cases
FOR EACH ROW EXECUTE FUNCTION record_rescue_status_change();

-- 7. PERFORMANCE & GEOSPATIAL INDEXES
CREATE INDEX IF NOT EXISTS idx_lost_found_posts_status ON public.lost_found_posts(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_posts_type ON public.lost_found_posts(report_type);
CREATE INDEX IF NOT EXISTS idx_lost_found_posts_species ON public.lost_found_posts(species_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_posts_reporter ON public.lost_found_posts(reporter_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_sightings_post ON public.lost_found_sightings(lost_found_post_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_status ON public.rescue_cases(case_status);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_urgency ON public.rescue_cases(urgency);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_species ON public.rescue_cases(species_id);
CREATE INDEX IF NOT EXISTS idx_rescue_assignments_case ON public.rescue_assignments(rescue_case_id);
CREATE INDEX IF NOT EXISTS idx_rescue_assignments_assigned_to ON public.rescue_assignments(assigned_to);

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.lost_found_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_status_events ENABLE ROW LEVEL SECURITY;

-- LOST & FOUND POSTS POLICIES
CREATE POLICY "Lost & found posts viewable by everyone"
ON public.lost_found_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create lost/found posts"
ON public.lost_found_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can update own lost/found posts"
ON public.lost_found_posts FOR UPDATE
TO authenticated
USING (auth.uid() = reporter_id)
WITH CHECK (auth.uid() = reporter_id);

-- SIGHTINGS POLICIES
CREATE POLICY "Sightings viewable by authenticated users"
ON public.lost_found_sightings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can submit sightings"
ON public.lost_found_sightings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

-- MATCHES POLICIES
CREATE POLICY "Matches viewable by post owners"
ON public.lost_found_matches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lost_found_posts p
    WHERE (p.id = lost_post_id OR p.id = found_post_id) AND p.reporter_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can submit matches"
ON public.lost_found_matches FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Post owners can confirm/reject matches"
ON public.lost_found_matches FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lost_found_posts p
    WHERE (p.id = lost_post_id OR p.id = found_post_id) AND p.reporter_id = auth.uid()
  )
);

-- RESCUE CASES POLICIES
CREATE POLICY "Rescue cases viewable by authenticated users"
ON public.rescue_cases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can report rescue cases"
ON public.rescue_cases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Reporters or assigned volunteers can update rescue cases"
ON public.rescue_cases FOR UPDATE
TO authenticated
USING (
  auth.uid() = reported_by OR
  EXISTS (
    SELECT 1 FROM public.rescue_assignments ra
    WHERE ra.rescue_case_id = id AND ra.assigned_to = auth.uid()
  )
);

-- RESCUE ASSIGNMENTS POLICIES
CREATE POLICY "Rescue assignments viewable by involved users"
ON public.rescue_assignments FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid() OR
  assigned_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.rescue_cases rc
    WHERE rc.id = rescue_case_id AND rc.reported_by = auth.uid()
  )
);

CREATE POLICY "Authenticated users can volunteer / assign"
ON public.rescue_assignments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE POLICY "Assignees can update assignment status"
ON public.rescue_assignments FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- RESCUE STATUS EVENTS POLICIES
CREATE POLICY "Rescue events viewable by involved users"
ON public.rescue_status_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rescue_cases rc
    WHERE rc.id = rescue_status_events.rescue_case_id
    AND (
      rc.reported_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.rescue_assignments ra
        WHERE ra.rescue_case_id = rc.id AND ra.assigned_to = auth.uid()
      )
    )
  )
);

COMMIT;
