/**
 * lib/supabase.ts
 * ───────────────────────────────────────────────────────────────
 * Secure Supabase client for DugóKo.
 *
 * - Uses expo-secure-store for encrypted on-device session storage
 *   (instead of AsyncStorage which stores in plaintext).
 * - detectSessionInUrl: false is required for React Native.
 * - autoRefreshToken: true keeps sessions alive transparently.
 *
 * Configuration: set these in your .env file:
 *   EXPO_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from './supabase-types';

// SecureStore is not available on web — fall back to in-memory storage.
const ExpoSecureStoreAdapter =
  Platform.OS === 'web'
    ? undefined // Supabase defaults to localStorage on web
    : {
        getItem: (key: string): Promise<string | null> =>
          SecureStore.getItemAsync(key),
        setItem: (key: string, value: string): Promise<void> =>
          SecureStore.setItemAsync(key, value),
        removeItem: (key: string): Promise<void> =>
          SecureStore.deleteItemAsync(key),
      };

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[DugóKo] Missing Supabase environment variables.\n' +
    'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Must be false for React Native
    // Email confirmation is disabled in Supabase Dashboard during development.
    // Re-enable via: Auth → Settings → Enable email confirmations
    // ── OAuth stubs (wired after core backend is complete) ──────────────
    // flowType: 'pkce',  // Enable when adding Google/Facebook OAuth
    // providers: ['google', 'facebook'],
  },
});
