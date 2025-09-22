/// <reference types="cypress" />
import React from 'react';
import { ElementHeader } from '../../../src/components/element-editor/ElementHeader';
import { ElementFooter } from '../../../src/components/element-editor/ElementFooter';
import { ElementImages } from '../../../src/components/element-editor/ElementImages';
import { ElementRelationships } from '../../../src/components/element-editor/ElementRelationships';
import { ElementTags } from '../../../src/components/element-editor/ElementTags';
import { WorldElement, Relationship } from '../../../src/types/models';

describe('ElementHeader', () => {
  let defaultProps: any;
  
  beforeEach(() => {
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
    it('renders all header elements', () => {
      cy.mount(<ElementHeader {...defaultProps} />);
      
      // * Category display
      cy.get('[data-testid="element-category"]').should('contain', 'character');
      
      // * Name input
      cy.get('#element-name').should('have.value', 'Test Character');
      
      // * Completion percentage
      cy.get('[data-testid="completion-percentage"]').should('contain', '75%');
      
      // * Progress bar
      cy.get('[data-testid="completion-bar"]').should('have.attr', 'data-percentage', '75');
      
      // Buttons
      cy.get('[data-testid="markdown-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').should('be.visible');
    });
    
    it('formats category name properly', () => {
      cy.mount(<ElementHeader {...defaultProps} category="historical-event" />);
      cy.get('[data-testid="element-category"]').should('contain', 'historical event');
    });
    
    it('shows save status indicator', () => {
      cy.mount(<ElementHeader {...defaultProps} saveStatus="saving" />);
      cy.contains('Saving').should('be.visible');
      
      cy.mount(<ElementHeader {...defaultProps} saveStatus="saved" lastSaved={new Date()} />);
      cy.contains('Saved').should('be.visible');
      
      cy.mount(<ElementHeader {...defaultProps} saveStatus="error" />);
      cy.contains('Error').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
    it('handles name changes', () => {
      const onNameChange = cy.stub();
      cy.mount(<ElementHeader {...defaultProps} onNameChange={onNameChange} />);
      
      cy.get('#element-name').clear().type('New Name');
      cy.wrap(onNameChange).should('have.been.calledWith', 'New Name');
    });
    
    it('triggers markdown export', () => {
      const onMarkdownExport = cy.stub();
      cy.mount(<ElementHeader {...defaultProps} onMarkdownExport={onMarkdownExport} />);
      
      cy.get('[data-testid="markdown-[data-cy*="button"]"]').click();
      cy.wrap(onMarkdownExport).should('have.been.called');
    });
    
    it('triggers cancel action', () => {
      const onCancel = cy.stub();
      cy.mount(<ElementHeader {...defaultProps} onCancel={onCancel} />);
      
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').click();
      cy.wrap(onCancel).should('have.been.called');
    });
  });
  
  describe('Responsive Design', () => {
    it('shows mobile-specific save indicator on small screens', () => {
      cy.viewport(375, 667);
      cy.mount(<ElementHeader {...defaultProps} saveStatus="saved" lastSaved={new Date()} />);
      
      // TODO: * Mobile save indicator should be visible
      cy.get('.sm\\:hidden').contains('Saved').should('be.visible');
      
      // TODO: * Desktop save indicator should be hidden
      cy.get('.hidden.sm\\:block').should('not.be.visible');
    });
    
    it('adjusts layout for mobile', () => {
      cy.viewport(375, 667);
      cy.mount(<ElementHeader {...defaultProps} />);
      
      // * Check responsive classes are applied
      cy.get('.flex-col.sm\\:flex-row').should('exist');
    });
  });
  
  describe('Accessibility', () => {
    it('has proper labels and ARIA attributes', () => {
      cy.mount(<ElementHeader {...defaultProps} />);
      
      cy.get('#element-name').should('have.attr', 'placeholder');
      cy.get('[data-testid="markdown-[data-cy*="button"]"]').should('have.attr', 'title', 'Import/Export Markdown');
    });
    
    it('supports keyboard navigation', () => {
      cy.mount(<ElementHeader {...defaultProps} />);
      
      // TODO: * Name input should be auto-focused
      cy.focused().should('have.id', 'element-name');
      
      // * Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'markdown-[data-cy*="button"]');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'cancel-[data-cy*="button"]');
    });
  });
});

describe('ElementFooter', () => {
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      onSave: cy.stub(),
      onCancel: cy.stub(),
      isSaving: false,
      hasUnsavedChanges: false
    };
  });
  
  describe('Rendering', () => {
    it('renders footer [data-cy*="button"]s', () => {
      cy.mount(<ElementFooter {...defaultProps} />);
      
      cy.get('[data-testid="save-[data-cy*="button"]"]').should('be.visible');
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').should('be.visible');
    });
    
    it('shows saving state', () => {
      cy.mount(<ElementFooter {...defaultProps} isSaving={true} />);
      
      cy.get('[data-testid="save-[data-cy*="button"]"]').should('be.disabled');
      cy.contains('Saving...').should('be.visible');
    });
    
    it('indicates unsaved changes', () => {
      cy.mount(<ElementFooter {...defaultProps} hasUnsavedChanges={true} />);
      
      cy.get('[data-testid="unsaved-indicator"]').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
    it('handles save action', () => {
      const onSave = cy.stub();
      cy.mount(<ElementFooter {...defaultProps} onSave={onSave} />);
      
      cy.get('[data-testid="save-[data-cy*="button"]"]').click();
      cy.wrap(onSave).should('have.been.called');
    });
    
    it('handles cancel action', () => {
      const onCancel = cy.stub();
      cy.mount(<ElementFooter {...defaultProps} onCancel={onCancel} />);
      
      cy.get('[data-testid="cancel-[data-cy*="button"]"]').click();
      cy.wrap(onCancel).should('have.been.called');
    });
    
    it('disables save when saving', () => {
      const onSave = cy.stub();
      cy.mount(<ElementFooter {...defaultProps} onSave={onSave} isSaving={true} />);
      
      cy.get('[data-testid="save-[data-cy*="button"]"]').should('be.disabled');
      cy.get('[data-testid="save-[data-cy*="button"]"]').click({ force: true });
      cy.wrap(onSave).should('not.have.been.called');
    });
  });
  
  describe('Keyboard Shortcuts', () => {
    it('saves on Cmd/Ctrl+S', () => {
      const onSave = cy.stub();
      cy.mount(<ElementFooter {...defaultProps} onSave={onSave} />);
      
      cy.get('body').type('{cmd}s');
      cy.wrap(onSave).should('have.been.called');
    });
    
    it('cancels on Escape', () => {
      const onCancel = cy.stub();
      cy.mount(<ElementFooter {...defaultProps} onCancel={onCancel} />);
      
      cy.get('body').type('{esc}');
      cy.wrap(onCancel).should('have.been.called');
    });
  });
});

describe('ElementImages', () => {
  const mockImages = [
    { id: '1', url: 'https://example.com/image1.jpg', caption: 'Main image' },
    { id: '2', url: 'https://example.com/image2.jpg', caption: 'Secondary image' }
  ];
  
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      images: mockImages,
      onAddImage: cy.stub(),
      onRemoveImage: cy.stub(),
      onUpdateCaption: cy.stub(),
      onReorderImages: cy.stub()
    };
  });
  
  describe('Rendering', () => {
    it('renders image gallery', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.get('[data-testid="image-gallery"]').should('be.visible');
      cy.get('[data-testid="image-item"]').should('have.length', 2);
    });
    
    it('shows image captions', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.contains('Main image').should('be.visible');
      cy.contains('Secondary image').should('be.visible');
    });
    
    it('shows add image [data-cy*="button"]', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.get('[data-testid="add-image-[data-cy*="button"]"]').should('be.visible');
    });
    
    it('shows empty state', () => {
      cy.mount(<ElementImages {...defaultProps} images={[]} />);
      
      cy.contains('No images added').should('be.visible');
    });
  });
  
  describe('User Interactions', () => {
    it('handles image upload', () => {
      const onAddImage = cy.stub();
      cy.mount(<ElementImages {...defaultProps} onAddImage={onAddImage} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      cy.get('input[type="file"]').selectFile(file, { force: true });
      
      cy.wrap(onAddImage).should('have.been.called');
    });
    
    it('handles image removal', () => {
      const onRemoveImage = cy.stub();
      cy.mount(<ElementImages {...defaultProps} onRemoveImage={onRemoveImage} />);
      
      cy.get('[data-testid="remove-image-1"]').click();
      cy.wrap(onRemoveImage).should('have.been.calledWith', '1');
    });
    
    it('handles caption editing', () => {
      const onUpdateCaption = cy.stub();
      cy.mount(<ElementImages {...defaultProps} onUpdateCaption={onUpdateCaption} />);
      
      cy.get('[data-testid="caption-input-1"]').clear().type('New caption');
      cy.wrap(onUpdateCaption).should('have.been.calledWith', '1', 'New caption');
    });
    
    it('handles drag and drop reordering', () => {
      const onReorderImages = cy.stub();
      cy.mount(<ElementImages {...defaultProps} onReorderImages={onReorderImages} />);
      
      // * Simulate drag and drop
      cy.get('[data-testid="image-item-1"]').trigger('dragstart');
      cy.get('[data-testid="image-item-2"]').trigger('drop');
      
      cy.wrap(onReorderImages).should('have.been.called');
    });
  });
  
  describe('Image Preview', () => {
    it('opens full-size preview on click', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.get('[data-testid="image-item-1"]').click();
      cy.get('[data-testid="image-preview-modal"]').should('be.visible');
    });
    
    it('navigates between images in preview', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.get('[data-testid="image-item-1"]').click();
      cy.get('[data-testid="next-image"]').click();
      cy.contains('Secondary image').should('be.visible');
      
      cy.get('[data-testid="prev-image"]').click();
      cy.contains('Main image').should('be.visible');
    });
    
    it('closes preview on escape or close [data-cy*="button"]', () => {
      cy.mount(<ElementImages {...defaultProps} />);
      
      cy.get('[data-testid="image-item-1"]').click();
      cy.get('[data-testid="close-preview"]').click();
      cy.get('[data-testid="image-preview-modal"]').should('not.exist');
    });
  });
});

