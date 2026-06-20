import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function OtpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length > 0 && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    router.push('/auth/reset-password');
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
            Enter the 6-digit code sent to your email.
          </Text>

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
                    color: theme.ink 
                  }
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.resendText, { color: theme.inkMuted }]}>Didn't receive the code?</Text>
            <TouchableOpacity>
              <Text style={[styles.resendAction, { color: theme.crimson }]}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          <Button 
            label="Verify" 
            onPress={handleVerify} 
            fullWidth 
            style={{ marginTop: spacing.xxl }}
          />
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
    marginBottom: spacing.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    ...typography.h2,
    fontSize: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  resendText: {
    ...typography.body,
  },
  resendAction: {
    ...typography.bodyStrong,
  },
});
