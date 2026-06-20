import { useRouter } from 'expo-router';
import { Bell, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AskDonaFAB } from '@/components/home/AskDonaFAB';
import { EligibilityCard } from '@/components/home/EligibilityCard';
import { GreetingCard } from '@/components/home/GreetingCard';
import { InsightCard } from '@/components/home/InsightCard';
import { NotificationModal } from '@/components/home/NotificationModal';
import { UpcomingEventCard } from '@/components/home/UpcomingEventCard';
import { UrgentRequestCard } from '@/components/home/UrgentRequestCard';
import { radius, spacing, typography } from '@/constants/theme';
import { mockEvents, mockInsight, mockNotifications, mockRequests, mockUser } from '@/constants/mockData';
import { mockCandidateDonors } from '@/constants/mockCandidateDonors';
import { getRecommendedDonors } from '@/lib/smartBloodMatching';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const urgentRequest = mockRequests.find((r) => r.urgencyLevel === 'critical');
  const nextEvent = mockEvents[0];
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const recommendedDonors = urgentRequest
    ? getRecommendedDonors({
        request: urgentRequest,
        candidateDonors: mockCandidateDonors,
      })
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
            {unreadCount > 0 && <View style={[styles.dot, { backgroundColor: theme.crimson }]} />}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GreetingCard user={mockUser} />
        


        <EligibilityCard user={mockUser} />
        {nextEvent && <UpcomingEventCard event={nextEvent} />}
        {urgentRequest && (
          <UrgentRequestCard
            request={urgentRequest}
            recommendedDonors={recommendedDonors}
            currentUserId={mockUser.id}
          />
        )}
        {/* Removed AI donor insight feature from homepage (Smart Blood Request Matching MVP focuses on urgent matching). */}
        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
      <AskDonaFAB />
      
      <NotificationModal 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        notifications={mockNotifications}
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
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  ctaContent: {
    marginBottom: spacing.md,
  },
  ctaTitle: {
    ...typography.h2,
    fontSize: 18,
  },
  ctaBody: {
    ...typography.caption,
    marginTop: 4,
  },
  ctaButton: {
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    ...typography.bodyStrong,
    color: '#FFF',
    fontSize: 14,
  },
});
