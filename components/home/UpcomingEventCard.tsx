import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { BloodEvent } from '@/types';

export function UpcomingEventCard({ event, style }: { event: BloodEvent; style?: ViewStyle }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.eyebrowRow}>
        <CalendarDays size={16} color={theme.crimson} />
        <Text style={[styles.eyebrow, { color: theme.crimson }]}>Latest Blood Letting Event</Text>
      </View>
      <Text style={[styles.title, { color: theme.ink }]}>{event.title}</Text>
      <Text style={[styles.meta, { color: theme.inkMuted }]}>
        {new Date(event.date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })} · {event.timeStart} - {event.timeEnd}
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
  card: { marginHorizontal: 0, marginTop: 0, borderRadius: 14, padding: spacing.md },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eyebrow: { ...typography.eyebrow, textTransform: 'uppercase', fontSize: 10 },
  title: { ...typography.h2, marginTop: spacing.sm, fontSize: 18 },
  meta: { ...typography.body, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 },
});