describe('ElementRelationships', () => {
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
  
  beforeEach(() => {
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
    it('renders relationship list', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-testid="relationships-list"]').should('be.visible');
      cy.get('[data-testid="relationship-item"]').should('have.length', 2);
    });
    
    it('shows relationship details', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.contains('Location A').should('be.visible');
      cy.contains('located_in').should('be.visible');
      cy.contains('Lives in this location').should('be.visible');
    });
    
    it('shows add relationship [data-cy*="button"]', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-testid="add-relationship-[data-cy*="button"]"]').should('be.visible');
    });
    
    it('shows empty state', () => {
      cy.mount(<ElementRelationships {...defaultProps} relationships={[]} />);
      
      cy.contains('No relationships defined').should('be.visible');
    });
  });
  
  describe('Adding Relationships', () => {
    it('opens add relationship modal', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-testid="add-relationship-[data-cy*="button"]"]').click();
      cy.get('[data-testid="relationship-modal"]').should('be.visible');
    });
    
    it('creates new relationship', () => {
      const onAddRelationship = cy.stub();
      cy.mount(<ElementRelationships {...defaultProps} onAddRelationship={onAddRelationship} />);
      
      cy.get('[data-testid="add-relationship-[data-cy*="button"]"]').click();
      
      // * Select target element
      cy.get('[data-testid="element-[data-cy*="select"]"]').select('3');
      
      // * Select relationship type
      cy.get('[data-testid="relationship-type"]').select('employs');
      
      // * Add description
      cy.get('[data-testid="relationship-description"]').type('Works for this organization');
      
      // Save
      cy.get('[data-testid="save-relationship"]').click();
      
      cy.wrap(onAddRelationship).should('have.been.calledWith', {
        toId: '3',
        type: 'employs',
        description: 'Works for this organization'
      });
    });
    
    it('validates required fields', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-testid="add-relationship-[data-cy*="button"]"]').click();
      cy.get('[data-testid="save-relationship"]').click();
      
      cy.contains('Please [data-cy*="select"] an element').should('be.visible');
    });
  });
  
  describe('Editing Relationships', () => {
    it('edits existing relationship', () => {
      const onUpdateRelationship = cy.stub();
      cy.mount(<ElementRelationships {...defaultProps} onUpdateRelationship={onUpdateRelationship} />);
      
      cy.get('[data-testid="edit-relationship-r1"]').click();
      
      // * Update description
      cy.get('[data-testid="relationship-description"]').clear().type('New description');
      
      // Save
      cy.get('[data-testid="save-relationship"]').click();
      
      cy.wrap(onUpdateRelationship).should('have.been.calledWith', 'r1', {
        description: 'New description'
      });
    });
    
    it('removes relationship', () => {
      const onRemoveRelationship = cy.stub();
      cy.mount(<ElementRelationships {...defaultProps} onRemoveRelationship={onRemoveRelationship} />);
      
      cy.get('[data-testid="remove-relationship-r1"]').click();
      
      // * Confirm deletion
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-delete"]').click();
      
      cy.wrap(onRemoveRelationship).should('have.been.calledWith', 'r1');
    });
  });
  
  describe('Relationship Visualization', () => {
    it('shows relationship graph view', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      cy.get('[data-testid="view-graph"]').click();
      cy.get('[data-testid="relationship-graph"]').should('be.visible');
    });
    
    it('toggles between list and graph views', () => {
      cy.mount(<ElementRelationships {...defaultProps} />);
      
      // * Start in list view
      cy.get('[data-testid="relationships-list"]').should('be.visible');
      
      // * Switch to graph view
      cy.get('[data-testid="view-graph"]').click();
      cy.get('[data-testid="relationship-graph"]').should('be.visible');
      cy.get('[data-testid="relationships-list"]').should('not.exist');
      
      // * Switch back to list view
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="relationships-list"]').should('be.visible');
      cy.get('[data-testid="relationship-graph"]').should('not.exist');
    });
  });
});

