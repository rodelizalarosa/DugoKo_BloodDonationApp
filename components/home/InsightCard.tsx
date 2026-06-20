import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { DonorInsight } from '@/types';

export function InsightCard({ insight }: { insight: DonorInsight }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.crimsonDark }]}>
      <View style={styles.row}>
        <Sparkles size={16} color="#FFD9DE" />
        <Text style={styles.eyebrow}>AI Donor Insight</Text>
      </View>
      <Text style={styles.line}>You've donated {insight.totalDonations} times.</Text>
      <Text style={styles.lineMuted}>
        Potentially {insight.estimatedLivesImpacted} lives impacted. Keep it up!
      </Text>
      <Pressable style={styles.btn} onPress={() => router.push('/insight')}>
        <Text style={styles.btnLabel}>View Details</Text>
        <ArrowRight size={16} color="#FFF" />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { 
    marginHorizontal: spacing.lg, 
    marginTop: spacing.md, 
    borderWidth: 0,
    borderRadius: radius.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eyebrow: { ...typography.eyebrow, color: '#FFD9DE', textTransform: 'uppercase' },
  line: { ...typography.h2, color: '#FFF', marginTop: spacing.sm },
  lineMuted: { ...typography.body, color: '#F4C8CD', marginTop: 2 },
  btn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  btnLabel: { ...typography.bodyStrong, color: '#FFF' },
});
