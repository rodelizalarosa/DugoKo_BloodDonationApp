import { Heart, Quote, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { mockInsight, mockDonations } from '@/constants/mockData';
import { formatDate } from '@/lib/eligibility';
import { useTheme } from '@/context/ThemeContext';
import { useDonorInsights } from '@/lib/hooks/useDonorInsights';
import { useDonations } from '@/lib/hooks/useDonations';

export default function InsightDetailScreen() {
  const { theme } = useTheme();
  const { insights } = useDonorInsights();
  const { donations } = useDonations();

  const currentInsight = insights || mockInsight;
  const historyList = donations.length > 0 ? donations : mockDonations;

  const mockQuotes = [
    "Your blood is a gift of life. Every drop counts toward someone's tomorrow.",
    "A single donation can save up to three lives. You are a local hero.",
    "The blood you give today gives someone else a tomorrow."
  ];

  const healthImpacts = [
    { title: "Iron Level Maintenance", desc: "Regular donation helps keep your iron levels balanced.", icon: <ShieldCheck size={20} color={theme.teal} /> },
    { title: "Heart Health", desc: "Donating improves blood flow and reduces arterial blockage risks.", icon: <Heart size={20} color={theme.crimson} /> },
    { title: "Calorie Burn", desc: "Your body uses about 650 calories to replenish a pint of blood.", icon: <ShieldCheck size={20} color={theme.teal} /> }
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Donor Insight" subtitle="AI-Generated analysis of your impact" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.quoteCard}>
          <Quote size={24} color={theme.crimsonLight} style={{ opacity: 0.5 }} />
          <Text style={styles.quoteText}>{mockQuotes[Math.floor(Math.random() * mockQuotes.length)]}</Text>
        </View>

        <View style={styles.statRow}>
          <Stat label="Total Donations" value={`${currentInsight.totalDonations}`} theme={theme} />
          <Stat label="Lives Impacted" value={`~${currentInsight.estimatedLivesImpacted}`} theme={theme} />
          <Stat label="Streak" value={`${currentInsight.donationStreak}`} theme={theme} />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.ink }]}>AI Health Impact Analysis</Text>
        {healthImpacts.map((impact, idx) => (
          <Card key={idx} style={styles.impactCard}>
            <View style={styles.impactIcon}>{impact.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.impactTitle, { color: theme.ink }]}>{impact.title}</Text>
              <Text style={[styles.impactDesc, { color: theme.inkMuted }]}>{impact.desc}</Text>
            </View>
          </Card>
        ))}

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[styles.subLabel, { color: theme.inkMuted }]}>Next Suggested Window</Text>
          <Text style={[styles.body, { color: theme.teal }]}>{formatDate(currentInsight.nextWindowDate)}</Text>
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.ink }]}>Donation history</Text>
        {historyList
          .slice()
          .reverse()
          .map((d) => (
            <Card key={d.id} style={styles.historyRow}>
              <View>
                <Text style={[styles.historyDate, { color: theme.ink }]}>{formatDate(d.date)}</Text>
                <Text style={[styles.historyVenue, { color: theme.inkMuted }]}>
                  {d.venue} · {d.branch}
                </Text>
              </View>
              <Heart size={16} color={theme.crimson} fill={theme.crimson} style={{ opacity: 0.2 }} />
            </Card>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.crimsonDark }]}>
      <Text style={[styles.statValue, { color: '#FFF' }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  quoteCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    color: '#6B5A58',
    fontSize: 16,
    lineHeight: 24,
  },
  statRow: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { ...typography.display, fontSize: 22 },
  statLabel: { ...typography.caption, color: '#F4C8CD', marginTop: 2, textAlign: 'center' },
  sectionLabel: { ...typography.h1, marginTop: spacing.xl, marginBottom: spacing.sm },
  subLabel: { ...typography.eyebrow, textTransform: 'uppercase' },
  body: { ...typography.h2, marginTop: spacing.xs },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  impactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactTitle: { ...typography.bodyStrong },
  impactDesc: { ...typography.caption, marginTop: 2 },
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: spacing.sm 
  },
  historyDate: { ...typography.bodyStrong },
  historyVenue: { ...typography.caption },
});
