export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type DonorLevel = 'New Donor' | 'Regular Donor' | 'Hero Donor' | 'Lifesaver';

export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  bloodType: BloodType | null;
  birthdate: string | null;
  weightKg: number | null;
  donorLevel: DonorLevel;
  totalDonations: number;
  lastDonationDate: string | null;
  profileComplete: boolean;
  avatarUrl?: string;
}

export type EligibilityStatus = 'eligible' | 'deferred' | 'not_eligible' | 'unknown';

export interface EligibilityResult {
  status: EligibilityStatus;
  nextEligibleDate: string | null;
  daysRemaining: number;
  reason?: string;
}

export interface BloodEvent {
  id: string;
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  address: string;
  organizer: string;
  slotsAvailable: number;
  description: string;
  latitude?: number;
  longitude?: number;
}

export type RsvpStatus = 'going' | 'interested' | 'cancelled';

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
}

export type UrgencyLevel = 'critical' | 'urgent' | 'moderate';
export type RequestStatus = 'open' | 'fulfilled' | 'closed';

export interface BloodRequest {
  id: string;
  hospital: string;
  address: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  unitsPledged: number;
  urgencyLevel: UrgencyLevel;
  status: RequestStatus;
  postedAt: string;
  notes?: string;
}

export interface DonationCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  hours: string;
}

export interface Donation {
  id: string;
  userId: string;
  date: string;
  venue: string;
  branch: string;
  bloodBagRef?: string;
  bloodPressure?: string;
  hemoglobin?: string;
  pulse?: string;
  notes?: string;
}

export interface DonorInsight {
  totalDonations: number;
  estimatedLivesImpacted: number;
  donationStreak: number;
  nextWindowDate: string | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export interface LearnArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  readMinutes: number;
  coverEmoji: string;
  content: string;
}

export interface CommunityPost {
  id: string;
  type: 'request' | 'story' | 'announcement';
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  body: string;
  postedAt: string;
  relatedRequestId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
}
