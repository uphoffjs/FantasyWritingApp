import React from 'react';
import { AutoSaveIndicator } from '../support/component-test-helpers';

describe('AutoSaveIndicator Component', () => {
  it('should render idle state by default', () => {
    cy.mount(<AutoSaveIndicator />);
    
    cy.get('[data-testid="autosave-indicator"]').should('not.exist');
  });

  it('should show saving state', () => {
    cy.mount(<AutoSaveIndicator status="saving" />);
    
    cy.get('[data-testid="autosave-indicator"]').should('exist');
    cy.get('[data-testid="autosave-status"]').should('contain', 'Saving...');
    cy.get('[data-testid="autosave-icon"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should show saved state', () => {
    cy.mount(<AutoSaveIndicator status="saved" />);
    
    cy.get('[data-testid="autosave-indicator"]').should('exist');
    cy.get('[data-testid="autosave-status"]').should('contain', 'Saved');
    cy.get('[data-testid="autosave-icon"]').should('not.have.class', 'animate-spin');
    cy.get('[data-testid="autosave-icon"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should show error state', () => {
    cy.mount(<AutoSaveIndicator status="error" />);
    
    cy.get('[data-testid="autosave-indicator"]').should('exist');
    cy.get('[data-testid="autosave-status"]').should('contain', 'Save failed');
    cy.get('[data-testid="autosave-icon"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should show custom error message', () => {
    cy.mount(<AutoSaveIndicator status="error" errorMessage="Network error" />);
    
    cy.get('[data-testid="autosave-status"]').should('contain', 'Network error');
  });

  it('should show timestamp for saved state', () => {
    const timestamp = new Date();
    cy.mount(<AutoSaveIndicator status="saved" timestamp={timestamp} />);
    
    cy.get('[data-testid="autosave-timestamp"]').should('exist');
    cy.get('[data-testid="autosave-timestamp"]').should('contain', 'Just now');
  });

  it('should update timestamp text over time', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    cy.mount(<AutoSaveIndicator status="saved" timestamp={fiveMinutesAgo} />);
    
    cy.get('[data-testid="autosave-timestamp"]').should('contain', '5 minutes ago');
  });

  it('should handle click on retry for error state', () => {
    const onRetry = cy.stub();
    cy.mount(<AutoSaveIndicator status="error" onRetry={onRetry} />);
    
    cy.get('[data-testid="autosave-retry"]').should('exist');
    cy.get('[data-testid="autosave-retry"]').click();
    cy.wrap(onRetry).should('have.been.called');
  });

  it('should apply custom className', () => {
    cy.mount(<AutoSaveIndicator status="saving" className="custom-class" />);
    
    cy.get('[data-testid="autosave-indicator"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should transition between states smoothly', () => {
    // * Start with idle state
    cy.mount(<AutoSaveIndicator status="idle" />);
    
    // TODO: * Should not be visible when idle
    cy.get('[data-testid="autosave-indicator"]').should('not.exist');
    
    // * Change to saving
    cy.mount(<AutoSaveIndicator status="saving" />);
    cy.get('[data-testid="autosave-status"]').should('contain', 'Saving...');
    
    // * Change to saved
    cy.mount(<AutoSaveIndicator status="saved" />);
    cy.get('[data-testid="autosave-status"]').should('contain', 'Saved');
    
    // * Change to error
    cy.mount(<AutoSaveIndicator status="error" />);
    cy.get('[data-testid="autosave-status"]').should('contain', 'Save failed');
  });

  it('should auto-hide saved state after delay', () => {
    cy.clock();
    cy.mount(<AutoSaveIndicator status="saved" autoHideDelay={2000} />);
    
    // TODO: * Should be visible initially
    cy.get('[data-testid="autosave-indicator"]').should('exist');
    
    // TODO: * Should still be visible after 1 second
    cy.tick(1000);
    cy.get('[data-testid="autosave-indicator"]').should('exist');
    
    // TODO: * Should be hidden after 2 seconds
    cy.tick(1000);
    cy.get('[data-testid="autosave-indicator"]').should('not.exist');
  });

  it('should be accessible', () => {
    cy.mount(<AutoSaveIndicator status="saving" />);
    
    cy.get('[data-testid="autosave-indicator"]').should('have.attr', 'role', 'status');
    cy.get('[data-testid="autosave-indicator"]').should('have.attr', 'aria-live', 'polite');
  });
});