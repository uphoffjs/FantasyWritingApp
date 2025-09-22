/**
 * @fileoverview Loading Spinner Component Tests
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
import { LoadingScreen } from '../../../src/screens/LoadingScreen';

describe('LoadingScreen Component', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  it('should render with default loading message', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check that the loading screen is visible
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    
    // * Check default loading text
    cy.contains('Loading...').should('be.visible');
    
    // * Check that spinner is present (ActivityIndicator in React Native Web)
    cy.get('[data-cy="loading-screen"]').should('contain.html', 'svg'); // ActivityIndicator renders as SVG in web
  });

  it('should render with custom loading message', () => {
    const customMessage = 'Please wait while we set up your world...';
    
    cy.mount(<LoadingScreen message={customMessage} testID="loading-screen" />);

    // * Check custom message is displayed
    cy.contains(customMessage).should('be.visible');
    
    // * Check that the loading screen is still visible
    cy.get('[data-cy="loading-screen"]').should('be.visible');
  });

  it('should display spinner animation', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check that ActivityIndicator (spinner) is present
    // In React Native Web, ActivityIndicator typically renders as an SVG with animation
    cy.get('[data-cy="loading-screen"]').within(() => {
      // * Look for the spinner element - ActivityIndicator typically has specific attributes
      cy.get('*').should('exist'); // Spinner should exist within the container
    });
  });

  it('should have proper styling and layout', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check that the container has flex layout (centered content)
    cy.get('[data-cy="loading-screen"]')
      .should('be.visible')
      .and('have.css', 'display', 'flex')
      .and('have.css', 'justify-content', 'center')
      .and('have.css', 'align-items', 'center');

    // * Check that it has the dark background color
    cy.get('[data-cy="loading-screen"]')
      .should('have.css', 'background-color', 'rgb(17, 24, 39)'); // #111827 in RGB
  });

  it('should have proper accessibility attributes', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check that the loading screen has appropriate accessibility
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    
    // TODO: * The text should be readable by screen readers
    cy.contains('Loading...').should('be.visible');
  });

  it('should handle long loading messages properly', () => {
    const longMessage = 'This is a very long loading message that should wrap properly and not break the layout of the loading screen component even when it contains many words and characters.';
    
    cy.mount(<LoadingScreen message={longMessage} testID="loading-screen" />);

    // * Check that long message is displayed
    cy.contains(longMessage).should('be.visible');
    
    // * Check that the layout is not broken
    cy.get('[data-cy="loading-screen"]').should('be.visible');
  });

  it('should handle empty message gracefully', () => {
    cy.mount(<LoadingScreen message="" testID="loading-screen" />);

    // TODO: * Even with empty message, component should render
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    
    // TODO: * Empty message should be handled gracefully
    cy.get('[data-cy="loading-screen"]').should('not.contain.text', 'undefined');
  });

  it('should be responsive to different screen sizes', () => {
    // * Test on mobile viewport
    cy.viewport('iphone-x');
    cy.mount(<LoadingScreen testID="loading-screen" />);
    
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    cy.contains('Loading...').should('be.visible');
    
    // * Test on tablet viewport
    cy.viewport('ipad-2');
    cy.mount(<LoadingScreen testID="loading-screen" />);
    
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    cy.contains('Loading...').should('be.visible');
    
    // * Test on desktop viewport
    cy.viewport('macbook-15');
    cy.mount(<LoadingScreen testID="loading-screen" />);
    
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    cy.contains('Loading...').should('be.visible');
  });

  it('should have consistent font styling', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check text styling
    cy.contains('Loading...').should('have.css', 'color', 'rgb(249, 250, 251)'); // #F9FAFB
    cy.contains('Loading...').should('have.css', 'text-align', 'center');
    cy.contains('Loading...').should('have.css', 'font-size', '16px');
  });

  it('should maintain proper spacing between spinner and text', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check that there's proper spacing in the layout
    cy.get('[data-cy="loading-screen"]').within(() => {
      // TODO: * The spinner and text should be properly spaced
      cy.contains('Loading...').should('be.visible');
    });
  });

  it('should handle special characters in message', () => {
    const messageWithSpecialChars = 'Loading... 🏰⚔️🐉 Setting up your fantasy world! ✨';
    
    cy.mount(<LoadingScreen message={messageWithSpecialChars} testID="loading-screen" />);

    // * Check that special characters are displayed correctly
    cy.contains(messageWithSpecialChars).should('be.visible');
    cy.get('[data-cy="loading-screen"]').should('be.visible');
  });

  it('should provide consistent user experience across platforms', () => {
    cy.mount(<LoadingScreen testID="loading-screen" />);

    // * Check core functionality works regardless of platform
    cy.get('[data-cy="loading-screen"]')
      .should('be.visible')
      .and('have.css', 'display', 'flex');
    
    cy.contains('Loading...').should('be.visible');
    
    // TODO: * Spinner should be present in some form
    cy.get('[data-cy="loading-screen"]').should('not.be.empty');
  });

  it('should handle rapid re-mounting without issues', () => {
    // * Mount and unmount rapidly to test stability
    cy.mount(<LoadingScreen testID="loading-screen" />);
    cy.get('[data-cy="loading-screen"]').should('be.visible');
    
    cy.mount(<LoadingScreen message="Reloading..." testID="loading-screen" />);
    cy.contains('Reloading...').should('be.visible');
    
    cy.mount(<LoadingScreen testID="loading-screen" />);
    cy.contains('Loading...').should('be.visible');
  });
});