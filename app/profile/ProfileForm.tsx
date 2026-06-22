import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useProfile } from '@/lib/hooks/useProfile';
import type { BloodType } from '@/types';

const bloodTypes: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

type Mode = 'complete' | 'edit';

function isValidDate(year: number, monthIndex: number, day: number) {
  const date = new Date(Date.UTC(year, monthIndex, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day;
}

export default function ProfileForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const { profile, updateProfile } = useProfile();

  const isCompletingProfile = mode === 'complete';

  const [bloodType, setBloodType] = useState<BloodType | null>(profile?.bloodType ?? null);
  const [weight, setWeight] = useState(profile?.weightKg ? `${profile.weightKg}` : '');
  const [touched, setTouched] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    profile?.birthdate ? new Date(profile.birthdate).getFullYear() : currentYear - 18
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    profile?.birthdate ? new Date(profile.birthdate).getMonth() : 0
  );
  const [selectedDay, setSelectedDay] = useState<number>(
    profile?.birthdate ? new Date(profile.birthdate).getDate() : 1
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setBloodType(profile.bloodType ?? null);
    setWeight(profile.weightKg ? `${profile.weightKg}` : '');
    if (profile.birthdate) {
      const date = new Date(profile.birthdate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    }
  }, [profile]);

  const birthdateValid = isValidDate(selectedYear, selectedMonth, selectedDay);
  const birthdateDisplay = birthdateValid ? `${months[selectedMonth]} ${selectedDay}, ${selectedYear}` : 'Select date';

  const age = (() => {
    if (!birthdateValid) return 0;
    const birthdate = new Date(Date.UTC(selectedYear, selectedMonth, selectedDay));
    const today = new Date();
    return (
      today.getUTCFullYear() -
      birthdate.getUTCFullYear() -
      (today < new Date(Date.UTC(today.getUTCFullYear(), birthdate.getUTCMonth(), birthdate.getUTCDate())) ? 1 : 0)
    );
  })();

  const validationErrors = [
    ...(bloodType ? [] : ['Please select your blood type.']),
    ...(birthdateValid ? [] : ['Please select your birthdate.']),
    ...((weight.trim() && !Number.isNaN(parseFloat(weight)) && parseFloat(weight) >= 50) ? [] : ['Minimum weight required for blood donation is 50kg.']),
    ...(birthdateValid && age < 18 ? ['You must be at least 18 years old to donate blood.'] : []),
    ...(birthdateValid && age > 65 ? ['Maximum age for blood donation is 65 years old.'] : []),
  ];

  const isFormValid = validationErrors.length === 0;

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <ScreenHeader title={isCompletingProfile ? 'Complete Profile' : 'Edit Profile'} subtitle="" />
        <View style={styles.loadingWrap}>
          <Text style={[typography.body, { color: theme.inkMuted }]}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    setTouched(true);
    setSaveError(null);

    if (!isFormValid) {
      showToast({ type: 'error', title: 'Validation errors', message: validationErrors.join('\n') });
      return;
    }

    const formattedBirthdate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const { error } = await updateProfile({
      blood_type: bloodType as any,
      birthdate: formattedBirthdate,
      weight_kg: weight ? parseFloat(weight) : null,
      profile_complete: true,
    });

    if (error) {
      setSaveError(error);
      showToast({ type: 'error', title: 'Save failed', message: error });
      return;
    }

    showToast({
      type: 'success',
      title: isCompletingProfile ? 'Profile completed!' : 'Profile saved!',
      message: isCompletingProfile ? 'Your profile is now complete.' : 'Your changes have been updated.',
    });

    if (isCompletingProfile) {
      router.replace('/(tabs)' as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader
        title={isCompletingProfile ? 'Complete Profile' : 'Edit Profile'}
        subtitle={isCompletingProfile ? 'Your personal details' : 'Update the details you can change'}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.nameRow}>
            <View style={[styles.field, styles.firstNameField]}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>First Name</Text>
              <TextInput
                value={profile.firstName}
                editable={false}
                style={[styles.input, { borderColor: theme.border, color: theme.inkMuted, backgroundColor: theme.paper }]}
              />
            </View>
            <View style={[styles.field, styles.middleField]}>
              <Text style={[styles.label, { color: theme.inkMuted }]}>M.I.</Text>
              <TextInput
                value={profile.middleName ?? ''}
                editable={false}
                placeholder="M.I."
                placeholderTextColor={theme.inkFaint}
                style={[styles.input, styles.centerText, { borderColor: theme.border, color: theme.inkMuted, backgroundColor: theme.paper }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Last Name</Text>
            <TextInput
              value={profile.lastName}
              editable={false}
              style={[styles.input, { borderColor: theme.border, color: theme.inkMuted, backgroundColor: theme.paper }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Email</Text>
            <TextInput
              value={profile.email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { borderColor: theme.border, color: theme.inkMuted, backgroundColor: theme.paper }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Blood Type</Text>
            <View style={styles.chipRow}>
              {bloodTypes.map((bt) => {
                const selected = bloodType === bt;
                return (
                  <Pressable
                    key={bt}
                    onPress={() => setBloodType(bt)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.chip,
                      { borderColor: theme.border, backgroundColor: theme.paper },
                      selected && { backgroundColor: theme.crimson, borderColor: theme.crimson },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: theme.ink }, selected && { color: theme.surface }]}>{bt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Birthdate</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={[styles.dateButton, { backgroundColor: theme.paper, borderColor: theme.border }]}>
              <Calendar size={18} color={theme.crimson} />
              <Text style={[styles.dateText, { color: theme.ink }]}>{birthdateDisplay}</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.inkMuted }]}>Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              editable
              keyboardType="numeric"
              inputMode="decimal"
              placeholder="e.g. 65"
              placeholderTextColor={theme.inkFaint}
              style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
            />
          </View>
        </Card>

        <Button
          label={isCompletingProfile ? 'Complete Profile' : 'Save Changes'}
          disabled={!isFormValid}
          onPress={handleSave}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        {touched && saveError && (
          <Card style={{ backgroundColor: theme.crimsonLight, borderColor: theme.crimson, padding: spacing.sm, marginTop: spacing.md }}>
            <Text style={{ color: theme.crimson, ...typography.caption }}>{saveError}</Text>
          </Card>
        )}
      </ScrollView>

      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.ink }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.doneText, { color: theme.crimson }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerCols}>
              <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                {months.map((m, i) => (
                  <Pressable
                    key={m}
                    style={[styles.pickerItem, selectedMonth === i && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                    onPress={() => setSelectedMonth(i)}
                  >
                    <Text style={[styles.pickerText, { color: theme.ink }, selectedMonth === i && { color: theme.crimson, fontWeight: '700' }]}>{m}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.pickerItem, selectedDay === d && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[styles.pickerText, { color: theme.ink }, selectedDay === d && { color: theme.crimson, fontWeight: '700' }]}>{d}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <Pressable
                    key={y}
                    style={[styles.pickerItem, selectedYear === y && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.08)' }]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[styles.pickerText, { color: theme.ink }, selectedYear === y && { color: theme.crimson, fontWeight: '700' }]}>{y}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { gap: spacing.lg, width: '100%' },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  firstNameField: { flex: 2 },
  middleField: { flex: 1 },
  centerText: { textAlign: 'center' },
  field: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '600', marginLeft: 4 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    width: '100%',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, width: '100%' },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  chipText: { ...typography.bodyStrong },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    width: '100%',
  },
  dateText: { ...typography.body },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: { ...typography.h1 },
  doneText: { ...typography.bodyStrong, fontSize: 16 },
  pickerCols: {
    flexDirection: 'row',
    height: 200,
    gap: spacing.sm,
  },
  pickerCol: { flex: 1 },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  pickerText: {
    ...typography.body,
    fontSize: 16,
  },
});
