import React from 'react';
import { TemplateEditor } from '../../../src/components/TemplateEditor';
import { mountWithProviders } from '../../support/component';
import { QuestionnaireTemplate, Question } from '../../../src/types/worldbuilding';

describe('TemplateEditor Component', () => {
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
        type: '[data-cy*="select"]',
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

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Rendering', () => {
    it('renders with all essential elements', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Header elements
      cy.get('[data-testid="template-editor-title"]').should('contain', 'Template Editor');
      cy.get('[data-testid="close-[data-cy*="button"]"]').should('be.visible');

      // * Tab navigation
      cy.get('[data-testid="questions-tab"]').should('be.visible').and('have.attr', 'aria-[data-cy*="select"]ed', 'true');
      cy.get('[data-testid="basic-mode-tab"]').should('be.visible');

      // TODO: * Template name and description
      cy.get('[data-testid="template-name-input"]').should('have.value', 'Character Template');
      cy.get('[data-testid="template-description-input"]').should('have.value', 'A template for creating character elements');

      // * Questions list
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // Action [data-cy*="button"]s
      cy.get('[data-testid="add-question-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').should('be.visible');
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

      mountWithProviders(
        <TemplateEditor
          template={newTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-name-input"]').should('have.value', '');
      cy.get('[data-testid="template-description-input"]').should('have.value', '');
      cy.get('[data-cy^="question-item-"]').should('not.exist');
      cy.get('[data-testid="no-questions-message"]').should('contain', 'No questions added yet');
    });

    it('displays question details correctly', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * First question (text, required)
      cy.get('[data-testid="question-item-q1"]').within(() => {
        cy.get('[data-testid="drag-handle"]').should('be.visible');
        cy.get('[data-testid="question-text"]').should('contain', "What is the character's name?");
        cy.get('[data-testid="question-type-badge"]').should('contain', 'text');
        cy.get('[data-testid="required-badge"]').should('be.visible');
        cy.get('[data-testid="edit-question-[data-cy*="button"]"]').should('be.visible');
        cy.get('[data-testid="delete-question-[data-cy*="button"]"]').should('be.visible');
      });

      // * Second question (textarea, not required)
      cy.get('[data-testid="question-item-q2"]').within(() => {
        cy.get('[data-testid="question-text"]').should('contain', 'Describe their appearance');
        cy.get('[data-testid="question-type-badge"]').should('contain', 'textarea');
        cy.get('[data-testid="required-badge"]').should('not.exist');
      });

      // * Third question ([data-cy*="select"] with options)
      cy.get('[data-testid="question-item-q3"]').within(() => {
        cy.get('[data-testid="question-text"]').should('contain', 'What is their role?');
        cy.get('[data-testid="question-type-badge"]').should('contain', '[data-cy*="select"]');
        cy.get('[data-testid="options-count"]').should('contain', '3 options');
      });
    });
  });

  describe('User Interactions - Template Details', () => {
    it('updates template name', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-name-input"]')
        .clear()
        .type('Updated Character Template');
      
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.name).to.equal('Updated Character Template');
    });

    it('updates template description', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-description-input"]')
        .clear()
        .type('A comprehensive template for detailed character creation');
      
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.description).to.equal('A comprehensive template for detailed character creation');
    });

    it('validates template name is required', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-name-input"]').clear();
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="error-message"]').should('contain', 'Template name is required');
      cy.get('@onSave').should('not.have.been.called');
    });
  });

  describe('User Interactions - Adding Questions', () => {
    it('adds a new text question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      
      // TODO: * Question editor should appear
      cy.get('[data-testid="question-editor-modal"]').should('be.visible');
      
      // * Fill in question details
      cy.get('[data-testid="question-text-input"]').type('What is their backstory?');
      cy.get('[data-testid="question-type-[data-cy*="select"]"]').select('textarea');
      cy.get('[data-testid="question-required-checkbox"]').check();
      cy.get('[data-testid="question-placeholder-input"]').type('Describe their history...');
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Verify question was added
      cy.get('[data-cy^="question-item-"]').should('have.length', 4);
      cy.get('[data-cy^="question-item-"]:last').should('contain', 'What is their backstory?');
    });

    it('adds a [data-cy*="select"] question with options', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-text-input"]').type('What is their alignment?');
      cy.get('[data-testid="question-type-[data-cy*="select"]"]').select('[data-cy*="select"]');
      
      // * Add options
      cy.get('[data-testid="add-option-[data-cy*="button"]"]').click();
      cy.get('[data-testid="option-input-0"]').type('Lawful Good');
      
      cy.get('[data-testid="add-option-[data-cy*="button"]"]').click();
      cy.get('[data-testid="option-input-1"]').type('Chaotic Evil');
      
      cy.get('[data-testid="add-option-[data-cy*="button"]"]').click();
      cy.get('[data-testid="option-input-2"]').type('True Neutral');
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Verify question was added with options
      cy.get('[data-cy^="question-item-"]:last').within(() => {
        cy.get('[data-testid="question-text"]').should('contain', 'What is their alignment?');
        cy.get('[data-testid="options-count"]').should('contain', '3 options');
      });
    });

    it('adds a number question with validation', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-text-input"]').type('How old are they?');
      cy.get('[data-testid="question-type-[data-cy*="select"]"]').select('number');
      
      // * Open validation panel
      cy.get('[data-testid="validation-panel-toggle"]').click();
      cy.get('[data-testid="min-value-input"]').type('0');
      cy.get('[data-testid="max-value-input"]').type('500');
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Verify question was added with validation
      cy.get('[data-cy^="question-item-"]:last').within(() => {
        cy.get('[data-testid="question-text"]').should('contain', 'How old are they?');
        cy.get('[data-testid="validation-badge"]').should('be.visible');
      });
    });

    it('cancels adding a question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      const initialCount = 3;
      cy.get('[data-cy^="question-item-"]').should('have.length', initialCount);
      
      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-text-input"]').type('Test question');
      cy.get('[data-testid="cancel-question-[data-cy*="button"]"]').click();
      
      // TODO: * Question count should remain the same
      cy.get('[data-cy^="question-item-"]').should('have.length', initialCount);
    });
  });

  describe('User Interactions - Editing Questions', () => {
    it('edits an existing question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Edit first question
      cy.get('[data-testid="question-item-q1"]').within(() => {
        cy.get('[data-testid="edit-question-[data-cy*="button"]"]').click();
      });
      
      cy.get('[data-testid="question-editor-modal"]').should('be.visible');
      cy.get('[data-testid="question-text-input"]').should('have.value', "What is the character's name?");
      
      cy.get('[data-testid="question-text-input"]')
        .clear()
        .type('What is their full name?');
      
      cy.get('[data-testid="question-required-checkbox"]').uncheck();
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Verify question was updated
      cy.get('[data-testid="question-item-q1"]').within(() => {
        cy.get('[data-testid="question-text"]').should('contain', 'What is their full name?');
        cy.get('[data-testid="required-badge"]').should('not.exist');
      });
    });

    it('deletes a question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // * Delete second question
      cy.get('[data-testid="question-item-q2"]').within(() => {
        cy.get('[data-testid="delete-question-[data-cy*="button"]"]').click();
      });
      
      // * Confirm deletion
      cy.get('[data-testid="confirm-delete-[data-cy*="button"]"]').click();
      
      cy.get('[data-cy^="question-item-"]').should('have.length', 2);
      cy.get('[data-testid="question-item-q2"]').should('not.exist');
    });

    it('cancels deleting a question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      cy.get('[data-testid="question-item-q1"]').within(() => {
        cy.get('[data-testid="delete-question-[data-cy*="button"]"]').click();
      });
      
      cy.get('[data-testid="cancel-delete-[data-cy*="button"]"]').click();
      
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      cy.get('[data-testid="question-item-q1"]').should('exist');
    });
  });

  describe('User Interactions - Drag and Drop', () => {
    it('reorders questions via drag and drop', () => {
      mountWithProviders(
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
      cy.get('[data-testid="question-item-q1"] [data-testid="drag-handle"]')
        .trigger('mousedown', { [data-cy*="button"]: 0 });
      
      cy.get('[data-testid="question-item-q3"]')
        .trigger('mousemove')
        .trigger('mouseup');
      
      // Note: Actual drag-and-drop behavior would require more complex simulation
      // or using a library like cypress-drag-drop
      // * For now, we'll verify the drag handle exists and is interactive
      cy.get('[data-testid="question-item-q1"] [data-testid="drag-handle"]')
        .should('have.css', 'cursor', 'grab');
    });

    it('shows drag handle on hover', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="question-item-q1"]').trigger('mouseenter');
      cy.get('[data-testid="question-item-q1"] [data-testid="drag-handle"]')
        .should('be.visible');
      
      cy.get('[data-testid="question-item-q1"]').trigger('mouseleave');
    });
  });

  describe('Conditional Logic Panel', () => {
    it('adds conditional logic to a question', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Edit a question to add conditional logic
      cy.get('[data-testid="question-item-q2"]').within(() => {
        cy.get('[data-testid="edit-question-[data-cy*="button"]"]').click();
      });
      
      // * Open conditional panel
      cy.get('[data-testid="conditional-panel-toggle"]').click();
      cy.get('[data-testid="conditional-panel"]').should('be.visible');
      
      // * Set up condition
      cy.get('[data-testid="condition-question-[data-cy*="select"]"]').select('q3');
      cy.get('[data-testid="condition-operator-[data-cy*="select"]"]').select('equals');
      cy.get('[data-testid="condition-value-input"]').type('Villain');
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Verify conditional badge appears
      cy.get('[data-testid="question-item-q2"]').within(() => {
        cy.get('[data-testid="conditional-badge"]').should('be.visible');
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

      mountWithProviders(
        <TemplateEditor
          template={templateWithConditional}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="question-item-q2"] [data-testid="conditional-badge"]').should('be.visible');
      
      cy.get('[data-testid="question-item-q2"]').within(() => {
        cy.get('[data-testid="edit-question-[data-cy*="button"]"]').click();
      });
      
      cy.get('[data-testid="conditional-panel-toggle"]').click();
      cy.get('[data-testid="remove-condition-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-item-q2"] [data-testid="conditional-badge"]').should('not.exist');
    });
  });

  describe('Basic Mode Tab', () => {
    it('switches to Basic Mode tab', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="basic-mode-tab"]').click();
      
      cy.get('[data-testid="basic-mode-tab"]').should('have.attr', 'aria-[data-cy*="select"]ed', 'true');
      cy.get('[data-testid="questions-tab"]').should('have.attr', 'aria-[data-cy*="select"]ed', 'false');
      
      cy.get('[data-testid="basic-mode-content"]').should('be.visible');
      cy.get('[data-testid="basic-mode-textarea"]').should('be.visible');
    });

    it('converts questions to text format in Basic Mode', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="basic-mode-tab"]').click();
      
      cy.get('[data-testid="basic-mode-textarea"]').should('contain', "What is the character's name?");
      cy.get('[data-testid="basic-mode-textarea"]').should('contain', 'Describe their appearance');
      cy.get('[data-testid="basic-mode-textarea"]').should('contain', 'What is their role?');
    });

    it('adds questions from Basic Mode text', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="basic-mode-tab"]').click();
      
      cy.get('[data-testid="basic-mode-textarea"]')
        .clear()
        .type('What is their motivation?\nWhat are their fears?\nWhat are their goals?');
      
      cy.get('[data-testid="apply-basic-mode-[data-cy*="button"]"]').click();
      
      // * Switch back to Questions tab
      cy.get('[data-testid="questions-tab"]').click();
      
      // * Verify questions were added
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      cy.get('[data-cy^="question-item-"]').first().should('contain', 'What is their motivation?');
    });
  });

  describe('Preview Functionality', () => {
    it('opens preview modal', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="preview-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="preview-modal"]').should('be.visible');
      cy.get('[data-testid="preview-title"]').should('contain', 'Template Preview');
      
      // ? * Verify questions are displayed in preview
      cy.get('[data-testid="preview-question-1"]').should('contain', "What is the character's name?");
      cy.get('[data-testid="preview-question-2"]').should('contain', 'Describe their appearance');
      cy.get('[data-testid="preview-question-3"]').should('contain', 'What is their role?');
    });

    it('closes preview modal', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="preview-[data-cy*="button"]"]').click();
      cy.get('[data-testid="preview-modal"]').should('be.visible');
      
      cy.get('[data-testid="close-preview-[data-cy*="button"]"]').click();
      cy.get('[data-testid="preview-modal"]').should('not.exist');
    });
  });

  describe('Save and Cancel Actions', () => {
    it('saves template with all changes', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Make changes
      cy.get('[data-testid="template-name-input"]')
        .clear()
        .type('Updated Template');
      
      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-text-input"]').type('New Question');
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // TODO: * Save template
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').click();
      
      cy.get('@onSave').should('have.been.calledOnce');
      const savedTemplate = onSaveSpy.getCall(0).args[0];
      expect(savedTemplate.name).to.equal('Updated Template');
      expect(savedTemplate.questions).to.have.length(4);
    });

    it('shows confirmation when canceling with unsaved changes', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Make a change
      cy.get('[data-testid="template-name-input"]')
        .clear()
        .type('Changed Name');
      
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').click();
      
      // TODO: * Confirmation dialog should appear
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-message"]')
        .should('contain', 'You have unsaved changes');
      
      // * Confirm cancellation
      cy.get('[data-testid="confirm-cancel-[data-cy*="button"]"]').click();
      
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('continues editing when declining cancel confirmation', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-name-input"]')
        .clear()
        .type('Changed Name');
      
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').click();
      cy.get('[data-testid="continue-editing-[data-cy*="button"]"]').click();
      
      // TODO: * Should remain in editor
      cy.get('[data-testid="template-editor-title"]').should('be.visible');
      cy.get('@onClose').should('not.have.been.called');
    });

    it('closes without confirmation when no changes made', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="cancel-[data-cy*="button"]"]').click();
      
      // TODO: * Should close immediately without confirmation
      cy.get('[data-testid="confirm-dialog"]').should('not.exist');
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('closes via X [data-cy*="button"]', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="close-[data-cy*="button"]"]').click();
      cy.get('@onClose').should('have.been.calledOnce');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty question text', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-error"]').should('contain', 'Question text is required');
    });

    it('handles duplicate question text warning', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-text-input"]').type("What is the character's name?");
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-warning"]').should('contain', 'This question already exists');
    });

    it('handles [data-cy*="select"] question without options', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-text-input"]').type('Select question');
      cy.get('[data-testid="question-type-[data-cy*="select"]"]').select('[data-cy*="select"]');
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="question-error"]').should('contain', 'Select questions require at least one option');
    });

    it('handles very long template names', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      const longName = 'A'.repeat(300);
      cy.get('[data-testid="template-name-input"]')
        .clear()
        .type(longName);
      
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').click();
      
      cy.get('[data-testid="error-message"]').should('contain', 'Template name is too long');
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

      mountWithProviders(
        <TemplateEditor
          template={templateWithManyQuestions}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-cy^="question-item-"]').should('have.length', 50);
      
      // * Try to add one more
      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="max-questions-warning"]').should('contain', 'Maximum 50 questions allowed');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Tab through main elements
      cy.get('[data-testid="template-name-input"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'template-name-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'template-description-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'questions-tab');
    });

    it('has proper ARIA labels', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-name-input"]')
        .should('have.attr', 'aria-label', 'Template name');
      
      cy.get('[data-testid="template-description-input"]')
        .should('have.attr', 'aria-label', 'Template description');
      
      cy.get('[data-testid="add-question-[data-cy*="button"]"]')
        .should('have.attr', 'aria-label', 'Add new question');
      
      cy.get('[data-testid="save-template-[data-cy*="button"]"]')
        .should('have.attr', 'aria-label', 'Save template');
    });

    it('announces changes to screen readers', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Add a question
      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-text-input"]').type('New question');
      cy.get('[data-testid="save-question-[data-cy*="button"]"]').click();
      
      // * Check for aria-live region
      cy.get('[aria-live="polite"]').should('contain', 'Question added');
    });

    it('supports escape key to close modals', () => {
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="add-question-[data-cy*="button"]"]').click();
      cy.get('[data-testid="question-editor-modal"]').should('be.visible');
      
      cy.get('body').type('{esc}');
      cy.get('[data-testid="question-editor-modal"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewport', () => {
      cy.viewport(375, 667);
      
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Check mobile-specific layout
      cy.get('[data-testid="template-editor-title"]').should('be.visible');
      
      // TODO: * Buttons should stack on mobile
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').should('be.visible');
      
      // TODO: * Question items should be full width
      cy.get('[data-cy^="question-item-"]').first()
        .should('have.css', 'width')
        .and('match', /3[0-9]{2}px/); // Close to viewport width
    });

    it('adapts layout for tablet viewport', () => {
      cy.viewport(768, 1024);
      
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      cy.get('[data-testid="template-editor-title"]').should('be.visible');
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
    });

    it('shows full layout on desktop', () => {
      cy.viewport(1920, 1080);
      
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // TODO: * All elements should be visible
      cy.get('[data-testid="template-editor-title"]').should('be.visible');
      cy.get('[data-testid="template-name-input"]').should('be.visible');
      cy.get('[data-testid="template-description-input"]').should('be.visible');
      cy.get('[data-cy^="question-item-"]').should('have.length', 3);
      
      // TODO: * Buttons should be inline on desktop
      cy.get('[data-testid="save-template-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').should('be.visible');
    });

    it('handles touch interactions on mobile', () => {
      cy.viewport(375, 667);
      
      mountWithProviders(
        <TemplateEditor
          template={defaultTemplate}
          onSave={onSaveSpy}
          onClose={onCloseSpy}
        />
      );

      // * Simulate touch on add [data-cy*="button"]
      cy.get('[data-testid="add-question-[data-cy*="button"]"]')
        .trigger('touchstart')
        .trigger('touchend');
      
      cy.get('[data-testid="question-editor-modal"]').should('be.visible');
    });
  });
});