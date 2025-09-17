import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { v4 as uuidv4 } from 'uuid';
import { optimisticSyncMiddleware } from './middleware/optimisticSyncMiddleware';
import { performanceMiddleware } from './middleware/performanceMiddleware';
import { searchService } from '../services/searchService';
import { searchCache } from '../utils/cache';
// Images removed from MVP - no longer importing ImageWithCaption

// Import all slices
import { ProjectSlice, createProjectSlice } from './slices/projectStore';
import { ElementSlice, createElementSlice } from './slices/elementStore';
import { RelationshipSlice, createRelationshipSlice } from './slices/relationshipStore';
import { UISlice, createUISlice } from './slices/uiStore';
import { SearchSlice, createSearchSlice } from './slices/searchStore';
import { SyncSlice, createSyncSlice } from './slices/syncStore';
import { AsyncSlice, createAsyncSlice } from './slices/asyncStore';
// import { relationshipOptimizer } from '../services/core/RelationshipOptimizationService';

// Combine all slice interfaces
export interface WorldbuildingStore extends ProjectSlice, ElementSlice, RelationshipSlice, UISlice, SearchSlice, SyncSlice, AsyncSlice {}

// Create the root store with proper typing
export const useWorldbuildingStore = create<WorldbuildingStore>()(
  // performanceMiddleware(
    // optimisticSyncMiddleware(
      persist(
      (set, get, api) => ({
        // Compose all slices with proper typing
        ...createProjectSlice(set as any, get as any, api as any),
        ...createElementSlice(set as any, get as any, api as any),
        ...createRelationshipSlice(set as any, get as any, api as any),
        ...createUISlice(set as any, get as any, api as any),
        ...createSearchSlice(set as any, get as any, api as any),
        ...createSyncSlice(set as any, get as any, api as any),
        ...createAsyncSlice(set as any, get as any, api as any),
        
        // Override actions that need to trigger sync
        updateProject: async (projectId: string, updates: any) => {
          await createProjectSlice(set as any, get as any, api as any).updateProject(projectId, updates);
          // Mark project as modified for sync
          (get() as WorldbuildingStore).markProjectAsModified(projectId);
        },
        
        createElement: async (projectId: string, name: string, category: any, templateId?: string) => {
          const element = await createElementSlice(set as any, get as any, api as any).createElement(projectId, name, category, templateId);
          // Mark project as modified for sync
          (get() as WorldbuildingStore).markProjectAsModified(projectId);
          return element;
        },
        
        updateElement: async (projectId: string, elementId: string, updates: any) => {
          await createElementSlice(set as any, get as any, api as any).updateElement(projectId, elementId, updates);
          // Mark project as modified for sync
          (get() as WorldbuildingStore).markProjectAsModified(projectId);
        },
        
        deleteElement: async (projectId: string, elementId: string) => {
          await createElementSlice(set as any, get as any, api as any).deleteElement(projectId, elementId);
          // Mark project as modified for sync
          (get() as WorldbuildingStore).markProjectAsModified(projectId);
        }
      }),
      {
        name: 'worldbuilding-storage',
        version: 2, // Increment version for type system migration
        migrate: (state: any, _version: number) => {
          // Version 1: Image migration (removed - images not in MVP)
          // Version 2: Type system migration (handled by separate migration script)
          return state;
        }
      }
    )
  // ) as any
  // ) as any
);

// Subscribe to store changes to update search index
useWorldbuildingStore.subscribe((state, prevState) => {
  if (state.projects !== prevState.projects) {
    // Update search index whenever projects change
    searchService.updateSearchIndex(state.projects);
    // Clear search cache when index is updated
    searchCache.clear();
  }
});

// Initialize search index with existing data on store creation
const initialState = useWorldbuildingStore.getState();
if (initialState.projects.length > 0) {
  searchService.updateSearchIndex(initialState.projects);
}