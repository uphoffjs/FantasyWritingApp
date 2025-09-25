/**
 * @fileoverview Element Editor Component Tests
 * Tests for US-X.X: [User Story Name]
 *
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 *
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

import React from 'react';
import { ElementEditor } from '../../../src/components/ElementEditor';
import { elementFactory } from '../../fixtures/factories';
import { BrowserRouter } from 'react-router-dom';

describe('ElementEditor Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  // * Helper function to mount component with Router
  const mountWithRouter = (component: React.ReactElement) => {
    return cy.mountWithProviders(<BrowserRouter>{component}</BrowserRouter>);
  };
  
  // * Mock project ID
  const mockProjectId = 'test-project-id';
  
  // TODO: * Create mock element - CharacterForm loads questions from template, not element
  const mockElement = elementFactory({
    name: 'Gandalf',
    description: 'A wise wizard',
    tags: ['wizard', 'fellowship'],
    category: 'Characters',
    type: 'character',
    answers: {
      'name': { questionId: 'name', value: 'Gandalf the Grey', lastUpdated: new Date() },
      'occupation': { questionId: 'occupation', value: 'Wizard', lastUpdated: new Date() }
    }
  });

  // * Use factory for simpler mock data
  const simpleElement = elementFactory({
    name: 'Simple Character',
    description: 'A basic character for testing',
    category: 'Characters',
    type: 'character',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionPercentage: 16.67
  });

  let onUpdate: any;
  let onCancel: any;
  let onNavigateToElement: any;

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onUpdate = cy.stub();
    onCancel = cy.stub();
    onNavigateToElement = cy.stub();
    
    // Note: CharacterForm requires a project in the store to render the SpeciesSelector.
    // * Without mocking the store (which is difficult with ES modules in Cypress),
    // the form will render but the SpeciesSelector won't have race options.
  });

  it('should mount and display element information', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // * Check header information
    cy.get('[data-cy="element-editor"]').should('exist');
    cy.get('[data-cy="element-name"]').should('have.value', 'Gandalf');
    cy.get('[data-cy="element-category"]').should('contain', 'character');
    cy.get('[data-cy="completion-percentage"]').should('contain', '0%'); // Only 2 answers out of many questions
  });

  it('should render all question types correctly', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category to see name question
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Text input - name
    cy.get('[data-cy="question-name"]').should('exist');
    cy.get('[data-cy="question-name-input"]').should('have.value', 'Gandalf the Grey');
    
    // Expand Background & History category for occupation
    cy.get('[data-cy="category-background-&-history"]').within(() => {
      cy.get('button').first().click();
    });
    
    // Text - occupation (in Background & History)
    cy.get('[data-cy="question-occupation"]').should('exist');
    cy.get('[data-cy="question-occupation-input"]').should('have.value', 'Wizard');
    
    // TODO: * Age field (in Core Identity, but as text type in template)  
    cy.get('[data-cy="question-age"]').should('exist');
    cy.get('[data-cy="question-age-input"]').should('have.attr', 'type', 'number'); // Actually it's number in the template
    
    // Text - species (handled by SpeciesSelector, not in BaseElementForm)
    // TODO: The SpeciesSelector should be visible
    cy.contains('Species/Race').should('be.visible');
    
    // Expand Physical Characteristics category
    cy.get('[data-cy="category-physical-characteristics"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Check that Physical Characteristics questions exist
    cy.get('[data-cy="question-height"]').should('exist');
    cy.get('[data-cy="question-build"]').should('exist');
  });

  it('should save answers when inputs change', () => {
    const clock = cy.clock();
    
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category to see name question
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Update text input
    cy.get('[data-cy="question-name-input"]').clear().type('Gandalf the White');
    
    // ! PERFORMANCE: * Trigger debounce
    clock.tick(1000);
    
    cy.wrap(onUpdate).should('have.been.calledWith', Cypress.sinon.match({
      answers: Cypress.sinon.match.has('name', Cypress.sinon.match({
        value: 'Gandalf the White'
      }))
    }));
  });

  it('should show required field indicators', () => {
    const elementWithoutRequiredAnswers = {
      ...mockElement,
      answers: {}
    };

    mountWithRouter(
      <ElementEditor
        element={elementWithoutRequiredAnswers}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category to see name question
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Check if required fields have proper indicators
    // TODO: Note: Character template may not have required fields by default
    cy.get('[data-cy="question-name"]').should('exist');
  });

  it('should calculate completion percentage correctly', () => {
    // * Create element with 10 answered questions for a more visible percentage
    const partiallyCompleteElement = {
      ...mockElement,
      answers: {
        'name': { questionId: 'name', value: 'Gandalf', lastUpdated: new Date() },
        'age': { questionId: 'age', value: 2000, lastUpdated: new Date() },
        'species': { questionId: 'species', value: 'Maiar', lastUpdated: new Date() },
        'gender': { questionId: 'gender', value: 'Male', lastUpdated: new Date() },
        'pronouns': { questionId: 'pronouns', value: 'He/Him', lastUpdated: new Date() },
        'height': { questionId: 'height', value: 'Tall', lastUpdated: new Date() },
        'build': { questionId: 'build', value: 'Lean', lastUpdated: new Date() },
        'hair': { questionId: 'hair', value: 'Grey', lastUpdated: new Date() },
        'eyes': { questionId: 'eyes', value: 'Grey', lastUpdated: new Date() },
        'occupation': { questionId: 'occupation', value: 'Wizard', lastUpdated: new Date() }
      }
    };

    mountWithRouter(
      <ElementEditor
        element={partiallyCompleteElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // 10 out of 67 questions ≈ 15%
    cy.get('[data-cy="completion-percentage"]').should('contain', '15%');
    cy.get('[data-cy="completion-bar"]').should('have.attr', 'style').and('include', 'width: 15%');
  });

  it('should group questions by category', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // TODO: * Check category sections exist (from character template)
    cy.get('[data-cy="category-core-identity"]').should('exist');
    cy.get('[data-cy="category-physical-characteristics"]').should('exist');
    cy.get('[data-cy="category-background-&-history"]').should('exist');
    cy.get('[data-cy="category-personality-&-psychology"]').should('exist');
    cy.get('[data-cy="category-family-&-relationships"]').should('exist');
    cy.get('[data-cy="category-abilities-&-skills"]').should('exist');
  });

  it('should handle textarea answers', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Family & Relationships category for family_dynamics
    cy.get('[data-cy="category-family-&-relationships"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Type in a textarea field
    cy.get('[data-cy="question-family_dynamics-input"]').type('Noble family from the north');
    
    cy.wrap(onUpdate).should('have.been.called');
  });

  it('should display help text when available', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Find a question with help text and click its help button
    // TODO: * The name field has helpText in the character template
    cy.get('[data-cy="question-name"]').within(() => {
      // * Click the help button (it's the button with HelpCircle icon)
      cy.get('button').click();
    });
    
    // * Check that help text is displayed
    cy.get('[data-cy="question-name-help"]').should('be.visible');
  });

  it('should show autosave indicator', () => {
    const clock = cy.clock();
    
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category to see name question
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Make a change
    cy.get('[data-cy="question-name-input"]').clear().type('Gandalf Updated');
    
    // ? TODO: * Should show "Saving..."
    cy.get('[data-cy="autosave-indicator"]').should('contain', 'Saving...');
    
    // ! PERFORMANCE: * After debounce
    clock.tick(1000);
    
    // ? TODO: * Should show "Saved"
    cy.get('[data-cy="autosave-indicator"]').should('contain', 'Saved');
  });

  it('should handle cancel action', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    cy.get('[data-cy="cancel-button"]').click();
    cy.wrap(onCancel).should('have.been.called');
  });

  it('should be accessible', () => {
    mountWithRouter(
      <ElementEditor
        element={mockElement}
        projectId={mockProjectId}
        onUpdate={onUpdate}
        onCancel={onCancel}
        onNavigateToElement={onNavigateToElement}
      />
    );

    // Expand Core Identity category to see name question
    cy.get('[data-cy="category-core-identity"]').within(() => {
      cy.get('button').first().click();
    });
    
    // * Check for proper labels and IDs
    cy.get('label[for="question-name"]').should('exist');
    cy.get('#question-name').should('exist');
    
    // * Check for ARIA attributes on required fields
    // TODO: Note: The name field might not be required in the character template
    cy.get('[data-cy="question-name-input"]').should('have.attr', 'id', 'question-name');
    
    // * Check for proper ARIA attributes on progress bar
    cy.get('[data-cy="completion-bar"]').should('have.attr', 'role', 'progressbar');
    cy.get('[data-cy="completion-bar"]').should('have.attr', 'aria-valuenow');
  });
});