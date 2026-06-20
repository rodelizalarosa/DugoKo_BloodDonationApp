-- DugóKo Database Schema
-- Postgres-flavored DDL. Adjust types if using Supabase/Firebase/MySQL.

CREATE TYPE blood_type AS ENUM ('O+','O-','A+','A-','B+','B-','AB+','AB-');
CREATE TYPE donor_level AS ENUM ('New Donor','Regular Donor','Hero Donor','Lifesaver');
CREATE TYPE eligibility_status AS ENUM ('eligible','deferred','not_eligible','unknown');
CREATE TYPE rsvp_status AS ENUM ('going','interested','cancelled');
CREATE TYPE urgency_level AS ENUM ('critical','urgent','moderate');
CREATE TYPE request_status AS ENUM ('open','fulfilled','closed');
CREATE TYPE post_type AS ENUM ('request','story','announcement');

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  email             TEXT UNIQUE,
  phone             TEXT,
  blood_type        blood_type,
  birthdate         DATE,
  weight_kg         NUMERIC(5,2),
  sex               TEXT, -- used to apply correct deferral interval (12wk/16wk)
  donor_level       donor_level NOT NULL DEFAULT 'New Donor',
  total_donations   INTEGER NOT NULL DEFAULT 0,
  last_donation_date DATE,
  profile_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- DONATION CENTERS
-- ─────────────────────────────────────────────
CREATE TABLE centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  contact     TEXT,
  hours       TEXT
);

-- ─────────────────────────────────────────────
-- BLOOD LETTING EVENTS
-- ─────────────────────────────────────────────
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  date             DATE NOT NULL,
  time_start       TEXT NOT NULL,
  time_end         TEXT NOT NULL,
  venue            TEXT NOT NULL,
  address          TEXT NOT NULL,
  organizer        TEXT NOT NULL,
  slots_available  INTEGER NOT NULL DEFAULT 0,
  description      TEXT,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  center_id        UUID REFERENCES centers(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_rsvp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      rsvp_status NOT NULL DEFAULT 'going',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- ─────────────────────────────────────────────
-- BLOOD REQUESTS (Urgent Requests / Community)
-- ─────────────────────────────────────────────
CREATE TABLE blood_requests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital           TEXT NOT NULL,
  address            TEXT,
  blood_type_needed  blood_type NOT NULL,
  units_needed       INTEGER NOT NULL,
  units_pledged      INTEGER NOT NULL DEFAULT 0,
  urgency_level      urgency_level NOT NULL,
  status             request_status NOT NULL DEFAULT 'open',
  notes              TEXT,
  posted_by          UUID REFERENCES users(id),
  posted_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE request_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

-- ─────────────────────────────────────────────
-- DONATIONS (Log Donation ⭐ source of truth)
-- ─────────────────────────────────────────────
CREATE TABLE donations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id        UUID REFERENCES events(id),
  date            DATE NOT NULL,
  venue           TEXT NOT NULL,
  branch          TEXT NOT NULL,
  blood_bag_ref   TEXT,
  blood_pressure  TEXT,
  hemoglobin      TEXT,
  pulse           TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger-worthy in production: after INSERT on donations,
--   1) increment users.total_donations
--   2) set users.last_donation_date
--   3) recompute donor_level
--   4) upsert donor_insights row

-- ─────────────────────────────────────────────
-- DONOR INSIGHTS (derived/cacheable, can also be computed on read)
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
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  keywords  TEXT[] NOT NULL DEFAULT '{}',
  category  TEXT NOT NULL
);

-- ─────────────────────────────────────────────
-- LEARN ARTICLES
-- ─────────────────────────────────────────────
CREATE TABLE learn_articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  summary       TEXT NOT NULL,
  read_minutes  INTEGER NOT NULL DEFAULT 3,
  cover_emoji   TEXT,
  content       TEXT NOT NULL,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- COMMUNITY POSTS (requests / stories / announcements feed)
-- ─────────────────────────────────────────────
CREATE TABLE community_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                post_type NOT NULL,
  author_name         TEXT NOT NULL,
  author_avatar_url   TEXT,
  title               TEXT NOT NULL,
  body                TEXT NOT NULL,
  related_request_id  UUID REFERENCES blood_requests(id),
  posted_at           TIMESTAMPTZ NOT NULL DEFAULT now()
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
