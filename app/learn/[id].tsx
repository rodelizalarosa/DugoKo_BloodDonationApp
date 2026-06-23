import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Droplets, Clock, User, BookOpen, Activity, Scale, Calendar, UserPlus, AlertCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLearn } from '@/lib/hooks/useLearn';
import type { LearnArticle } from '@/types';

// Icon mapping for articles
const getArticleIcon = (id: string) => {
  switch (id) {
    case 'fallback-1': return User;
    case 'fallback-2': return Droplets;
    case 'fallback-3': return Heart;
    case 'fallback-4': return Activity;
    case 'fallback-5': return Scale;
    case 'fallback-6': return Calendar;
    default: return BookOpen;
  }
};

// Fallback content when database is empty
const FALLBACK_ARTICLES: LearnArticle[] = [
  {
    id: 'fallback-1',
    title: 'Who Can Donate Blood?',
    category: 'Basics',
    summary: 'The core requirements for first-time donors in the Philippines.',
    readMinutes: 3,
    coverEmoji: '🩸',
    content: 'To donate blood in the Philippines, you generally need to be 16–65 years old, weigh at least 50kg, and be in good general health. First-time donors aged 16-17 need parental consent. A screening interview and mini physical exam (blood pressure, hemoglobin, pulse) happens before every donation.',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    title: 'What Happens During Donation?',
    category: 'Process',
    summary: 'A step-by-step walkthrough of the blood donation process.',
    readMinutes: 4,
    coverEmoji: '💉',
    content: '1. Registration: Bring a valid ID. 2. Screening: Answer health questions. 3. Mini-Physical: Check temperature, blood pressure, pulse, and hemoglobin. 4. Donation: A sterile needle draws about 450ml of blood, taking 5-10 minutes. 5. Rest & Refresh: Enjoy snacks and drinks. 6. Certificate: Receive your donation certificate.',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    title: 'How Blood Helps Others',
    category: 'Impact',
    summary: 'Understanding the life-saving impact of your donation.',
    readMinutes: 3,
    coverEmoji: '❤️',
    content: 'One donation can save up to three lives. Blood is separated into red cells, platelets, and plasma - each used for different patients. Cancer patients, accident victims, surgery patients, and those with chronic illnesses all need blood. Regular donations ensure a stable supply for emergencies.',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    title: 'After Your Donation',
    category: 'Recovery',
    summary: 'Tips for a healthy recovery after giving blood.',
    readMinutes: 2,
    coverEmoji: '🍌',
    content: 'Rest for 15-20 minutes after donating. Drink extra fluids (4+ glasses) in the next 24 hours. Avoid heavy lifting or intense exercise for the rest of the day. Eat iron-rich foods like meat, beans, or leafy greens. If you feel dizzy, sit down and rest until you feel better.',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    title: 'Blood Type Facts',
    category: 'Basics',
    summary: 'Learn about the different blood types and why they matter.',
    readMinutes: 3,
    coverEmoji: '🩸',
    content: 'There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor; AB+ is the universal recipient. Your blood type is inherited from your parents. Knowing your type helps ensure safe transfusions. In the Philippines, O+ is the most common type.',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-6',
    title: 'How Often Can I Donate?',
    category: 'Eligibility',
    summary: 'Guidelines for regular blood donation.',
    readMinutes: 2,
    coverEmoji: '📅',
    content: 'For whole blood donations: wait 3 months between donations (90 days). For platelet donations: you can donate every 2 weeks, up to 24 times per year. For double red cell donations: wait 180 days. Always consult with the blood center staff about your specific eligibility.',
    publishedAt: new Date().toISOString(),
  },
];

// Content renderer - converts numbered text to list items
function ContentRenderer({ content, theme }: { content: string; theme: any }) {
  const isNumbered = /^\d+\.\s/.test(content) || content.includes('1. ');
  const hasMultipleSteps = content.includes('.  ') || content.includes('\n');

  if (isNumbered && hasMultipleSteps) {
    // Split by numbered items like "1. ", "2. " or just numbered separators
    const steps = content.split(/(?=\d+\.)/).filter(s => s.trim());
    return (
      <View style={styles.listContainer}>
        {steps.map((step, idx) => {
          const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
          return (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.listNumber, { backgroundColor: theme.crimsonLight }]}>
                <Text style={[styles.listNumberText, { color: theme.crimson }]}>{idx + 1}</Text>
              </View>
              <Text style={[styles.listText, { color: theme.ink }]}>{cleanStep}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  // Check for bullet points
  if (content.includes('• ') || content.includes('- ')) {
    const items = content.split(/\n|;/).filter(s => s.trim());
    return (
      <View style={styles.listContainer}>
        {items.map((item, idx) => {
          const cleanItem = item.replace(/^[•\-]\s*/, '').trim();
          return (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: theme.crimson }]} />
              <Text style={[styles.listText, { color: theme.ink }]}>{cleanItem}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  // Check for multiple sentences
  if (content.includes('. ') && content.split('. ').length > 2) {
    const sentences = content.split(/(?<=[.])\s+(?=[A-Z])/).filter(s => s.trim());
    return (
      <View style={styles.listContainer}>
        {sentences.map((sentence, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: theme.crimson }]} />
            <Text style={[styles.listText, { color: theme.ink }]}>{sentence.trim()}</Text>
          </View>
        ))}
      </View>
    );
  }

  // Default: paragraph
  return <Text style={[styles.bodyText, { color: theme.ink }]}>{content}</Text>;
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { fetchArticleById } = useLearn();
  const [article, setArticle] = useState<LearnArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const IconComponent = getArticleIcon(id || '');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchArticleById(id).then((result) => {
      if (result) {
        setArticle(result);
      } else {
        const fallback = FALLBACK_ARTICLES.find((a) => a.id === id);
        setArticle(fallback || null);
      }
      setIsLoading(false);
    });
  }, [id, fetchArticleById]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <ScreenHeader title="Learn" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.crimson} />
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <ScreenHeader title="Learn" />
        <EmptyState title="Article not found" description="This article may have been removed." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader
        title="Learn"
        leftIcon={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.ink} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.articleCard}>
          {/* Icon Header */}
          <View style={[styles.iconContainer, { backgroundColor: theme.crimsonLight }]}>
            <IconComponent size={32} color={theme.crimson} />
          </View>

          <Badge label={article.category} tone="teal" />
          <Text style={[styles.title, { color: theme.ink }]}>{article.title}</Text>
          <View style={styles.metaRow}>
            <Clock size={12} color={theme.inkFaint} />
            <Text style={[styles.readTime, { color: theme.inkFaint }]}>{article.readMinutes} min read</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Content rendered as list or paragraph */}
          <ContentRenderer content={article.content} theme={theme} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  backButton: { padding: spacing.xs },
  articleCard: { gap: spacing.sm, padding: spacing.lg },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.display, marginTop: spacing.sm, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.xs },
  readTime: { ...typography.caption },
  divider: { height: 1, marginVertical: spacing.md },
  bodyText: { ...typography.body, lineHeight: 24 },

  // List rendering
  listContainer: { gap: spacing.md },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  listNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listNumberText: { ...typography.caption, fontWeight: '800', fontSize: 12 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: { ...typography.body, flex: 1, lineHeight: 22 },
});