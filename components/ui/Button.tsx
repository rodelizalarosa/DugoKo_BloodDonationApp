import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'default' | 'small';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled,
  loading,
  fullWidth,
  style,
  labelStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const variantStyles: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: theme.crimson },
    secondary: { backgroundColor: theme.crimsonLight },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.crimson },
    ghost: { backgroundColor: 'transparent' },
  };

  const textVariantStyles: Record<Variant, { color: string }> = {
    primary: { color: theme.surface },
    secondary: { color: theme.crimsonDark },
    outline: { color: theme.crimson },
    ghost: { color: theme.crimson },
  };

  const sizeStyles = size === 'small'
    ? styles.small
    : styles.base;

  const textSizeStyles = size === 'small'
    ? styles.labelSmall
    : styles.label;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        sizeStyles,
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.surface : theme.crimson} />
      ) : (
        <Text style={[textSizeStyles, textVariantStyles[variant], labelStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    minHeight: 48,
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    minHeight: 36,
  },
  label: {
    ...typography.bodyStrong,
    numberOfLines: 1,
  },
  labelSmall: {
    ...typography.caption,
    fontWeight: '700',
    numberOfLines: 1,
  },
});
