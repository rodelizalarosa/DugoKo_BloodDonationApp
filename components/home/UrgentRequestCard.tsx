import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { BloodRequest } from '@/types';
import { RecommendedDonor } from '@/lib/smartBloodMatching';

export function UrgentRequestCard({
  request,
  recommendedDonors,
  currentUserId,
}: {
  request: BloodRequest;
  recommendedDonors?: RecommendedDonor[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const { theme } = useTheme();

  const topDonors = (recommendedDonors ?? []).slice(0, 2);
  const currentUserRec = (recommendedDonors ?? []).find((d) => d.donorId === currentUserId);

  const showHelp =
    !!currentUserRec &&
    currentUserRec.isEligible &&
    topDonors.some((d) => d.donorId === currentUserRec.donorId);

  const helpLabel = (() => {
    if (!currentUserRec) return 'Help';
    if (currentUserRec.isEligible) return 'Would you like to help?';
    if (currentUserRec.eligibility.status === 'deferred') {
      return `Eligible in ${currentUserRec.eligibility.daysRemaining} days`;
    }
    return 'Not currently eligible';
  })();

  const helpButtonLabel = currentUserRec?.isEligible ? 'Pledge / I can help' : 'View eligibility';

  return (
    <Card style={[styles.card, { borderColor: theme.crimson, borderWidth: 1.5 }]}>
      <View style={styles.row}>
        <AlertTriangle size={16} color={theme.crimson} />
        <Badge label="Urgent" tone="crimson" />
      </View>

      <Text style={[styles.hospital, { color: theme.ink }]}>{request.hospital}</Text>
      <Text style={[styles.meta, { color: theme.inkMuted }]}>
        {request.bloodTypeNeeded} · {request.unitsNeeded - request.unitsPledged} Units Needed
      </Text>

      {topDonors.length > 0 && (
        <View style={styles.recoWrap}>
          <Text style={[styles.recoTitle, { color: theme.inkMuted }]}>Recommended donors</Text>
          {topDonors.map((d) => (
            <View
              key={d.donorId}
              style={[
                styles.recoRow,
                d.isEligible ? { borderColor: theme.teal } : { borderColor: theme.border },
              ]}
            >
              <Text style={[styles.recoName, { color: theme.ink }]}>
                {d.donorName} <Text style={{ color: theme.inkMuted }}>({d.bloodType})</Text>
              </Text>
              <Text style={[styles.recoMeta, { color: theme.inkMuted }]}>
                {d.isEligible
                  ? 'Eligible'
                  : d.eligibility.status === 'deferred'
                    ? `Deferred (${d.eligibility.daysRemaining}d)`
                    : 'Not eligible'}{' '}
                · {d.distanceKm} km away
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.helpText, { color: theme.inkMuted }]}>{helpLabel}</Text>

      <Button
        label={helpButtonLabel}
        onPress={() => {
          if (currentUserRec?.isEligible) router.push('/(tabs)/community');
          else router.push('/(tabs)/donate');
        }}
        style={{ marginTop: spacing.md }}
      />

      {showHelp && (
        <View style={[styles.helpBanner, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
          <Text style={[styles.helpBannerText, { color: theme.teal }]}>
            ✓ You’re eligible and compatible. Nearby urgent {request.bloodTypeNeeded} blood needed.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hospital: { ...typography.h2, marginTop: spacing.sm },
  meta: { ...typography.body, marginTop: 2 },

  recoWrap: { marginTop: spacing.md },
  recoTitle: { ...typography.caption, marginBottom: spacing.sm },
  recoRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  recoName: { ...typography.bodyStrong },
  recoMeta: { ...typography.caption },

  helpText: { ...typography.caption, marginTop: spacing.sm },
  helpBanner: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  helpBannerText: { ...typography.bodyStrong },
});
