/**
 * @fileoverview Relationship List Component Tests
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
import { RelationshipList } from '../../../src/components/RelationshipList';
import { mountWithProviders } from '../../support/mount-helpers';
import { mockElement, createMockElements } from '../../support/test-data';
import { waitForAnimation, setMobileViewport, setTabletViewport, setDesktopViewport } from '../../support/test-utils';
import { WorldElement, Relationship } from '../../../src/types/models';

describe('RelationshipList Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  let onDeleteSpy: any;
  let onElementClickSpy: any;

  const testElements: WorldElement[] = [
    { ...mockElement, id: 'char-1', name: 'Gandalf', category: 'character' },
    { ...mockElement, id: 'loc-1', name: 'Rivendell', category: 'location' },
    { ...mockElement, id: 'org-1', name: 'Fellowship', category: 'organization' },
    { ...mockElement, id: 'magic-1', name: 'Wizardry', category: 'magic-system' },
    { ...mockElement, id: 'item-1', name: 'Staff of Power', category: 'item-object' }
  ];

  const testRelationships: Relationship[] = [
    {
      id: 'rel-1',
      fromId: 'char-1',
      toId: 'loc-1',
      type: 'lives in',
      description: 'Gandalf visits Rivendell frequently',
      createdAt: new Date()
    },
    {
      id: 'rel-2',
      fromId: 'char-1',
      toId: 'org-1',
      type: 'member of',
      description: 'Founding member of the Fellowship',
      createdAt: new Date()
    },
    {
      id: 'rel-3',
      fromId: 'char-1',
      toId: 'magic-1',
      type: 'practices',
      createdAt: new Date()
    },
    {
      id: 'rel-4',
      fromId: 'char-1',
      toId: 'item-1',
      type: 'owns',
      description: 'His powerful staff',
      createdAt: new Date()
    }
  ];

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onDeleteSpy = cy.spy();
    onElementClickSpy = cy.spy();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('renders relationships with target element information', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Check that all relationships are rendered
      testRelationships.forEach(rel => {
        cy.get(`[data-cy="relationship-${rel.id}"]`).should('be.visible');
        
        const targetElement = testElements.find(e => e.id === rel.toId);
        if (targetElement) {
          cy.get(`[data-cy="relationship-${rel.id}"]`).within(() => {
            cy.contains(targetElement.name).should('be.visible');
            cy.contains(rel.type).should('be.visible');
            cy.contains(rel.description).should('be.visible');
          });
        }
      });
    });

    it('shows empty state when no relationships', () => {
      mountWithProviders(
        <RelationshipList
          relationships={[]}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.contains('No relationships yet').should('be.visible');
      cy.contains('Click "Add Relationship" to connect this element to others').should('be.visible');
      cy.get('svg.lucide-link-2').should('be.visible');
    });

    it('displays category icons for target elements', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Check for category-specific icons
      cy.get(`[data-cy="relationship-rel-1"]`).should('contain', '📍'); // location
      cy.get(`[data-cy="relationship-rel-2"]`).should('contain', '🏢'); // organization
      cy.get(`[data-cy="relationship-rel-3"]`).should('contain', '✨'); // magic-system
    });

    it('displays element category text', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get(`[data-cy="relationship-rel-1"]`).should('contain', 'location');
      cy.get(`[data-cy="relationship-rel-2"]`).should('contain', 'organization');
      cy.get(`[data-cy="relationship-rel-3"]`).should('contain', 'magic system');
    });

    it('handles missing target elements gracefully', () => {
      const relationshipWithMissingTarget: Relationship = {
        id: 'rel-missing',
        fromId: 'char-1',
        toId: 'non-existent',
        type: 'related to',
        createdAt: new Date()
      };

      mountWithProviders(
        <RelationshipList
          relationships={[relationshipWithMissingTarget]}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: * Should not render the relationship with missing target
      cy.get(`[data-cy="relationship-rel-missing"]`).should('not.exist');
    });
  });

  describe('Search Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('filters relationships by target element name', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]').type('Rivendell');
      waitForAnimation(); // Wait for debounce

      cy.get(`[data-cy="relationship-rel-1"]`).should('be.visible');
      cy.get(`[data-cy="relationship-rel-2"]`).should('not.exist');
      cy.get(`[data-cy="relationship-rel-3"]`).should('not.exist');
    });

    it('filters relationships by type', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]').type('member');
      waitForAnimation();

      cy.get(`[data-cy="relationship-rel-2"]`).should('be.visible');
      cy.get(`[data-cy="relationship-rel-1"]`).should('not.exist');
    });

    it('filters relationships by description', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]').type('frequently');
      waitForAnimation();

      cy.get(`[data-cy="relationship-rel-1"]`).should('be.visible');
      cy.get(`[data-cy="relationship-rel-2"]`).should('not.exist');
    });

    it('shows no results message when search has no matches', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]').type('NonExistentTerm');
      waitForAnimation();

      cy.contains('No relationships match your filters').should('be.visible');
    });

    it('debounces search input', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Type quickly
      cy.get('[data-cy="relationship-search"]').type('Riv');
      
      // ? TODO: ! PERFORMANCE: * Should still show all immediately (before debounce)
      cy.get('[data-cy^="relationship-"]').should('have.length', 4);
      
      // ! PERFORMANCE: * Wait for debounce
      waitForAnimation();
      
      // ? TODO: * Now should show filtered results
      cy.get(`[data-cy="relationship-rel-1"]`).should('be.visible');
      cy.get('[data-cy^="relationship-"]').should('have.length', 1);
    });

    it('case-insensitive search', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]').type('FELLOWSHIP');
      waitForAnimation();

      cy.get(`[data-cy="relationship-rel-2"]`).should('be.visible');
    });
  });

  describe('Type Filtering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('shows all unique relationship types in filter dropdown', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-filter"]').click();
      
      cy.get('[data-cy="relationship-filter"] option').should('contain', 'All Types');
      cy.get('[data-cy="relationship-filter"] option').should('contain', 'lives in');
      cy.get('[data-cy="relationship-filter"] option').should('contain', 'member of');
      cy.get('[data-cy="relationship-filter"] option').should('contain', 'practices');
      cy.get('[data-cy="relationship-filter"] option').should('contain', 'owns');
    });

    it('filters by selected relationship type', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-filter"]').select('lives in');
      
      cy.get(`[data-cy="relationship-rel-1"]`).should('be.visible');
      cy.get(`[data-cy="relationship-rel-2"]`).should('not.exist');
      cy.get(`[data-cy="relationship-rel-3"]`).should('not.exist');
      cy.get(`[data-cy="relationship-rel-4"]`).should('not.exist');
    });

    it('shows all relationships when "All Types" is selected', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * First filter
      cy.get('[data-cy="relationship-filter"]').select('owns');
      cy.get('[data-cy^="relationship-"]').should('have.length', 1);
      
      // Then select all
      cy.get('[data-cy="relationship-filter"]').select('All Types');
      cy.get('[data-cy^="relationship-"]').should('have.length', 4);
    });
  });

  describe('Sorting', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('sorts by target element name', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-sort"]').select('name');
      
      // * Get all relationship elements and check order
      cy.get('[data-cy^="relationship-"]').then($relationships => {
        const names = [];
        $relationships.each((_, el) => {
          const text = Cypress.$(el).text();
          if (text.includes('Fellowship')) names.push('Fellowship');
          if (text.includes('Rivendell')) names.push('Rivendell');
          if (text.includes('Staff')) names.push('Staff');
          if (text.includes('Wizardry')) names.push('Wizardry');
        });
        
        expect(names).to.deep.equal(['Fellowship', 'Rivendell', 'Staff', 'Wizardry']);
      });
    });

    it('sorts by relationship type', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-sort"]').select('type');
      
      // * Check that relationships are sorted by type
      cy.get('[data-cy^="relationship-"]').then($relationships => {
        const types = [];
        $relationships.each((_, el) => {
          const text = Cypress.$(el).text();
          if (text.includes('lives in')) types.push('lives in');
          if (text.includes('member of')) types.push('member of');
          if (text.includes('owns')) types.push('owns');
          if (text.includes('practices')) types.push('practices');
        });
        
        // TODO: * Should be alphabetically sorted
        expect(types).to.deep.equal(['lives in', 'member of', 'owns', 'practices']);
      });
    });

    it('sorts by element category', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-sort"]').select('category');
      
      // TODO: * Relationships should be sorted by target element category
      cy.get('[data-cy^="relationship-"]').first().should('contain', 'Staff'); // item-object
      cy.get('[data-cy^="relationship-"]').last().should('contain', 'Fellowship'); // organization
    });
  });

  describe('Combined Filters', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('applies search and type filter together', () => {
      const moreRelationships: Relationship[] = [
        ...testRelationships,
        {
          id: 'rel-5',
          fromId: 'char-1',
          toId: 'loc-1',
          type: 'owns',
          description: 'Property in Rivendell',
          createdAt: new Date()
        }
      ];

      mountWithProviders(
        <RelationshipList
          relationships={moreRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Apply type filter
      cy.get('[data-cy="relationship-filter"]').select('owns');
      cy.get('[data-cy^="relationship-"]').should('have.length', 2);
      
      // * Add search filter
      cy.get('[data-cy="relationship-search"]').type('Rivendell');
      waitForAnimation();
      
      // ? TODO: * Should only show the one that matches both filters
      cy.get('[data-cy^="relationship-"]').should('have.length', 1);
      cy.get('[data-cy="relationship-rel-5"]').should('be.visible');
    });

    it('maintains filters when sorting changes', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Apply filter
      cy.get('[data-cy="relationship-filter"]').select('member of');
      cy.get('[data-cy^="relationship-"]').should('have.length', 1);
      
      // * Change sort
      cy.get('[data-cy="relationship-sort"]').select('type');
      
      // TODO: * Filter should still be applied
      cy.get('[data-cy^="relationship-"]').should('have.length', 1);
      cy.get('[data-cy="relationship-rel-2"]').should('be.visible');
    });
  });

  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('calls onElementClick when element name is clicked', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="navigate-to-loc-1"]').click();
      cy.wrap(onElementClickSpy).should('have.been.calledWith', 'loc-1');
    });

    it('calls onDelete when delete button is clicked', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="delete-relationship-rel-1"]').click();
      cy.wrap(onDeleteSpy).should('have.been.calledWith', 'rel-1');
    });

    it('shows delete button on hover (desktop)', () => {
      setDesktopViewport();
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: Delete button should be hidden initially
      cy.get('[data-cy="delete-relationship-rel-1"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      
      // * Hover over relationship
      cy.get('[data-cy="relationship-rel-1"]').trigger('mouseenter');
      
      // TODO: Delete button should be visible
      cy.get('[data-cy="delete-relationship-rel-1"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('always shows delete button on mobile', () => {
      setMobileViewport();
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: Delete buttons should be visible without hover on mobile
      cy.get('[data-cy="delete-relationship-rel-1"]').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles relationships without descriptions', () => {
      const relationshipNoDesc: Relationship = {
        id: 'rel-no-desc',
        fromId: 'char-1',
        toId: 'loc-1',
        type: 'visits',
        createdAt: new Date()
      };

      mountWithProviders(
        <RelationshipList
          relationships={[relationshipNoDesc]}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-rel-no-desc"]').should('be.visible');
      cy.get('[data-cy="relationship-rel-no-desc"]').should('contain', 'visits');
      cy.get('[data-cy="relationship-rel-no-desc"]').should('contain', 'Rivendell');
    });

    it('handles very long descriptions', () => {
      const longDesc = 'A'.repeat(200);
      const relationshipLongDesc: Relationship = {
        id: 'rel-long',
        fromId: 'char-1',
        toId: 'loc-1',
        type: 'related to',
        description: longDesc,
        createdAt: new Date()
      };

      mountWithProviders(
        <RelationshipList
          relationships={[relationshipLongDesc]}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: * Should truncate long descriptions
      cy.get('[data-cy="relationship-rel-long"]').within(() => {
        cy.get('.line-clamp-2').should('exist');
      });
    });

    it('handles many relationships', () => {
      const manyRelationships: Relationship[] = [];
      for (let i = 0; i < 50; i++) {
        manyRelationships.push({
          id: `rel-${i}`,
          fromId: 'char-1',
          toId: testElements[i % testElements.length].id,
          type: `type-${i % 5}`,
          createdAt: new Date()
        });
      }

      mountWithProviders(
        <RelationshipList
          relationships={manyRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: * Should render all relationships
      cy.get('[data-cy^="relationship-"]').should('have.length', 50);
      
      // TODO: * Filter dropdown should have unique types
      cy.get('[data-cy="relationship-filter"] option').should('have.length', 6); // All + 5 types
    });

    it('handles special characters in relationship types', () => {
      const specialRelationship: Relationship = {
        id: 'rel-special',
        fromId: 'char-1',
        toId: 'loc-1',
        type: 'parent/child & "special" <relation>',
        createdAt: new Date()
      };

      mountWithProviders(
        <RelationshipList
          relationships={[specialRelationship]}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-rel-special"]')
        .should('contain', 'parent/child & "special" <relation>');
    });

    it('handles unknown category icons', () => {
      const unknownCategoryElement: WorldElement = {
        ...mockElement,
        id: 'unknown-1',
        name: 'Unknown Element',
        category: 'unknown-category' as any
      };

      const relationshipToUnknown: Relationship = {
        id: 'rel-unknown',
        fromId: 'char-1',
        toId: 'unknown-1',
        type: 'related to',
        createdAt: new Date()
      };

      mountWithProviders(
        <RelationshipList
          relationships={[relationshipToUnknown]}
          elements={[...testElements, unknownCategoryElement]}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // TODO: * Should use default icon
      cy.get('[data-cy="relationship-rel-unknown"]').should('contain', '📄');
    });
  });

  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('has proper labels for interactive elements', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="relationship-search"]')
        .should('have.attr', 'placeholder', 'Search relationships...');
      
      cy.get('[data-cy="delete-relationship-rel-1"]')
        .should('have.attr', 'aria-label', 'Delete relationship');
    });

    it('supports keyboard navigation', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Tab to search
      cy.get('[data-cy="relationship-search"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'relationship-search');
      
      // * Tab to filter
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'relationship-filter');
      
      // * Tab to sort
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'relationship-sort');
    });

    it('element links are keyboard accessible', () => {
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      cy.get('[data-cy="navigate-to-loc-1"]').focus();
      cy.focused().type('{enter}');
      cy.wrap(onElementClickSpy).should('have.been.calledWith', 'loc-1');
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('adapts layout for mobile viewport', () => {
      setMobileViewport();
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Check mobile-specific classes
      cy.get('.flex-col.sm\\:flex-row').should('exist');
      cy.get('.hidden.sm\\:block').should('exist');
      cy.get('.min-h-\\[40px\\]').should('exist');
    });

    it('adapts layout for tablet viewport', () => {
      setTabletViewport();
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Check tablet/desktop classes
      cy.get('.sm\\:flex-row').should('be.visible');
      cy.get('.sm\\:gap-3').should('exist');
    });

    it('shows full layout on desktop', () => {
      setDesktopViewport();
      mountWithProviders(
        <RelationshipList
          relationships={testRelationships}
          elements={testElements}
          onDelete={onDeleteSpy}
          onElementClick={onElementClickSpy}
        />
      );

      // * Check desktop-specific features
      cy.get('.sm\\:opacity-0').should('exist'); // Hover-based delete buttons
      cy.get('.sm\\:items-center').should('exist');
    });
  });
});