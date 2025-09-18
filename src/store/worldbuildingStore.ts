import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { searchCache } from '../utils/cache';
import { optimisticSyncMiddleware } from './middleware/optimisticSyncMiddleware';
import { crossPlatformStorage } from '../utils/crossPlatformStorage';
import { supabaseSyncService } from '../services/supabaseSync';
import { useAuthStore } from './authStore';
import { 
  Project, 
  WorldElement, 
  QuestionnaireTemplate, 
  ElementCategory, 
  Question,
  Relationship,
  DEFAULT_TEMPLATES
  // ImageWithCaption removed from MVP
} from '../types/worldbuilding';
// // DEPRECATED: DEPRECATED - This file is replaced by rootStore.ts
// import type { RelationshipType } from '../types/models/Relationship';
import type { SyncStatus } from '../store/authStore';
import { calculationService as CalculationService } from '../services/core/CalculationService';
import { searchService } from '../services/searchService';
import { migrateRelationship } from '../utils/relationshipMigration';
import { 
  isProject, 
  isQuestionnaireTemplate, 
  validateExternalData 
} from '../utils/typeGuards';

// * Helper function to convert string[] options to SelectOption[]
function convertQuestionOptions(questions: any[]): Question[] {
  return questions.map(q => ({
    ...q,
    options: q.options 
      ? (typeof q.options[0] === 'string' 
        ? q.options.map((opt: string) => ({ value: opt, label: opt }))
        : q.options)
      : undefined
  }));
}

// * Sync metadata for tracking cloud sync status
interface SyncMetadata {
  projectId: string;
  lastSyncedAt: Date | null;
  lastModified?: Date;
  syncStatus: SyncStatus;
  cloudId?: string; // Supabase ID after migration
}

export interface WorldbuildingStore {
  // State
  projects: Project[];
  currentProjectId: string | null;
  currentElementId: string | null;
  searchHistory: string[];
  
  // * Sync tracking
  syncMetadata: Record<string, SyncMetadata>; // projectId -> metadata
  lastSyncAttempt: Date | null;

  // * Project actions
  createProject: (name: string, description: string) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => Project | null;
  setCurrentProject: (projectId: string | null) => void;

  // * Element actions
  createElement: (projectId: string, name: string, category: ElementCategory, templateId?: string) => WorldElement;
  updateElement: (projectId: string, elementId: string, updates: Partial<WorldElement>) => void;
  deleteElement: (projectId: string, elementId: string) => void;
  setCurrentElement: (elementId: string | null) => void;
  
  // Question/Answer actions
  addQuestion: (projectId: string, elementId: string, question: Question) => void;
  updateAnswer: (projectId: string, elementId: string, questionId: string, value: string | string[] | number | boolean | Date) => void;
  
  // * Relationship actions
  addRelationship: (projectId: string, relationship: Omit<Relationship, 'id'>) => void;
  removeRelationship: (projectId: string, relationshipId: string) => void;

  // TODO: * Template actions
  createTemplate: (projectId: string, template: Omit<QuestionnaireTemplate, 'id'>) => void;
  deleteTemplate: (projectId: string, templateId: string) => void;
  getTemplatesForCategory: (category: ElementCategory) => QuestionnaireTemplate[];
  exportTemplate: (projectId: string, templateId: string) => string;
  importTemplate: (projectId: string, templateData: string) => boolean;
  
  // * Utility actions
  getCurrentProject: () => Project | null;
  getCurrentElement: () => WorldElement | null;
  searchElements: (query: string) => WorldElement[];
  searchElementsInProject: (projectId: string, query: string) => WorldElement[];
  searchElementsByCategory: (category: ElementCategory, query: string) => WorldElement[];
  getSearchSuggestions: (query: string) => string[];
  exportProject: (projectId: string) => string;
  importProject: (data: string) => boolean;
  
  // * Element category selectors
  getElementsByCategory: (projectId: string, category: ElementCategory) => WorldElement[];
  getRacesByUsage: (projectId: string, limit?: number) => WorldElement[];
  
  // * Quick creation
  quickCreateElement: (projectId: string, category: ElementCategory, name: string) => WorldElement;
  
  // * Usage tracking
  incrementElementUsage: (projectId: string, elementId: string) => void;
  
