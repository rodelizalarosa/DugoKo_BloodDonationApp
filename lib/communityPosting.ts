import { BloodRequest, CommunityPost, EligibilityResult, UrgencyLevel, BloodType } from '@/types';

export type TriageResult = {
  urgencyLevel: UrgencyLevel;
  triageLabel: string;
  triageReason: string;
};

function normalizeDateInput(input: string): { date: Date | null; isRelative: boolean; relativeKey?: string } {
  const raw = input.trim().toLowerCase();

  if (!raw) return { date: null, isRelative: false };

  // Common relative inputs
  const rel = ['today', 'tomorrow', 'tonight', 'now'];
  if (rel.includes(raw)) {
    const base = new Date();
    if (raw === 'today' || raw === 'now' || raw === 'tonight') {
      return { date: base, isRelative: true, relativeKey: raw };
    }
    if (raw === 'tomorrow') {
      const d = new Date(base);
      d.setDate(d.getDate() + 1);
      return { date: d, isRelative: true, relativeKey: raw };
    }
  }

  // Try parse ISO / RFC / Date-like string
  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    return { date: parsed, isRelative: false };
  }

  // Try parse simple YYYY-MM-DD
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return { date: d, isRelative: false };
  }

  return { date: null, isRelative: false };
}

export function parseNeededByInput(input: string): string | null {
  const parsed = normalizeDateInput(input);
  return parsed.date ? parsed.date.toISOString() : null;
}

export function deriveTriage(neededWhenInput: string, reasonInput: string): TriageResult {
  const parsed = normalizeDateInput(neededWhenInput);
  const reason = reasonInput.toLowerCase();
  const now = new Date();

  // 1. Critical cases: Surgeries or "today"
  if (reason.includes('surgery') || reason.includes('operation') || neededWhenInput.toLowerCase() === 'today' || neededWhenInput.toLowerCase() === 'now') {
    return {
      urgencyLevel: 'critical',
      triageLabel: 'Critical — immediate action',
      triageReason: reason.includes('surgery') ? 'Medical procedure (surgery/operation) noted.' : 'Needed today/now.',
    };
  }

  // 2. Urgent cases: "as soon as possible"
  if (reason.includes('asap') || reason.includes('soon') || reason.includes('urgent')) {
    return {
      urgencyLevel: 'urgent',
      triageLabel: 'Urgent — as soon as possible',
      triageReason: 'Requester indicated immediate need (ASAP).',
    };
  }

  // 3. Pledge cases: Dialysis or weekly need
  if (reason.includes('dialysis') || reason.includes('weekly') || neededWhenInput.toLowerCase().includes('week')) {
     return {
      urgencyLevel: 'moderate',
      triageLabel: 'Pledge — scheduled support',
      triageReason: reason.includes('dialysis') ? 'Ongoing support for dialysis.' : 'Needed within the week.',
    };
  }

  const fallback: TriageResult = {
    urgencyLevel: 'moderate',
    triageLabel: 'Moderate urgency',
    triageReason: 'General request; no immediate complications noted.',
  };

  if (!parsed.date) return fallback;

  const needed = parsed.date;
  const diffMs = needed.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return {
      urgencyLevel: 'urgent',
      triageLabel: 'Urgent — needed within 24h',
      triageReason: 'Needed date is within 24 hours.',
    };
  }

  return fallback;
}

export function coerceUnits(unitsInput: string): number | null {
  const v = unitsInput.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const int = Math.floor(n);
  if (int <= 0) return null;
  return int;
}

export type BloodRequestDraft = {
  hospital: string;
  address: string; // hospital location
  bloodTypeNeeded: BloodType | null;
  unitsNeeded: number | null;
  neededWhenInput: string;
  reasonForRequest: string;
  additionalPatientInfo?: string;
  additionalNotes?: string;
};

export type BloodRequestFormValidation = {
  ok: boolean;
  errors: Partial<Record<keyof BloodRequestDraft | 'bloodTypeNeeded', string>>;
  triage?: TriageResult;
};

