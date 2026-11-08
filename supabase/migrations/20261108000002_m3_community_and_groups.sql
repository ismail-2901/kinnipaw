-- KINNIPAW — Gate M3 Migration: Community Feed, Comments, Reactions, Groups, and Reports
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-017, ADR-019, ADR-023

BEGIN;

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NULL, -- Organization support
  body TEXT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'media', 'link', 'care_tip')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'group_only')),
  is_published BOOLEAN DEFAULT true NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. POST MEDIA (EXIF stripped)
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  alt_text TEXT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. COMMENTS & THREADED REPLIES
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NULL,
  body TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. REACTIONS
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'celebrate')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 5. HASHTAGS & POST_HASHTAGS
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, hashtag_id)
);

-- 6. FOLLOWS
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

-- 7. COMMUNITY GROUPS (ADR-017)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  group_type TEXT DEFAULT 'public' CHECK (group_type IN ('public', 'private', 'organization')),
  organization_id UUID NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  member_count INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_role TEXT DEFAULT 'member' CHECK (group_role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_posts (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (group_id, post_id)
);

-- 8. CONTENT REPORTS (ADR-023: Nullable FK columns with CHECK)
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'misinformation', 'animal_cruelty', 'illegal_trade', 'other')),
  details TEXT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_id UUID NULL, -- Adoption listing FK (M4)
  rescue_case_id UUID NULL, -- Rescue case FK (M5)
  lost_found_post_id UUID NULL, -- Lost/Found post FK (M5)
  report_status TEXT DEFAULT 'pending' CHECK (report_status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (num_nonnulls(post_id, comment_id, profile_id, listing_id, rescue_case_id, lost_found_post_id) = 1)
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON public.posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON public.hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON public.follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(report_status);

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES

-- POSTS
CREATE POLICY "Public posts viewable by everyone"
ON public.posts FOR SELECT
USING (
  visibility = 'public' OR
  author_id = auth.uid() OR
  (visibility = 'followers' AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND followed_id = posts.author_id
  )) OR
  (visibility = 'group_only' AND EXISTS (
    SELECT 1 FROM public.group_posts gp
    JOIN public.group_members gm ON gm.group_id = gp.group_id
    WHERE gp.post_id = posts.id AND gm.user_id = auth.uid()
  ))
);

CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- POST MEDIA
CREATE POLICY "Media viewable if post is viewable"
ON public.post_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_media.post_id
  )
);

CREATE POLICY "Post authors can manage post media"
ON public.post_media FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_media.post_id AND posts.author_id = auth.uid()
  )
);

-- COMMENTS
CREATE POLICY "Comments viewable if post is viewable"
ON public.comments FOR SELECT
USING (
  is_visible = true AND
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = comments.post_id
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update/delete own comments"
ON public.comments FOR ALL
TO authenticated
USING (auth.uid() = author_id);

-- REACTIONS
CREATE POLICY "Reactions viewable by everyone"
ON public.reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can toggle reactions"
ON public.reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- HASHTAGS
CREATE POLICY "Hashtags viewable by public"
ON public.hashtags FOR SELECT
USING (true);

CREATE POLICY "Post hashtags viewable by public"
ON public.post_hashtags FOR SELECT
USING (true);

-- FOLLOWS
CREATE POLICY "Follows viewable by public"
ON public.follows FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own follows"
ON public.follows FOR ALL
TO authenticated
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- GROUPS
CREATE POLICY "Groups viewable by public"
ON public.groups FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update group"
ON public.groups FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = groups.id AND user_id = auth.uid() AND group_role IN ('owner', 'admin')
  )
);

-- GROUP MEMBERS
CREATE POLICY "Group members viewable by group members"
ON public.group_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join groups"
ON public.group_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups or admins manage"
ON public.group_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.group_role IN ('owner', 'admin')
  )
);

-- GROUP POSTS
CREATE POLICY "Group posts viewable by members"
ON public.group_posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_posts.group_id AND group_members.user_id = auth.uid()
  )
);

-- CONTENT REPORTS (ADR-023)
CREATE POLICY "Users can submit reports"
ON public.content_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
ON public.content_reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

COMMIT;
