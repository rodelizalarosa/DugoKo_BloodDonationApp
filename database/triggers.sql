-- ═══════════════════════════════════════════════════════════════
-- DugóKo Database Triggers & Functions
-- Run AFTER schema.sql + rls_policies.sql in Supabase SQL Editor
-- Safe to re-run: teardown removes existing triggers/functions first
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- TEARDOWN: Drop triggers & functions before recreating
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created  ON auth.users;
DROP TRIGGER IF EXISTS on_donation_inserted  ON public.donations;
DROP TRIGGER IF EXISTS on_user_updated       ON public.users;

DROP FUNCTION IF EXISTS public.handle_new_user()      CASCADE;
DROP FUNCTION IF EXISTS public.handle_donation_insert() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_updated()   CASCADE;

-- ─────────────────────────────────────────────
-- TRIGGER 1: Auto-create a users row when a new auth user signs up
-- ─────────────────────────────────────────────
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

  -- Also initialize donor_insights row for the new user
  INSERT INTO public.donor_insights (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- TRIGGER 2: After a donation is inserted, update users + donor_insights
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_donation_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total      INTEGER;
  v_new_level  donor_level;
  v_next_date  DATE;
BEGIN
  -- Increment total and update last_donation_date
  UPDATE public.users
  SET
    total_donations    = total_donations + 1,
    last_donation_date = NEW.date,
    updated_at         = now()
  WHERE id = NEW.user_id
  RETURNING total_donations INTO v_total;

  -- Compute donor level from total donations
  v_new_level := CASE
    WHEN v_total >= 10 THEN 'Lifesaver'::donor_level
    WHEN v_total >= 6  THEN 'Hero Donor'::donor_level
    WHEN v_total >= 3  THEN 'Regular Donor'::donor_level
    ELSE 'New Donor'::donor_level
  END;

  UPDATE public.users
  SET donor_level = v_new_level
  WHERE id = NEW.user_id;

  -- Next eligible date: +56 days (8 weeks) from donation date
  v_next_date := NEW.date + INTERVAL '56 days';

  -- Upsert donor_insights
  INSERT INTO public.donor_insights (
    user_id,
    total_donations,
    estimated_lives_impacted,
    donation_streak,
    next_window_date,
    updated_at
  )
  VALUES (
    NEW.user_id,
    v_total,
    v_total * 3,   -- Each donation can help up to 3 people
    1,
    v_next_date,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_donations          = v_total,
    estimated_lives_impacted = v_total * 3,
    next_window_date         = v_next_date,
    updated_at               = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_donation_inserted
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_insert();

-- ─────────────────────────────────────────────
-- TRIGGER 3: Keep users.updated_at fresh on profile edits
-- ─────────────────────────────────────────────
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
