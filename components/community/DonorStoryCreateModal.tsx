import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';

export function DonorStoryCreateModal({
  visible,
  onClose,
  onSubmitted,
  requesterEligibility,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (payload: { title: string; body: string }) => void;
  requesterEligibility: { status: 'eligible' | 'deferred' | 'not_eligible'; daysRemaining?: number };
}) {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const e: { title?: string; body?: string } = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!body.trim()) e.body = 'Story text is required.';
    return e;
  }, [title, body]);

  const validationOk = Object.keys(errors).length === 0;
  const submitEnabled = validationOk && requesterEligibility.status === 'eligible';

  const handleClose = () => {
    setTitle('');
    setBody('');
    setTouched(false);
    onClose();
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!validationOk) return;
    if (requesterEligibility.status !== 'eligible') return;

    onSubmitted({
      title: title.trim(),
      body: body.trim(),
    });

    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modalInner} keyboardShouldPersistTaps="handled">
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.ink }]}>Create donor story</Text>
            <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
              Share your experience to encourage others.
            </Text>

            {requesterEligibility.status !== 'eligible' && (
              <View style={[styles.blockedBox, { borderColor: theme.border }]}>
                <Text style={[styles.blockedTitle, { color: theme.crimson }]}>Posting is locked</Text>
                <Text style={[styles.blockedText, { color: theme.inkMuted }]}>
                  {requesterEligibility.status === 'deferred'
                    ? `You’ll be eligible in ${requesterEligibility.daysRemaining ?? 0} days.`
                    : 'You must be eligible (Red Cross health checks + donation eligibility) to post.'}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>Title (required)</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., My first time donating!"
                  placeholderTextColor={theme.inkFaint}
                  style={[
                    styles.input,
                    { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.border },
                  ]}
                />
                {touched && errors.title ? (
                  <Text style={[styles.error, { color: theme.crimson }]}>{errors.title}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>Story (required)</Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Write a short story about your donation experience..."
                  placeholderTextColor={theme.inkFaint}
                  style={[
                    styles.input,
                    {
                      color: theme.ink,
                      backgroundColor: theme.paper,
                      borderColor: theme.border,
                      minHeight: 120,
                      textAlignVertical: 'top',
                    },
                  ]}
                  multiline
                />
                {touched && errors.body ? (
                  <Text style={[styles.error, { color: theme.crimson }]}>{errors.body}</Text>
                ) : null}
              </View>

              <Button label="Submit story" onPress={handleSubmit} disabled={!submitEnabled} fullWidth />
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
  field: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
  },
  error: { ...typography.caption, lineHeight: 16 },
  blockedBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  blockedTitle: { ...typography.bodyStrong, fontWeight: '900' },
  blockedText: { ...typography.caption, lineHeight: 16 },
});
