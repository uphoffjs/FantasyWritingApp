import React from 'react';
import { Button } from '../../src/components/Button';

describe('Button Component', () => {
  it('should render a button with React Native components', () => {
    cy.mount(
      <Button 
        title="Click me"
        onPress={cy.stub().as('onPress')}
        testID="test-button"
      />
    );
    
    // * React Native Web converts testID to data-testid for web testing
    cy.get('[data-testid="test-button"]').should('be.visible');
    cy.get('[data-testid="test-button"]').should('contain', 'Click me');
    cy.get('[data-testid="test-button"]').click();
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
    
    cy.get('[data-testid="secondary-button"]').should('be.visible');
    cy.get('[data-testid="secondary-button"]').should('contain', 'Secondary Button');
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
    
    cy.get('[data-testid="loading-button"]').should('be.visible');
    // ? TODO: ? TODO: Find better way to test ActivityIndicator content in React Native Web
    cy.get('[data-testid="loading-button"]').should('exist');
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
    
    cy.get('[data-testid="disabled-button"]').should('be.visible');
    cy.get('[data-testid="disabled-button"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });
});