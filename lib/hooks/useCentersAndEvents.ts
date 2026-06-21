import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { RsvpStatus, BloodEvent, DonationCenter } from '@/types';
import { mapEvent, mapCenter } from '@/lib/mappers';

export function useCentersAndEvents() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [events, setEvents] = useState<BloodEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [centersRes, eventsRes] = await Promise.all([
      supabase.from('centers').select('*'),
      supabase.from('events').select('*').order('date', { ascending: true }),
    ]);

    if (centersRes.error) {
      setError(centersRes.error.message);
    } else if (eventsRes.error) {
      setError(eventsRes.error.message);
    } else {
      setCenters((centersRes.data ?? []).map(mapCenter));
      setEvents((eventsRes.data ?? []).map(mapEvent));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rsvpEvent = useCallback(
    async (eventId: string, status: RsvpStatus, timeSlot?: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not authenticated' };

      const { error: upsertError } = await supabase
        .from('event_rsvp')
        .upsert(
          {
            event_id: eventId,
            user_id: userId,
            status,
            time_slot: timeSlot || null,
          },
          { onConflict: 'event_id,user_id' }
        );

      if (upsertError) {
        return { error: upsertError.message };
      }

      await fetchData();
      return { error: null };
    },
    [userId, fetchData]
  );

  const getUserRsvp = useCallback(
    async (eventId: string) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('event_rsvp')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        status: data.status as RsvpStatus,
        timeSlot: data.time_slot,
      };
    },
    [userId]
  );

  return {
    centers,
    events,
    isLoading,
    error,
    rsvpEvent,
    getUserRsvp,
    refresh: fetchData,
  };
}
