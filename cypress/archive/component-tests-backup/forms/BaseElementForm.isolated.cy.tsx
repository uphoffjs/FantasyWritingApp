/**
 * @fileoverview Base Element Form.isolated Component Tests
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

describe('BaseElementForm - Isolated Tests', () => {
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

  it('mounts the component', () => {
    cy.mountWithProviders(
      <BaseElementForm
        questions={[]}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // * Just check it renders
    cy.contains('Test Details').should('exist');
  });

  it('shows the mode toggle', () => {
    cy.mountWithProviders(
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

    cy.mountWithProviders(
      <BaseElementForm
        questions={[question]}
        answers={{}}
        onChange={() => {}}
        elementType="Test"
        category="character"
      />
    );
    
    // TODO: * Category should exist
    cy.contains('Test Category').should('exist');
  });
});