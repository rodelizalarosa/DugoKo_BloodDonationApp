import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { BloodEvent } from '@/types';

export function UpcomingEventCard({ event }: { event: BloodEvent }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.eyebrowRow}>
        <CalendarDays size={16} color={theme.crimson} />
        <Text style={[styles.eyebrow, { color: theme.crimson }]}>Upcoming Blood Drive</Text>
      </View>
      <Text style={[styles.title, { color: theme.ink }]}>{event.title}</Text>
      <Text style={[styles.meta, { color: theme.inkMuted }]}>
        {new Date(event.date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })} ·{' '}
        {event.timeStart} – {event.timeEnd}
      </Text>
      <Button
        label="View Event"
        variant="secondary"
        onPress={() => router.push(`/donate/events/${event.id}`)}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eyebrow: { ...typography.eyebrow, textTransform: 'uppercase' },
  title: { ...typography.h2, marginTop: spacing.sm },
  meta: { ...typography.body, marginTop: 2 },
});
