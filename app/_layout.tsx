import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function RootContent() {
  const { isDarkMode, theme } = useTheme();
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}
