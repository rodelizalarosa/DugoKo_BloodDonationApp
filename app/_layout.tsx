import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Guards the router based on auth state.
 * - If session is null (logged out) → redirect to /auth/login
 * - If session exists and on an auth screen → redirect to /(tabs)
 *
 * Exceptions (mid-flow screens that must not be redirected away):
 *   - auth/otp          — OTP verification step (may have a temporary recovery session)
 *   - auth/reset-password — password update step (requires recovery session to be present)
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, isLoading } = useAuth();
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for session restore

    // If session exists but profile is still loading (auth callback / async refresh), wait.
    if (session && !profile) return;

    const inAuthGroup = segments[0] === 'auth';
    const currentScreen = segments[1] as string | undefined;

    // These screens are intentionally mid-flow and must not be interrupted.
    const isMidFlowScreen =
      currentScreen === 'otp' || currentScreen === 'reset-password';

    // Splash screen is at / (empty segment list) or index
    const segs = segments as unknown as string[];
    const isSplashScreen =
      segs.length === 0 ||
      segs[0] === 'index' ||
      segs[0] === '';

    if (!session) {
      if (!inAuthGroup && !isSplashScreen) {
        // Not logged in and not on auth/splash screen -> redirect to login
        router.replace('/auth/login');
      }
    } else {
      // User is logged in
      if (inAuthGroup || isSplashScreen) {
        if (!isMidFlowScreen) {
          // Logged in user on auth/splash screen -> redirect to tabs
          router.replace('/(tabs)');
        }
      }
    }
  }, [session, profile, isLoading, segments]);

  if (isLoading || (session && !profile)) {
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
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/history" />
          <Stack.Screen name="profile/settings" />
          <Stack.Screen name="insight/index" />
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
