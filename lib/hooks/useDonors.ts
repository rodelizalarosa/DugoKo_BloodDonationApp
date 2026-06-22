import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import type { UserRow } from '@/lib/supabase-types';
import { mapUser } from '@/lib/mappers';

interface CandidateDonor extends User {
  distanceKm: number;
}

interface UseDonorsReturn {
  donors: CandidateDonor[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDonors(): UseDonorsReturn {
  const { session } = useAuth();
  const [donors, setDonors] = useState<CandidateDonor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .rpc('search_eligible_donors', { p_exclude_id: session?.user?.id });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    const mapped: CandidateDonor[] = (data ?? []).map((row: UserRow) => ({
        ...mapUser(row),
        distanceKm: Math.round(Math.random() * 15),
      }));

    setDonors(mapped);
    setIsLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return { donors, isLoading, error, refresh: fetchDonors };
}
