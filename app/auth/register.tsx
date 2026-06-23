import { useRouter } from 'expo-router';
import { Mail, Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff, UserX } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// ── Password strength rules ────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',           test: (p: string) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a–z)',       test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0–9)',                 test: (p: string) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#$…)',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrengthLabel(passed: number): string {
  if (passed <= 1) return 'Weak';
  if (passed === 2) return 'Fair';
  if (passed === 3) return 'Good';
  if (passed === 4) return 'Strong';
  return 'Very Strong';
}

// ── Name validation ────────────────────────────────────────────────
const NAME_REGEX   = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ' -]+$/;
const MI_REGEX     = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ]?$/;

// ── Email validation ───────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router    = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    firstName:       '',
    middleName:      '',
    lastName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  const [loading,          setLoading]          = useState(false);
  const [errorMsg,         setErrorMsg]         = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [showPassword,     setShowPassword]     = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [passwordTouched,  setPasswordTouched]  = useState(false);

  // ── Derived password strength ──────────────────────────────────
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(form.password) })),
    [form.password]
  );
  const passedCount  = ruleResults.filter((r) => r.passed).length;
  const strength     = getStrengthLabel(passedCount);
  const passwordValid = passedCount === PASSWORD_RULES.length;
  const validationGreen = isDarkMode ? '#22C55E' : '#15803D';
  const validationGreenStrong = isDarkMode ? '#16A34A' : '#166534';

  const fullName = [form.firstName.trim(), form.middleName.trim(), form.lastName.trim()]
    .filter(Boolean)
    .join(' ');

  const handleRegister = async () => {
    setErrorMsg(null);
    setIsDuplicateEmail(false);

    // ── Field validations ──────────────────────────────────────
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrorMsg('First and last name are required.');
      return;
    }
    if (!NAME_REGEX.test(form.firstName.trim())) {
      setErrorMsg('First name may only contain letters.');
      return;
    }
    if (!NAME_REGEX.test(form.lastName.trim())) {
      setErrorMsg('Last name may only contain letters.');
      return;
    }
    if (form.middleName.trim() && !MI_REGEX.test(form.middleName.trim())) {
      setErrorMsg('Middle initial must be a single letter.');
      return;
    }
    if (!form.email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@email.com).');
      return;
    }
    if (!passwordValid) {
      setPasswordTouched(true);
      setErrorMsg('Password does not meet all the requirements below.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      form.email.trim().toLowerCase(),
      form.password,
      fullName
    );
    setLoading(false);

    if (error === 'EMAIL_ALREADY_REGISTERED') {
      setIsDuplicateEmail(true);
      return;
    }
    if (error) {
      setErrorMsg(error);
      return;
    }

    showToast({ type: 'success', title: 'Account Created', message: 'A verification code has been sent to your email.' });

    // Success → go to OTP verification
    router.push('/auth/otp?email=' + encodeURIComponent(form.email.trim().toLowerCase()) + '&type=signup');
  };

  const update = (field: keyof typeof form) => (value: string) => {
    setErrorMsg(null);
    setIsDuplicateEmail(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Duplicate email special card ───────────────────────────────
  if (isDuplicateEmail) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.ink }]}>Already Registered</Text>
              <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
                An account with this email already exists.
              </Text>
            </View>

            <View style={[styles.duplicateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.dupIconWrap, { backgroundColor: theme.crimsonLight }]}>
                <UserX size={32} color={theme.crimson} />
              </View>
              <Text style={[styles.dupTitle, { color: theme.ink }]}>
                This email is taken
              </Text>
              <Text style={[styles.dupEmail, { color: theme.crimson }]}>
                {form.email.trim().toLowerCase()}
              </Text>
              <Text style={[styles.dupBody, { color: theme.inkMuted }]}>
                An account is already associated with this email address. You can log in with your
                existing account, or use a different email to register.
              </Text>

              <Button
                label="Log In to Existing Account"
                onPress={() => router.replace('/auth/login')}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
              <Button
                label="Use a Different Email"
                variant="outline"
                onPress={() => {
                  setIsDuplicateEmail(false);
                  setForm((prev) => ({ ...prev, email: '', password: '', confirmPassword: '' }));
                }}
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.inkMuted }]}>Forgot your password?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                <Text style={[styles.registerText, { color: theme.crimson }]}>Reset it here</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.ink }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
              Join the community of lifesavers today.
            </Text>
          </View>

          <View style={styles.form}>
            {/* ── Error banner ── */}
            {errorMsg && (
              <View style={[styles.errorBanner, { backgroundColor: theme.crimsonLight }]}>
                <AlertCircle size={16} color={theme.crimson} />
                <Text style={[styles.errorText, { color: theme.crimson }]}>{errorMsg}</Text>
              </View>
            )}

            {/* ── Name row ── */}
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>First Name <Text style={{ color: theme.crimson }}>*</Text></Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.ink }]}
                    placeholder="Juan"
                    placeholderTextColor={theme.inkFaint}
                    value={form.firstName}
                    onChangeText={(v) => update('firstName')(v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ' -]/g, ''))}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { width: 90 }]}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>M.I.</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.ink, textAlign: 'center' }]}
                    placeholder="G"
                    placeholderTextColor={theme.inkFaint}
                    value={form.middleName}
                    onChangeText={(v) => {
                      const cleaned = v.replace(/[^A-Za-z]/g, '').slice(0, 1);
                      update('middleName')(cleaned);
                    }}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Last Name <Text style={{ color: theme.crimson }}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="Dela Cruz"
                    placeholderTextColor={theme.inkFaint}
                    value={form.lastName}
                    onChangeText={(v) => update('lastName')(v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ' -]/g, ''))}
                    autoCapitalize="words"
                />
              </View>
            </View>

            {/* ── Email ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Email Address <Text style={{ color: theme.crimson }}>*</Text></Text>
              <View style={[
                styles.inputWrapper,
                { backgroundColor: theme.surface, borderColor: theme.border },
                form.email && !EMAIL_REGEX.test(form.email) && { borderColor: theme.crimson },
              ]}>
                <Mail size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="name@email.com"
                  placeholderTextColor={theme.inkFaint}
                  value={form.email}
                  onChangeText={update('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {form.email.length > 0 && EMAIL_REGEX.test(form.email) && (
                  <CheckCircle2 size={18} color={validationGreen} />
                )}
              </View>
              {form.email.length > 4 && !EMAIL_REGEX.test(form.email) && (
                <Text style={[styles.fieldHint, { color: theme.crimson }]}>
                  Enter a valid email address (e.g. name@email.com)
                </Text>
              )}
            </View>

            {/* ── Password ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Password <Text style={{ color: theme.crimson }}>*</Text></Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Lock size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="Create a strong password"
                  placeholderTextColor={theme.inkFaint}
                  value={form.password}
                  onChangeText={(v) => { update('password')(v); setPasswordTouched(true); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword
                    ? <EyeOff size={18} color={theme.inkFaint} />
                    : <Eye size={18} color={theme.inkFaint} />
                  }
                </TouchableOpacity>
              </View>

              {/* Strength meter */}
              {passwordTouched && form.password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthTopRow}>
                    <View style={styles.strengthBar}>
                      {PASSWORD_RULES.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthSegment,
                            { backgroundColor: i < passedCount ? validationGreenStrong : theme.border },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.strengthLabel,
                        { color: passedCount > 0 ? validationGreenStrong : theme.inkMuted },
                      ]}
                    >
                      {strength}
                    </Text>
                  </View>
                </View>
              )}

              {/* Rule checklist */}
              {passwordTouched && form.password.length > 0 && (
                <View style={styles.rulesList}>
                  {ruleResults.map((r) => (
                    <View key={r.id} style={styles.ruleRow}>
                      <CheckCircle2
                        size={13}
                        color={r.passed ? validationGreen : theme.inkFaint}
                      />
                      <Text style={[styles.ruleText, { color: r.passed ? validationGreen : theme.inkFaint }]}>
                        {r.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── Confirm Password ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Confirm Password <Text style={{ color: theme.crimson }}>*</Text></Text>
              <View style={[
                styles.inputWrapper,
                { backgroundColor: theme.surface, borderColor: theme.border },
                form.confirmPassword.length > 0 && form.password !== form.confirmPassword && { borderColor: theme.crimson },
                form.confirmPassword.length > 0 && form.password === form.confirmPassword && { borderColor: validationGreenStrong },
              ]}>
                <Lock size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={theme.inkFaint}
                  value={form.confirmPassword}
                  onChangeText={update('confirmPassword')}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showConfirm
                    ? <EyeOff size={18} color={theme.inkFaint} />
                    : <Eye size={18} color={theme.inkFaint} />
                  }
                </TouchableOpacity>
              </View>
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <Text style={[styles.fieldHint, { color: theme.crimson }]}>Passwords do not match.</Text>
              )}
              {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                <Text style={[styles.fieldHint, { color: validationGreenStrong }]}>✓ Passwords match</Text>
              )}
            </View>

            <Button
              label={loading ? 'Creating account…' : 'Register'}
              onPress={handleRegister}
              fullWidth
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            {/* ── Divider ── */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.inkFaint }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <Text style={[styles.oauthNote, { color: theme.inkFaint }]}>
              Social sign-up coming soon.
            </Text>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.inkMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={[styles.registerText, { color: theme.crimson }]}>Log In Now</Text>
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
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  title:  { ...typography.display, fontSize: 32, textAlign: 'center' },
  subtitle: { ...typography.body, marginTop: spacing.xs, textAlign: 'center' },
  form:   { gap: spacing.md, marginTop: spacing.md },

  // Error
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm },
  errorText:   { ...typography.caption, flex: 1, fontWeight: '600' },

  // Inputs
  inputRow:    { flexDirection: 'row', gap: spacing.md },
  inputGroup:  { gap: spacing.xs },
  label:       { ...typography.caption, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  inputIcon:   { marginRight: spacing.sm },
  input:       { flex: 1, ...typography.body, height: '100%', minWidth: 0 },
  fieldHint:   { ...typography.caption, marginLeft: 4, marginTop: 2 },

  // Password strength
  strengthContainer: { gap: spacing.xs, marginTop: spacing.xs },
  strengthTopRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strengthBar:       { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:     {
    ...typography.caption,
    fontWeight: '700',
    minWidth: 84,
    flexShrink: 0,
    textAlign: 'right',
  },
  rulesList:         { gap: 4, marginTop: spacing.xs },
  ruleRow:           { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ruleText:          { ...typography.caption, fontSize: 11 },

  // Duplicate account card
  duplicateCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dupIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dupTitle:  { ...typography.h1, textAlign: 'center' },
  dupEmail:  { ...typography.bodyStrong, textAlign: 'center', marginVertical: 2 },
  dupBody:   { ...typography.body, textAlign: 'center', lineHeight: 20 },

  // Footer
  dividerRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
  divider:      { flex: 1, height: 1 },
  dividerText:  { ...typography.caption, fontWeight: '700' },
  oauthNote:    { ...typography.caption, textAlign: 'center', marginTop: -spacing.sm },
  footer:       { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.md },
  footerText:   { ...typography.body },
  registerText: { ...typography.bodyStrong },
});
