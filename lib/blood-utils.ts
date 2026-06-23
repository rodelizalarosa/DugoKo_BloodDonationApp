import { BloodType } from './supabase-types';

export const COMPAT_RULES: Record<BloodType, BloodType[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Can only donate to own type
};

/**
 * Checks if a donor blood type can provide to a recipient blood type.
 */
export function canDonateTo(donor: BloodType | null, recipient: BloodType | null): boolean {
  if (!donor || !recipient) return false;
  const allowed = COMPAT_RULES[donor];
  return allowed ? allowed.includes(recipient) : false;
}

/**
 * Checks if a recipient blood type can receive from a donor blood type.
 */
export function canReceiveFrom(recipient: BloodType | null, donor: BloodType | null): boolean {
  if (!recipient || !donor) return false;
  // Reciprocally, check if the donor can donate to the recipient
  return canDonateTo(donor, recipient);
}

export function getCompatibleDonors(targetType: BloodType): BloodType[] {
  return (Object.keys(COMPAT_RULES) as BloodType[]).filter(bt => canDonateTo(bt, targetType));
}

export function getCompatibleRecipients(donorType: BloodType): BloodType[] {
  return COMPAT_RULES[donorType] || [];
}
