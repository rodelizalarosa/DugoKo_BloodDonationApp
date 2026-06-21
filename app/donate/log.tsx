import { useRouter } from 'expo-router';
import { CalendarDays, UploadCloud, X, FileImage, ShieldCheck } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
        {label} {required && <Text style={{ color: theme.crimson }}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inkFaint}
        keyboardType={keyboardType}
        style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
      />
    </View>
  );
}

export default function LogDonationScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToast();
  
  // Basic Fields
  const [date, setDate] = useState<Date | null>(null);
  const [venue, setVenue] = useState('');

  // Date picker (custom month/day/year modal to match Edit Profile)
  const months = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    []
  );

  const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);

  const parsedDonationDate = date ?? new Date();
  const [showDonationDatePicker, setShowDonationDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(parsedDonationDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(parsedDonationDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(parsedDonationDate.getDate());

  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear();
  const minYear = maxYear - 120;

  const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i), [maxYear, minYear]);
  const daysInSelectedMonth = useMemo(() => {
    // JS month: 0-11
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const days = useMemo(() => Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1), [daysInSelectedMonth]);

  const canChooseYear = (y: number) => y <= maxYear;

  const displayDonationDate = `${months[selectedMonth]} ${selectedDay}, ${selectedYear}`;

  const openDonationDatePicker = () => {
    const base = date ?? new Date();
    setSelectedYear(base.getFullYear());
    setSelectedMonth(base.getMonth());
    setSelectedDay(base.getDate());
    setShowDonationDatePicker(true);
  };

  const confirmDonationDate = () => {
    const next = new Date(selectedYear, selectedMonth, selectedDay);

    // Prevent future dates
    if (next.getTime() > today.getTime()) return;

    setDate(next);
    setShowDonationDatePicker(false);
  };

  const [branch, setBranch] = useState('');
  
  // Vitals
  const [bp, setBp] = useState('');
  const [hemoglobin, setHemoglobin] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');

  // Red Cross Verification Fields
  const [donorId, setDonorId] = useState('');
  const [bagRef, setBagRef] = useState('');
  
  // Upload Card Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const requiredFilled = !!date && venue.trim() && branch.trim();

  const handleSimulateUpload = () => {
    if (uploadedFile || isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    setTimeout(() => setUploadProgress(30), 300);
    setTimeout(() => setUploadProgress(65), 700);
    setTimeout(() => setUploadProgress(90), 1100);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setUploadedFile('PRC_DonorCard_Capture.jpg');
    }, 1400);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  function handleSave() {
    const isVerified = !!(donorId.trim() && bagRef.trim() && uploadedFile);

    showToast({
      type: 'success',
      title: 'Donation logged!',
      message: isVerified
        ? 'Verified record saved. Generating your receipt…'
        : 'Self-log saved. Pending PRC verification.',
    });

    // Pass log variables to receipt screen as search parameters
    router.replace({
      pathname: '/donate/receipt',
      params: {
        date: date ? formatIsoDate(date) : '',
        venue,
        branch,
        bloodBagRef: bagRef,
        bp,
        hemoglobin,
        pulse,
        notes,
        isVerified: isVerified ? 'true' : 'false',
        donorId: donorId.trim(),
      },
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Log Donation" subtitle="Record a donation you already completed" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Card style={[styles.noticeCard, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
            <Text style={[styles.noticeText, { color: theme.teal }]}>
              ⓘ This logs a completed blood donation. To verify and receive an instant digital receipt, complete the Red Cross verification card below.
            </Text>
          </Card>

  {/* Section 1: Required Details */}
          <Text style={[styles.sectionLabel, { color: theme.ink }]}>Required Details</Text>
          <Card style={{ gap: spacing.md }}>

            {/* Date Picker Row */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
                Donation Date <Text style={{ color: theme.crimson }}>*</Text>
              </Text>
              <Pressable
                onPress={openDonationDatePicker}
                style={[styles.datePickerRow, { borderColor: date ? theme.crimson : theme.border, backgroundColor: theme.paper }]}
              >
                <CalendarDays size={16} color={date ? theme.crimson : theme.inkFaint} />
                <Text style={[styles.datePickerText, { color: date ? theme.ink : theme.inkFaint }]}>
                  {date ? displayDonationDate : 'Select donation date…'}
                </Text>
              </Pressable>
            </View>

            <Field label="Venue" value={venue} onChangeText={setVenue} placeholder="e.g. SM City Cebu" required />
            <Field label="Red Cross Branch" value={branch} onChangeText={setBranch} placeholder="e.g. PRC Cebu" required />
          </Card>


          {/* Section 2: Red Cross Verification */}
          <Text style={[styles.sectionLabel, { color: theme.ink }]}>Red Cross Verification Card</Text>
          <Card style={[styles.verifyCard, { borderColor: theme.border }]}>
            <View style={styles.verifyHeader}>
              <ShieldCheck size={18} color={theme.crimson} />
              <Text style={[styles.verifyTitle, { color: theme.ink }]}>PRC Card Credentials</Text>
            </View>
            <Text style={[styles.verifyDesc, { color: theme.inkMuted }]}>
              Provide your physical Philippine Red Cross Donor Card ID and Blood Bag serial ref to instantly verify this log.
            </Text>

            <Field label="Red Cross Donor ID" value={donorId} onChangeText={setDonorId} placeholder="e.g. PRC-12-34567" />
            <Field label="Blood Bag Reference No." value={bagRef} onChangeText={setBagRef} placeholder="e.g. 93020" />
            
            {/* Upload Area */}
            <Text style={[styles.fieldLabel, { color: theme.inkMuted, marginTop: spacing.xs }]}>
              Attach Photo of Donor Card / Receipt
            </Text>
            
            {/* Upload Box Container */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.uploadBox,
                { borderColor: theme.border },
                uploadedFile && { borderColor: theme.teal, borderStyle: 'solid' },
                isUploading && { borderColor: theme.crimson },
              ]}
              onPress={handleSimulateUpload}
            >
              {isUploading && (
                <View style={styles.uploadProgressRow}>
                  <ActivityIndicator size="small" color={theme.crimson} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.uploadText, { color: theme.ink }]}>Uploading card capture...</Text>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.paper }]}>
                      <View style={[styles.progressBarFg, { backgroundColor: theme.crimson, width: `${uploadProgress}%` }]} />
                    </View>
                  </View>
                  <Text style={[styles.progressText, { color: theme.ink }]}>{uploadProgress}%</Text>
                </View>
              )}

              {uploadedFile && !isUploading && (
                <View style={styles.uploadedRow}>
                  <FileImage size={24} color={theme.teal} />
                  <View style={{ flex: 1, paddingLeft: spacing.xs }}>
                    <Text style={[styles.fileName, { color: theme.ink }]} numberOfLines={1}>
                      {uploadedFile}
                    </Text>
                    <Text style={[styles.fileSize, { color: theme.inkFaint }]}>Success · 1.4 MB</Text>
                  </View>
                  <TouchableOpacity onPress={handleRemoveFile} style={styles.removeBtn}>
                    <X size={16} color={theme.inkFaint} />
                  </TouchableOpacity>
                </View>
              )}

              {!uploadedFile && !isUploading && (
                <View style={styles.uploadIdleRow}>
                  <UploadCloud size={24} color={theme.inkFaint} />
                  <Text style={[styles.uploadIdleText, { color: theme.inkMuted }]}>
                    Tap to capture/upload Donor Card photo
                  </Text>
                  <Text style={[styles.uploadIdleSub, { color: theme.inkFaint }]}>
                    JPG, PNG up to 5MB
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>

          {/* Section 3: Optional Vitals */}
          <Text style={[styles.sectionLabel, { color: theme.ink }]}>Optional Vitals</Text>
          <Card style={{ gap: spacing.md }}>
            <Field label="Blood Pressure" value={bp} onChangeText={setBp} placeholder="e.g. 120/80" />
            <Field label="Hemoglobin" value={hemoglobin} onChangeText={setHemoglobin} placeholder="e.g. 13.5 g/dL" keyboardType="numeric" />
            <Field label="Pulse" value={pulse} onChangeText={setPulse} placeholder="e.g. 78 bpm" keyboardType="numeric" />
            <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Anything worth remembering" />
          </Card>

          <Button
            label="Save Donation"
            disabled={!requiredFilled}
            onPress={handleSave}
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
          
          <Text style={[styles.footnote, { color: theme.inkFaint }]}>
            Saving will update your total donations. Verified cards will generate certified digital records immediately. Unverified cards may remain pending review.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Donation Date Picker Modal (custom month/day/year) */}
      <Modal visible={showDonationDatePicker} transparent animationType="slide">
        <Pressable style={styles.pickerOverlay} onPress={() => setShowDonationDatePicker(false)}>
          <Pressable style={[styles.pickerSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDonationDatePicker(false)}>
                <Text style={[styles.pickerAction, { color: theme.inkMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: theme.ink }]}>Select Date</Text>
              <TouchableOpacity onPress={confirmDonationDate}>
                <Text style={[styles.pickerAction, { color: theme.crimson, fontWeight: '700' }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerCols}>
              {/* Month */}
              <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                {months.map((m, i) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.pickerItem,
                      selectedMonth === i && { backgroundColor: theme.crimson + '22' },
                    ]}
                    onPress={() => setSelectedMonth(i)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: theme.ink },
                        selectedMonth === i && { color: theme.crimson, fontWeight: '700' },
                      ]}
                    >
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
                    style={[
                      styles.pickerItem,
                      selectedDay === d && { backgroundColor: theme.crimson + '22' },
                    ]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: theme.ink },
                        selectedDay === d && { color: theme.crimson, fontWeight: '700' },
                      ]}
                    >
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
                    style={[
                      styles.pickerItem,
                      selectedYear === y && { backgroundColor: theme.crimson + '22' },
                      !canChooseYear(y) && { opacity: 0.4 },
                    ]}
                    onPress={() => canChooseYear(y) && setSelectedYear(y)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: theme.ink },
                        selectedYear === y && { color: theme.crimson, fontWeight: '700' },
                      ]}
                    >
                      {y}
                    </Text>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  noticeCard: { borderWidth: 1 },
  noticeText: { ...typography.caption },
  sectionLabel: { ...typography.h2, marginTop: spacing.sm },
  
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },

  // Date picker styles
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  datePickerText: { ...typography.body },

  // Date picker modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: spacing.xxl,
    overflow: 'hidden',
  },

  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  pickerTitle: { ...typography.bodyStrong },
  pickerAction: { ...typography.bodyStrong },
  pickerCols: {
    flexDirection: 'row',
    height: 220,
    gap: spacing.sm,
  },
  pickerCol: { flex: 1 },
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

  
  verifyCard: { gap: spacing.sm },
  verifyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifyTitle: { ...typography.bodyStrong },
  verifyDesc: { ...typography.caption, lineHeight: 16 },

  // Upload area styling
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    padding: spacing.md,
    justifyContent: 'center',
    minHeight: 80,
  },
  uploadIdleRow: { alignItems: 'center', gap: 4 },
  uploadIdleText: { ...typography.caption, fontWeight: '700' },
  uploadIdleSub: { ...typography.caption, fontSize: 10 },
  
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  fileName: { ...typography.caption, fontWeight: '700' },
  fileSize: { ...typography.caption, fontSize: 10 },
  removeBtn: { padding: 4 },
  
  uploadProgressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  uploadText: { ...typography.caption, fontWeight: '700' },
  progressText: { ...typography.caption, fontWeight: '700' },
  progressBarBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressBarFg: { height: '100%' },

  footnote: { ...typography.caption, textAlign: 'center', marginTop: spacing.sm },
});
