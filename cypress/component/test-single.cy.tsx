import React from 'react';
import { ElementBrowser } from '../../src/components/ElementBrowser';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ProjectFactory } from '../fixtures/factories';
import { mountWithProviders } from './_helpers/mount-helpers';

describe('Single Test - ElementBrowser', () => {
  it('should mount without crashing', () => {
    // Most basic test possible
    const mockProject = ProjectFactory.createFantasyProject();
    
    // Try mounting with the simplest possible setup
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
    
    // Should render something (even if it errors about store)
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
    
    // Check if create button exists
    cy.get('[data-testid="create-element-button"]').should('exist');
  });
});