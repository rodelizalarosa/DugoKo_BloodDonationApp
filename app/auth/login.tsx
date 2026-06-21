import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginScreen() {
  const router   = useRouter();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      setErrorMsg(error);
    } else {
      showToast({ type: 'success', title: 'Welcome Back!', message: 'You have logged in successfully.' });
    }
    // On success, AuthGate in _layout.tsx auto-navigates to /(tabs)
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.ink }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
              Log in to continue your lifesaving journey.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Error banner */}
            {errorMsg && (
              <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
                <AlertCircle size={16} color={theme.crimson} />
                <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Mail size={20} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="name@email.com"
                  placeholderTextColor={theme.inkFaint}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Lock size={20} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.inkFaint}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={[styles.forgotText, { color: theme.crimson }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              label={loading ? 'Logging in…' : 'Log In'}
              onPress={handleLogin}
              fullWidth
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            {/* ── OAuth section (wired after core backend is complete) ── */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.inkFaint }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            {/* Social login buttons go here after OAuth is wired:
              <SocialButton provider="google"   onPress={signInWithGoogle}   />
              <SocialButton provider="facebook" onPress={signInWithFacebook} />
            */}
            <Text style={[styles.oauthNote, { color: theme.inkFaint }]}>
              Social login coming soon.
            </Text>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.inkMuted }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={[styles.registerText, { color: theme.crimson }]}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: spacing.xxl },
  title:  { ...typography.display, fontSize: 32 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  form: { gap: spacing.lg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  errorText:   { ...typography.caption, flex: 1, fontWeight: '600' },
  inputGroup:  { gap: spacing.xs },
  label:       { ...typography.caption, fontWeight: '600', marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  inputIcon:   { marginRight: spacing.sm },
  input:       { flex: 1, ...typography.body, height: '100%' },
  forgotBtn:   { alignSelf: 'flex-end', marginTop: spacing.xs },
  forgotText:  { ...typography.caption, fontWeight: '700' },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
  divider:     { flex: 1, height: 1 },
  dividerText: { ...typography.caption, fontWeight: '700' },
  oauthNote:   { ...typography.caption, textAlign: 'center', marginTop: -spacing.sm },
  footer:      { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.md },
  footerText:  { ...typography.body },
  registerText: { ...typography.bodyStrong },
});
