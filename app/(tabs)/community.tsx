import { useRouter } from 'expo-router';
import { ChevronDown, Filter, Megaphone, MessageSquareHeart, Siren } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { CommunityPost } from '@/types';
import { calculateEligibility } from '@/lib/eligibility';
import { BloodRequestCreateModal } from '@/components/community/BloodRequestCreateModal';
import { DonorStoryCreateModal } from '@/components/community/DonorStoryCreateModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { useCommunity } from '@/lib/hooks/useCommunity';
import { useToast } from '@/context/ToastContext';
import { canDonateTo } from '@/lib/blood-utils';
import { HelpFormModal } from '@/components/home/HelpFormModal';
import { supabase } from '@/lib/supabase';

const typeMeta: Record<CommunityPost['type'], { icon: any; tone: 'crimson' | 'teal' | 'amber'; label: string }> = {
  request: { icon: Siren, tone: 'crimson', label: 'Blood Request' },
  story: { icon: MessageSquareHeart, tone: 'teal', label: 'Donor Story' },
  announcement: { icon: Megaphone, tone: 'amber', label: 'Announcement' },
};

export default function CommunityScreen() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = React.useState<'all' | 'today' | 'week' | 'month'>('all');

  const { profile } = useProfile();
  const { posts, requests, createBloodRequest, createStoryOrAnnouncement, pledgeRequest } = useCommunity();
  const { showToast } = useToast();
  const { theme, isDarkMode } = useTheme();

  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [showHelperModal, setShowHelperModal] = React.useState(false);

  const openCanHelpFlow = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setSelectedRequest(req);
      setShowHelperModal(true);
    }
  };

  // Posting eligibility — safe-guard when profile is still loading
  const eligibility = calculateEligibility(profile?.lastDonationDate ?? null, profile?.sex);

  const mappedStatus: 'eligible' | 'deferred' | 'not_eligible' =
    eligibility.status === 'eligible' ? 'eligible' : eligibility.status === 'deferred' ? 'deferred' : 'not_eligible';

  // Eligibility check for posting blood requests (requires prior donations)
  const requesterEligibility = {
    status:
      profile?.profileComplete && (profile?.totalDonations ?? 0) > 0 ? mappedStatus : 'not_eligible',
    daysRemaining: eligibility.daysRemaining,
  } as const;

  // Donor stories are always available for anyone to share
  const storyEligibility = {
    status: 'eligible' as const,
    daysRemaining: 0,
  };

  const [showBloodRequestModal, setShowBloodRequestModal] = React.useState(false);
  const [showDonorStoryModal, setShowDonorStoryModal] = React.useState(false);

  const filterLabels = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
  };

  const sortedPosts = [...posts]
    .filter((post) => {
      if (timeFilter === 'all') return true;
      const postDate = new Date(post.postedAt).getTime();
      const now = Date.now();
      const diffHrs = (now - postDate) / (1000 * 60 * 60);
      
      if (timeFilter === 'today') return diffHrs <= 24;
      if (timeFilter === 'week') return diffHrs <= 24 * 7;
      if (timeFilter === 'month') return diffHrs <= 24 * 30;
      return true;
    })
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

  const handleFilterSelect = (filter: 'all' | 'today' | 'week' | 'month') => {
    setTimeFilter(filter);
    setShowFilterDropdown(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.ink }]}>Community</Text>
        <Text style={[styles.subheading, { color: theme.inkMuted }]}>Requests, stories, and updates from fellow donors</Text>

        <View style={[styles.createActions, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable 
            style={styles.whatsOnYourMind}
            onPress={() => setShowBloodRequestModal(true)}
          >
            <View style={[styles.avatarSmall, { backgroundColor: theme.crimsonLight }]}>
              <Text style={[styles.avatarTextSmall, { color: theme.crimson }]}>{profile?.full_name?.[0] || '?'}</Text>
            </View>
            <Text style={[styles.whatsOnYourMindText, { color: theme.inkMuted }]}>
              Urgently need blood? Request here...
            </Text>
          </Pressable>
          <View style={styles.createButtonsRow}>
            <TouchableOpacity 
              style={styles.createBtnItem}
              onPress={() => setShowBloodRequestModal(true)}
            >
              <Siren size={16} color={theme.crimson} />
              <Text style={[styles.createBtnLabel, { color: theme.ink }]}>Request</Text>
            </TouchableOpacity>
            <View style={[styles.createBtnDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity 
              style={styles.createBtnItem}
              onPress={() => setShowDonorStoryModal(true)}
            >
              <MessageSquareHeart size={16} color={theme.teal} />
              <Text style={[styles.createBtnLabel, { color: theme.ink }]}>Story</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          {(Object.keys(typeMeta) as CommunityPost['type'][]).map((type) => {
            const meta = typeMeta[type];
            return (
              <Pressable
                key={type}
                style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/community/category/${type}`)}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.paper }]}>
                  <meta.icon size={20} color={theme.crimson} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.ink }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <BloodRequestCreateModal
          visible={showBloodRequestModal}
          onClose={() => setShowBloodRequestModal(false)}
          requesterEligibility={requesterEligibility}
          onSubmitted={async (payload) => {
            const { error } = await createBloodRequest(
              payload.hospital,
              payload.address,
              payload.bloodTypeNeeded,
              payload.unitsNeeded,
              payload.triageUrgencyLevel,
              payload.body,
              payload.neededBy
            );
            if (error) {
              showToast({ type: 'error', title: 'Post failed', message: error });
            } else {
              showToast({
                type: 'success',
                title: 'Blood request posted!',
                message: 'Your request is now visible to the community.',
              });
            }
            setShowBloodRequestModal(false);
          }}
        />

        <DonorStoryCreateModal
          visible={showDonorStoryModal}
          onClose={() => setShowDonorStoryModal(false)}
          requesterEligibility={storyEligibility}
          onSubmitted={async (payload) => {
            const { error } = await createStoryOrAnnouncement(payload.title, payload.body, 'story');
            if (error) {
              showToast({ type: 'error', title: 'Post failed', message: error });
            } else {
              showToast({
                type: 'success',
                title: 'Story posted!',
                message: 'Your story is now visible to the community.',
              });
            }
            setShowDonorStoryModal(false);
          }}
        />

        {/* Helper registration is handled on the post detail screen (I Can Help button). */}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Recent Activity</Text>
          <Pressable 
            style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setShowFilterDropdown(true)}
          >
            <Filter size={14} color={theme.crimson} />
            <Text style={[styles.filterText, { color: theme.ink }]}>{filterLabels[timeFilter]}</Text>
            <ChevronDown size={14} color={theme.inkMuted} />
          </Pressable>
        </View>

        <Modal
          visible={showFilterDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterDropdown(false)}
        >
          <Pressable style={styles.dropdownOverlay} onPress={() => setShowFilterDropdown(false)}>
            <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {(Object.entries(filterLabels) as [('all' | 'today' | 'week' | 'month'), string][]).map(([key, label]) => (
                <Pressable 
                  key={key} 
                  style={[
                    styles.dropdownItem, 
                    timeFilter === key && { backgroundColor: theme.paper }
                  ]} 
                  onPress={() => handleFilterSelect(key)}
                >
                  <Text style={[
                    styles.dropdownText, 
                    { color: theme.ink }, 
                    timeFilter === key && { color: theme.crimson, fontWeight: '700' }
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
        <View style={{ gap: spacing.md }}>
          {sortedPosts.map((post) => {
            const meta = typeMeta[post.type];
            return (
              <Pressable key={post.id} onPress={() => router.push(`/community/${post.id}`)}>
                <Card style={{ gap: spacing.xs }}>
                  <View style={styles.row}>
                    <meta.icon size={14} color={theme.ink} />
                    <Badge label={meta.label.replace('Blood ', '')} tone={meta.tone} />
                  </View>
                  <Text style={[styles.title, { color: theme.ink }]}>{post.title}</Text>
                  <Text style={[styles.body, { color: theme.inkMuted }]} numberOfLines={2}>
                    {post.body}
                  </Text>
                  <View style={styles.authorRow}>
                    <Text style={[styles.author, { color: theme.inkFaint }]}>
                      {post.authorName} · {timeAgo(post.postedAt)}
                    </Text>
                  </View>

                  {post.type === 'request' && post.relatedRequestId && (
                    <View style={styles.cardFooter}>
                      {profile && requests.find(r => r.id === post.relatedRequestId) && 
                       canDonateTo(profile.bloodType, requests.find(r => r.id === post.relatedRequestId)!.bloodTypeNeeded) ? (
                        <Pressable 
                          style={[styles.miniCta, { backgroundColor: theme.crimson }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            openCanHelpFlow(post.relatedRequestId!);
                          }}
                        >
                          <Text style={styles.miniCtaText}>I Can Help</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.matchedIncompatible}>
                          <Text style={[styles.incompatibleText, { color: theme.inkFaint }]}>
                            Incompatible Blood Type
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>

        {selectedRequest && profile && (
          <HelpFormModal
            visible={showHelperModal}
            request={selectedRequest}
            user={profile}
            onClose={() => setShowHelperModal(false)}
            onSubmit={async ({ helper_name, helper_contact, helper_email }) => {
              const { error } = await pledgeRequest(selectedRequest.id, {
                helper_name,
                helper_contact,
                helper_email
              });

              if (error) {
                showToast({ type: 'error', title: 'Pledge failed', message: error });
              } else {
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
                setShowHelperModal(false);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  heading: { ...typography.display },
  subheading: { ...typography.body, marginBottom: spacing.md },
  createActions: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  whatsOnYourMind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    ...typography.caption,
    fontWeight: '800',
  },
  whatsOnYourMindText: {
    ...typography.body,
    fontSize: 14,
  },
  createButtonsRow: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  createBtnItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  createBtnLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  createBtnDivider: {
    width: 1,
    height: 16,
    marginHorizontal: spacing.xs,
  },
  blockedNotice: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  blockedNoticeTitle: { ...typography.bodyStrong, fontWeight: '900' },
  blockedNoticeText: { ...typography.caption, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  actionBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { ...typography.caption, fontWeight: '700', textAlign: 'center', fontSize: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionTitle: { ...typography.h2 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { ...typography.caption, fontWeight: '600' },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 240, // Aligns roughly with the filter button
    paddingRight: spacing.lg,
  },
  dropdownMenu: {
    width: 150,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dropdownText: { ...typography.body, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { ...typography.h2 },
  body: { ...typography.body },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { ...typography.caption, marginTop: spacing.xs },
  cardFooter: { marginTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: spacing.xs },
  miniCta: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.sm, alignSelf: 'flex-start' },
  miniCtaText: { ...typography.caption, color: '#FFF', fontWeight: '700' },
  matchedIncompatible: { paddingVertical: 6 },
  incompatibleText: { fontSize: 10, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg },
  modalSheet: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  modalTitle: { ...typography.h2, fontWeight: '900' },
  modalText: { ...typography.body, lineHeight: 20 },
  modalBtn: { borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
});
