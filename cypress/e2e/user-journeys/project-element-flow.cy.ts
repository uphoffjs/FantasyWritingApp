/**
 * Project and Element Management User Journey Tests
 * Tests complete workflows for creating and managing projects and elements
 */

import { LoginPage } from '../../support/pages/LoginPage';
import { ProjectsPage } from '../../support/pages/ProjectsPage';
import { ElementsPage } from '../../support/pages/ElementsPage';
import { NavigationPage } from '../../support/pages/NavigationPage';

describe('Project and Element Management Journey', () => {
  const loginPage = new LoginPage();
  const projectsPage = new ProjectsPage();
  const elementsPage = new ElementsPage();
  const navigationPage = new NavigationPage();

  // * Test data
  const timestamp = Date.now();
  const testProject = {
    name: `Fantasy World ${timestamp}`,
    description: 'A test fantasy world with magic and dragons',
    genre: 'Fantasy'
  };

  const testCharacter = {
    name: 'Aragorn',
    description: 'A ranger from the North, heir to the throne of Gondor',
    tags: ['hero', 'ranger', 'king']
  };

  const testLocation = {
    name: 'Rivendell',
    description: 'The Last Homely House, an elven refuge in Middle-earth',
    tags: ['elven', 'sanctuary', 'hidden']
  };

  before(() => {
    // * Sign in with test user
    const testUser = Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

    loginPage.visit();
    loginPage.signInWithSession(testUser, testPassword);
  });

  beforeEach(() => {
    // * Navigate to projects page
    projectsPage.visit();
  });

  describe('Project Creation and Management', () => {
    it('should create a new project', () => {
      // * Click create project button
      projectsPage.clickCreateProject();

      // * Fill in project details
      projectsPage.fillProjectDetails(
        testProject.name,
        testProject.description,
        testProject.genre
      );

      // * Save project
      projectsPage.saveProject();

      // * Verify project appears in list
      projectsPage.verifyProjectExists(testProject.name);

      // * Verify project details
      projectsPage.verifyProjectDetails(testProject.name, {
        description: testProject.description,
        elementCount: 0
      });
    });

    it('should edit an existing project', () => {
      // * Create a project first
      const editProject = {
        name: `Edit Test ${timestamp}`,
        description: 'Original description'
      };

      projectsPage.createProject(editProject.name, editProject.description);
      projectsPage.verifyProjectExists(editProject.name);

      // * Edit the project
      projectsPage.editProject(editProject.name);

      // * Update description
      const newDescription = 'Updated description with more details';
      projectsPage.fillProjectDetails(editProject.name, newDescription);
      projectsPage.saveProject();

      // * Verify updated details
      projectsPage.verifyProjectDetails(editProject.name, {
        description: newDescription
      });
    });

    it('should delete a project', () => {
      // * Create a project to delete
      const deleteProject = {
        name: `Delete Test ${timestamp}`,
        description: 'This project will be deleted'
      };

      projectsPage.createProject(deleteProject.name, deleteProject.description);
      projectsPage.verifyProjectExists(deleteProject.name);

      // * Delete the project
      projectsPage.deleteProject(deleteProject.name, true);

      // * Verify project is removed
      projectsPage.verifyProjectDoesNotExist(deleteProject.name);
    });

    it('should search for projects', () => {
      // * Create multiple projects
      const projects = [
        { name: `Dragon Quest ${timestamp}`, description: 'A quest for dragons' },
        { name: `Unicorn Tale ${timestamp}`, description: 'A tale of unicorns' },
        { name: `Magic Kingdom ${timestamp}`, description: 'A magical kingdom' }
      ];

      projectsPage.createMultipleProjects(projects);

      // * Search for "Dragon"
      projectsPage.searchProject('Dragon');

      // * Should only show matching project
      projectsPage.verifySearchResults([`Dragon Quest ${timestamp}`]);

      // * Clear search
      projectsPage.clearSearch();

      // * Should show all projects
      projectsPage.verifyProjectCount(3);
    });

    it('should sort projects', () => {
      // * Create projects with different dates
      const projects = [
        { name: `Alpha Project ${timestamp}`, description: 'First alphabetically' },
        { name: `Beta Project ${timestamp}`, description: 'Second alphabetically' },
        { name: `Charlie Project ${timestamp}`, description: 'Third alphabetically' }
      ];

      projectsPage.createMultipleProjects(projects);

      // * Sort by name
      projectsPage.sortBy('name');

      // * Verify order
      projectsPage.getProjectCards().first().should('contain', 'Alpha Project');
      projectsPage.getProjectCards().last().should('contain', 'Charlie Project');
    });
  });

  describe('Element Creation and Management', () => {
    let projectId: string;

    before(() => {
      // * Create a project for element tests
      projectsPage.visit();
      projectsPage.createProject(testProject.name, testProject.description);

      // * Get project ID from URL after opening
      projectsPage.openProject(testProject.name);
      cy.url().then((url) => {
        projectId = url.split('/projects/')[1].split('/')[0];
      });
    });

    beforeEach(() => {
      // * Navigate to elements page
      elementsPage.visit(projectId);
    });

    it('should create a new character', () => {
      // * Create character
      elementsPage.createElement(
        'character',
        testCharacter.name,
        testCharacter.description,
        { tags: testCharacter.tags }
      );

      // * Verify character appears in list
      elementsPage.verifyElementExists(testCharacter.name);

      // * Verify element details
      elementsPage.verifyElementDetails(testCharacter.name, {
        description: testCharacter.description,
        type: 'Character',
        completion: 0
      });
    });

    it('should create a new location', () => {
      // * Switch to location tab
      elementsPage.switchToElementType('location');

      // * Create location
      elementsPage.createElement(
        'location',
        testLocation.name,
        testLocation.description,
        { tags: testLocation.tags }
      );

      // * Verify location appears
      elementsPage.verifyElementExists(testLocation.name);
    });

    it('should edit an element', () => {
      // * Create an element first
      const editElement = {
        name: `Edit Character ${timestamp}`,
        description: 'Original character description'
      };

      elementsPage.createElement('character', editElement.name, editElement.description);
      elementsPage.verifyElementExists(editElement.name);

      // * Edit the element
      elementsPage.editElement(editElement.name);

      // * Update description
      const newDescription = 'Updated character with new backstory';
      elementsPage.fillElementDetails(editElement.name, newDescription);
      elementsPage.saveElement();

      // * Verify updated details
      elementsPage.verifyElementDetails(editElement.name, {
        description: newDescription
      });
    });

    it('should delete an element', () => {
      // * Create element to delete
      const deleteElement = {
        name: `Delete Character ${timestamp}`,
        description: 'This character will be deleted'
      };

      elementsPage.createElement('character', deleteElement.name, deleteElement.description);
      elementsPage.verifyElementExists(deleteElement.name);

      // * Delete the element
      elementsPage.deleteElement(deleteElement.name, true);

      // * Verify element is removed
      elementsPage.verifyElementDoesNotExist(deleteElement.name);
    });

    it('should answer element questions', () => {
      // * Open an existing element
      elementsPage.openElement(testCharacter.name);

      // * Answer some questions
      const answers = {
        'appearance': 'Tall, dark-haired, weathered face',
        'personality': 'Noble, brave, reluctant leader',
        'backstory': 'Raised in Rivendell after his father\'s death'
      };

      elementsPage.answerQuestions(answers);
      elementsPage.saveElement();

      // * Verify completion percentage increased
      elementsPage.getCompletionPercentage(testCharacter.name)
        .should('be.greaterThan', 0);
    });

    it('should add relationships between elements', () => {
      // * Ensure we have two elements
      elementsPage.createElement('character', 'Legolas', 'An elven prince');
      elementsPage.verifyElementExists('Legolas');

      // * Open first element
      elementsPage.openElement(testCharacter.name);

      // * Add relationship
      elementsPage.addRelationship(
        'Legolas',
        'friend',
        'Fellow member of the Fellowship'
      );

      // * Verify relationship exists
      elementsPage.verifyRelationshipExists('Legolas', 'friend');
    });

    it('should search and filter elements', () => {
      // * Create multiple elements
      const elements = [
        { name: 'Gandalf', description: 'A wizard' },
        { name: 'Frodo', description: 'A hobbit' },
        { name: 'Gimli', description: 'A dwarf' }
      ];

      elementsPage.createMultipleElements('character', elements);

      // * Search for "Gandalf"
      elementsPage.searchElement('Gandalf');

      // * Should only show matching element
      elementsPage.verifySearchResults(['Gandalf']);

      // * Clear search
      cy.get('[data-cy="element-search-input"]').clear();
    });

    it('should switch between element types', () => {
      // * Verify character tab is active
      elementsPage.verifyActiveTab('character');

      // * Switch to location tab
      elementsPage.switchToElementType('location');
      elementsPage.verifyActiveTab('location');

      // * Switch to item tab
      elementsPage.switchToElementType('item');
      elementsPage.verifyActiveTab('item');

      // * Switch to event tab
      elementsPage.switchToElementType('event');
      elementsPage.verifyActiveTab('event');
    });
  });

  describe('Navigation and Breadcrumbs', () => {
    it('should navigate using breadcrumbs', () => {
      // * Open a project
      projectsPage.visit();
      projectsPage.openProject(testProject.name);

      // * Verify breadcrumb path
      navigationPage.verifyBreadcrumbPath(['Projects', testProject.name]);

      // * Click on Projects breadcrumb
      navigationPage.clickBreadcrumb('Projects');

      // * Should be back on projects page
      cy.url().should('include', '/projects');
      cy.url().should('not.include', testProject.name);
    });

    it('should update element count in project', () => {
      // * Get initial element count
      projectsPage.visit();
      projectsPage.getElementCount(testProject.name).then((initialCount) => {
        // * Open project and add element
        projectsPage.openProject(testProject.name);
        elementsPage.createElement(
          'character',
          `New Hero ${timestamp}`,
          'A new hero character'
        );

        // * Go back to projects
        navigationPage.goToProjects();

        // * Verify element count increased
        projectsPage.getElementCount(testProject.name)
          .should('equal', initialCount + 1);
      });
    });
  });

  describe('Export and Import', () => {
    it('should export elements', () => {
      // * Open project with elements
      projectsPage.visit();
      projectsPage.openProject(testProject.name);

      // * Export elements as JSON
      elementsPage.exportElements('json');

      // * Verify download
      cy.readFile(`cypress/downloads/elements-export.json`)
        .should('exist');
    });

    it('should import elements', () => {
      // * Create a new project for import
      const importProject = {
        name: `Import Test ${timestamp}`,
        description: 'Project for import testing'
      };

      projectsPage.visit();
      projectsPage.createProject(importProject.name, importProject.description);
      projectsPage.openProject(importProject.name);

      // * Import elements from file
      elementsPage.importElements('cypress/fixtures/sample-elements.json');

      // * Verify elements were imported
      elementsPage.verifyElementCount(3); // Assuming fixture has 3 elements
    });
  });
});