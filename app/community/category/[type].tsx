import { useLocalSearchParams, useRouter } from 'expo-router';
import { Megaphone, MessageSquareHeart, Siren } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockCommunityPosts } from '@/constants/mockData';
import { CommunityPost } from '@/types';

const typeMeta: Record<CommunityPost['type'], { icon: any; tone: 'crimson' | 'teal' | 'amber'; label: string }> = {
  request: { icon: Siren, tone: 'crimson', label: 'Blood Requests' },
  story: { icon: MessageSquareHeart, tone: 'teal', label: 'Donor Stories' },
  announcement: { icon: Megaphone, tone: 'amber', label: 'Announcements' },
};

export default function CategoryScreen() {
  const { type } = useLocalSearchParams<{ type: CommunityPost['type'] }>();
  const router = useRouter();
  const { theme } = useTheme();

  const meta = typeMeta[type] || typeMeta.request;
  const filteredPosts = mockCommunityPosts
    .filter((post) => post.type === type)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader 
        title={meta.label} 
        subtitle={`Viewing all ${meta.label.toLowerCase()}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {filteredPosts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.inkMuted }]}>No posts in this category yet.</Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <Pressable key={post.id} onPress={() => router.push(`/community/${post.id}`)}>
              <Card style={{ gap: spacing.xs }}>
                <View style={styles.row}>
                  <meta.icon size={18} color={theme.ink} />
                  <Badge label={meta.label.slice(0, -1)} tone={meta.tone} />
                </View>
                <Text style={[styles.title, { color: theme.ink }]}>{post.title}</Text>
                <Text style={[styles.body, { color: theme.inkMuted }]}>
                  {post.body}
                </Text>
                <Text style={[styles.author, { color: theme.inkFaint }]}>
                  {post.authorName} · {timeAgo(post.postedAt)}
                </Text>
              </Card>
            </Pressable>
          ))
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...typography.body },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { ...typography.h2 },
  body: { ...typography.body },
  author: { ...typography.caption, marginTop: spacing.xs },
});
