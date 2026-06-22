import { useRouter } from 'expo-router';
import { CalendarDays, ClipboardCheck, FileText, MapPin, PlusCircle } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Map from '@/components/ui/Map';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';

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
  const { centers, events, isLoading } = useCentersAndEvents();

  const mapCenter = centers[0];
  const markers = centers.map((center) => ({
    id: center.id,
    latitude: center.latitude,
    longitude: center.longitude,
    title: center.name,
    description: center.address,
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.ink }]}>Donate</Text>
        <Text style={[styles.subheading, { color: theme.inkMuted }]}>
          Find nearby drives, check locations, and plan your donation
        </Text>

        <Card style={[styles.mapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={[styles.sectionLabel, { color: theme.ink, marginTop: 0 }]}>Nearby Drives</Text>
              <Text style={[styles.mapMeta, { color: theme.inkMuted }]}>
                Upcoming drives and donation spots near you
              </Text>
            </View>
            <MapPin size={18} color={theme.crimson} />
          </View>

          {isLoading && centers.length === 0 ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator color={theme.crimson} />
            </View>
          ) : mapCenter ? (
            <Map
              style={styles.mapView}
              centerLatitude={mapCenter.latitude}
              centerLongitude={mapCenter.longitude}
              zoom={12}
              markers={markers}
            />
          ) : (
            <View style={styles.mapLoading}>
              <Text style={[styles.mapMeta, { color: theme.inkMuted }]}>No nearby drives found</Text>
            </View>
          )}

          <View style={styles.mapPills}>
            {centers.slice(0, 2).map((center) => (
              <View key={center.id} style={[styles.centerPill, { borderColor: theme.border, backgroundColor: theme.paper }]}>
                <Text style={[styles.centerPillTitle, { color: theme.ink }]} numberOfLines={1}>
                  {center.name}
                </Text>
                <Text style={[styles.centerPillMeta, { color: theme.inkMuted }]} numberOfLines={1}>
                  {center.address}
                </Text>
              </View>
            ))}
          </View>
        </Card>

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

        <Text style={[styles.sectionLabel, { color: theme.ink }]}>Donation Centers</Text>
        {events.map((e) => (
          <Pressable key={e.id} onPress={() => router.push(`/donate/events/${e.id}`)}>
            <Card style={styles.eventCard}>
              <Text style={[styles.eventTitle, { color: theme.ink }]}>{e.title}</Text>
              <Text style={[styles.eventMeta, { color: theme.inkMuted }]}>
                {new Date(e.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · {e.venue}
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
  mapCard: { gap: spacing.sm, padding: spacing.md },
  mapHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  mapMeta: { ...typography.caption, marginTop: 2 },
  mapLoading: { height: 170, alignItems: 'center', justifyContent: 'center' },
  mapView: { height: 170, borderRadius: radius.md, overflow: 'hidden' },
  mapPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  centerPill: { flex: 1, minWidth: '48%', borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
  centerPillTitle: { ...typography.bodyStrong, fontSize: 13 },
  centerPillMeta: { ...typography.caption, marginTop: 2 },
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
