/**
 * lib/hooks/useDonorInsights.ts
 * ─────────────────────────────────────────────────────────────────
 * Hook to fetch the current user's donor_insights row.
 * This row is auto-maintained by the handle_donation_insert trigger.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { DonorInsight } from '@/types';
import { mapDonorInsight } from '@/lib/mappers';

interface UseDonorInsightsReturn {
  insights:  DonorInsight | null;
  isLoading: boolean;
  error:     string | null;
  refresh:   () => Promise<void>;
}

export function useDonorInsights(): UseDonorInsightsReturn {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [insights,  setInsights]  = useState<DonorInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('donor_insights')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = "No rows found" — not an error, just no donations yet
      setError(fetchError.message);
    } else {
      setInsights(data ? mapDonorInsight(data) : null);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, isLoading, error, refresh: fetchInsights };
}
