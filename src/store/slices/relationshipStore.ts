/* eslint-disable @typescript-eslint/no-explicit-any */
// * Relationship store requires flexible typing for dynamic relationship data

import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Relationship } from '../../types/worldbuilding';
import { ProjectSlice } from './projectStore';
import {
  relationshipOptimizationService as relationshipOptimizer,
  RelationshipMaps
} from '../../services/core/RelationshipOptimizationService';

export interface RelationshipSlice {
  // ! PERFORMANCE: * Relationship optimization
  relationshipMaps: RelationshipMaps | null;
  
  // * Relationship actions
  addRelationship: (projectId: string, relationship: Omit<Relationship, 'id'>) => void;
  removeRelationship: (projectId: string, relationshipId: string) => void;
  getElementRelationships: (projectId: string, elementId: string) => Relationship[];
  getRelatedElements: (projectId: string, elementId: string) => string[];
  
  // ! PERFORMANCE: * Optimization actions
  rebuildRelationshipIndexes: (projectId: string) => void;
  getRelationshipsByType: (projectId: string, type: string) => Relationship[];
  areElementsRelated: (projectId: string, elementId1: string, elementId2: string) => boolean;
}

// * Create a combined interface for slices that depend on each other
interface RelationshipStoreWithProject extends RelationshipSlice, ProjectSlice {}

export const createRelationshipSlice: StateCreator<
  RelationshipStoreWithProject,
  [],
  [],
  RelationshipSlice
> = (set, get) => ({
  // ! PERFORMANCE: * Initialize optimization state
  relationshipMaps: null,
  
  // * Relationship actions
  addRelationship: (projectId, relationship) => {
    const newRelationship: Relationship = {
      ...relationship,
      id: uuidv4(),
      createdAt: new Date()
    };

    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              elements: project.elements.map((element) => {
                if (element.id === relationship.fromId) {
                  return {
                    ...element,
                    relationships: [...(element.relationships || []), newRelationship]
                  };
                }
                return element;
              }),
              updatedAt: new Date()
            }
          : project
      )
    }));
    
    // * Rebuild indexes after adding relationship
    get().rebuildRelationshipIndexes(projectId);
  },

  removeRelationship: (projectId, relationshipId) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              elements: project.elements.map((element) => ({
                ...element,
                relationships: (element.relationships || []).filter((r) => r.id !== relationshipId)
              })),
              updatedAt: new Date()
            }
          : project
      )
    }));
    
    // * Rebuild indexes after removing relationship
    get().rebuildRelationshipIndexes(projectId);
  },

  getElementRelationships: (projectId, elementId) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return [];
    
    // * Try to use optimized lookup if indexes are built
    if (state.currentProjectId === projectId && state.relationshipMaps) {
      try {
        const { all } = relationshipOptimizer.getElementRelationships(elementId);
        return all;
      } catch (e) {
        // * Fall back to direct lookup if indexes not ready
      }
    }
    
    // * Fallback to direct lookup
    const element = project.elements.find((e) => e.id === elementId);
    if (!element) return [];
    
    return element.relationships || [];
  },

  getRelatedElements: (projectId, elementId) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return [];
    
    // * Try to use optimized lookup if indexes are built
    if (state.currentProjectId === projectId && state.relationshipMaps) {
      try {
        return relationshipOptimizer.getRelatedElementIds(elementId);
      } catch (e) {
        // * Fall back to O(n²) lookup if indexes not ready
      }
    }
    
    // * Fallback to O(n²) lookup
    const relatedIds: string[] = [];
    
    // * Get all relationships where this element is involved
    project.elements.forEach(element => {
      (element.relationships || []).forEach(rel => {
        if (rel.fromId === elementId) {
          relatedIds.push(rel.toId);
        }
        if (rel.toId === elementId) {
          relatedIds.push(rel.fromId);
        }
      });
    });
    
    // * Return unique element IDs
    return [...new Set(relatedIds)];
  },
  
  // ! PERFORMANCE: * New optimization actions
  rebuildRelationshipIndexes: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    
    // ! PERFORMANCE: * Build indexes using optimization service
    const maps = relationshipOptimizer.buildIndexes(project.elements);
    
    // * Update store state with new indexes
    set({ 
      relationshipMaps: maps 
    });
  },
  
  getRelationshipsByType: (projectId, type) => {
    const state = get();
    
    // * Ensure we're working with the current project
    if (state.currentProjectId === projectId && state.relationshipMaps) {
      try {
        return relationshipOptimizer.getRelationshipsByType(type as any);
      } catch (e) {
        // * Fall back if indexes not ready
      }
    }
    
    // * Fallback to direct search
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return [];
    
    const relationships: Relationship[] = [];
    project.elements.forEach(element => {
      (element.relationships || []).forEach(rel => {
        if (rel.type === type) {
          relationships.push(rel);
        }
      });
    });
    
    return relationships;
  },
  
  areElementsRelated: (projectId, elementId1, elementId2) => {
    const state = get();
    
    // * Use optimized lookup if available
    if (state.currentProjectId === projectId && state.relationshipMaps) {
      try {
        return relationshipOptimizer.areElementsRelated(elementId1, elementId2);
      } catch (e) {
        // * Fall back if indexes not ready
      }
    }
    
    // * Fallback to direct search
    const relatedIds = get().getRelatedElements(projectId, elementId1);
    return relatedIds.includes(elementId2);
  }
});