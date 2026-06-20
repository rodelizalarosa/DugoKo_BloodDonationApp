import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award, ShieldCheck, Clock } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockDonations, mockUser } from '@/constants/mockData';
import { calculateEligibility, formatDate } from '@/lib/eligibility';

export default function ReceiptScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const {
    id,
    date,
    venue,
    branch,
    bloodBagRef,
    bp,
    hemoglobin,
    pulse,
    notes,
    isVerified,
    donorId,
  } = useLocalSearchParams<{
    id?: string;
    date?: string;
    venue?: string;
    branch?: string;
    bloodBagRef?: string;
    bp?: string;
    hemoglobin?: string;
    pulse?: string;
    notes?: string;
    isVerified?: string;
    donorId?: string;
  }>();

  // If a new donation was just logged, build a custom donation object dynamically
  const donation = date
    ? {
        id: id || 'new-log',
        userId: 'u1',
        date,
        venue,
        branch,
        bloodBagRef,
        bloodPressure: bp,
        hemoglobin,
        pulse,
        notes,
      }
    : id
    ? mockDonations.find((d) => d.id === id) || mockDonations[mockDonations.length - 1]
    : mockDonations[mockDonations.length - 1];

  const eligibility = calculateEligibility(donation.date);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/donate');
    }
  };

  const isVerifiedRecord = !date || isVerified === 'true';
  const resolvedDonorId = date ? donorId : 'PRC-09-88123';
  const backLabel = id ? 'Back to History' : 'Back to Donate';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Donation Receipt" subtitle="Your proof and personal record" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.receipt}>
          <View style={styles.badgeRow}>
            <Award size={22} color={theme.crimson} />
            <Text style={[styles.thankYou, { color: theme.ink }]}>Thank you for donating!</Text>
          </View>

          {/* Verification Badge */}
          {isVerifiedRecord ? (
            <View style={[styles.badgeContainer, { backgroundColor: theme.tealLight, borderColor: theme.teal }]}>
              <ShieldCheck size={16} color={theme.teal} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.badgeTitle, { color: theme.teal }]}>VERIFIED RED CROSS RECORD</Text>
                {resolvedDonorId ? (
                  <Text style={[styles.badgeSubtext, { color: theme.teal }]}>
                    Donor ID: {resolvedDonorId}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={[styles.badgeContainer, { backgroundColor: theme.amberLight, borderColor: theme.amber }]}>
              <Clock size={16} color={theme.amber} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.badgeTitle, { color: theme.amber }]}>VERIFICATION PENDING</Text>
                <Text style={[styles.badgeSubtext, { color: theme.amber }]}>
                  Self-logged. Red Cross is verifying card photo (takes 3–5 days).
                </Text>
              </View>
            </View>
          )}

          <Row label="Name" value={`${mockUser.firstName} ${mockUser.lastName}`} />
          <Row label="Blood Type" value={mockUser.bloodType ?? '—'} />
          <Divider />
          <Row label="Date" value={formatDate(donation.date || null)} />
          <Row label="Venue" value={donation.venue || ''} />
          <Row label="Branch" value={donation.branch || ''} />
          <Row label="Blood Bag Ref" value={donation.bloodBagRef ?? '—'} />

          {(donation.bloodPressure || donation.hemoglobin || donation.pulse) && (
            <>
              <Divider />
              {donation.bloodPressure && <Row label="Blood Pressure" value={donation.bloodPressure!} />}
              {donation.hemoglobin && <Row label="Hemoglobin" value={donation.hemoglobin!} />}
              {donation.pulse && <Row label="Pulse" value={donation.pulse!} />}
            </>
          )}

          <Divider />
          <Row label="Next Donation" value={formatDate(eligibility.nextEligibleDate)} emphasize />

          {donation.notes && (
            <>
              <Divider />
              <View style={styles.notesContainer}>
                <Text style={[styles.notesLabel, { color: theme.inkMuted }]}>Notes</Text>
                <Text style={[styles.notesText, { color: theme.ink }]}>{donation.notes}</Text>
              </View>
            </>
          )}
        </Card>

        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <Button
            label="Print"
            variant="outline"
            onPress={async () => {
              const html = buildReceiptHtml({
                donorName: `${mockUser.firstName} ${mockUser.lastName}`,
                bloodType: mockUser.bloodType ?? '—',
                donationDate: formatDate(donation.date || null),
                venue: donation.venue || '',
                branch: donation.branch || '',
                bloodBagRef: donation.bloodBagRef ?? '—',
                nextEligibleDate: formatDate(eligibility.nextEligibleDate),
                verified: isVerifiedRecord,
                donorId: resolvedDonorId,
              });

              await Print.printAsync({ html });
            }}
            fullWidth
          />

          <Button
            label="Download (PDF)"
            variant="outline"
            onPress={async () => {
              const html = buildReceiptHtml({
                donorName: `${mockUser.firstName} ${mockUser.lastName}`,
                bloodType: mockUser.bloodType ?? '—',
                donationDate: formatDate(donation.date || null),
                venue: donation.venue || '',
                branch: donation.branch || '',
                bloodBagRef: donation.bloodBagRef ?? '—',
                nextEligibleDate: formatDate(eligibility.nextEligibleDate),
                verified: isVerifiedRecord,
                donorId: resolvedDonorId,
              });

              const { uri } = await Print.printToFileAsync({ html, base64: false });

              const safeDate = (donation.date || '').toString().slice(0, 10) || new Date().toISOString().slice(0, 10);
              const safeDonor = (resolvedDonorId || 'PRC').replace(/[^a-zA-Z0-9_-]/g, '_');
              const fileName = `DugoKo-Donation-Receipt-${safeDonor}-${safeDate}.pdf`;
              const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

              await FileSystem.copyAsync({ from: uri, to: targetUri });

              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(targetUri);
              }
            }}
            fullWidth
          />

          <Button
            label="Share Receipt"
            variant="outline"
            onPress={async () => {
              const message = [
                `Donation receipt for ${mockUser.firstName} ${mockUser.lastName}`,
                `Blood Type: ${mockUser.bloodType ?? '—'}`,
                `Date: ${formatDate(donation.date || null)}`,
                `Venue: ${donation.venue || ''}`,
                `Branch: ${donation.branch || ''}`,
              ].join('\n');

              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(message);
              }
            }}
            fullWidth
          />
        </View>

        <Button
          label={backLabel}
          variant="ghost"
          onPress={handleBack}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.inkMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.ink }, emphasize && { color: theme.crimson }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function buildReceiptHtml(params: {
  donorName: string;
  bloodType: string;
  donationDate: string;
  venue: string;
  branch: string;
  bloodBagRef: string;
  nextEligibleDate: string;
  verified: boolean;
  donorId: string | null;
}) {
  const statusLine = params.verified ? 'VERIFIED RED CROSS RECORD' : 'VERIFICATION PENDING';
  const donorIdLine = params.verified
    ? `Donor ID: ${params.donorId ?? '—'}`
    : 'Self-logged. PRC verification pending.';

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Donation Receipt</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #111; }
      .card { border: 1px solid #e5e5e5; border-radius: 12px; padding: 18px; }
      .title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
      .status { font-size: 12px; font-weight: 800; margin-bottom: 16px; color: #0f766e; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; row-gap: 10px; margin-top: 10px; }
      .label { font-size: 12px; color: #6b7280; }
      .value { font-size: 14px; font-weight: 700; word-break: break-word; }
      .divider { height: 1px; background: #e5e5e5; margin: 16px 0; }
      .footer { margin-top: 18px; font-size: 12px; color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Donation Receipt</div>
      <div class="status">${escapeHtml(statusLine)}</div>
      <div style="font-size: 12px; font-weight: 700; margin-bottom: 14px;">${escapeHtml(donorIdLine)}</div>

      <div class="divider"></div>

      <div class="grid">
        <div><div class="label">Name</div><div class="value">${escapeHtml(params.donorName)}</div></div>
        <div><div class="label">Blood Type</div><div class="value">${escapeHtml(params.bloodType)}</div></div>

        <div><div class="label">Date</div><div class="value">${escapeHtml(params.donationDate)}</div></div>
        <div><div class="label">Blood Bag Ref</div><div class="value">${escapeHtml(params.bloodBagRef)}</div></div>

        <div><div class="label">Venue</div><div class="value">${escapeHtml(params.venue)}</div></div>
        <div><div class="label">Branch</div><div class="value">${escapeHtml(params.branch)}</div></div>

        <div><div class="label">Next Donation</div><div class="value">${escapeHtml(params.nextEligibleDate)}</div></div>
        <div></div>
      </div>

      <div class="footer">Generated by DugóKo</div>
    </div>
  </body>
</html>
`.trim();
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  receipt: { gap: spacing.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  thankYou: { ...typography.h2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { ...typography.body },
  rowValue: { ...typography.bodyStrong },
  divider: { height: 1, marginVertical: spacing.sm },
  notesContainer: { paddingVertical: spacing.xs },
  notesLabel: { ...typography.caption, marginBottom: 4 },
  notesText: { ...typography.body, fontStyle: 'italic' },
  
  // Verification Badges
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  badgeTitle: {
    ...typography.eyebrow,
    fontSize: 9,
    fontWeight: '800',
  },
  badgeSubtext: {
    ...typography.caption,
    fontSize: 9,
    marginTop: 2,
    lineHeight: 12,
  },
});

