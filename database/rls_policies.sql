-- ═══════════════════════════════════════════════════════════════
-- DugóKo Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvp         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_insights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq                ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_articles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts    ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Helper Function: Check User Role
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_has_role(required_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE POLICY "users: select" ON users
  TO authenticated
  USING (auth.uid() = id OR user_has_role('admin') OR user_has_role('moderator'));

CREATE POLICY "users: update" ON users
  TO authenticated
  USING (auth.uid() = id OR user_has_role('admin'));

-- ─────────────────────────────────────────────
-- CENTERS
-- ─────────────────────────────────────────────
CREATE POLICY "centers: select" ON centers
  TO authenticated
  USING (true);

CREATE POLICY "centers: admin_all" ON centers
  TO authenticated
  USING (user_has_role('admin'));

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
CREATE POLICY "events: select" ON events
  TO authenticated
  USING (true);

CREATE POLICY "events: admin_all" ON events
  TO authenticated
  USING (user_has_role('admin'));

-- ─────────────────────────────────────────────
-- EVENT_RSVP
-- ─────────────────────────────────────────────
CREATE POLICY "event_rsvp: select" ON event_rsvp
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'));

CREATE POLICY "event_rsvp: insert" ON event_rsvp
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_rsvp: update" ON event_rsvp
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_rsvp: delete" ON event_rsvp
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- BLOOD_REQUESTS
-- ─────────────────────────────────────────────
CREATE POLICY "blood_requests: select" ON blood_requests
  TO authenticated
  USING (true);

CREATE POLICY "blood_requests: insert" ON blood_requests
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "blood_requests: update_delete" ON blood_requests
  TO authenticated
  USING (auth.uid() = posted_by OR user_has_role('moderator') OR user_has_role('admin'));

-- ─────────────────────────────────────────────
-- REQUEST_RESPONSES
-- ─────────────────────────────────────────────
CREATE POLICY "request_responses: select" ON request_responses
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin') OR user_has_role('moderator'));

CREATE POLICY "request_responses: insert" ON request_responses
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "request_responses: delete" ON request_responses
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- DONATIONS
-- ─────────────────────────────────────────────
CREATE POLICY "donations: select" ON donations
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'));

CREATE POLICY "donations: insert" ON donations
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "donations: update" ON donations
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'))
  WITH CHECK (auth.uid() = user_id OR user_has_role('admin'));

CREATE POLICY "donations: delete" ON donations
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'));

-- ─────────────────────────────────────────────
-- DONOR_INSIGHTS (Read-only, updated by security definer triggers)
-- ─────────────────────────────────────────────
CREATE POLICY "donor_insights: select" ON donor_insights
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'));

-- ─────────────────────────────────────────────
-- FAQ
-- ─────────────────────────────────────────────
CREATE POLICY "faq: select" ON faq
  TO authenticated
  USING (true);

CREATE POLICY "faq: admin_all" ON faq
  TO authenticated
  USING (user_has_role('admin'));

-- ─────────────────────────────────────────────
-- LEARN_ARTICLES
-- ─────────────────────────────────────────────
CREATE POLICY "learn_articles: select" ON learn_articles
  TO authenticated
  USING (true);

CREATE POLICY "learn_articles: admin_all" ON learn_articles
  TO authenticated
  USING (user_has_role('admin'));

-- ─────────────────────────────────────────────
-- COMMUNITY_POSTS
-- ─────────────────────────────────────────────
CREATE POLICY "community_posts: select" ON community_posts
  TO authenticated
  USING (true);

CREATE POLICY "community_posts: insert" ON community_posts
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "community_posts: update_delete" ON community_posts
  TO authenticated
  USING (auth.uid() = author_id OR user_has_role('moderator') OR user_has_role('admin'));
