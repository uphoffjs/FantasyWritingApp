/**
 * @fileoverview Base Element Form.stateless Component Tests
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
import { Question, Answer } from '../../../src/types/worldbuilding';

describe('BaseElementForm - Stateless Tests', () => {
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

  // * Test with minimal React - no providers, no store
  const basicQuestions: Question[] = [
    {
      id: 'name',
      text: 'Name',
      type: 'text',
      category: 'Basic',
      required: true,
      placeholder: 'Enter name'
    },
    {
      id: 'description',
      text: 'Description',
      type: 'textarea',
      category: 'Basic',
      inputSize: 'small',
      helpText: 'Brief description'
    }
  ];

  const basicAnswers: Record<string, Answer> = {
    name: { value: 'Test Name', updatedAt: new Date() },
    description: { value: 'Test Description', updatedAt: new Date() }
  };

  it('renders without any providers', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.contains('Test Details').should('be.visible');
  });

  it('shows categories', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // TODO: * Category should be visible as a button
    cy.get('[data-cy="category-toggle-basic"]').should('be.visible');
    cy.contains('Basic').should('be.visible');
  });

  it('expands categories on click', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // TODO: * Questions should be hidden initially
    cy.contains('Name').should('not.be.visible');
    
    // * Click to expand
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // TODO: * Questions should now be visible
    cy.contains('Name').should('be.visible');
    cy.contains('Description').should('be.visible');
  });

  it('displays existing answers', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={basicAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Expand category
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // * Check values are displayed
    cy.get('[data-cy="question-name-input"]').should('have.value', 'Test Name');
    cy.get('[data-cy="question-description-input"]').should('have.value', 'Test Description');
  });

  it('calls onChange when typing', () => {
    const onChange = cy.stub();
    
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={onChange}
        elementType="Test"
        category="character"
      />
    );
    
    // * Expand category
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // * Type in name field
    cy.get('[data-cy="question-name-input"]').type('New Name');
    
    // * Verify onChange was called with correct arguments
    cy.wrap(onChange).should('have.been.called');
    cy.wrap(onChange).should('have.been.calledWith', 'name');
  });

  it('shows required field indicators', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // ? TODO: * Name field should show required indicator
    cy.contains('Name').parent().should('contain', '*');
    
    // TODO: * Description field should not
    cy.contains('Description').parent().should('not.contain', '*');
  });

  it('shows help text when clicked', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // TODO: * Help text should be hidden initially
    cy.get('[data-cy="question-description-help"]').should('not.exist');
    
    // * Click help button
    cy.get('[data-cy="question-description-help-button"]').click();
    
    // TODO: * Help text should appear
    cy.get('[data-cy="question-description-help"]')
      .should('be.visible')
      .and('contain', 'Brief description');
  });

  it('toggles between basic and detailed mode', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // ? TODO: * Should show basic mode message
    cy.contains('Quick Mode').should('be.visible');
    
    // * Toggle to detailed mode
    cy.get('[data-cy="mode-toggle"]').click();
    
    // TODO: * Basic mode message should disappear
    cy.contains('Quick Mode').should('not.exist');
  });

  it('handles different question types', () => {
    const mixedQuestions: Question[] = [
      {
        id: 'name',
        text: 'Name',
        type: 'text',
        category: 'Info'
      },
      {
        id: 'age',
        text: 'Age',
        type: 'number',
        category: 'Info',
        validation: { min: 0, max: 1000 }
      },
      {
        id: 'type',
        text: 'Type',
        type: 'select',
        category: 'Info',
        options: [
          { value: 'hero', label: 'Hero' },
          { value: 'villain', label: 'Villain' }
        ]
      },
      {
        id: 'active',
        text: 'Active',
        type: 'boolean',
        category: 'Info'
      }
    ];

    cy.mount(
      <BaseElementForm
        questions={mixedQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.get('[data-cy="category-toggle-info"]').click();
    
    // * Check all input types are rendered
    cy.get('[data-cy="question-name-input"]').should('have.attr', 'type', 'text');
    cy.get('[data-cy="question-age-input"]').should('have.attr', 'type', 'number');
    cy.get('[data-cy="question-type-input"]').should('be.visible'); // select
    cy.get('[data-cy="question-active-toggle"]').should('be.visible'); // boolean radio buttons
  });

  it('shows error for required fields without values', () => {
    cy.mount(
      <BaseElementForm
        questions={basicQuestions}
        answers={{}} // No answers provided
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.get('[data-cy="category-toggle-basic"]').click();
    
    // ? TODO: * Required field without value should show error
    cy.get('[data-cy="question-name-error"]')
      .should('be.visible')
      .and('contain', 'This field is required');
  });
});