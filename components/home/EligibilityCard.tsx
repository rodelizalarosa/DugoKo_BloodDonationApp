import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { calculateEligibility, formatDate } from '@/lib/eligibility';
import { User } from '@/types';
import { getEligibilitySummary } from '@/lib/smartBloodMatching';

export function EligibilityCard({ user, onCanHelp }: { user: User; onCanHelp: () => void }) {
  const router = useRouter();
  const { theme } = useTheme();
  const result = calculateEligibility(user.lastDonationDate, user.sex);
  const isEligible = result.status === 'eligible';
  const summary = getEligibilitySummary(result, user.profileComplete, user.totalDonations);
  const handlePrimary = () => {
    if (isEligible) {
      onCanHelp?.();
      return;
    }
    router.push('/donate/eligibility');
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <CheckCircle2 size={20} color={isEligible ? theme.teal : theme.inkFaint} />
        <Text style={[styles.status, { color: isEligible ? theme.teal : theme.inkMuted }]}>
          Eligibility Checker
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.inkMuted }]}>Next Suggested Donation</Text>
      <Text style={[styles.date, { color: theme.ink }]}>{formatDate(result.nextEligibleDate)}</Text>
      <Text style={[styles.helper, { color: theme.inkMuted }]}>
        {summary.label}
      </Text>
      <Button
        label="I Can Help"
        onPress={handlePrimary}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { 
    marginHorizontal: spacing.lg, 
    marginTop: spacing.md,
    borderRadius: radius.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  status: { ...typography.bodyStrong },
  label: { ...typography.caption, marginTop: spacing.md },
  date: { ...typography.h2, marginTop: 2 },
  helper: { ...typography.caption, marginTop: spacing.xs },
});
