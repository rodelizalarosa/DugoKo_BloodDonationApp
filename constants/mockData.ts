import {
  AppNotification,
  BloodEvent,
  BloodRequest,
  CommunityPost,
  Donation,
  DonationCenter,
  DonorInsight,
  FaqItem,
  LearnArticle,
  User,
} from '@/types';

export const mockUser: User = {
  id: 'u1',
  firstName: 'Juan',
  middleName: 'Gomez',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@email.com',
  bloodType: 'O+',
  birthdate: '1996-04-12',
  weightKg: 68,
  donorLevel: 'Hero Donor',
  totalDonations: 4,
  lastDonationDate: '2026-04-12',
  profileComplete: false, // Changed to false for demonstration
};

export const mockEvents: BloodEvent[] = [
  {
    id: 'e1',
    title: 'SM City Cebu Blood Drive',
    date: '2026-06-20',
    timeStart: '9:00 AM',
    timeEnd: '4:00 PM',
    venue: 'SM City Cebu, Activity Center',
    address: 'North Reclamation Area, Cebu City',
    organizer: 'Philippine Red Cross Cebu',
    slotsAvailable: 23,
    description:
      'Walk-ins welcome. Bring a valid ID. Light snacks and a donor certificate provided after donation.',
    latitude: 10.3117,
    longitude: 123.9180,
  },
  {
    id: 'e2',
    title: 'Ayala Center Cebu Donor Day',
    date: '2026-07-02',
    timeStart: '10:00 AM',
    timeEnd: '3:00 PM',
    venue: 'Ayala Center Cebu, Atrium',
    address: 'Cebu Business Park, Cebu City',
    organizer: 'PRC Cebu Chapter',
    slotsAvailable: 41,
    description: 'Part of the mid-year donor replenishment drive.',
    latitude: 10.3174,
    longitude: 123.9056,
  },
];

export const mockRequests: BloodRequest[] = [
  {
    id: 'r1',
    hospital: 'Cebu Doctors Hospital',
    address: 'Osmeña Blvd, Cebu City',
    bloodTypeNeeded: 'O+',
    unitsNeeded: 2,
    unitsPledged: 0,
    urgencyLevel: 'critical',
    status: 'open',
    postedAt: '2026-06-19T06:30:00Z',
    notes: 'For a scheduled surgery patient. Walk in any time today.',
  },
  {
    id: 'r2',
    hospital: 'Chong Hua Hospital',
    address: 'Don Mariano Cui St, Cebu City',
    bloodTypeNeeded: 'AB-',
    unitsNeeded: 1,
    unitsPledged: 1,
    urgencyLevel: 'moderate',
    status: 'open',
    postedAt: '2026-06-18T10:00:00Z',
  },
];

export const mockCenters: DonationCenter[] = [
  {
    id: 'c1',
    name: 'Philippine Red Cross — Cebu Chapter',
    address: 'M.J. Cuenco Ave, Cebu City',
    latitude: 10.3157,
    longitude: 123.8854,
    contact: '(032) 255-5944',
    hours: '8:00 AM – 5:00 PM, Mon–Sat',
  },
  {
    id: 'c2',
    name: 'Vicente Sotto Memorial Medical Center Blood Bank',
    address: 'B. Rodriguez St, Cebu City',
    latitude: 10.3066,
    longitude: 123.8946,
    contact: '(032) 253-9891',
    hours: '8:00 AM – 4:00 PM, Daily',
  },
];

export const mockDonations: Donation[] = [
  { id: 'd1', userId: 'u1', date: '2025-08-12', venue: 'Ayala Center Cebu', branch: 'PRC Cebu', bloodBagRef: '88231' },
  { id: 'd2', userId: 'u1', date: '2025-11-20', venue: 'SM City Cebu', branch: 'PRC Cebu', bloodBagRef: '90112' },
  { id: 'd3', userId: 'u1', date: '2026-02-05', venue: 'IT Park Donor Day', branch: 'PRC Cebu', bloodBagRef: '91344' },
  { id: 'd4', userId: 'u1', date: '2026-04-12', venue: 'SM City Cebu', branch: 'PRC Cebu', bloodBagRef: '93020' },
];

export const mockInsight: DonorInsight = {
  totalDonations: 4,
  estimatedLivesImpacted: 12,
  donationStreak: 3,
  nextWindowDate: '2026-08-12',
};

