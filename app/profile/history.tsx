import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockDonations } from '@/constants/mockData';
import { formatDate } from '@/lib/eligibility';

export default function DonationHistoryScreen() {
  const router = useRouter();
  const donations = mockDonations.slice().reverse();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Donation History" subtitle={`${donations.length} total donations`} />
      <ScrollView contentContainerStyle={styles.content}>
        {donations.length === 0 ? (
          <EmptyState title="No donations yet" description="Your logged donations will appear here." />
        ) : (
          donations.map((d, idx) => {
            return (
              <Pressable key={d.id} onPress={() => router.push(`/donate/receipt?id=${d.id}`)}>
                <Card style={styles.card}>
                  {/* Summary Row */}
                  <View style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: theme.crimson }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.date, { color: theme.ink }]}>{formatDate(d.date)}</Text>
                      <Text style={[styles.venue, { color: theme.inkMuted }]}>
                        {d.venue} · {d.branch}
                      </Text>
                    </View>
                    <View style={styles.rightCol}>
                      <Text style={[styles.index, { color: theme.inkFaint }]}>#{donations.length - idx}</Text>
                      <ChevronRight size={16} color={theme.inkFaint} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  card: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  date: { ...typography.bodyStrong },
  venue: { ...typography.caption, marginTop: 2 },
  index: { ...typography.caption },
});

