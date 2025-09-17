import { StateCreator, StoreMutatorIdentifier } from 'zustand'
// Avoiding circular dependency - WorldbuildingStore type is defined inline
type WorldbuildingStore = any // This will be properly typed at runtime
import { optimisticSyncQueueManager } from '../../services/optimisticSyncQueue'
import { useAuthStore } from '../authStore'
import { optimisticUpdateManager, /* captureEntityState, applyRollback */ } from '../optimisticUpdates'

// Simple debounce helper
// function _debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T {
//   let timeout: NodeJS.Timeout | null = null
//   return ((...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout)
//     timeout = setTimeout(() => func(...args), wait)
//   }) as T
// }

// Enhanced sync event with optimistic update tracking
export type OptimisticSyncEvent = {
  type: 'project-modified' | 'element-modified' | 'answer-modified' | 'relationship-modified'
  projectId: string
  entityId?: string
  operation: 'create' | 'update' | 'delete'
  timestamp: Date
  optimisticUpdateId?: string
  isAutoSync?: boolean // Flag to differentiate auto-sync from user-initiated
}

// Enhanced sync event emitter
export class OptimisticSyncEventEmitter extends EventTarget {
  async emit(event: OptimisticSyncEvent, _previousState?: unknown) {
    this.dispatchEvent(new CustomEvent('sync-change', { detail: event }))
    
    // Add to sync queue if authenticated and online mode
    const { isAuthenticated, isOfflineMode } = useAuthStore.getState()
    if (isAuthenticated && !isOfflineMode) {
      const syncOperationId = await this.addToSyncQueue(event)
      
      // Link optimistic update to sync operation
      if (event.optimisticUpdateId && syncOperationId) {
        optimisticUpdateManager.linkToSyncOperation(event.optimisticUpdateId, syncOperationId)
      }
    }
  }
  
  private async addToSyncQueue(event: OptimisticSyncEvent): Promise<string | null> {
    let entity: 'project' | 'element' | 'answer' | 'relationship'
    const data: Record<string, unknown> = {}
    
    switch (event.type) {
      case 'project-modified':
        entity = 'project'
        break
      case 'element-modified':
        entity = 'element'
        break
      case 'answer-modified':
        entity = 'answer'
        break
      case 'relationship-modified':
        entity = 'relationship'
        break
    }
    
    const operation = await optimisticSyncQueueManager.addOperation({
      type: event.operation,
      entity,
      entityId: event.entityId || event.projectId,
      projectId: event.projectId,
      data,
      // Auto-sync operations use normal priority, user-initiated deletes use high
      priority: event.isAutoSync ? 'normal' : (event.operation === 'delete' ? 'high' : 'normal')
    })
    
    return operation?.id || null
  }
}

export const optimisticSyncEventEmitter = new OptimisticSyncEventEmitter()

// Type for the optimistic sync middleware
type OptimisticSyncMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs, T>
) => StateCreator<T, Mps, Mcs, T>

// Enhanced sync middleware with optimistic update tracking
export const optimisticSyncMiddleware: OptimisticSyncMiddleware = (config) => (set, get, api) =>
  config(
    ((partial: any, replace?: boolean | undefined) => {
      // Before state update - capture current state for rollback
      const prevState = get() as WorldbuildingStore
      const capturedStates = new Map<string, any>()
      
      // Perform the state update
      set(partial, replace)
      
      // After state update - detect changes and track optimistic updates
      const newState = get() as WorldbuildingStore
      
      // Detect what changed and emit sync events with optimistic tracking
      detectOptimisticChanges(prevState, newState, capturedStates)
    }) as any,
    get,
    api
  )

