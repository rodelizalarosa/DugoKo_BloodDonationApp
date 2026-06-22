/**
 * app/admin/index.tsx
 * ─────────────────────────────────────────────────────────────────
 * Admin panel for admins and moderators.
 *
 * Access is gated by RBAC in AuthGate (_layout.tsx).
 * - Admins: full access (manage events, centers, users, content)
 * - Moderators: moderate content (community posts, blood requests)
 * - Donors: redirected away if they navigate here
 */

import { useRouter } from 'expo-router';
import { Building2, CalendarCheck, FileText, ShieldCheck, Users, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { spacing, typography, radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

type ActionItem = {
  key: string;
  title: string;
  desc: string;
  icon: any;
  href?: string;
  requiredRole: 'admin' | 'moderator';
};

const actions: ActionItem[] = [
  {
    key: 'events',
    title: 'Manage Events',
    desc: 'Create, edit, or cancel blood letting events',
    icon: CalendarCheck,
    requiredRole: 'admin',
  },
  {
    key: 'centers',
    title: 'Manage Centers',
    desc: 'Add or update donation center details',
    icon: Building2,
    requiredRole: 'admin',
  },
  {
    key: 'users',
    title: 'Manage Users',
    desc: 'View and manage donor accounts',
    icon: Users,
    requiredRole: 'admin',
  },
  {
    key: 'moderate',
    title: 'Moderate Content',
    desc: 'Review and manage community posts and requests',
    icon: ShieldCheck,
    requiredRole: 'moderator',
  },
  {
    key: 'articles',
    title: 'Manage Learn Articles',
    desc: 'Add or update educational content',
    icon: FileText,
    requiredRole: 'admin',
  },
];

export default function AdminPanelScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile, userRole, isAdmin, isModerator, signOut } = useAuth();

  const visibleActions = actions.filter(
    (a) => isAdmin || (isModerator && a.requiredRole === 'moderator')
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.crimson} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.ink }]}>Admin Panel</Text>
          <Text style={[styles.role, { color: theme.inkMuted }]}>
            {isAdmin ? 'Administrator' : 'Moderator'} · {profile?.full_name || 'User'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {visibleActions.map((a) => (
          <Pressable key={a.key} onPress={() => {
            // Route to management screens (to be built in future)
            // For now, we just show the card
          }}>
            <Card style={styles.actionCard}>
              <View style={[styles.iconWrap, { backgroundColor: theme.crimsonLight }]}>
                <a.icon size={20} color={theme.crimson} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: theme.ink }]}>{a.title}</Text>
                <Text style={[styles.actionDesc, { color: theme.inkMuted }]}>{a.desc}</Text>
                <Text style={[styles.roleBadge, { color: theme.inkFaint }]}>
                  {a.requiredRole === 'admin' ? 'Admin only' : 'Moderator'}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}

        <View style={styles.footer}>
          <Pressable
            style={[styles.logoutBtn, { borderColor: theme.border }]}
            onPress={async () => {
              await signOut();
              router.replace('/auth/login');
            }}
          >
            <Text style={[styles.logoutText, { color: theme.crimson }]}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h1 },
  role: { ...typography.caption, marginTop: 2 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { ...typography.bodyStrong },
  actionDesc: { ...typography.caption, marginTop: 2 },
  roleBadge: { ...typography.caption, fontSize: 10, marginTop: 4 },
  footer: { marginTop: spacing.xxl, alignItems: 'center' },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  logoutText: { ...typography.bodyStrong },
});
