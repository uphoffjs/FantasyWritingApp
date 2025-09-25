/**
 * @fileoverview Element Editor Components Component Tests
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

/// <reference types="cypress" />
import React from 'react';
import { ElementHeader } from '../../../src/components/element-editor/ElementHeader';
// * The following components are not yet implemented - tests are skipped below
// import { ElementFooter } from '../../../src/components/element-editor/ElementFooter';
// import { ElementImages } from '../../../src/components/element-editor/ElementImages';
// import { ElementRelationships } from '../../../src/components/element-editor/ElementRelationships';
// import { ElementTags } from '../../../src/components/element-editor/ElementTags';
import { WorldElement, Relationship } from '../../../src/types/models';

describe('ElementHeader', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      category: 'character',
      name: 'Test Character',
      onNameChange: cy.stub(),
      saveStatus: 'idle' as const,
      completionPercentage: 75,
      onMarkdownExport: cy.stub(),
      onCancel: cy.stub()
    };
  });
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders all header elements', () => {
      cy.mountWithProviders(<ElementHeader {...defaultProps} />);
      
      // * Category display
      cy.get('[data-cy="element-category"]').should('contain', 'character');
      
      // * Name input
      cy.get('#element-name').should('have.value', 'Test Character');
      
      // * Completion percentage
      cy.get('[data-cy="completion-percentage"]').should('contain', '75%');
      
      // * Progress bar
      cy.get('[data-cy="completion-bar"]').should('have.attr', 'data-percentage', '75');
      
      // Buttons
      cy.get('[data-cy="markdown-button"]').should('be.visible');
      cy.get('[data-cy="cancel-button"]').should('be.visible');
    });
    
    it('formats category name properly', () => {
      cy.mountWithProviders(<ElementHeader {...defaultProps} category="historical-event" />);
      cy.get('[data-cy="element-category"]').should('contain', 'historical event');
    });
    
    it('shows save status indicator', () => {
      cy.mountWithProviders(<ElementHeader {...defaultProps} saveStatus="saving" />);
      cy.contains('Saving').should('be.visible');
      
      cy.mountWithProviders(<ElementHeader {...defaultProps} saveStatus="saved" lastSaved={new Date()} />);
      cy.contains('Saved').should('be.visible');
      
      cy.mountWithProviders(<ElementHeader {...defaultProps} saveStatus="error" />);
      cy.contains('Error').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles name changes', () => {
      const onNameChange = cy.stub();
      cy.mountWithProviders(<ElementHeader {...defaultProps} onNameChange={onNameChange} />);
      
      cy.get('#element-name').clear().type('New Name');
      cy.wrap(onNameChange).should('have.been.calledWith', 'New Name');
    });
    
    it('triggers markdown export', () => {
      const onMarkdownExport = cy.stub();
      cy.mountWithProviders(<ElementHeader {...defaultProps} onMarkdownExport={onMarkdownExport} />);
      
      cy.get('[data-cy="markdown-button"]').click();
      cy.wrap(onMarkdownExport).should('have.been.called');
    });
    
    it('triggers cancel action', () => {
      const onCancel = cy.stub();
      cy.mountWithProviders(<ElementHeader {...defaultProps} onCancel={onCancel} />);
      
      cy.get('[data-cy="cancel-button"]').click();
      cy.wrap(onCancel).should('have.been.called');
    });
  });
  
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows mobile-specific save indicator on small screens', () => {
      cy.viewport(375, 667);
      cy.mountWithProviders(<ElementHeader {...defaultProps} saveStatus="saved" lastSaved={new Date()} />);
      
      // TODO: * Mobile save indicator should be visible
      cy.get('.sm\\:hidden').contains('Saved').should('be.visible');
      
      // TODO: * Desktop save indicator should be hidden
      cy.get('.hidden.sm\\:block').should('not.be.visible');
    });
    
    it('adjusts layout for mobile', () => {
      cy.viewport(375, 667);
      cy.mountWithProviders(<ElementHeader {...defaultProps} />);
      
      // * Check responsive classes are applied
      cy.get('.flex-col.sm\\:flex-row').should('exist');
    });
  });
  
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('has proper labels and ARIA attributes', () => {
      cy.mountWithProviders(<ElementHeader {...defaultProps} />);
      
      cy.get('#element-name').should('have.attr', 'placeholder');
      cy.get('[data-cy="markdown-button"]').should('have.attr', 'title', 'Import/Export Markdown');
    });
    
    it('supports keyboard navigation', () => {
      cy.mountWithProviders(<ElementHeader {...defaultProps} />);
      
      // TODO: * Name input should be auto-focused
      cy.focused().should('have.id', 'element-name');
      
      // * Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'markdown-button');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'cancel-button');
    });
  });
});

// ! Skipped: ElementFooter component not yet implemented
describe.skip('ElementFooter', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      onSave: cy.stub(),
      onCancel: cy.stub(),
      isSaving: false,
      hasUnsavedChanges: false
    };
  });
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders footer buttons', () => {
      cy.mountWithProviders(<ElementFooter {...defaultProps} />);
      
      cy.get('[data-cy="save-button"]').should('be.visible');
      cy.get('[data-cy="cancel-button"]').should('be.visible');
    });
    
    it('shows saving state', () => {
      cy.mountWithProviders(<ElementFooter {...defaultProps} isSaving={true} />);
      
      cy.get('[data-cy="save-button"]').should('be.disabled');
      cy.contains('Saving...').should('be.visible');
    });
    
    it('indicates unsaved changes', () => {
      cy.mountWithProviders(<ElementFooter {...defaultProps} hasUnsavedChanges={true} />);
      
      cy.get('[data-cy="unsaved-indicator"]').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles save action', () => {
      const onSave = cy.stub();
      cy.mountWithProviders(<ElementFooter {...defaultProps} onSave={onSave} />);
      
      cy.get('[data-cy="save-button"]').click();
      cy.wrap(onSave).should('have.been.called');
    });
    
    it('handles cancel action', () => {
      const onCancel = cy.stub();
      cy.mountWithProviders(<ElementFooter {...defaultProps} onCancel={onCancel} />);
      
      cy.get('[data-cy="cancel-button"]').click();
      cy.wrap(onCancel).should('have.been.called');
    });
    
    it('disables save when saving', () => {
      const onSave = cy.stub();
      cy.mountWithProviders(<ElementFooter {...defaultProps} onSave={onSave} isSaving={true} />);
      
      cy.get('[data-cy="save-button"]').should('be.disabled');
      cy.get('[data-cy="save-button"]').click({ force: true });
      cy.wrap(onSave).should('not.have.been.called');
    });
  });
  
  describe('Keyboard Shortcuts', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('saves on Cmd/Ctrl+S', () => {
      const onSave = cy.stub();
      cy.mountWithProviders(<ElementFooter {...defaultProps} onSave={onSave} />);
      
      cy.get('body').type('{cmd}s');
      cy.wrap(onSave).should('have.been.called');
    });
    
    it('cancels on Escape', () => {
      const onCancel = cy.stub();
      cy.mountWithProviders(<ElementFooter {...defaultProps} onCancel={onCancel} />);
      
      cy.get('body').type('{esc}');
      cy.wrap(onCancel).should('have.been.called');
    });
  });
});

// ! Skipped: ElementImages component not yet implemented
describe.skip('ElementImages', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const mockImages = [
    { id: '1', url: 'https://example.com/image1.jpg', caption: 'Main image' },
    { id: '2', url: 'https://example.com/image2.jpg', caption: 'Secondary image' }
  ];
  
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      images: mockImages,
      onAddImage: cy.stub(),
      onRemoveImage: cy.stub(),
      onUpdateCaption: cy.stub(),
      onReorderImages: cy.stub()
    };
  });
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders image gallery', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.get('[data-cy="image-gallery"]').should('be.visible');
      cy.get('[data-cy="image-item"]').should('have.length', 2);
    });
    
    it('shows image captions', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.contains('Main image').should('be.visible');
      cy.contains('Secondary image').should('be.visible');
    });
    
    it('shows add image button', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.get('[data-cy="add-image-button"]').should('be.visible');
    });
    
    it('shows empty state', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} images={[]} />);
      
      cy.contains('No images added').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles image upload', () => {
      const onAddImage = cy.stub();
      cy.mountWithProviders(<ElementImages {...defaultProps} onAddImage={onAddImage} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      cy.get('input[type="file"]').selectFile(file, { force: true });
      
      cy.wrap(onAddImage).should('have.been.called');
    });
    
    it('handles image removal', () => {
      const onRemoveImage = cy.stub();
      cy.mountWithProviders(<ElementImages {...defaultProps} onRemoveImage={onRemoveImage} />);
      
      cy.get('[data-cy="remove-image-1"]').click();
      cy.wrap(onRemoveImage).should('have.been.calledWith', '1');
    });
    
    it('handles caption editing', () => {
      const onUpdateCaption = cy.stub();
      cy.mountWithProviders(<ElementImages {...defaultProps} onUpdateCaption={onUpdateCaption} />);
      
      cy.get('[data-cy="caption-input-1"]').clear().type('New caption');
      cy.wrap(onUpdateCaption).should('have.been.calledWith', '1', 'New caption');
    });
    
    it('handles drag and drop reordering', () => {
      const onReorderImages = cy.stub();
      cy.mountWithProviders(<ElementImages {...defaultProps} onReorderImages={onReorderImages} />);
      
      // * Simulate drag and drop
      cy.get('[data-cy="image-item-1"]').trigger('dragstart');
      cy.get('[data-cy="image-item-2"]').trigger('drop');
      
      cy.wrap(onReorderImages).should('have.been.called');
    });
  });
  
  describe('Image Preview', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('opens full-size preview on click', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.get('[data-cy="image-item-1"]').click();
      cy.get('[data-cy="image-preview-modal"]').should('be.visible');
    });
    
    it('navigates between images in preview', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.get('[data-cy="image-item-1"]').click();
      cy.get('[data-cy="next-image"]').click();
      cy.contains('Secondary image').should('be.visible');
      
      cy.get('[data-cy="prev-image"]').click();
      cy.contains('Main image').should('be.visible');
    });
    
    it('closes preview on escape or close button', () => {
      cy.mountWithProviders(<ElementImages {...defaultProps} />);
      
      cy.get('[data-cy="image-item-1"]').click();
      cy.get('[data-cy="close-preview"]').click();
      cy.get('[data-cy="image-preview-modal"]').should('not.exist');
    });
  });
});

// ! Skipped: ElementRelationships component not yet implemented
describe.skip('ElementRelationships', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const mockElements: WorldElement[] = [
    { id: '1', name: 'Location A', category: 'location', completion: 100 },
    { id: '2', name: 'Character B', category: 'character', completion: 80 },
    { id: '3', name: 'Organization C', category: 'organization', completion: 60 }
  ];
  
  const mockRelationships: Relationship[] = [
    { 
      id: 'r1',
      fromId: 'current',
      toId: '1',
      type: 'located_in',
      description: 'Lives in this location'
    },
    {
      id: 'r2',
      fromId: 'current',
      toId: '2',
      type: 'knows',
      description: 'Close friend'
    }
  ];
  
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      currentElementId: 'current',
      relationships: mockRelationships,
      availableElements: mockElements,
      onAddRelationship: cy.stub(),
      onRemoveRelationship: cy.stub(),
      onUpdateRelationship: cy.stub()
    };
  });
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders relationship list', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-cy="relationships-list"]').should('be.visible');
      cy.get('[data-cy="relationship-item"]').should('have.length', 2);
    });
    
    it('shows relationship details', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.contains('Location A').should('be.visible');
      cy.contains('located_in').should('be.visible');
      cy.contains('Lives in this location').should('be.visible');
    });
    
    it('shows add relationship button', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-cy="add-relationship-button"]').should('be.visible');
    });
    
    it('shows empty state', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} relationships={[]} />);
      
      cy.contains('No relationships defined').should('be.visible');
    });
  });
  
  describe('Adding Relationships', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('opens add relationship modal', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-cy="add-relationship-button"]').click();
      cy.get('[data-cy="relationship-modal"]').should('be.visible');
    });
    
    it('creates new relationship', () => {
      const onAddRelationship = cy.stub();
      cy.mountWithProviders(<ElementRelationships {...defaultProps} onAddRelationship={onAddRelationship} />);
      
      cy.get('[data-cy="add-relationship-button"]').click();
      
      // * Select target element
      cy.get('[data-cy="element-select"]').select('3');
      
      // * Select relationship type
      cy.get('[data-cy="relationship-type"]').select('employs');
      
      // * Add description
      cy.get('[data-cy="relationship-description"]').type('Works for this organization');
      
      // Save
      cy.get('[data-cy="save-relationship"]').click();
      
      cy.wrap(onAddRelationship).should('have.been.calledWith', {
        toId: '3',
        type: 'employs',
        description: 'Works for this organization'
      });
    });
    
    it('validates required fields', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-cy="add-relationship-button"]').click();
      cy.get('[data-cy="save-relationship"]').click();
      
      cy.contains('Please select an element').should('be.visible');
    });
  });
  
  describe('Editing Relationships', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('edits existing relationship', () => {
      const onUpdateRelationship = cy.stub();
      cy.mountWithProviders(<ElementRelationships {...defaultProps} onUpdateRelationship={onUpdateRelationship} />);
      
      cy.get('[data-cy="edit-relationship-r1"]').click();
      
      // * Update description
      cy.get('[data-cy="relationship-description"]').clear().type('New description');
      
      // Save
      cy.get('[data-cy="save-relationship"]').click();
      
      cy.wrap(onUpdateRelationship).should('have.been.calledWith', 'r1', {
        description: 'New description'
      });
    });
    
    it('removes relationship', () => {
      const onRemoveRelationship = cy.stub();
      cy.mountWithProviders(<ElementRelationships {...defaultProps} onRemoveRelationship={onRemoveRelationship} />);
      
      cy.get('[data-cy="remove-relationship-r1"]').click();
      
      // * Confirm deletion
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-cy="confirm-delete"]').click();
      
      cy.wrap(onRemoveRelationship).should('have.been.calledWith', 'r1');
    });
  });
  
  describe('Relationship Visualization', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows relationship graph view', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-cy="view-graph"]').click();
      cy.get('[data-cy="relationship-graph"]').should('be.visible');
    });
    
    it('toggles between list and graph views', () => {
      cy.mountWithProviders(<ElementRelationships {...defaultProps} />);
      
      // * Start in list view
      cy.get('[data-cy="relationships-list"]').should('be.visible');
      
      // * Switch to graph view
      cy.get('[data-cy="view-graph"]').click();
      cy.get('[data-cy="relationship-graph"]').should('be.visible');
      cy.get('[data-cy="relationships-list"]').should('not.exist');
      
      // * Switch back to list view
      cy.get('[data-cy="view-list"]').click();
      cy.get('[data-cy="relationships-list"]').should('be.visible');
      cy.get('[data-cy="relationship-graph"]').should('not.exist');
    });
  });
});

// ! Skipped: ElementTags component not yet implemented
describe.skip('ElementTags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const mockTags = ['fantasy', 'magic', 'adventure', 'quest'];
  const mockSuggestedTags = ['epic', 'hero', 'dragon', 'sword'];
  
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      tags: mockTags,
      suggestedTags: mockSuggestedTags,
      onAddTag: cy.stub(),
      onRemoveTag: cy.stub(),
      onReorderTags: cy.stub()
    };
  });
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders tag list', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      cy.get('[data-cy="tag-list"]').should('be.visible');
      cy.get('[data-cy^="tag-"]').should('have.length', 4);
    });
    
    it('shows each tag with remove button', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      mockTags.forEach(tag => {
        cy.get(`[data-cy="tag-${tag}"]`).should('contain', tag);
        cy.get(`[data-cy="remove-tag-${tag}"]`).should('be.visible');
      });
    });
    
    it('shows tag input field', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      cy.get('[data-cy="tag-input"]').should('be.visible');
      cy.get('[data-cy="tag-input"]').should('have.attr', 'placeholder', 'Add a tag...');
    });
    
    it('shows suggested tags', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      cy.contains('Suggested tags').should('be.visible');
      mockSuggestedTags.forEach(tag => {
        cy.get(`[data-cy="suggested-tag-${tag}"]`).should('be.visible');
      });
    });
  });
  
  describe('Adding Tags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('adds tag via input field', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-cy="tag-input"]').type('newTag{enter}');
      cy.wrap(onAddTag).should('have.been.calledWith', 'newTag');
    });
    
    it('adds tag from suggestions', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-cy="suggested-tag-epic"]').click();
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
    
    it('prevents duplicate tags', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-cy="tag-input"]').type('fantasy{enter}');
      cy.wrap(onAddTag).should('not.have.been.called');
      cy.contains('Tag already exists').should('be.visible');
    });
    
    it('validates tag format', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      // * Empty tag
      cy.get('[data-cy="tag-input"]').type('{enter}');
      cy.wrap(onAddTag).should('not.have.been.called');
      
      // * Tag with special characters
      cy.get('[data-cy="tag-input"]').type('tag@#${enter}');
      cy.contains('Invalid characters').should('be.visible');
    });
  });
  
  describe('Removing Tags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('removes tag on click', () => {
      const onRemoveTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onRemoveTag={onRemoveTag} />);
      
      cy.get('[data-cy="remove-tag-fantasy"]').click();
      cy.wrap(onRemoveTag).should('have.been.calledWith', 'fantasy');
    });
    
    it('removes last tag with backspace', () => {
      const onRemoveTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onRemoveTag={onRemoveTag} />);
      
      cy.get('[data-cy="tag-input"]').type('{backspace}');
      cy.wrap(onRemoveTag).should('have.been.calledWith', 'quest');
    });
  });
  
  describe('Tag Reordering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('reorders tags via drag and drop', () => {
      const onReorderTags = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onReorderTags={onReorderTags} />);
      
      // * Simulate drag and drop
      cy.get('[data-cy="tag-fantasy"]').trigger('dragstart');
      cy.get('[data-cy="tag-adventure"]').trigger('drop');
      
      cy.wrap(onReorderTags).should('have.been.called');
    });
  });
  
  describe('Autocomplete', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows autocomplete suggestions while typing', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      cy.get('[data-cy="tag-input"]').type('ep');
      cy.get('[data-cy="autocomplete-suggestions"]').should('be.visible');
      cy.contains('epic').should('be.visible');
    });
    
    it('selects autocomplete suggestion', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-cy="tag-input"]').type('ep');
      cy.get('[data-cy="autocomplete-epic"]').click();
      
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
    
    it('navigates autocomplete with keyboard', () => {
      const onAddTag = cy.stub();
      cy.mountWithProviders(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-cy="tag-input"]').type('e');
      cy.get('[data-cy="tag-input"]').type('{downarrow}');
      cy.get('[data-cy="autocomplete-epic"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.get('[data-cy="tag-input"]').type('{enter}');
      
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
  });
  
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('has proper ARIA labels', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      cy.get('[data-cy="tag-list"]').should('have.attr', 'role', 'list');
      cy.get('[data-cy="tag-fantasy"]').should('have.attr', 'role', 'listitem');
    });
    
    it('announces tag operations to screen readers', () => {
      cy.mountWithProviders(<ElementTags {...defaultProps} />);
      
      // * Check for live region
      cy.get('[aria-live="polite"]').should('exist');
    });
  });
});