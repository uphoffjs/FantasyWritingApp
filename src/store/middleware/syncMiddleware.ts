import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { WorldbuildingStore } from "@/store/rootStore"
import { syncQueueManager } from '../../services/syncQueue'
import { useAuthStore } from '../authStore'

// * Sync event types
export type SyncEvent = {
  type: 'project-modified' | 'element-modified' | 'answer-modified' | 'relationship-modified'
  projectId: string
  entityId?: string
  operation: 'create' | 'update' | 'delete'
  timestamp: Date
}

// * Sync event emitter
export class SyncEventEmitter extends EventTarget {
  emit(event: SyncEvent) {
    this.dispatchEvent(new CustomEvent('sync-change', { detail: event }))
    
    // ! SECURITY: * Add to sync queue if authenticated and online mode
    const { isAuthenticated, isOfflineMode } = useAuthStore.getState()
    if (isAuthenticated && !isOfflineMode) {
      this.addToSyncQueue(event)
    }
  }
  
  private async addToSyncQueue(event: SyncEvent) {
    let entity: 'project' | 'element' | 'answer' | 'relationship'
    const data: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    
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
    
    await syncQueueManager.addOperation({
      type: event.operation,
      entity,
      entityId: event.entityId || event.projectId,
      projectId: event.projectId,
      data,
      priority: event.operation === 'delete' ? 'high' : 'normal'
    })
  }
}

export const syncEventEmitter = new SyncEventEmitter()

// * Type for the sync middleware
type SyncMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs, T>
) => StateCreator<T, Mps, Mcs, T>

// * Sync middleware implementation
export const syncMiddleware: SyncMiddleware = (config) => (set, get, api) =>
  config(
    ((partial: any, replace?: boolean | undefined) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // * Before state update - capture current state
      const prevState = get() as WorldbuildingStore
      
      // * Perform the state update
      set(partial, replace)
      
      // * After state update - detect changes
      const newState = get() as WorldbuildingStore
      
      // * Detect what changed and emit sync events
      detectChanges(prevState, newState)
    }) as any,
    get,
    api
  )

// * Change detection logic
function detectChanges(prevState: WorldbuildingStore, newState: WorldbuildingStore) {
  // * Check for project changes
  if (prevState.projects !== newState.projects) {
    // * Find added projects
    const prevProjectIds = new Set(prevState.projects.map(p => p.id))
    const newProjectIds = new Set(newState.projects.map(p => p.id))
    
    // * New projects
    for (const project of newState.projects) {
      if (!prevProjectIds.has(project.id)) {
        syncEventEmitter.emit({
          type: 'project-modified',
          projectId: project.id,
          operation: 'create',
          timestamp: new Date()
        })
        
        // * Mark project as modified in sync metadata
        const syncMetadata = newState.syncMetadata[project.id]
        if (syncMetadata) {
          newState.updateSyncMetadata(project.id, {
            syncStatus: 'offline',
            lastModified: new Date()
          })
        }
      }
    }
    
    // * Modified projects
    for (const project of newState.projects) {
      const prevProject = prevState.projects.find(p => p.id === project.id)
      if (prevProject && (prevProject.name !== project.name || prevProject.description !== project.description)) {
        syncEventEmitter.emit({
          type: 'project-modified',
          projectId: project.id,
          operation: 'update',
          timestamp: new Date()
        })
        
        // * Mark project as modified
        newState.updateSyncMetadata(project.id, {
          syncStatus: 'offline',
          lastModified: new Date()
        })
      }
    }
    
    // * Deleted projects
    for (const projectId of prevProjectIds) {
      if (!newProjectIds.has(projectId)) {
        syncEventEmitter.emit({
          type: 'project-modified',
          projectId: projectId,
          operation: 'delete',
          timestamp: new Date()
        })
      }
    }
  }
  
  // * Check for element changes within each project
  for (const project of newState.projects) {
    const prevProject = prevState.projects.find(p => p.id === project.id)
    if (!prevProject) continue
    
    // * Check elements
    if (prevProject.elements !== project.elements) {
      const prevElementIds = new Set(prevProject.elements.map(e => e.id))
      const newElementIds = new Set(project.elements.map(e => e.id))
      
      // * New or modified elements
      for (const element of project.elements) {
        if (!prevElementIds.has(element.id)) {
          syncEventEmitter.emit({
            type: 'element-modified',
            projectId: project.id,
            entityId: element.id,
            operation: 'create',
            timestamp: new Date()
          })
        } else {
          const prevElement = prevProject.elements.find(e => e.id === element.id)
          if (prevElement && (prevElement.name !== element.name || prevElement.category !== element.category)) {
            syncEventEmitter.emit({
              type: 'element-modified',
              projectId: project.id,
              entityId: element.id,
              operation: 'update',
              timestamp: new Date()
            })
          }
        }
      }
      
      // * Deleted elements
      for (const elementId of prevElementIds) {
        if (!newElementIds.has(elementId)) {
          syncEventEmitter.emit({
            type: 'element-modified',
            projectId: project.id,
            entityId: elementId,
            operation: 'delete',
            timestamp: new Date()
          })
        }
      }
      
      // * Mark project as modified if elements changed
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
    
    // * Check for answer changes in elements
    let answersChanged = false
    for (const element of project.elements) {
      const prevElement = prevProject.elements.find(e => e.id === element.id)
      if (prevElement) {
        // * Check if answers object has changed
        if (JSON.stringify(prevElement.answers) !== JSON.stringify(element.answers)) {
          answersChanged = true
          break
        }
      }
    }
    
    if (answersChanged) {
      syncEventEmitter.emit({
        type: 'answer-modified',
        projectId: project.id,
        operation: 'update',
        timestamp: new Date()
      })
      
      // * Mark project as modified
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
    
    // * Check for relationship changes in elements
    let relationshipsChanged = false
    for (const element of project.elements) {
      const prevElement = prevProject.elements.find(e => e.id === element.id)
      if (prevElement) {
        // * Check if relationships array has changed
        if (JSON.stringify(prevElement.relationships) !== JSON.stringify(element.relationships)) {
          relationshipsChanged = true
          break
        }
      }
    }
    
    if (relationshipsChanged) {
      syncEventEmitter.emit({
        type: 'relationship-modified',
        projectId: project.id,
        operation: 'update',
        timestamp: new Date()
      })
      
      // * Mark project as modified
      newState.updateSyncMetadata(project.id, {
        syncStatus: 'offline',
        lastModified: new Date()
      })
    }
  }
}