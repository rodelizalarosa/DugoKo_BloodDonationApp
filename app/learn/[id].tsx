import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockArticles } from '@/constants/mockData';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const article = mockArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Article" />
        <EmptyState title="Article not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Learn" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{article.coverEmoji}</Text>
        <Badge label={article.category} tone="teal" />
        <Text style={[styles.title, { color: theme.ink }]}>{article.title}</Text>
        <Text style={[styles.readTime, { color: theme.inkFaint }]}>{article.readMinutes} min read</Text>
        <Text style={[styles.body, { color: theme.ink }]}>{article.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  emoji: { fontSize: 40, marginBottom: spacing.sm },
  title: { ...typography.display, marginTop: spacing.sm },
  readTime: { ...typography.caption, marginTop: spacing.xs },
  body: { ...typography.body, marginTop: spacing.lg, lineHeight: 22 },
});
