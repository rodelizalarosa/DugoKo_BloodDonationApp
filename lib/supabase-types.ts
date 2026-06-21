/**
 * lib/supabase-types.ts
 * ─────────────────────────────────────────────────────────────────
 * TypeScript types mirroring the Supabase database schema.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Enum types ────────────────────────────────────────────────────
export type BloodType        = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type DonorLevel       = 'New Donor' | 'Regular Donor' | 'Hero Donor' | 'Lifesaver';
export type EligibilityStatus = 'eligible' | 'deferred' | 'not_eligible' | 'unknown';
export type RsvpStatus       = 'going' | 'interested' | 'cancelled';
export type UrgencyLevel     = 'critical' | 'urgent' | 'moderate';
export type RequestStatus    = 'open' | 'fulfilled' | 'closed';
export type PostType         = 'request' | 'story' | 'announcement';
export type UserRole         = 'donor' | 'admin' | 'moderator';

// ── Row types (shape of each table row) ──────────────────────────
export interface UserRow {
  id:                 string;
  full_name:          string;
  email:              string | null;
  phone:              string | null;
  blood_type:         BloodType | null;
  birthdate:          string | null;
  weight_kg:          number | null;
  sex:                string | null;
  donor_level:        DonorLevel;
  role:               UserRole;
  total_donations:    number;
  last_donation_date: string | null;
  profile_complete:   boolean;
  avatar_url:         string | null;
  created_at:         string;
  updated_at:         string;
}

export interface CenterRow {
  id:        string;
  name:      string;
  address:   string;
  latitude:  number;
  longitude: number;
  contact:   string | null;
  hours:     string | null;
}

export interface EventRow {
  id:              string;
  title:           string;
  date:            string;
  time_start:      string;
  time_end:        string;
  venue:           string;
  address:         string;
  organizer:       string;
  slots_available: number;
  description:     string | null;
  latitude:        number | null;
  longitude:       number | null;
  center_id:       string | null;
  created_at:      string;
}

export interface EventRsvpRow {
  id:         string;
  event_id:   string;
  user_id:    string;
  status:     RsvpStatus;
  time_slot:  string | null;
  created_at: string;
}

export interface BloodRequestRow {
  id:                string;
  hospital:          string;
  address:           string | null;
  blood_type_needed: BloodType;
  units_needed:      number;
  units_pledged:     number;
  urgency_level:     UrgencyLevel;
  status:            RequestStatus;
  notes:             string | null;
  posted_by:         string | null;
  posted_at:         string;
}

export interface RequestResponseRow {
  id:         string;
  request_id: string;
  user_id:    string;
  created_at: string;
}

export interface DonationRow {
  id:             string;
  user_id:        string;
  event_id:       string | null;
  date:           string;
  venue:          string;
  branch:         string;
  blood_bag_ref:  string | null;
  blood_pressure: string | null;
  hemoglobin:     string | null;
  pulse:          string | null;
  notes:          string | null;
  created_at:     string;
}

export interface DonorInsightRow {
  user_id:                  string;
  total_donations:          number;
  estimated_lives_impacted: number;
  donation_streak:          number;
  next_window_date:         string | null;
  updated_at:               string;
}

export interface FaqRow {
  id:       string;
  question: string;
  answer:   string;
  keywords: string[];
  category: string;
}

export interface LearnArticleRow {
  id:           string;
  title:        string;
  category:     string;
  summary:      string;
  read_minutes: number;
  cover_emoji:  string | null;
  content:      string;
  published_at: string;
}

export interface CommunityPostRow {
  id:                 string;
  type:               PostType;
  author_id:          string | null;
  author_name:        string;
  author_avatar_url:  string | null;
  title:              string;
  body:               string;
  related_request_id: string | null;
  posted_at:          string;
}

// ── Insert types (omit generated fields) ────────────────────────
export type InsertDonation = Omit<DonationRow, 'id' | 'created_at'>;
export type InsertEventRsvp = Omit<EventRsvpRow, 'id' | 'created_at'>;
export type InsertBloodRequest = Omit<BloodRequestRow, 'id' | 'posted_at' | 'units_pledged'>;
export type InsertCommunityPost = Omit<CommunityPostRow, 'id' | 'posted_at'>;
export type UpdateUserProfile = Partial<
  Pick<UserRow, 'full_name' | 'phone' | 'blood_type' | 'birthdate' | 'weight_kg' | 'sex' | 'avatar_url' | 'profile_complete'>
>;

// ── Supabase Database generic (used by createClient<Database>) ────
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Partial<UserRow>;
        Update: Partial<UserRow>;
        Relationships: [];
      };
      centers: {
        Row: CenterRow;
        Insert: Partial<CenterRow>;
        Update: Partial<CenterRow>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      event_rsvp: {
        Row: EventRsvpRow;
        Insert: InsertEventRsvp;
        Update: Partial<EventRsvpRow>;
        Relationships: [];
      };
      blood_requests: {
        Row: BloodRequestRow;
        Insert: InsertBloodRequest;
        Update: Partial<BloodRequestRow>;
        Relationships: [];
      };
      request_responses: {
        Row: RequestResponseRow;
        Insert: Partial<RequestResponseRow>;
        Update: Partial<RequestResponseRow>;
        Relationships: [];
      };
      donations: {
        Row: DonationRow;
        Insert: InsertDonation;
        Update: Partial<DonationRow>;
        Relationships: [];
      };
      donor_insights: {
        Row: DonorInsightRow;
        Insert: Partial<DonorInsightRow>;
        Update: Partial<DonorInsightRow>;
        Relationships: [];
      };
      faq: {
        Row: FaqRow;
        Insert: Partial<FaqRow>;
        Update: Partial<FaqRow>;
        Relationships: [];
      };
      learn_articles: {
        Row: LearnArticleRow;
        Insert: Partial<LearnArticleRow>;
        Update: Partial<LearnArticleRow>;
        Relationships: [];
      };
      community_posts: {
        Row: CommunityPostRow;
        Insert: InsertCommunityPost;
        Update: Partial<CommunityPostRow>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      blood_type:         BloodType;
      donor_level:        DonorLevel;
      eligibility_status: EligibilityStatus;
      rsvp_status:        RsvpStatus;
      urgency_level:      UrgencyLevel;
      request_status:     RequestStatus;
      post_type:          PostType;
      user_role:          UserRole;
    };
    CompositeTypes: {};
  };
}
