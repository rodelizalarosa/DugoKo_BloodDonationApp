import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/supabase-types';

export function useRBAC() {
  const { userRole, isAdmin, isModerator } = useAuth();

  return {
    userRole,
    isAdmin,
    isModerator,
    /**
     * Check if the user is authorized to perform a specific action.
     */
    can: (action: 'manage_events' | 'manage_centers' | 'moderate_content' | 'manage_users'): boolean => {
      if (userRole === 'admin') return true;
      if (userRole === 'moderator') {
        return action === 'moderate_content';
      }
      return false; // donor
    },
  };
}
