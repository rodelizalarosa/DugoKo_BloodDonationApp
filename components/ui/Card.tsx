import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { radius, shadows, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface CardProps extends ViewProps {
  flat?: boolean;
}

export function Card({ children, style, ...rest }: CardProps) {
  const { theme, isDarkMode } = useTheme();
  const shadowStyle = isDarkMode ? shadows.dark : shadows.light;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        shadowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
  },
});
