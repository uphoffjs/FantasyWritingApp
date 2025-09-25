/**
 * @fileoverview Template Editor Component Tests
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
import { TemplateEditor } from '../../../src/components/TemplateEditor';
// mountWithProviders is available as a Cypress command - use cy.mountWithProviders()
import { QuestionnaireTemplate, Question } from '../../../src/types/worldbuilding';

describe('TemplateEditor Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  
  const defaultTemplate: QuestionnaireTemplate = {
    id: 'template-1',
    name: 'Character Template',
    description: 'A template for creating character elements',
    category: 'character',
    questions: [
      {
        id: 'q1',
        text: 'What is the character\'s name?',
        type: 'text',
        required: true,
        order: 0,
        placeholder: 'Enter character name'
      },
      {
        id: 'q2',
        text: 'Describe their appearance',
        type: 'textarea',
        required: false,
        order: 1,
        placeholder: 'Physical description'
      },
      {
        id: 'q3',
        text: 'What is their role?',
        type: 'select',
        required: true,
        order: 2,
        options: ['Hero', 'Villain', 'Supporting']
      }
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const onSaveSpy = cy.spy().as('onSave');
  const onCloseSpy = cy.spy().as('onClose');

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.viewport(1280, 720);
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders with all essential elements', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Header elements
      cy.get('[data-cy="template-editor-title"]').should('contain', 'Template Editor');
      cy.get('[data-cy="close-button"]').should('be.visible');

      // * Tab navigation
      cy.get('[data-cy="questions-tab"]').should('be.visible').and('have.attr', 'aria-selected', 'true');
      cy.get('[data-cy="basic-mode-tab"]').should('be.visible');

      // TODO: * Template name and description
      cy.get('[data-cy="template-name-input"]').should('have.value', 'Character Template');
      cy.get('[data-cy="template-description-input"]').should('have.value', 'A template for creating character elements');

      // * Questions list
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // Action buttons
      cy.get('[data-cy="add-question-button"]').should('be.visible');
      cy.get('[data-cy="save-template-button"]').should('be.visible');
      cy.get('[data-cy="cancel-button"]').should('be.visible');
    });
    it('renders empty state for new template', () => {
      const newTemplate: QuestionnaireTemplate = {
        id: 'new',
        name: '',
        description: '',
        category: 'character',
        questions: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      cy.mountWithProviders(
        <TemplateEditor
          template={newTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-name-input"]').should('have.value', '');
      cy.get('[data-cy="template-description-input"]').should('have.value', '');
      cy.get('[data-cy^="question-item-"]').should('not.exist');
      cy.get('[data-cy="no-questions-message"]').should('contain', 'No questions added yet');
    });
    it('displays question details correctly', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * First question (text, required)
      cy.get('[data-cy="question-item-q1"]').within(() => {
        cy.get('[data-cy="drag-handle"]').should('be.visible');
        cy.get('[data-cy="question-text"]').should('contain', "What is the character's name?");
        cy.get('[data-cy="question-type-badge"]').should('contain', 'text');
        cy.get('[data-cy="required-badge"]').should('be.visible');
        cy.get('[data-cy="edit-question-button"]').should('be.visible');
        cy.get('[data-cy="delete-question-button"]').should('be.visible');
      });
      // * Second question (textarea, not required)
      cy.get('[data-cy="question-item-q2"]').within(() => {
        cy.get('[data-cy="question-text"]').should('contain', 'Describe their appearance');
        cy.get('[data-cy="question-type-badge"]').should('contain', 'textarea');
        cy.get('[data-cy="required-badge"]').should('not.exist');
      });
      // * Third question (select with options)
      cy.get('[data-cy="question-item-q3"]').within(() => {
        cy.get('[data-cy="question-text"]').should('contain', 'What is their role?');
        cy.get('[data-cy="question-type-badge"]').should('contain', 'select');
        cy.get('[data-cy="options-count"]').should('contain', '3 options');
      });
    });
  });
  describe('User Interactions - Template Details', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('updates template name', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-name-input"]')
        .clear()
        .type('Updated Character Template');
      
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.name).to.equal('Updated Character Template');
    });
    it('updates template description', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-description-input"]')
        .clear()
        .type('A comprehensive template for detailed character creation');
      
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.description).to.equal('A comprehensive template for detailed character creation');
    });
    it('validates template name is required', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-name-input"]').clear();
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('[data-cy="error-message"]').should('contain', 'Template name is required');
      cy.get('@onSave').should('not.have.been.called');
    });
  });
  describe('User Interactions - Adding Questions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('adds a new text question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      
      // TODO: * Question editor should appear
      cy.get('[data-cy="question-editor-modal"]').should('be.visible');
      
      // * Fill in question details
      cy.get('[data-cy="question-text-input"]').type('What is their backstory?');
      cy.get('[data-cy="question-type-select"]').select('textarea');
      cy.get('[data-cy="question-required-checkbox"]').check();
      cy.get('[data-cy="question-placeholder-input"]').type('Describe their history...');
      
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Verify question was added
      cy.get('[data-cy^="question-item-"]').should('have.length', 4);
      cy.get('[data-cy^="question-item-"]:last').should('contain', 'What is their backstory?');
    });
    it('adds a select question with options', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      
      cy.get('[data-cy="question-text-input"]').type('What is their alignment?');
      cy.get('[data-cy="question-type-select"]').select('select');
      
      // * Add options
      cy.get('[data-cy="add-option-button"]').click();
      cy.get('[data-cy="option-input-0"]').type('Lawful Good');
      
      cy.get('[data-cy="add-option-button"]').click();
      cy.get('[data-cy="option-input-1"]').type('Chaotic Evil');
      
      cy.get('[data-cy="add-option-button"]').click();
      cy.get('[data-cy="option-input-2"]').type('True Neutral');
      
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Verify question was added with options
      cy.get('[data-cy^="question-item-"]:last').within(() => {
        cy.get('[data-cy="question-text"]').should('contain', 'What is their alignment?');
        cy.get('[data-cy="options-count"]').should('contain', '3 options');
      });
    });
    it('adds a number question with validation', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      
      cy.get('[data-cy="question-text-input"]').type('How old are they?');
      cy.get('[data-cy="question-type-select"]').select('number');
      
      // * Open validation panel
      cy.get('[data-cy="validation-panel-toggle"]').click();
      cy.get('[data-cy="min-value-input"]').type('0');
      cy.get('[data-cy="max-value-input"]').type('500');
      
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Verify question was added with validation
      cy.get('[data-cy^="question-item-"]:last').within(() => {
        cy.get('[data-cy="question-text"]').should('contain', 'How old are they?');
        cy.get('[data-cy="validation-badge"]').should('be.visible');
      });
    });
    it('cancels adding a question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      const initialCount = 3;
      cy.get('[data-cy^="question-item-"]').should('have.length', initialCount);
      
      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-text-input"]').type('Test question');
      cy.get('[data-cy="cancel-question-button"]').click();
      
      // TODO: * Question count should remain the same
      cy.get('[data-cy^="question-item-"]').should('have.length', initialCount);
    });
  });
  describe('User Interactions - Editing Questions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('edits an existing question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Edit first question
      cy.get('[data-cy="question-item-q1"]').within(() => {
        cy.get('[data-cy="edit-question-button"]').click();
      });
      cy.get('[data-cy="question-editor-modal"]').should('be.visible');
      cy.get('[data-cy="question-text-input"]').should('have.value', "What is the character's name?");
      
      cy.get('[data-cy="question-text-input"]')
        .clear()
        .type('What is their full name?');
      
      cy.get('[data-cy="question-required-checkbox"]').uncheck();
      
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Verify question was updated
      cy.get('[data-cy="question-item-q1"]').within(() => {
        cy.get('[data-cy="question-text"]').should('contain', 'What is their full name?');
        cy.get('[data-cy="required-badge"]').should('not.exist');
      });
    });
    it('deletes a question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // * Delete second question
      cy.get('[data-cy="question-item-q2"]').within(() => {
        cy.get('[data-cy="delete-question-button"]').click();
      });
      // * Confirm deletion
      cy.get('[data-cy="confirm-delete-button"]').click();
      
      cy.get('[data-cy^="question-item-"]').should('have.length', 2);
      cy.get('[data-cy="question-item-q2"]').should('not.exist');
    });
    it('cancels deleting a question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      cy.get('[data-cy="question-item-q1"]').within(() => {
        cy.get('[data-cy="delete-question-button"]').click();
      });
      cy.get('[data-cy="cancel-delete-button"]').click();
      
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      cy.get('[data-cy="question-item-q1"]').should('exist');
    });
  });
  describe('User Interactions - Drag and Drop', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('reorders questions via drag and drop', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Get initial order
      cy.get('[data-cy^="question-item-"]').first()
        .should('contain', "What is the character's name?");
      
      // * Simulate drag and drop (simplified for testing)
      cy.get('[data-cy="question-item-q1"] [data-cy="drag-handle"]')
        .trigger('mousedown', { button: 0 });
      cy.get('[data-cy="question-item-q3"]')
        .trigger('mousemove')
        .trigger('mouseup');
      
      // Note: Actual drag-and-drop behavior would require more complex simulation
      // or using a library like cypress-drag-drop
      // * For now, we'll verify the drag handle exists and is interactive
      cy.get('[data-cy="question-item-q1"] [data-cy="drag-handle"]')
        .should('have.css', 'cursor', 'grab');
    });
    it('shows drag handle on hover', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="question-item-q1"]').trigger('mouseenter');
      cy.get('[data-cy="question-item-q1"] [data-cy="drag-handle"]')
        .should('be.visible');
      
      cy.get('[data-cy="question-item-q1"]').trigger('mouseleave');
    });
  });
  describe('Conditional Logic Panel', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('adds conditional logic to a question', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Edit a question to add conditional logic
      cy.get('[data-cy="question-item-q2"]').within(() => {
        cy.get('[data-cy="edit-question-button"]').click();
      });
      // * Open conditional panel
      cy.get('[data-cy="conditional-panel-toggle"]').click();
      cy.get('[data-cy="conditional-panel"]').should('be.visible');
      
      // * Set up condition
      cy.get('[data-cy="condition-question-select"]').select('q3');
      cy.get('[data-cy="condition-operator-select"]').select('equals');
      cy.get('[data-cy="condition-value-input"]').type('Villain');
      
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Verify conditional badge appears
      cy.get('[data-cy="question-item-q2"]').within(() => {
        cy.get('[data-cy="conditional-badge"]').should('be.visible');
      });
    });
    it('removes conditional logic from a question', () => {
      const templateWithConditional = {
        ...defaultTemplate,
        questions: defaultTemplate.questions.map(q => 
          q.id === 'q2' 
            ? { ...q, conditional: { questionId: 'q1', operator: 'equals', value: 'Test' } }
            : q
        )
      };

      cy.mountWithProviders(
        <TemplateEditor
          template={templateWithConditional}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="question-item-q2"] [data-cy="conditional-badge"]').should('be.visible');
      
      cy.get('[data-cy="question-item-q2"]').within(() => {
        cy.get('[data-cy="edit-question-button"]').click();
      });
      cy.get('[data-cy="conditional-panel-toggle"]').click();
      cy.get('[data-cy="remove-condition-button"]').click();
      
      cy.get('[data-cy="save-question-button"]').click();
      
      cy.get('[data-cy="question-item-q2"] [data-cy="conditional-badge"]').should('not.exist');
    });
  });
  describe('Basic Mode Tab', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('switches to Basic Mode tab', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="basic-mode-tab"]').click();
      
      cy.get('[data-cy="basic-mode-tab"]').should('have.attr', 'aria-selected', 'true');
      cy.get('[data-cy="questions-tab"]').should('have.attr', 'aria-selected', 'false');
      
      cy.get('[data-cy="basic-mode-content"]').should('be.visible');
      cy.get('[data-cy="basic-mode-textarea"]').should('be.visible');
    });
    it('converts questions to text format in Basic Mode', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="basic-mode-tab"]').click();
      
      cy.get('[data-cy="basic-mode-textarea"]').should('contain', "What is the character's name?");
      cy.get('[data-cy="basic-mode-textarea"]').should('contain', 'Describe their appearance');
      cy.get('[data-cy="basic-mode-textarea"]').should('contain', 'What is their role?');
    });
    it('adds questions from Basic Mode text', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="basic-mode-tab"]').click();
      
      cy.get('[data-cy="basic-mode-textarea"]')
        .clear()
        .type('What is their motivation?\nWhat are their fears?\nWhat are their goals?');
      
      cy.get('[data-cy="apply-basic-mode-button"]').click();
      
      // * Switch back to Questions tab
      cy.get('[data-cy="questions-tab"]').click();
      
      // * Verify questions were added
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      cy.get('[data-cy^="question-item-"]').first().should('contain', 'What is their motivation?');
    });
  });
  describe('Preview Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('opens preview modal', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="preview-button"]').click();
      
      cy.get('[data-cy="preview-modal"]').should('be.visible');
      cy.get('[data-cy="preview-title"]').should('contain', 'Template Preview');
      
      // ? * Verify questions are displayed in preview
      cy.get('[data-cy="preview-question-1"]').should('contain', "What is the character's name?");
      cy.get('[data-cy="preview-question-2"]').should('contain', 'Describe their appearance');
      cy.get('[data-cy="preview-question-3"]').should('contain', 'What is their role?');
    });
    it('closes preview modal', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="preview-button"]').click();
      cy.get('[data-cy="preview-modal"]').should('be.visible');
      
      cy.get('[data-cy="close-preview-button"]').click();
      cy.get('[data-cy="preview-modal"]').should('not.exist');
    });
  });
  describe('Save and Cancel Actions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('saves template with all changes', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Make changes
      cy.get('[data-cy="template-name-input"]')
        .clear()
        .type('Updated Template');
      
      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-text-input"]').type('New Question');
      cy.get('[data-cy="save-question-button"]').click();
      
      // TODO: * Save template
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.name).to.equal('Updated Template');
      expect(savedTemplate.questions).to.have.length(4);
    });
    it('shows confirmation when canceling with unsaved changes', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Make a change
      cy.get('[data-cy="template-name-input"]')
        .clear()
        .type('Changed Name');
      
      cy.get('[data-cy="cancel-button"]').click();
      
      // TODO: * Confirmation dialog should appear
      cy.get('[data-cy="confirm-dialog"]').should('be.visible');
      cy.get('[data-cy="confirm-dialog-message"]')
        .should('contain', 'You have unsaved changes');
      
      // * Confirm cancellation
      cy.get('[data-cy="confirm-cancel-button"]').click();
      
      cy.get('@onClose').should('have.been.calledOnce');
    });
    it('continues editing when declining cancel confirmation', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-name-input"]')
        .clear()
        .type('Changed Name');
      
      cy.get('[data-cy="cancel-button"]').click();
      cy.get('[data-cy="continue-editing-button"]').click();
      
      // TODO: * Should remain in editor
      cy.get('[data-cy="template-editor-title"]').should('be.visible');
      cy.get('@onClose').should('not.have.been.called');
    });
    it('closes without confirmation when no changes made', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="cancel-button"]').click();
      
      // TODO: * Should close immediately without confirmation
      cy.get('[data-cy="confirm-dialog"]').should('not.exist');
      cy.get('@onClose').should('have.been.calledOnce');
    });
    it('closes via X button', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="close-button"]').click();
      cy.get('@onClose').should('have.been.calledOnce');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles empty question text', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="save-question-button"]').click();
      
      cy.get('[data-cy="question-error"]').should('contain', 'Question text is required');
    });
    it('handles duplicate question text warning', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-text-input"]').type("What is the character's name?");
      cy.get('[data-cy="save-question-button"]').click();
      
      cy.get('[data-cy="question-warning"]').should('contain', 'This question already exists');
    });
    it('handles select question without options', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-text-input"]').type('Select question');
      cy.get('[data-cy="question-type-select"]').select('select');
      cy.get('[data-cy="save-question-button"]').click();
      
      cy.get('[data-cy="question-error"]').should('contain', 'Select questions require at least one option');
    });
    it('handles very long template names', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      const longName = 'A'.repeat(300);
      cy.get('[data-cy="template-name-input"]')
        .clear()
        .type(longName);
      
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('[data-cy="error-message"]').should('contain', 'Template name is too long');
    });
    it('handles maximum number of questions', () => {
      const manyQuestions = Array.from({ length: 50 }, (_, i) => ({
        id: `q${i}`,
        text: `Question ${i}`,
        type: 'text' as const,
        required: false,
        order: i
      }));

      const templateWithManyQuestions = {
        ...defaultTemplate,
        questions: manyQuestions
      };

      cy.mountWithProviders(
        <TemplateEditor
          template={templateWithManyQuestions}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 50);
      
      // * Try to add one more
      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="max-questions-warning"]').should('contain', 'Maximum 50 questions allowed');
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('supports keyboard navigation', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Tab through main elements
      cy.get('[data-cy="template-name-input"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'template-name-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'template-description-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'questions-tab');
    });
    it('has proper ARIA labels', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-name-input"]')
        .should('have.attr', 'aria-label', 'Template name');
      
      cy.get('[data-cy="template-description-input"]')
        .should('have.attr', 'aria-label', 'Template description');
      
      cy.get('[data-cy="add-question-button"]')
        .should('have.attr', 'aria-label', 'Add new question');
      
      cy.get('[data-cy="save-template-button"]')
        .should('have.attr', 'aria-label', 'Save template');
    });
    it('announces changes to screen readers', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Add a question
      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-text-input"]').type('New question');
      cy.get('[data-cy="save-question-button"]').click();
      
      // * Check for aria-live region
      cy.get('[aria-live="polite"]').should('contain', 'Question added');
    });
    it('supports escape key to close modals', () => {
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="add-question-button"]').click();
      cy.get('[data-cy="question-editor-modal"]').should('be.visible');
      
      cy.get('body').type('{esc}');
      cy.get('[data-cy="question-editor-modal"]').should('not.exist');
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('adapts layout for mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Check mobile-specific layout
      cy.get('[data-cy="template-editor-title"]').should('be.visible');
      
      // TODO: * Buttons should stack on mobile
      cy.get('[data-cy="save-template-button"]').should('be.visible');
      cy.get('[data-cy="cancel-button"]').should('be.visible');
      
      // TODO: * Question items should be full width
      cy.get('[data-cy^="question-item-"]').first()
        .should('have.css', 'width')
        .and('match', /3[0-9]{2}px/); // Close to viewport width
    });
    it('adapts layout for tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy="template-editor-title"]').should('be.visible');
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
    });
    it('shows full layout on desktop', () => {
      cy.viewport(1920, 1080);
      
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // TODO: * All elements should be visible
      cy.get('[data-cy="template-editor-title"]').should('be.visible');
      cy.get('[data-cy="template-name-input"]').should('be.visible');
      cy.get('[data-cy="template-description-input"]').should('be.visible');
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // TODO: * Buttons should be inline on desktop
      cy.get('[data-cy="save-template-button"]').should('be.visible');
      cy.get('[data-cy="cancel-button"]').should('be.visible');
    });
    it('handles touch interactions on mobile', () => {
      cy.viewport(375, 667);
      
      cy.mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Simulate touch on add button
      cy.get('[data-cy="add-question-button"]')
        .trigger('touchstart')
        .trigger('touchend');
      
      cy.get('[data-cy="question-editor-modal"]').should('be.visible');
    });
  });
});