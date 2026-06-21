import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';

export default function EventsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { events, isLoading, error } = useCentersAndEvents();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Blood Letting Events" subtitle="Scheduled drives near you" />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={theme.crimson} />
          </View>
        )}
        {!isLoading && error && (
          <EmptyState title="Could not load events" description={error} />
        )}
        {!isLoading && !error && events.length === 0 && (
          <EmptyState title="No events scheduled" description="Check back soon for upcoming blood drives." />
        )}
        {!isLoading && events.map((e) => (
          <Pressable key={e.id} onPress={() => router.push(`/donate/events/${e.id}`)}>
            <Card style={{ gap: spacing.xs }}>
              <Badge label={`${e.slotsAvailable} slots open`} tone="teal" />
              <Text style={[styles.title, { color: theme.ink }]}>{e.title}</Text>
              <Text style={[styles.meta, { color: theme.inkMuted }]}>
                {new Date(e.date).toLocaleDateString('en-PH', {
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                · {e.timeStart} – {e.timeEnd}
              </Text>
              <Text style={[styles.venue, { color: theme.inkFaint }]}>{e.venue}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  center: { padding: spacing.xxl, alignItems: 'center' },
  title: { ...typography.h2 },
  meta: { ...typography.body },
  venue: { ...typography.caption },
});
