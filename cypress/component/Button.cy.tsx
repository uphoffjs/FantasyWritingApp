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
    
    // React Native Web converts testID to data-cy automatically
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
    // React Native ActivityIndicator doesn't have easily testable content
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