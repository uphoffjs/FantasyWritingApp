import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  WorldElement,
  ElementCategory,
  Question,
  CreateElementInput,
  validateElementInput,
  // hasCustomType,
  // CustomElementType
} from '../../types/worldbuilding';
import { calculationService } from '../../services/core/CalculationService';
import { ProjectSlice } from './projectStore';
import { AsyncSlice, AsyncActionTypes } from './asyncStore';
// import { createOptimisticUpdate } from '../../utils/async';
// Note: Image utilities removed - images not in MVP

export interface ElementSlice {
  // State
  currentElementId: string | null;
  
  // * Element actions
  createElement: (projectId: string, name: string, category: ElementCategory, templateId?: string, customTypeId?: string) => Promise<WorldElement>;
  updateElement: (projectId: string, elementId: string, updates: Partial<WorldElement>) => Promise<void>;
  deleteElement: (projectId: string, elementId: string) => Promise<void>;
  setCurrentElement: (elementId: string | null) => void;
  getCurrentElement: () => WorldElement | null;
  
  // Question/Answer actions
  addQuestion: (projectId: string, elementId: string, question: Question) => Promise<void>;
  updateAnswer: (projectId: string, elementId: string, questionId: string, value: string | string[] | number | boolean | Date) => Promise<void>;
  
  // * Category selectors
  getElementsByCategory: (projectId: string, category: ElementCategory) => WorldElement[];
  getRacesByUsage: (projectId: string, limit?: number) => WorldElement[];
  
  // * Quick creation
  quickCreateElement: (projectId: string, category: ElementCategory, name: string) => Promise<WorldElement>;
  
  // * Usage tracking
  incrementElementUsage: (projectId: string, elementId: string) => void;
}

// * Create a combined interface for slices that depend on each other
interface ElementStoreWithDependencies extends ElementSlice, ProjectSlice, AsyncSlice {}

export const createElementSlice: StateCreator<
  ElementStoreWithDependencies,
  [],
  [],
  ElementSlice
> = (set, get) => ({
  // State
  currentElementId: null,

  // * Element actions
  createElement: async (projectId, name, category, templateId, customTypeId) => {
    return get().executeAsync(
      AsyncActionTypes.CREATE_ELEMENT,
      async () => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) throw new Error('Project not found');

        // * Validate input
        const input: CreateElementInput = {
          name,
          category,
          customTypeId,
          templateId
        };
        validateElementInput(input);

        let questions: Question[] = [];
        
        if (templateId) {
          const template = project.templates.find((t) => t.id === templateId);
          if (template) {
            questions = [...template.questions];
          }
        } else if (customTypeId) {
          // * Get questions from custom type if available
          const customType = project.customTypes?.find(t => t.id === customTypeId);
          if (customType) {
            questions = [...customType.baseQuestions];
          }
        }

        const element: WorldElement = {
          id: uuidv4(),
          name,
          category: category, // Always required, will be 'custom' when using custom type
          customTypeId: customTypeId,
          description: '',
          questions,
          answers: {},
          relationships: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completionPercentage: 0,
          metadata: {}
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: [...project.elements, element],
                  updatedAt: new Date()
                }
              : project
          ),
          currentElementId: element.id
        }));

        return element;
      }
    );
  },

  updateElement: async (projectId, elementId, updates) => {
    return get().executeAsync(
      AsyncActionTypes.UPDATE_ELEMENT,
      async () => {
        // * Validate name if it's being updated
        if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
          throw new Error('Element name cannot be empty');
        }
        
        const normalizedUpdates = { ...updates };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: project.elements.map((element) =>
                    element.id === elementId
                      ? { 
                          ...element, 
                          ...normalizedUpdates, 
                          updatedAt: new Date(),
                          completionPercentage: calculationService.calculateElementCompletion({ ...element, ...normalizedUpdates })
                        }
                      : element
                  ),
                  updatedAt: new Date()
                }
              : project
          )
        }));
      }
    );
  },

  deleteElement: async (projectId, elementId) => {
    return get().executeAsync(
      AsyncActionTypes.DELETE_ELEMENT,
      async () => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: project.elements.filter((e) => e.id !== elementId),
                  updatedAt: new Date()
                }
              : project
          ),
          currentElementId: state.currentElementId === elementId ? null : state.currentElementId
        }));
      }
    );
  },

  setCurrentElement: (elementId) => {
    set({ currentElementId: elementId });
  },

  getCurrentElement: () => {
    const project = get().getCurrentProject();
    if (!project) return null;
    return project.elements.find((e) => e.id === get().currentElementId) || null;
  },

  // Question/Answer actions
  addQuestion: async (projectId, elementId, question) => {
    return get().executeAsync(
      `element.addQuestion`,
      async () => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: project.elements.map((element) =>
                    element.id === elementId
                      ? {
                          ...element,
                          questions: [...element.questions, question],
                          updatedAt: new Date()
                        }
                      : element
                  ),
                  updatedAt: new Date()
                }
              : project
          )
        }));
      }
    );
  },

  updateAnswer: async (projectId, elementId, questionId, value) => {
    return get().executeAsync(
      `element.updateAnswer`,
      async () => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: project.elements.map((element) =>
                    element.id === elementId
                      ? {
                          ...element,
                          answers: {
                            ...element.answers,
                            [questionId]: {
                              value,
                              updatedAt: new Date(),
                              history: []
                            }
                          },
                          updatedAt: new Date(),
                          completionPercentage: calculationService.calculateElementCompletion({
                            ...element,
                            answers: {
                              ...element.answers,
                              [questionId]: { value, updatedAt: new Date(), history: [] }
                            }
                          })
                        }
                      : element
                  ),
                  updatedAt: new Date()
                }
              : project
          )
        }));
      }
    );
  },

  // * Category selectors
  getElementsByCategory: (projectId, category) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return [];
    return project.elements.filter((e) => e.category === category);
  },

  getRacesByUsage: (projectId, limit = 10) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return [];
    
    const races = project.elements.filter((e) => e.category === 'race-species');
    
    // * Sort by usage count (descending) and then by last used date
    const sortedRaces = races.sort((a, b) => {
      const aCount = a.metadata?.usageCount || 0;
      const bCount = b.metadata?.usageCount || 0;
      
      if (aCount !== bCount) {
        return bCount - aCount; // Higher usage count first
      }
      
      // * If usage counts are equal, sort by last used date
      const aLastUsed = a.metadata?.lastUsed ? new Date(a.metadata.lastUsed).getTime() : 0;
      const bLastUsed = b.metadata?.lastUsed ? new Date(b.metadata.lastUsed).getTime() : 0;
      
      return bLastUsed - aLastUsed; // More recently used first
    });
    
    return sortedRaces.slice(0, limit);
  },

  // * Quick creation
  quickCreateElement: async (projectId, category, name) => {
    const element = await get().createElement(projectId, name, category);
    // * Initialize usage count for races
    if (category === 'race-species' && element) {
      await get().updateElement(projectId, element.id, {
        metadata: {
          usageCount: 1,
          lastUsed: new Date()
        }
      });
    }
    return element;
  },

  // * Usage tracking
  incrementElementUsage: (projectId, elementId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    
    const element = project.elements.find((e) => e.id === elementId);
    if (!element) return;
    
    const currentCount = element.metadata?.usageCount || 0;
    
    get().updateElement(projectId, elementId, {
      metadata: {
        usageCount: currentCount + 1,
        lastUsed: new Date()
      }
    });
  }
});