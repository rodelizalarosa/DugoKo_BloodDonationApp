import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { mockUser } from '@/constants/mockData';
import { BloodType } from '@/types';

const bloodTypes: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

import { useProfile } from '@/lib/hooks/useProfile';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const { profile, updateProfile } = useProfile();

  const user = profile || mockUser;

  const [firstName, setFirstName] = useState(user.firstName);
  const [middleName, setMiddleName] = useState(user.middleName ?? '');
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [bloodType, setBloodType] = useState<BloodType | null>(user.bloodType);
  const [weight, setWeight] = useState(user.weightKg ? `${user.weightKg}` : '');

  // Birthdate picker state
  const parsedDate = user.birthdate ? new Date(user.birthdate) : new Date();
  const [selectedYear, setSelectedYear] = useState(parsedDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(parsedDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(parsedDate.getDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const birthdateDisplay = `${months[selectedMonth]} ${selectedDay}, ${selectedYear}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Edit Profile" subtitle="Your personal details" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ gap: spacing.lg }}>
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={[styles.field, { flex: 2 }]}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
                placeholderTextColor={theme.inkFaint}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>M.I.</Text>
              <TextInput
                value={middleName}
                onChangeText={setMiddleName}
                style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper, textAlign: 'center' }]}
                placeholderTextColor={theme.inkFaint}
                maxLength={20}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
              placeholderTextColor={theme.inkFaint}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
              placeholderTextColor={theme.inkFaint}
            />
          </View>

          {/* Blood Type */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Blood Type</Text>
            <View style={styles.chipRow}>
              {bloodTypes.map((bt) => (
                <Text
                  key={bt}
                  onPress={() => setBloodType(bt)}
                  style={[
                    styles.chip,
                    { color: theme.ink, borderColor: theme.border },
                    bloodType === bt && {
                      backgroundColor: theme.crimson,
                      borderColor: theme.crimson,
                      color: '#FFF',
                    },
                  ]}
                >
                  {bt}
                </Text>
              ))}
            </View>
          </View>

          {/* Birthdate with picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Birthdate</Text>
            <Pressable
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.paper }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={18} color={theme.crimson} />
              <Text style={[styles.dateText, { color: theme.ink }]}>{birthdateDisplay}</Text>
            </Pressable>
          </View>

          {/* Weight */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="e.g. 65"
              placeholderTextColor={theme.inkFaint}
              style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
            />
          </View>
        </Card>

        <Button 
          label="Save Changes" 
          onPress={async () => {
            const formattedBirthdate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const { error } = await updateProfile({
              full_name: `${firstName} ${lastName}`.trim(),
              blood_type: bloodType as any,
              birthdate: formattedBirthdate,
              weight_kg: weight ? parseFloat(weight) : null,
              profile_complete: true,
            });
            if (error) {
              showToast({ type: 'error', title: 'Save failed', message: error });
            } else {
              showToast({ type: 'success', title: 'Profile saved!', message: 'Your changes have been updated.' });
              router.back();
            }
          }} 
          fullWidth 
          style={{ marginTop: spacing.lg }} 
        />

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerContent, { backgroundColor: theme.surface }]}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: theme.ink }]}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.pickerDone, { color: theme.crimson }]}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerCols}>
                {/* Month */}
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                  {months.map((m, i) => (
                    <Pressable
                      key={m}
                      style={[styles.pickerItem, selectedMonth === i && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                      onPress={() => setSelectedMonth(i)}
                    >
                      <Text style={[styles.pickerItemText, { color: theme.ink }, selectedMonth === i && { color: theme.crimson, fontWeight: '700' }]}>
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Day */}
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <Pressable
                      key={d}
                      style={[styles.pickerItem, selectedDay === d && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={[styles.pickerItemText, { color: theme.ink }, selectedDay === d && { color: theme.crimson, fontWeight: '700' }]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Year */}
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <Pressable
                      key={y}
                      style={[styles.pickerItem, selectedYear === y && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                      onPress={() => setSelectedYear(y)}
                    >
                      <Text style={[styles.pickerItemText, { color: theme.ink }, selectedYear === y && { color: theme.crimson, fontWeight: '700' }]}>
                        {y}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '600', marginLeft: 4 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    ...typography.bodyStrong,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateText: {
    ...typography.body,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerTitle: { ...typography.h1 },
  pickerDone: { ...typography.bodyStrong, fontSize: 16 },
  pickerCols: {
    flexDirection: 'row',
    height: 200,
    gap: spacing.sm,
  },
  pickerCol: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  pickerItemText: {
    ...typography.body,
    fontSize: 16,
  },
});
