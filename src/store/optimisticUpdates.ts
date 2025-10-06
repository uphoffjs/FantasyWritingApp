/* eslint-disable @typescript-eslint/no-explicit-any */
// ! Optimistic update system requires flexible typing for various entity types

import { Project, WorldElement, Relationship } from '../types/models'

// * Types for tracking optimistic updates
export interface OptimisticUpdate {
  id: string // Unique ID for this update
  timestamp: Date
  type: 'create' | 'update' | 'delete'
  entity: 'project' | 'element' | 'answer' | 'relationship'
  entityId: string
  projectId: string
  previousState?: unknown // For rollback
  newState?: unknown
  syncOperationId?: string // Links to sync queue operation
}

// * Rollback data structure
export interface RollbackData {
  updateId: string
  type: 'create' | 'update' | 'delete'
  entity: 'project' | 'element' | 'answer' | 'relationship'
  entityId: string
  projectId: string
  previousState?: unknown
}

// * Optimistic update manager
export class OptimisticUpdateManager {
  private updates: Map<string, OptimisticUpdate> = new Map()
  private operationToUpdateMap: Map<string, string> = new Map() // syncOperationId -> updateId

  // * Track an optimistic update
  trackUpdate(update: Omit<OptimisticUpdate, 'id' | 'timestamp'>): string {
    const updateId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullUpdate: OptimisticUpdate = {
      id: updateId,
      timestamp: new Date(),
      ...update
    }
    
    this.updates.set(updateId, fullUpdate)
    
    if (update.syncOperationId) {
      this.operationToUpdateMap.set(update.syncOperationId, updateId)
    }
    
    return updateId
  }

  // * Link an update to a sync operation
  linkToSyncOperation(updateId: string, syncOperationId: string) {
    const update = this.updates.get(updateId)
    if (update) {
      update.syncOperationId = syncOperationId
      this.operationToUpdateMap.set(syncOperationId, updateId)
    }
  }

  // * Get rollback data for a sync operation
  getRollbackData(syncOperationId: string): RollbackData | null {
    const updateId = this.operationToUpdateMap.get(syncOperationId)
    if (!updateId) return null
    
    const update = this.updates.get(updateId)
    if (!update) return null
    
    return {
      updateId: update.id,
      type: update.type,
      entity: update.entity,
      entityId: update.entityId,
      projectId: update.projectId,
      previousState: update.previousState
    }
  }

  // * Complete an update (sync succeeded)
  completeUpdate(syncOperationId: string) {
    const updateId = this.operationToUpdateMap.get(syncOperationId)
    if (updateId) {
      this.updates.delete(updateId)
      this.operationToUpdateMap.delete(syncOperationId)
    }
  }

  // // DEPRECATED: * Clear old updates (cleanup)
  clearOldUpdates(maxAgeMs: number = 3600000) { // 1 hour default
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    
    for (const [id, update] of this.updates.entries()) {
      if (update.timestamp < cutoffTime) {
        this.updates.delete(id)
        if (update.syncOperationId) {
          this.operationToUpdateMap.delete(update.syncOperationId)
        }
      }
    }
  }

