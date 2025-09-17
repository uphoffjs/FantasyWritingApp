/// <reference types="cypress" />
import React from 'react';
import { BaseElementForm } from '../../src/components/elements/BaseElementForm';
import { Answer } from '../../src/types/worldbuilding';

describe('BaseElementForm - Incremental Tests', () => {
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
  
  const simpleAnswers: Record<string, Answer> = {
    name: { value: 'Test Name', updatedAt: new Date() },
    age: { value: 30, updatedAt: new Date() }
  };

  it('renders with questions - starting in detailed mode', () => {
    // Start with detailed mode to see all questions
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // First switch to detailed mode to bypass basic filtering
    cy.get('[data-cy="mode-toggle"]').click();
    
    // Now categories should be visible
    cy.contains('General').should('be.visible');
  });
  
  it.skip('renders with questions - old test', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.contains('Test Details').should('be.visible');
    cy.contains('General').should('be.visible');
  });
  
  it('renders with answers', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.contains('Test Details').should('be.visible');
  });
  
  it('expands category when clicked', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // Check category is visible
    cy.contains('General').should('be.visible');
    
    // Click to expand using the data-cy selector for the category
    cy.get('[data-cy="category-toggle-general"]').click();
    
    // Check if questions become visible
    cy.contains('Name').should('be.visible');
    cy.contains('Age').should('be.visible');
  });
  
  it('shows input values', () => {
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={simpleAnswers}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // Expand category
    cy.get('[data-cy="category-toggle-general"]').click();
    
    // Check input values
    cy.get('input[type="text"]').first().should('have.value', 'Test Name');
    cy.get('input[type="number"]').first().should('have.value', '30');
  });
  
  it('calls onChange when input changes', () => {
    const onChange = cy.stub();
    
    cy.mount(
      <BaseElementForm
        questions={simpleQuestions}
        answers={{}}
        onChange={onChange}
        elementType="Test"
        category="character"
      />
    );
    
    // Expand category
    cy.get('[data-cy="category-toggle-general"]').click();
    
    // Type in text input
    cy.get('input[type="text"]').first().type('New Value');
    
    // Check onChange was called
    cy.wrap(onChange).should('have.been.called');
  });
});