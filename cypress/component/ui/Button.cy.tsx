/**
 * @fileoverview Button Component Tests
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
import { Button } from '../../../src/components/Button';

describe('Button Component', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  it('should render a button with React Native components', () => {
    cy.mount(
      <Button 
        title="Click me"
        onPress={cy.stub().as('onPress')}
        testID="test-button"
      />
    );
    
    // * React Native Web converts testID to data-cy for web testing
    cy.get('[data-cy="test-button"]').should('be.visible');
    cy.get('[data-cy="test-button"]').should('contain', 'Click me');
    cy.get('[data-cy="test-button"]').click();
    cy.get('@onPress').should('have.been.called');
  });

  it('should handle different variants', () => {
    cy.mount(
      <Button 
        title="Secondary Button"
        onPress={() => {}}
        variant="secondary"
        testID="secondary-button"
      />
    );
    
    cy.get('[data-cy="secondary-button"]').should('be.visible');
    cy.get('[data-cy="secondary-button"]').should('contain', 'Secondary Button');
  });

  it('should show loading state', () => {
    cy.mount(
      <Button 
        title="Loading Button"
        onPress={() => {}}
        loading={true}
        testID="loading-button"
      />
    );
    
    cy.get('[data-cy="loading-button"]').should('be.visible');
    // ? TODO: ? TODO: Find better way to test ActivityIndicator content in React Native Web
    cy.get('[data-cy="loading-button"]').should('exist');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(
      <Button 
        title="Disabled Button"
        onPress={cy.stub().as('onPress')}
        disabled={true}
        testID="disabled-button"
      />
    );
    
    cy.get('[data-cy="disabled-button"]').should('be.visible');
    cy.get('[data-cy="disabled-button"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });
});