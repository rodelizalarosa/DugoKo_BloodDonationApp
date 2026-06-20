import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function GreetingCard({ user }: { user: User }) {
  const router = useRouter();
  const { theme } = useTheme();
  const firstName = user.firstName;

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={[styles.greeting, { color: theme.ink }]}>
          {getGreeting()}, {firstName}
        </Text>
        {user.profileComplete ? (
          <Text style={[styles.meta, { color: theme.inkMuted }]}>
            🩸 {user.bloodType} · {user.donorLevel} · {user.totalDonations} Donation
            {user.totalDonations === 1 ? '' : 's'}
          </Text>
        ) : (
          <Pressable onPress={() => router.push('/profile/edit')}>
            <Text style={[styles.cta, { color: theme.crimson, backgroundColor: theme.crimsonLight }]}>Complete your profile →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  greeting: { ...typography.display },
  meta: { ...typography.bodyStrong, marginTop: spacing.xs },
  cta: {
    ...typography.bodyStrong,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});
