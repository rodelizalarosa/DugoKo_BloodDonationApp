import { useRouter } from 'expo-router';
import { Heart, Droplets, Clock, User, BookOpen, Activity, Scale, Calendar, Phone } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLearn } from '@/lib/hooks/useLearn';
import type { LearnArticle } from '@/types';

// Icon mapping for article cards
const getArticleIcon = (id: string, theme: any) => {
  const iconProps = { size: 28, color: theme.crimson };
  switch (id) {
    case 'fallback-1': return <User {...iconProps} />;
    case 'fallback-2': return <Droplets {...iconProps} />;
    case 'fallback-3': return <Heart {...iconProps} />;
    case 'fallback-4': return <Activity {...iconProps} />;
    case 'fallback-5': return <Scale {...iconProps} />;
    case 'fallback-6': return <Calendar {...iconProps} />;
    default: return <BookOpen {...iconProps} />;
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
    content: 'Registration: Bring a valid ID. Screening: Answer health questions. Mini-Physical: Check temperature, blood pressure, pulse, and hemoglobin. Donation: A sterile needle draws about 450ml of blood, taking 5-10 minutes. Rest & Refresh: Enjoy snacks and drinks. Certificate: Receive your donation certificate.',
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

export default function LearnScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { articles } = useLearn();

  // Use fallback content if database returns empty
  const displayArticles = articles.length > 0 ? articles : FALLBACK_ARTICLES;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.ink }]}>Learn</Text>
        <Text style={[styles.subheading, { color: theme.inkMuted }]}>Trusted, bite-sized info on blood donation</Text>

        {displayArticles.map((a) => (
          <Pressable key={a.id} onPress={() => router.push(`/learn/${a.id}`)}>
            <Card style={[styles.card, { borderColor: theme.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.crimsonLight }]}>
                {getArticleIcon(a.id, theme)}
              </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, marginTop: spacing.xs },
  summary: { ...typography.body, marginTop: 2 },
  readTime: { ...typography.caption, marginTop: spacing.xs },
});
