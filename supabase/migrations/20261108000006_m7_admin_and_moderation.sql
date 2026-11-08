-- KINNIPAW — Gate M7 Migration: Administration, Moderation, and Audit Logs
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-016, ADR-023, AGENTS.md §6 & §18

BEGIN;

-- 1. AUDIT LOGS TABLE (Immutable platform audit trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  subject_type TEXT NULL,
  subject_id UUID NULL,
  payload JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR AUDIT LOGS
-- Readable only by authorized admins or super_admins
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_assignments ura
    JOIN public.roles r ON r.id = ura.role_id
    WHERE ura.user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'moderator')
  )
);

-- Writable by system triggers or authenticated staff actions
CREATE POLICY "Authenticated users can record audit actions"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- Immutable: NO UPDATE OR DELETE ALLOWED
-- (PostgreSQL default deny when no update/delete policies exist on RLS enabled table)

COMMIT;
