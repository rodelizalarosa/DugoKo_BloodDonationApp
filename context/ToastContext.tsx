/**
 * context/ToastContext.tsx
 * ─────────────────────────────────────────────────────────────────
 * Global toast notification system for DugóKo.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast({ type: 'success', title: 'Saved!', message: 'Your profile has been updated.' });
 *
 * Types: 'success' | 'error' | 'info' | 'warning'
 * The overlay renders above everything via absolute positioning inside RootLayout.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, typography } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  /** Auto-dismiss delay in ms. Default: 3500 */
  duration?: number;
}

interface ToastContextType {
  showToast: (opts: ToastOptions) => void;
}

// ── Context ────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null);

// ── Internal toast state ───────────────────────────────────────────
interface ToastState extends ToastOptions {
  id: number;
}

// ── Toast icon and color helpers ───────────────────────────────────
function useToastStyle(type: ToastType) {
  const { theme } = useTheme();
  switch (type) {
    case 'success':
      return {
        bg:         '#166534',
        border:     '#15803D',
        iconColor:  '#4ADE80',
        textColor:  '#DCFCE7',
        Icon:       CheckCircle2,
      };
    case 'error':
      return {
        bg:         '#7F1D1D',
        border:     '#B91C1C',
        iconColor:  '#FCA5A5',
        textColor:  '#FEE2E2',
        Icon:       AlertCircle,
      };
    case 'warning':
      return {
        bg:         '#78350F',
        border:     '#B45309',
        iconColor:  '#FCD34D',
        textColor:  '#FEF3C7',
        Icon:       AlertTriangle,
      };
    case 'info':
    default:
      return {
        bg:         '#1E3A5F',
        border:     '#2563EB',
        iconColor:  '#93C5FD',
        textColor:  '#DBEAFE',
        Icon:       Info,
      };
  }
}

// ── Single Toast Item ──────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  const style = useToastStyle(toast.type);
  const { Icon } = style;
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide in + fade in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const duration = toast.duration ?? 3500;
    const timer = setTimeout(() => slideOut(), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: style.bg,
          borderColor:     style.border,
          transform:       [{ translateY }],
          opacity,
        },
      ]}
    >
      <Icon size={20} color={style.iconColor} style={{ flexShrink: 0 }} />
      <View style={styles.toastBody}>
        <Text style={[styles.toastTitle, { color: style.textColor }]} numberOfLines={1}>
          {toast.title}
        </Text>
        {toast.message ? (
          <Text style={[styles.toastMessage, { color: style.textColor }]} numberOfLines={2}>
            {toast.message}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={slideOut} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <X size={16} color={style.textColor} style={{ opacity: 0.7 }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Provider ───────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counterRef = useRef(0);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((opts: ToastOptions) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Overlay — rendered above all screens */}
      <View
        style={[
          styles.overlay,
          { top: insets.top + spacing.sm },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    position:  'absolute',
    left:      spacing.lg,
    right:     spacing.lg,
    zIndex:    9999,
    gap:       spacing.sm,
  },
  toast: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.sm,
    paddingVertical:   spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius:   radius.md,
    borderWidth:    1,
    // Shadow
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius:   8,
    elevation:      8,
  },
  toastBody: {
    flex: 1,
    gap:  2,
  },
  toastTitle: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
  },
  toastMessage: {
    ...typography.caption,
    fontSize: 12,
    opacity:  0.85,
  },
});
