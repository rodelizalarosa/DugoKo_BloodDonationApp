import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Tone = 'crimson' | 'teal' | 'amber' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { theme } = useTheme();

  const toneMap: Record<Tone, { bg: string; fg: string }> = {
    crimson: { bg: theme.crimsonLight, fg: theme.crimsonDark },
    teal: { bg: theme.tealLight, fg: theme.teal },
    amber: { bg: theme.amberLight, fg: theme.amber },
    neutral: { bg: theme.border, fg: theme.inkMuted },
  };

  const { bg, fg } = toneMap[tone];

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.eyebrow,
    textTransform: 'uppercase',
  },
});
