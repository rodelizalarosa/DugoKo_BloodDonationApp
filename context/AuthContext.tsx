/**
 * context/AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────
 * Global auth state for DugóKo.
 *
 * Provides:
 *  - session      — raw Supabase Session (contains JWT, user ID, etc.)
 *  - profile      — users table row for the logged-in user
 *  - isLoading    — true while session is being restored from SecureStore
 *  - signIn       — email + password login
 *  - signUp       — new account (email confirmation disabled in dev)
 *  - signOut      — clear session
 *  - resetPassword — send password reset email
 *  - updateProfile — update the users table row
 *
 * OAuth stubs (wired after core backend is complete):
 *  - signInWithGoogle()   — commented in for future use
 *  - signInWithFacebook() — commented in for future use
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UpdateUserProfile, UserRow, UserRole } from '@/lib/supabase-types';

// ── Types ──────────────────────────────────────────────────────────
export type OtpType = 'signup' | 'recovery' | 'email';

interface AuthContextType {
  session: Session | null;
  profile: UserRow | null;
  isLoading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isModerator: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Send a 6-digit OTP for password reset (uses SMTP, not Supabase magic link). */
  sendPasswordResetOtp: (email: string) => Promise<{ error: string | null }>;
  /** Verify a 6-digit OTP token.
   *  - type = 'signup' → confirm new account email (Supabase "Confirm signup" template)
   *  - type = 'email'  → verify OTP from signInWithOtp — used for forgot-password flow
   *  - type = 'recovery' → verify OTP from resetPasswordForEmail (magic-link based, not used here)
   */
  verifyOtp: (email: string, token: string, type: OtpType) => Promise<{ error: string | null }>;
  /** @deprecated Use sendPasswordResetOtp instead. Kept for magic-link fallback. */
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: UpdateUserProfile) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;

  // ── OAuth stubs (wired after core backend is complete) ───────────
  // signInWithGoogle:   () => Promise<{ error: string | null }>;
  // signInWithFacebook: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = profile?.role ?? null;
  const isAdmin = profile?.role === 'admin';
  const isModerator = profile?.role === 'moderator';

  // ── Fetch profile row from public.users ──────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as UserRow);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  // ── Restore session on mount, listen for changes ─────────────────
  useEffect(() => {
    // Attempt to restore persisted session from SecureStore
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user?.id) {
          setIsLoading(true);
          fetchProfile(session.user.id).finally(() => setIsLoading(false));
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Auth methods ──────────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // emailRedirectTo: 'dugoko://auth/confirm',
      },
    });

    if (error) {
      // Humanize common Supabase error messages
      const msg = error.message.toLowerCase();
      if (msg.includes('user already registered') || msg.includes('already registered')) {
        return { error: 'EMAIL_ALREADY_REGISTERED' };
      }
      if (msg.includes('invalid email')) {
        return { error: 'Please enter a valid email address.' };
      }
      if (msg.includes('password')) {
        return { error: 'Password is too weak. Please choose a stronger password.' };
      }
      return { error: error.message };
    }

    // Supabase quirk: when email confirmation is enabled and the email is already
    // registered, it returns a user with an empty identities array instead of an error.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: 'EMAIL_ALREADY_REGISTERED' };
    }

    return { error: null };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: string | null }> => {
    // Legacy magic-link fallback. Prefer sendPasswordResetOtp for OTP flow.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'dugoko://auth/reset-password',
    });
    return { error: error?.message ?? null };
  };

  /**
   * Sends a 6-digit OTP to the email for password recovery.
   * Uses supabase.auth.signInWithOtp which routes through your custom SMTP.
   */
  const sendPasswordResetOtp = async (
    email: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // shouldCreateUser: false ensures we only send OTP to existing users.
        // Set to true if you want auto-registration on OTP (not recommended for forgot-password).
        shouldCreateUser: false,
      },
    });
    return { error: error?.message ?? null };
  };

  /**
   * Verifies a 6-digit OTP token.
   * - type = 'signup'   → confirm a new account's email
   * - type = 'recovery' → confirm forgot-password OTP before allowing reset
   * - type = 'email'    → general email change verification
   */
  const verifyOtp = async (
    email: string,
    token: string,
    type: OtpType
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (
    data: UpdateUserProfile
  ): Promise<{ error: string | null }> => {
    if (!session?.user?.id) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', session.user.id);

    if (!error) await fetchProfile(session.user.id);
    return { error: error?.message ?? null };
  };

  // ── OAuth stubs (wire after core backend is complete) ─────────────
  // const signInWithGoogle = async (): Promise<{ error: string | null }> => {
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: { redirectTo: 'dugoko://auth/callback' },
  //   });
  //   return { error: error?.message ?? null };
  // };
  //
  // const signInWithFacebook = async (): Promise<{ error: string | null }> => {
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'facebook',
  //     options: { redirectTo: 'dugoko://auth/callback' },
  //   });
  //   return { error: error?.message ?? null };
  // };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        userRole,
        isAdmin,
        isModerator,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendPasswordResetOtp,
        verifyOtp,
        updateProfile,
        refreshProfile,
        // signInWithGoogle,
        // signInWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
