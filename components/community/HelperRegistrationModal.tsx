import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { validateHelperRegistration } from '@/lib/communityPosting';

export function HelperRegistrationModal({
  visible,
  onClose,
  onSubmitted,
  requesterLabel,
  initialFullName,
  initialContactNumber,
  initialEmail,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (payload: { fullName: string; contactNumber: string; email: string }) => void;
  requesterLabel?: string;
  initialFullName?: string;
  initialContactNumber?: string;
  initialEmail?: string;
}) {
  const { theme } = useTheme();

  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [contactNumber, setContactNumber] = useState(initialContactNumber ?? '');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [redCrossConsent, setRedCrossConsent] = useState(false);
  const [touched, setTouched] = useState(false);

  const validation = useMemo(
    () =>
      validateHelperRegistration({
        fullName,
        contactNumber,
        email,
        redCrossConsent,
      }),
    [fullName, contactNumber, email, redCrossConsent]
  );

  const submitEnabled = validation.ok;

  const reset = () => {
    setFullName(initialFullName ?? '');
    setContactNumber(initialContactNumber ?? '');
    setEmail(initialEmail ?? '');
    setRedCrossConsent(false);
    setTouched(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!validation.ok) return;

    onSubmitted({
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim().toLowerCase(),
    });

    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modalInner} keyboardShouldPersistTaps="handled">
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.ink }]}>I Can Help</Text>
            {!!requesterLabel && (
              <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
                You are responding to: {requesterLabel}
              </Text>
            )}

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>Full name</Text>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.paper }]}>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor={theme.inkFaint}
                    style={[styles.input, { color: theme.ink }]}
                    autoCapitalize="words"
                  />
                </View>
                {touched && validation.errors.fullName ? (
                  <Text style={[styles.error, { color: theme.crimson }]}>{validation.errors.fullName}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>Contact number</Text>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.paper }]}>
                  <TextInput
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                    placeholderTextColor={theme.inkFaint}
                    style={[styles.input, { color: theme.ink }]}
                    keyboardType="phone-pad"
                  />
                </View>
                {touched && validation.errors.contactNumber ? (
                  <Text style={[styles.error, { color: theme.crimson }]}>{validation.errors.contactNumber}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>Email</Text>
                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.paper }]}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@email.com"
                    placeholderTextColor={theme.inkFaint}
                    style={[styles.input, { color: theme.ink }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {touched && validation.errors.email ? (
                  <Text style={[styles.error, { color: theme.crimson }]}>{validation.errors.email}</Text>
                ) : null}
              </View>

              <Pressable style={styles.consentRow} onPress={() => setRedCrossConsent((v) => !v)}>
                <View
                  style={[
                    styles.consentBox,
                    {
                      backgroundColor: redCrossConsent ? theme.tealLight : 'transparent',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: redCrossConsent ? theme.teal : 'transparent', fontWeight: '900' }}>
                    {redCrossConsent ? '✓' : ''}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.consentText, { color: theme.inkMuted }]}>
                    I confirm that I will follow Red Cross screening and health check instructions on-site.
                  </Text>
                  {touched && validation.errors.redCrossConsent ? (
                    <Text style={[styles.error, { color: theme.crimson }]}>{validation.errors.redCrossConsent}</Text>
                  ) : null}
                </View>
              </Pressable>

              <View style={styles.disclaimerBox}>
                <View style={styles.disclaimerTitleRow}>
                  <Text style={[styles.disclaimerTitle, { color: theme.ink }]}>Important</Text>
                  <Text style={{ color: theme.crimson, fontWeight: '900' }}>!</Text>
                </View>
                <Text style={[styles.disclaimerText, { color: theme.inkMuted }]}>
                  A confirmation email will be sent to your email address. On the requester side, only
                  your full name and contact number will be shown.
                </Text>
              </View>

              <Button label="Submit" onPress={handleSubmit} disabled={!submitEnabled} fullWidth />
              <Button
                label="Cancel"
                variant="outline"
                onPress={handleClose}
                fullWidth
                style={{ marginTop: spacing.xs }}
              />
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
  modalInner: {
    padding: spacing.lg,
  },
  modal: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.h2, fontWeight: '800' },
  subtitle: { ...typography.body, marginTop: -spacing.xs },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '600' },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: { ...typography.body, height: '100%', paddingVertical: 0 },
  error: { ...typography.caption },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  consentBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: { ...typography.caption, lineHeight: 16 },
  disclaimerBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  disclaimerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  disclaimerTitle: { ...typography.bodyStrong },
  disclaimerText: { ...typography.caption, lineHeight: 18 },
});
