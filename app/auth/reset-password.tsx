import { useRouter } from 'expo-router';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = () => {
    setIsSuccess(true);
    setTimeout(() => {
      router.replace('/auth/login');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
        <View style={styles.successContent}>
          <CheckCircle2 size={80} color={theme.success} />
          <Text style={[styles.title, { color: theme.ink, marginTop: spacing.xl }]}>Password Reset</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Your password has been successfully updated. Redirecting to login...
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
        <View style={styles.iconWrapper}>
          <Lock size={48} color={theme.crimson} />
        </View>
        
        <Text style={[styles.title, { color: theme.ink }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
          Create a new strong password for your account.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.ink }]}
                placeholder="••••••••"
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
            label="Reset Password" 
            onPress={handleReset} 
            fullWidth 
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
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
    marginBottom: spacing.xxl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  inputWrapper: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  input: {
    flex: 1,
    ...typography.body,
    height: '100%',
  },
});
