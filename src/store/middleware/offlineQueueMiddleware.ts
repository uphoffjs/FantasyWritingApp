import { StateCreator } from 'zustand';
import { offlineQueueService } from '../../services/offlineQueue';
import { useNetworkStatus } from '../../services/networkStatus';
import type { WorldbuildingStore } from '../rootStore';

/**
 * Offline Queue Middleware
 * Automatically queues operations when offline
 */
export const offlineQueueMiddleware = 
  <T extends WorldbuildingStore>(
    config: StateCreator<T>
  ): StateCreator<T> => 
  (set, get, api) => {
    // Initialize offline queue when store is created
    offlineQueueService.initialize();

    // Create the base store
    const baseStore = config(
      (_partial, _replace) => {
        // Wrap the set function to intercept state changes
        const wrappedSet = (nextState: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
          const state = get();
          const newState = typeof nextState === 'function' ? nextState(state) : nextState;
          
          // Call the original set
          set(nextState, replace);
          
          // After state is set, check if we need to queue operations
          queueOperationsIfOffline(state, newState as Partial<T>);
        };

        return wrappedSet as typeof set;
      },
      get,
      api
    );

    // Enhance store with offline-aware actions
    return {
      ...baseStore,
      
      // Override createProject to queue when offline
      createProject: async (name: string, description: string) => {
        const project = await baseStore.createProject(name, description);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueProjectOperation('create', project.id, project);
        }
        
        return project;
      },
      
      // Override updateProject to queue when offline
      updateProject: async (projectId: string, updates: any) => {
        await baseStore.updateProject(projectId, updates);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueProjectOperation('update', projectId, updates);
        }
      },
      
      // Override deleteProject to queue when offline
      deleteProject: async (projectId: string) => {
        await baseStore.deleteProject(projectId);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueProjectOperation('delete', projectId);
        }
      },
      
      // Override createElement to queue when offline
      createElement: async (projectId: string, name: string, category: any, templateId?: string) => {
        const element = await baseStore.createElement(projectId, name, category, templateId);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueElementOperation('create', projectId, element.id, element);
        }
        
        return element;
      },
      
      // Override updateElement to queue when offline
      updateElement: async (projectId: string, elementId: string, updates: any) => {
        await baseStore.updateElement(projectId, elementId, updates);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueElementOperation('update', projectId, elementId, updates);
        }
      },
      
      // Override deleteElement to queue when offline
      deleteElement: async (projectId: string, elementId: string) => {
        await baseStore.deleteElement(projectId, elementId);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueElementOperation('delete', projectId, elementId);
        }
      },
      
      // Override updateAnswer to queue when offline
      updateAnswer: (projectId: string, elementId: string, questionId: string, value: any) => {
        baseStore.updateAnswer(projectId, elementId, questionId, value);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueAnswerOperation(projectId, elementId, questionId, value);
        }
      },
      
      // Override addRelationship to queue when offline
      addRelationship: (projectId: string, relationship: any) => {
        baseStore.addRelationship(projectId, relationship);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          const relationshipWithId = { ...relationship, id: relationship.id || Date.now().toString() };
          offlineQueueService.queueRelationshipOperation('create', projectId, relationshipWithId.id, relationship);
        }
      },
      
      // Override removeRelationship to queue when offline
      removeRelationship: (projectId: string, relationshipId: string) => {
        baseStore.removeRelationship(projectId, relationshipId);
        
        // Queue if offline
        const { isOnline } = useNetworkStatus.getState();
        if (!isOnline) {
          offlineQueueService.queueRelationshipOperation('delete', projectId, relationshipId);
        }
      }
    };
  };

/**
 * Helper to queue operations based on state changes
 */
function queueOperationsIfOffline<T extends WorldbuildingStore>(
  oldState: T,
  newState: Partial<T>
) {
  const { isOnline } = useNetworkStatus.getState();
  
  // Only queue if offline
  if (isOnline) return;
  
  // Detect changes and queue appropriate operations
  // This is a backup mechanism in case the action overrides miss something
  
  // Check for project changes
  if (newState.projects && oldState.projects) {
    const oldProjectIds = new Set(oldState.projects.map(p => p.id));
    const newProjects = newState.projects || [];
    
    // Check for new projects
    newProjects.forEach(project => {
      if (!oldProjectIds.has(project.id)) {
        console.log('[OfflineQueue] Detected new project:', project.id);
      }
    });
  }
}