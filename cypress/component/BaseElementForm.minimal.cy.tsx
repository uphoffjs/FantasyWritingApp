/// <reference types="cypress" />
import React from 'react';
import { BaseElementForm } from '../support/component-test-helpers';

describe('BaseElementForm - Minimal Test', () => {
  it('mounts without crashing', () => {
    // Absolute minimal test with no store, just raw component
    const minimalQuestions = [
      {
        id: 'test',
        text: 'Test Question',
        type: 'text' as const,
        category: 'Test'
      }
    ];
    
    cy.mount(
      <BaseElementForm
        questions={minimalQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // Just check if the component renders at all
    cy.contains('Test Details').should('exist');
  });
  
  it('renders with mock div instead of component', () => {
    // Test if mounting works at all
    cy.mount(<div data-testid="test">Hello World</div>);
    cy.get('[data-testid="test"]').should('contain', 'Hello World');
  });
});