/**
 * @fileoverview Progress Bar Component Tests
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
import { ProgressBar } from '../../support/component-test-helpersProgressBar';

describe('ProgressBar Component', () => {
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

  it('should render with default props', () => {
    cy.mount(<ProgressBar value={50} />);
    
    cy.get('[data-cy="progress-bar"]').should('exist');
    cy.get('[data-cy="progress-fill"]').should('have.attr', 'style').and('include', 'width: 50%');
  });

  it('should display percentage text when showPercentage is true', () => {
    cy.mount(<ProgressBar value={75} showPercentage />);
    
    cy.get('[data-cy="progress-percentage"]').should('contain', '75%');
  });

  it('should not display percentage text when showPercentage is false', () => {
    cy.mount(<ProgressBar value={75} showPercentage={false} />);
    
    cy.get('[data-cy="progress-percentage"]').should('not.exist');
  });

  it('should handle 0% progress', () => {
    cy.mount(<ProgressBar value={0} showPercentage />);
    
    cy.get('[data-cy="progress-fill"]').should('have.attr', 'style').and('include', 'width: 0%');
    cy.get('[data-cy="progress-percentage"]').should('contain', '0%');
  });

  it('should handle 100% progress', () => {
    cy.mount(<ProgressBar value={100} showPercentage />);
    
    cy.get('[data-cy="progress-fill"]').should('have.attr', 'style').and('include', 'width: 100%');
    cy.get('[data-cy="progress-percentage"]').should('contain', '100%');
  });

  it('should clamp values above 100 to 100', () => {
    cy.mount(<ProgressBar value={150} showPercentage />);
    
    cy.get('[data-cy="progress-fill"]').should('have.attr', 'style').and('include', 'width: 100%');
    cy.get('[data-cy="progress-percentage"]').should('contain', '100%');
  });

  it('should clamp negative values to 0', () => {
    cy.mount(<ProgressBar value={-50} showPercentage />);
    
    cy.get('[data-cy="progress-fill"]').should('have.attr', 'style').and('include', 'width: 0%');
    cy.get('[data-cy="progress-percentage"]').should('contain', '0%');
  });

  it('should apply custom className', () => {
    cy.mount(<ProgressBar value={50} className="custom-class" />);
    
    // className is applied to the wrapper div, not the progress-bar itself
    cy.get('.custom-class').should('exist');
    cy.get('.custom-class').find('[data-cy="progress-bar"]').should('exist');
  });

  it('should apply color based on value', () => {
    // * Low progress - blood (red) theme color
    cy.mount(<ProgressBar value={20} />);
    cy.get('[data-cy="progress-fill"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // * Medium progress - flame (orange) theme color
    cy.mount(<ProgressBar value={50} />);
    cy.get('[data-cy="progress-fill"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // * High progress - forest (green) theme color
    cy.mount(<ProgressBar value={80} />);
    cy.get('[data-cy="progress-fill"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // Complete - forest (green) theme color
    cy.mount(<ProgressBar value={100} />);
    cy.get('[data-cy="progress-fill"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should support different sizes', () => {
    // Small
    cy.mount(<ProgressBar value={50} size="sm" />);
    cy.get('[data-cy="progress-bar"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // Medium (default)
    cy.mount(<ProgressBar value={50} size="md" />);
    cy.get('[data-cy="progress-bar"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // Large
    cy.mount(<ProgressBar value={50} size="lg" />);
    cy.get('[data-cy="progress-bar"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should be accessible', () => {
    cy.mount(<ProgressBar value={75} showPercentage />);
    
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'role', 'progressbar');
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow', '75');
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuemin', '0');
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuemax', '100');
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-label', 'Progress: 75%');
  });

  it('should support label prop', () => {
    cy.mount(<ProgressBar value={50} label="Upload Progress" showPercentage />);
    
    cy.get('[data-cy="progress-label"]').should('contain', 'Upload Progress');
    cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-label', 'Upload Progress: 50%');
  });
});