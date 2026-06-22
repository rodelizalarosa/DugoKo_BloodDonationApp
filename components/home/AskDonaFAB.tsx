import { MessageCircleHeart, Search, Send, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { useLearn } from '@/lib/hooks/useLearn';
import { radius, spacing, typography } from '@/constants/theme';
import { FaqItem } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface ChatTurn {
  id: string;
  question: string;
  answer: string;
  source: 'ai' | 'faq';
  sourceTitle?: string;
  sourceUrl?: string;
}

async function askDonaAi(question: string, context: string): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  const model = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.1-8b-instant';
  if (!apiKey) return null;

  const prompt = [
    'You are Dona, a Philippine Red Cross blood donation assistant.',
    'Answer only from the approved context below.',
    'If the approved context is insufficient, say you do not have an approved answer.',
    'Keep the response short, accurate, and friendly.',
    'Always end with: General information only. Not a medical diagnosis.',
    '',
    'Approved context:',
    context || 'No approved context matched.',
    '',
    `User question: ${question}`,
  ].join('\n');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise assistant for blood donation guidance.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 220,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+ ]/g, ' ');
}

function scoreFaq(item: FaqItem, query: string) {
  const q = normalize(query);
  const haystack = normalize(`${item.question} ${item.answer} ${item.keywords.join(' ')}`);
  let score = 0;
  if (haystack.includes(q.trim())) score += 8;
  for (const token of q.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

export function AskDonaFAB() {
  const { searchFaq } = useLearn();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [thread, setThread] = useState<ChatTurn[]>([]);
  const [searchResults, setSearchResults] = useState<FaqItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const dbResults = await searchFaq(query.trim());
      const ranked = [...dbResults]
        .sort((a, b) => scoreFaq(b, query) - scoreFaq(a, query))
        .slice(0, 5);

      if (!cancelled) setSearchResults(ranked);
    }

    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [query, searchFaq]);

  async function ask(question: string) {
    setIsThinking(true);
    const dbResults = await searchFaq(question);
    const ranked = [...dbResults]
      .sort((a, b) => scoreFaq(b, question) - scoreFaq(a, question))
      .slice(0, 3);

    const context = ranked
      .map((item, index) => {
        const sourceLine = item.sourceTitle ? `Source: ${item.sourceTitle}` : '';
        return `${index + 1}. Q: ${item.question}\nA: ${item.answer}${sourceLine ? `\n${sourceLine}` : ''}`;
      })
      .join('\n\n');

    const aiAnswer = await askDonaAi(question, context);
    const top = ranked[0];
    const answer =
      aiAnswer ||
      top?.answer ||
      'I do not have an approved answer for that yet. Please check with Philippine Red Cross screening staff.';

    setThread((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        question,
        answer,
        source: aiAnswer ? 'ai' : 'faq',
        sourceTitle: top?.sourceTitle,
        sourceUrl: top?.sourceUrl,
      },
    ]);
    setIsThinking(false);
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
                <Text style={[styles.sheetTitle, { color: theme.ink }]}>Ask Dona AI</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.inkMuted }]}>
                  Blood donation guidance based on approved Philippine Red Cross content
                </Text>
              </View>
              <Pressable onPress={close} hitSlop={10}>
                <X size={22} color={theme.inkMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.thread} contentContainerStyle={{ gap: spacing.md }}>
              {thread.length === 0 && (
                <Text style={[styles.emptyHint, { color: theme.inkMuted }]}>
                  Ask about blood donation, eligibility, preparation, or what to do next. General information only. Not a medical diagnosis.
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
                      General information only. Not a medical diagnosis.
                    </Text>
                    {turn.sourceTitle ? (
                      <Text style={[styles.source, { color: theme.inkFaint }]}>
                        Source: {turn.sourceTitle}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
              {isThinking && (
                <Text style={[styles.emptyHint, { color: theme.inkMuted }]}>Dona is thinking...</Text>
              )}
            </ScrollView>

            <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search size={16} color={theme.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Ask Dona about blood donation..."
                placeholderTextColor={theme.inkFaint}
                style={[styles.input, { color: theme.ink }]}
                onSubmitEditing={() => query.trim() && ask(query.trim())}
                returnKeyType="send"
              />
              <Pressable onPress={() => query.trim() && ask(query.trim())}>
                <Send size={18} color={theme.crimson} />
              </Pressable>
            </View>

            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 160 }}
                renderItem={({ item }) => (
                  <Pressable style={[styles.resultRow, { borderBottomColor: theme.border }]} onPress={() => ask(item.question)}>
                    <Text style={[styles.resultText, { color: theme.ink }]}>{item.question}</Text>
                    {item.sourceTitle ? (
                      <Text style={[styles.resultSource, { color: theme.inkFaint }]}>{item.sourceTitle}</Text>
                    ) : null}
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
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
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
  source: { ...typography.caption, marginTop: spacing.xs, fontStyle: 'italic' },
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
  resultSource: { ...typography.caption, marginTop: 2 },
});
