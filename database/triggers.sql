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
  v_total       INTEGER;
  v_new_level   donor_level;
  v_next_date   DATE;
  v_prev_date   DATE;
  v_streak      INTEGER;
  v_user_sex    TEXT;
  v_interval_days INTEGER;
BEGIN
  -- Increment total and update last_donation_date
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

  -- Get user's sex to determine deferral interval
  SELECT sex INTO v_user_sex FROM public.users WHERE id = NEW.user_id;
  v_interval_days := CASE WHEN v_user_sex = 'female' THEN 112 ELSE 84 END;  -- 16wk / 12wk

  -- Next eligible date from donation date
  v_next_date := NEW.date + (v_interval_days || ' days')::INTERVAL;

  -- Compute donation streak:
  -- Streak = number of donations in the last 2 years where gaps are reasonable
  -- If no previous donation, streak = 1
  -- If previous donation was within 2 years, streak = all donations in last 2 years
  -- Otherwise, reset to 1
  SELECT date INTO v_prev_date
  FROM public.donations
  WHERE user_id = NEW.user_id AND id != NEW.id
  ORDER BY date DESC
  LIMIT 1;

  IF v_prev_date IS NULL THEN
    v_streak := 1;
  ELSIF NEW.date - v_prev_date <= 730 THEN  -- 2 years
    SELECT COUNT(*) INTO v_streak
    FROM public.donations
    WHERE user_id = NEW.user_id
      AND date >= (NEW.date - INTERVAL '730 days');
  ELSE
    v_streak := 1;
  END IF;

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
    v_streak,
    v_next_date,
    now()
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
