import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  QuestionnaireTemplate,
  ElementCategory,
  // ELEMENT_CATEGORIES,
  // CustomElementType
} from '../../types/worldbuilding';
import { AsyncSlice, AsyncActionTypes } from './asyncStore';
// import { createOptimisticUpdate, retryAsync } from '../../utils/async';
// Note: DEFAULT_TEMPLATES needs to be recreated or imported from a new location

export interface ProjectSlice {
  // State
  projects: Project[];
  currentProjectId: string | null;

  // Actions
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project | null>;
  setCurrentProject: (projectId: string | null) => void;
  getCurrentProject: () => Project | null;
  
  // Template actions
  createTemplate: (projectId: string, template: Omit<QuestionnaireTemplate, 'id'>) => void;
  deleteTemplate: (projectId: string, templateId: string) => void;
  getTemplatesForCategory: (category: ElementCategory) => QuestionnaireTemplate[];
  exportTemplate: (projectId: string, templateId: string) => string;
  importTemplate: (projectId: string, templateData: string) => boolean;
  
  // Import/Export
  exportProject: (projectId: string) => Promise<string>;
  importProject: (data: string) => Promise<boolean>;
}

// Create a combined interface for slices that depend on each other
interface ProjectStoreWithAsync extends ProjectSlice, AsyncSlice {}

export const createProjectSlice: StateCreator<
  ProjectStoreWithAsync,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  // State
  projects: [],
  currentProjectId: null,

  // Actions
  createProject: async (name, description) => {
    return get().executeAsync(
      AsyncActionTypes.CREATE_PROJECT,
      async () => {
        const project: Project = {
          id: uuidv4(),
          name,
          description,
          elements: [],
          customTypes: [], // Initialize empty custom types
          templates: [], // No default templates for now - will be loaded separately
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            settings: {
              useRichText: false // Default setting
            }
          }
        };

        set((state) => ({
          projects: [...state.projects, project],
          currentProjectId: project.id
        }));

        return project;
      }
    );
  },

  updateProject: async (projectId, updates) => {
    return get().executeAsync(
      AsyncActionTypes.UPDATE_PROJECT,
      async () => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          )
        }));
      }
    );
  },

  deleteProject: async (projectId) => {
    return get().executeAsync(
      AsyncActionTypes.DELETE_PROJECT,
      async () => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        }));
      }
    );
  },

  duplicateProject: async (projectId) => {
    return get().executeAsync(
      AsyncActionTypes.DUPLICATE_PROJECT,
      async () => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return null;

    // Create a deep copy of the project
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Deep copy elements with new IDs
      elements: project.elements.map(element => ({
        ...element,
        id: uuidv4(),
        relationships: [], // We'll rebuild relationships after
        answers: { ...element.answers },
        questions: [...element.questions],
        tags: [...(element.tags || [])]
      })),
      // Deep copy templates
      templates: project.templates.map(template => ({
        ...template,
        id: uuidv4(),
        questions: [...template.questions]
      })),
      // Deep copy custom types
      customTypes: project.customTypes ? project.customTypes.map(type => ({
        ...type,
        id: uuidv4()
      })) : [],
      // Deep copy metadata
      metadata: project.metadata ? {
        ...project.metadata,
        settings: project.metadata.settings ? { ...project.metadata.settings } : undefined
      } : undefined
    };

    // Create a mapping of old element IDs to new ones
    const elementIdMap = new Map<string, string>();
    project.elements.forEach((oldEl, index) => {
      elementIdMap.set(oldEl.id, newProject.elements[index].id);
    });

    // Rebuild relationships with new IDs
    project.elements.forEach((oldElement, elementIndex) => {
      const newElement = newProject.elements[elementIndex];
      newElement.relationships = (oldElement.relationships || []).map(rel => ({
        ...rel,
        id: uuidv4(),
        fromId: elementIdMap.get((rel as any).fromElementId || rel.fromId) || (rel as any).fromElementId || rel.fromId,
        toId: elementIdMap.get((rel as any).toElementId || rel.toId) || (rel as any).toElementId || rel.toId
      }));
    });

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id
        }));

        return newProject;
      }
    );
  },

  setCurrentProject: (projectId) => {
    set({ currentProjectId: projectId });
    
    // Rebuild relationship indexes when project changes
    if (projectId) {
      const rebuildRelationshipIndexes = (get() as any).rebuildRelationshipIndexes;
      if (rebuildRelationshipIndexes) {
        rebuildRelationshipIndexes(projectId);
      }
    }
  },

  getCurrentProject: () => {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.id === currentProjectId) || null;
  },

  // Template actions
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
    
    // Create a clean export object without IDs
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
      
      // Validate the imported data
      if (!data.name || !data.category || !data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid template data: missing required fields');
        return false;
      }
      
      // Validate questions structure
      for (const question of data.questions) {
        if (!question.id || !question.text || !question.type) {
          console.error('Invalid question structure');
          return false;
        }
      }
      
      // Create the template
      const template: Omit<QuestionnaireTemplate, 'id'> = {
        name: data.name,
        description: data.description || '',
        category: data.category,
        questions: data.questions,
        isDefault: false
      };
      
      get().createTemplate(projectId, template);
      return true;
    } catch (error) {
      console.error('Failed to import template:', error);
      return false;
    }
  },

  // Import/Export
  exportProject: async (projectId) => {
    return get().executeAsync(
      AsyncActionTypes.EXPORT_PROJECT,
      async () => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return '';
        
        return JSON.stringify(project, null, 2);
      }
    );
  },

  importProject: async (data) => {
    return get().executeAsync(
      AsyncActionTypes.IMPORT_PROJECT,
      async () => {
        try {
          const project = JSON.parse(data) as Project;
          project.id = uuidv4(); // New ID to avoid conflicts
          project.createdAt = new Date();
          project.updatedAt = new Date();
          
          set((state) => ({
            projects: [...state.projects, project],
            currentProjectId: project.id
          }));
          
          return true;
        } catch (error) {
          throw new Error('Failed to import project: Invalid JSON format');
        }
      },
      {
        onError: (error) => {
          console.error('Failed to import project:', error);
        }
      }
    );
  }
});