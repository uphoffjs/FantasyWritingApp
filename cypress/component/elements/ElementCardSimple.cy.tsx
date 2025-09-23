/**
 * Simple ElementCard test without cy.stub() to verify basic rendering
 */

import React from 'react';
import { ElementCard } from '../../../src/components/ElementCard';
import { WorldElement } from '../../../src/types/models/WorldElement';
import { ElementCategory } from '../../../src/types/models/ElementCategory';

describe('ElementCard Simple Test', () => {
  // * Mock element data for testing
  const mockElement: WorldElement = {
    id: 'test-element-1',
    name: 'Test Character',
    category: 'character' as ElementCategory,
    description: 'A brave warrior from the northern kingdoms',
    completionPercentage: 0,
    questions: [],
    answers: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    tags: ['hero', 'warrior'],
    relationships: [],
  };

  it('should render without crashing', () => {
    // * Use a simple function instead of cy.stub()
    const handlePress = () => {
      console.log('Card pressed');
    };

    cy.mountWithProviders(
      <ElementCard
        element={mockElement}
        onPress={handlePress}
        testID="element-card"
      />
    );

    // * Just check that something renders
    cy.get('[data-cy="element-card"]').should('exist');
  });

  it('should display element name', () => {
    const handlePress = () => {
      console.log('Card pressed');
    };

    cy.mountWithProviders(
      <ElementCard
        element={mockElement}
        onPress={handlePress}
        testID="element-card"
      />
    );

    // * Check that the name is visible somewhere on the page
    cy.contains('Test Character').should('be.visible');
  });

  it('should display element category', () => {
    const handlePress = () => {
      console.log('Card pressed');
    };

    cy.mountWithProviders(
      <ElementCard
        element={mockElement}
        onPress={handlePress}
        testID="element-card"
      />
    );

    // * Check that the category is visible
    cy.contains('character').should('be.visible');
  });
});