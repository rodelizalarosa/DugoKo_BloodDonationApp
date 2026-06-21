import { useRouter } from 'expo-router';
import { Bell, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AskDonaFAB } from '@/components/home/AskDonaFAB';
import { EligibilityCard } from '@/components/home/EligibilityCard';
import { GreetingCard } from '@/components/home/GreetingCard';
import { NotificationModal } from '@/components/home/NotificationModal';
import { UpcomingEventCard } from '@/components/home/UpcomingEventCard';
import { UrgentRequestCard } from '@/components/home/UrgentRequestCard';
import { spacing, typography } from '@/constants/theme';
import { getRecommendedDonors } from '@/lib/smartBloodMatching';
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/lib/hooks/useProfile';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';
import { useCommunity } from '@/lib/hooks/useCommunity';

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const { profile, isLoading } = useProfile();
  const { events } = useCentersAndEvents();
  const { requests } = useCommunity();

  // Real data only — no mock fallback
  const urgentRequest = requests.find((r) => r.urgencyLevel === 'critical');
  const nextEvent = events[0];

  // Smart matching only runs when we have a real urgent request
  // candidateDonors will be real users from DB in a future iteration
  const recommendedDonors = urgentRequest
    ? getRecommendedDonors({ request: urgentRequest, candidateDonors: [] })
    : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: theme.crimson }]}>DugóKo</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
          >
            {isDarkMode ? (
              <Sun size={20} color={theme.amber} />
            ) : (
              <Moon size={20} color={theme.ink} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => setShowNotifications(true)}
          >
            <Bell size={20} color={theme.ink} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: theme.inkFaint }]}>Loading your profile…</Text>
          </View>
        ) : (
          <>
            {profile && <GreetingCard user={profile} />}
            {profile && <EligibilityCard user={profile} />}
          </>
        )}
        {nextEvent && <UpcomingEventCard event={nextEvent} />}
        {urgentRequest && profile && (
          <UrgentRequestCard
            request={urgentRequest}
            recommendedDonors={recommendedDonors}
            currentUserId={profile.id}
          />
        )}
        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
      <AskDonaFAB />

      {/* Notifications: will be driven by real DB data in a future iteration */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={[]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  appName: {
    ...typography.h1,
    fontSize: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
});
