import { BloodRequest, EligibilityResult, BloodType, User } from '@/types';
import { calculateEligibility } from '@/lib/eligibility';

export type RecommendedDonor = {
  donorId: string;
  donorName: string;
  bloodType: BloodType;
  isEligible: boolean;
  eligibility: EligibilityResult;
  distanceKm: number;
  matchScore: number;
  reasons: string[];
};

type CandidateDonor = User & {
  distanceKm: number;
};

const BLOOD_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  // Simplified MVP mapping: donor blood types that can satisfy requested blood type.
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'A+', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'B+', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

export function checkCompatibility(
  userBlood: BloodType | null,
  requestBloodNeeded: BloodType
): boolean {
  if (!userBlood) return false;
  const compatibleForNeeded = BLOOD_COMPATIBILITY[requestBloodNeeded] ?? [];
  return compatibleForNeeded.includes(userBlood);
}

function scoreForEligibility(eligibility: EligibilityResult): number {
  if (eligibility.status === 'eligible') return 50;
  if (eligibility.status === 'deferred') return 10;
  return 0;
}

function scoreForDistance(distanceKm: number): number {
  // closer = higher
  if (distanceKm <= 1) return 30;
  if (distanceKm <= 3) return 25;
  if (distanceKm <= 5) return 18;
  if (distanceKm <= 10) return 10;
  return 4;
}

function getDonorName(d: User) {
  return `${d.firstName} ${d.lastName}`;
}

export function getRecommendedDonors(params: {
  request: BloodRequest;
  candidateDonors: CandidateDonor[];
}): RecommendedDonor[] {
  const { request, candidateDonors } = params;

  return candidateDonors
    .map((donor) => {
      const reasons: string[] = [];

      const compatible = checkCompatibility(donor.bloodType, request.bloodTypeNeeded);
      if (donor.bloodType) {
        reasons.push(compatible ? 'Compatible' : 'Not compatible for this request');
      } else {
        reasons.push('Blood type not set');
      }

      const eligibility =
        donor.eligibilityStatus === 'eligible'
          ? { status: 'eligible' as const, nextEligibleDate: null, daysRemaining: 0 }
          : calculateEligibility(donor.lastDonationDate, donor.sex);
      const hasDonationHistory = donor.profileComplete && (donor.totalDonations > 0 || donor.eligibilityStatus === 'eligible');

      const isEligible = hasDonationHistory && eligibility.status === 'eligible';
      if (hasDonationHistory) {
        reasons.push(isEligible ? 'Eligible' : `Deferred (${eligibility.daysRemaining} days)`);
      } else {
        reasons.push('Eligibility incomplete');
      }

      const matchBase = compatible ? 60 : 0;
      const urgencyBoost =
        request.urgencyLevel === 'critical' ? 10 : request.urgencyLevel === 'urgent' ? 6 : 2;

      const matchScore =
        matchBase + scoreForEligibility(eligibility) + scoreForDistance(donor.distanceKm) + urgencyBoost;

      return {
        donorId: donor.id,
        donorName: getDonorName(donor),
        bloodType: donor.bloodType ?? ('O+' as BloodType),
        isEligible,
        eligibility,
        distanceKm: donor.distanceKm,
        matchScore,
        reasons,
      } satisfies RecommendedDonor;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function getEligibilitySummary(
  eligibility: EligibilityResult,
  profileComplete: boolean,
  totalDonations: number
) {
  if (!profileComplete || totalDonations === 0) return { label: 'Ineligible (complete profile)' };
  if (eligibility.status === 'eligible') return { label: 'Eligible' };
  if (eligibility.status === 'deferred') return { label: `Eligible in ${eligibility.daysRemaining} days` };
  return { label: 'Not eligible' };
}
