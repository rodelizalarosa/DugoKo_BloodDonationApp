import { EligibilityResult } from '@/types';

export const ELIGIBILITY_DISCLAIMER =
  'This eligibility check is for informational purposes only and does not replace the official assessment by the Philippine Red Cross (PRC) or a licensed medical professional. Final eligibility is determined on-site by a PRC nurse or physician during the screening process.';

/**
 * Sex-based deferral intervals per Philippine Red Cross guidelines:
 * - Male:   12 weeks (84 days)
 * - Female: 16 weeks (112 days)
 */
const DEFERRAL_INTERVAL_DAYS: Record<string, number> = {
  male:   84,
  female: 112,
};
const DEFAULT_INTERVAL_DAYS = 84;

export function getDeferralIntervalDays(sex: string | null | undefined): number {
  if (sex && sex.toLowerCase() in DEFERRAL_INTERVAL_DAYS) {
    return DEFERRAL_INTERVAL_DAYS[sex.toLowerCase()];
  }
  return DEFAULT_INTERVAL_DAYS;
}

export function calculateEligibility(
  lastDonationDate: string | null,
  sex?: string | null
): EligibilityResult {
  if (!lastDonationDate) {
    return { status: 'eligible', nextEligibleDate: null, daysRemaining: 0 };
  }

  const intervalDays = getDeferralIntervalDays(sex ?? null);

  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + intervalDays);

  const today = new Date();
  const diffMs = next.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    status: daysRemaining > 0 ? 'deferred' : 'eligible',
    nextEligibleDate: next.toISOString().slice(0, 10),
    daysRemaining,
  };
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
