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
ALTER TABLE event_rsvp FORCE ROW LEVEL SECURITY;
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
-- Profile RPC (bypasses RLS for auth flow)
-- Use this instead of direct table select for initial profile fetch
-- to avoid the chicken-and-egg RLS bootstrap problem.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.users WHERE id = auth.uid();
END;
$$;

-- ─────────────────────────────────────────────
-- Profile update RPC (bypasses RLS for auth flow)
-- Use this instead of direct table update to avoid 403 errors.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_blood_type blood_type DEFAULT NULL,
  p_birthdate DATE DEFAULT NULL,
  p_weight_kg NUMERIC(5,2) DEFAULT NULL,
  p_sex TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_profile_complete BOOLEAN DEFAULT NULL,
  p_eligibility_status eligibility_status DEFAULT NULL
)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    full_name         = COALESCE(p_full_name, full_name),
    phone             = COALESCE(p_phone, phone),
    blood_type        = COALESCE(p_blood_type, blood_type),
    birthdate         = COALESCE(p_birthdate, birthdate),
    weight_kg         = COALESCE(p_weight_kg, weight_kg),
    sex               = COALESCE(p_sex, sex),
    avatar_url        = COALESCE(p_avatar_url, avatar_url),
    profile_complete  = COALESCE(p_profile_complete, profile_complete),
    eligibility_status = COALESCE(p_eligibility_status, eligibility_status)
  WHERE id = auth.uid();

  RETURN QUERY SELECT * FROM public.users WHERE id = auth.uid();
END;
$$;

-- Check whether an email is registered (used for friendlier login validation).
CREATE OR REPLACE FUNCTION public.email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE lower(email) = lower(trim(p_email))
  );
$$;

-- ─────────────────────────────────────────────
-- Search eligible donors RPC (bypasses RLS so all users can find donors)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.search_eligible_donors(
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  email TEXT,
  blood_type blood_type,
  birthdate DATE,
  weight_kg NUMERIC(5,2),
  sex TEXT,
  donor_level TEXT,
  total_donations INT,
  last_donation_date DATE,
  avatar_url TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.blood_type,
    u.birthdate,
    u.weight_kg,
    u.sex,
    u.donor_level,
    u.total_donations,
    u.last_donation_date,
    u.avatar_url,
    u.phone
  FROM public.users u
  WHERE u.role = 'donor'
    AND u.profile_complete = true
    AND (p_exclude_id IS NULL OR u.id <> p_exclude_id);
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
-- Pledge request RPC (bypasses RLS so any donor can pledge to any request)
-- Inserts a response row and increments units_pledged in one transaction.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pledge_request(
  p_request_id UUID,
  p_helper_name TEXT DEFAULT NULL,
  p_helper_contact TEXT DEFAULT NULL,
  p_helper_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id UUID;
  v_new_pledges INT;
  v_result JSONB;
BEGIN
  -- Check duplicate
  SELECT id INTO v_existing_id
  FROM public.request_responses
  WHERE request_id = p_request_id AND user_id = auth.uid();

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'You have already responded to this request.');
  END IF;

  -- Insert response
  INSERT INTO public.request_responses (request_id, user_id, helper_name, helper_contact, helper_email)
  VALUES (p_request_id, auth.uid(), p_helper_name, p_helper_contact, p_helper_email);

  -- Increment units_pledged
  UPDATE public.blood_requests
  SET units_pledged = units_pledged + 1
  WHERE id = p_request_id
  RETURNING units_pledged INTO v_new_pledges;

  RETURN jsonb_build_object('units_pledged', v_new_pledges);
END;
$$;

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
  USING (is_active = true);

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

-- ─────────────────────────────────────────────
-- EVENT_RSVP (Updated for new health declaration columns)
-- Note: The insert and update policies remain the same (user_id = auth.uid())
-- The new columns (contact_number, decl_healthy, decl_no_meds_14d, decl_consent)
-- are covered by the existing WITH CHECK clause, which validates that
-- the user can only insert/update their own records.
-- ─────────────────────────────────────────────
COMMENT ON POLICY "event_rsvp: insert" ON event_rsvp IS 'Allows users to RSVP with contact_number and health declarations';
COMMENT ON POLICY "event_rsvp: update" ON event_rsvp IS 'Allows users to update their RSVP including health declarations';

-- ─────────────────────────────────────────────
-- DONATIONS (Updated for new verification columns)
-- Note: The existing policies already cover the new columns
-- (donor_id, is_verified, verified_at) since they are part of the donations row.
-- ─────────────────────────────────────────────
COMMENT ON POLICY "donations: insert" ON donations IS 'Allows users to log donations with optional donor_id and verification fields';
COMMENT ON POLICY "donations: update" ON donations IS 'Allows users and admins to update donation records, including verification status';

-- ─────────────────────────────────────────────
-- BLOOD_REQUESTS (Updated for new needed_by column)
-- ─────────────────────────────────────────────
COMMENT ON POLICY "blood_requests: insert" ON blood_requests IS 'Allows users to create requests with needed_by field';

-- ─────────────────────────────────────────────
-- ADMIN: Full access policies for admin users
-- (These are fallback policies — admin sees all data via existing policies)
-- ─────────────────────────────────────────────
CREATE POLICY "centers: admin_insert_update" ON centers
  TO authenticated
  WITH CHECK (user_has_role('admin'));

CREATE POLICY "events: admin_insert_update" ON events
  TO authenticated
  WITH CHECK (user_has_role('admin'));

CREATE POLICY "learn_articles: admin_insert_update" ON learn_articles
  TO authenticated
  WITH CHECK (user_has_role('admin'));

CREATE POLICY "faq: admin_insert_update" ON faq
  TO authenticated
  WITH CHECK (user_has_role('admin'));
