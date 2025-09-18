/// <reference types="cypress" />
import React from 'react';
import { BaseElementForm } from '../support/component-test-helpers';
import { Answer } from '../../src/types/worldbuilding';
import { MockWorldbuildingStoreProvider } from '../support/component-test-helpers';

// * Simple mock questions without complex validation
const simpleQuestions = [
  {
    id: 'q1',
    text: 'Name',
    type: 'text' as const,
    required: true,
    category: 'General',
    placeholder: 'Enter name'
  },
  {
    id: 'q2', 
    text: 'Description',
    type: 'textarea' as const,
    category: 'General',
    inputSize: 'small' as const, // Use small to avoid RichTextEditor
    helpText: 'Provide a description'
  },
  {
    id: 'q3',
    text: 'Age',
    type: 'number' as const,
    category: 'Details',
    validation: { min: 0, max: 1000 }
  },
  {
    id: 'q4',
    text: 'Type',
    type: 'select' as const,
    category: 'Details',
    options: [
      { value: 'hero', label: 'Hero' },
      { value: 'villain', label: 'Villain' },
      { value: 'neutral', label: 'Neutral' }
    ]
  }
];

const simpleAnswers: Record<string, Answer> = {
  q1: { value: 'Test Character', updatedAt: new Date() },
  q2: { value: 'A brave warrior', updatedAt: new Date() },
  q3: { value: 25, updatedAt: new Date() },
  q4: { value: 'hero', updatedAt: new Date() }
};

describe('BaseElementForm (Simple Tests)', () => {
  beforeEach(() => {
    cy.resetFactories();
  });
  
  it('renders form header and basic structure', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={simpleAnswers}
          onChange={cy.stub()}
          elementType="Character"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // * Check form header
    cy.contains('Character Details').should('be.visible');
    
    // * Check mode toggle exists
    cy.contains('Basic').should('be.visible');
    cy.contains('Detailed').should('be.visible');
    
    // * Check the main form element exists
    cy.get('[data-testid="base-element-form"]').should('exist');
  });
  
  it('shows categories that can be expanded', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // TODO: * Categories should be visible
    cy.contains('General').should('be.visible');
    cy.contains('Details').should('be.visible');
    
    // TODO: * Questions should be hidden initially
    cy.contains('Name').should('not.be.visible');
    
    // * Expand category using data-cy [data-cy*="select"]or
    cy.get('[data-testid="category-toggle-general"]').click();
    cy.contains('Name').should('be.visible');
  });
  
  it('displays answers correctly', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={simpleAnswers}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // * Expand categories
    cy.get('[data-testid="category-toggle-general"]').click();
    cy.get('[data-testid="category-toggle-details"]').click();
    
    // * Check text input value
    cy.get('[data-testid="question-q1-input"]').should('have.value', 'Test Character');
    
    // * Check textarea value  
    cy.get('[data-testid="question-q2-input"]').should('have.value', 'A brave warrior');
    
    // * Check number input value
    cy.get('[data-testid="question-q3-input"]').should('have.value', '25');
    
    // Check [data-cy*="select"] value
    cy.get('[data-testid="question-q4-input"]').should('have.value', 'hero');
  });
  
  it('handles basic interactions', () => {
    const onChange = cy.stub();
    
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={onChange}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // Expand General category
    cy.get('[data-testid="category-toggle-general"]').click();
    
    // * Type in the name field and blur to trigger onChange
    cy.get('[data-testid="question-q1-input"]').type('New Name').blur();
    
    // * Verify onChange was called with the complete value
    cy.wrap(onChange).should('have.been.calledWith', 'q1', 'New Name');
  });
  
  it('shows required field indicators', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    cy.get('[data-testid="category-toggle-general"]').click();
    
    // TODO: * Required fields should have asterisk
    cy.contains('Name').parent().should('contain', '*');
    
    // TODO: * Required input should have required attribute
    cy.get('[data-testid="question-q1-input"]').should('have.attr', 'required');
  });
  
  it('displays help text when clicked', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    cy.get('[data-testid="category-toggle-general"]').click();
    
    // * Click the help button
    cy.get('[data-testid="question-q2-help-button"]').click();
    
    // TODO: * Help text should appear
    cy.get('[data-testid="question-q2-help"]').should('be.visible').and('contain', 'Provide a description');
  });
  
  it('handles mode switching', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // TODO: * Should start in basic mode
    cy.contains('Quick Mode').should('be.visible');
    
    // * Click the mode toggle [data-cy*="button"]
    cy.get('[data-testid="mode-toggle"]').click();
    
    // TODO: * Should switch to detailed mode
    cy.contains('Quick Mode').should('not.exist');
  });
  
  it('handles empty questions gracefully', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={[]}
          answers={{}}
          onChange={cy.stub()}
          elementType="Empty"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // TODO: * Should still render the form header
    cy.contains('Empty Details').should('be.visible');
    
    // ? TODO: * Should show mode toggle
    cy.contains('Basic').should('be.visible');
    cy.contains('Detailed').should('be.visible');
  });

  it('handles number input changes', () => {
    const onChange = cy.stub();
    
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={onChange}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // Expand Details category
    cy.get('[data-testid="category-toggle-details"]').click();
    
    // * Type in the age field
    cy.get('[data-testid="question-q3-input"]').type('30');
    
    // * Verify onChange was called with number
    cy.wrap(onChange).should('have.been.calledWith', 'q3', 30);
  });

  it('handles [data-cy*="select"] changes', () => {
    const onChange = cy.stub();
    
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={onChange}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    // Expand Details category
    cy.get('[data-testid="category-toggle-details"]').click();
    
    // * Select an option
    cy.get('[data-testid="question-q4-input"]').select('villain');
    
    // * Verify onChange was called
    cy.wrap(onChange).should('have.been.calledWith', 'q4', 'villain');
  });

  it('respects number input validation attributes', () => {
    cy.mount(
      <MockWorldbuildingStoreProvider>
        <BaseElementForm
          questions={simpleQuestions}
          answers={{}}
          onChange={cy.stub()}
          elementType="Test"
          category="character"
        />
      </MockWorldbuildingStoreProvider>
    );
    
    cy.get('[data-testid="category-toggle-details"]').click();
    
    // * Check validation attributes
    cy.get('[data-testid="question-q3-input"]')
      .should('have.attr', 'min', '0')
      .should('have.attr', 'max', '1000');
  });
});