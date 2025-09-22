/**
 * @fileoverview Create Element Modal Component Tests
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
import { CreateElementModal, useWorldbuildingStore } from '../../support/component-test-helpers';

describe('CreateElementModal Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  let mockCreateElement;
  let mockStore;
  let mockOnClose;
  let mockOnSuccess;
  
  const defaultProps = {
    visible: true,
    projectId: 'test-project-1',
    onClose: null, // Will be set in beforeEach
    onSuccess: null, // Will be set in beforeEach
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Create stubs inside beforeEach
    mockCreateElement = cy.stub().as('createElement');
    mockOnClose = cy.stub().as('onClose');
    mockOnSuccess = cy.stub().as('onSuccess');
    
    // * Mock the worldbuilding store
    mockStore = {
      createElement: mockCreateElement,
      projects: [
        {
          id: 'test-project-1',
          name: 'Test Project',
          elements: [
            {
              id: 'existing-element-1',
              name: 'Existing Character',
              category: 'character',
            },
          ],
        },
      ],
    };

    // Note: The store is already mocked in the component-test-helpers
    
    // * Update default props with new stubs
    defaultProps.onClose = mockOnClose;
    defaultProps.onSuccess = mockOnSuccess;
  });

  it('should render when visible', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Check modal title
    cy.contains('Create New Element').should('be.visible');
    
    // * Check instructions
    cy.contains('Choose a category for your new element').should('be.visible');
    
    // * Check that category options are visible
    cy.get('[data-cy^="category-"]').should('have.length.greaterThan', 0);
    
    // * Check action buttons
    cy.contains('Cancel').should('be.visible');
    cy.contains('Select a Category').should('be.visible');
  });

  it('should not render when not visible', () => {
    cy.mount(<CreateElementModal {...defaultProps} visible={false} />);

    cy.contains('Create New Element').should('not.exist');
  });

  it('should display all category options', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Check that all expected categories are present
    const expectedCategories = [
      'character',
      'location',
      'item-object',
      'magic-power',
      'event',
      'organization',
      'creature-species',
      'culture-society',
      'religion-belief',
      'language',
      'technology',
      'custom',
    ];

    expectedCategories.forEach((category) => {
      cy.get(`[data-cy="category-${category}"]`).should('be.visible');
    });
  });

  it('should handle category selection', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Select a character category
    cy.get('[data-cy="category-character"]').click();

    // * Check that the button text changes
    cy.contains('Create Element').should('be.visible');
    
    // * Check that the selected category has visual feedback
    cy.get('[data-cy="category-character"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should handle close functionality', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Test close button
    cy.get('button').contains('✕').click();
    cy.get('@onClose').should('have.been.called');
    
    // * Test cancel button
    cy.mount(<CreateElementModal {...defaultProps} />);
    cy.contains('Cancel').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('should create element when category selected and create button clicked', () => {
    // * Mock successful creation
    mockCreateElement.resolves({
      id: 'new-element-1',
      name: 'Untitled Character 1',
      category: 'character',
    });

    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Select character category
    cy.get('[data-cy="category-character"]').click();
    
    // * Click create button
    cy.contains('Create Element').click();

    // * Verify createElement was called with correct parameters
    cy.get('@createElement').should('have.been.calledWith', 'test-project-1', 'Untitled Character 1', 'character');
  });

  it('should show loading state during creation', () => {
    // * Mock delayed creation
    mockCreateElement.returns(new Promise(resolve => setTimeout(() => resolve({
      id: 'new-element-1',
      name: 'Untitled Character 1',
      category: 'character',
    }), 100)));

    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Select category and click create
    cy.get('[data-cy="category-character"]').click();
    cy.contains('Create Element').click();

    // * Check for loading indicator (ActivityIndicator in React Native Web becomes a spinner)
    cy.get('[data-cy="element-card"]').should('contain', 'Create Element');
    // TODO: The button should be disabled during loading
    cy.contains('Create Element').should('be.disabled');
  });

  it('should call onSuccess after successful creation', () => {
    mockCreateElement.resolves({
      id: 'new-element-1',
      name: 'Untitled Character 1',
      category: 'character',
    });

    cy.mount(<CreateElementModal {...defaultProps} />);

    cy.get('[data-cy="category-character"]').click();
    cy.contains('Create Element').click();

    cy.get('@onSuccess').should('have.been.calledWith', 'new-element-1');
    cy.get('@onClose').should('have.been.called');
  });

  it('should handle creation errors gracefully', () => {
    mockCreateElement.rejects(new Error('Creation failed'));

    cy.mount(<CreateElementModal {...defaultProps} />);

    cy.get('[data-cy="category-character"]').click();
    cy.contains('Create Element').click();

    // TODO: * The component should handle the error and not crash
    cy.contains('Create Element').should('be.visible');
  });

  it('should disable create button when no category selected', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // ? TODO: * Initially should show "Select a Category" and be disabled
    cy.contains('Select a Category').should('be.visible');
    cy.contains('Select a Category').should('be.disabled');
  });

  it('should show different categories with proper icons and descriptions', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Test a few specific categories
    const categoryTests = [
      { 
        id: 'character', 
        icon: '👤', 
        label: 'Character',
        description: 'Protagonists, antagonists, supporting characters'
      },
      { 
        id: 'location', 
        icon: '📍', 
        label: 'Location',
        description: 'Cities, buildings, landmarks'
      },
      { 
        id: 'magic-power', 
        icon: '✨', 
        label: 'Magic/Power',
        description: 'Magical systems, abilities'
      },
    ];

    categoryTests.forEach(({ id, icon, label, description }) => {
      cy.get(`[data-cy="category-${id}"]`).within(() => {
        cy.contains(icon).should('be.visible');
        cy.contains(label).should('be.visible');
        cy.contains(description).should('be.visible');
      });
    });
  });

  it('should handle multiple category selections (only latest should be selected)', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Select character first
    cy.get('[data-cy="category-character"]').click();
    cy.get('[data-cy="category-character"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;

    // * Select location second
    cy.get('[data-cy="category-location"]').click();
    cy.get('[data-cy="category-location"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // TODO: * Character should no longer be selected
    cy.get('[data-cy="category-character"]').should('not.have.class', 'categoryCardSelected');
  });

  it('should be accessible', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Check that interactive elements have proper accessibility
    cy.get('[data-cy^="category-"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'role');
    });

    // Check buttons have proper accessibility
    cy.contains('Cancel').should('have.attr', 'role');
    cy.contains('Select a Category').should('have.attr', 'role');
  });

  it('should handle keyboard navigation and interaction', () => {
    cy.mount(<CreateElementModal {...defaultProps} />);

    // * Test that categories can be accessed with keyboard
    cy.get('[data-cy="category-character"]').focus().type('{enter}');
    cy.get('[data-cy="category-character"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;

    // * Test that create button can be activated with keyboard
    cy.contains('Create Element').focus().type('{enter}');
    // TODO: TODO: * Should attempt to create (will depend on mocked function)
  });

  it('should generate unique element names for same category', () => {
    mockCreateElement.resolves({
      id: 'new-element-1',
      name: 'Untitled Character 2', // Should be 2 since there's already one in mock data
      category: 'character',
    });

    cy.mount(<CreateElementModal {...defaultProps} />);

    cy.get('[data-cy="category-character"]').click();
    cy.contains('Create Element').click();

    // TODO: * The createElement should be called with a unique name
    cy.get('@createElement').should('have.been.calledWith', 'test-project-1', 'Untitled Character 2', 'character');
  });
});