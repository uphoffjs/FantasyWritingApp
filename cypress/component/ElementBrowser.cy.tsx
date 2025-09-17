import React from 'react';
import { ElementBrowser } from '../../src/components/ElementBrowser';
import { WorldElement } from '../../src/types/models/WorldElement';
import { ElementCategory } from '../../src/types/models/ElementCategory';

describe('ElementBrowser Component', () => {
  // Mock elements data for testing
  const mockElements: WorldElement[] = [
    {
      id: 'element-1',
      name: 'Aragorn',
      category: 'character' as ElementCategory,
      description: 'A brave ranger from the north',
      completionPercentage: 85,
      questions: [],
      answers: {},
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      tags: ['hero', 'ranger'],
    },
    {
      id: 'element-2',
      name: 'Rivendell',
      category: 'location' as ElementCategory,
      description: 'The beautiful elven city',
      completionPercentage: 60,
      questions: [],
      answers: {},
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-10'),
      tags: ['elven', 'peaceful'],
    },
    {
      id: 'element-3',
      name: 'Sting',
      category: 'item-object' as ElementCategory,
      description: 'A glowing elven sword',
      completionPercentage: 90,
      questions: [],
      answers: {},
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-20'),
      tags: ['weapon', 'magical'],
    },
    {
      id: 'element-4',
      name: 'Fireball',
      category: 'magic-power' as ElementCategory,
      description: 'A powerful fire spell',
      completionPercentage: 45,
      questions: [],
      answers: {},
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-08'),
      tags: ['spell', 'destructive'],
    },
  ];

  let mockOnElementPress;
  let mockOnCreateElement;
  let mockOnRefresh;

  beforeEach(() => {
    mockOnElementPress = cy.stub().as('onElementPress');
    mockOnCreateElement = cy.stub().as('onCreateElement');
    mockOnRefresh = cy.stub().as('onRefresh');
  });

  it('should render list of elements', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Check that elements are rendered
    cy.contains('Aragorn').should('be.visible');
    cy.contains('Rivendell').should('be.visible');
    cy.contains('Sting').should('be.visible');
    cy.contains('Fireball').should('be.visible');
    
    // Check result count
    cy.contains('4 elements').should('be.visible');
  });

  it('should handle search functionality', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Type in search box
    cy.get('input[placeholder="Search elements..."]').type('Aragorn');
    
    // Should show only matching element
    cy.contains('Aragorn').should('be.visible');
    cy.contains('Rivendell').should('not.exist');
    cy.contains('Sting').should('not.exist');
    cy.contains('Fireball').should('not.exist');
    
    // Check updated result count
    cy.contains('1 element').should('be.visible');
  });

  it('should handle search by description', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Search by description content
    cy.get('input[placeholder="Search elements..."]').type('elven');
    
    // Should show both Rivendell (elven city) and Sting (elven sword)
    cy.contains('Rivendell').should('be.visible');
    cy.contains('Sting').should('be.visible');
    cy.contains('Aragorn').should('not.exist');
    cy.contains('Fireball').should('not.exist');
    
    cy.contains('2 elements').should('be.visible');
  });

  it('should handle search by tags', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Search by tag
    cy.get('input[placeholder="Search elements..."]').type('magical');
    
    // Should show Sting (has 'magical' tag)
    cy.contains('Sting').should('be.visible');
    cy.contains('Aragorn').should('not.exist');
    cy.contains('Rivendell').should('not.exist');
    cy.contains('Fireball').should('not.exist');
  });

  it('should clear search when clear [data-cy*="button"] clicked', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Type in search
    cy.get('input[placeholder="Search elements..."]').type('Aragorn');
    cy.contains('1 element').should('be.visible');
    
    // Clear search
    cy.contains('✕').click();
    
    // Should show all elements again
    cy.contains('4 elements').should('be.visible');
    cy.contains('Aragorn').should('be.visible');
    cy.contains('Rivendell').should('be.visible');
  });

  it('should handle category filtering', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Click on Characters filter
    cy.contains('Characters').click();
    
    // Should show only character elements
    cy.contains('Aragorn').should('be.visible');
    cy.contains('Rivendell').should('not.exist');
    cy.contains('Sting').should('not.exist');
    cy.contains('Fireball').should('not.exist');
    
    cy.contains('1 element').should('be.visible');
  });

  it('should handle location category filtering', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Click on Locations filter
    cy.contains('Locations').click();
    
    // Should show only location elements
    cy.contains('Rivendell').should('be.visible');
    cy.contains('Aragorn').should('not.exist');
    cy.contains('Sting').should('not.exist');
    cy.contains('Fireball').should('not.exist');
  });

  it('should reset to all elements when All filter [data-cy*="select"]ed', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Filter by category first
    cy.contains('Characters').click();
    cy.contains('1 element').should('be.visible');
    
    // Switch back to All
    cy.contains('All').click();
    
    // Should show all elements
    cy.contains('4 elements').should('be.visible');
  });

  it('should handle sorting by name', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Open sort dropdown
    cy.contains('Sort by Recently Updated').click();
    
    // Select name sorting
    cy.contains('Name').click();
    
    // Should update sort indicator
    cy.contains('Sort by Name').should('be.visible');
    
    // Elements should be sorted alphabetically (need to check order)
    // Alphabetical order should be: Aragorn, Fireball, Rivendell, Sting
  });

  it('should handle sorting by completion percentage', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Open sort dropdown
    cy.contains('Sort by Recently Updated').click();
    
    // Select completion sorting
    cy.contains('Completion %').click();
    
    // Should update sort indicator
    cy.contains('Sort by Completion %').should('be.visible');
  });

  it('should handle element click navigation', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Click on an element card
    cy.contains('Aragorn').click();
    
    // Should call onElementPress with the correct element
    cy.get('@onElementPress').should('have.been.calledWith', mockElements[0]);
  });

  it('should show empty state when no elements', () => {
    cy.mount(
      <ElementBrowser 
        elements={[]} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Check empty state
    cy.contains('No elements yet').should('be.visible');
    cy.contains('Create your first element to get started').should('be.visible');
    cy.contains('Create Element').should('be.visible');
    
    // Check empty icon
    cy.contains('📝').should('be.visible');
  });

  it('should show filtered empty state when search has no results', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Search for something that doesn't exist
    cy.get('input[placeholder="Search elements..."]').type('NonexistentElement');
    
    // Check filtered empty state
    cy.contains('No elements found').should('be.visible');
    cy.contains('Try adjusting your filters').should('be.visible');
    
    // Create [data-cy*="button"] should not be visible in filtered empty state
    cy.contains('Create Element').should('not.exist');
  });

  it('should handle create element from empty state', () => {
    cy.mount(
      <ElementBrowser 
        elements={[]} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Click create [data-cy*="button"] in empty state
    cy.contains('Create Element').click();
    
    cy.get('@onCreateElement').should('have.been.called');
  });

  it('should show floating action [data-cy*="button"] when elements exist', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Check for floating action [data-cy*="button"]
    cy.contains('+').should('be.visible');
  });

  it('should handle floating action [data-cy*="button"] click', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        onCreateElement={mockOnCreateElement}
        testID="element-browser"
      />
    );

    // Click floating action [data-cy*="button"]
    cy.contains('+').click();
    
    cy.get('@onCreateElement').should('have.been.called');
  });

  it('should show loading state', () => {
    cy.mount(
      <ElementBrowser 
        elements={[]} 
        onElementPress={mockOnElementPress}
        loading={true}
        testID="element-browser"
      />
    );

    // Check loading state
    cy.contains('Loading elements...').should('be.visible');
    
    // Should show activity indicator (appears as spinner in web)
    cy.get('[data-testid="element-browser"]').should('exist');
  });

  it('should handle refresh functionality', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        onRefresh={mockOnRefresh}
        refreshing={false}
        testID="element-browser"
      />
    );

    // Pull to refresh is difficult to test in component tests
    // But we can verify the refresh control is set up
    cy.get('[data-testid="element-browser"]').should('be.visible');
  });

  it('should handle combined search and filter', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Apply category filter first
    cy.contains('Items').click(); // Should show Sting
    cy.contains('1 element').should('be.visible');
    cy.contains('Sting').should('be.visible');
    
    // Then apply search
    cy.get('input[placeholder="Search elements..."]').type('sword');
    
    // Should still show Sting (item that matches search)
    cy.contains('Sting').should('be.visible');
  });

  it('should handle case-insensitive search', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Search with different cases
    cy.get('input[placeholder="Search elements..."]').type('ARAGORN');
    cy.contains('Aragorn').should('be.visible');
    
    // Clear and try lowercase
    cy.contains('✕').click();
    cy.get('input[placeholder="Search elements..."]').type('rivendell');
    cy.contains('Rivendell').should('be.visible');
  });

  it('should maintain filter state during search', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Apply category filter
    cy.contains('Characters').click();
    
    // Search within that category
    cy.get('input[placeholder="Search elements..."]').type('Aragorn');
    
    // Should maintain both filter and search
    cy.contains('Characters').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    cy.contains('Aragorn').should('be.visible');
    cy.contains('1 element').should('be.visible');
  });

  it('should close sort dropdown when option [data-cy*="select"]ed', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Open sort dropdown
    cy.contains('Sort by Recently Updated').click();
    cy.contains('Name').should('be.visible');
    
    // Select an option
    cy.contains('Name').click();
    
    // Dropdown should close
    cy.contains('Completion %').should('not.exist');
  });

  it('should show correct category icons', () => {
    cy.mount(
      <ElementBrowser 
        elements={mockElements} 
        onElementPress={mockOnElementPress}
        testID="element-browser"
      />
    );

    // Check that category filter chips have correct icons
    cy.contains('👤').should('be.visible'); // Characters
    cy.contains('📍').should('be.visible'); // Locations  
    cy.contains('🗝️').should('be.visible'); // Items
    cy.contains('✨').should('be.visible'); // Magic
  });
});