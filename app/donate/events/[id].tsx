import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import Map from '@/components/ui/Map';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography, radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';
import { useProfile } from '@/lib/hooks/useProfile';
import { useToast } from '@/context/ToastContext';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { events, isLoading: eventsLoading, rsvpEvent, getUserRsvp } = useCentersAndEvents();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const event = events.find((e) => e.id === id);
  const [rsvped, setRsvped] = useState(false);
  const [localSlots, setLocalSlots] = useState(0);

  // Check if user already RSVP'd
  useEffect(() => {
    if (!id) return;
    getUserRsvp(id).then((rsvp) => {
      if (rsvp) setRsvped(true);
    });
  }, [id, getUserRsvp]);

  // Sync localSlots when event loads
  useEffect(() => {
    if (event) setLocalSlots(event.slotsAvailable);
  }, [event?.id, event?.slotsAvailable]);
  
  // Registration Form States
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contact, setContact] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00 AM – 11:00 AM');
  
  // Health Declarations
  const [declHealthy, setDeclHealthy] = useState(false);
  const [declMeds, setDeclMeds] = useState(false);
  const [declConsent, setDeclConsent] = useState(false);

  const [ticketRef, setTicketRef] = useState('');

  if (eventsLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
        <ScreenHeader title="Event Details" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.crimson} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Event" />
        <EmptyState title="Event not found" description="This event may have ended or been removed." />
      </SafeAreaView>
    );
  }

  const timeSlots = [
    '09:00 AM – 11:00 AM',
    '11:00 AM – 01:00 PM',
    '01:00 PM – 03:00 PM',
    '03:00 PM – 04:00 PM',
  ];

  const formValid = contact.trim().length >= 7 && declHealthy && declMeds && declConsent;

  const openDirections = (lat?: number, lng?: number, label?: string) => {
    if (!lat || !lng) return;
    const latLng = `${lat},${lng}`;
    const iosUrl = `maps:0,0?q=${encodeURIComponent(label || '')}@${latLng}`;
    const androidUrl = `geo:0,0?q=${latLng}(${encodeURIComponent(label || '')})`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    const url = Platform.select({
      ios: iosUrl,
      android: androidUrl,
      default: webUrl,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  const handleRegister = async () => {
    if (!event) return;
    setIsSubmitting(true);
    // Persist RSVP to Supabase
    const { error } = await rsvpEvent(event.id, 'going', selectedTimeSlot);
    setIsSubmitting(false);
    if (!error) {
      setIsSuccess(true);
      setTicketRef(`TCK-${Math.floor(100000 + Math.random() * 900000)}`);
      setLocalSlots((prev) => Math.max(0, prev - 1));
      showToast({
        type: 'success',
        title: 'Slot confirmed!',
        message: `You're registered for ${event.title}.`,
      });
    } else {
      showToast({ type: 'error', title: 'RSVP failed', message: error });
    }
  };

  const closeSuccess = () => {
    setShowRegModal(false);
    setRsvped(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Event Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.ink }]}>{event.title}</Text>
        <Text style={[styles.organizer, { color: theme.inkMuted }]}>Organized by {event.organizer}</Text>

        <Card style={styles.infoCard}>
          <InfoRow icon={CalendarDays} label={new Date(event.date).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
          <InfoRow icon={Clock} label={`${event.timeStart} – ${event.timeEnd}`} />
          <InfoRow icon={MapPin} label={`${event.venue}, ${event.address}`} />
          <InfoRow icon={Users} label={`${localSlots} slots available`} />
        </Card>

        {/* Map Preview (react-native-maps) */}
        <Card style={[styles.mapCard, { backgroundColor: isDarkMode ? '#1E1212' : '#F6EFEA', borderColor: theme.border, overflow: 'hidden' }]}>
          <Text style={[styles.mapLabel, { color: theme.inkFaint }]}>EVENT VENUE MAP</Text>

          {typeof event.latitude === 'number' &&
          typeof event.longitude === 'number' &&
          !Number.isNaN(event.latitude) &&
          !Number.isNaN(event.longitude) ? (
            <Map
              style={styles.mapView}
              centerLatitude={event.latitude}
              centerLongitude={event.longitude}
              zoom={13}
              markers={[
                {
                  id: event.id,
                  latitude: event.latitude,
                  longitude: event.longitude,
                  title: event.title,
                  description: event.venue,
                },
              ]}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.inkMuted }}>Map unavailable</Text>
            </View>
          )}

          <Button
            label="Get Directions"
            variant="outline"
            onPress={() => openDirections(event.latitude, event.longitude, event.title)}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.ink }]}>About this drive</Text>
        <Text style={[styles.body, { color: theme.inkMuted }]}>{event.description}</Text>

        {rsvped ? (
          <Card style={[styles.confirmCard, { borderColor: theme.teal }]}>
            <Text style={[styles.confirmTitle, { color: theme.ink }]}>You're Registered! 🎉</Text>
            <Text style={[styles.body, { color: theme.inkMuted }]}>
              Your registration slot has been logged. Ticket Ref: <Text style={{fontWeight: '700'}}>{ticketRef}</Text>
            </Text>
            <Text style={[styles.body, { color: theme.inkMuted, marginTop: 4 }]}>
              Selected Slot: {selectedTimeSlot}
            </Text>
            <Button
              label="Log Donation"
              variant="outline"
              onPress={() => router.push('/donate/log')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <Button label="I'm Going" onPress={() => setShowRegModal(true)} style={{ marginTop: spacing.lg }} fullWidth />
        )}
      </ScrollView>

      {/* Red Cross RSVP Registration Modal */}
      <Modal visible={showRegModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            
            {/* 1. Loading/Submitting View */}
            {isSubmitting && (
              <View style={styles.modalStatusContainer}>
                <ActivityIndicator size="large" color={theme.crimson} />
                <Text style={[styles.statusText, { color: theme.ink, marginTop: spacing.md }]}>
                  Sending registration to Philippine Red Cross Cebu...
                </Text>
                <Text style={[styles.subStatusText, { color: theme.inkMuted }]}>
                  Securing your slot and generating ticket pass
                </Text>
              </View>
            )}

            {/* 2. Success Ticket View */}
            {isSuccess && !isSubmitting && (
              <View style={styles.modalStatusContainer}>
                <CheckCircle2 size={54} color={theme.teal} />
                <Text style={[styles.successTitle, { color: theme.ink }]}>Slot Confirmed!</Text>
                <Text style={[styles.successSubtitle, { color: theme.inkMuted }]}>
                  A confirmation email has been dispatched to cebu@redcross.org.ph and your registered email address.
                </Text>
                
                {/* Visual Registration Ticket */}
                <Card style={[styles.ticketCard, { borderColor: theme.border }]}>
                  <Text style={[styles.ticketHeader, { color: theme.crimson }]}>ENTRY PASS & SLOT TICKET</Text>
                  <View style={styles.ticketDivider} />
                  
                  <TicketRow label="Ticket Ref" value={ticketRef} highlight />
                  <TicketRow label="Donor Name" value={profile ? `${profile.firstName} ${profile.lastName}` : '—'} />
                  <TicketRow label="Blood Type" value={profile?.bloodType || '—'} />
                  <TicketRow label="Event Name" value={event.title} />
                  <TicketRow label="Venue" value={event.venue} />
                  <TicketRow label="Time Window" value={selectedTimeSlot} />
                </Card>

                <Button
                  label="Close & Get Pass"
                  onPress={closeSuccess}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}

            {/* 3. Form Input View */}
            {!isSubmitting && !isSuccess && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.ink }]}>PRC Slot Registration</Text>
                  <TouchableOpacity onPress={() => setShowRegModal(false)}>
                    <Text style={[styles.closeLabel, { color: theme.inkFaint }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Form Warning Box */}
                <View style={[styles.formNotice, { backgroundColor: theme.crimsonLight }]}>
                  <Text style={[styles.formNoticeText, { color: theme.crimson }]}>
                    ⓘ Form submission will send a registration record to the PRC Cebu Chapter and reserve 1 seat.
                  </Text>
                </View>

                {/* Prefilled Fields */}
                <Text style={[styles.label, { color: theme.ink }]}>Donor Profile (Prefilled)</Text>
                <Card style={styles.prefilledCard}>
                  <Text style={[styles.prefilledText, { color: theme.ink }]}>
                    {profile ? `${profile.firstName} ${profile.lastName}` : '—'} ({profile?.bloodType || 'Blood Type Unspecified'})
                  </Text>
                  <Text style={[styles.prefilledEmail, { color: theme.inkMuted }]}>{profile?.email || '—'}</Text>
                </Card>

                {/* Contact Number */}
                <Text style={[styles.label, { color: theme.ink, marginTop: spacing.md }]}>Contact Number <Text style={{ color: theme.crimson }}>*</Text></Text>
                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  placeholder="e.g. 09171234567"
                  placeholderTextColor={theme.inkFaint}
                  keyboardType="phone-pad"
                  style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.paper }]}
                />

                {/* Preferred Time Window */}
                <Text style={[styles.label, { color: theme.ink, marginTop: spacing.md }]}>Preferred Time Slot</Text>
                <View style={styles.slotsGrid}>
                  {timeSlots.map((ts) => {
                    const isSel = ts === selectedTimeSlot;
                    return (
                      <TouchableOpacity
                        key={ts}
                        style={[
                          styles.slotButton,
                          { borderColor: theme.border },
                          isSel && { borderColor: theme.crimson, backgroundColor: theme.crimsonLight },
                        ]}
                        onPress={() => setSelectedTimeSlot(ts)}
                      >
                        <Text style={[styles.slotText, { color: theme.ink }, isSel && { color: theme.crimson, fontWeight: '700' }]}>
                          {ts}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Health Check Declarations */}
                <Text style={[styles.label, { color: theme.ink, marginTop: spacing.md }]}>Red Cross Health Check</Text>
                <Checkbox
                  checked={declHealthy}
                  onPress={() => setDeclHealthy(!declHealthy)}
                  label="I am in good general health, feel well, and weigh over 50kg."
                />
                <Checkbox
                  checked={declMeds}
                  onPress={() => setDeclMeds(!declMeds)}
                  label="I have not taken antibiotics or maintenance medicines that restrict donation within the past 14 days."
                />
                <Checkbox
                  checked={declConsent}
                  onPress={() => setDeclConsent(!declConsent)}
                  label="I consent to sharing this info with PRC Cebu Chapter to confirm my slot reservation."
                />

                <Button
                  label="Submit Registration"
                  disabled={!formValid}
                  onPress={handleRegister}
                  fullWidth
                  style={{ marginTop: spacing.lg }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ icon: Icon, label }: { icon: any; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Icon size={16} color={theme.crimson} />
      <Text style={[styles.infoLabel, { color: theme.ink }]}>{label}</Text>
    </View>
  );
}

function TicketRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.ticketRow}>
      <Text style={[styles.ticketLabel, { color: theme.inkMuted }]}>{label}</Text>
      <Text style={[styles.ticketValue, { color: theme.ink }, highlight && { color: theme.crimson, fontWeight: '800' }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Checkbox({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkboxBox, { borderColor: theme.border }, checked && { backgroundColor: theme.crimson, borderColor: theme.crimson }]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.checkboxText, { color: theme.inkMuted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  title: { ...typography.display },
  organizer: { ...typography.body, marginTop: spacing.xs },
  infoCard: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel: { ...typography.body, flexShrink: 1 },
  sectionLabel: { ...typography.h2, marginTop: spacing.sm, marginBottom: spacing.xs },
  body: { ...typography.body },
  confirmCard: { marginTop: spacing.md, borderWidth: 1.5, gap: spacing.xs },
  confirmTitle: { ...typography.h2 },

  // Map preview styles
  mapCard: { height: 210, padding: 8, gap: 4 },
  mapLabel: { ...typography.eyebrow, fontSize: 9, paddingLeft: 4, marginBottom: 4 },
  mapView: { flex: 1, borderRadius: radius.sm, overflow: 'hidden' },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h1 },
  closeLabel: { ...typography.bodyStrong },
  
  formNotice: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  formNoticeText: { ...typography.caption, fontWeight: '600' },
  
  label: { ...typography.bodyStrong, fontSize: 13, marginBottom: 6 },
  prefilledCard: { padding: spacing.sm, opacity: 0.8 },
  prefilledText: { ...typography.bodyStrong, fontSize: 14 },
  prefilledEmail: { ...typography.caption },
  
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    marginBottom: spacing.sm,
  },
  
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slotButton: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '48%',
    alignItems: 'center',
  },
  slotText: { ...typography.caption, fontSize: 11 },
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
    width: '100%',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: -2,
  },
  checkboxText: { ...typography.caption, flex: 1, lineHeight: 18 },

  // Status/Ticket confirmation styling
  modalStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: { ...typography.bodyStrong, fontSize: 16, textAlign: 'center' },
  subStatusText: { ...typography.caption, textAlign: 'center' },
  successTitle: { ...typography.h1, fontSize: 24, marginTop: spacing.sm },
  successSubtitle: { ...typography.body, textAlign: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  
  ticketCard: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: '#FAF6F4',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ticketHeader: { ...typography.eyebrow, textAlign: 'center', fontWeight: '800' },
  ticketDivider: { height: 1.5, borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#DDD', marginVertical: spacing.sm },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  ticketLabel: { ...typography.caption },
  ticketValue: { ...typography.bodyStrong, fontSize: 13, flex: 1, textAlign: 'right', paddingLeft: spacing.lg },
});
