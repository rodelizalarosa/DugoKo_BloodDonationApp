-- ═══════════════════════════════════════════════════════════════
-- DugóKo Database Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Insert Donation Centers
INSERT INTO public.centers (id, name, address, latitude, longitude, contact, hours)
VALUES 
  (
    'c1000000-0000-0000-0000-000000000001', 
    'Philippine Red Cross — Cebu Chapter', 
    'M.J. Cuenco Ave, Cebu City', 
    10.3157, 
    123.8854, 
    '(032) 255-5944', 
    '8:00 AM – 5:00 PM, Mon–Sat'
  ),
  (
    'c2000000-0000-0000-0000-000000000002', 
    'Vicente Sotto Memorial Medical Center Blood Bank', 
    'B. Rodriguez St, Cebu City', 
    10.3066, 
    123.8946, 
    '(032) 253-9891', 
    '8:00 AM – 4:00 PM, Daily'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Blood Letting Events
INSERT INTO public.events (id, title, date, time_start, time_end, venue, address, organizer, slots_available, description, latitude, longitude, center_id)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'SM City Cebu Blood Drive',
    '2026-06-20',
    '9:00 AM',
    '4:00 PM',
    'SM City Cebu, Activity Center',
    'North Reclamation Area, Cebu City',
    'Philippine Red Cross Cebu',
    23,
    'Walk-ins welcome. Bring a valid ID. Light snacks and a donor certificate provided after donation.',
    10.3117,
    123.9180,
    'c1000000-0000-0000-0000-000000000001'
  ),
  (
    'e2000000-0000-0000-0000-000000000002',
    'Ayala Center Cebu Donor Day',
    '2026-07-02',
    '10:00 AM',
    '3:00 PM',
    'Ayala Center Cebu, Atrium',
    'Cebu Business Park, Cebu City',
    'PRC Cebu Chapter',
    41,
    'Part of the mid-year donor replenishment drive.',
    10.3174,
    123.9056,
    'c1000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert FAQs
INSERT INTO public.faq (id, question, answer, keywords, category)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'Can I donate after getting a tattoo?',
    'You need to wait at least 6 months after getting a tattoo or piercing from an unlicensed facility before donating blood, per Philippine Red Cross guidelines. Licensed, sterile facilities may shorten this window — check with your nearest PRC chapter.',
    ARRAY['tattoo', 'piercing', 'wait', 'deferral'],
    'Eligibility'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'How often can I donate blood?',
    'Whole blood donors can give again after 3 months (12 weeks) for men, and 4 months (16 weeks) for women, to allow the body to fully replenish red blood cells.',
    ARRAY['frequency', 'how often', 'interval'],
    'Eligibility'
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'What should I eat before donating?',
    'Eat a balanced, iron-rich meal and drink plenty of water before your donation. Avoid fatty foods, as they can affect blood test results. Do not donate on an empty stomach.',
    ARRAY['food', 'eat', 'preparation', 'before'],
    'Preparation'
  ),
  (
    'f4000000-0000-0000-0000-000000000004',
    'Can I donate while on medication?',
    'It depends on the medication. Most maintenance medications for stable conditions are fine, but antibiotics, blood thinners, and some other drugs require a waiting period. A PRC screening nurse will assess this on-site.',
    ARRAY['medication', 'medicine', 'drugs'],
    'Eligibility'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Learn Articles
INSERT INTO public.learn_articles (id, title, category, summary, read_minutes, cover_emoji, content)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Who Can Donate Blood?',
    'Basics',
    'The core requirements for first-time donors in the Philippines.',
    3,
    '🩸',
    'To donate blood in the Philippines, you generally need to be 16–65 years old, weigh at least 50kg, and be in good general health. First-time donors aged 16-17 need parental consent. A screening interview and mini physical exam (blood pressure, hemoglobin, pulse) happens before every donation.'
  ),
  (
    'a2000000-0000-0000-0000-000000000002',
    'What Happens to Your Blood After You Donate',
    'Process',
    'From the bag to the patient — the journey of a single donation.',
    4,
    '🔬',
    'After collection, your blood is tested, typed, and separated into components — red cells, plasma, and platelets — so a single donation can help up to three patients. It is screened for transfusion-transmissible infections before release to hospitals.'
  ),
  (
    'a3000000-0000-0000-0000-000000000003',
    'Myths About Blood Donation',
    'Myths',
    'Common misconceptions that keep eligible donors away.',
    5,
    '💭',
    'Donating blood does not make you weak long-term, you cannot contract a disease from donating since sterile single-use needles are used, and diabetics on stable oral medication can usually donate.'
  )
ON CONFLICT (id) DO NOTHING;
