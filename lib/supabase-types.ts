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
export type ThemePreference  = 'light' | 'dark';

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
  eligibility_status: EligibilityStatus;
  donor_level:        DonorLevel;
  role:               UserRole;
  total_donations:    number;
  last_donation_date: string | null;
  profile_complete:   boolean;
  theme_preference:   ThemePreference;
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
  id:               string;
  event_id:         string;
  user_id:          string;
  status:           RsvpStatus;
  time_slot:        string | null;
  contact_number:   string | null;
  decl_healthy:     boolean;
  decl_no_meds_14d: boolean;
  decl_consent:     boolean;
  created_at:       string;
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
  needed_by:         string | null;
  notes:             string | null;
  posted_by:         string | null;
  posted_at:         string;
}

export interface RequestResponseRow {
  id:             string;
  request_id:     string;
  user_id:        string;
  helper_name:    string | null;
  helper_contact: string | null;
  helper_email:   string | null;
  created_at:     string;
}

export interface DonationRow {
  id:             string;
  user_id:        string;
  event_id:       string | null;
  date:           string;
  venue:          string;
  branch:         string;
  blood_bag_ref:  string | null;
  donor_id:       string | null;
  is_verified:    boolean;
  verified_at:    string | null;
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
  source_title: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  is_active: boolean;
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
  Pick<UserRow, 'full_name' | 'phone' | 'blood_type' | 'birthdate' | 'weight_kg' | 'sex' | 'eligibility_status' | 'avatar_url' | 'profile_complete' | 'theme_preference'>
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
    Functions: {
      get_my_profile: {
        Args: Record<string, never>;
        Returns: UserRow;
      };
      update_my_profile: {
        Args: {
          p_full_name?: string;
          p_phone?: string;
          p_blood_type?: BloodType;
          p_birthdate?: string;
          p_weight_kg?: number;
          p_sex?: string;
          p_avatar_url?: string;
          p_profile_complete?: boolean;
          p_theme_preference?: ThemePreference;
          p_eligibility_status?: EligibilityStatus;
        };
        Returns: UserRow;
      };
      email_exists: {
        Args: {
          p_email: string;
        };
        Returns: boolean;
      };
      search_eligible_donors: {
        Args: {
          p_exclude_id?: string;
        };
        Returns: UserRow[];
      };
      pledge_request: {
        Args: {
          p_request_id: string;
          p_helper_name?: string;
          p_helper_contact?: string;
          p_helper_email?: string;
        };
        Returns: { units_pledged?: number; error?: string };
      };
    };
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
