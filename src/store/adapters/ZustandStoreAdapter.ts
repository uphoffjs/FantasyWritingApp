import { 
  IProjectStore, 
  IElementStore, 
  IRelationshipStore, 
  IElementProvider 
} from '../../services/core';
import { 
  Project, 
  WorldElement, 
  Relationship,
  // ElementCategory 
} from '../../types/models';
import { WorldbuildingStore } from "@/store/rootStore";

/**
 * Adapter to make Zustand store compatible with service interfaces
 */
export class ZustandStoreAdapter implements IProjectStore, IElementStore, IRelationshipStore, IElementProvider {
  constructor(private store: () => WorldbuildingStore) {}

  // IProjectStore implementation
  get projects(): Project[] {
    return this.store().projects;
  }

  getProject(id: string): Project | null {
    return this.store().projects.find(p => p.id === id) || null;
  }

  createProject(project: Project): void {
    const store = this.store();
    // Use existing Zustand method but with prepared project object
    store.projects.push(project);
  }

  updateProject(id: string, updates: Partial<Project>): void {
    this.store().updateProject(id, updates);
  }

  deleteProject(id: string): void {
    this.store().deleteProject(id);
  }

  // IElementStore implementation
  getElementById(projectId: string, elementId: string): WorldElement | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    return project.elements.find(e => e.id === elementId) || null;
  }

  getElementsByProject(projectId: string): WorldElement[] {
    const project = this.getProject(projectId);
    return project ? project.elements : [];
  }

  createElement(projectId: string, element: WorldElement): void {
    const store = this.store();
    const project = this.getProject(projectId);
    if (project) {
      project.elements.push(element);
      store.updateProject(projectId, { elements: [...project.elements] });
    }
  }

  updateElement(projectId: string, elementId: string, updates: Partial<WorldElement>): void {
    this.store().updateElement(projectId, elementId, updates);
  }

  deleteElement(projectId: string, elementId: string): void {
    this.store().deleteElement(projectId, elementId);
  }

  // IRelationshipStore implementation
  get relationships(): Relationship[] {
    // Collect all relationships from all projects
    const allRelationships: Relationship[] = [];
    this.store().projects.forEach(project => {
      project.elements.forEach(_element => {
        // Note: This assumes relationships are stored within elements
        // May need adjustment based on actual relationship storage
      });
    });
    return allRelationships;
  }

  getRelationship(_id: string): Relationship | null {
    // Implementation depends on where relationships are stored
    return null;
  }

  createRelationship(relationship: Relationship): void {
    // Implementation depends on where relationships are stored
    // For now, we'll use the existing addRelationship method
    const project = this.store().projects.find(p => 
      p.elements.some(e => e.id === relationship.fromId || e.id === relationship.toId)
    );
    if (project) {
      this.store().addRelationship(project.id, relationship);
    }
  }

  deleteRelationship(id: string): void {
    // Find the project containing this relationship and remove it
    this.store().projects.forEach(project => {
      this.store().removeRelationship(project.id, id);
    });
  }

  getRelationshipsByElement(_elementId: string): Relationship[] {
    // Implementation depends on where relationships are stored
    return [];
  }

  // IElementProvider implementation (reuses IElementStore methods)
  // Already implemented through IElementStore methods
}