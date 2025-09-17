import { createSelector } from 'reselect';
import { WorldbuildingStore } from '../rootStore';
import { Relationship, ElementCategory } from '../../types/worldbuilding';
import { RelationshipType } from '../../types/models/Relationship';
import { relationshipOptimizer } from '../../services/core/RelationshipOptimizationService';

/**
 * Memoized selectors for relationship queries
 * These selectors use reselect to cache results and only recalculate when inputs change
 */

// Base selectors
const selectProjects = (state: WorldbuildingStore) => state.projects;
const selectCurrentProjectId = (state: WorldbuildingStore) => state.currentProjectId;
const selectRelationshipMaps = (state: WorldbuildingStore) => state.relationshipMaps;

// Get current project
export const selectCurrentProject = createSelector(
  [selectProjects, selectCurrentProjectId],
  (projects, currentProjectId) => {
    if (!currentProjectId) return null;
    return projects.find(p => p.id === currentProjectId) || null;
  }
);

// Get all elements in current project
export const selectCurrentProjectElements = createSelector(
  [selectCurrentProject],
  (project) => project?.elements || []
);

// Get element by ID in current project
export const makeSelectElementById = () => createSelector(
  [selectCurrentProjectElements, (_: WorldbuildingStore, elementId: string) => elementId],
  (elements, elementId) => elements.find(e => e.id === elementId) || null
);

// Get element relationships with memoization
export const makeSelectElementRelationships = () => createSelector(
  [
    selectCurrentProjectId,
    selectRelationshipMaps,
    (_: WorldbuildingStore, elementId: string) => elementId,
    selectCurrentProjectElements
  ],
  (_currentProjectId, relationshipMaps, elementId, elements) => {
    // Try optimized lookup first
    if (relationshipMaps) {
      try {
        const { outgoing, incoming, all } = relationshipOptimizer.getElementRelationships(elementId);
        return { outgoing, incoming, all };
      } catch (e) {
        // Fall through to direct lookup
      }
    }
    
    // Fallback to direct lookup
    const element = elements.find(e => e.id === elementId);
    const outgoing = element?.relationships || [];
    
    // Find incoming relationships
    const incoming: Relationship[] = [];
    elements.forEach(el => {
      el.relationships?.forEach(rel => {
        if (rel.toId === elementId) {
          incoming.push(rel);
        }
      });
    });
    
    return {
      outgoing,
      incoming,
      all: [...outgoing, ...incoming]
    };
  }
);

// Get related elements for an element
export const makeSelectRelatedElements = () => createSelector(
  [
    selectCurrentProjectId,
    selectRelationshipMaps,
    (_: WorldbuildingStore, elementId: string) => elementId,
    selectCurrentProjectElements
  ],
  (_currentProjectId, relationshipMaps, elementId, elements) => {
    // Try optimized lookup first
    if (relationshipMaps) {
      try {
        const relatedIds = relationshipOptimizer.getRelatedElementIds(elementId);
        return elements.filter(e => relatedIds.includes(e.id));
      } catch (e) {
        // Fall through to direct lookup
      }
    }
    
    // Fallback to direct lookup
    const relatedIds = new Set<string>();
    
    elements.forEach(element => {
      element.relationships?.forEach(rel => {
        if (rel.fromId === elementId) {
          relatedIds.add(rel.toId);
        }
        if (rel.toId === elementId) {
          relatedIds.add(rel.fromId);
        }
      });
    });
    
    return elements.filter(e => relatedIds.has(e.id));
  }
);

// Get relationships by type
export const makeSelectRelationshipsByType = () => createSelector(
  [
    selectRelationshipMaps,
    (_: WorldbuildingStore, type: RelationshipType) => type,
    selectCurrentProjectElements
  ],
  (relationshipMaps, type, elements) => {
    // Try optimized lookup first
    if (relationshipMaps) {
      try {
        return relationshipOptimizer.getRelationshipsByType(type);
      } catch (e) {
        // Fall through to direct lookup
      }
    }
    
    // Fallback to direct lookup
    const relationships: Relationship[] = [];
    elements.forEach(element => {
      element.relationships?.forEach(rel => {
        if (rel.type === type) {
          relationships.push(rel);
        }
      });
    });
    
    return relationships;
  }
);

