import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

function navigateSafe(router: ReturnType<typeof useRouter>, route: string) {
  setTimeout(() => { try { router.replace(route as any); } catch {} }, 0);
}

/**
 * Guards the router based on auth state AND user role (RBAC).
 * - If session is null (logged out) → redirect to /auth/login
 * - If session exists and on an auth screen → redirect to /(tabs)
 * - If session exists but profile is INCOMPLETE → redirect to /profile/edit
 * - Admin users are redirected to admin panel (can still access tabs)
 *
 * Exceptions (mid-flow screens that must not be redirected away):
 *   - auth/otp             — OTP verification step
 *   - auth/reset-password   — password update step
 *   - profile/complete      — profile completion screen
 *   - admin                 — admin panel screens
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, isLoading } = useAuth();
  const segments = useSegments();
  const router   = useRouter();
  const mounted  = useRef(false);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (isLoading) return;

    const segs = segments as unknown as string[];
    const currentRoot = segs[0] || '';
    const currentScreen = segs[1] || '';
    const inAuthGroup = currentRoot === 'auth';
    const inAdminGroup = currentRoot === 'admin';

    const isMidFlowScreen =
      currentScreen === 'otp' ||
      currentScreen === 'reset-password' ||
      currentScreen === 'complete' ||
      currentScreen === 'edit';

    const isOnProfileCompletion = currentRoot === 'profile' && currentScreen === 'complete';
    const isSplashScreen = segs.length === 0 || segs[0] === 'index' || segs[0] === '';

    if (!session) {
      if (!inAuthGroup && !isSplashScreen) {
        navigateSafe(router, '/auth/login');
      }
    } else {
      if (inAdminGroup && profile?.role === 'donor') {
        navigateSafe(router, '/(tabs)');
        return;
      }

      if (inAuthGroup || isSplashScreen) {
        if (!isMidFlowScreen) {
          if (profile && !profile.profile_complete && !isOnProfileCompletion) {
            navigateSafe(router, '/profile/complete');
          } else {
            navigateSafe(router, '/(tabs)');
          }
        }
      }
    }
  }, [session, profile, isLoading, segments]);

  if (isLoading) {
    // Show a centered spinner while session/profile is being restored or loaded
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootContent() {
  const { isDarkMode, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.paper },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/otp" />
          <Stack.Screen name="auth/reset-password" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="donate/eligibility" />
          <Stack.Screen name="donate/centers" />
          <Stack.Screen name="donate/events/index" />
          <Stack.Screen name="donate/events/[id]" />
          <Stack.Screen name="donate/log" />
          <Stack.Screen name="donate/receipt" />
          <Stack.Screen name="community/[id]" />
          <Stack.Screen name="learn/[id]" />
          <Stack.Screen name="profile/complete" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/history" />
          <Stack.Screen name="profile/settings" />
          <Stack.Screen name="insight/index" />

          {/* Admin screens — only accessible to admin/moderator roles */}
          <Stack.Screen name="admin/index" />
        </Stack>
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RootContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
