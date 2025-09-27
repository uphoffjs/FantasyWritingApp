/**
 * @fileoverview Element Browser.simple Component Tests
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
import { ElementBrowser, WorldElement } from '../../support/component-test-helpers';

describe('ElementBrowser Component - Simplified', () => {
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

  // * Mock a single simple element
  const mockElement: WorldElement = {
    id: 'element-1',
    name: 'Test Element',
    category: 'character',
    description: 'A test element',
    completionPercentage: 50,
    questions: [],
    answers: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    tags: ['test'],
  };

  it('should mount component without errors', () => {
    cy.mountWithProviders(<ElementBrowser elements={[]} />);
    // * Just check that component mounts
    cy.wait(100); // Brief wait to ensure render
  });

  it('should show empty state with no elements', () => {
    cy.mountWithProviders(<ElementBrowser elements={[]} />);
    cy.contains('No elements yet').should('be.visible');
  });

  it('should display single element', () => {
    cy.mountWithProviders(<ElementBrowser elements={[mockElement]} />);
    cy.contains('Test Element').should('be.visible');
    cy.contains('1 element').should('be.visible');
  });
});