// Get relationship graph data (for visualization)
export const selectRelationshipGraphData = createSelector(
  [selectCurrentProjectElements, selectRelationshipMaps],
  (elements, relationshipMaps) => {
    // Build nodes
    const nodes = elements.map(element => ({
      id: element.id,
      name: element.name,
      category: element.category,
      completionPercentage: element.completionPercentage
    }));
    
    // Build links
    const links: Array<{
      source: string;
      target: string;
      type: string;
      description?: string;
    }> = [];
    
    // Use optimized lookup if available
    if (relationshipMaps) {
      try {
        const allRelationships = relationshipOptimizer.getAllRelationships();
        allRelationships.forEach(rel => {
          links.push({
            source: rel.fromId,
            target: rel.toId,
            type: rel.type,
            description: rel.description
          });
        });
      } catch (e) {
        // Fall through to direct lookup
      }
    } else {
      // Fallback to direct lookup
      elements.forEach(element => {
        element.relationships?.forEach(rel => {
          links.push({
            source: rel.fromId,
            target: rel.toId,
            type: rel.type,
            description: rel.description
          });
        });
      });
    }
    
    return { nodes, links };
  }
);

// Get elements by category with memoization
export const makeSelectElementsByCategory = () => createSelector(
  [
    selectCurrentProjectElements,
    (_: WorldbuildingStore, category: ElementCategory) => category
  ],
  (elements, category) => elements.filter(e => e.category === category)
);

// Get relationship statistics
export const selectRelationshipStats = createSelector(
  [selectCurrentProjectElements, selectRelationshipMaps],
  (elements, relationshipMaps) => {
    // Try to get stats from optimizer first
    if (relationshipMaps) {
      try {
        return relationshipOptimizer.getStats();
      } catch (e) {
        // Fall through to calculate manually
      }
    }
    
    // Manual calculation
    let totalRelationships = 0;
    const elementsWithRelationships = new Set<string>();
    const relationshipTypes = new Set<string>();
    
    elements.forEach(element => {
      if (element.relationships && element.relationships.length > 0) {
        elementsWithRelationships.add(element.id);
        element.relationships.forEach(rel => {
          totalRelationships++;
          relationshipTypes.add(rel.type);
          elementsWithRelationships.add(rel.toId);
        });
      }
    });
    
    return {
      totalRelationships,
      elementsWithRelationships: elementsWithRelationships.size,
      relationshipTypes: relationshipTypes.size,
      averageRelationshipsPerElement: elementsWithRelationships.size > 0
        ? totalRelationships / elementsWithRelationships.size
        : 0
    };
  }
);

// Check if two elements are related
export const makeSelectAreElementsRelated = () => createSelector(
  [
    selectRelationshipMaps,
    (_: WorldbuildingStore, _elementId1: string) => _elementId1,
    (_: WorldbuildingStore, _elementId1: string, elementId2: string) => elementId2,
    selectCurrentProjectElements
  ],
  (relationshipMaps, elementId1, elementId2, elements) => {
    // Try optimized lookup first
    if (relationshipMaps) {
      try {
        return relationshipOptimizer.areElementsRelated(elementId1, elementId2);
      } catch (e) {
        // Fall through to direct lookup
      }
    }
    
    // Fallback to direct lookup
    for (const element of elements) {
      if (element.relationships) {
        for (const rel of element.relationships) {
          if ((rel.fromId === elementId1 && rel.toId === elementId2) ||
              (rel.fromId === elementId2 && rel.toId === elementId1)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
);

// Get relationship path between two elements (useful for graph traversal)
export const makeSelectRelationshipPath = () => createSelector(
  [
    selectRelationshipMaps,
    (_: WorldbuildingStore, _fromId: string) => _fromId,
    (_: WorldbuildingStore, _fromId: string, _toId: string) => _toId,
    (_: WorldbuildingStore, _fromId: string, _toId: string, maxDepth?: number) => maxDepth || 5
  ],
  (relationshipMaps, fromId, toId, maxDepth) => {
    // This should only use optimized lookup since path finding is expensive
    if (relationshipMaps) {
      try {
        return relationshipOptimizer.getRelationshipPath(fromId, toId, maxDepth);
      } catch (e) {
        return null;
      }
    }
    
    // Don't implement fallback for expensive operations
    return null;
  }
);