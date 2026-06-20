import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = true, right }: ScreenHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack && router.canGoBack() && (
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} hitSlop={10}>
            <ChevronLeft size={22} color={theme.ink} />
          </Pressable>
        )}
        <View>
          <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.inkMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.caption, marginTop: 2 },
});
