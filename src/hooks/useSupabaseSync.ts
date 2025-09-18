import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorldbuildingStore } from '../store/worldbuildingStore';

export const useSupabaseSync = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    syncWithSupabase, 
    fetchFromSupabase,
    projects,
    lastSyncAttempt
  } = useWorldbuildingStore();
  
  // ! SECURITY: * Sync on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('User authenticated, fetching projects from Supabase');
      
      // * First fetch existing projects from Supabase
      fetchFromSupabase().then(() => {
        console.log('Projects fetched from Supabase');
        
        // * Then sync any local changes
        if (projects.length > 0) {
          syncWithSupabase().then(() => {
            console.log('Local projects synced to Supabase');
          }).catch(error => {
            console.error('Error syncing to Supabase:', error);
          });
        }
      }).catch(error => {
        console.error('Error fetching from Supabase:', error);
      });
    }
  }, [isAuthenticated, user?.id]); // Only re-run when auth state changes
  
  // Auto-sync periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    const syncInterval = setInterval(() => {
      console.log('Auto-syncing with Supabase');
      syncWithSupabase().catch(error => {
        console.error('Auto-sync error:', error);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, user?.id, syncWithSupabase]);
  
  // * Manual sync function
  const manualSync = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated, cannot sync');
      return;
    }
    
    try {
      console.log('Manual sync triggered');
      await fetchFromSupabase();
      await syncWithSupabase();
      console.log('Manual sync completed');
    } catch (error) {
      console.error('Manual sync error:', error);
      throw error;
    }
  };
  
  return {
    manualSync,
    lastSyncAttempt,
    isSyncing: false // Could be enhanced with loading state
  };
};

export default useSupabaseSync;