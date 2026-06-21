/**
 * app/auth/otp.tsx
 * ─────────────────────────────────────────────────────────────────
 * 6-digit OTP verification screen.
 *
 * Params (from router.push):
 *   email  — the email address to verify
 *   type   — 'signup' | 'email'
 *     • signup → verifies new account email, then goes to /(tabs)
 *     • email  → verifies forgot-password OTP (from signInWithOtp), then goes to reset-password
 *
 * DO NOT CHANGE THE UI LAYOUT OR STYLES.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { OtpType } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const RESEND_COUNTDOWN_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { verifyOtp, sendPasswordResetOtp } = useAuth();
  const { showToast } = useToast();

  // ── Read params passed from register or forgot-password ──────────
  const params = useLocalSearchParams<{ email?: string; type?: string }>();
  const email  = params.email  ?? '';
  const type   = (params.type  ?? 'signup') as OtpType;

  // ── OTP digit state ──────────────────────────────────────────────
  const [otp,      setOtp]      = useState<string[]>(['', '', '', '', '', '', '', '']);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Resend cooldown ──────────────────────────────────────────────
  const [countdown,    setCountdown]    = useState(RESEND_COUNTDOWN_SECONDS);
  const [canResend,    setCanResend]    = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const inputs = useRef<Array<TextInput | null>>([]);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startCountdown = useCallback(() => {
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Input handling ───────────────────────────────────────────────
  const handleChange = (text: string, index: number) => {
    // Allow pasting a full 8-digit OTP
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 8).split('');
      const newOtp = ['', '', '', '', '', '', '', ''];
      digits.forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      const nextEmpty = digits.length < 8 ? digits.length : 7;
      inputs.current[nextEmpty]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length > 0 && index < 7) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ── Verify ───────────────────────────────────────────────────────
  const handleVerify = async () => {
    setErrorMsg(null);
    const token = otp.join('');
    if (token.length < 8) {
      setErrorMsg('Please enter the full 8-digit code.');
      return;
    }
    if (!email) {
      setErrorMsg('Session expired. Please restart the process.');
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, token, type);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
      // Clear digits on failure
      setOtp(['', '', '', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } else {
      if (type === 'email' || type === 'recovery') {
        // After verifying forgot-password OTP, the session is set → allow password update.
        showToast({ type: 'success', title: 'Identity Verified', message: 'You can now set a new password.' });
        router.replace('/auth/reset-password');
      } else {
        // After signup OTP, the email is confirmed → send user to login so they sign in fresh.
        showToast({ type: 'success', title: 'Email Confirmed!', message: 'Your account is ready. Please log in to continue.' });
        router.replace('/auth/login');
      }
    }
  };

  // ── Resend ───────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || !email) return;
    setErrorMsg(null);
    setOtp(['', '', '', '', '', '', '', '']);
    inputs.current[0]?.focus();

    let error: string | null = null;
    if (type === 'email' || type === 'recovery') {
      const res = await sendPasswordResetOtp(email);
      error = res.error;
    } else {
      // For signup, re-trigger by calling supabase resend directly via the client.
      // We import supabase here since resend is not in AuthContext yet.
      const { supabase } = require('@/lib/supabase');
      const { error: e } = await supabase.auth.resend({ type: 'signup', email });
      error = e?.message ?? null;
    }

    if (error) {
      setErrorMsg(error);
    } else {
      showToast({ type: 'success', title: 'Code Resent', message: 'A new verification code has been sent.' });
      startCountdown();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <ShieldCheck size={48} color={theme.crimson} />
          </View>

          <Text style={[styles.title, { color: theme.ink }]}>Verification</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Enter the 8-digit code sent to{'\n'}
            <Text style={{ color: theme.crimson, fontWeight: '700' }}>{email || 'your email'}</Text>
          </Text>

          {/* Error banner */}
          {errorMsg && (
            <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
              <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: digit ? theme.crimson : theme.border,
                    color: theme.ink,
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={8} // allow paste
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.resendText, { color: theme.inkMuted }]}>
              Didn't receive the code?
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendAction, { color: theme.crimson }]}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resendAction, { color: theme.inkFaint }]}>
                Resend in {countdown}s
              </Text>
            )}
          </View>

          <Button
            label={loading ? 'Verifying…' : 'Verify'}
            onPress={handleVerify}
            fullWidth
            disabled={loading || otp.join('').length < 8}
            style={{ marginTop: spacing.xxl }}
          />

          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.crimson}
              style={{ marginTop: spacing.md }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    padding: spacing.lg,
  },
  backBtn: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(179, 18, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.display,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    width: '100%',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, fontWeight: '600', textAlign: 'center' },
  otpRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    width: '100%',
  },
  otpInput: {
    width: 36,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    textAlign: 'center',
    ...typography.h2,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  resendText: {
    ...typography.body,
  },
  resendAction: {
    ...typography.bodyStrong,
  },
});
