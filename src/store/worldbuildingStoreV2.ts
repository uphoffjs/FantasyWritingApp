/* eslint-disable @typescript-eslint/no-explicit-any */
// * Store composition requires 'any' for flexible service layer integration
// * and dynamic state management across multiple domain slices

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { v4 as uuidv4 } from 'uuid';
import {
  StorageService,
  ProjectService,
  ElementService,
  RelationshipService,
  ValidationService,
  // CalculationService
} from '../services';
import { ZustandStoreAdapter } from './adapters/ZustandStoreAdapter';
import { 
  Project,
  WorldElement,
  QuestionnaireTemplate,
  ElementCategory,
  Relationship,
  // CreateProjectInput,
  // CreateElementInput,
  // CreateRelationshipInput
} from '../types/models';

// TODO: TODO: * Import default templates (will need to be updated to use new structure)
import { DEFAULT_TEMPLATES } from '../types/worldbuilding';

interface WorldbuildingStoreV2 {
  // State
  projects: Project[];
  currentProjectId: string | null;
  currentElementId: string | null;
  searchHistory: string[];
  
  // * Services (internal use)
  _services: {
    project: ProjectService;
    element: ElementService;
    relationship: RelationshipService;
  } | null;
  
  // * Initialization
  initializeServices: () => void;
  
  // * Project actions (delegated to ProjectService)
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project | null>;
  setCurrentProject: (projectId: string | null) => void;
  
  // * Element actions (delegated to ElementService)
  createElement: (projectId: string, name: string, category: ElementCategory, templateId?: string) => Promise<WorldElement>;
  updateElement: (projectId: string, elementId: string, updates: Partial<WorldElement>) => Promise<void>;
  deleteElement: (projectId: string, elementId: string) => Promise<void>;
  setCurrentElement: (elementId: string | null) => void;
  updateAnswers: (projectId: string, elementId: string, answers: Record<string, any>) => Promise<void>;
  
  // * Relationship actions (delegated to RelationshipService)
  createRelationship: (projectId: string, fromId: string, toId: string, type: string) => Promise<Relationship>;
  deleteRelationship: (projectId: string, relationshipId: string) => Promise<void>;
  
  // * Utility actions
  getCurrentProject: () => Project | null;
  getCurrentElement: () => WorldElement | null;
  searchElements: (query: string) => WorldElement[];
  exportProject: (projectId: string) => string;
  importProject: (data: string) => Promise<Project>;
  
  // * New service-based methods
  getElementsByCategory: (projectId: string, category: ElementCategory) => WorldElement[];
  getRacesByUsage: (projectId: string, limit?: number) => WorldElement[];
  quickCreateElement: (projectId: string, category: ElementCategory, name: string) => Promise<WorldElement>;
  incrementElementUsage: (projectId: string, elementId: string) => Promise<void>;
  
  // * Search history
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  
  // TODO: * Template management
  getTemplatesForCategory: (category: ElementCategory) => QuestionnaireTemplate[];
}

