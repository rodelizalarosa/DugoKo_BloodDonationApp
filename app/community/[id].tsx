import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCommunity } from '@/lib/hooks/useCommunity';
import { useProfile } from '@/lib/hooks/useProfile';
import { canDonateTo } from '@/lib/blood-utils';
import { HelperRegistrationModal } from '@/components/community/HelperRegistrationModal';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export default function CommunityPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDarkMode } = useTheme();
  const { profile } = useProfile();
  const { posts, requests, isLoading, pledgeRequest, getUserPledge } = useCommunity();
  const { showToast } = useToast();
  const post = posts.find((p) => p.id === id);
  // Also check if ID is a request ID (navigated from home page)
  const directRequest = !post ? requests.find((r) => r.id === id) : undefined;
  const relatedRequest = post?.relatedRequestId
    ? requests.find((r) => r.id === post.relatedRequestId)
    : directRequest;

  // Check if user has already pledged to this request
  const [hasPledged, setHasPledged] = useState(false);
  const [checkingPledge, setCheckingPledge] = useState(true);

  useEffect(() => {
    async function checkPledge() {
      if (!relatedRequest || !profile) {
        setCheckingPledge(false);
        return;
      }
      const pledged = await getUserPledge(relatedRequest.id);
      setHasPledged(pledged);
      setCheckingPledge(false);
    }
    checkPledge();
  }, [relatedRequest, profile, getUserPledge]);

  // Build synthetic post data from direct request for display
  const displayPost = post || (directRequest ? {
    id: directRequest.id,
    type: 'request' as const,
    title: `Blood Needed: ${directRequest.bloodTypeNeeded} at ${directRequest.hospital}`,
    body: directRequest.notes || `Urgent request for ${directRequest.unitsNeeded} units of ${directRequest.bloodTypeNeeded} blood.`,
    authorName: 'Anonymous',
    postedAt: directRequest.postedAt,
  } : null);

  const [helperModalVisible, setHelperModalVisible] = useState(false);
  const [helperSubmitted, setHelperSubmitted] = useState(false);
  const [helperFullName, setHelperFullName] = useState<string | null>(null);
  const [helperContactNumber, setHelperContactNumber] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
        <ScreenHeader title="Community" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.crimson} />
        </View>
      </SafeAreaView>
    );
  }

  if (!displayPost && !directRequest) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Post" />
        <EmptyState title="Post not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Community" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <Text style={[styles.postTitle, { color: theme.ink }]}>{displayPost?.title}</Text>
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: theme.crimsonLight }]}>
              <Text style={[styles.avatarText, { color: theme.crimson }]}>{displayPost?.authorName?.[0] || '?'}</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: theme.ink }]}>{displayPost?.authorName || 'Anonymous'}</Text>
              <Text style={[styles.postTime, { color: theme.inkFaint }]}>{displayPost?.postedAt ? timeAgo(displayPost.postedAt) : 'Recent'}</Text>
            </View>
          </View>

          <Text style={[styles.postBody, { color: theme.ink }]}>{displayPost?.body}</Text>

          {!relatedRequest && displayPost?.type === 'story' && (
             <Button
                label="Share this story"
                variant="outline"
                style={{ marginTop: spacing.lg }}
                fullWidth
             />
          )}
        </Card>

        {relatedRequest && (
          <Card style={[styles.requestCard, { borderColor: theme.crimson }]}>
            <View style={styles.reqHeader}>
              <Badge label="Urgent Request" tone="crimson" />
              <Text style={[styles.reqStat, { color: theme.crimson }]}>
                {relatedRequest.bloodTypeNeeded}
              </Text>
            </View>

            <Text style={[styles.reqHospital, { color: theme.ink }]}>{relatedRequest.hospital}</Text>
            <Text style={[styles.reqAddress, { color: theme.inkMuted }]}>{relatedRequest.address}</Text>

            <View style={styles.divider} />

            <Text style={[styles.reqNeeds, { color: theme.ink }]}>
              {relatedRequest.unitsNeeded - relatedRequest.unitsPledged} units still needed
            </Text>

            {relatedRequest.notes && <Text style={[styles.reqNotes, { color: theme.inkMuted }]}>{relatedRequest.notes}</Text>}

            {checkingPledge ? (
              <ActivityIndicator color={theme.crimson} style={{ marginTop: spacing.md }} />
            ) : helperSubmitted || hasPledged ? (
              <Card style={[styles.confirm, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
                <Text style={[styles.confirmText, { color: theme.teal }]}>
                  ✓ You already pledged to help this request
                </Text>
              </Card>
            ) : (
              profile && relatedRequest && canDonateTo(profile.bloodType, relatedRequest.bloodTypeNeeded) ? (
                <Button
                  label="I Can Help"
                  onPress={() => setHelperModalVisible(true)}
                  style={{ marginTop: spacing.md }}
                  fullWidth
                />
              ) : (
                <View style={[styles.incompatibleNotice, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={[styles.incompatibleText, { color: theme.inkMuted }]}>
                    Blood type {profile?.bloodType ?? '?'} is not compatible with {relatedRequest?.bloodTypeNeeded}
                  </Text>
                </View>
              )
            )}
          </Card>
        )}

        <HelperRegistrationModal
          visible={helperModalVisible}
          onClose={() => setHelperModalVisible(false)}
          requesterLabel={`${displayPost?.title ?? 'this request'} • ${relatedRequest?.hospital ?? ''}`}
          onSubmitted={async (payload) => {
            if (!relatedRequest) return;

            // Save the pledge to Supabase
            const { error } = await pledgeRequest(relatedRequest.id, {
              helper_name: payload.fullName,
              helper_contact: payload.contactNumber,
              helper_email: payload.email,
            });

            if (error) {
              showToast({ type: 'error', title: 'Failed to submit', message: error });
              return;
            }

            // Send email confirmation
            if (payload.email) {
              try {
                await supabase.functions.invoke('send-help-confirmation', {
                  body: {
                    donor_email: payload.email,
                    donor_name: payload.fullName,
                    blood_type: relatedRequest.bloodTypeNeeded,
                    hospital: relatedRequest.hospital,
                    units_needed: relatedRequest.unitsNeeded,
                  },
                });
              } catch (emailErr) {
                console.log('Email notification skipped:', emailErr);
              }
            }

            setHelperSubmitted(true);
            setHelperFullName(payload.fullName);
            setHelperContactNumber(payload.contactNumber);
            setHelperModalVisible(false);
            showToast({
              type: 'success',
              title: 'Help offer sent!',
              message: `The requester has been notified. Thank you, ${payload.fullName}!`,
            });
          }}
        />

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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  mainCard: { gap: spacing.md },
  postTitle: { ...typography.display },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h2, fontWeight: '800' },
  authorName: { ...typography.bodyStrong },
  postTime: { ...typography.caption },
  postBody: { ...typography.body, lineHeight: 24, fontSize: 16 },
  requestCard: { gap: spacing.sm, borderWidth: 2 },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqHospital: { ...typography.h2, marginTop: spacing.xs },
  reqAddress: { ...typography.body },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: spacing.xs },
  reqNeeds: { ...typography.bodyStrong, fontSize: 16 },
  reqNotes: { ...typography.body, fontStyle: 'italic' },
  reqStat: { ...typography.h1, fontSize: 24 },
  confirm: { marginTop: spacing.md },
  confirmText: { ...typography.bodyStrong, textAlign: 'center' },
  incompatibleNotice: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  incompatibleText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
