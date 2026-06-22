/**
 * lib/hooks/useDonations.ts
 * ─────────────────────────────────────────────────────────────────
 * Hook to fetch, log, and manage the current user's donation history.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { InsertDonation } from '@/lib/supabase-types';
import type { Donation } from '@/types';
import { mapDonation } from '@/lib/mappers';

interface UseDonationsReturn {
  donations:   Donation[];
  isLoading:   boolean;
  error:       string | null;
  logDonation: (data: Omit<InsertDonation, 'user_id'>) => Promise<{ error: string | null; donationId?: string }>;
  refresh:     () => Promise<void>;
}

export function useDonations(): UseDonationsReturn {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setDonations((data ?? []).map(mapDonation));
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const logDonation = useCallback(
    async (data: Omit<InsertDonation, 'user_id'>): Promise<{ error: string | null; donationId?: string }> => {
      if (!userId) return { error: 'Not authenticated' };

      const { data: inserted, error: insertError } = await supabase
        .from('donations')
        .insert({ ...data, user_id: userId })
        .select('id')
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      // Refresh the list (the DB trigger also updates users + donor_insights)
      await fetchDonations();
      return { error: null, donationId: inserted?.id };
    },
    [userId, fetchDonations]
  );

  return { donations, isLoading, error, logDonation, refresh: fetchDonations };
}
