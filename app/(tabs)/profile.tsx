import { useRouter } from 'expo-router';
import { Award, ChevronRight, Clock, FileText, LogOut, Settings, UserCog, Camera, Trash2, X, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

// Role-based menu items: admin/moderator users get an extra Admin Panel entry
function buildMenu(isAdminOrMod: boolean) {
  const items: Array<{ key: string; label: string; icon: any; href: string }> = [
    { key: 'edit', label: 'Edit Profile', icon: UserCog, href: '/profile/edit' },
    { key: 'history', label: 'Donation History', icon: Clock, href: '/profile/history' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/profile/settings' },
  ];

  if (isAdminOrMod) {
    items.push({ key: 'admin', label: 'Admin Panel', icon: Shield, href: '/admin/index' });
  }

  items.push({ key: 'logout', label: 'Logout', icon: LogOut, href: '/auth/login' });
  return items;
}

const donorLevels = [
  { level: 'New Donor', requirement: '1st donation', color: '#94A3B8' },
  { level: 'Regular Donor', requirement: '2nd - 3rd donation', color: '#319795' },
  { level: 'Hero Donor', requirement: '4th - 9th donation', color: '#B3122A' },
  { level: 'Lifesaver', requirement: '10+ donations', color: '#D69E2E' },
];

import { useProfile } from '@/lib/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { profile, isLoading } = useProfile();
  const { signOut, isAdmin, isModerator } = useAuth();
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.crimson} />
        </View>
      </SafeAreaView>
    );
  }

  // ── No profile yet (trigger may not have fired) ────────────────
  if (!profile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Text style={[typography.h2, { color: theme.ink, textAlign: 'center' }]}>Profile not ready yet</Text>
          <Text style={[typography.body, { color: theme.inkMuted, textAlign: 'center', marginTop: spacing.sm }]}>
            Your profile is being set up. Please wait a moment and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.crimson }]}>
              <Text style={[styles.avatarInitial, { color: theme.surface }]}>{profile.firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.avatarActions}>
              <TouchableOpacity style={[styles.avatarActionBtn, { backgroundColor: theme.surface }]}>
                <Camera size={16} color={theme.crimson} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.avatarActionBtn, { backgroundColor: theme.surface }]}>
                <Trash2 size={16} color={theme.inkFaint} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.name, { color: theme.ink }]}>{fullName}</Text>

          <Pressable
            style={[styles.levelRow, { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.2)' : 'rgba(179, 18, 42, 0.05)' }]}
            onPress={() => setShowLevelModal(true)}
          >
            <Award size={16} color={theme.crimson} />
            <Text style={[styles.level, { color: theme.crimson }]}>{profile.donorLevel}</Text>
            <ChevronRight size={14} color={theme.crimson} />
          </Pressable>
        </View>

        <View style={styles.statRow}>
          <Stat label="Blood Type" value={profile.bloodType ?? '—'} />
          <Stat label="Donations" value={`${profile.totalDonations}`} />
          <Stat label="Goal" value="Next: 10" />
        </View>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {buildMenu(isAdmin || isModerator).map((item, idx, arr) => (
            <Pressable
              key={item.key}
              onPress={() => {
                if (item.key === 'logout') {
                  setShowLogoutModal(true);
                  return;
                }
                router.push(item.href as any);
              }}
              style={[styles.menuRow, idx !== arr.length - 1 && [styles.menuRowBorder, { borderBottomColor: theme.border }]]}
            >
              <View style={styles.menuLeft}>
                <item.icon size={18} color={theme.crimson} />
                <Text style={[styles.menuLabel, { color: theme.ink }]}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={theme.inkFaint} />
            </Pressable>
          ))}
        </Card>

        {/* Donor Levels Modal */}
        <Modal visible={showLevelModal} transparent animationType="slide" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.ink }]}>Donor Milestones</Text>
                <TouchableOpacity onPress={() => setShowLevelModal(false)}>
                  <X size={24} color={theme.inkMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <View style={styles.levelList}>
                  {donorLevels.map((dl) => (
                    <View
                      key={dl.level}
                      style={[
                        styles.levelItem,
                        { borderColor: theme.border },
                        profile.donorLevel === dl.level && { borderColor: theme.crimson, backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.1)' : 'rgba(179, 18, 42, 0.05)' },
                      ]}
                    >
                      <View style={[styles.levelBadge, { backgroundColor: dl.color }]}>
                        <Award size={20} color="#FFF" />
                      </View>
                      <View style={styles.levelInfo}>
                        <Text style={[styles.levelName, { color: theme.ink }]}>{dl.level}</Text>
                        <Text style={[styles.levelReq, { color: theme.inkMuted }]}>{dl.requirement}</Text>
                      </View>
                      {profile.donorLevel === dl.level && (
                        <View style={[styles.activeBadge, { backgroundColor: theme.crimson }]}>
                          <Text style={styles.activeText}>Current</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal visible={showLogoutModal} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.modalOverlayCenter}>
            <View style={[styles.logoutModalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.ink }]}>Confirm Logout</Text>
                <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
                  <X size={24} color={theme.inkMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.logoutMessage, { color: theme.inkMuted }]}>
                Are you sure you want to logout?
              </Text>

              <View style={styles.logoutActions}>
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(false)}
                  style={[styles.logoutBtn, styles.logoutBtnSecondary, { borderColor: theme.border }]}
                >
                  <Text style={[styles.logoutBtnText, { color: theme.ink }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    setShowLogoutModal(false);
                    await signOut();
                  }}
                  style={[styles.logoutBtn, styles.logoutBtnPrimary, { backgroundColor: theme.crimson }]}
                >
                  <Text style={[styles.logoutBtnText, { color: theme.surface }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 },
  avatarWrap: { alignItems: 'center', marginTop: spacing.md },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  avatarInitial: { ...typography.display, fontSize: 40 },
  avatarActions: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  avatarActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  name: { ...typography.h1, marginTop: spacing.lg },
  levelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  level: { ...typography.bodyStrong, fontSize: 13 },
  statRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  statValue: { ...typography.bodyStrong, fontSize: 16 },
  statLabel: { ...typography.caption, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  menuRowBorder: { borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { ...typography.bodyStrong },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    height: '60%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
  },
  logoutModalContent: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    width: '100%',
  },
  logoutMessage: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  logoutBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutBtnPrimary: {
    borderColor: 'transparent',
  },
  logoutBtnSecondary: {
    backgroundColor: 'transparent',
  },
  logoutBtnText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: { ...typography.h1 },
  levelList: { gap: spacing.md },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelInfo: { flex: 1 },
  levelName: { ...typography.bodyStrong },
  levelReq: { ...typography.caption, marginTop: 2 },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  activeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
