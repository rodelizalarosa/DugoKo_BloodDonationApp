import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Question {
  id: string;
  text: string;
  // true answer = potential deferral
}

const questions: Question[] = [
  { id: 'fever', text: 'Do you currently have a fever, cold, or flu symptoms?' },
  { id: 'tattoo', text: 'Have you gotten a tattoo or piercing in the last 6 months?' },
  { id: 'pregnant', text: 'Are you currently pregnant or breastfeeding?' },
  { id: 'medication', text: 'Are you currently taking antibiotics or blood thinners?' },
  { id: 'illness', text: 'Have you been diagnosed with a serious illness recently?' },
];

type Step = 'intro' | number | 'result';

export default function EligibilityCheckerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ helpRequestId?: string }>();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { session, updateProfile } = useAuth();
  const userId = session?.user?.id;
  const [step, setStep] = useState<Step>('intro');
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const anyFlag = Object.values(flags).some(Boolean);

  async function answer(value: boolean) {
    const q = questions[step as number];
    const next = { ...flags, [q.id]: value };
    setFlags(next);
    if ((step as number) + 1 < questions.length) {
      setStep((step as number) + 1);
    } else {
      setStep('result');

      // Save eligibility result to DB
      if (userId) {
        setSaving(true);
        const anyFlagNow = Object.values({ ...next, [q.id]: value }).some(Boolean);
        const status = anyFlagNow ? 'deferred' : 'eligible';
        const { error } = await updateProfile({ eligibility_status: status });
        setSaving(false);

        if (error) {
          showToast({ type: 'error', title: 'Save failed', message: error });
        }
      }
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Eligibility Checker" subtitle="Avoid unnecessary trips" />
      <ScrollView contentContainerStyle={styles.content}>
        {step === 'intro' && (
          <Card>
            <Text style={[styles.h2, { color: theme.ink }]}>Before we begin</Text>
            <Text style={[styles.body, { color: theme.inkMuted }]}>
              Answer 5 quick yes/no questions based on Philippine Red Cross screening guidelines.
              This is a pre-check only — final eligibility is confirmed on-site by a PRC nurse.
            </Text>
            <Button label="Start" onPress={() => setStep(0)} style={{ marginTop: spacing.lg }} />
          </Card>
        )}

        {typeof step === 'number' && (
          <Card>
            <Text style={[styles.progress, { color: theme.crimson }]}>
              Question {step + 1} of {questions.length}
            </Text>
            <Text style={[styles.question, { color: theme.ink }]}>{questions[step].text}</Text>
            <View style={styles.answerRow}>
              <Button label="No" variant="outline" onPress={() => answer(false)} style={{ flex: 1 }} />
              <Button label="Yes" onPress={() => answer(true)} style={{ flex: 1 }} />
            </View>
          </Card>
        )}

        {step === 'result' && (
          <Card style={[anyFlag ? styles.resultWarn : styles.resultOk, { borderColor: anyFlag ? theme.amber : theme.teal }]}>
            {anyFlag ? (
              <>
                <XCircle size={28} color={theme.amber} />
                <Text style={[styles.resultTitle, { color: theme.ink }]}>Temporarily Deferred</Text>
                <Text style={[styles.body, { color: theme.inkMuted }]}>
                  Based on your answers, you may need to wait before donating. Visit a PRC center
                  for a full screening, or read more about deferral periods.
                </Text>
                <Button
                  label="Learn Why"
                  variant="outline"
                  onPress={() => router.push('/learn/a1')}
                  style={{ marginTop: spacing.md }}
                />
              </>
            ) : (
              <>
                <CheckCircle2 size={28} color={theme.teal} />
                <Text style={[styles.resultTitle, { color: theme.ink }]}>You Look Eligible!</Text>
                <Text style={[styles.body, { color: theme.inkMuted }]}>
                  Nice — nothing in your answers suggests a deferral. Find a donation center or
                  browse upcoming events to schedule your visit.
                </Text>
                <View style={styles.answerRow}>
                  <Button
                    label={params.helpRequestId ? 'Continue to Help Form' : 'Find Center'}
                    variant="outline"
                    onPress={() => {
                      if (params.helpRequestId) {
                        router.replace('/(tabs)?helpRequestId=' + params.helpRequestId);
                        return;
                      }
                      router.push('/donate/centers');
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="See Events"
                    onPress={() => router.push('/donate/events')}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  h2: { ...typography.h2 },
  body: { ...typography.body, marginTop: spacing.sm },
  progress: { ...typography.eyebrow, textTransform: 'uppercase' },
  question: { ...typography.h2, marginTop: spacing.sm, marginBottom: spacing.lg },
  answerRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  resultOk: { alignItems: 'flex-start', borderWidth: 1.5 },
  resultWarn: { alignItems: 'flex-start', borderWidth: 1.5 },
  resultTitle: { ...typography.h1, marginTop: spacing.sm },
});
