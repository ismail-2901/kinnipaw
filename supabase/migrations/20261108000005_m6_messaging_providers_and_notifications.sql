-- KINNIPAW — Gate M6 Migration: Messaging, Providers, Organizations, and Notifications
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-014, ADR-017, AGENTS.md §6 & §16

BEGIN;

-- 1. ORGANIZATIONS & MEMBERS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organization_type TEXT DEFAULT 'rescue' CHECK (organization_type IN ('rescue', 'clinic', 'community', 'adoption_centre', 'other')),
  description TEXT NULL,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'suspended')),
  public_email TEXT NULL,
  public_phone TEXT NULL,
  city TEXT NULL,
  area_label TEXT NULL,
  service_area GEOGRAPHY(Point,4326) NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_role TEXT DEFAULT 'member' CHECK (org_role IN ('owner', 'admin', 'member', 'vet')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_org_member UNIQUE(organization_id, user_id)
);

-- 2. PROVIDER PROFILES
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('veterinarian', 'groomer', 'trainer', 'boarding', 'clinic', 'other')),
  public_name TEXT NOT NULL,
  vet_credentials JSONB NULL,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'suspended')),
  public_address TEXT NULL,
  service_area GEOGRAPHY(Point,4326) NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_provider_anchor CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);

CREATE TRIGGER trg_provider_profiles_updated_at
BEFORE UPDATE ON public.provider_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT NULL,
  price_range_description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NULL,
  is_visible BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_provider_review UNIQUE(provider_profile_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_status TEXT DEFAULT 'pending' CHECK (appointment_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  requested_at TIMESTAMPTZ NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. CONVERSATIONS & MESSAGING
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_conversation_member UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'document')),
  file_size_bytes INTEGER NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. NOTIFICATIONS & DEVICE TOKENS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  payload JSONB NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_device_token UNIQUE(user_id, token)
);

CREATE TRIGGER trg_device_tokens_updated_at
BEFORE UPDATE ON public.device_tokens
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE NOT NULL,
  push_notifications BOOLEAN DEFAULT TRUE NOT NULL,
  adoption_alerts BOOLEAN DEFAULT TRUE NOT NULL,
  rescue_alerts BOOLEAN DEFAULT TRUE NOT NULL,
  care_reminders BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_type ON public.provider_profiles(provider_type);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user ON public.provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON public.provider_services(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider ON public.provider_reviews(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON public.appointments(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON public.device_tokens(user_id);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Organizations
CREATE POLICY "Organizations viewable by everyone"
ON public.organizations FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Providers
CREATE POLICY "Provider profiles viewable by everyone"
ON public.provider_profiles FOR SELECT USING (true);

CREATE POLICY "Providers can manage own profile"
ON public.provider_profiles FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Provider services viewable by everyone"
ON public.provider_services FOR SELECT USING (true);

CREATE POLICY "Provider reviews viewable if visible"
ON public.provider_reviews FOR SELECT
USING (is_visible = true OR reviewer_id = auth.uid());

CREATE POLICY "Users can create review"
ON public.provider_reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

-- Appointments
CREATE POLICY "Appointments viewable by requester or provider"
ON public.appointments FOR SELECT TO authenticated
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = appointments.provider_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can request appointments"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Parties can update appointment status"
ON public.appointments FOR UPDATE TO authenticated
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = appointments.provider_profile_id AND p.user_id = auth.uid()
  )
);

-- Conversations & Messages
CREATE POLICY "Conversations viewable by members"
ON public.conversations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Members viewable by conversation members"
ON public.conversation_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Messages viewable by conversation members"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()
  )
);

-- Notifications
CREATE POLICY "Notifications viewable only by recipient"
ON public.notifications FOR SELECT TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Recipient can update notification read state"
ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Device Tokens & Preferences
CREATE POLICY "Users can manage own device tokens"
ON public.device_tokens FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own preferences"
ON public.notification_preferences FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMIT;
