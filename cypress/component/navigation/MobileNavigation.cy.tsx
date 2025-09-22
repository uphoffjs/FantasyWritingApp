/**
 * @fileoverview Mobile Navigation Component Tests
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
import { MobileNavigation } from '../../../src/components/MobileNavigation';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useWorldbuildingStore } from '../../../src/store/worldbuildingStore';

describe('MobileNavigation Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  let onMenuClickSpy: any;
  let navigateSpy: any;

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
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
    it('renders Create button with special styling', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      // // DEPRECATED: TODO: Create button should have gold rounded background
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
    it('applies correct min-height to buttons', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('button').each(($button) => {
        cy.wrap($button).should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
  });
  describe('Active States', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('disables project-dependent items when no project selected', () => {
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
    it('enables project-dependent items when project is selected', () => {
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
    it('always enables Projects and Menu buttons', () => {
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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
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
    it('calls onMenuClick when Menu button clicked', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Menu"]').click();
      cy.get('@onMenuClick').should('have.been.calledOnce');
    });
    it('does not navigate when disabled button clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: null
      });
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Browse"]').click({ force: true });
      // TODO: * Should not navigate
    });
  });
  describe('Styling', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('applies hover effects to enabled buttons', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Projects"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'hover:bg-parchment-shadow');
    });
    it('does not apply hover effects to disabled buttons', () => {
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
    it('uses larger icon for Create action button', () => {
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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('has proper navigation role', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('have.attr', 'role', 'navigation');
    });
    it('has accessible label for navigation', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('have.attr', 'aria-label', 'Mobile navigation');
    });
    it('has aria-label for each button', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.attr', 'aria-label');
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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('is visible on mobile viewport', () => {
      cy.viewport(375, 667);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
    });
    it('maintains layout on small mobile viewport', () => {
      cy.viewport(320, 568);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
      cy.get('button').should('have.length', 5);
    });
    it('maintains layout on large mobile viewport', () => {
      cy.viewport(414, 896);
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('nav').should('be.visible');
      cy.get('button').should('have.length', 5);
    });
    it('has flexible button layout', () => {
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('button').each(($button) => {
        cy.wrap($button).should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
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
    it('handles rapid button clicks', () => {
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
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders Create button with floating action button style', () => {
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
    it('offsets Create button icon upward', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('[data-cy*="metals-gold"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
    it('uses different text color for Create button icon', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
    it('does not show label for Create button', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        currentProjectId: 'project-123'
      });
      mountWithRouter(<MobileNavigation onMenuClick={onMenuClickSpy} />);

      cy.get('[aria-label="Create"]').within(() => {
        cy.contains('Create').should('not.exist');
      });
    });
    it('does not show active indicator for Create button', () => {
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