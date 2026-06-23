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
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'DOH Subnational Blood Center for Visayas',
    'M.C. Briones St, Mandaue City',
    10.3312,
    123.9431,
    '(032) 505-7090',
    '8:00 AM – 5:00 PM, Mon–Fri'
  ),
  (
    'c4000000-0000-0000-0000-000000000004',
    'Chong Hua Hospital Blood Bank',
    'Don Mariano Cui St, Cebu City',
    10.3098,
    123.8925,
    '(032) 255-8000',
    '24/7, Open Daily'
  ),
  (
    'c5000000-0000-0000-0000-000000000005',
    'Cebu Doctors'' University Hospital Blood Bank',
    'Osmeña Blvd, Cebu City',
    10.3125,
    123.8907,
    '(032) 255-5555',
    '24/7, Open Daily'
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
  ),
  (
    'e3000000-0000-0000-0000-000000000003',
    'Robinsons Galleria Cebu Blood Letting',
    '2026-07-28',
    '10:00 AM',
    '4:00 PM',
    'Robinsons Galleria Cebu, Level 2',
    'Gen. Maxilom Ave, Cebu City',
    'DOH Blood Center',
    35,
    'Join our community blood letting activity. All donors get a free health check.',
    10.3055,
    123.9095,
    'c3000000-0000-0000-0000-000000000003'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Blood Requests for the Home / Community feed
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

-- 4. Insert Community Posts for the Home feed
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

-- 5. Insert FAQs
INSERT INTO public.faq (id, question, answer, keywords, category, source_title, source_url, last_verified_at, is_active)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'Can I donate after getting a tattoo?',
    'You need to wait at least 6 months after getting a tattoo or piercing from an unlicensed facility before donating blood, per Philippine Red Cross guidelines. Licensed, sterile facilities may shorten this window — check with your nearest PRC chapter.',
    ARRAY['tattoo', 'piercing', 'wait', 'deferral'],
    'Eligibility',
    'Philippine Red Cross Blood Donation Guidance',
    'https://redcross.org.ph/',
    '2026-06-22',
    TRUE
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'How often can I donate blood?',
    'Whole blood donors can give again after 3 months (12 weeks) for men, and 4 months (16 weeks) for women, to allow the body to fully replenish red blood cells.',
    ARRAY['frequency', 'how often', 'interval'],
    'Eligibility',
    'Philippine Red Cross Blood Donation Guidance',
    'https://redcross.org.ph/',
    '2026-06-22',
    TRUE
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'What should I eat before donating?',
    'Eat a balanced, iron-rich meal and drink plenty of water before your donation. Avoid fatty foods, as they can affect blood test results. Do not donate on an empty stomach.',
    ARRAY['food', 'eat', 'preparation', 'before'],
    'Preparation',
    'Philippine Red Cross Blood Donation Guidance',
    'https://redcross.org.ph/',
    '2026-06-22',
    TRUE
  ),
  (
    'f4000000-0000-0000-0000-000000000004',
    'Can I donate while on medication?',
    'It depends on the medication. Most maintenance medications for stable conditions are fine, but antibiotics, blood thinners, and some other drugs require a waiting period. A PRC screening nurse will assess this on-site.',
    ARRAY['medication', 'medicine', 'drugs'],
    'Eligibility',
    'Philippine Red Cross Blood Donation Guidance',
    'https://redcross.org.ph/',
    '2026-06-22',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Learn Articles
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
  ),
  (
    'a4000000-0000-0000-0000-000000000004',
    'Blood Types: Who Can Donate To Whom?',
    'Basics',
    'Understanding blood type compatibility and matching.',
    4,
    '🩵',
    'There are 8 blood types: A+, A-, B+, B-, AB+, AB-, O+, and O-. O- is the universal donor (can give to anyone). AB+ is the universal recipient (can receive from anyone). Type O+ donors can give to all positive types (A+, B+, AB+, O+). Type A- and B- can donate to their matching type and AB. Knowing your blood type helps you understand who you can help.'
  ),
  (
    'a5000000-0000-0000-0000-000000000005',
    'Blood Type Compatibility Chart',
    'Basics',
    'Quick reference for blood type matching.',
    3,
    '📊',
    'O- can give to ALL types (universal donor). O+ can give to O+, A+, B+, AB+. A- can give to A-, A+, AB-, AB+. A+ can give to A+, AB+. B- can give to B-, B+, AB-, AB+. B+ can give to B+, AB+. AB- can give to AB-, AB+. AB+ can give to AB+ only.'
  ),
  (
    'a6000000-0000-0000-0000-000000000006',
    'Pre-Donation Checklist',
    'Basics',
    'What to do before and after donating blood.',
    3,
    '✅',
    'Before donating: Get adequate sleep (at least 6 hours), eat a good meal (avoid fatty foods), stay hydrated with water or juice, bring valid ID. After donating: Rest for 15-20 minutes,eat and drink to recover, avoid heavy lifting for 5 hours, keep the bandage on for 4-6 hours.'
  ),
  (
    'a7000000-0000-0000-0000-000000000007',
    'Factors That Affect Blood Donation Eligibility',
    'Health',
    'Medical conditions that may prevent you from donating.',
    5,
    '⚕️',
    'You may be deferred if you have: Fever or flu symptoms, low hemoglobin, certain chronic illnesses (some heart/liver/kidney conditions), recent tattoos or piercings (6 months), recent surgery (12 months), pregnancy or recently gave birth (6 months for normal delivery, 12 months for C-section). Certain medications may also defer you. A staff member will review your eligibility during screening.'
  ),
  (
    'a8000000-0000-0000-0000-000000000008',
    'How Often Can You Donate?',
    'Basics',
    'Understanding donation intervals and limits.',
    3,
    '📅',
    'In the Philippines, male donors can give every 12 weeks (84 days), and female donors can give every 16 weeks (112 days) due to lower iron levels. Whole blood donation takes about 10-15 minutes. Your body replaces the plasma within 24-48 hours, and red blood cells within 4-6 weeks.'
  ),
  (
    'a9000000-0000-0000-0000-000000000009',
    'Is It Safe to Donate Blood?',
    'Safety',
    'Understanding the safety measures during donation.',
    3,
    '🛡️',
    'Blood donation is very safe. New, sterile, single-use needles are used for each donor and immediately discarded after use. All equipment is FDA-approved. The screening process ensures donor safety. Less than 1% of donors experience any reaction, mostly minor dizziness that resolves quickly.'
  ),
  (
    'a10000000-0000-0000-0000-000000000010',
    'What is Apheresis?',
    'Process',
    'Learn about donating specific blood components.',
    4,
    '🧪',
    'Apheresis is a method of collecting only specific blood components (platelets, plasma, or red cells) while returning the rest to the donor. Platelet apheresis takes about 90 minutes but can help more patients. Plasma donation takes about 45 minutes. You may be eligible to donate components even if not eligible for whole blood.'
  ),
  (
    'a11000000-0000-0000-0000-000000000011',
    'Benefits of Donating Blood',
    'Health',
    'Surprising health benefits for donors.',
    3,
    '❤️',
    'Regular blood donation may reduce iron overload, improve cardiovascular health, and provide a free mini-health checkup. Studies show donating blood may lower the risk of certain cancers. Most importantly, your donation can save up to 3 lives! The greatest benefit is knowing you helped someone in need.'
  ),
  (
    'a12000000-0000-0000-0000-000000000012',
    'Common Donation Side Effects',
    'Health',
    'What to expect and how to handle reactions.',
    3,
    '🤕',
    'Most donors feel fine. Minor side effects include: dizziness (can be prevented by eating and drinking), bruise at needle site (normal, fades in days), soreness (apply ice). Severe reactions are rare (<1%). If you feel unwell, tell staff immediately. Resting for 15 minutes and eating a snack usually helps.'
  )
ON CONFLICT (id) DO NOTHING;
