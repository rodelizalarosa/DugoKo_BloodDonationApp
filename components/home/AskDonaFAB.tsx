import { MessageCircleHeart, Search, Send, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radius, spacing, typography } from '@/constants/theme';
import { FaqItem } from '@/types';
import { useTheme } from '@/context/ThemeContext';

const DONA_KNOWLEDGE: FaqItem[] = [
  {
    id: 'k1',
    question: 'What are the general eligibility requirements?',
    answer: '👉 Age: 16–65 (16–17 needs parental consent)\n👉 Weight: At least 50 kg (110 lbs)\n👉 Health: Good general health\n👉 Lifestyle: No high-risk behaviors.',
    keywords: ['eligibility', 'age', 'weight', 'requirements', 'can i donate'],
    category: 'General'
  },
  {
    id: 'k2',
    question: 'How should I prepare before donating?',
    answer: '✅ Sleep: At least 5–6 hours\n✅ Meal: Light meal (avoid fatty foods)\n✅ Hydration: Drink plenty of water\n✅ Alcohol: None in last 24 hours\n✅ Tattoos/Piercings: Wait 6–12 months.',
    keywords: ['prepare', 'sleep', 'food', 'eat', 'alcohol', 'tattoo'],
    category: 'Preparation'
  },
  {
    id: 'k3',
    question: 'When might I be temporarily deferred?',
    answer: '🕒 You may wait if you have a fever, cough, infection, recently had surgery, dental extraction, took certain meds, or traveled to high-risk areas.',
    keywords: ['deferred', 'sick', 'travel', 'medication', 'surgery'],
    category: 'Medical'
  },
  {
    id: 'k4',
    question: 'When is donation permanently restricted?',
    answer: '❌ Serious illnesses (heart disease, certain cancers) or testing positive for HIV or Hepatitis B/C lead to permanent deferral.',
    keywords: ['permanent', 'illness', 'hiv', 'hepatitis', 'cancer'],
    category: 'Medical'
  },
  {
    id: 'k5',
    question: 'What is the donation interval?',
    answer: '🩸 Donation Interval:\nMen: Every 3 months\nWomen: Every 4 months',
    keywords: ['interval', 'how often', 'wait', 'next'],
    category: 'General'
  }
];

interface ChatTurn {
  id: string;
  question: string;
  answer: string;
}

export function AskDonaFAB() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [thread, setThread] = useState<ChatTurn[]>([]);
  const { theme } = useTheme();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return DONA_KNOWLEDGE.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

  function askPredefined(faq: FaqItem) {
    setThread((prev) => [...prev, { id: `${faq.id}-${Date.now()}`, question: faq.question, answer: faq.answer }]);
    setQuery('');
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Pressable style={[styles.fab, { backgroundColor: theme.crimson }]} onPress={() => setOpen(true)}>
        <MessageCircleHeart size={24} color="#FFF" />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close} statusBarTranslucent>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: theme.paper }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.ink }]}>Ask Dona</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.inkMuted }]}>Trusted answers from Philippine Red Cross guidelines</Text>
              </View>
              <Pressable onPress={close} hitSlop={10}>
                <X size={22} color={theme.inkMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.thread} contentContainerStyle={{ gap: spacing.md }}>
              {thread.length === 0 && (
                <Text style={[styles.emptyHint, { color: theme.inkMuted }]}>
                  Search a keyword below, like "tattoo" or "medication", to get a trusted answer.
                </Text>
              )}
              {thread.map((turn) => (
                <View key={turn.id}>
                  <View style={[styles.bubbleUser, { backgroundColor: theme.crimson }]}>
                    <Text style={[styles.bubbleUserText, { color: '#FFF' }]}>{turn.question}</Text>
                  </View>
                  <View style={[styles.bubbleDona, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.bubbleDonaText, { color: theme.ink }]}>{turn.answer}</Text>
                    <Text style={[styles.disclaimer, { color: theme.inkFaint }]}>
                      ⓘ General information only — not a medical diagnosis. Final eligibility is
                      determined by PRC screening staff on-site.
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search size={16} color={theme.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search a question or keyword…"
                placeholderTextColor={theme.inkFaint}
                style={[styles.input, { color: theme.ink }]}
              />
              <Send size={18} color={theme.crimson} />
            </View>

            {results.length > 0 && (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 160 }}
                renderItem={({ item }) => (
                  <Pressable style={[styles.resultRow, { borderBottomColor: theme.border }]} onPress={() => askPredefined(item)}>
                    <Text style={[styles.resultText, { color: theme.ink }]}>{item.question}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
    minHeight: '55%',
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sheetTitle: { ...typography.h1 },
  sheetSubtitle: { ...typography.caption, marginTop: 2, maxWidth: 260 },
  thread: { flexGrow: 0, marginVertical: spacing.md },
  emptyHint: { ...typography.body },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderRadius: radius.md,
    borderBottomRightRadius: 4,
    padding: spacing.md,
    maxWidth: '85%',
    marginBottom: spacing.xs,
  },
  bubbleUserText: { ...typography.body },
  bubbleDona: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    borderBottomLeftRadius: 4,
    padding: spacing.md,
    maxWidth: '90%',
    borderWidth: 1,
  },
  bubbleDonaText: { ...typography.body },
  disclaimer: { ...typography.caption, marginTop: spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: { flex: 1, ...typography.body },
  resultRow: { paddingVertical: spacing.sm, borderBottomWidth: 1 },
  resultText: { ...typography.body },
});
