import { useRouter } from 'expo-router';
import { Mail, Lock, User, UserCircle } from 'lucide-react-native';
import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    // Mock register success
    router.replace('/(tabs)');
  };

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
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>First Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.ink }]}
                    placeholder="Juan"
                    placeholderTextColor={theme.inkFaint}
                    value={form.firstName}
                    onChangeText={(t) => setForm({...form, firstName: t})}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { width: '30%' }]}>
                <Text style={[styles.label, { color: theme.inkMuted }]}>M.I.</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.ink, textAlign: 'center' }]}
                    placeholder="G"
                    placeholderTextColor={theme.inkFaint}
                    value={form.middleName}
                    onChangeText={(t) => setForm({...form, middleName: t})}
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Last Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="Dela Cruz"
                  placeholderTextColor={theme.inkFaint}
                  value={form.lastName}
                  onChangeText={(t) => setForm({...form, lastName: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Mail size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="name@email.com"
                  placeholderTextColor={theme.inkFaint}
                  value={form.email}
                  onChangeText={(t) => setForm({...form, email: t})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Lock size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.inkFaint}
                  value={form.password}
                  onChangeText={(t) => setForm({...form, password: t})}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Lock size={18} color={theme.inkFaint} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.ink }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.inkFaint}
                  value={form.confirmPassword}
                  onChangeText={(t) => setForm({...form, confirmPassword: t})}
                  secureTextEntry
                />
              </View>
            </View>

            <Button 
                label="Register" 
                onPress={handleRegister} 
                fullWidth 
                style={{ marginTop: spacing.md }}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.inkFaint }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

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
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.display,
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    height: '100%',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.caption,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.body,
  },
  registerText: {
    ...typography.bodyStrong,
  },
});
