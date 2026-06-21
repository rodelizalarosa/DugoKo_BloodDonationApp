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
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  return {
    id: row.id,
    firstName,
    lastName,
    email: row.email || '',
    bloodType: row.blood_type,
    birthdate: row.birthdate,
    weightKg: row.weight_kg ? Number(row.weight_kg) : null,
    donorLevel: row.donor_level,
    totalDonations: row.total_donations,
    lastDonationDate: row.last_donation_date,
    profileComplete: row.profile_complete,
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
    date: row.date,
    venue: row.venue,
    branch: row.branch,
    bloodBagRef: row.blood_bag_ref || undefined,
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
