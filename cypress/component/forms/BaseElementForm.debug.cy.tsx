/**
 * @fileoverview Base Element Form.debug Component Tests
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
import { BaseElementForm } from '../../support/component-test-helpers';

describe('BaseElementForm - Debug Tests', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const simpleQuestions = [
    {
      id: 'name',
      text: 'Name',
      type: 'text' as const,
      category: 'General',
      placeholder: 'Enter name'
    },
    {
      id: 'age',
      text: 'Age', 
      type: 'number' as const,
      category: 'General'
    }
  ];
  
  const simpleAnswers = {
    name: { value: 'Test Name', updatedAt: new Date() },
    age: { value: 30, updatedAt: new Date() }
  };

  it('debug: shows category initially', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Check that category is visible
    cy.contains('General').should('be.visible');
    
    // * Check that the toggle button exists with correct testID
    cy.get('[data-cy="category-toggle-general"]').should('exist');
    
    // * Log what we see
    cy.get('[data-cy="category-toggle-general"]').then($el => {});
  });

  it('debug: category expands on click', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Click the category toggle
    cy.get('[data-cy="category-toggle-general"]').click();
    
    // * Wait a bit for React to update
    cy.wait(500);
    
    // * Check if questions container exists
    cy.get('[data-cy="category-general-questions"]').should('exist');
    
    // Log DOM state after click
    cy.document().then(doc => {});
  });
  
  it('debug: question labels appear when expanded', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Click to expand
    cy.get('[data-cy="category-toggle-general"]').click();
    cy.wait(500);
    
    // * Check for question labels
    cy.get('[data-cy="question-label-name"]').should('exist');
    cy.get('[data-cy="question-label-age"]').should('exist');
    
    // * Check if text is visible
    cy.contains('Name').should('be.visible');
    cy.contains('Age').should('be.visible');
  });

  it('debug: inputs appear when expanded', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Click to expand
    cy.get('[data-cy="category-toggle-general"]').click();
    cy.wait(500);
    
    // * Check for inputs by question ID
    cy.get('[data-cy="question-name-input"]').should('exist');
    cy.get('[data-cy="question-age-input"]').should('exist');
    
    // * Check for text-input testID
    cy.get('[data-cy="text-input"]').should('exist');
    
    // * Check values
    cy.get('[data-cy="question-name-input"]').should('have.value', 'Test Name');
    cy.get('[data-cy="question-age-input"]').should('have.value', '30');
  });
});