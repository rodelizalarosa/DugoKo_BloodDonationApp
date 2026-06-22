-- ══════════════════════════════════════════════════════════════════════
-- DugóKo — Complete Database Setup
-- Run THIS ENTIRE FILE ONCE in Supabase SQL Editor.
-- Safe to re-run: drops everything first, then recreates.
-- ══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. TEARDOWN (Resets everything)
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created  ON auth.users;
DROP TRIGGER IF EXISTS on_donation_inserted  ON public.donations;
DROP TRIGGER IF EXISTS on_user_updated       ON public.users;

DROP FUNCTION IF EXISTS public.handle_new_user()        CASCADE;
DROP FUNCTION IF EXISTS public.handle_donation_insert() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_updated()    CASCADE;

DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.learn_articles  CASCADE;
DROP TABLE IF EXISTS public.faq             CASCADE;
DROP TABLE IF EXISTS public.donor_insights  CASCADE;
DROP TABLE IF EXISTS public.donations       CASCADE;
DROP TABLE IF EXISTS public.request_responses CASCADE;
DROP TABLE IF EXISTS public.blood_requests  CASCADE;
DROP TABLE IF EXISTS public.event_rsvp      CASCADE;
DROP TABLE IF EXISTS public.events          CASCADE;
DROP TABLE IF EXISTS public.centers         CASCADE;
DROP TABLE IF EXISTS public.users           CASCADE;

DROP TYPE IF EXISTS public.post_type           CASCADE;
DROP TYPE IF EXISTS public.request_status      CASCADE;
DROP TYPE IF EXISTS public.urgency_level       CASCADE;
DROP TYPE IF EXISTS public.rsvp_status         CASCADE;
DROP TYPE IF EXISTS public.eligibility_status  CASCADE;
DROP TYPE IF EXISTS public.donor_level         CASCADE;
DROP TYPE IF EXISTS public.blood_type          CASCADE;
DROP TYPE IF EXISTS public.theme_preference    CASCADE;
DROP TYPE IF EXISTS public.user_role           CASCADE;

-- ─────────────────────────────────────────────
-- 2. ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE blood_type       AS ENUM ('O+','O-','A+','A-','B+','B-','AB+','AB-');
CREATE TYPE donor_level      AS ENUM ('New Donor','Regular Donor','Hero Donor','Lifesaver');
CREATE TYPE eligibility_status AS ENUM ('eligible','deferred','not_eligible','unknown');
CREATE TYPE rsvp_status      AS ENUM ('going','interested','cancelled');
CREATE TYPE urgency_level    AS ENUM ('critical','urgent','moderate');
CREATE TYPE request_status   AS ENUM ('open','fulfilled','closed');
CREATE TYPE post_type        AS ENUM ('request','story','announcement');
CREATE TYPE user_role        AS ENUM ('donor', 'admin', 'moderator');
CREATE TYPE theme_preference AS ENUM ('light', 'dark');

-- ─────────────────────────────────────────────
-- 3. TABLES
-- ─────────────────────────────────────────────

-- USERS
CREATE TABLE users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          TEXT NOT NULL,
  email              TEXT UNIQUE,
  phone              TEXT,
  blood_type         blood_type,
  birthdate          DATE,
  weight_kg          NUMERIC(5,2),
  sex                TEXT,
  eligibility_status eligibility_status NOT NULL DEFAULT 'unknown',
  donor_level        donor_level NOT NULL DEFAULT 'New Donor',
  role               user_role   NOT NULL DEFAULT 'donor',
  total_donations    INTEGER     NOT NULL DEFAULT 0,
  last_donation_date DATE,
  profile_complete   BOOLEAN     NOT NULL DEFAULT FALSE,
  theme_preference   theme_preference NOT NULL DEFAULT 'light',
  avatar_url         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DONATION CENTERS
CREATE TABLE centers (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  address   TEXT NOT NULL,
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact   TEXT,
  hours     TEXT
);

