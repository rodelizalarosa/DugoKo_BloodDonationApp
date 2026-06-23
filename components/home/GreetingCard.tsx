import { useRouter } from 'expo-router';
import { ArrowRight, BadgeInfo, Droplets, IdCard } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function InfoChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.paper }]}>
      <Text style={[styles.chipLabel, { color: theme.inkMuted }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

export function GreetingCard({ user }: { user: User }) {
  const router = useRouter();
  const { theme } = useTheme();

  const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <Card style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={[styles.avatarImage, { backgroundColor: theme.crimsonLight }]} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.crimson }]}>
            <Text style={[styles.avatarText, { color: '#FFF' }]}>{initials}</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <IdCard size={14} color={theme.crimson} />
            <Text style={[styles.badgeText, { color: theme.crimson }]}>Donor ID</Text>
          </View>
          <Text style={[styles.greeting, { color: theme.ink }]}>{getGreeting()}, {user.firstName}</Text>
          <Text style={[styles.name, { color: theme.inkMuted }]} numberOfLines={1}>
            {fullName || 'Your profile'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <InfoChip label="Blood Type" value={user.bloodType ?? 'Pending'} />
        <InfoChip label="Donor Level" value={user.donorLevel} />
      </View>
      
      <View style={styles.secondaryGrid}>
        <InfoChip label="Donations" value={`${user.totalDonations}`} />
        <InfoChip label="Points" value={`${user.totalDonations * 10}`} />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerHint}>
          <Droplets size={14} color={theme.crimson} />
          <Text style={[styles.footerText, { color: theme.inkMuted }]}>
            {user.profileComplete
              ? 'Profile is ready for matching and reminders.'
              : 'Complete your profile to unlock donation guidance and matching.'}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
  },
  avatarText: {
    ...typography.h1,
    fontSize: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.eyebrow,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  greeting: {
    ...typography.h1,
    fontSize: 22,
    marginTop: 0,
  },
  name: {
    ...typography.body,
    marginTop: 2,
    fontSize: 14,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 60,
    justifyContent: 'center',
  },
  chipLabel: {
    ...typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  chipValue: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: spacing.md,
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  footerText: {
    ...typography.caption,
    fontSize: 12,
    flex: 1,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  linkText: {
    ...typography.bodyStrong,
    fontSize: 13,
  },
});
