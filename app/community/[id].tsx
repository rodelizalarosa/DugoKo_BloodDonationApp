import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCommunity } from '@/lib/hooks/useCommunity';
import { HelperRegistrationModal } from '@/components/community/HelperRegistrationModal';
import { useToast } from '@/context/ToastContext';

export default function CommunityPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { posts, requests, isLoading } = useCommunity();
  const { showToast } = useToast();
  const post = posts.find((p) => p.id === id);
  const relatedRequest = post?.relatedRequestId
    ? requests.find((r) => r.id === post.relatedRequestId)
    : undefined;
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

  if (!post) {
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
          <Text style={[styles.postTitle, { color: theme.ink }]}>{post.title}</Text>
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: theme.crimsonLight }]}>
              <Text style={[styles.avatarText, { color: theme.crimson }]}>{post.authorName[0]}</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: theme.ink }]}>{post.authorName}</Text>
              <Text style={[styles.postTime, { color: theme.inkFaint }]}>{timeAgo(post.postedAt)}</Text>
            </View>
          </View>
          
          <Text style={[styles.postBody, { color: theme.ink }]}>{post.body}</Text>
          
          {!relatedRequest && post.type === 'story' && (
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

            {helperSubmitted ? (
              <Card style={[styles.confirm, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
                <Text style={[styles.confirmText, { color: theme.teal }]}>
                  ✓ Notified requester. Helper: {helperFullName ?? '—'} · {helperContactNumber ?? '—'}
                </Text>
              </Card>
            ) : (
              <Button
                label="I Can Help"
                onPress={() => setHelperModalVisible(true)}
                style={{ marginTop: spacing.md }}
                fullWidth
              />
            )}
          </Card>
        )}

        <HelperRegistrationModal
          visible={helperModalVisible}
          onClose={() => setHelperModalVisible(false)}
          requesterLabel={`${post?.title ?? 'this request'} • ${relatedRequest?.hospital ?? ''}`}
          onSubmitted={(payload) => {
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
});
