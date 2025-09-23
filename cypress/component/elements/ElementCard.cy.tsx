/**
 * @fileoverview Element Card Component Tests
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
import { ElementCard } from '../../../src/components/ElementCard';
import { WorldElement } from '../../../src/types/models/WorldElement';
import { ElementCategory } from '../../../src/types/models/ElementCategory';

describe('ElementCard Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  // * Mock element data for testing
  const mockElement: WorldElement = {
    id: 'test-element-1',
    name: 'Test Character',
    category: 'character' as ElementCategory,
    description: 'A brave warrior from the northern kingdoms',
    completionPercentage: 75,
    questions: [],
    answers: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    tags: ['hero', 'warrior'],
    relationships: [
      {
        id: 'rel-1',
        fromElementId: 'test-element-1',
        toElementId: 'test-element-2',
        relationshipType: 'friend',
        description: 'Childhood friend',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  let mockOnPress;
  let onPressCalled = false;

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Use regular function instead of cy.stub() for RN Web compatibility
    onPressCalled = false;
    mockOnPress = () => {
      onPressCalled = true;
    };
  });

  it('should render correctly with element data', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // * Check that the card is visible
    cy.get('[data-cy="element-card"]').should('be.visible');
    
    // * Check element name
    cy.get('[data-cy="element-name"]').should('contain.text', 'Test Character');
    
    // * Check category
    cy.get('[data-cy="element-category"]').should('contain.text', 'character');
    
    // * Check description
    cy.get('[data-cy="element-description"]').should('contain.text', 'A brave warrior from the northern kingdoms');
    
    // * Check completion percentage
    cy.get('[data-cy="completion-text"]').should('contain.text', '75%');
    
    // * Check category icon is present
    cy.get('[data-cy="category-icon"]').should('be.visible');
  });

  it('should handle click interaction', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    cy.get('[data-cy="element-card"]').click();
    // * Check that our function was called
    cy.wrap(null).should(() => {
      expect(onPressCalled).to.be.true;
    });
  });

  it('should display completion badge based on percentage', () => {
    // * Test different completion levels
    const testCases = [
      { percentage: 100, expectedText: 'Complete', expectedIcon: '🏅' },
      { percentage: 85, expectedText: 'Nearly Done', expectedIcon: '⭐' },
      { percentage: 65, expectedText: 'In Progress', expectedIcon: '⚡' },
      { percentage: 25, expectedText: 'Started', expectedIcon: '✨' },
      { percentage: 0, expectedText: 'Not Started', expectedIcon: '📋' },
    ];

    testCases.forEach(({ percentage, expectedText, expectedIcon }) => {
      const testElement = { 
        ...mockElement, 
        completionPercentage: percentage,
        name: `Test Element ${percentage}%`
      };

      cy.mountWithProviders(
        <ElementCard 
          element={testElement} 
          onPress={mockOnPress}
          testID="element-card"
        />
      );

      // * Check badge text is present (note: checking for visible text, not exact match due to styling)
      cy.get('[data-cy="element-card"]').should('contain.text', expectedText);
    });
  });

  it('should show color theming based on category', () => {
    const categoryTestCases: ElementCategory[] = [
      'character',
      'location', 
      'item-object',
      'magic-power',
      'event'
    ];

    categoryTestCases.forEach((category) => {
      const testElement = { 
        ...mockElement, 
        category,
        name: `Test ${category}` 
      };

      cy.mountWithProviders(
        <ElementCard 
          element={testElement} 
          onPress={mockOnPress}
          testID="element-card"
        />
      );

      // * Check that the card renders with category-specific styling
      cy.get('[data-cy="element-card"]').should('be.visible');
      cy.get('[data-cy="element-category"]').should('contain.text', category.replace('-', ' '));
    });
  });

  it('should display tags when present', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // * Check tags are displayed
    cy.get('[data-cy="element-tag"]').should('have.length', 2);
    cy.get('[data-cy="element-tag"]').first().should('contain.text', 'hero');
    cy.get('[data-cy="element-tag"]').last().should('contain.text', 'warrior');
  });

  it('should show more tags indicator when there are many tags', () => {
    const elementWithManyTags = {
      ...mockElement,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    cy.mountWithProviders(
      <ElementCard 
        element={elementWithManyTags} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // ? TODO: * Should show only first 2 tags
    cy.get('[data-cy="element-tag"]').should('have.length', 2);
    
    // ? TODO: * Should show more tags indicator
    cy.get('[data-cy="element-card"]').should('contain.text', '+3');
  });

  it('should display relationships count', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // * Check relationships count
    cy.get('[data-cy="element-card"]').should('contain.text', '1 connection');
  });

  it('should handle element without description', () => {
    const elementWithoutDescription = {
      ...mockElement,
      description: undefined,
    };

    cy.mountWithProviders(
      <ElementCard 
        element={elementWithoutDescription} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    cy.get('[data-cy="element-card"]').should('be.visible');
    cy.get('[data-cy="element-description"]').should('not.exist');
  });

  it('should handle element without tags', () => {
    const elementWithoutTags = {
      ...mockElement,
      tags: undefined,
    };

    cy.mountWithProviders(
      <ElementCard 
        element={elementWithoutTags} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    cy.get('[data-cy="element-card"]').should('be.visible');
    cy.get('[data-cy="element-tag"]').should('not.exist');
  });

  it('should have proper accessibility attributes', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // * Check that the card is accessible
    cy.get('[data-cy="element-card"]')
      .should('be.visible')
      .and('have.attr', 'role'); // React Native Web converts Pressable to button-like element
  });

  it('should format dates correctly', () => {
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    // * Check that updated date is formatted and displayed
    cy.get('[data-cy="element-card"]').should('contain.text', 'Updated Jan 15, 2024');
  });

  it('should handle custom icon prop', () => {
    const customIcon = '🧙‍♂️';
    
    cy.mountWithProviders(
      <ElementCard 
        element={mockElement} 
        icon={customIcon}
        onPress={mockOnPress}
        testID="element-card"
      />
    );

    cy.get('[data-cy="category-icon"]').should('contain.text', customIcon);
  });
});