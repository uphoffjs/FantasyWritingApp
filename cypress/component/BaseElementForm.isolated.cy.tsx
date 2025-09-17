/// <reference types="cypress" />
import React from 'react';
import { BaseElementForm } from '../support/component-test-helpers';

describe('BaseElementForm - Isolated Tests', () => {
  it('mounts the component', () => {
    cy.mount(
      <BaseElementForm
        questions={[]}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // Just check it renders
    cy.contains('Test Details').should('exist');
  });

  it('shows the mode toggle', () => {
    cy.mount(
      <BaseElementForm
        questions={[]}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    cy.contains('Basic').should('exist');
    cy.contains('Detailed').should('exist');
  });

  it('renders with one simple question', () => {
    const question = {
      id: 'test',
      text: 'Test Question',
      type: 'text' as const,
      category: 'Test Category'
    };

    cy.mount(
      <BaseElementForm
        questions={[question]}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // Category should exist
    cy.contains('Test Category').should('exist');
  });
});