/**
 * app/auth/forgot-password.tsx
 * ─────────────────────────────────────────────────────────────────
 * Forgot Password screen.
 *
 * Flow:
 *   1. User enters their email.
 *   2. We call sendPasswordResetOtp(email) which uses supabase.auth.signInWithOtp
 *      routed through the project's custom SMTP (no rate limit issues).
 *   3. On success → navigate to OTP screen with type='recovery'.
 *   4. After OTP verified → reset-password screen.
 *
 * DO NOT CHANGE THE UI LAYOUT OR STYLES.
 */

import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordScreen() {
  const router                      = useRouter();
  const { theme }                   = useTheme();
  const { sendPasswordResetOtp }    = useAuth();
  const { showToast }               = useToast();

  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSend = async () => {
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error } = await sendPasswordResetOtp(email.trim().toLowerCase());
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      showToast({ type: 'success', title: 'OTP Sent', message: 'A 6-digit code has been sent to your email.' });
      // Navigate to OTP screen with recovery type
      router.push({
        pathname: '/auth/otp',
        // type='email' matches the OTP sent by signInWithOtp.
        // After verifyOtp('email'), Supabase creates a full session → updateUser(password) works.
        params: { email: email.trim().toLowerCase(), type: 'email' },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(179,18,42,0.1)' }]}>
          <Mail size={48} color={theme.crimson} />
        </View>

        <Text style={[styles.title, { color: theme.ink }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
          Enter your registered email and we'll send a 6-digit code to reset your password.
        </Text>

        <View style={styles.form}>
          {errorMsg && (
            <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
              <AlertCircle size={16} color={theme.crimson} />
              <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
            </View>
          )}

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Mail size={18} color={theme.inkFaint} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={[styles.input, { color: theme.ink }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.inkFaint}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <Button
            label={loading ? 'Sending…' : 'Send OTP Code'}
            onPress={handleSend}
            fullWidth
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { padding: spacing.lg },
  backBtn: { padding: spacing.xs },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center', paddingTop: spacing.xxl },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title:   { ...typography.display, fontSize: 28 },
  subtitle: { ...typography.body, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  form:    { width: '100%', gap: spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm },
  errorText:   { ...typography.caption, flex: 1, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, width: '100%' },
  input: { flex: 1, ...typography.body, height: '100%' },
});