export const mockFaqs: FaqItem[] = [
  {
    id: 'f1',
    question: 'Can I donate after getting a tattoo?',
    answer:
      'You need to wait at least 6 months after getting a tattoo or piercing from an unlicensed facility before donating blood, per Philippine Red Cross guidelines. Licensed, sterile facilities may shorten this window — check with your nearest PRC chapter.',
    keywords: ['tattoo', 'piercing', 'wait', 'deferral'],
    category: 'Eligibility',
  },
  {
    id: 'f2',
    question: 'How often can I donate blood?',
    answer:
      'Whole blood donors can give again after 3 months (12 weeks) for men, and 4 months (16 weeks) for women, to allow the body to fully replenish red blood cells.',
    keywords: ['frequency', 'how often', 'interval'],
    category: 'Eligibility',
  },
  {
    id: 'f3',
    question: 'What should I eat before donating?',
    answer:
      'Eat a balanced, iron-rich meal and drink plenty of water before your donation. Avoid fatty foods, as they can affect blood test results. Do not donate on an empty stomach.',
    keywords: ['food', 'eat', 'preparation', 'before'],
    category: 'Preparation',
  },
  {
    id: 'f4',
    question: 'Can I donate while on medication?',
    answer:
      'It depends on the medication. Most maintenance medications for stable conditions are fine, but antibiotics, blood thinners, and some other drugs require a waiting period. A PRC screening nurse will assess this on-site.',
    keywords: ['medication', 'medicine', 'drugs'],
    category: 'Eligibility',
  },
];

export const mockArticles: LearnArticle[] = [
  {
    id: 'a1',
    title: 'Who Can Donate Blood?',
    category: 'Basics',
    summary: 'The core requirements for first-time donors in the Philippines.',
    readMinutes: 3,
    coverEmoji: '🩸',
    content:
      'To donate blood in the Philippines, you generally need to be 16–65 years old, weigh at least 50kg, and be in good general health. First-time donors aged 16-17 need parental consent. A screening interview and mini physical exam (blood pressure, hemoglobin, pulse) happens before every donation.',
  },
  {
    id: 'a2',
    title: 'What Happens to Your Blood After You Donate',
    category: 'Process',
    summary: 'From the bag to the patient — the journey of a single donation.',
    readMinutes: 4,
    coverEmoji: '🔬',
    content:
      'After collection, your blood is tested, typed, and separated into components — red cells, plasma, and platelets — so a single donation can help up to three patients. It is screened for transfusion-transmissible infections before release to hospitals.',
  },
  {
    id: 'a3',
    title: 'Myths About Blood Donation',
    category: 'Myths',
    summary: 'Common misconceptions that keep eligible donors away.',
    readMinutes: 5,
    coverEmoji: '💭',
    content:
      'Donating blood does not make you weak long-term, you cannot contract a disease from donating since sterile single-use needles are used, and diabetics on stable oral medication can usually donate.',
  },
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'p1',
    type: 'request',
    authorName: 'Cebu Doctors Hospital',
    title: 'Critical: O+ needed today',
    body: 'A patient is scheduled for surgery this afternoon and needs 2 units of O+ blood. Every minute counts.',
    postedAt: '2026-06-19T06:30:00Z',
    relatedRequestId: 'r1',
  },
  {
    id: 'p4',
    type: 'request',
    authorName: 'Vicente Sotto Memorial',
    title: 'Urgent: AB- for Newborn',
    body: 'A newborn baby in the NICU urgently needs 1 unit of AB- blood. Please share this with your networks.',
    postedAt: '2026-06-19T08:15:00Z',
  },
  {
    id: 'p5',
    type: 'story',
    authorName: 'Robert Lim',
    title: 'My First Time Donating!',
    body: 'Was nervous at first but the staff at SM City Cebu were amazing. It feels great to know I might have helped someone today.',
    postedAt: '2026-06-19T10:00:00Z',
  },
  {
    id: 'p2',
    type: 'story',
    authorName: 'Maria Santos',
    title: 'My 10th donation today!',
    body: 'Hit double digits this morning at the PRC Cebu chapter. Every drop counts — see you at the next drive!',
    postedAt: '2026-06-17T09:00:00Z',
  },
  {
    id: 'p6',
    type: 'announcement',
    authorName: 'PRC Cebu',
    title: 'Extended Hours This Weekend',
    body: 'To accommodate more donors, we are extending our chapter hours until 8PM this Saturday and Sunday.',
    postedAt: '2026-06-16T15:00:00Z',
  },
  {
    id: 'p3',
    type: 'announcement',
    authorName: 'DugóKo Team',
    title: 'New donor badges this month',
    body: 'We added new milestone badges for 5, 10, and 25 donations. Check your profile to see your progress.',
    postedAt: '2026-06-15T08:00:00Z',
  },
  {
    id: 'p7',
    type: 'request',
    authorName: 'Chong Hua Hospital',
    title: 'Pledge: B+ needed for dialysis',
    body: 'Patient requires regular dialysis and needs B+ blood supply for this week.',
    postedAt: '2026-06-14T11:00:00Z',
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Urgent: O+ Needed',
    body: 'A critical request for O+ blood has been posted at Cebu Doctors Hospital.',
    type: 'critical',
    timestamp: '2026-06-19T06:45:00Z',
    read: false,
  },
  {
    id: 'n2',
    title: 'Eligibility Reminder',
    body: 'You will be eligible to donate again in 14 days! Schedule your next visit.',
    type: 'info',
    timestamp: '2026-06-18T09:00:00Z',
    read: true,
  },
  {
    id: 'n3',
    title: 'Hero Badge Earned!',
    body: 'Congratulations! You just earned the "Hero Donor" badge for your 4th donation.',
    type: 'success',
    timestamp: '2026-06-12T14:30:00Z',
    read: true,
  },
];
