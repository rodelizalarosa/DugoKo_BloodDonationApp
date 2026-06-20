import { useRouter } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');

  const handleSendOtp = () => {
    // Mock OTP trigger
    router.push('/auth/otp');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Mail size={48} color={theme.crimson} />
        </View>
        
        <Text style={[styles.title, { color: theme.ink }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
          Enter your email address and we'll send you an OTP to reset your password.
        </Text>

        <View style={styles.form}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.ink }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.inkFaint}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <Button 
            label="Send OTP" 
            onPress={handleSendOtp} 
            fullWidth 
          />
        </View>
      </View>
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
    marginBottom: spacing.xxl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
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
