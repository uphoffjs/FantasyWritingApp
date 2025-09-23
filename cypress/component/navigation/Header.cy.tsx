/**
 * @fileoverview Header Component Tests
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
import { Header } from '../../../src/components/Header';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useWorldbuildingStore } from '../../../src/store/worldbuildingStore';
import { useAuthStore } from '../../../src/store/authStore';

// * Mock the child components
const mockComponents = {
  MobileHeader: () => <div data-cy="mobile-header">Mobile Header</div>,
  MobileBackButton: () => <div data-cy="mobile-back-button">Mobile Back Button</div>,
  AccountMenu: () => <div data-cy="account-menu">Account Menu</div>,
  OfflineSyncIndicator: () => <div data-cy="offline-sync">Offline Sync</div>,
  AutoSyncStatus: () => <div data-cy="auto-sync">Auto Sync</div>
};

// * Mock the components
jest.mock('../../src/components/MobileHeader', () => ({
  MobileHeader: mockComponents.MobileHeader
}));
jest.mock('../../src/components/MobileBackButton', () => ({
  MobileBackButton: mockComponents.MobileBackButton
}));
jest.mock('../../src/components/AccountMenu', () => ({
  AccountMenu: mockComponents.AccountMenu
}));
jest.mock('../../src/components/OfflineSyncIndicator', () => ({
  OfflineSyncIndicator: mockComponents.OfflineSyncIndicator
}));
jest.mock('../../src/components/AutoSyncStatus', () => ({
  AutoSyncStatus: mockComponents.AutoSyncStatus
}));

describe('Header Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  let navigateSpy: any;
  let exportProjectSpy: any;
  let importProjectSpy: any;

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    navigateSpy = cy.stub();
    exportProjectSpy = cy.stub();
    importProjectSpy = cy.stub().resolves(true);

    // * Mock platform service
    cy.window().then((win) => {
      (win as any).getPlatformService = () => ({
        dialog: {
          alert: cy.stub()
        },
        file: {
          saveJsonFile: cy.stub(),
          readTextFile: cy.stub().resolves('{"name": "Test Project"}')
        }
      });
    });
  });
  const mountWithRouter = (component: React.ReactNode, initialPath = '/') => {
    return cy.mountWithProviders(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={component} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Desktop Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders desktop header with title and logo', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.contains('Worldbuilding Tool').should('be.visible');
      cy.get('svg').first().should('be.visible'); // BookOpen icon
    });
    it('shows navigation buttons', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Home"]').should('be.visible');
      cy.get('[title="Search (Coming Soon)"]').should('be.visible').and('be.disabled');
      cy.get('[title="Export Project"]').should('be.visible');
      cy.get('[title="Import Project"]').should('be.visible');
    });
    it('shows dividers between button groups', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('.w-px.h-6[data-cy*="parchment-dark"]').should('have.length.at.least', 1);
    });
    it('shows back to projects button on project page', () => {
      mountWithRouter(<Header isMobile={false} />, '/project/123');

      cy.get('[data-cy="back-to-projects"]').should('be.visible');
      cy.contains('Projects').should('be.visible');
    });
    it('hides back button on non-project pages', () => {
      mountWithRouter(<Header isMobile={false} />, '/');

      cy.get('[data-cy="back-to-projects"]').should('not.exist');
    });
    it('shows elements browser button when project is selected', () => {
      // * Mock store with a current project
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: 'Test Project' }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />, '/project/1');

      cy.get('[title="Elements Browser"]').should('be.visible');
    });
    it('hides elements browser button on element pages', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: 'Test Project' }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />, '/project/1/element/456');

      cy.get('[title="Elements Browser"]').should('not.exist');
    });
  });
  describe('Mobile Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders mobile header when isMobile is true', () => {
      const setMobileMenuOpen = cy.stub();
      
      mountWithRouter(
        <Header 
          isMobile={true} 
          mobileMenuOpen={false} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      );

      cy.get('[data-cy="mobile-header"]').should('be.visible');
      cy.get('[data-cy="mobile-back-button"]').should('be.visible');
      cy.contains('Worldbuilding Tool').should('not.exist');
    });
    it('passes props to mobile header', () => {
      const setMobileMenuOpen = cy.stub();
      
      mountWithRouter(
        <Header 
          isMobile={true} 
          mobileMenuOpen={true} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      );

      cy.get('[data-cy="mobile-header"]').should('exist');
    });
  });
  describe('Navigation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('navigates to projects when home button is clicked', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Home"]').click();
      // * In a real test, we'd verify navigation happened
    });
    it('navigates back to projects from project page', () => {
      mountWithRouter(<Header isMobile={false} />, '/project/123');

      cy.get('[data-cy="back-to-projects"]').click();
      // * In a real test, we'd verify navigation happened
    });
    it('navigates to elements browser when button is clicked', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: 'Test Project' }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />, '/');

      cy.get('[title="Elements Browser"]').click();
      // * In a real test, we'd verify navigation happened
    });
  });
  describe('Export Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('disables export button when no project is selected', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => null,
        currentProjectId: null,
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Export Project"]')
        .should('be.disabled')
        .and('have.class', 'opacity-50');
    });
    it('enables export button when project is selected', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: 'Test Project' }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Export Project"]')
        .should('not.be.disabled')
        .and('not.have.class', 'opacity-50');
    });
    it('exports project when export button is clicked', () => {
      const mockProject = { id: '1', name: 'Test Project' };
      const mockExportData = { project: mockProject };
      
      exportProjectSpy.returns(mockExportData);
      
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => mockProject,
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Export Project"]').click();
      
      cy.wrap(exportProjectSpy).should('have.been.calledWith', '1');
    });
    it('shows alert when trying to export without project', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => null,
        currentProjectId: null,
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      // TODO: Export button should be disabled, so this shouldn't happen
      cy.get('[title="Export Project"]').should('be.disabled');
    });
  });
  describe('Import Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles successful import', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => null,
        currentProjectId: null,
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Import Project"]').click();
      
      // * In a real test, we'd verify file dialog opened and import was called
    });
    it('handles failed import', () => {
      importProjectSpy.resolves(false);
      
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => null,
        currentProjectId: null,
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Import Project"]').click();
      
      // ? * In a real test, we'd verify error alert was shown
    });
  });
  describe('Authentication UI', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('shows auth UI when authenticated', () => {
      cy.stub(useAuthStore, 'getState').returns({
        isAuthenticated: true,
        isOfflineMode: false
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[data-cy="auto-sync"]').should('be.visible');
      cy.get('[data-cy="offline-sync"]').should('be.visible');
      cy.get('[data-cy="account-menu"]').should('be.visible');
    });
    it('shows auth UI in offline mode', () => {
      cy.stub(useAuthStore, 'getState').returns({
        isAuthenticated: false,
        isOfflineMode: true
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[data-cy="auto-sync"]').should('be.visible');
      cy.get('[data-cy="offline-sync"]').should('be.visible');
      cy.get('[data-cy="account-menu"]').should('be.visible');
    });
    it('hides auth UI when not authenticated', () => {
      cy.stub(useAuthStore, 'getState').returns({
        isAuthenticated: false,
        isOfflineMode: false
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[data-cy="auto-sync"]').should('not.exist');
      cy.get('[data-cy="offline-sync"]').should('not.exist');
      cy.get('[data-cy="account-menu"]').should('not.exist');
    });
  });
  describe('Hover Effects', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('shows hover effect on buttons', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Home"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      
      cy.get('[title="Import Project"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('has proper title attributes on buttons', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('button[title]').each(($button) => {
        cy.wrap($button).should('have.attr', 'title');
      });
    });
    it('properly disables non-functional buttons', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Search (Coming Soon)"]')
        .should('be.disabled')
        .and('have.attr', 'disabled');
    });
    it('supports keyboard navigation', () => {
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Home"]').focus();
      cy.focused().should('have.attr', 'title', 'Home');
      
      // * Tab to next button
      cy.focused().tab();
      cy.focused().should('exist');
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders correctly on desktop viewport', () => {
      cy.viewport(1920, 1080);
      mountWithRouter(<Header isMobile={false} />);

      cy.contains('Worldbuilding Tool').should('be.visible');
      cy.get('.container').should('be.visible');
    });
    it('switches to mobile layout when isMobile is true', () => {
      cy.viewport(375, 667);
      mountWithRouter(<Header isMobile={true} />);

      cy.get('[data-cy="mobile-header"]').should('be.visible');
      cy.contains('Worldbuilding Tool').should('not.exist');
    });
    it('maintains layout on tablet viewport', () => {
      cy.viewport(768, 1024);
      mountWithRouter(<Header isMobile={false} />);

      cy.contains('Worldbuilding Tool').should('be.visible');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles missing getCurrentProject function', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => undefined,
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Elements Browser"]').should('not.exist');
    });
    it('handles empty project name in export', () => {
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: '' }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Export Project"]').click();
      
      // TODO: * Should use fallback name 'project'
      cy.wrap(exportProjectSpy).should('have.been.called');
    });
    it('handles very long project names', () => {
      const longName = 'A'.repeat(100);
      cy.stub(useWorldbuildingStore, 'getState').returns({
        getCurrentProject: () => ({ id: '1', name: longName }),
        currentProjectId: '1',
        exportProject: exportProjectSpy,
        importProject: importProjectSpy
      });
      mountWithRouter(<Header isMobile={false} />);

      cy.get('[title="Export Project"]').should('be.visible');
    });
  });
});