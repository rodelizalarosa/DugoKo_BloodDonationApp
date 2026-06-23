/**
 * app/auth/otp.tsx
 * 8-digit OTP verification screen.
 *
 * Params (from router.push):
 *   email - the email address to verify
 *   type  - 'signup' | 'email'
 *     signup -> verifies new account email, then goes to /(tabs)
 *     email  -> verifies forgot-password OTP, then goes to reset-password
 *
 * DO NOT CHANGE THE UI LAYOUT OR STYLES.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { OtpType } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const OTP_LENGTH = 8;
const RESEND_COUNTDOWN_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { verifyOtp, sendPasswordResetOtp } = useAuth();
  const { showToast } = useToast();

  const params = useLocalSearchParams<{ email?: string; type?: string }>();
  const email = params.email ?? '';
  const type = (params.type ?? 'signup') as OtpType;
  const isSignupVerification = type === 'signup';

  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    startCountdown();
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const nextOtp = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? '');
      setOtp(nextOtp);
      const nextEmpty = digits.length < OTP_LENGTH ? digits.length : OTP_LENGTH - 1;
      inputs.current[nextEmpty]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = text;
    setOtp(nextOtp);

    if (text.length > 0 && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setErrorMsg(null);
    const token = otp.join('');

    if (token.length < OTP_LENGTH) {
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
      setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
      inputs.current[0]?.focus();
      return;
    }

    if (type === 'email' || type === 'recovery') {
      showToast({ type: 'success', title: 'Identity Verified', message: 'You can now set a new password.' });
      router.replace('/auth/reset-password');
    } else {
      showToast({ type: 'success', title: 'Email Confirmed!', message: 'Your account is ready. Please log in to continue.' });
      router.replace('/auth/login');
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    setErrorMsg(null);
    setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
    inputs.current[0]?.focus();

    let error: string | null = null;
    if (type === 'recovery') {
      const res = await sendPasswordResetOtp(email);
      error = res.error;
    } else {
      const { supabase } = require('@/lib/supabase');
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
      error = resendError?.message ?? null;
    }

    if (error) {
      setErrorMsg(error);
      return;
    }

    showToast({ type: 'success', title: 'Code Resent', message: 'A new verification code has been sent.' });
    startCountdown();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <ShieldCheck size={48} color={theme.crimson} />
          </View>

          <Text style={[styles.title, { color: theme.ink }]}>Verification</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Enter the 8-digit code sent to{'\n'}
            <Text style={{ color: theme.crimson, fontWeight: '700' }}>{email || 'your email'}</Text>
            {isSignupVerification ? '\nso we can finish verifying your account.' : ''}
          </Text>

          {errorMsg && (
            <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
              <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
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
                maxLength={OTP_LENGTH}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.resendText, { color: theme.inkMuted }]}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendAction, { color: theme.crimson }]}>
                  {isSignupVerification ? 'Resend Signup Code' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resendAction, { color: theme.inkFaint }]}>Resend in {countdown}s</Text>
            )}
          </View>

          <Button
            label={loading ? 'Verifying...' : 'Verify'}
            onPress={handleVerify}
            fullWidth
            disabled={loading || otp.join('').length < OTP_LENGTH}
            style={{ marginTop: spacing.xxl }}
          />

          {loading && <ActivityIndicator size="small" color={theme.crimson} style={{ marginTop: spacing.md }} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: spacing.lg },
  backBtn: { padding: spacing.xs },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...typography.display, fontSize: 28 },
  subtitle: { ...typography.body, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm },
  errorText: { ...typography.caption, flex: 1, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  otpInput: {
    width: 46,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    textAlign: 'center',
    ...typography.h2,
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  resendText: { ...typography.caption },
  resendAction: { ...typography.caption, fontWeight: '700' },
});
