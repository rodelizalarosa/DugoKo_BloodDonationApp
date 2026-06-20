import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { calculateEligibility, formatDate } from '@/lib/eligibility';
import { User } from '@/types';

export function EligibilityCard({ user }: { user: User }) {
  const router = useRouter();
  const { theme } = useTheme();

  if (!user.profileComplete || user.totalDonations === 0) return null;

  const result = calculateEligibility(user.lastDonationDate);
  const isEligible = result.status === 'eligible';

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <CheckCircle2 size={20} color={isEligible ? theme.teal : theme.inkFaint} />
        <Text style={[styles.status, { color: isEligible ? theme.teal : theme.inkMuted }]}>
          {isEligible ? 'Eligible to Donate' : `Eligible in ${result.daysRemaining} days`}
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.inkMuted }]}>Next Suggested Donation</Text>
      <Text style={[styles.date, { color: theme.ink }]}>{formatDate(result.nextEligibleDate)}</Text>
      <Button
        label={isEligible ? "Find Event" : `Come back on ${formatDate(result.nextEligibleDate)}`}
        disabled={!isEligible}
        onPress={() => router.push('/(tabs)/donate')}
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
});
