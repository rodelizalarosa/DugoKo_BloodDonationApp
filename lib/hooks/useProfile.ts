/**
 * lib/hooks/useProfile.ts
 * ─────────────────────────────────────────────────────────────────
 * Hook to read and update the current user's profile from public.users.
 */
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UpdateUserProfile } from '@/lib/supabase-types';
import type { User } from '@/types';
import { mapUser } from '@/lib/mappers';

interface UseProfileReturn {
  profile:       User | null;
  isLoading:     boolean;
  error:         string | null;
  updateProfile: (data: UpdateUserProfile) => Promise<{ error: string | null }>;
  refresh:       () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { profile: authProfile, updateProfile: ctxUpdate, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const updateProfile = useCallback(
    async (data: UpdateUserProfile): Promise<{ error: string | null }> => {
      setError(null);
      const result = await ctxUpdate(data);
      if (result.error) setError(result.error);
      return result;
    },
    [ctxUpdate]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await refreshProfile();
    setIsLoading(false);
  }, [refreshProfile]);

  const profile = useMemo(() => {
    return authProfile ? mapUser(authProfile) : null;
  }, [authProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refresh,
  };
}
