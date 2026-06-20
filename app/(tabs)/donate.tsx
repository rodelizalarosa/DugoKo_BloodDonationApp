import { useRouter } from 'expo-router';
import { CalendarDays, ClipboardCheck, FileText, MapPin, PlusCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockEvents } from '@/constants/mockData';

const actions = [
  {
    key: 'eligibility',
    title: 'Eligibility Checker',
    desc: 'Answer a few quick questions before heading out',
    icon: ClipboardCheck,
    href: '/donate/eligibility' as const,
  },
  {
    key: 'centers',
    title: 'Find Donation Center',
    desc: 'Locate the nearest PRC center or blood bank',
    icon: MapPin,
    href: '/donate/centers' as const,
  },
  {
    key: 'events',
    title: 'Blood Letting Events',
    desc: 'Browse and RSVP to scheduled blood drives',
    icon: CalendarDays,
    href: '/donate/events' as const,
  },
  {
    key: 'log',
    title: 'Log a Donation',
    desc: 'Already donated? Record it to update your history',
    icon: PlusCircle,
    href: '/donate/log' as const,
  },
  {
    key: 'receipt',
    title: 'My Receipts',
    desc: 'View past donation records and certificates',
    icon: FileText,
    href: '/donate/receipt' as const,
  },
];

export default function DonateScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.ink }]}>Donate</Text>
        <Text style={[styles.subheading, { color: theme.inkMuted }]}>The heart of DugóKo — every step toward giving blood</Text>

        {actions.map((a) => (
          <Pressable key={a.key} onPress={() => router.push(a.href)}>
            <Card style={styles.actionCard}>
              <View style={[styles.iconWrap, { backgroundColor: theme.crimsonLight }]}>
                <a.icon size={20} color={theme.crimson} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: theme.ink }]}>{a.title}</Text>
                <Text style={[styles.actionDesc, { color: theme.inkMuted }]}>{a.desc}</Text>
              </View>
            </Card>
          </Pressable>
        ))}

        <Text style={[styles.sectionLabel, { color: theme.ink }]}>Nearby Drives</Text>
        {mockEvents.map((e) => (
          <Pressable key={e.id} onPress={() => router.push(`/donate/events/${e.id}`)}>
            <Card style={styles.eventCard}>
              <Text style={[styles.eventTitle, { color: theme.ink }]}>{e.title}</Text>
              <Text style={[styles.eventMeta, { color: theme.inkMuted }]}>
                {new Date(e.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} ·{' '}
                {e.venue}
              </Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  heading: { ...typography.display },
  subheading: { ...typography.body, marginBottom: spacing.sm },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { ...typography.bodyStrong },
  actionDesc: { ...typography.caption, marginTop: 2 },
  sectionLabel: { ...typography.h2, marginTop: spacing.md },
  eventCard: { gap: 4 },
  eventTitle: { ...typography.bodyStrong },
  eventMeta: { ...typography.caption },
});
