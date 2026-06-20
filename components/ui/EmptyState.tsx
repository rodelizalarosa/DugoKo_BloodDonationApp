import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
}

export function EmptyState({ emoji = '🩸', title, description }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      {description ? <Text style={[styles.desc, { color: theme.inkMuted }]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  emoji: { fontSize: 40, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center' },
  desc: { ...typography.body, textAlign: 'center', marginTop: spacing.xs },
});