  // * Get all pending updates for a project
  getPendingUpdates(projectId: string): OptimisticUpdate[] {
    const updates: OptimisticUpdate[] = []
    
    for (const update of this.updates.values()) {
      if (update.projectId === projectId) {
        updates.push(update)
      }
    }
    
    return updates.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // * Clear all updates (for logout/reset)
  clearAll() {
    this.updates.clear()
    this.operationToUpdateMap.clear()
  }
}

// * Global instance
export const optimisticUpdateManager = new OptimisticUpdateManager()

// * Helper to capture state before modification
export function captureEntityState(
  entity: 'project' | 'element' | 'answer' | 'relationship',
  entityId: string,
  state: any
): unknown {
  switch (entity) {
    case 'project': {
      const projects = (state as any).projects as Project[]
      const project = projects?.find((p: Project) => p.id === entityId)
      return project ? { ...project } : null
    }
    case 'element': {
      const projects = (state as any).projects as Project[]
      for (const project of projects || []) {
        const element = project.elements?.find((e: WorldElement) => e.id === entityId)
        if (element) return { ...element }
      }
      return null
    }
    case 'answer': {
      // TODO: * For answers, we need to capture the entire answers object from the element
      const projects = (state as any).projects as Project[]
      for (const project of projects || []) {
        for (const element of project.elements || []) {
          if (element.id === entityId) {
            return { ...element.answers }
          }
        }
      }
      return null
    }
    case 'relationship': {
      // * Relationships are stored in elements
      const projects = (state as any).projects as Project[]
      for (const project of projects || []) {
        for (const element of project.elements || []) {
          const relationship = element.relationships?.find((r: Relationship) => r.id === entityId)
          if (relationship) return { ...relationship }
        }
      }
      return null
    }
    default:
      return null
  }
}

// * Helper to apply rollback
export function applyRollback(
  rollbackData: RollbackData,
  setState: (fn: (state: any) => any) => void
) {
  setState((state: any) => {
    switch (rollbackData.entity) {
      case 'project': {
        if (rollbackData.type === 'create') {
          // * Remove the created project
          return {
            ...state,
            projects: (state.projects || []).filter((p: Project) => p.id !== rollbackData.entityId),
            currentProjectId: state.currentProjectId === rollbackData.entityId ? null : state.currentProjectId
          }
        } else if (rollbackData.type === 'update' && rollbackData.previousState) {
          // * Restore previous state
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) =>
              p.id === rollbackData.entityId ? rollbackData.previousState as Project : p
            )
          }
        } else if (rollbackData.type === 'delete' && rollbackData.previousState) {
          // Re-add deleted project
          return {
            ...state,
            projects: [...(state.projects || []), rollbackData.previousState as Project]
          }
        }
        break
      }
      
      case 'element': {
        if (rollbackData.type === 'create') {
          // * Remove created element
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).filter((e: WorldElement) => e.id !== rollbackData.entityId)
            }))
          }
        } else if (rollbackData.type === 'update' && rollbackData.previousState) {
          // * Restore previous element state
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).map((e: WorldElement) =>
                e.id === rollbackData.entityId ? rollbackData.previousState as WorldElement : e
              )
            }))
          }
        } else if (rollbackData.type === 'delete' && rollbackData.previousState) {
          // Re-add deleted element
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) =>
              p.id === rollbackData.projectId
                ? { ...p, elements: [...(p.elements || []), rollbackData.previousState as WorldElement] }
                : p
            )
          }
        }
        break
      }
      
      case 'answer': {
        // * For answers, restore the entire answers object on the element
        if (rollbackData.previousState) {
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).map((e: WorldElement) =>
                e.id === rollbackData.entityId
                  ? { ...e, answers: rollbackData.previousState as Record<string, any> }
                  : e
              )
            }))
          }
        }
        break
      }
      
      case 'relationship': {
        // * Handle relationship rollbacks
        if (rollbackData.type === 'create') {
          // * Remove created relationship
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).map((e: WorldElement) => ({
                ...e,
                relationships: (e.relationships || []).filter((r: Relationship) => r.id !== rollbackData.entityId)
              }))
            }))
          }
        } else if (rollbackData.type === 'update' && rollbackData.previousState) {
          // * Restore previous relationship state
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).map((e: WorldElement) => ({
                ...e,
                relationships: (e.relationships || []).map((r: Relationship) =>
                  r.id === rollbackData.entityId ? rollbackData.previousState as Relationship : r
                )
              }))
            }))
          }
        } else if (rollbackData.type === 'delete' && rollbackData.previousState) {
          // Re-add deleted relationship
          const relationship = rollbackData.previousState as Relationship
          return {
            ...state,
            projects: (state.projects || []).map((p: Project) => ({
              ...p,
              elements: (p.elements || []).map((e: WorldElement) =>
                e.id === ((relationship as any).sourceElementId || relationship.fromId)
                  ? { ...e, relationships: [...(e.relationships || []), relationship] }
                  : e
              )
            }))
          }
        }
        break
      }
    }
    
    return state
  })
}