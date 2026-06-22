import { useRouter } from 'expo-router';
import { ChevronDown, Filter, Megaphone, MessageSquareHeart, Siren } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const typeMeta: Record<CommunityPost['type'], { icon: any; tone: 'crimson' | 'teal' | 'amber'; label: string }> = {
  request: { icon: Siren, tone: 'crimson', label: 'Blood Request' },
  story: { icon: MessageSquareHeart, tone: 'teal', label: 'Donor Story' },
  announcement: { icon: Megaphone, tone: 'amber', label: 'Announcement' },
};

export default function CommunityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = React.useState<'all' | 'today' | 'week' | 'month'>('all');

  const { profile } = useProfile();
  const { posts, createBloodRequest, createStoryOrAnnouncement } = useCommunity();
  const { showToast } = useToast();

  // Posting eligibility — safe-guard when profile is still loading
  const eligibility = calculateEligibility(profile?.lastDonationDate ?? null, profile?.sex);

  const mappedStatus: 'eligible' | 'deferred' | 'not_eligible' =
    eligibility.status === 'eligible' ? 'eligible' : eligibility.status === 'deferred' ? 'deferred' : 'not_eligible';

  const requesterEligibility = {
    status:
      profile?.profileComplete && (profile?.totalDonations ?? 0) > 0 ? mappedStatus : 'not_eligible',
    daysRemaining: eligibility.daysRemaining,
  } as const;

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

        <View style={styles.createActions}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border, opacity: requesterEligibility.status !== 'eligible' ? 0.6 : 1 }]}
            onPress={() => requesterEligibility.status === 'eligible' && setShowBloodRequestModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.paper }]}>
              <Siren size={16} color={theme.crimson} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.ink }]}>Blood request</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border, opacity: requesterEligibility.status !== 'eligible' ? 0.6 : 1 }]}
            onPress={() => requesterEligibility.status === 'eligible' && setShowDonorStoryModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.paper }]}>
              <MessageSquareHeart size={16} color={theme.teal} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.ink }]}>Donor story</Text>
          </Pressable>
        </View>

        {requesterEligibility.status !== 'eligible' && (
          <View style={[styles.blockedNotice, { borderColor: theme.border }]}>
            <Text style={[styles.blockedNoticeTitle, { color: theme.crimson }]}>Posting locked</Text>
            <Text style={[styles.blockedNoticeText, { color: theme.inkMuted }]}>
              {requesterEligibility.status === 'deferred'
                ? `You’ll be eligible in ${requesterEligibility.daysRemaining ?? 0} days.`
                : 'You must be eligible (Red Cross health checks + donation eligibility) to post.'}
            </Text>
          </View>
        )}

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
                  <meta.icon size={22} color={theme.crimson} />
                </View>
                <Text
                  style={[styles.actionLabel, { color: theme.ink }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {meta.label}
                </Text>
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
          requesterEligibility={requesterEligibility}
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
                  <Text style={[styles.author, { color: theme.inkFaint }]}>
                    {post.authorName} · {timeAgo(post.postedAt)}
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>
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
  createActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
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
  author: { ...typography.caption, marginTop: spacing.xs },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg },
  modalSheet: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  modalTitle: { ...typography.h2, fontWeight: '900' },
  modalText: { ...typography.body, lineHeight: 20 },
  modalBtn: { borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
});
