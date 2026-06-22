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
  onCanHelp,
}: {
  request: BloodRequest;
  recommendedDonors?: RecommendedDonor[];
  currentUserId?: string;
  onCanHelp?: () => void;
}) {
  const { theme } = useTheme();

  const topDonors = (recommendedDonors ?? []).slice(0, 2);
  const currentUserRec = (recommendedDonors ?? []).find((d) => d.donorId === currentUserId);

  const showHelp =
    !!currentUserRec &&
    currentUserRec.isEligible &&
    topDonors.some((d) => d.donorId === currentUserRec.donorId);

  const helpLabel = (() => {
    if (!currentUserRec) return 'Recommended donors are ranked by blood type, eligibility, and distance.';
    if (currentUserRec.isEligible) return 'You are eligible and compatible. Would you like to help?';
    if (currentUserRec.eligibility.status === 'deferred') {
      return `Eligible in ${currentUserRec.eligibility.daysRemaining} days`;
    }
    return 'Not currently eligible';
  })();

  return (
    <Card style={[styles.card, { borderColor: theme.crimson, borderWidth: 1.5 }]}>
      <View style={styles.row}>
        <AlertTriangle size={16} color={theme.crimson} />
        <Badge label="Urgent" tone="crimson" />
      </View>

      <Text style={[styles.analyticsLabel, { color: theme.crimson }]}>Smart Blood Request Matching</Text>
      <Text style={[styles.analyticsBody, { color: theme.inkMuted }]}>
        AI ranks donors using blood type compatibility, eligibility, last donation date, and distance from the request.
      </Text>

      <Text style={[styles.hospital, { color: theme.ink }]}>{request.hospital}</Text>
      <Text style={[styles.meta, { color: theme.inkMuted }]}>
        {request.bloodTypeNeeded} · {request.unitsNeeded - request.unitsPledged} units needed
      </Text>

      {topDonors.length > 0 && (
        <View style={styles.recoWrap}>
          <Text style={[styles.recoTitle, { color: theme.inkMuted }]}>Recommended Donors</Text>
          {topDonors.map((d, index) => (
            <View
              key={d.donorId}
              style={[
                styles.recoRow,
                d.isEligible ? { borderColor: theme.teal } : { borderColor: theme.border },
              ]}
            >
              <Text style={[styles.recoRank, { color: theme.crimson }]}>{index + 1}.</Text>
              <View style={{ flex: 1 }}>
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
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.helpText, { color: theme.inkMuted }]}>{helpLabel}</Text>

      <Button
        label="I Can Help"
        onPress={() => {
          onCanHelp?.();
        }}
        style={{ marginTop: spacing.md }}
      />

      {showHelp && (
        <View style={[styles.helpBanner, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
          <Text style={[styles.helpBannerText, { color: theme.teal }]}>
            You are eligible and compatible. Nearby urgent {request.bloodTypeNeeded} blood needed.
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
  analyticsLabel: { ...typography.eyebrow, marginTop: spacing.sm, textTransform: 'uppercase' },
  analyticsBody: { ...typography.caption, marginTop: spacing.xs },

  recoWrap: { marginTop: spacing.md },
  recoTitle: { ...typography.caption, marginBottom: spacing.sm },
  recoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  recoRank: { ...typography.bodyStrong, minWidth: 18 },
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