export const useWorldbuildingStoreV2 = create<WorldbuildingStoreV2>()(
  persist(
    (set, get) => ({
      // * Initial state
      projects: [],
      currentProjectId: null,
      currentElementId: null,
      searchHistory: [],
      _services: null,
      
      // * Initialize services
      initializeServices: () => {
        const adapter = new ZustandStoreAdapter(() => get() as any);
        const validationService = new ValidationService();
        const storage = StorageService.getStorage();
        
        const projectService = new ProjectService(adapter, storage, validationService);
        const elementService = new ElementService(adapter, validationService);
        const relationshipService = new RelationshipService(adapter, adapter, validationService);
        
        set({ 
          _services: { 
            project: projectService, 
            element: elementService, 
            relationship: relationshipService 
          } 
        });
      },
      
      // * Project actions
      createProject: async (name: string, description: string) => {
        const services = get()._services;
        if (!services) {
          get().initializeServices();
          return get().createProject(name, description);
        }
        
        const project = await services.project.createProject({ name, description });
        set(state => ({ projects: [...state.projects, project] }));
        return project;
      },
      
      updateProject: async (projectId: string, updates: Partial<Project>) => {
        const services = get()._services;
        if (!services) return;
        
        await services.project.updateProject(projectId, updates);
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, ...updates } : p
          )
        }));
      },
      
      deleteProject: async (projectId: string) => {
        const services = get()._services;
        if (!services) return;
        
        await services.project.deleteProject(projectId);
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        }));
      },
      
      duplicateProject: async (projectId: string) => {
        const services = get()._services;
        if (!services) return null;
        
        const duplicated = await services.project.duplicateProject(projectId);
        set(state => ({ projects: [...state.projects, duplicated] }));
        return duplicated;
      },
      
      setCurrentProject: (projectId: string | null) => {
        set({ currentProjectId: projectId });
      },
      
      // * Element actions
      createElement: async (projectId: string, name: string, category: ElementCategory, templateId?: string) => {
        const services = get()._services;
        if (!services) {
          get().initializeServices();
          return get().createElement(projectId, name, category, templateId);
        }
        
        // TODO: * Get template if specified
        let template: QuestionnaireTemplate | undefined;
        if (templateId) {
          const defaultTemplate = DEFAULT_TEMPLATES[category];
          template = {
            id: defaultTemplate.id || `${category}-template`,
            name: defaultTemplate.name || `${category} Template`,
            category: defaultTemplate.category || category,
            questions: defaultTemplate.questions || [],
            ...defaultTemplate
          } as QuestionnaireTemplate;
        }
        
        const element = await services.element.createElement(
          projectId,
          { name, category, templateId },
          template
        );
        
        // * Update project in state
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, elements: [...p.elements, element], updatedAt: new Date() }
              : p
          )
        }));
        
        return element;
      },
      
      updateElement: async (projectId: string, elementId: string, updates: Partial<WorldElement>) => {
        const services = get()._services;
        if (!services) return;
        
        await services.element.updateElement(projectId, elementId, updates);
        
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? {
                  ...p,
                  elements: p.elements.map(e => 
                    e.id === elementId ? { ...e, ...updates } : e
                  ),
                  updatedAt: new Date()
                }
              : p
          )
        }));
      },
      
      deleteElement: async (projectId: string, elementId: string) => {
        const services = get()._services;
        if (!services) return;
        
        await services.element.deleteElement(projectId, elementId);
        
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? {
                  ...p,
                  elements: p.elements.filter(e => e.id !== elementId),
                  updatedAt: new Date()
                }
              : p
          ),
          currentElementId: state.currentElementId === elementId ? null : state.currentElementId
        }));
      },
      
      setCurrentElement: (elementId: string | null) => {
        set({ currentElementId: elementId });
      },
      
      updateAnswers: async (projectId: string, elementId: string, answers: Record<string, any>) => {
        const services = get()._services;
        if (!services) return;
        
        const updatedElement = await services.element.updateAnswers(projectId, elementId, answers);
        
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? {
                  ...p,
                  elements: p.elements.map(e => 
                    e.id === elementId ? updatedElement : e
                  ),
                  updatedAt: new Date()
                }
              : p
          )
        }));
      },
      
      // * Relationship actions
      createRelationship: async (projectId: string, fromId: string, toId: string, type: string) => {
        const services = get()._services;
        if (!services) return {} as Relationship;
        
        const relationship = await services.relationship.createRelationship(projectId, {
          fromId,
          toId,
          type: type as any
        });
        
        // Note: Update state based on where relationships are stored
        return relationship;
      },
      
      deleteRelationship: async (_projectId: string, relationshipId: string) => {
        const services = get()._services;
        if (!services) return;
        
        await services.relationship.deleteRelationship(relationshipId);
        // Note: Update state based on where relationships are stored
      },
      
      // * Utility actions
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId) || null;
      },
      
      getCurrentElement: () => {
        const state = get();
        const project = state.getCurrentProject();
        if (!project) return null;
        return project.elements.find(e => e.id === state.currentElementId) || null;
      },
      
      searchElements: (query: string) => {
        const services = get()._services;
        if (!services) return [];
        
        const results: WorldElement[] = [];
        get().projects.forEach(project => {
          const elements = services.element.getElementsByProject(project.id, { search: query });
          results.push(...elements);
        });
        
        return results;
      },
      
      exportProject: (projectId: string) => {
        const services = get()._services;
        if (!services) return '';
        
        return services.project.exportProject(projectId);
      },
      
      importProject: async (data: string) => {
        const services = get()._services;
        if (!services) throw new Error('Services not initialized');
        
        const project = await services.project.importProject(data);
        set(state => ({ projects: [...state.projects, project] }));
        return project;
      },
      
      // * Service-based methods
      getElementsByCategory: (projectId: string, category: ElementCategory) => {
        const services = get()._services;
        if (!services) return [];
        
        return services.element.getElementsByCategory(projectId, category);
      },
      
      getRacesByUsage: (projectId: string, limit?: number) => {
        const services = get()._services;
        if (!services) return [];
        
        return services.element.getRacesByUsage(projectId, limit);
      },
      
      quickCreateElement: async (projectId: string, category: ElementCategory, name: string) => {
        const services = get()._services;
        if (!services) throw new Error('Services not initialized');
        
        const element = await services.element.quickCreateElement(projectId, category, name);
        
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, elements: [...p.elements, element], updatedAt: new Date() }
              : p
          )
        }));
        
        return element;
      },
      
      incrementElementUsage: async (projectId: string, elementId: string) => {
        const services = get()._services;
        if (!services) return;
        
        await services.element.incrementElementUsage(projectId, elementId);
        
        // * Update element metadata in state
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? {
                  ...p,
                  elements: p.elements.map(e => 
                    e.id === elementId 
                      ? {
                          ...e,
                          metadata: {
                            ...e.metadata,
                            usageCount: (e.metadata?.usageCount || 0) + 1,
                            lastUsed: new Date()
                          }
                        }
                      : e
                  )
                }
              : p
          )
        }));
      },
      
      // * Search history
      addSearchQuery: (query: string) => {
        set(state => ({
          searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10)
        }));
      },
      
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
      
      // TODO: * Template management
      getTemplatesForCategory: (category: ElementCategory) => {
        // TODO: * For now, return default templates
        // TODO: TODO: * This will need to be updated when custom templates are supported
        const defaultTemplate = DEFAULT_TEMPLATES[category];
        if (!defaultTemplate) return [];
        
        const template: QuestionnaireTemplate = {
          id: defaultTemplate.id || `${category}-template`,
          name: defaultTemplate.name || `${category} Template`,
          category: defaultTemplate.category || category,
          questions: defaultTemplate.questions || [],
          ...defaultTemplate
        } as QuestionnaireTemplate;
        
        return [template];
      }
    }),
    {
      name: 'fantasy-element-builder-v2',
      storage: {
        getItem: async (name) => {
          const value = await StorageService.getStorage().getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await StorageService.getStorage().setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await StorageService.getStorage().removeItem(name);
        }
      }
    }
  )
);

// * Initialize services on store creation
useWorldbuildingStoreV2.getState().initializeServices();