import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { CommunityPost, BloodRequest } from '@/types';
import { mapCommunityPost, mapBloodRequest } from '@/lib/mappers';
import type { InsertBloodRequest, InsertCommunityPost } from '@/lib/supabase-types';

export function useCommunity() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const authorName = profile?.full_name || 'Anonymous Donor';
  const authorAvatarUrl = profile?.avatar_url || null;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [postsRes, requestsRes] = await Promise.all([
      supabase.from('community_posts').select('*').order('posted_at', { ascending: false }),
      supabase.from('blood_requests').select('*').order('posted_at', { ascending: false }),
    ]);

    if (postsRes.error) {
      setError(postsRes.error.message);
    } else if (requestsRes.error) {
      setError(requestsRes.error.message);
    } else {
      setPosts((postsRes.data ?? []).map(mapCommunityPost));
      setRequests((requestsRes.data ?? []).map(mapBloodRequest));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const createStoryOrAnnouncement = useCallback(
    async (title: string, body: string, type: 'story' | 'announcement'): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not authenticated' };

      const newPost: Omit<InsertCommunityPost, 'id' | 'posted_at'> = {
        type,
        author_id: userId,
        author_name: authorName,
        author_avatar_url: authorAvatarUrl,
        title,
        body,
        related_request_id: null,
      };

      const { error: insertError } = await supabase
        .from('community_posts')
        .insert(newPost);

      if (insertError) {
        return { error: insertError.message };
      }

      await fetchCommunityData();
      return { error: null };
    },
    [userId, authorName, authorAvatarUrl, fetchCommunityData]
  );

  const createBloodRequest = useCallback(
    async (
      hospital: string,
      address: string,
      bloodTypeNeeded: any,
      unitsNeeded: number,
      urgencyLevel: any,
      notes?: string
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not authenticated' };

      // 1. Insert into blood_requests
      const newRequest: Omit<InsertBloodRequest, 'id' | 'posted_at' | 'units_pledged'> = {
        hospital,
        address,
        blood_type_needed: bloodTypeNeeded,
        units_needed: unitsNeeded,
        urgency_level: urgencyLevel,
        status: 'open',
        notes: notes || null,
        posted_by: userId,
      };

      const { data: requestData, error: reqError } = await supabase
        .from('blood_requests')
        .insert(newRequest)
        .select()
        .single();

      if (reqError || !requestData) {
        return { error: reqError?.message || 'Failed to create request' };
      }

      // 2. Create corresponding community post linking to this request
      const newPost: Omit<InsertCommunityPost, 'id' | 'posted_at'> = {
        type: 'request',
        author_id: userId,
        author_name: authorName,
        author_avatar_url: authorAvatarUrl,
        title: `Blood Needed: ${bloodTypeNeeded} at ${hospital}`,
        body: notes || `Urgent request for ${unitsNeeded} units of ${bloodTypeNeeded} blood at ${hospital}.`,
        related_request_id: requestData.id,
      };

      const { error: postError } = await supabase
        .from('community_posts')
        .insert(newPost);

      if (postError) {
        // Cleanup the request if post creation fails
        await supabase.from('blood_requests').delete().eq('id', requestData.id);
        return { error: postError.message };
      }

      await fetchCommunityData();
      return { error: null };
    },
    [userId, authorName, authorAvatarUrl, fetchCommunityData]
  );

  const pledgeRequest = useCallback(
    async (requestId: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not authenticated' };

      // 1. Insert into request_responses
      const { error: pledgeError } = await supabase
        .from('request_responses')
        .insert({
          request_id: requestId,
          user_id: userId,
        });

      if (pledgeError) {
        return { error: pledgeError.message };
      }

      // 2. Increment units_pledged in blood_requests
      const { data: currentReq } = await supabase
        .from('blood_requests')
        .select('units_pledged')
        .eq('id', requestId)
        .single();

      const newPledgesCount = (currentReq?.units_pledged || 0) + 1;

      await supabase
        .from('blood_requests')
        .update({ units_pledged: newPledgesCount })
        .eq('id', requestId);

      await fetchCommunityData();
      return { error: null };
    },
    [userId, fetchCommunityData]
  );

  const getUserPledge = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('request_responses')
        .select('*')
        .eq('request_id', requestId)
        .eq('user_id', userId)
        .single();
      return !error && !!data;
    },
    [userId]
  );

  return {
    posts,
    requests,
    isLoading,
    error,
    createStoryOrAnnouncement,
    createBloodRequest,
    pledgeRequest,
    getUserPledge,
    refresh: fetchCommunityData,
  };
}