-- BLOOD LETTING EVENTS
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  date            DATE NOT NULL,
  time_start      TEXT NOT NULL,
  time_end        TEXT NOT NULL,
  venue           TEXT NOT NULL,
  address         TEXT NOT NULL,
  organizer       TEXT NOT NULL,
  slots_available INTEGER NOT NULL DEFAULT 0,
  description     TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  center_id       UUID REFERENCES centers(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_rsvp (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           rsvp_status NOT NULL DEFAULT 'going',
  time_slot        TEXT,
  contact_number   TEXT,
  decl_healthy     BOOLEAN NOT NULL DEFAULT FALSE,
  decl_no_meds_14d BOOLEAN NOT NULL DEFAULT FALSE,
  decl_consent     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- BLOOD REQUESTS
CREATE TABLE blood_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital          TEXT NOT NULL,
  address           TEXT,
  blood_type_needed blood_type NOT NULL,
  units_needed      INTEGER NOT NULL,
  units_pledged     INTEGER NOT NULL DEFAULT 0,
  urgency_level     urgency_level NOT NULL,
  needed_by         TIMESTAMPTZ,
  status            request_status NOT NULL DEFAULT 'open',
  notes             TEXT,
  posted_by         UUID REFERENCES users(id),
  posted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE request_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_name    TEXT,
  helper_contact TEXT,
  helper_email   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

-- DONATIONS
CREATE TABLE donations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id       UUID REFERENCES events(id),
  date           DATE NOT NULL,
  venue          TEXT NOT NULL,
  branch         TEXT NOT NULL,
  blood_bag_ref  TEXT,
  donor_id       TEXT,
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at    TIMESTAMPTZ,
  blood_pressure TEXT,
  hemoglobin     TEXT,
  pulse          TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DONOR INSIGHTS
CREATE TABLE donor_insights (
  user_id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_donations          INTEGER NOT NULL DEFAULT 0,
  estimated_lives_impacted INTEGER NOT NULL DEFAULT 0,
  donation_streak          INTEGER NOT NULL DEFAULT 0,
  next_window_date         DATE,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FAQ
CREATE TABLE faq (
  id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT    NOT NULL,
  answer   TEXT    NOT NULL,
  keywords TEXT[]  NOT NULL DEFAULT '{}',
  category TEXT    NOT NULL,
  source_title TEXT,
  source_url TEXT,
  last_verified_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- LEARN ARTICLES
CREATE TABLE learn_articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  summary      TEXT NOT NULL,
  read_minutes INTEGER NOT NULL DEFAULT 3,
  cover_emoji  TEXT,
  content      TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COMMUNITY POSTS
CREATE TABLE community_posts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type               post_type NOT NULL,
  author_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name        TEXT NOT NULL,
  author_avatar_url  TEXT,
  title              TEXT NOT NULL,
  body               TEXT NOT NULL,
  related_request_id UUID REFERENCES blood_requests(id),
  posted_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_donations_user_id   ON donations(user_id);
CREATE INDEX idx_donations_date      ON donations(date);
CREATE INDEX idx_events_date         ON events(date);
CREATE INDEX idx_requests_status     ON blood_requests(status);
CREATE INDEX idx_requests_urgency    ON blood_requests(urgency_level);
CREATE INDEX idx_posts_related_request_id ON community_posts(related_request_id);
CREATE INDEX idx_posts_posted_at     ON community_posts(posted_at DESC);

-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
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

-- Helper: check user role
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

-- Profile RPC (bypasses RLS for auth flow)
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

-- Profile update RPC (bypasses RLS for auth flow)
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_blood_type blood_type DEFAULT NULL,
  p_birthdate DATE DEFAULT NULL,
  p_weight_kg NUMERIC(5,2) DEFAULT NULL,
  p_sex TEXT DEFAULT NULL,
  p_eligibility_status eligibility_status DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_profile_complete BOOLEAN DEFAULT NULL,
  p_theme_preference theme_preference DEFAULT NULL
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
    eligibility_status = COALESCE(p_eligibility_status, eligibility_status),
    avatar_url        = COALESCE(p_avatar_url, avatar_url),
    profile_complete  = COALESCE(p_profile_complete, profile_complete),
    theme_preference  = COALESCE(p_theme_preference, theme_preference)
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

-- Search eligible donors RPC (bypasses RLS so all users can find donors)
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
  eligibility_status eligibility_status,
  donor_level donor_level,
  role user_role,
  total_donations INT,
  last_donation_date DATE,
  profile_complete BOOLEAN,
  theme_preference theme_preference,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
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
    u.eligibility_status,
    u.donor_level,
    u.role,
    u.total_donations,
    u.last_donation_date,
    u.profile_complete,
    u.theme_preference,
    u.avatar_url,
    u.phone,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.role = 'donor'
    AND u.profile_complete = true
    AND (p_exclude_id IS NULL OR u.id <> p_exclude_id);
END;
$$;

-- USERS
CREATE POLICY "users: select" ON users
  TO authenticated
  USING (auth.uid() = id OR user_has_role('admin') OR user_has_role('moderator'));

CREATE POLICY "users: update" ON users
  TO authenticated
  USING (auth.uid() = id OR user_has_role('admin'))
  WITH CHECK (auth.uid() = id OR user_has_role('admin'));

-- CENTERS
CREATE POLICY "centers: select" ON centers
  TO authenticated
  USING (true);

CREATE POLICY "centers: admin_all" ON centers
  TO authenticated
  USING (user_has_role('admin'));

CREATE POLICY "centers: admin_insert_update" ON centers
  TO authenticated
  WITH CHECK (user_has_role('admin'));

-- EVENTS
CREATE POLICY "events: select" ON events
  TO authenticated
  USING (true);

CREATE POLICY "events: admin_all" ON events
  TO authenticated
  USING (user_has_role('admin'));

CREATE POLICY "events: admin_insert_update" ON events
  TO authenticated
  WITH CHECK (user_has_role('admin'));

-- EVENT_RSVP
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

-- Pledge request RPC (bypasses RLS so any donor can pledge to any request)
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
  SELECT id INTO v_existing_id
  FROM public.request_responses
  WHERE request_id = p_request_id AND user_id = auth.uid();

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'You have already responded to this request.');
  END IF;

  INSERT INTO public.request_responses (request_id, user_id, helper_name, helper_contact, helper_email)
  VALUES (p_request_id, auth.uid(), p_helper_name, p_helper_contact, p_helper_email);

  UPDATE public.blood_requests
  SET units_pledged = units_pledged + 1
  WHERE id = p_request_id
  RETURNING units_pledged INTO v_new_pledges;

  RETURN jsonb_build_object('units_pledged', v_new_pledges);
END;
$$;

-- BLOOD_REQUESTS
CREATE POLICY "blood_requests: select" ON blood_requests
  TO authenticated
  USING (true);

CREATE POLICY "blood_requests: insert" ON blood_requests
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "blood_requests: update_delete" ON blood_requests
  TO authenticated
  USING (auth.uid() = posted_by OR user_has_role('moderator') OR user_has_role('admin'))
  WITH CHECK (auth.uid() = posted_by OR user_has_role('moderator') OR user_has_role('admin'));

-- REQUEST_RESPONSES
CREATE POLICY "request_responses: select" ON request_responses
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin') OR user_has_role('moderator'));

CREATE POLICY "request_responses: insert" ON request_responses
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "request_responses: delete" ON request_responses
  TO authenticated
  USING (auth.uid() = user_id);

-- DONATIONS
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

-- DONOR_INSIGHTS
CREATE POLICY "donor_insights: select" ON donor_insights
  TO authenticated
  USING (auth.uid() = user_id OR user_has_role('admin'));

-- FAQ
CREATE POLICY "faq: select" ON faq
  TO authenticated
  USING (is_active = true);

CREATE POLICY "faq: admin_all" ON faq
  TO authenticated
  USING (user_has_role('admin'));

CREATE POLICY "faq: admin_insert_update" ON faq
  TO authenticated
  WITH CHECK (user_has_role('admin'));

-- LEARN_ARTICLES
CREATE POLICY "learn_articles: select" ON learn_articles
  TO authenticated
  USING (true);

CREATE POLICY "learn_articles: admin_all" ON learn_articles
  TO authenticated
  USING (user_has_role('admin'));

CREATE POLICY "learn_articles: admin_insert_update" ON learn_articles
  TO authenticated
  WITH CHECK (user_has_role('admin'));

-- COMMUNITY_POSTS
CREATE POLICY "community_posts: select" ON community_posts
  TO authenticated
  USING (true);

CREATE POLICY "community_posts: insert" ON community_posts
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "community_posts: update_delete" ON community_posts
  TO authenticated
  USING (auth.uid() = author_id OR user_has_role('moderator') OR user_has_role('admin'))
  WITH CHECK (auth.uid() = author_id OR user_has_role('moderator') OR user_has_role('admin'));

-- ─────────────────────────────────────────────
-- 5. TRIGGERS & FUNCTIONS
-- ─────────────────────────────────────────────

-- Auto-create a users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'donor'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.donor_insights (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- After a donation is inserted, update users + donor_insights
CREATE OR REPLACE FUNCTION public.handle_donation_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total       INTEGER;
  v_new_level   donor_level;
  v_next_date   DATE;
  v_prev_date   DATE;
  v_streak      INTEGER;
  v_user_sex    TEXT;
  v_interval_days INTEGER;
BEGIN
  UPDATE public.users
  SET
    total_donations    = total_donations + 1,
    last_donation_date = NEW.date,
    eligibility_status = CASE
      WHEN total_donations = 0 THEN 'eligible'::eligibility_status
      ELSE eligibility_status
    END,
    updated_at         = now()
  WHERE id = NEW.user_id
  RETURNING total_donations INTO v_total;

  v_new_level := CASE
    WHEN v_total >= 10 THEN 'Lifesaver'::donor_level
    WHEN v_total >= 6  THEN 'Hero Donor'::donor_level
    WHEN v_total >= 3  THEN 'Regular Donor'::donor_level
    ELSE 'New Donor'::donor_level
  END;

  UPDATE public.users
  SET donor_level = v_new_level
  WHERE id = NEW.user_id;

  SELECT sex INTO v_user_sex FROM public.users WHERE id = NEW.user_id;
  v_interval_days := CASE WHEN v_user_sex = 'female' THEN 112 ELSE 84 END;

  v_next_date := NEW.date + (v_interval_days || ' days')::INTERVAL;

  SELECT date INTO v_prev_date
  FROM public.donations
  WHERE user_id = NEW.user_id AND id != NEW.id
  ORDER BY date DESC
  LIMIT 1;

  IF v_prev_date IS NULL THEN
    v_streak := 1;
  ELSIF NEW.date - v_prev_date <= 730 THEN
    SELECT COUNT(*) INTO v_streak
    FROM public.donations
    WHERE user_id = NEW.user_id
      AND date >= (NEW.date - INTERVAL '730 days');
  ELSE
    v_streak := 1;
  END IF;

  INSERT INTO public.donor_insights (
    user_id, total_donations, estimated_lives_impacted,
    donation_streak, next_window_date, updated_at
  )
  VALUES (
    NEW.user_id, v_total, v_total * 3,
    v_streak, v_next_date, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_donations          = v_total,
    estimated_lives_impacted = v_total * 3,
    donation_streak          = v_streak,
    next_window_date         = v_next_date,
    updated_at               = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_donation_inserted
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_insert();

-- Keep users.updated_at fresh on profile edits
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_updated();

-- ══════════════════════════════════════════════════════════════════════
-- 6. BACKFILL: Create public.users rows for existing auth users
-- This catches any accounts that were created BEFORE this script ran.
-- Safe to keep — it only inserts rows that don't already exist.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.users (id, full_name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', '') AS full_name,
  au.email,
  'donor'::user_role AS role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.donor_insights (user_id)
SELECT au.id
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.donor_insights di WHERE di.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 7. DEMO HOME CONTENT
-- These rows keep the mobile home screen useful on a fresh install.
-- They are safe to re-run because all IDs are fixed and ON CONFLICT is used.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO public.blood_requests (
  id, hospital, address, blood_type_needed, units_needed, units_pledged,
  urgency_level, needed_by, status, notes, posted_by
)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Cebu City Medical Center',
    'Natalio B. Bacalso Ave, Cebu City',
    'O-',
    12,
    3,
    'critical',
    '2026-06-24 12:00:00+08',
    'open',
    'Urgent trauma case. Walk-in donors appreciated if eligible.',
    NULL
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'Perpetual Succour Hospital',
    'Fuente Osmena, Cebu City',
    'A+',
    6,
    1,
    'urgent',
    '2026-06-28 17:00:00+08',
    'open',
    'Shortage for scheduled surgeries later this week.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.community_posts (
  type, author_id, author_name, author_avatar_url, title, body, related_request_id
)
VALUES
  (
    'request',
    NULL,
    'Cebu City Medical Center',
    NULL,
    'Blood Needed: O- at Cebu City Medical Center',
    'Urgent request for 12 units of O- blood for a trauma patient.',
    'b1000000-0000-0000-0000-000000000001'
  ),
  (
    'announcement',
    NULL,
    'Philippine Red Cross Cebu',
    NULL,
    'Weekend Donor Drive Reminder',
    'Bring a valid ID, hydrate well, and eat a light meal before donating this weekend.',
    NULL
  ),
  (
    'story',
    NULL,
    'Anonymous Donor',
    NULL,
    'A first donation that made a difference',
    'One donation can support multiple patients and start a lifelong habit of helping.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;