describe('ElementTags', () => {
  const mockTags = ['fantasy', 'magic', 'adventure', 'quest'];
  const mockSuggestedTags = ['epic', 'hero', 'dragon', 'sword'];
  
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      tags: mockTags,
      suggestedTags: mockSuggestedTags,
      onAddTag: cy.stub(),
      onRemoveTag: cy.stub(),
      onReorderTags: cy.stub()
    };
  });
  
  describe('Rendering', () => {
    it('renders tag list', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      cy.get('[data-testid="tag-list"]').should('be.visible');
      cy.get('[data-cy^="tag-"]').should('have.length', 4);
    });
    
    it('shows each tag with remove [data-cy*="button"]', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      mockTags.forEach(tag => {
        cy.get(`[data-testid="tag-${tag}"]`).should('contain', tag);
        cy.get(`[data-testid="remove-tag-${tag}"]`).should('be.visible');
      });
    });
    
    it('shows tag input field', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      cy.get('[data-testid="tag-input"]').should('be.visible');
      cy.get('[data-testid="tag-input"]').should('have.attr', 'placeholder', 'Add a tag...');
    });
    
    it('shows suggested tags', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      cy.contains('Suggested tags').should('be.visible');
      mockSuggestedTags.forEach(tag => {
        cy.get(`[data-testid="suggested-tag-${tag}"]`).should('be.visible');
      });
    });
  });
  
  describe('Adding Tags', () => {
    it('adds tag via input field', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-testid="tag-input"]').type('newTag{enter}');
      cy.wrap(onAddTag).should('have.been.calledWith', 'newTag');
    });
    
    it('adds tag from suggestions', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-testid="suggested-tag-epic"]').click();
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
    
    it('prevents duplicate tags', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-testid="tag-input"]').type('fantasy{enter}');
      cy.wrap(onAddTag).should('not.have.been.called');
      cy.contains('Tag already exists').should('be.visible');
    });
    
    it('validates tag format', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      // * Empty tag
      cy.get('[data-testid="tag-input"]').type('{enter}');
      cy.wrap(onAddTag).should('not.have.been.called');
      
      // * Tag with special characters
      cy.get('[data-testid="tag-input"]').type('tag@#${enter}');
      cy.contains('Invalid characters').should('be.visible');
    });
  });
  
  describe('Removing Tags', () => {
    it('removes tag on click', () => {
      const onRemoveTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onRemoveTag={onRemoveTag} />);
      
      cy.get('[data-testid="remove-tag-fantasy"]').click();
      cy.wrap(onRemoveTag).should('have.been.calledWith', 'fantasy');
    });
    
    it('removes last tag with backspace', () => {
      const onRemoveTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onRemoveTag={onRemoveTag} />);
      
      cy.get('[data-testid="tag-input"]').type('{backspace}');
      cy.wrap(onRemoveTag).should('have.been.calledWith', 'quest');
    });
  });
  
  describe('Tag Reordering', () => {
    it('reorders tags via drag and drop', () => {
      const onReorderTags = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onReorderTags={onReorderTags} />);
      
      // * Simulate drag and drop
      cy.get('[data-testid="tag-fantasy"]').trigger('dragstart');
      cy.get('[data-testid="tag-adventure"]').trigger('drop');
      
      cy.wrap(onReorderTags).should('have.been.called');
    });
  });
  
  describe('Autocomplete', () => {
    it('shows autocomplete suggestions while typing', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      cy.get('[data-testid="tag-input"]').type('ep');
      cy.get('[data-testid="autocomplete-suggestions"]').should('be.visible');
      cy.contains('epic').should('be.visible');
    });
    
    it('[data-cy*="select"]s autocomplete suggestion', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-testid="tag-input"]').type('ep');
      cy.get('[data-testid="autocomplete-epic"]').click();
      
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
    
    it('navigates autocomplete with keyboard', () => {
      const onAddTag = cy.stub();
      cy.mount(<ElementTags {...defaultProps} onAddTag={onAddTag} />);
      
      cy.get('[data-testid="tag-input"]').type('e');
      cy.get('[data-testid="tag-input"]').type('{downarrow}');
      cy.get('[data-testid="autocomplete-epic"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.get('[data-testid="tag-input"]').type('{enter}');
      
      cy.wrap(onAddTag).should('have.been.calledWith', 'epic');
    });
  });
  
  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      cy.get('[data-testid="tag-list"]').should('have.attr', 'role', 'list');
      cy.get('[data-testid="tag-fantasy"]').should('have.attr', 'role', 'listitem');
    });
    
    it('announces tag operations to screen readers', () => {
      cy.mount(<ElementTags {...defaultProps} />);
      
      // * Check for live region
      cy.get('[aria-live="polite"]').should('exist');
    });
  });
});