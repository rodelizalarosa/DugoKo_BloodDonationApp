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
    async (
      eventId: string,
      status: RsvpStatus,
      timeSlot?: string,
      contactNumber?: string,
      declHealthy?: boolean,
      declNoMeds14d?: boolean,
      declConsent?: boolean,
      donorEmail?: string,
      donorName?: string,
      eventTitle?: string,
      eventVenue?: string
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not authenticated' };

      // First, insert/update RSVP record
      const { error: upsertError } = await supabase
        .from('event_rsvp')
        .upsert(
          {
            event_id: eventId,
            user_id: userId,
            status,
            time_slot: timeSlot || null,
            contact_number: contactNumber || null,
            decl_healthy: declHealthy ?? false,
            decl_no_meds_14d: declNoMeds14d ?? false,
            decl_consent: declConsent ?? false,
          },
          { onConflict: 'event_id,user_id' }
        );

      if (upsertError) {
        return { error: upsertError.message };
      }

      // Decrement slots in the events table using RPC
      const { error: decrementError } = await supabase.rpc('decrement_event_slots', {
        p_event_id: eventId,
      });

      if (decrementError) {
        console.log('Slot decrement error (may already be 0):', decrementError.message);
      }

      // Refresh events to get updated slot count
      await fetchData();

      // Send email confirmation if email provided
      if (!decrementError && donorEmail && donorName && eventTitle && eventVenue) {
        try {
          await supabase.functions.invoke('send-event-confirmation', {
            body: {
              donor_email: donorEmail,
              donor_name: donorName,
              event_title: eventTitle,
              event_venue: eventVenue,
              time_slot: timeSlot,
            },
          });
        } catch (emailErr) {
          console.log('Event email notification skipped:', emailErr);
        }
      }

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
