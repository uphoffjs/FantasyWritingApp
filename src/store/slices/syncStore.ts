import { StateCreator } from 'zustand';
import type { SyncStatus } from '../../store/authStore';

// * Sync metadata for tracking cloud sync status
export interface SyncMetadata {
  projectId: string;
  lastSyncedAt: Date | null;
  lastModified?: Date;
  syncStatus: SyncStatus;
  cloudId?: string; // Supabase ID after migration
}

export interface SyncSlice {
  // State
  syncMetadata: Record<string, SyncMetadata>; // projectId -> metadata
  lastSyncAttempt: Date | null;
  
  // * Sync actions
  updateProjectSyncStatus: (projectId: string, status: SyncStatus, cloudId?: string) => void;
  markProjectAsSynced: (projectId: string, cloudId: string) => void;
  markProjectAsModified: (projectId: string) => void;
  getSyncMetadata: (projectId: string) => SyncMetadata | null;
  updateSyncMetadata: (projectId: string, updates: Partial<SyncMetadata>) => void;
  updateProjectCloudId: (projectId: string, cloudId: string) => void;
  clearSyncMetadata: () => void;
}

export const createSyncSlice: StateCreator<
  SyncSlice,
  [],
  [],
  SyncSlice
> = (set, get) => ({
  // State
  syncMetadata: {},
  lastSyncAttempt: null,

  // * Sync actions
  updateProjectSyncStatus: (projectId, status, cloudId) => {
    set((state) => ({
      syncMetadata: {
        ...state.syncMetadata,
        [projectId]: {
          projectId,
          syncStatus: status,
          lastSyncedAt: status === 'synced' ? new Date() : state.syncMetadata[projectId]?.lastSyncedAt || null,
          cloudId: cloudId || state.syncMetadata[projectId]?.cloudId
        }
      },
      lastSyncAttempt: new Date()
    }));
  },
  
  markProjectAsSynced: (projectId, cloudId) => {
    set((state) => ({
      syncMetadata: {
        ...state.syncMetadata,
        [projectId]: {
          projectId,
          syncStatus: 'synced',
          lastSyncedAt: new Date(),
          cloudId
        }
      }
    }));
  },
  
  markProjectAsModified: (projectId) => {
    set((state) => {
      const currentMetadata = state.syncMetadata[projectId];
      if (!currentMetadata || currentMetadata.syncStatus === 'syncing') {
        return state; // Don't mark as modified if currently syncing
      }
      
      return {
        syncMetadata: {
          ...state.syncMetadata,
          [projectId]: {
            ...currentMetadata,
            syncStatus: 'offline' // Will need to sync
          }
        }
      };
    });
  },
  
  getSyncMetadata: (projectId) => {
    return get().syncMetadata[projectId] || null;
  },
  
  updateSyncMetadata: (projectId, updates) => {
    set((state) => ({
      syncMetadata: {
        ...state.syncMetadata,
        [projectId]: {
          ...state.syncMetadata[projectId],
          projectId,
          ...updates,
          lastModified: updates.lastModified || new Date()
        }
      }
    }));
  },
  
  updateProjectCloudId: (projectId, cloudId) => {
    set((state) => ({
      syncMetadata: {
        ...state.syncMetadata,
        [projectId]: {
          ...state.syncMetadata[projectId],
          projectId,
          cloudId,
          syncStatus: 'synced',
          lastSyncedAt: new Date()
        }
      }
    }));
  },
  
  clearSyncMetadata: () => {
    set({ syncMetadata: {}, lastSyncAttempt: null });
  }
});