import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import {
  BloodRequestDraft,
  BloodRequestFormValidation,
  deriveTriageFromNeededWhen,
  validateBloodRequestDraft,
  coerceUnits,
} from '@/lib/communityPosting';
import { BloodType } from '@/types';

const BLOOD_TYPES: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[styles.label, { color: theme.inkMuted }]}>{label}</Text>
      {children}
      {error ? <Text style={[styles.error, { color: theme.crimson }]}>{error}</Text> : null}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.pill,
        {
          borderColor: active ? theme.crimson : theme.border,
          backgroundColor: active ? theme.crimsonLight : theme.paper,
          color: active ? theme.crimson : theme.ink,
        },
      ]}
    >
      {label}
    </Text>
  );
}

export function BloodRequestCreateModal({
  visible,
  onClose,
  onSubmitted,
  requesterEligibility,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (payload: {
    title: string;
    body: string;
    hospital: string;
    address: string;
    bloodTypeNeeded: BloodType;
    unitsNeeded: number;
    triageUrgencyLevel: 'critical' | 'urgent' | 'moderate';
  }) => void;
  requesterEligibility: { status: 'eligible' | 'deferred' | 'not_eligible'; daysRemaining?: number };
}) {
  const { theme } = useTheme();

  const [draft, setDraft] = useState<BloodRequestDraft>({
    hospital: '',
    address: '',
    bloodTypeNeeded: null,
    unitsNeeded: null,
    neededWhenInput: 'today',
    additionalPatientInfo: '',
    additionalNotes: '',
  });

  const [touched, setTouched] = useState(false);

  const validation: BloodRequestFormValidation = useMemo(() => validateBloodRequestDraft(draft), [draft]);
  const triage = validation.triage ?? deriveTriageFromNeededWhen(draft.neededWhenInput);

  const reset = () => {
    setDraft({
      hospital: '',
      address: '',
      bloodTypeNeeded: null,
      unitsNeeded: null,
      neededWhenInput: 'today',
      additionalPatientInfo: '',
      additionalNotes: '',
    });
    setTouched(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitEnabled = validation.ok && requesterEligibility.status === 'eligible';

  const toggleBloodType = (t: BloodType) => {
    setDraft((d) => ({ ...d, bloodTypeNeeded: d.bloodTypeNeeded === t ? null : t }));
  };

  const handleUnits = (val: string) => {
    const n = coerceUnits(val);
    setDraft((d) => ({ ...d, unitsNeeded: n }));
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!validation.ok) return;
    if (requesterEligibility.status !== 'eligible') return;
    if (!draft.bloodTypeNeeded || !draft.unitsNeeded) return;

    const title = `${triage.urgencyLevel === 'critical' ? 'Critical' : triage.urgencyLevel === 'urgent' ? 'Urgent' : 'Request'}: ${
      draft.bloodTypeNeeded
    } needed`;

    const bodyParts: string[] = [];
    bodyParts.push(`Hospital: ${draft.hospital.trim()} (${draft.address.trim()})`);
    bodyParts.push(`Blood: ${draft.bloodTypeNeeded}`);
    bodyParts.push(`Units: ${draft.unitsNeeded}`);
    bodyParts.push(`Urgency: ${triage.urgencyLevel.toUpperCase()} — ${triage.triageLabel}`);

    if (draft.additionalPatientInfo?.trim()) {
      bodyParts.push(`Patient info: ${draft.additionalPatientInfo.trim()}`);
    }
    if (draft.additionalNotes?.trim()) {
      bodyParts.push(`Notes: ${draft.additionalNotes.trim()}`);
    }

    onSubmitted({
      title,
      body: bodyParts.join('\n'),
      hospital: draft.hospital.trim(),
      address: draft.address.trim(),
      bloodTypeNeeded: draft.bloodTypeNeeded,
      unitsNeeded: draft.unitsNeeded,
      triageUrgencyLevel: triage.urgencyLevel,
    });

    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modalInner} keyboardShouldPersistTaps="handled">
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.ink }]}>Create blood request</Text>
            <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
              Required fields are marked; urgency is auto-derived from “when blood is needed”.
            </Text>

            {requesterEligibility.status !== 'eligible' && (
              <View style={[styles.blockedBox, { borderColor: theme.border }]}>
                <Text style={[styles.blockedTitle, { color: theme.crimson }]}>Posting is not available</Text>
                <Text style={[styles.blockedText, { color: theme.inkMuted }]}>
                  {requesterEligibility.status === 'deferred'
                    ? `You’ll be eligible in ${requesterEligibility.daysRemaining ?? 0} days.`
                    : 'You are not eligible to post right now.'}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <Field
                label="Hospital name and location (required)"
                error={touched ? validation.errors.hospital : undefined}
              >
                <TextInput
                  value={draft.hospital}
                  onChangeText={(t) => setDraft((d) => ({ ...d, hospital: t }))}
                  placeholder="e.g., Cebu Doctors Hospital"
                  placeholderTextColor={theme.inkFaint}
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                />
                <View style={{ height: spacing.sm }} />
                <TextInput
                  value={draft.address}
                  onChangeText={(t) => setDraft((d) => ({ ...d, address: t }))}
                  placeholder="e.g., Osmeña Blvd, Cebu City"
                  placeholderTextColor={theme.inkFaint}
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                />
              </Field>

              <Field
                label="Blood type (required)"
                error={touched ? (validation.errors as any).bloodTypeNeeded : undefined}
              >
                <View style={styles.pills}>
                  {BLOOD_TYPES.map((t) => {
                    const active = draft.bloodTypeNeeded === t;
                    return (
                      <Pill key={t} label={t} active={active} onPress={() => toggleBloodType(t)} theme={theme} />
                    );
                  })}
                </View>
              </Field>

              <Field
                label="Units of blood (required)"
                error={touched ? validation.errors.unitsNeeded : undefined}
              >
                <TextInput
                  value={draft.unitsNeeded ? String(draft.unitsNeeded) : ''}
                  onChangeText={handleUnits}
                  placeholder="e.g., 2"
                  placeholderTextColor={theme.inkFaint}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                />
              </Field>

              <Field
                label="When blood is needed (required) (e.g., today)"
                error={touched ? validation.errors.neededWhenInput : undefined}
              >
                <TextInput
                  value={draft.neededWhenInput}
                  onChangeText={(t) => setDraft((d) => ({ ...d, neededWhenInput: t }))}
                  placeholder="e.g., today, tomorrow, 2026-06-21"
                  placeholderTextColor={theme.inkFaint}
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                />
              </Field>

              <View style={[styles.triageBox, { borderColor: theme.border }]}>
                <Text style={[styles.triageTitle, { color: theme.ink }]}>AI triage preview</Text>
                <Text style={[styles.triageValue, { color: theme.crimson }]}>{triage.triageLabel}</Text>
                <Text style={[styles.triageReason, { color: theme.inkMuted }]}>{triage.triageReason}</Text>
              </View>

              <Field label="Additional patient info (optional)">
                <TextInput
                  value={draft.additionalPatientInfo ?? ''}
                  onChangeText={(t) => setDraft((d) => ({ ...d, additionalPatientInfo: t }))}
                  placeholder="e.g., age, diagnosis (optional)"
                  placeholderTextColor={theme.inkFaint}
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                  multiline
                />
              </Field>

              <Field label="Notes (optional)">
                <TextInput
                  value={draft.additionalNotes ?? ''}
                  onChangeText={(t) => setDraft((d) => ({ ...d, additionalNotes: t }))}
                  placeholder="e.g., willing to pay, surgery schedule notes, etc."
                  placeholderTextColor={theme.inkFaint}
                  style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border }]}
                  multiline
                />
              </Field>

              <Button label="Submit request" onPress={handleSubmit} disabled={!submitEnabled} fullWidth />
              <View style={{ height: spacing.sm }} />
              <Button label="Cancel" variant="outline" onPress={handleClose} fullWidth />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalInner: { padding: spacing.lg },
  modal: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '90%',
  },
  title: { ...typography.h2, fontWeight: '900' },
  subtitle: { ...typography.caption, lineHeight: 16 },
  form: { gap: spacing.md },
  label: { ...typography.caption, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  error: { ...typography.caption, lineHeight: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  triageBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  triageTitle: { ...typography.caption, fontWeight: '900' },
  triageValue: { ...typography.bodyStrong, fontSize: 16 },
  triageReason: { ...typography.caption, lineHeight: 18, marginTop: spacing.xs },
  blockedBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  blockedTitle: { ...typography.bodyStrong },
  blockedText: { ...typography.caption, lineHeight: 16 },
});
