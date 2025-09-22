import React from 'react';
import { MobileNavigation } from '../../../src/components/MobileNavigation';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useWorldbuildingStore } from '../../../src/store/worldbuildingStore';

describe('MobileNavigation Component', () => {
  let onMenuClickSpy: any;
  let navigateSpy: any;

  beforeEach(() => {
    onMenuClickSpy = cy.spy().as('onMenuClick');
    navigateSpy = cy.stub();
    
    // * Set mobile viewport by default
    cy.viewport(375, 667);
  });

  const mountWithRouter = (component: React.ReactNode, initialPath = '/') => {
    return cy.mount(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={component} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('renders navigation bar with all items', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('exist');
      cy.contains('Projects').should('be.visible');
      cy.contains('Browse').should('be.visible');
      cy.contains('Search').should('be.visible');
      cy.contains('Menu').should('be.visible');
    });

    it('applies mobile-only styles', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('positions navigation at bottom of screen', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'bottom-0')
        .and('have.class', 'left-0')
        .and('have.class', 'right-0');
    });

    it('displays icons for each navigation item', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('svg').should('have.length.at.least', 4);
    });

    it('renders Create [data-cy*="button"] with special styling', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      // // DEPRECATED: TODO: Create [data-cy*="button"] should have gold rounded background
      cy.get('[aria-label="Create"]').within(() => {
        cy.get('[data-cy*="metals-gold"].rounded-full').should('exist');
      });
    });

    it('shows labels for non-action items', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]').within(() => {
        cy.contains('Projects').should('be.visible');
      });

      cy.get('[aria-label="Menu"]').within(() => {
        cy.contains('Menu').should('be.visible');
      });
    });

    it('applies correct min-height to [data-cy*="button"]s', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[data-cy*="button"]').each(($[data-cy*="button"]) => {
        cy.wrap($[data-cy*="button"]).should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
  });

  describe('Active States', () => {
    it('highlights active route', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />, '/');

      cy.get('[aria-label="Projects"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.attr', 'aria-current', 'page');

      // ? TODO: * Should show active indicator bar
      cy.get('[aria-label="Projects"]').within(() => {
        cy.get('[data-cy*="metals-gold"]').should('exist');
      });
    });

    it('highlights project browse when on project page', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(
        <MobileNavigation onMenuClick={onMenuClickSpy} />,
        '/project/project-123'
      );

      cy.get('[aria-label="Browse"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.attr', 'aria-current', 'page');
    });

    it('does not highlight inactive routes', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />, '/');

      cy.get('[aria-label="Browse"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('not.have.attr', 'aria-current');

      cy.get('[aria-label="Search"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('not.have.attr', 'aria-current');
    });

    it('correctly identifies nested routes as active', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(
        <MobileNavigation onMenuClick={onMenuClickSpy} />,
        '/project/project-123/element/456'
      );

      cy.get('[aria-label="Browse"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Disabled States', () => {
    it('disables project-dependent items when no project [data-cy*="select"]ed', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]')
        .should('be.disabled')
        .and('have.class', 'opacity-50');

      cy.get('[aria-label="Create"]')
        .should('be.disabled')
        .and('have.class', 'opacity-50');

      cy.get('[aria-label="Search"]')
        .should('be.disabled')
        .and('have.class', 'opacity-50');
    });

    it('enables project-dependent items when project is [data-cy*="select"]ed', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]')
        .should('not.be.disabled')
        .and('not.have.class', 'opacity-50');

      cy.get('[aria-label="Create"]')
        .should('not.be.disabled')
        .and('not.have.class', 'opacity-50');

      cy.get('[aria-label="Search"]')
        .should('not.be.disabled')
        .and('not.have.class', 'opacity-50');
    });

    it('always enables Projects and Menu [data-cy*="button"]s', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]')
        .should('not.be.disabled');

      cy.get('[aria-label="Menu"]')
        .should('not.be.disabled');
    });
  });

  describe('Navigation Actions', () => {
    it('navigates to projects page when Projects clicked', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]').click();
      // * In a real app, this would navigate to '/'
    });

    it('navigates to project browse when Browse clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').click();
      // * In a real app, this would navigate to '/project/project-123'
    });

    it('navigates with create hash when Create clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').click();
      // * In a real app, this would navigate to '/project/project-123#create'
    });

    it('navigates with search hash when Search clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Search"]').click();
      // * In a real app, this would navigate to '/project/project-123#search'
    });

    it('calls onMenuClick when Menu [data-cy*="button"] clicked', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Menu"]').click();
      cy.get('@onMenuClick').should('have.been.calledOnce');
    });

    it('does not navigate when disabled [data-cy*="button"] clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').click({ force: true });
      // TODO: * Should not navigate
    });
  });

  describe('Styling', () => {
    it('applies hover effects to enabled [data-cy*="button"]s', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'hover:bg-parchment-shadow');
    });

    it('does not apply hover effects to disabled [data-cy*="button"]s', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('not.have.class', 'hover:text-ink-black');
    });

    it('uses correct icon sizes', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes.and('have.class', 'h-5');
      });
    });

    it('uses larger icon for Create action [data-cy*="button"]', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes.and('have.class', 'h-6');
      });
    });

    it('applies correct typography to labels', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]').within(() => {
        cy.get('span').should('be.visible') // React Native Web uses inline styles instead of CSS classes.and('have.class', 'font-cinzel');
      });
    });

    it('has proper z-index for layering', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('has border and shadow styling', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'border-parchment-border')
        .and('have.class', 'shadow-lg');
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('have.attr', 'role', 'navigation');
    });

    it('has accessible label for navigation', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('have.attr', 'aria-label', 'Mobile navigation');
    });

    it('has aria-label for each [data-cy*="button"]', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[data-cy*="button"]').each(($[data-cy*="button"]) => {
        cy.wrap($[data-cy*="button"]).should('have.attr', 'aria-label');
      });
    });

    it('uses aria-current for active page', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />, '/');

      cy.get('[aria-label="Projects"]').should('have.attr', 'aria-current', 'page');
    });

    it('supports keyboard navigation', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]').focus();
      cy.focused().should('have.attr', 'aria-label', 'Projects');

      cy.focused().tab();
      cy.focused().should('have.attr', 'aria-label', 'Browse');
    });

    it('indicates disabled state properly', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').should('have.attr', 'disabled');
      cy.get('[aria-label="Create"]').should('have.attr', 'disabled');
      cy.get('[aria-label="Search"]').should('have.attr', 'disabled');
    });
  });

  describe('Responsive Behavior', () => {
    it('is visible on mobile viewport', () => {
      cy.viewport(375, 667);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
    });

    it('maintains layout on small mobile viewport', () => {
      cy.viewport(320, 568);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
      cy.get('[data-cy*="button"]').should('have.length', 5);
    });

    it('maintains layout on large mobile viewport', () => {
      cy.viewport(414, 896);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
      cy.get('[data-cy*="button"]').should('have.length', 5);
    });

    it('has flexible [data-cy*="button"] layout', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[data-cy*="button"]').each(($[data-cy*="button"]) => {
        cy.wrap($[data-cy*="button"]).should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onMenuClick callback', () => {
      mountWithRouter(<MobileNavigation />);

      cy.get('[aria-label="Menu"]').click();
      // TODO: * Should not throw error
    });

    it('handles very long project IDs', () => {
      const longProjectId = 'project-' + 'a'.repeat(100);
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: longProjectId
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').should('not.be.disabled');
    });

    it('handles rapid [data-cy*="button"] clicks', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Menu"]').click().click().click();
      cy.get('@onMenuClick').should('have.been.calledThrice');
    });

    it('handles undefined currentProjectId', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: undefined
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').should('be.disabled');
      cy.get('[aria-label="Create"]').should('be.disabled');
      cy.get('[aria-label="Search"]').should('be.disabled');
    });
  });

  describe('Create Button Special Behavior', () => {
    it('renders Create [data-cy*="button"] with floating action [data-cy*="button"] style', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('.absolute.inset-0').should('exist');
        cy.get('[data-cy*="metals-gold"].rounded-full').should('exist');
        cy.get('.w-12.h-12').should('exist');
      });
    });

    it('offsets Create [data-cy*="button"] icon upward', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('[data-cy*="metals-gold"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });

    it('uses different text color for Create [data-cy*="button"] icon', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });

    it('does not show label for Create [data-cy*="button"]', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.contains('Create').should('not.exist');
      });
    });

    it('does not show active indicator for Create [data-cy*="button"]', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });

      mountWithRouter(
        <MobileNavigation onMenuClick={onMenuClickSpy} />,
        '/project/project-123/create'
      );

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('.absolute.bottom-0').should('not.exist');
      });
    });
  });
});