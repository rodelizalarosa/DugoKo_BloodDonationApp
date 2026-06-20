import { EligibilityResult } from '@/types';

const MALE_INTERVAL_DAYS = 84; // 12 weeks
// Note: in production this should branch on sex/gender per PRC guidelines
// (12 weeks general / 16 weeks for some donor groups). Kept simple for UI.

export function calculateEligibility(lastDonationDate: string | null): EligibilityResult {
  if (!lastDonationDate) {
    return { status: 'eligible', nextEligibleDate: null, daysRemaining: 0 };
  }

  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + MALE_INTERVAL_DAYS);

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
