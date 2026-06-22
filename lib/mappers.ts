import type {
  UserRow,
  EventRow,
  CenterRow,
  BloodRequestRow,
  LearnArticleRow,
  CommunityPostRow,
  DonationRow,
  DonorInsightRow,
} from '@/lib/supabase-types';
import type {
  User,
  BloodEvent,
  DonationCenter,
  BloodRequest,
  LearnArticle,
  CommunityPost,
  Donation,
  DonorInsight,
} from '@/types';

export function mapUser(row: UserRow): User {
  const names = row.full_name ? row.full_name.trim().split(/\s+/) : [];
  let firstName = names[0] || '';
  let middleName = '';
  let lastName = '';

  if (names.length === 2) {
    // If the second token is a single letter, treat it as a middle initial, not a last name
    if (names[1].length === 1) {
      middleName = names[1];
    } else {
      lastName = names[1];
    }
  } else if (names.length >= 3) {
    // Single-letter token after first name = middle initial
    if (names[1].length === 1) {
      middleName = names[1];
      lastName = names.slice(2).join(' ');
    } else {
      lastName = names.slice(1).join(' ');
    }
  }

  return {
    id: row.id,
    firstName,
    middleName: middleName || undefined,
    lastName,
    email: row.email || '',
    phone: row.phone || undefined,
    bloodType: row.blood_type,
    birthdate: row.birthdate,
    weightKg: row.weight_kg ? Number(row.weight_kg) : null,
    sex: row.sex || undefined,
    eligibilityStatus: row.eligibility_status,
    donorLevel: row.donor_level,
    totalDonations: row.total_donations,
    lastDonationDate: row.last_donation_date,
    profileComplete: row.profile_complete,
    themePreference: row.theme_preference,
    avatarUrl: row.avatar_url || undefined,
  };
}

export function mapEvent(row: EventRow): BloodEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    timeStart: row.time_start,
    timeEnd: row.time_end,
    venue: row.venue,
    address: row.address,
    organizer: row.organizer,
    slotsAvailable: row.slots_available,
    description: row.description || '',
    latitude: row.latitude || undefined,
    longitude: row.longitude || undefined,
  };
}

export function mapCenter(row: CenterRow): DonationCenter {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    contact: row.contact || '',
    hours: row.hours || '',
  };
}

export function mapBloodRequest(row: BloodRequestRow): BloodRequest {
  return {
    id: row.id,
    hospital: row.hospital,
    address: row.address || '',
    bloodTypeNeeded: row.blood_type_needed,
    unitsNeeded: row.units_needed,
    unitsPledged: row.units_pledged,
    urgencyLevel: row.urgency_level,
    status: row.status,
    postedAt: row.posted_at,
    notes: row.notes || undefined,
  };
}

export function mapLearnArticle(row: LearnArticleRow): LearnArticle {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    readMinutes: row.read_minutes,
    coverEmoji: row.cover_emoji || '',
    content: row.content,
  };
}

export function mapCommunityPost(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    type: row.type,
    authorName: row.author_name,
    authorAvatarUrl: row.author_avatar_url || undefined,
    title: row.title,
    body: row.body,
    postedAt: row.posted_at,
    relatedRequestId: row.related_request_id || undefined,
  };
}

export function mapDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    date: row.date,
    venue: row.venue,
    branch: row.branch,
    bloodBagRef: row.blood_bag_ref || undefined,
    donorId: row.donor_id || undefined,
    isVerified: row.is_verified,
    bloodPressure: row.blood_pressure || undefined,
    hemoglobin: row.hemoglobin || undefined,
    pulse: row.pulse || undefined,
    notes: row.notes || undefined,
  };
}

export function mapDonorInsight(row: DonorInsightRow): DonorInsight {
  return {
    totalDonations: row.total_donations,
    estimatedLivesImpacted: row.estimated_lives_impacted,
    donationStreak: row.donation_streak,
    nextWindowDate: row.next_window_date,
  };
}
