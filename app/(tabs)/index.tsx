import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bell, Droplets, Moon, Sun, MapPin, AlertCircle, ArrowRight } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View, Text, Dimensions, ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AskDonaFAB } from '@/components/home/AskDonaFAB';
import { GreetingCard } from '@/components/home/GreetingCard';
import { NotificationModal } from '@/components/home/NotificationModal';
import { UpcomingEventCard } from '@/components/home/UpcomingEventCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HelpFormModal } from '@/components/home/HelpFormModal';
import { spacing, typography, radius } from '@/constants/theme';
import { canDonateTo, getCompatibleRecipients } from '@/lib/blood-utils';
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/lib/hooks/useProfile';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';
import { useCommunity } from '@/lib/hooks/useCommunity';
import { useDonors } from '@/lib/hooks/useDonors';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useToast } from '@/context/ToastContext';
import type { BloodRequest } from '@/types';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ helpRequestId?: string }>();
  const { isDarkMode, theme, setThemePreference } = useTheme();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  const { profile, isLoading, updateProfile } = useProfile();
  const { centers, events, isLoading: centersLoading, error: centersError } = useCentersAndEvents();
  const { requests, error: communityError, pledgeRequest, getUserPledge } = useCommunity();
  const { donors } = useDonors();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  // Check if user has already pledged to the latest compatible request
  const [hasPledged, setHasPledged] = useState(false);
  const [checkingPledge, setCheckingPledge] = useState(true);

  useEffect(() => {
    async function checkPledge() {
      if (!latestCompatibleRequest || !profile) {
        setCheckingPledge(false);
        return;
      }
      const pledged = await getUserPledge(latestCompatibleRequest.id);
      setHasPledged(pledged);
      setCheckingPledge(false);
    }
    checkPledge();
  }, [latestCompatibleRequest, profile, getUserPledge]);

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

  const latestEvent = useMemo(
    () => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null,
    [events]
  );

  const candidateDonors = donors;

  // Filter requests that user is compatible with (user's blood type can donate to request's blood type)
  const myCompatibleRequests = useMemo(() => {
    if (!profile?.bloodType) return [];
    return openRequests.filter(r => canDonateTo(profile.bloodType, r.bloodTypeNeeded));
  }, [profile, openRequests]);

  // Get the single latest request user can help with
  const latestCompatibleRequest = myCompatibleRequests[0] || null;

  // Get compatible donors for the specific request displayed
  const matchedDonors = useMemo(() => {
    if (!latestCompatibleRequest) return [];
    return candidateDonors
      .filter(d => d.id !== profile?.id && canDonateTo(latestCompatibleRequest.bloodTypeNeeded, d.bloodType))
      .slice(0, 3);
  }, [latestCompatibleRequest, candidateDonors, profile]);

  const handleThemeToggle = async () => {
    const preference = isDarkMode ? 'light' : 'dark';
    await setThemePreference(preference);
    await updateProfile({ theme_preference: preference });
  };

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
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.crimson }]}>
                <Text style={styles.badgeTextCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {(centersError || communityError) && (
          <View style={{ marginHorizontal: spacing.lg, padding: spacing.sm, backgroundColor: theme.crimsonLight, borderRadius: radius.sm, marginBottom: spacing.sm }}>
            <Text style={[typography.caption, { color: theme.crimson }]}>
              Sync Error: {centersError || communityError}
            </Text>
          </View>
        )}

        {/**
         * NOTE: This screen uses a FlatList (VirtualizedList) for urgent requests.
         * A plain ScrollView wrapper + nested FlatList can trigger the RN warning:
         * "VirtualizedLists should never be nested inside plain ScrollViews".
         *
         * Replace the outer ScrollView with a View so the FlatList owns its own scrolling.
         */}
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
                      <Droplets size={16} color={theme.crimson} />
                      <Text style={[styles.sectionLabel, { color: theme.crimson }]}>Blood Type Matching</Text>
                    </View>
                  </View>

                  {profile?.bloodType ? (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={[styles.sectionTitle, { color: theme.ink, fontSize: 20, marginTop: 0 }]}>
                        Your Blood Type: {profile.bloodType}
                      </Text>
                      <Text style={[styles.sectionBody, { color: theme.inkMuted, marginTop: spacing.xs }]}>
                        You can donate to: {getCompatibleRecipients(profile.bloodType).join(', ')}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.sectionBody, { color: theme.inkMuted, marginBottom: spacing.md }]}>
                      Set your blood type in your profile to see who you can help.
                    </Text>
                  )}

                  {/* Urgent Requests Section - Single Latest Request */}
                  {latestCompatibleRequest && profile?.bloodType && (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={[styles.urgentSectionTitle, { color: theme.ink, marginBottom: spacing.sm }]}>
                        Latest Request You Can Help
                      </Text>
                      <View style={[styles.urgentItem, { borderColor: theme.border }]}>
                        <View style={styles.urgentItemTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.urgentHospital, { color: theme.ink }]}>{latestCompatibleRequest.hospital}</Text>
                            <Text style={[styles.urgentMeta, { color: theme.inkMuted }]}>
                              {latestCompatibleRequest.bloodTypeNeeded} · {latestCompatibleRequest.unitsNeeded} unit(s)
                            </Text>
                          </View>
                          <View style={[styles.urgencyPill, { backgroundColor: latestCompatibleRequest.urgencyLevel === 'critical' ? theme.crimson : latestCompatibleRequest.urgencyLevel === 'urgent' ? '#F59E0B' : '#10B981' }]}>
                            <Text style={[styles.urgencyPillText, { color: '#FFF' }]}>{latestCompatibleRequest.urgencyLevel}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Matched Donors Section */}
                  <View style={styles.matchList}>
                    {matchedDonors.length > 0 ? (
                      <>
                        <Text style={[styles.urgentSectionTitle, { color: theme.ink, marginBottom: spacing.sm }]}>
                          Compatible Donors
                        </Text>
                        {matchedDonors.map((donor, index) => (
                          <View key={donor.id} style={[styles.matchRow, { borderColor: theme.border }]}>
                            <View style={[styles.rankBadge, { backgroundColor: theme.crimsonLight }]}>
                              <Text style={[styles.rankBadgeText, { color: theme.crimson }]}>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.matchName, { color: theme.ink }]}>{donor.firstName} {donor.lastName}</Text>
                              <Text style={[styles.matchMeta, { color: theme.inkMuted }]}>
                                Compatible Donor · {donor.bloodType}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    ) : (
                      <Text style={[styles.sectionBody, { color: theme.inkMuted }]}>
                        Compatible donors will appear here.
                      </Text>
                    )}
                  </View>

                  <View style={styles.matchCta}>
                    {checkingPledge ? (
                      <ActivityIndicator color={theme.crimson} />
                    ) : latestCompatibleRequest && profile?.bloodType ? (
                      hasPledged ? (
                        <Text style={[styles.ctaText, { color: theme.teal }]}>
                          You already pledged to help
                        </Text>
                      ) : (
                        <Button
                          label="I Can Help"
                          onPress={() => {
                            setSelectedRequest(latestCompatibleRequest);
                            setShowHelpModal(true);
                          }}
                        />
                      )
                    ) : (
                      <Text style={[styles.ctaText, { color: theme.ink }]}>
                        {profile?.bloodType ? 'No compatible requests nearby' : 'Set your blood type to help'}
                      </Text>
                    )}
                  </View>
                </Card>
              </View>
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


        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>


      <AskDonaFAB />

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAsRead={markAsRead}
        notifications={notifications.map(n => ({
          id: n.id,
          title: n.title,
          body: n.message,
          type: (n.type === 'request_response' ? 'success' : 'info') as any,
          timestamp: n.created_at,
          read: n.is_read
        }))}
      />

      {selectedRequest && profile && (
        <HelpFormModal
          visible={showHelpModal}
          request={selectedRequest}
          user={profile}
          onClose={() => {
            setShowHelpModal(false);
            setSelectedRequest(null);
          }}
          onSubmit={async ({ helper_name, helper_contact, helper_email }) => {
            // Pledge to the request
            const { error } = await pledgeRequest(selectedRequest.id, {
              helper_name,
              helper_contact,
              helper_email
            });

            if (error) {
              showToast({ type: 'error', title: 'Error', message: error });
              return;
            }

            // Send email confirmation to helper
            try {
              await supabase.functions.invoke('send-helper-confirmation', {
                body: {
                  helper_email: helper_email,
                  helper_name: helper_name,
                  request_hospital: selectedRequest.hospital,
                  request_blood_type: selectedRequest.bloodTypeNeeded,
                  requester_name: selectedRequest.authorName || 'Blood Requester',
                }
              });
            } catch (emailErr) {
              console.log('Email notification skipped:', emailErr);
            }

            showToast({
              type: 'success',
              title: 'Thank you!',
              message: `Your offer to help at ${selectedRequest.hospital} has been sent.`,
            });
            setShowHelpModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollView: { flex: 1 },
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
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeTextCount: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
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
  urgentSectionTitle: {
    ...typography.bodyStrong,
    fontSize: 14,
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
  viewRequestBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewRequestText: {
    ...typography.bodyStrong,
    fontSize: 13,
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
