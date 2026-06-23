-- DugóKo Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- All tables are linked to Supabase Auth via auth.users

-- ─────────────────────────────────────────────
-- TEARDOWN (Resets all tables and types before creating them)
-- ─────────────────────────────────────────────
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.learn_articles CASCADE;
DROP TABLE IF EXISTS public.faq CASCADE;
DROP TABLE IF EXISTS public.donor_insights CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.request_responses CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.event_rsvp CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.centers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS public.post_type CASCADE;
DROP TYPE IF EXISTS public.request_status CASCADE;
DROP TYPE IF EXISTS public.urgency_level CASCADE;
DROP TYPE IF EXISTS public.rsvp_status CASCADE;
DROP TYPE IF EXISTS public.eligibility_status CASCADE;
DROP TYPE IF EXISTS public.donor_level CASCADE;
DROP TYPE IF EXISTS public.blood_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- ─────────────────────────────────────────────
-- ENUMs
-- ─────────────────────────────────────────────
CREATE TYPE blood_type       AS ENUM ('O+','O-','A+','A-','B+','B-','AB+','AB-');
CREATE TYPE donor_level      AS ENUM ('New Donor','Regular Donor','Hero Donor','Lifesaver');
CREATE TYPE eligibility_status AS ENUM ('eligible','deferred','not_eligible','unknown');
CREATE TYPE rsvp_status      AS ENUM ('going','interested','cancelled');
CREATE TYPE urgency_level    AS ENUM ('critical','urgent','moderate');
CREATE TYPE request_status   AS ENUM ('open','fulfilled','closed');
CREATE TYPE post_type        AS ENUM ('request','story','announcement');
CREATE TYPE user_role        AS ENUM ('donor', 'admin', 'moderator');

-- ─────────────────────────────────────────────
-- USERS
-- Links to Supabase auth.users. id must be the same UUID as the auth user.
-- Auto-populated via trigger (see triggers.sql).
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          TEXT NOT NULL,
  email              TEXT UNIQUE,
  phone              TEXT,
  blood_type         blood_type,
  birthdate          DATE,
  weight_kg          NUMERIC(5,2),
  sex                TEXT,       -- 'male' | 'female' — used for deferral interval (12wk/16wk)
  eligibility_status eligibility_status NOT NULL DEFAULT 'unknown',
  donor_level        donor_level NOT NULL DEFAULT 'New Donor',
  role               user_role   NOT NULL DEFAULT 'donor',
  total_donations    INTEGER     NOT NULL DEFAULT 0,
  last_donation_date DATE,
  profile_complete   BOOLEAN     NOT NULL DEFAULT FALSE,
  avatar_url         TEXT,
  -- OAuth / Social providers (wired after core backend is complete)
  -- google_id       TEXT UNIQUE,
  -- facebook_id     TEXT UNIQUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- DONATION CENTERS
-- ─────────────────────────────────────────────
CREATE TABLE centers (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  address   TEXT NOT NULL,
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact   TEXT,
  hours     TEXT
);

-- ─────────────────────────────────────────────
-- BLOOD LETTING EVENTS
-- ─────────────────────────────────────────────
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
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status             rsvp_status NOT NULL DEFAULT 'going',
  time_slot          TEXT,
  contact_number     TEXT,
  decl_healthy       BOOLEAN NOT NULL DEFAULT FALSE,
  decl_no_meds_14d   BOOLEAN NOT NULL DEFAULT FALSE,
  decl_consent       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- ─────────────────────────────────────────────
-- BLOOD REQUESTS (Urgent Requests / Community)
-- Requires login to view (see rls_policies.sql)
-- ─────────────────────────────────────────────
CREATE TABLE blood_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital          TEXT NOT NULL,
  address           TEXT,
  blood_type_needed blood_type NOT NULL,
  units_needed      INTEGER NOT NULL,
  units_pledged     INTEGER NOT NULL DEFAULT 0,
  urgency_level     urgency_level NOT NULL,
  needed_by         TIMESTAMPTZ,   -- "When blood is needed" — used for AI triage derivation
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

-- ─────────────────────────────────────────────
-- DONATIONS (Log Donation — source of truth)
-- ─────────────────────────────────────────────
CREATE TABLE donations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id       UUID REFERENCES events(id),
  date           DATE NOT NULL,
  venue          TEXT NOT NULL,
  branch         TEXT NOT NULL,
  blood_bag_ref  TEXT,
  donor_id       TEXT,            -- Red Cross Donor Card ID (e.g., PRC-12-34567)
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at    TIMESTAMPTZ,
  blood_pressure TEXT,
  hemoglobin     TEXT,
  pulse          TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- DONOR INSIGHTS (derived/cached, updated by trigger)
-- ─────────────────────────────────────────────
CREATE TABLE donor_insights (
  user_id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_donations          INTEGER NOT NULL DEFAULT 0,
  estimated_lives_impacted INTEGER NOT NULL DEFAULT 0,
  donation_streak          INTEGER NOT NULL DEFAULT 0,
  next_window_date         DATE,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- FAQ (Ask Dona — retrieval, not generative)
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- LEARN ARTICLES
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- COMMUNITY POSTS (requests / stories / announcements feed)
-- Requires login to view (see rls_policies.sql)
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_donations_user_id   ON donations(user_id);
CREATE INDEX idx_donations_date      ON donations(date);
CREATE INDEX idx_events_date         ON events(date);
CREATE INDEX idx_requests_status     ON blood_requests(status);
CREATE INDEX idx_requests_urgency    ON blood_requests(urgency_level);
CREATE INDEX idx_posts_posted_at     ON community_posts(posted_at DESC);
CREATE INDEX idx_notifications_user  ON notifications(user_id);

-- Functions
-- ─────────────────────────────────────────────

-- Function to decrement event slots (called on RSVP)
CREATE OR REPLACE FUNCTION decrement_event_slots(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET slots_available = slots_available - 1
  WHERE id = p_event_id
    AND slots_available > 0;
END;
$$;

-- Function to increment event slots (called on RSVP cancellation)
CREATE OR REPLACE FUNCTION increment_event_slots(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET slots_available = slots_available + 1
  WHERE id = p_event_id;
END;
$$;
