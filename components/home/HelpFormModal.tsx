import React, { useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, CheckCircle2, ShieldCheck, Contact, Mail, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography } from '@/constants/theme';
import { User, BloodRequest } from '@/types';
import { Card } from '@/components/ui/Card';

interface HelpFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { helper_name: string; helper_contact: string; helper_email: string }) => Promise<void>;
  request: BloodRequest;
  user: User;
}

export function HelpFormModal({ visible, onClose, onSubmit, request, user }: HelpFormModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [agreed, setAgreed] = useState(false);
  
  // Data pre-filled from user profile
  const [formData, setFormData] = useState({
    helper_name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
    helper_contact: user.phone || '',
    helper_email: user.email || '',
  });

  const handlePressSubmit = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStep(1); // Reset step for next opening
      setAgreed(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={20} style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Card style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.ink }]}>I Can Help</Text>
                <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
                  Responding to {request.hospital}
                </Text>
              </View>
              <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.paper }]}>
                <X size={20} color={theme.ink} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {step === 1 ? (
                <View style={{ gap: spacing.lg }}>
                  <View style={[styles.agreementRow, { backgroundColor: theme.paper, borderWidth: 1, borderColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.agreementTitle, { color: theme.ink }]}>Step 1: Eligibility Checker</Text>
                      <Text style={[styles.agreementDesc, { color: theme.inkMuted, fontSize: 13, lineHeight: 20 }]}>
                        • You must be at least 18 years old{"\n"}
                        • Weight must be at least 50kg{"\n"}
                        • No health symptoms (cough/fever) in 24h{"\n"}
                        • You will follow Red Cross screening on-site.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.agreementRow, { backgroundColor: theme.crimsonLight }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.agreementTitle, { color: theme.crimson }]}>I am eligible to donate</Text>
                      <Text style={[styles.agreementDesc, { color: theme.crimson }]}>
                        Tap to confirm you meet medical requirements.
                      </Text>
                    </View>
                    <Switch 
                      value={agreed} 
                      onValueChange={setAgreed}
                      trackColor={{ false: theme.border, true: theme.crimson }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              ) : (
                <View style={{ gap: spacing.lg }}>
                  <View style={styles.formSection}>
                    <Text style={[styles.label, { color: theme.ink }]}>Full Name</Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.paper, borderColor: theme.border }]}>
                      <UserIcon size={18} color={theme.crimson} style={styles.icon} />
                      <TextInput 
                        style={[styles.input, { color: theme.ink }]}
                        value={formData.helper_name}
                        onChangeText={(t) => setFormData(p => ({ ...p, helper_name: t }))}
                        placeholder="Full Name"
                        placeholderTextColor={theme.inkMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.label, { color: theme.ink }]}>Contact Number</Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.paper, borderColor: theme.border }]}>
                      <Contact size={18} color={theme.crimson} style={styles.icon} />
                      <TextInput 
                        style={[styles.input, { color: theme.ink }]}
                        value={formData.helper_contact}
                        onChangeText={(t) => setFormData(p => ({ ...p, helper_contact: t }))}
                        keyboardType="phone-pad"
                        placeholder="09XX XXX XXXX"
                        placeholderTextColor={theme.inkMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.label, { color: theme.ink }]}>Email Address</Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.paper, borderColor: theme.border }]}>
                      <Mail size={18} color={theme.crimson} style={styles.icon} />
                      <TextInput 
                        style={[styles.input, { color: theme.ink }]}
                        value={formData.helper_email}
                        onChangeText={(t) => setFormData(p => ({ ...p, helper_email: t }))}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="email@example.com"
                        placeholderTextColor={theme.inkMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.securityNote}>
                    <ShieldCheck size={14} color={theme.inkMuted} />
                    <Text style={[styles.securityText, { color: theme.inkMuted }]}>
                      Only your name and phone number will be shared with the requester.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              {step === 1 ? (
                <Pressable 
                  onPress={() => setStep(2)} 
                  disabled={!agreed}
                  style={[
                    styles.submitBtn, 
                    { backgroundColor: agreed ? theme.crimson : theme.border }
                  ]}
                >
                  <Text style={styles.submitText}>Continue to Form</Text>
                </Pressable>
              ) : (
                <View style={{ gap: spacing.sm }}>
                  <Pressable 
                    onPress={handlePressSubmit} 
                    disabled={loading}
                    style={[
                      styles.submitBtn, 
                      { backgroundColor: theme.crimson }
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} color="#FFF" />
                        <Text style={styles.submitText}>Submit Response</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable onPress={() => setStep(1)} style={{ alignSelf: 'center', paddingVertical: 4 }}>
                    <Text style={{ color: theme.inkMuted, fontSize: 13 }}>Back to Eligibility</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Card>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
  },
  modal: {
    flex: 1,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  formSection: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  agreementTitle: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  agreementDesc: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  securityText: {
    ...typography.caption,
    fontSize: 11,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  submitBtn: {
    height: 54,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitText: {
    color: '#FFF',
    ...typography.bodyStrong,
  },
});
