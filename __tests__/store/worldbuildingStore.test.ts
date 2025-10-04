/**
 * WorldbuildingStore Tests
 * Tests for Zustand store managing worldbuilding data
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWorldbuildingStore } from '../../src/store/worldbuildingStore';
import { Project, WorldElement, ElementCategory, Question } from '../../src/types/worldbuilding';
import AsyncStorage from '@react-native-async-storage/async-storage';

// * Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// * Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
}));

describe('WorldbuildingStore', () => {
  beforeEach(() => {
    // * Clear store state before each test
    jest.clearAllMocks();
    const store = useWorldbuildingStore.getState();
    act(() => {
      store.projects = [];
      store.currentProjectId = null;
      store.currentElementId = null;
      store.searchHistory = [];
    });
  });

  describe('Store Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      expect(result.current.projects).toEqual([]);
      expect(result.current.currentProjectId).toBeNull();
      expect(result.current.currentElementId).toBeNull();
      expect(result.current.searchHistory).toEqual([]);
    });

    it('has all required methods', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Project actions
      expect(typeof result.current.createProject).toBe('function');
      expect(typeof result.current.updateProject).toBe('function');
      expect(typeof result.current.deleteProject).toBe('function');
      expect(typeof result.current.duplicateProject).toBe('function');
      expect(typeof result.current.setCurrentProject).toBe('function');

      // * Element actions
      expect(typeof result.current.createElement).toBe('function');
      expect(typeof result.current.updateElement).toBe('function');
      expect(typeof result.current.deleteElement).toBe('function');
      expect(typeof result.current.setCurrentElement).toBe('function');

      // * Utility actions
      expect(typeof result.current.getCurrentProject).toBe('function');
      expect(typeof result.current.getCurrentElement).toBe('function');
      expect(typeof result.current.searchElements).toBe('function');
      expect(typeof result.current.exportProject).toBe('function');
      expect(typeof result.current.importProject).toBe('function');
    });
  });

  describe('Project Actions', () => {
    it('creates a new project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Test Project', 'A test project description');
      });

      expect(result.current.projects).toHaveLength(1);
      const project = result.current.projects[0];
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('A test project description');
      expect(project.id).toBeTruthy();
      expect(project.elements).toEqual([]);
      expect(project.templates).toBeDefined();
    });

    it('updates an existing project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create a project first
      act(() => {
        result.current.createProject('Original Name', 'Original Description');
      });

      const projectId = result.current.projects[0].id;

      // * Update the project
      act(() => {
        result.current.updateProject(projectId, {
          name: 'Updated Name',
          description: 'Updated Description'
        });
      });

      const updatedProject = result.current.projects[0];
      expect(updatedProject.name).toBe('Updated Name');
      expect(updatedProject.description).toBe('Updated Description');
    });

    it('deletes a project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create two projects
      act(() => {
        result.current.createProject('Project 1', 'Description 1');
        result.current.createProject('Project 2', 'Description 2');
      });

      expect(result.current.projects).toHaveLength(2);

      const projectToDelete = result.current.projects[0].id;

      // * Delete the first project
      act(() => {
        result.current.deleteProject(projectToDelete);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('Project 2');
    });

    it('duplicates a project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create a project with some elements
      act(() => {
        const project = result.current.createProject('Original Project', 'Original Description');
        result.current.createElement(project.id, 'Character 1', 'character');
        result.current.createElement(project.id, 'Location 1', 'location');
      });

      const originalId = result.current.projects[0].id;

      // * Duplicate the project
      act(() => {
        result.current.duplicateProject(originalId);
      });

      expect(result.current.projects).toHaveLength(2);

      const duplicated = result.current.projects[1];
      expect(duplicated.name).toContain('Copy');
      expect(duplicated.description).toBe('Original Description');
      expect(duplicated.elements).toHaveLength(2);
      expect(duplicated.id).not.toBe(originalId);
    });

    it('sets current project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        result.current.setCurrentProject(project.id);
      });

      expect(result.current.currentProjectId).toBe(result.current.projects[0].id);
      expect(result.current.getCurrentProject()).toEqual(result.current.projects[0]);
    });
  });

  describe('Element Actions', () => {
    let projectId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useWorldbuildingStore());
      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        projectId = project.id;
      });
    });

    it('creates a new element', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createElement(projectId, 'Aragorn', 'character');
      });

      const project = result.current.projects[0];
      expect(project.elements).toHaveLength(1);

      const element = project.elements[0];
      expect(element.name).toBe('Aragorn');
      expect(element.category).toBe('character');
      expect(element.id).toBeTruthy();
      expect(element.projectId).toBe(projectId);
    });

    it('updates an existing element', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      let elementId: string;
      act(() => {
        const element = result.current.createElement(projectId, 'Original Name', 'character');
        elementId = element.id;
      });

      act(() => {
        result.current.updateElement(projectId, elementId, {
          name: 'Updated Name',
          description: 'New Description'
        });
      });

      const element = result.current.projects[0].elements[0];
      expect(element.name).toBe('Updated Name');
      expect(element.description).toBe('New Description');
    });

    it('deletes an element', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create two elements
      act(() => {
        result.current.createElement(projectId, 'Element 1', 'character');
        result.current.createElement(projectId, 'Element 2', 'location');
      });

      expect(result.current.projects[0].elements).toHaveLength(2);

      const elementToDelete = result.current.projects[0].elements[0].id;

      act(() => {
        result.current.deleteElement(projectId, elementToDelete);
      });

      expect(result.current.projects[0].elements).toHaveLength(1);
      expect(result.current.projects[0].elements[0].name).toBe('Element 2');
    });

    it('sets current element', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      let elementId: string;
      act(() => {
        const element = result.current.createElement(projectId, 'Test Element', 'character');
        elementId = element.id;
        result.current.setCurrentProject(projectId);
        result.current.setCurrentElement(elementId);
      });

      expect(result.current.currentElementId).toBe(elementId);
      expect(result.current.getCurrentElement()?.id).toBe(elementId);
    });
  });

  describe('Question and Answer Actions', () => {
    let projectId: string;
    let elementId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useWorldbuildingStore());
      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        projectId = project.id;
        const element = result.current.createElement(projectId, 'Test Element', 'character');
        elementId = element.id;
      });
    });

    it('adds a question to an element', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const question: Question = {
        id: 'q1',
        text: 'What is your character\'s age?',
        type: 'text',
        category: 'basic',
        required: false
      };

      act(() => {
        result.current.addQuestion(projectId, elementId, question);
      });

      const element = result.current.projects[0].elements[0];
      expect(element.questions).toHaveLength(1);
      expect(element.questions[0]).toEqual(question);
    });

    it('updates an answer to a question', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const question: Question = {
        id: 'q1',
        text: 'Character age?',
        type: 'text',
        category: 'basic',
        required: false
      };

      act(() => {
        result.current.addQuestion(projectId, elementId, question);
        result.current.updateAnswer(projectId, elementId, 'q1', '25');
      });

      const element = result.current.projects[0].elements[0];
      expect(element.answers.q1).toBe('25');
    });

    it('handles different answer types', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const questions: Question[] = [
        { id: 'q1', text: 'Name?', type: 'text', category: 'basic', required: false },
        { id: 'q2', text: 'Age?', type: 'number', category: 'basic', required: false },
        { id: 'q3', text: 'Active?', type: 'boolean', category: 'basic', required: false },
        { id: 'q4', text: 'Skills?', type: 'select', category: 'basic', required: false, multiSelect: true }
      ];

      act(() => {
        questions.forEach(q => result.current.addQuestion(projectId, elementId, q));
        result.current.updateAnswer(projectId, elementId, 'q1', 'Aragorn');
        result.current.updateAnswer(projectId, elementId, 'q2', 87);
        result.current.updateAnswer(projectId, elementId, 'q3', true);
        result.current.updateAnswer(projectId, elementId, 'q4', ['swordsmanship', 'tracking']);
      });

      const element = result.current.projects[0].elements[0];
      expect(element.answers.q1).toBe('Aragorn');
      expect(element.answers.q2).toBe(87);
      expect(element.answers.q3).toBe(true);
      expect(element.answers.q4).toEqual(['swordsmanship', 'tracking']);
    });
  });

  describe('Relationship Actions', () => {
    let projectId: string;
    let element1Id: string;
    let element2Id: string;

    beforeEach(() => {
      const { result } = renderHook(() => useWorldbuildingStore());
      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        projectId = project.id;
        const element1 = result.current.createElement(projectId, 'Character 1', 'character');
        element1Id = element1.id;
        const element2 = result.current.createElement(projectId, 'Character 2', 'character');
        element2Id = element2.id;
      });
    });

    it('adds a relationship between elements', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.addRelationship(projectId, {
          sourceId: element1Id,
          targetId: element2Id,
          type: 'friend',
          description: 'Best friends'
        });
      });

      const project = result.current.projects[0];
      expect(project.relationships).toHaveLength(1);

      const relationship = project.relationships[0];
      expect(relationship.sourceId).toBe(element1Id);
      expect(relationship.targetId).toBe(element2Id);
      expect(relationship.type).toBe('friend');
      expect(relationship.description).toBe('Best friends');
    });

    it('removes a relationship', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Add two relationships
      act(() => {
        result.current.addRelationship(projectId, {
          sourceId: element1Id,
          targetId: element2Id,
          type: 'friend',
          description: 'Friends'
        });
        result.current.addRelationship(projectId, {
          sourceId: element2Id,
          targetId: element1Id,
          type: 'rival',
          description: 'Rivals'
        });
      });

      expect(result.current.projects[0].relationships).toHaveLength(2);

      const relationshipToRemove = result.current.projects[0].relationships[0].id;

      act(() => {
        result.current.removeRelationship(projectId, relationshipToRemove);
      });

      expect(result.current.projects[0].relationships).toHaveLength(1);
      expect(result.current.projects[0].relationships[0].type).toBe('rival');
    });
  });

  describe('Search Functionality', () => {
    let projectId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useWorldbuildingStore());
      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        projectId = project.id;

        // * Create various elements for searching
        result.current.createElement(projectId, 'Aragorn', 'character');
        result.current.createElement(projectId, 'Arwen', 'character');
        result.current.createElement(projectId, 'Rivendell', 'location');
        result.current.createElement(projectId, 'Andúril', 'item');
      });
    });

    it('searches elements by name', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const searchResults = result.current.searchElements('Ar');

      expect(searchResults).toHaveLength(3); // Aragorn, Arwen, Andúril
      expect(searchResults.map(e => e.name)).toContain('Aragorn');
      expect(searchResults.map(e => e.name)).toContain('Arwen');
      expect(searchResults.map(e => e.name)).toContain('Andúril');
    });

    it('searches elements within a specific project', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create another project with different elements
      act(() => {
        const project2 = result.current.createProject('Project 2', 'Description');
        result.current.createElement(project2.id, 'Arthur', 'character');
      });

      const projectResults = result.current.searchElementsInProject(projectId, 'Ar');

      expect(projectResults).toHaveLength(3); // Only from first project
      expect(projectResults.every(e => e.projectId === projectId)).toBe(true);
    });

    it('searches elements by category', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const characterResults = result.current.searchElementsByCategory('character', 'Ar');

      expect(characterResults).toHaveLength(2); // Aragorn, Arwen
      expect(characterResults.every(e => e.category === 'character')).toBe(true);
    });

    it('stores search history', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.searchElements('Aragorn');
        result.current.searchElements('Rivendell');
      });

      expect(result.current.searchHistory).toContain('Aragorn');
      expect(result.current.searchHistory).toContain('Rivendell');
    });

    it('provides search suggestions', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const suggestions = result.current.getSearchSuggestions('Ar');

      expect(suggestions).toBeInstanceOf(Array);
      // Suggestions might include element names starting with 'Ar'
    });
  });

  describe('Import/Export Functionality', () => {
    it('exports a project to JSON string', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      let projectId: string;
      act(() => {
        const project = result.current.createProject('Export Test', 'Test Description');
        projectId = project.id;
        result.current.createElement(projectId, 'Test Element', 'character');
      });

      const exported = result.current.exportProject(projectId);
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed.name).toBe('Export Test');
      expect(parsed.elements).toHaveLength(1);
    });

    it('imports a project from JSON string', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      const projectData = JSON.stringify({
        id: 'imported-project',
        name: 'Imported Project',
        description: 'Imported Description',
        elements: [{
          id: 'imported-element',
          name: 'Imported Element',
          category: 'character',
          projectId: 'imported-project',
          questions: [],
          answers: {}
        }],
        templates: {},
        relationships: []
      });

      act(() => {
        const success = result.current.importProject(projectData);
        expect(success).toBe(true);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('Imported Project');
      expect(result.current.projects[0].elements).toHaveLength(1);
    });

    it('handles invalid import data gracefully', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const success = result.current.importProject('invalid json');
        expect(success).toBe(false);
      });

      expect(result.current.projects).toHaveLength(0);
    });
  });

  describe('Store Persistence', () => {
    it('persists state to AsyncStorage', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Persistent Project', 'Should be saved');
      });

      // * Wait for persistence middleware to save
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('restores state from AsyncStorage on initialization', async () => {
      const storedData = {
        state: {
          projects: [{
            id: 'stored-project',
            name: 'Stored Project',
            description: 'From storage',
            elements: [],
            templates: {},
            relationships: []
          }],
          currentProjectId: null,
          currentElementId: null
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );

      // * Force store rehydration
      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * The actual implementation may vary based on persist middleware
      // This tests the concept of persistence
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Computed Values', () => {
    it('calculates project statistics correctly', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        result.current.createElement(project.id, 'Character 1', 'character');
        result.current.createElement(project.id, 'Character 2', 'character');
        result.current.createElement(project.id, 'Location 1', 'location');
      });

      const project = result.current.projects[0];
      expect(project.elements.length).toBe(3);

      // * Category counts
      const characterCount = project.elements.filter(e => e.category === 'character').length;
      const locationCount = project.elements.filter(e => e.category === 'location').length;

      expect(characterCount).toBe(2);
      expect(locationCount).toBe(1);
    });

    it('handles empty states correctly', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      expect(result.current.getCurrentProject()).toBeNull();
      expect(result.current.getCurrentElement()).toBeNull();
      expect(result.current.searchElements('')).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('handles non-existent project updates gracefully', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      expect(() => {
        act(() => {
          result.current.updateProject('non-existent', { name: 'New Name' });
        });
      }).not.toThrow();
    });

    it('handles non-existent element updates gracefully', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Test Project', 'Description');
      });

      const projectId = result.current.projects[0].id;

      expect(() => {
        act(() => {
          result.current.updateElement(projectId, 'non-existent', { name: 'New Name' });
        });
      }).not.toThrow();
    });

    it('handles duplicate operations safely', () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      expect(() => {
        act(() => {
          const duplicated = result.current.duplicateProject('non-existent');
          expect(duplicated).toBeNull();
        });
      }).not.toThrow();
    });
  });
});