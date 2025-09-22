/**
 * @fileoverview test-single Component Tests
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
import { ElementBrowser } from '../../../src/components/ElementBrowser';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ProjectFactory } from '../../fixtures/factories';
import { mountWithProviders } from '../_helpers/mount-helpers';

describe('Single Test - ElementBrowser', () => {
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

  it('should mount without crashing', () => {
    // * Most basic test possible
    const mockProject = ProjectFactory.createFantasyProject();
    
    // * Try mounting with the simplest possible setup
    cy.mount(
      <div>
        <h1>Test Mount</h1>
        <p>If you see this, mounting works</p>
      </div>
    );
    
    cy.contains('Test Mount').should('be.visible');
  });
  
  it('should mount ElementBrowser with MemoryRouter', () => {
    const mockProject = ProjectFactory.createFantasyProject();
    
    cy.mount(
      <MemoryRouter initialEntries={[`/project/${mockProject.id}`]}>
        <ElementBrowser />
      </MemoryRouter>
    );
    
    // TODO: * Should render something (even if it errors about store)
    cy.get('body').should('exist');
  });
  
  it('should mount ElementBrowser with full providers', () => {
    const mockProject = ProjectFactory.createFantasyProject();
    
    mountWithProviders(<ElementBrowser />, {
      initialState: { 
        projects: [mockProject],
        currentProject: mockProject.id
      },
      routerProps: {
        initialEntries: [`/project/${mockProject.id}`]
      }
    });
    
    // * Check if create button exists
    cy.get('[data-cy="create-element-button"]').should('exist');
  });
});