// Enhanced change detection with optimistic update tracking
function detectOptimisticChanges(
  prevState: WorldbuildingStore,
  newState: WorldbuildingStore,
  _capturedStates: Map<string, unknown>
) {
  // Check for project changes
  if (prevState.projects !== newState.projects) {
    // Find added projects
    const prevProjectIds = new Set(prevState.projects.map(p => p.id))
    const newProjectIds = new Set(newState.projects.map(p => p.id))
    
    // New projects
    for (const project of newState.projects) {
      if (!prevProjectIds.has(project.id)) {
        // Track optimistic update for rollback
        const updateId = optimisticUpdateManager.trackUpdate({
          type: 'create',
          entity: 'project',
          entityId: project.id,
          projectId: project.id,
          newState: project
        })
        
        optimisticSyncEventEmitter.emit({
          type: 'project-modified',
          projectId: project.id,
          operation: 'create',
          timestamp: new Date(),
          optimisticUpdateId: updateId,
          isAutoSync: true
        })
        
        // Mark project as modified in sync metadata
        const syncMetadata = newState.syncMetadata[project.id]
        if (syncMetadata) {
          newState.updateSyncMetadata(project.id, {
            syncStatus: 'offline',
            lastModified: new Date()
          })
        }
      }
    }
    
    // Modified projects
    for (const project of newState.projects) {
      const prevProject = prevState.projects.find(p => p.id === project.id)
      if (prevProject && (prevProject.name !== project.name || prevProject.description !== project.description)) {
        // Track optimistic update with previous state
        const updateId = optimisticUpdateManager.trackUpdate({
          type: 'update',
          entity: 'project',
          entityId: project.id,
          projectId: project.id,
          previousState: prevProject,
          newState: project
        })
        
        optimisticSyncEventEmitter.emit({
          type: 'project-modified',
          projectId: project.id,
          operation: 'update',
          timestamp: new Date(),
          optimisticUpdateId: updateId,
          isAutoSync: true
        })
        
        // Mark project as modified
        newState.updateSyncMetadata(project.id, {
          syncStatus: 'offline',
          lastModified: new Date()
        })
      }
    }
    
    // Deleted projects
    for (const projectId of prevProjectIds) {
      if (!newProjectIds.has(projectId)) {
        const prevProject = prevState.projects.find(p => p.id === projectId)
        
        // Track optimistic update with previous state for rollback
        const updateId = optimisticUpdateManager.trackUpdate({
          type: 'delete',
          entity: 'project',
          entityId: projectId,
          projectId: projectId,
          previousState: prevProject
        })
        
        optimisticSyncEventEmitter.emit({
          type: 'project-modified',
          projectId: projectId,
          operation: 'delete',
          timestamp: new Date(),
          optimisticUpdateId: updateId,
          isAutoSync: true
        })
      }
    }
  }
  
  // Check for element changes within each project
  for (const project of newState.projects) {
    const prevProject = prevState.projects.find(p => p.id === project.id)
    if (!prevProject) continue
    
    // Check elements
    if (prevProject.elements !== project.elements) {
      const prevElementIds = new Set(prevProject.elements.map(e => e.id))
      const newElementIds = new Set(project.elements.map(e => e.id))
      
      // New or modified elements
      for (const element of project.elements) {
        if (!prevElementIds.has(element.id)) {
          // New element - track optimistic update
          const updateId = optimisticUpdateManager.trackUpdate({
            type: 'create',
            entity: 'element',
            entityId: element.id,
            projectId: project.id,
            newState: element
          })
          
          optimisticSyncEventEmitter.emit({
            type: 'element-modified',
            projectId: project.id,
            entityId: element.id,
            operation: 'create',
            timestamp: new Date(),
            optimisticUpdateId: updateId,
            isAutoSync: true
          })
        } else {
          const prevElement = prevProject.elements.find(e => e.id === element.id)
          if (prevElement && (prevElement.name !== element.name || prevElement.category !== element.category)) {
            // Modified element - track optimistic update
            const updateId = optimisticUpdateManager.trackUpdate({
              type: 'update',
              entity: 'element',
              entityId: element.id,
              projectId: project.id,
              previousState: prevElement,
              newState: element
            })
            
            optimisticSyncEventEmitter.emit({
              type: 'element-modified',
              projectId: project.id,
              entityId: element.id,
              operation: 'update',
              timestamp: new Date(),
              optimisticUpdateId: updateId,
              isAutoSync: true
            })
          }
        }
      }
      
      // Deleted elements
      for (const elementId of prevElementIds) {
        if (!newElementIds.has(elementId)) {
          const prevElement = prevProject.elements.find(e => e.id === elementId)
          
          // Track optimistic update with previous state
          const updateId = optimisticUpdateManager.trackUpdate({
            type: 'delete',
            entity: 'element',
            entityId: elementId,
            projectId: project.id,
            previousState: prevElement
          })
          
          optimisticSyncEventEmitter.emit({
            type: 'element-modified',
            projectId: project.id,
            entityId: elementId,
            operation: 'delete',
            timestamp: new Date(),
            optimisticUpdateId: updateId,
            isAutoSync: true
          })
        }
      }
      
      // Mark project as modified if elements changed
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
    
    // Check for answer changes in elements
    let answersChanged = false
    for (const element of project.elements) {
      const prevElement = prevProject.elements.find(e => e.id === element.id)
      if (prevElement) {
        // Check if answers object has changed
        if (JSON.stringify(prevElement.answers) !== JSON.stringify(element.answers)) {
          answersChanged = true
          
          // Track optimistic update for answers
          const updateId = optimisticUpdateManager.trackUpdate({
            type: 'update',
            entity: 'answer',
            entityId: element.id, // We track by element ID for answers
            projectId: project.id,
            previousState: prevElement.answers,
            newState: element.answers
          })
          
          optimisticSyncEventEmitter.emit({
            type: 'answer-modified',
            projectId: project.id,
            entityId: element.id,
            operation: 'update',
            timestamp: new Date(),
            optimisticUpdateId: updateId,
            isAutoSync: true
          })
          
          break
        }
      }
    }
    
    if (answersChanged) {
      // Mark project as modified
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
    
    // Check for relationship changes in elements
    let relationshipsChanged = false
    for (const element of project.elements) {
      const prevElement = prevProject.elements.find(e => e.id === element.id)
      if (prevElement) {
        // Check if relationships array has changed
        if (JSON.stringify(prevElement.relationships) !== JSON.stringify(element.relationships)) {
          relationshipsChanged = true
          
          // For relationships, we need to track individual changes
          const prevRelIds = new Set((prevElement.relationships || []).map(r => r.id))
          const newRelIds = new Set((element.relationships || []).map(r => r.id))
          
          // New relationships
          for (const rel of element.relationships || []) {
            if (!prevRelIds.has(rel.id)) {
              const updateId = optimisticUpdateManager.trackUpdate({
                type: 'create',
                entity: 'relationship',
                entityId: rel.id,
                projectId: project.id,
                newState: rel
              })
              
              optimisticSyncEventEmitter.emit({
                type: 'relationship-modified',
                projectId: project.id,
                entityId: rel.id,
                operation: 'create',
                timestamp: new Date(),
                optimisticUpdateId: updateId,
                isAutoSync: true
              })
            }
          }
          
          // Deleted relationships
          for (const relId of prevRelIds) {
            if (!newRelIds.has(relId)) {
              const prevRel = prevElement.relationships?.find(r => r.id === relId)
              const updateId = optimisticUpdateManager.trackUpdate({
                type: 'delete',
                entity: 'relationship',
                entityId: relId,
                projectId: project.id,
                previousState: prevRel
              })
              
              optimisticSyncEventEmitter.emit({
                type: 'relationship-modified',
                projectId: project.id,
                entityId: relId,
                operation: 'delete',
                timestamp: new Date(),
                optimisticUpdateId: updateId,
                isAutoSync: true
              })
            }
          }
          
          break
        }
      }
    }
    
    if (relationshipsChanged) {
      // Mark project as modified
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
  }
}