  // * Search history actions
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  
  // * Sync actions
  updateProjectSyncStatus: (projectId: string, status: SyncStatus, cloudId?: string) => void;
  markProjectAsSynced: (projectId: string, cloudId: string) => void;
  markProjectAsModified: (projectId: string) => void;
  getSyncMetadata: (projectId: string) => SyncMetadata | null;
  updateSyncMetadata: (projectId: string, updates: Partial<SyncMetadata>) => void;
  clearSyncMetadata: () => void;
  
  // * Supabase sync methods
  syncWithSupabase: () => Promise<void>;
  fetchFromSupabase: () => Promise<void>;
  syncProjectToSupabase: (projectId: string) => Promise<void>;
}

export const useWorldbuildingStore = create<WorldbuildingStore>()(
  optimisticSyncMiddleware(
    persist(
      (set, get) => ({
      projects: [],
      currentProjectId: null,
      currentElementId: null,
      searchHistory: [],
      syncMetadata: {},
      lastSyncAttempt: null,

      createProject: (name, description) => {
        
        const project: Project = {
          id: uuidv4(),
          name,
          description,
          elements: [],
          templates: Object.entries(DEFAULT_TEMPLATES).map(([category, template]) => ({
            id: uuidv4(),
            name: template.name || `${category} Template`,
            category: category as ElementCategory,
            description: template.description || "",
            isDefault: true,
            questions: convertQuestionOptions(template.questions || [])
          })),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const currentState = get();
        
        set((state) => {
          const newState = {
            projects: [...state.projects, project],
            currentProjectId: project.id
          };
          return newState;
        });

        return project;
      },
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          )
        }));
        
        // * Mark project as modified for sync
        get().markProjectAsModified(projectId);
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        }));
      },

      duplicateProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return null;

        // * Create a deep copy of the project
        const newProject: Project = {
          ...project,
          id: uuidv4(),
          name: `${project.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          // * Deep copy elements with new IDs
          elements: project.elements.map(element => ({
            ...element,
            id: uuidv4(),
            relationships: [], // We'll rebuild relationships after
            answers: { ...element.answers },
            questions: [...element.questions],
            tags: [...(element.tags || [])]
          })),
          // TODO: * Deep copy templates
          templates: project.templates.map(template => ({
            ...template,
            id: uuidv4(),
            questions: [...template.questions]
          })),
        };

        // // DEPRECATED: * Create a mapping of old element IDs to new ones
        const elementIdMap = new Map<string, string>();
        project.elements.forEach((oldEl, index) => {
          elementIdMap.set(oldEl.id, newProject.elements[index].id);
        });

        // * Rebuild relationships with new IDs
        project.elements.forEach((oldElement, elementIndex) => {
          const newElement = newProject.elements[elementIndex];
          newElement.relationships = (oldElement.relationships || []).map(rel => ({
            ...rel,
            id: uuidv4(),
            fromId: elementIdMap.get((rel as any).sourceElementId || rel.fromId) || (rel as any).sourceElementId || rel.fromId,
            toId: elementIdMap.get((rel as any).targetElementId || rel.toId) || (rel as any).targetElementId || rel.toId
          }));
        });

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id
        }));

        return newProject;
      },

      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId, currentElementId: null });
      },

      createElement: (projectId, name, category, templateId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) throw new Error('Project not found');

        let questions: Question[] = [];
        
        if (templateId) {
          const template = project.templates.find((t) => t.id === templateId);
          if (template) {
            questions = [...template.questions];
          }
        } else if (DEFAULT_TEMPLATES[category]) {
          questions = convertQuestionOptions(DEFAULT_TEMPLATES[category].questions || []);
        }

        const element: WorldElement = {
          id: uuidv4(),
          name,
          category,
          description: '',
          questions,
          answers: {},
          relationships: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completionPercentage: 0
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
        
        // * Mark project as modified for sync
        get().markProjectAsModified(projectId);

        return element;
      },

      updateElement: (projectId, elementId, updates) => {
        // // DEPRECATED: * Remove deprecated properties
        const { images, ...cleanUpdates } = updates as any;
        const normalizedUpdates = cleanUpdates;
        
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
                          completionPercentage: CalculationService.calculateElementCompletion({ ...element, ...normalizedUpdates })
                        }
                      : element
                  ),
                  updatedAt: new Date()
                }
              : project
          )
        }));
        
        // * Mark project as modified for sync
        get().markProjectAsModified(projectId);
      },

      deleteElement: (projectId, elementId) => {
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
      },

      setCurrentElement: (elementId) => {
        set({ currentElementId: elementId });
      },

      addQuestion: (projectId, elementId, question) => {
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
      },

      updateAnswer: (projectId, elementId, questionId, value) => {
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
                              updatedAt: new Date()
                            }
                          },
                          updatedAt: new Date(),
                          completionPercentage: CalculationService.calculateElementCompletion({
                            ...element,
                            answers: {
                              ...element.answers,
                              [questionId]: { value, updatedAt: new Date() }
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
      },

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
      },

      removeRelationship: (projectId, relationshipId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  elements: project.elements.map((element) => ({
                    ...element,
                    relationships: element.relationships?.filter((r) => r.id !== relationshipId) || []
                  })),
                  updatedAt: new Date()
                }
              : project
          )
        }));
      },

      createTemplate: (projectId, template) => {
        const newTemplate: QuestionnaireTemplate = {
          ...template,
          id: uuidv4()
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  templates: [...project.templates, newTemplate],
                  updatedAt: new Date()
                }
              : project
          )
        }));
      },

      deleteTemplate: (projectId, templateId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  templates: project.templates.filter((t) => t.id !== templateId),
                  updatedAt: new Date()
                }
              : project
          )
        }));
      },

      getTemplatesForCategory: (category) => {
        const { projects, currentProjectId } = get();
        const project = projects.find((p) => p.id === currentProjectId);
        if (!project) return [];
        
        return project.templates.filter((t) => t.category === category);
      },

      exportTemplate: (projectId, templateId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return '';
        
        const template = project.templates.find((t) => t.id === templateId);
        if (!template) return '';
        
        // * Create a clean export object without IDs
        const exportData = {
          name: template.name,
          description: template.description,
          category: template.category,
          questions: template.questions,
          version: '1.0',
          exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(exportData, null, 2);
      },

      importTemplate: (projectId, templateData) => {
        try {
          const data = JSON.parse(templateData);
          
          // TODO: * Build a template object to validate
          const templateToValidate: QuestionnaireTemplate = {
            id: data.id || uuidv4(),
            name: data.name,
            category: data.category,
            questions: data.questions || [],
            description: data.description,
          };
          
          // * Validate using type guard
          const validatedTemplate = validateExternalData(
            templateToValidate, 
            isQuestionnaireTemplate, 
            'Template import'
          );
          
          // TODO: * Create the template with validated data
          const template: Omit<QuestionnaireTemplate, 'id'> = {
            name: validatedTemplate.name,
            description: validatedTemplate.description || '',
            category: validatedTemplate.category,
            questions: validatedTemplate.questions,
          };
          
          get().createTemplate(projectId, template);
          return true;
        } catch (error) {
          console.error('Failed to import template:', error);
          return false;
        }
      },

      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId) || null;
      },

      getCurrentElement: () => {
        const project = get().getCurrentProject();
        if (!project) return null;
        return project.elements.find((e) => e.id === get().currentElementId) || null;
      },

      searchElements: (query) => {
        // ! PERFORMANCE: * Check cache first
        const cached = searchCache.get(query);
        if (cached) {
          return cached as WorldElement[];
        }

        // ! PERFORMANCE: Use Fuse.js search service for better performance and fuzzy matching
        const results = searchService.search(query, {
          limit: 100,
          threshold: 0.4
        }) as WorldElement[];

        // ! PERFORMANCE: * Cache the results
        searchCache.set(query, results);
        
        // * Add to search history if results found
        if (results.length > 0 && query.trim()) {
          get().addSearchQuery(query.trim());
        }
        
        return results;
      },

      searchElementsInProject: (projectId, query) => {
        // ! PERFORMANCE: * Cache key includes projectId for project-specific caching
        const cacheKey = `${projectId}:${query}`;
        const cached = searchCache.get(cacheKey);
        if (cached) {
          return cached as WorldElement[];
        }

        const results = searchService.searchInProject(projectId, query, {
          limit: 50,
          threshold: 0.4
        }) as WorldElement[];

        searchCache.set(cacheKey, results);
        return results;
      },

      searchElementsByCategory: (category, query) => {
        // ! PERFORMANCE: * Cache key includes category for category-specific caching
        const cacheKey = `cat:${category}:${query}`;
        const cached = searchCache.get(cacheKey);
        if (cached) {
          return cached as WorldElement[];
        }

        const results = searchService.searchByCategory(category, query, {
          limit: 50,
          threshold: 0.4
        }) as WorldElement[];

        searchCache.set(cacheKey, results);
        return results;
      },

      getSearchSuggestions: (query) => {
        if (query.length < 2) return [];
        
        return searchService.getSuggestions(query, 10);
      },

      exportProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return '';
        
        return JSON.stringify(project, null, 2);
      },

      importProject: (data) => {
        try {
          const parsedData = JSON.parse(data);
          const project = validateExternalData(parsedData, isProject, 'Project import');
          
          // * Create new project with fresh IDs to avoid conflicts
          const newProject: Project = {
            ...project,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
            // * Regenerate element IDs
            elements: project.elements.map(element => ({
              ...element,
              id: uuidv4(),
              createdAt: new Date(element.createdAt),
              updatedAt: new Date(element.updatedAt),
              // * Ensure relationships have proper date objects
              relationships: element.relationships?.map(rel => ({
                ...rel,
                createdAt: new Date(rel.createdAt)
              }))
            }))
          };
          
          set((state) => ({
            projects: [...state.projects, newProject],
            currentProjectId: newProject.id
          }));
          
          return true;
        } catch (error) {
          console.error('Import project failed:', error);
          return false;
        }
      },

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

      quickCreateElement: (projectId, category, name) => {
        const element = get().createElement(projectId, name, category);
        // * Initialize usage count for races
        if (category === 'race-species' && element) {
          get().updateElement(projectId, element.id, {
            metadata: {
              usageCount: 1,
              lastUsed: new Date()
            }
          });
        }
        return element;
      },

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
      },

      addSearchQuery: (query) => {
        if (!query.trim()) return;
        
        set((state) => {
          const history = [...state.searchHistory];
          
          // * Remove the query if it already exists
          const existingIndex = history.indexOf(query);
          if (existingIndex > -1) {
            history.splice(existingIndex, 1);
          }
          
          // * Add to the beginning
          history.unshift(query);
          
          // * Keep only the last 10 searches
          if (history.length > 10) {
            history.pop();
          }
          
          return { searchHistory: history };
        });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
      
      // * Sync actions
      updateProjectSyncStatus: (projectId, status, cloudId) => {
        set((state) => ({
          syncMetadata: {
            ...state.syncMetadata,
            [projectId]: {
              projectId,
              syncStatus: status,
              lastSyncedAt: status === 'synced' ? new Date() : state.syncMetadata[projectId]?.lastSyncedAt || null,
              cloudId: cloudId || state.syncMetadata[projectId]?.cloudId
            }
          },
          lastSyncAttempt: new Date()
        }));
      },
      
      markProjectAsSynced: (projectId, cloudId) => {
        set((state) => ({
          syncMetadata: {
            ...state.syncMetadata,
            [projectId]: {
              projectId,
              syncStatus: 'synced',
              lastSyncedAt: new Date(),
              cloudId
            }
          }
        }));
      },
      
      markProjectAsModified: (projectId) => {
        set((state) => {
          const currentMetadata = state.syncMetadata[projectId];
          if (!currentMetadata || currentMetadata.syncStatus === 'syncing') {
            return state; // Don't mark as modified if currently syncing
          }
          
          return {
            syncMetadata: {
              ...state.syncMetadata,
              [projectId]: {
                ...currentMetadata,
                syncStatus: 'offline' // Will need to sync
              }
            }
          };
        });
      },
      
      getSyncMetadata: (projectId) => {
        return get().syncMetadata[projectId] || null;
      },
      
      updateSyncMetadata: (projectId, updates) => {
        set((state) => ({
          syncMetadata: {
            ...state.syncMetadata,
            [projectId]: {
              ...state.syncMetadata[projectId],
              projectId,
              ...updates,
              lastModified: updates.lastModified || new Date()
            }
          }
        }));
      },
      
      clearSyncMetadata: () => {
        set({ syncMetadata: {}, lastSyncAttempt: null });
      },
      
      syncWithSupabase: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          return;
        }
        
        const state = get();
        
        try {
          set({ lastSyncAttempt: new Date() });
          
          // * Sync all local projects to Supabase
          await supabaseSyncService.syncProjects(state.projects, user.id);
          
          // * Mark all projects as synced
          const newSyncMetadata: Record<string, SyncMetadata> = {};
          state.projects.forEach(project => {
            newSyncMetadata[project.id] = {
              projectId: project.id,
              lastSyncedAt: new Date(),
              syncStatus: 'synced'
            };
          });
          
          set({ syncMetadata: newSyncMetadata });
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
          throw error;
        }
      },
      
      fetchFromSupabase: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          return;
        }
        
        try {
          // * Fetch all projects from Supabase
          const remoteProjects = await supabaseSyncService.fetchProjects(user.id);
          
          // * Merge with local projects (remote takes precedence)
          const state = get();
          const localProjectMap = new Map(state.projects.map(p => [p.id, p]));
          
          // * Update or add remote projects
          remoteProjects.forEach(remoteProject => {
            localProjectMap.set(remoteProject.id, remoteProject);
          });
          
          const mergedProjects = Array.from(localProjectMap.values());
          
          // * Update sync metadata
          const newSyncMetadata: Record<string, SyncMetadata> = {};
          mergedProjects.forEach(project => {
            newSyncMetadata[project.id] = {
              projectId: project.id,
              lastSyncedAt: new Date(),
              syncStatus: 'synced'
            };
          });
          
          set({ 
            projects: mergedProjects,
            syncMetadata: newSyncMetadata,
            lastSyncAttempt: new Date()
          });
        } catch (error) {
          console.error('Error fetching from Supabase:', error);
          throw error;
        }
      },
      
      syncProjectToSupabase: async (projectId) => {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          return;
        }
        
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) {
          console.error('Project not found:', projectId);
          return;
        }
        
        try {
          // * Sync single project
          await supabaseSyncService.syncProjects([project], user.id);
          
          // * Update sync metadata for this project
          set((state) => ({
            syncMetadata: {
              ...state.syncMetadata,
              [projectId]: {
                projectId,
                lastSyncedAt: new Date(),
                syncStatus: 'synced'
              }
            }
          }));
        } catch (error) {
          console.error('Error syncing project to Supabase:', error);
          throw error;
        }
      }
    }),
    {
      name: 'worldbuilding-storage',
      storage: crossPlatformStorage,
      version: 2,
      migrate: (state: any, version: number) => {
        if (version === 0) {
          // * Images were removed from MVP - no migration needed for version 0
          // // DEPRECATED: * Legacy image data will be ignored
        }
        
        if (version < 2) {
          // // DEPRECATED: * Migrate relationships from old format (fromElementId, toElementId, relationshipType) 
          // to new format (fromId, toId, type)
          if (state.projects) {
            state.projects = state.projects.map((project: any) => ({
              ...project,
              elements: project.elements?.map((element: any) => ({
                ...element,
                relationships: element.relationships?.map((rel: any) => {
                  // * Check if already in new format
                  if ('fromId' in rel && 'toId' in rel && 'type' in rel) {
                    return rel;
                  }
                  // // DEPRECATED: * Migrate from old format
                  return migrateRelationship({
                    ...rel,
                    fromName: undefined,
                    toName: undefined,
                    createdAt: rel.createdAt || new Date(),
                    metadata: rel.metadata
                  });
                }) || []
              })) || []
            }));
          }
        }
        
        return state;
      }
    }
    )
  )
);

// * Subscribe to store changes to update search index
useWorldbuildingStore.subscribe((state, prevState) => {
  if (state.projects !== prevState.projects) {
    // * Update search index whenever projects change
    // TODO: TODO: Implement updateSearchIndex method in searchService
    // searchService.updateSearchIndex(state.projects);
    // ! PERFORMANCE: * Clear search cache when index is updated
    searchCache.clear();
  }
});

// * Initialize search index with existing data on store creation
const initialState = useWorldbuildingStore.getState();
if (initialState.projects.length > 0) {
  // TODO: TODO: Implement updateSearchIndex method in searchService
  // searchService.updateSearchIndex(initialState.projects);
}

