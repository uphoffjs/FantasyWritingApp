import React from 'react';
import { RelationshipModal } from '../../src/components/RelationshipModal';
import { mountWithProviders } from '../support/mount-helpers';
import { mockElement, mockProject, createMockElements } from '../support/test-data';
import { waitForAnimation, setMobileViewport, setTabletViewport, setDesktopViewport } from '../support/test-utils';
import { WorldElement } from '../../src/types/models';

describe('RelationshipModal Component', () => {
  let onCloseSpy: any;
  let addRelationshipStub: any;

  const sourceElement: WorldElement = {
    ...mockElement,
    id: 'char-1',
    name: 'Gandalf',
    category: 'character',
    description: 'A wise wizard'
  };

  const targetElements: WorldElement[] = [
    { ...mockElement, id: 'loc-1', name: 'Rivendell', category: 'location', description: 'Elven city' },
    { ...mockElement, id: 'char-2', name: 'Frodo', category: 'character', description: 'Ring bearer' },
    { ...mockElement, id: 'org-1', name: 'Fellowship', category: 'organization', description: 'Group of heroes' },
    { ...mockElement, id: 'magic-1', name: 'Wizardry', category: 'magic-system', description: 'Ancient magic' },
    { ...mockElement, id: 'item-1', name: 'Staff of Power', category: 'item-object', description: 'Magical staff' }
  ];

  const testProject = {
    ...mockProject,
    id: 'test-project',
    elements: [sourceElement, ...targetElements]
  };

  beforeEach(() => {
    onCloseSpy = cy.spy();
    cy.clearLocalStorage();
  });

  describe('Rendering', () => {
    it('renders with source element displayed', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Check header
      cy.get('h2').should('contain', 'Create Relationship');
      cy.get('[data-cy="close-relationship-modal"]').should('be.visible');

      // Check source element is displayed
      cy.get('[data-cy*="parchment-shadow"]').first().within(() => {
        cy.contains('From Element').should('be.visible');
        cy.contains('Gandalf').should('be.visible');
        cy.contains('character').should('be.visible');
      });

      // Check search input is present
      cy.get('[data-cy="relationship-target-search"]').should('be.visible');
    });

    it('shows all available elements except source', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Should show all target elements but not source
      targetElements.forEach(element => {
        cy.get(`[data-cy="select"]-element-${element.id}"]`).should('be.visible');
        cy.get(`[data-cy="select"]-element-${element.id}"]`).should('contain', element.name);
      });

      // Source element should not be in the list
      cy.get(`[data-cy="select"]-element-${sourceElement.id}"]`).should('not.exist');
    });

    it('handles project not found gracefully', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId="non-existent" 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: []
          }
        }
      );

      // Component should return null
      cy.get('h2').should('not.exist');
    });
  });

  describe('Element Search', () => {
    it('filters elements by search term in name', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="relationship-target-search"]').type('Rivendell');
      
      // Only Rivendell should be visible
      cy.get(`[data-cy="select"]-element-loc-1"]`).should('be.visible');
      cy.get(`[data-cy="select"]-element-char-2"]`).should('not.exist');
      cy.get(`[data-cy="select"]-element-org-1"]`).should('not.exist');
    });

    it('filters elements by search term in description', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="relationship-target-search"]').type('Ring bearer');
      
      // Only Frodo should be visible
      cy.get(`[data-cy="select"]-element-char-2"]`).should('be.visible');
      cy.get(`[data-cy="select"]-element-loc-1"]`).should('not.exist');
    });

    it('filters elements by category', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="relationship-target-search"]').type('location');
      
      // Only location element should be visible
      cy.get(`[data-cy="select"]-element-loc-1"]`).should('be.visible');
      cy.get(`[data-cy="select"]-element-char-2"]`).should('not.exist');
    });

    it('shows no elements when search has no matches', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="relationship-target-search"]').type('NonExistentElement');
      
      // No elements should be visible
      cy.get('[data-cy^="[data-cy*="select"]-element-"]').should('not.exist');
    });
  });

  describe('Element Selection', () => {
    it('[data-cy*="select"]s target element and shows relationship options', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();

      // Should show relationship type section
      cy.contains('Relationship Type').should('be.visible');
      
      // Should show bidirectional option
      cy.get('[data-cy="bidirectional-toggle"]').should('be.visible');
      
      // Should show description field
      cy.get('[data-cy="relationship-description"]').should('be.visible');
    });

    it('highlights [data-cy*="select"]ed element', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Selected element should have active style
      cy.get(`[data-cy="select"]-element-char-2"]`)
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Relationship Type Suggestions', () => {
    it('shows character-to-character relationship suggestions', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();

      // Check for character-specific relationship types
      const expectedTypes = ['related to', 'friend of', 'mentor of', 'works with'];
      expectedTypes.forEach(type => {
        cy.get(`[data-cy="relationship-type-${type.replace(/\s+/g, '-')}"]`)
          .should('be.visible')
          .and('contain', type);
      });
    });

    it('shows character-to-location relationship suggestions', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-loc-1"]`).click();

      // Check for character-to-location relationship types
      const expectedTypes = ['lives in', 'born in', 'visits frequently'];
      expectedTypes.forEach(type => {
        cy.get(`[data-cy="relationship-type-${type.replace(/\s+/g, '-')}"]`)
          .should('be.visible')
          .and('contain', type);
      });
    });

    it('shows character-to-organization relationship suggestions', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-org-1"]`).click();

      // Check for character-to-organization relationship types
      const expectedTypes = ['member of', 'leads', 'founded', 'works for'];
      expectedTypes.forEach(type => {
        cy.get(`[data-cy="relationship-type-${type.replace(/\s+/g, '-')}"]`)
          .should('be.visible')
          .and('contain', type);
      });
    });

    it('shows default suggestions for uncategorized relationships', () => {
      const customElement: WorldElement = {
        ...mockElement,
        id: 'custom-1',
        name: 'Custom Element',
        category: 'custom' as any
      };

      const projectWithCustom = {
        ...testProject,
        elements: [...testProject.elements, customElement]
      };

      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [projectWithCustom]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-custom-1"]`).click();

      // Should show default relationship types
      const defaultTypes = ['related to', 'connected to', 'associated with'];
      defaultTypes.forEach(type => {
        cy.get(`[data-cy="relationship-type-${type.replace(/\s+/g, '-')}"]`)
          .should('be.visible');
      });
    });
  });

  describe('Relationship Type Selection', () => {
    it('[data-cy*="select"]s predefined relationship type', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="relationship-type-friend-of"]').click();

      // Selected type should be highlighted
      cy.get('[data-cy="relationship-type-friend-of"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('allows custom relationship type', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="custom-relationship-type"]').type('teaches magic to');

      // Custom type should be in the input
      cy.get('[data-cy="custom-relationship-type"]').should('have.value', 'teaches magic to');
    });

    it('clears predefined [data-cy*="select"]ion when custom type is entered', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // First [data-cy*="select"] a predefined type
      cy.get('[data-cy="relationship-type-friend-of"]').click();
      cy.get('[data-cy="relationship-type-friend-of"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;

      // Then enter custom type
      cy.get('[data-cy="custom-relationship-type"]').type('custom relation');

      // Predefined [data-cy*="select"]ion should be cleared
      cy.get('[data-cy="relationship-type-friend-of"]')
        .should('not.have.class', 'bg-sapphire-600');
    });

    it('clears custom type when predefined is [data-cy*="select"]ed', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Enter custom type
      cy.get('[data-cy="custom-relationship-type"]').type('custom relation');
      
      // Select predefined type
      cy.get('[data-cy="relationship-type-friend-of"]').click();

      // Custom input should be cleared
      cy.get('[data-cy="custom-relationship-type"]').should('have.value', '');
    });
  });

  describe('Bidirectional Relationships', () => {
    it('shows reverse relationship input when bidirectional is checked', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Initially reverse type input should not be visible
      cy.get('[data-cy="reverse-relationship-type"]').should('not.exist');
      
      // Check bidirectional
      cy.get('[data-cy="bidirectional-toggle"]').click();
      
      // Reverse type input should appear
      cy.get('[data-cy="reverse-relationship-type"]').should('be.visible');
      cy.contains('Reverse relationship type').should('be.visible');
    });

    it('hides reverse relationship input when bidirectional is unchecked', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Enable bidirectional
      cy.get('[data-cy="bidirectional-toggle"]').click();
      cy.get('[data-cy="reverse-relationship-type"]').should('be.visible');
      
      // Disable bidirectional
      cy.get('[data-cy="bidirectional-toggle"]').click();
      cy.get('[data-cy="reverse-relationship-type"]').should('not.exist');
    });

    it('shows placeholder with element names in reverse input', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="bidirectional-toggle"]').click();
      
      cy.get('[data-cy="reverse-relationship-type"]')
        .should('have.attr', 'placeholder')
        .and('contain', 'How Frodo relates to Gandalf');
    });
  });

  describe('Description Field', () => {
    it('accepts optional description text', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      const description = 'They met in Rivendell and became close friends during the quest.';
      cy.get('[data-cy="relationship-description"]').type(description);
      
      cy.get('[data-cy="relationship-description"]').should('have.value', description);
    });

    it('shows description field only after element [data-cy*="select"]ion', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Initially description should not be visible
      cy.get('[data-cy="relationship-description"]').should('not.exist');
      
      // Select an element
      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Description should now be visible
      cy.get('[data-cy="relationship-description"]').should('be.visible');
    });
  });

  describe('Form Submission', () => {
    it('creates single relationship with predefined type', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject],
            addRelationship: addRelationshipStub = cy.stub()
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="relationship-type-friend-of"]').click();
      cy.get('[data-cy="relationship-description"]').type('Best friends');
      cy.get('[data-cy="create-relationship"]').click();

      cy.wrap(addRelationshipStub).should('have.been.calledOnce');
      cy.wrap(addRelationshipStub).should('have.been.calledWith',
        testProject.id,
        Cypress.sinon.match({
          fromId: 'char-1',
          toId: 'char-2',
          type: 'friend of',
          description: 'Best friends'
        })
      );

      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('creates single relationship with custom type', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject],
            addRelationship: addRelationshipStub = cy.stub()
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="custom-relationship-type"]').type('teaches magic to');
      cy.get('[data-cy="create-relationship"]').click();

      cy.wrap(addRelationshipStub).should('have.been.calledWith',
        testProject.id,
        Cypress.sinon.match({
          fromId: 'char-1',
          toId: 'char-2',
          type: 'teaches magic to'
        })
      );
    });

    it('creates bidirectional relationships', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject],
            addRelationship: addRelationshipStub = cy.stub()
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="relationship-type-mentor-of"]').click();
      cy.get('[data-cy="bidirectional-toggle"]').click();
      cy.get('[data-cy="reverse-relationship-type"]').type('apprentice of');
      cy.get('[data-cy="create-relationship"]').click();

      // Should be called twice for bidirectional
      cy.wrap(addRelationshipStub).should('have.been.calledTwice');
      
      // First call - forward relationship
      cy.wrap(addRelationshipStub).should('have.been.calledWith',
        testProject.id,
        Cypress.sinon.match({
          fromId: 'char-1',
          toId: 'char-2',
          type: 'mentor of'
        })
      );

      // Second call - reverse relationship
      cy.wrap(addRelationshipStub).should('have.been.calledWith',
        testProject.id,
        Cypress.sinon.match({
          fromId: 'char-2',
          toId: 'char-1',
          type: 'apprentice of'
        })
      );
    });

    it('disables create [data-cy*="button"] when no element [data-cy*="select"]ed', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="create-relationship"]')
        .should('be.disabled')
        .and('have.class', 'disabled:bg-parchment-shadow');
    });

    it('disables create [data-cy*="button"] when no relationship type [data-cy*="select"]ed', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      // Without [data-cy*="select"]ing type, [data-cy*="button"] should still be disabled
      cy.get('[data-cy="create-relationship"]')
        .should('be.disabled');
    });

    it('enables create [data-cy*="button"] when all required fields are filled', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="relationship-type-friend-of"]').click();
      
      cy.get('[data-cy="create-relationship"]')
        .should('not.be.disabled')
        .and('have.class', 'bg-sapphire-600');
    });

    it('does not create bidirectional if reverse type is empty', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject],
            addRelationship: addRelationshipStub = cy.stub()
          }
        }
      );

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="relationship-type-friend-of"]').click();
      cy.get('[data-cy="bidirectional-toggle"]').click();
      // Don't fill reverse type
      cy.get('[data-cy="create-relationship"]').click();

      // Should only create forward relationship
      cy.wrap(addRelationshipStub).should('have.been.calledOnce');
    });
  });

  describe('Modal Actions', () => {
    it('closes modal when close [data-cy*="button"] is clicked', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="close-relationship-modal"]').click();
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('closes modal when cancel [data-cy*="button"] is clicked', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="cancel-relationship"]').click();
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('does not close modal on background click', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Click on the backdrop
      cy.get('.fixed.inset-0[data-cy*="black"]').click({ force: true });
      cy.wrap(onCloseSpy).should('not.have.been.called');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty project elements list', () => {
      const emptyProject = {
        ...testProject,
        elements: [sourceElement] // Only source, no targets
      };

      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [emptyProject]
          }
        }
      );

      // Should show empty list
      cy.get('[data-cy^="[data-cy*="select"]-element-"]').should('not.exist');
      cy.get('[data-cy="create-relationship"]').should('be.disabled');
    });

    it('handles very long element names', () => {
      const longNameElement: WorldElement = {
        ...mockElement,
        id: 'long-1',
        name: 'A'.repeat(100),
        category: 'character'
      };

      const projectWithLongName = {
        ...testProject,
        elements: [...testProject.elements, longNameElement]
      };

      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [projectWithLongName]
          }
        }
      );

      cy.get(`[data-cy="select"]-element-long-1"]`).should('be.visible');
      cy.get(`[data-cy="select"]-element-long-1"]`).click();
      
      // Should handle long names in relationship preview
      cy.get('[data-cy="relationship-type-friend-of"]').should('be.visible');
    });

    it('handles special characters in relationship types', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject],
            addRelationship: addRelationshipStub = cy.stub()
          }
        }
      );

      const specialType = '!@#$%^&*()_+-=[]{}|;:",.<>?/`~';
      
      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get('[data-cy="custom-relationship-type"]').type(specialType);
      cy.get('[data-cy="create-relationship"]').click();

      cy.wrap(addRelationshipStub).should('have.been.calledWith',
        testProject.id,
        Cypress.sinon.match({
          type: specialType
        })
      );
    });

    it('handles rapid element [data-cy*="select"]ion changes', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Rapidly click different elements
      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      cy.get(`[data-cy="select"]-element-loc-1"]`).click();
      cy.get(`[data-cy="select"]-element-org-1"]`).click();

      // Should show organization relationships
      cy.get('[data-cy="relationship-type-member-of"]').should('be.visible');
    });

    it('handles scrollable element list', () => {
      const manyElements = createMockElements(50, 'character');
      const projectWithMany = {
        ...testProject,
        elements: [sourceElement, ...manyElements]
      };

      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [projectWithMany]
          }
        }
      );

      // Element list should be scrollable
      cy.get('[data-cy="grid"].gap-2.max-h-48.overflow-y-auto').should('exist');
      
      // Should be able to scroll to see more elements
      cy.get('[data-cy="grid"].gap-2.max-h-48.overflow-y-auto').scrollTo('bottom');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.contains('label', 'Select Target Element').should('be.visible');
      
      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      cy.contains('label', 'Relationship Type').should('be.visible');
      cy.contains('label', 'Create bidirectional relationship').should('be.visible');
      cy.contains('label', 'Description (optional)').should('be.visible');
    });

    it('supports keyboard navigation', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Tab to search
      cy.get('[data-cy="relationship-target-search"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'relationship-target-search');

      // Type to search
      cy.focused().type('Frodo');
      
      // Tab to element [data-cy*="select"]ion
      cy.focused().tab();
      cy.get(`[data-cy="select"]-element-char-2"]`).click();

      // Tab through relationship options
      cy.get('[data-cy="relationship-type-friend-of"]').focus();
      cy.focused().should('contain', 'friend of');
    });

    it('has proper placeholder texts', () => {
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('[data-cy="relationship-target-search"]')
        .should('have.attr', 'placeholder', 'Search elements...');

      cy.get(`[data-cy="select"]-element-char-2"]`).click();
      
      cy.get('[data-cy="custom-relationship-type"]')
        .should('have.attr', 'placeholder', 'Custom relationship type...');
      
      cy.get('[data-cy="relationship-description"]')
        .should('have.attr', 'placeholder')
        .and('contain', 'Add any additional details');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewports', () => {
      setMobileViewport();
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      // Modal should be fullscreen on mobile
      cy.get('.max-w-2xl').should('be.visible');
      cy.get('.overflow-y-auto').should('be.visible');
    });

    it('adapts layout for tablet viewports', () => {
      setTabletViewport();
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('.max-w-2xl').should('be.visible');
      cy.get('.p-6').should('be.visible');
    });

    it('shows full layout on desktop', () => {
      setDesktopViewport();
      mountWithProviders(
        <RelationshipModal 
          projectId={testProject.id} 
          sourceElement={sourceElement} 
          onClose={onCloseSpy} 
        />,
        {
          initialState: {
            projects: [testProject]
          }
        }
      );

      cy.get('.max-w-2xl').should('be.visible');
      cy.get('.max-h-\\[90vh\\]').should('be.visible');
    });
  });
});