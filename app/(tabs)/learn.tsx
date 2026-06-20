import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockArticles } from '@/constants/mockData';

export default function LearnScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.ink }]}>Learn</Text>
        <Text style={[styles.subheading, { color: theme.inkMuted }]}>Trusted, bite-sized info on blood donation</Text>

        {mockArticles.map((a) => (
          <Pressable key={a.id} onPress={() => router.push(`/learn/${a.id}`)}>
            <Card style={styles.card}>
              <Text style={styles.emoji}>{a.coverEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Badge label={a.category} tone="teal" />
                <Text style={[styles.title, { color: theme.ink }]}>{a.title}</Text>
                <Text style={[styles.summary, { color: theme.inkMuted }]} numberOfLines={2}>
                  {a.summary}
                </Text>
                <Text style={[styles.readTime, { color: theme.inkFaint }]}>{a.readMinutes} min read</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  heading: { ...typography.display },
  subheading: { ...typography.body, marginBottom: spacing.sm },
  card: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  emoji: { fontSize: 32 },
  title: { ...typography.h2, marginTop: spacing.xs },
  summary: { ...typography.body, marginTop: 2 },
  readTime: { ...typography.caption, marginTop: spacing.xs },
});
