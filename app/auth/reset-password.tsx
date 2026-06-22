import { useRouter } from 'expo-router';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',           test: (p: string) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a–z)',       test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0–9)',                 test: (p: string) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#$…)',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordScreen() {
  const router     = useRouter();
  const { theme, isDarkMode }  = useTheme();
  const { showToast } = useToast();
  const validationGreen = isDarkMode ? '#22C55E' : '#15803D';

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [isSuccess,       setIsSuccess]       = useState(false);
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);

  const handleReset = async () => {
    setErrorMsg(null);
    const passedAll = PASSWORD_RULES.every(r => r.test(password));
    if (!passedAll) {
      setErrorMsg('Password does not meet strength requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    // supabase.auth.updateUser works because Supabase sets the session
    // from the deep-link token before this screen renders.
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      showToast({ type: 'success', title: 'Success', message: 'Your password has been reset successfully.' });
      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2500);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
        <View style={styles.successContent}>
          <CheckCircle2 size={80} color={isDarkMode ? '#22C55E' : '#15803D'} />
          <Text style={[styles.title, { color: theme.ink, marginTop: spacing.xl }]}>
            Password Reset!
          </Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Your password has been updated. Redirecting to login…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(179,18,42,0.1)' }]}>
          <Lock size={48} color={theme.crimson} />
        </View>

        <Text style={[styles.title, { color: theme.ink }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
          Create a strong new password for your account.
        </Text>

        <View style={styles.form}>
          {errorMsg && (
            <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
              <AlertCircle size={16} color={theme.crimson} />
              <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.rulesList}>
            {PASSWORD_RULES.map((r) => {
              const passed = r.test(password);
              return (
                <View key={r.id} style={styles.ruleRow}>
                  <CheckCircle2 size={13} color={passed ? validationGreen : theme.inkFaint} />
                  <Text style={[styles.ruleText, { color: passed ? validationGreen : theme.inkFaint }]}>
                    {r.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.ink }]}
                placeholder="min. 6 characters"
                placeholderTextColor={theme.inkFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Confirm New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.ink }]}
                placeholder="••••••••"
                placeholderTextColor={theme.inkFaint}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <Button
            label={loading ? 'Updating…' : 'Reset Password'}
            onPress={handleReset}
            fullWidth
            disabled={loading}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { padding: spacing.lg },
  backBtn: { padding: spacing.xs },
  content: { padding: spacing.xl, alignItems: 'center' },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title:   { ...typography.display, fontSize: 28 },
  subtitle: { ...typography.body, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  form:    { width: '100%', gap: spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm },
  errorText:   { ...typography.caption, flex: 1, fontWeight: '600' },
  rulesList:   { gap: 4, marginBottom: spacing.xs },
  ruleRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ruleText:    { ...typography.caption, fontSize: 11 },
  inputGroup:  { gap: spacing.xs },
  label:       { ...typography.caption, fontWeight: '600' },
  inputWrapper: { height: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, width: '100%' },
  input: { flex: 1, ...typography.body, height: '100%' },
});
