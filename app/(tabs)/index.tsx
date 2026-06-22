import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bell, MapPin, Moon, Sparkles, Sun } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelperRegistrationModal } from '@/components/community/HelperRegistrationModal';
import { AskDonaFAB } from '@/components/home/AskDonaFAB';
import { GreetingCard } from '@/components/home/GreetingCard';
import { NotificationModal } from '@/components/home/NotificationModal';
import { UpcomingEventCard } from '@/components/home/UpcomingEventCard';
import Map from '@/components/ui/Map';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { spacing, typography, radius } from '@/constants/theme';
import { getRecommendedDonors } from '@/lib/smartBloodMatching';
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/lib/hooks/useProfile';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';
import { useCommunity } from '@/lib/hooks/useCommunity';
import { useDonors } from '@/lib/hooks/useDonors';
import { useToast } from '@/context/ToastContext';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ helpRequestId?: string }>();
  const { isDarkMode, theme, setThemePreference } = useTheme();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [activeRequestId, setActiveRequestId] = React.useState<string | null>(null);

  const { profile, isLoading, updateProfile } = useProfile();
  const { centers, events } = useCentersAndEvents();
  const { requests, pledgeRequest } = useCommunity();
  const { donors } = useDonors();

  const [isWide, setIsWide] = React.useState(Dimensions.get('window').width >= 700);
  React.useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => setIsWide(window.width >= 700);
    const sub = Dimensions.addEventListener?.('change', onChange) ?? Dimensions.addEventListener('change', onChange as any);
    return () => {
      try {
        sub?.remove?.();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  const openRequests = useMemo(
    () =>
      [...requests]
        .filter((request) => request.status === 'open')
        .sort((a, b) => {
          const urgencyRank = { critical: 0, urgent: 1, moderate: 2 } as const;
          const urgencyDelta = urgencyRank[a.urgencyLevel] - urgencyRank[b.urgencyLevel];
          if (urgencyDelta !== 0) return urgencyDelta;
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        }),
    [requests]
  );

  const urgentRequest = openRequests[0] ?? null;

  const latestEvent = useMemo(
    () => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null,
    [events]
  );

  const mapMarkers = useMemo(
    () => [
      ...centers.map((center) => ({
        id: center.id,
        latitude: center.latitude,
        longitude: center.longitude,
        title: center.name,
        description: center.address,
      })),
      ...events
        .filter((event) => typeof event.latitude === 'number' && typeof event.longitude === 'number')
        .map((event) => ({
          id: event.id,
          latitude: event.latitude as number,
          longitude: event.longitude as number,
          title: event.title,
          description: event.venue,
        })),
    ],
    [centers, events]
  );

  const candidateDonors = useMemo(
    () => (profile ? [{ ...profile, distanceKm: 3 }, ...donors] : donors),
    [profile, donors]
  );

  const recommendedDonors = urgentRequest ? getRecommendedDonors({ request: urgentRequest, candidateDonors }) : [];

  const handleThemeToggle = async () => {
    const preference = isDarkMode ? 'light' : 'dark';
    await setThemePreference(preference);
    await updateProfile({ theme_preference: preference });
  };

  const openCanHelpFlow = () => {
    if (!urgentRequest || !profile) return;
    if (profile.eligibilityStatus !== 'eligible') {
      router.push({
        pathname: '/donate/eligibility',
        params: { helpRequestId: urgentRequest.id },
      });
      return;
    }
    setActiveRequestId(urgentRequest.id);
    setShowHelperModal(true);
  };

  React.useEffect(() => {
    if (!params.helpRequestId || !profile || profile.eligibilityStatus !== 'eligible') return;
    setActiveRequestId(params.helpRequestId);
    setShowHelperModal(true);
  }, [params.helpRequestId, profile]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: theme.crimson }]}>DugóKo</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleThemeToggle} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            {isDarkMode ? <Sun size={20} color={theme.amber} /> : <Moon size={20} color={theme.ink} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => setShowNotifications(true)}
          >
            <Bell size={20} color={theme.ink} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: theme.inkFaint }]}>Loading your profile...</Text>
          </View>
        ) : profile ? (
          <>
            <GreetingCard user={profile} />

            <View style={[styles.masonryRow, isWide ? styles.masonryRowWide : styles.masonryRowNarrow]}>
              <View style={[styles.contentColumn, isWide ? styles.contentColumnWide : styles.contentColumnNarrow]}>
                {latestEvent ? (
                  <UpcomingEventCard event={latestEvent} style={styles.eventCard} />
                ) : (
                  <Card style={styles.eventCard}>
                    <Text style={[styles.sectionLabel, { color: theme.crimson }]}>Upcoming Blood Drive</Text>
                    <Text style={[styles.sectionTitle, { color: theme.ink }]}>No event loaded</Text>
                    <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
                      Add a blood letting event to show it here.
                    </Text>
                  </Card>
                )}

                <Card style={styles.matchCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderRow}>
                      <Sparkles size={16} color={theme.crimson} />
                      <Text style={[styles.sectionLabel, { color: theme.crimson }]}>Smart Blood Type Matching</Text>
                    </View>
                    <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
                      Compatible donors ranked by blood type, eligibility, last donation, and distance.
                    </Text>
                  </View>

                  <View style={styles.matchList}>
                    {recommendedDonors.length > 0 ? (
                      recommendedDonors.slice(0, 2).map((donor, index) => (
                        <View key={donor.donorId} style={[styles.matchRow, { borderColor: theme.border }]}>
                          <View style={[styles.rankBadge, { backgroundColor: theme.crimsonLight }]}>
                            <Text style={[styles.rankBadgeText, { color: theme.crimson }]}>{index + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.matchName, { color: theme.ink }]}>{donor.donorName}</Text>
                            <Text style={[styles.matchMeta, { color: theme.inkMuted }]}>
                              {donor.bloodType} · {donor.isEligible ? 'Eligible' : 'Not eligible'} · {donor.distanceKm} km away
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
                        Smart matches will appear when an urgent request is available.
                      </Text>
                    )}
                  </View>

                  <View style={styles.matchCta}>
                    <Text style={[styles.ctaText, { color: theme.ink }]}>Check your eligibility.</Text>
                    <Button label="Check Eligibility" onPress={openCanHelpFlow} />
                  </View>
                </Card>
              </View>

              <Card style={[styles.urgentCard, isWide ? styles.urgentCardWide : styles.urgentCardNarrow]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionLabel, { color: theme.crimson }]}>Urgent Requests</Text>
                  <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>Open requests.</Text>
                </View>

                <FlatList
                  data={openRequests}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  style={styles.urgentList}
                  contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xs }}
                  renderItem={({ item }) => (
                    <View style={[styles.urgentItem, { borderColor: theme.border, backgroundColor: theme.paper }]}>
                      <View style={styles.urgentItemTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.urgentHospital, { color: theme.ink }]} numberOfLines={1}>
                            {item.hospital}
                          </Text>
                          <Text style={[styles.urgentMeta, { color: theme.inkMuted }]} numberOfLines={2}>
                            {item.bloodTypeNeeded} · {item.unitsNeeded - item.unitsPledged} units needed
                          </Text>
                        </View>
                        <View style={[styles.urgencyPill, { backgroundColor: theme.crimsonLight }]}>
                          <Text style={[styles.urgencyPillText, { color: theme.crimson }]}>{item.urgencyLevel}</Text>
                        </View>
                      </View>
                      <Text style={[styles.urgentNotes, { color: theme.inkMuted }]} numberOfLines={3}>
                        {item.notes || 'Awaiting compatible donors.'}
                      </Text>
                    </View>
                  )}
                />
              </Card>
            </View>
          </>
        ) : (
          <Card style={styles.blockCard}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>Welcome to DugóKo</Text>
            <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
              Your profile will appear once your account is linked. The app can still show seeded donation content below.
            </Text>
          </Card>
        )}

        <Card style={[styles.mapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.crimson }]}>Map View</Text>
            <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>Tap a pin to view a drive or center.</Text>
          </View>

          {mapMarkers.length > 0 ? (
            <View style={styles.mapWrap}>
              <Map
                style={styles.map}
                centerLatitude={mapMarkers[0].latitude}
                centerLongitude={mapMarkers[0].longitude}
                zoom={12}
                markers={mapMarkers}
              />
            </View>
          ) : (
            <View style={styles.mapEmpty}>
              <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
                Add a center or event to show it on the map.
              </Text>
            </View>
          )}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.crimson }]} />
              <Text style={[styles.legendText, { color: theme.inkMuted }]}>Blood drive</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.teal }]} />
              <Text style={[styles.legendText, { color: theme.inkMuted }]}>Donation center</Text>
            </View>
          </View>
          <View style={styles.mapLegendNote}>
            <MapPin size={14} color={theme.crimson} />
            <Text style={[styles.mapLegendText, { color: theme.inkMuted }]}>
              Red pins mark blood drives. Teal pins mark donation centers.
            </Text>
          </View>
        </Card>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>

      <AskDonaFAB />

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={
          urgentRequest && recommendedDonors.some((d) => d.donorId === profile?.id && d.isEligible)
            ? [
                {
                  id: urgentRequest.id,
                  title: `Someone nearby urgently needs ${urgentRequest.bloodTypeNeeded} blood.`,
                  body: 'You are eligible and compatible. Would you like to help?',
                  type: 'critical',
                  timestamp: new Date().toISOString(),
                  read: false,
                },
              ]
            : []
        }
      />

      {urgentRequest && (
        <HelperRegistrationModal
          visible={showHelperModal}
          requesterLabel={`${urgentRequest.hospital} (${urgentRequest.bloodTypeNeeded})`}
          initialFullName={profile ? `${profile.firstName} ${profile.lastName}`.trim() : ''}
          initialContactNumber={profile?.phone ?? ''}
          initialEmail={profile?.email ?? ''}
          onClose={() => setShowHelperModal(false)}
          onSubmitted={async ({ fullName, contactNumber, email }) => {
            const { error } = await pledgeRequest(activeRequestId ?? urgentRequest.id, {
              helper_name: fullName,
              helper_contact: contactNumber,
              helper_email: email,
            });
            showToast({
              type: error ? 'error' : 'success',
              title: error ? 'Unable to submit' : 'Help offer submitted',
              message: error ?? 'A confirmation email will be sent. The requester will see your name and contact number.',
            });
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  appName: {
    ...typography.h1,
    fontSize: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  masonryRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  masonryRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  masonryRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 0,
  },
  contentColumn: {
    gap: spacing.lg,
  },
  contentColumnWide: {
    flex: 1,
    gap: spacing.lg,
  },
  contentColumnNarrow: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  eventCard: {
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 140,
  },
  sectionHeader: {
    gap: 6,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    ...typography.eyebrow,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    ...typography.h2,
    marginTop: spacing.sm,
  },
  sectionBody: {
    ...typography.body,
    lineHeight: 20,
  },
  blockCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  matchCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 180,
  },
  matchList: {
    gap: spacing.md,
    maxHeight: 200,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: '#FFF',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  matchName: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  matchMeta: {
    ...typography.caption,
    marginTop: 3,
  },
  matchCta: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  ctaText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  urgentCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 0,
  },
  urgentCardWide: {
    width: 320,
    minHeight: 420,
    alignSelf: 'flex-start',
  },
  urgentCardNarrow: {
    width: '100%',
    marginHorizontal: spacing.lg,
    minHeight: 'auto',
  },
  urgentList: {
    flex: 1,
    maxHeight: 320,
  },
  urgentItem: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 85,
    justifyContent: 'center',
  },
  urgentItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  urgentHospital: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  urgentMeta: {
    ...typography.caption,
    marginTop: 4,
  },
  urgencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  urgencyPillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  urgentNotes: {
    ...typography.caption,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  mapCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  mapWrap: {
    height: 210,
    borderRadius: 14,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapEmpty: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
  },
  mapLegendNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  mapLegendText: {
    ...typography.caption,
    flex: 1,
  },
});