export function validateBloodRequestDraft(draft: BloodRequestDraft): BloodRequestFormValidation {
  const errors: BloodRequestFormValidation['errors'] = {};

  const hospital = draft.hospital.trim();
  const address = draft.address.trim();
  if (!hospital) errors.hospital = 'Hospital name is required.';
  if (!address) errors.address = 'Hospital location is required.';

  if (!draft.bloodTypeNeeded) errors.bloodTypeNeeded = 'Blood type is required.';

  if (!draft.unitsNeeded || draft.unitsNeeded <= 0) errors.unitsNeeded = 'Units of blood is required.';

  const neededWhen = draft.neededWhenInput.trim();
  if (!neededWhen) errors.neededWhenInput = 'When blood is needed is required (e.g., today).';
  if (neededWhen && !normalizeDateInput(neededWhen).date) {
    errors.neededWhenInput = 'Use today, tomorrow, or a valid date/time.';
  }

  const reason = draft.reasonForRequest.trim();
  if (!reason) errors.reasonForRequest = 'Reason for request is required.';

  const triage = deriveTriage(neededWhen, draft.reasonForRequest);
  const ok = Object.keys(errors).length === 0;

  return { ok, errors, triage };
}

export function validateHelperRegistration(input: {
  fullName: string;
  contactNumber: string;
  email: string;
  redCrossConsent: boolean;
}): { ok: boolean; errors: { [k: string]: string } } {
  const errors: { [k: string]: string } = {};

  const fullName = input.fullName.trim();
  const contactNumber = input.contactNumber.trim();
  const email = input.email.trim();

  if (!fullName) errors.fullName = 'Full name is required.';
  if (!contactNumber) errors.contactNumber = 'Contact number is required.';
  if (contactNumber && !/^(\+63|63|0)9\d{9}$/.test(contactNumber.replace(/[\s-]/g, ''))) {
    errors.contactNumber = 'Enter a valid PH mobile number, like 09XXXXXXXXX or +639XXXXXXXXX.';
  }
  if (!email) errors.email = 'Email is required.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.redCrossConsent) errors.redCrossConsent = 'Health check consent is required.';

  return { ok: Object.keys(errors).length === 0, errors };
}

export function buildLocalBloodRequestPost(params: {
  authorName: string;
  authorAvatarUrl?: string;
  hospital: string;
  address: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  additionalPatientInfo?: string;
  additionalNotes?: string;
  triage: TriageResult;
}): CommunityPost & { relatedRequestId?: string } {
  const {
    authorName,
    authorAvatarUrl,
    hospital,
    address,
    bloodTypeNeeded,
    unitsNeeded,
    additionalPatientInfo,
    additionalNotes,
    triage,
  } = params;

  const bodyParts: string[] = [];

  bodyParts.push(
    `Hospital: ${hospital} (${address})`
  );
  bodyParts.push(`Blood: ${bloodTypeNeeded}`);
  bodyParts.push(`Units: ${unitsNeeded}`);
  bodyParts.push(`Urgency: ${triage.urgencyLevel.toUpperCase()} — ${triage.triageLabel}`);

  if (additionalPatientInfo?.trim()) {
    bodyParts.push(`Patient info: ${additionalPatientInfo.trim()}`);
  }
  if (additionalNotes?.trim()) {
    bodyParts.push(`Notes: ${additionalNotes.trim()}`);
  }

  const nowIso = new Date().toISOString();

  return {
    id: `p_${Math.random().toString(16).slice(2)}_${Date.now()}`,
    type: 'request',
    authorName,
    authorAvatarUrl,
    title: `${triage.urgencyLevel === 'critical' ? 'Critical' : triage.urgencyLevel === 'urgent' ? 'Urgent' : 'Request'}: ${bloodTypeNeeded} needed`,
    body: bodyParts.join('\n'),
    postedAt: nowIso,
  };
}
