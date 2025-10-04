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
      
      // * First fetch existing projects from Supabase
      fetchFromSupabase().then(() => {
        
        // * Then sync any local changes
        if (projects.length > 0) {
          syncWithSupabase().then(() => {
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
      syncWithSupabase().catch(error => {
        console.error('Auto-sync error:', error);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, user?.id, syncWithSupabase]);
  
  // * Manual sync function
  const manualSync = async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    
    try {
      await fetchFromSupabase();
      await syncWithSupabase();
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