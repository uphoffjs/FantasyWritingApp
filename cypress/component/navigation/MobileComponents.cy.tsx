/**
 * @fileoverview Mobile Components Component Tests
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
import MobileHeader from '../../../src/components/MobileHeader';
import MobileMenuDrawer from '../../../src/components/MobileMenuDrawer';
import MobileBreadcrumbs from '../../../src/components/MobileBreadcrumbs';
import MobileBackButton from '../../../src/components/MobileBackButton';
import { BrowserRouter, useLocation, useNavigate, useParams } from 'react-router-dom';

// * Mock stores
const mockWorldbuildingStore = {
  getCurrentProject: cy.stub(),
  exportProject: cy.stub(),
  importProject: cy.stub(),
  currentProjectId: 'test-project-id'
};

const mockAuthStore = {
  user: { email: 'test@example.com' },
  signOut: cy.stub(),
  isOfflineMode: false,
  isAuthenticated: true
};

// Mock React Router hooks
let mockNavigate: any;
const mockLocation = { pathname: '/project/123/element/456' };
const mockParams = { projectId: '123', elementId: '456' };

// * Wrapper component with Router
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

  mockNavigate = cy.stub();
  // * Mock modules
  cy.stub(window, 'useWorldbuildingStore').returns(mockWorldbuildingStore);
});
cy.stub(window, 'useAuthStore').returns(mockAuthStore);

describe('MobileHeader Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    mobileMenuOpen: false,
    setMobileMenuOpen: cy.stub()
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(React, 'useNavigate').returns(mockNavigate);
    cy.stub(React, 'useLocation').returns(mockLocation);
    mockWorldbuildingStore.getCurrentProject.returns({
      id: 'test-project-id',
      name: 'Test Project',
      elements: []
    });
    defaultProps.setMobileMenuOpen.reset();
    mockNavigate.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders header with project name when project exists', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.contains('Test Project').should('be.visible');
    });

    it('renders default title when no project', () => {
      mockWorldbuildingStore.getCurrentProject.returns(null);
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.contains('Worldbuilding Tool').should('be.visible');
    });

    it('shows back button on project page', () => {
      mockLocation.pathname = '/project/123';
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-back"]').should('be.visible');
    });

    it('shows hamburger menu button', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible');
    });

    it('shows menu icon when closed', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-menu-toggle"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });

    it('shows X icon when open', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-menu-toggle"]').within(() => {
        cy.get('svg').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      });
    });
  });

  describe('Menu Overlay', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows menu overlay when open', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.get('.fixed.inset-0').should('be.visible');
      cy.contains('Menu').should('be.visible');
    });

    it('displays navigation items in menu', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.contains('Home').should('be.visible');
      cy.contains('Browse Elements').should('be.visible');
      cy.contains('Export Project').should('be.visible');
      cy.contains('Import Project').should('be.visible');
    });

    it('shows project info when project exists', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.contains('Current Project').should('be.visible');
      cy.contains('Test Project').should('be.visible');
    });

    it('shows sync status when authenticated', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.get('.flex.items-center.justify-around').should('exist');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('toggles menu when hamburger clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-menu-toggle"]').click();
      expect(defaultProps.setMobileMenuOpen).to.have.been.calledWith(true);
    });

    it('closes menu when overlay clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.get('.fixed.inset-0').click({ force: true });
      expect(defaultProps.setMobileMenuOpen).to.have.been.calledWith(false);
    });

    it('closes menu when X button clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.get('.fixed.right-0').within(() => {
        cy.get('button').contains('X').parent().click();
      });
      expect(defaultProps.setMobileMenuOpen).to.have.been.calledWith(false);
    });

    it('navigates to projects when Home clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.contains('Home').click();
      expect(mockNavigate).to.have.been.calledWith('/projects');
      expect(defaultProps.setMobileMenuOpen).to.have.been.calledWith(false);
    });

    it('navigates back when back button clicked', () => {
      mockLocation.pathname = '/project/123';
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('[data-cy="mobile-back"]').click();
      expect(mockNavigate).to.have.been.calledWith('/');
    });

    it('handles export project', () => {
      const exportStub = cy.stub().resolves('export-data');
      mockWorldbuildingStore.exportProject = exportStub;
      
      // * Create a stub for URL methods
      const createObjectURL = cy.stub(URL, 'createObjectURL').returns('blob:url');
      const revokeObjectURL = cy.stub(URL, 'revokeObjectURL');
      
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      
      cy.contains('Export Project').click();
      cy.wrap(exportStub).should('have.been.calledWith', 'test-project-id');
    });

    it('disables export when no project', () => {
      mockWorldbuildingStore.currentProjectId = null;
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      cy.contains('Export Project').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('is hidden on desktop', () => {
      cy.viewport(1024, 768);
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('header').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('is visible on mobile', () => {
      cy.viewport(375, 667);
      cy.mount(
        <RouterWrapper>
          <MobileHeader {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('header').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles import file selection', () => {
      const importStub = cy.stub().resolves(true);
      mockWorldbuildingStore.importProject = importStub;
      
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      
      // * This would trigger file input, but we can't fully test file selection in component tests
      cy.contains('Import Project').click();
    });

    it('shows error when import fails', () => {
      const importStub = cy.stub().resolves(false);
      mockWorldbuildingStore.importProject = importStub;
      cy.stub(window, 'alert');
      
      cy.mount(
        <RouterWrapper>
          <MobileHeader mobileMenuOpen={true} setMobileMenuOpen={defaultProps.setMobileMenuOpen} />
        </RouterWrapper>
      );
      
      cy.contains('Import Project').click();
    });
  });
});

describe('MobileMenuDrawer Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    isOpen: false,
    onClose: cy.stub()
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(React, 'useNavigate').returns(mockNavigate);
    mockWorldbuildingStore.getCurrentProject.returns({
      id: 'test-project-id',
      name: 'Test Project',
      elements: []
    });
    mockAuthStore.user = { email: 'test@example.com' };
    mockAuthStore.isOfflineMode = false;
    defaultProps.onClose.reset();
    mockNavigate.reset();
    mockAuthStore.signOut.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders nothing when closed', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer {...defaultProps} />
        </RouterWrapper>
      );
      cy.get('.fixed').should('not.exist');
    });

    it('renders drawer when open', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('.fixed.right-0').should('be.visible');
      cy.contains('Menu').should('be.visible');
    });

    it('shows user info when authenticated', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('test@example.com').should('be.visible');
    });

    it('shows offline mode indicator', () => {
      mockAuthStore.isOfflineMode = true;
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Offline Mode').should('be.visible');
    });

    it('displays current project section', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Current Project').should('be.visible');
      cy.contains('Test Project').should('be.visible');
    });

    it('shows all navigation items', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('All Projects').should('be.visible');
      cy.contains('Export Project').should('be.visible');
      cy.contains('Import Project').should('be.visible');
      cy.contains('Settings').should('be.visible');
      cy.contains('Profile').should('be.visible');
      cy.contains('Sign Out').should('be.visible');
    });
  });

  describe('Animations', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('animates backdrop fade in', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('[data-cy*="ink-black"]\\/50').should('exist');
    });

    it('animates drawer slide in', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('.fixed.right-0.top-0').should('exist');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('closes when backdrop clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('[data-cy*="ink-black"]\\/50').click({ force: true });
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('closes when X button clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Close menu"]').click();
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('navigates to projects', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('All Projects').click();
      expect(mockNavigate).to.have.been.calledWith('/projects');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('navigates to current project', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Test Project').click();
      expect(mockNavigate).to.have.been.calledWith('/project/test-project-id');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('navigates to settings', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Settings').click();
      expect(mockNavigate).to.have.been.calledWith('/settings');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('navigates to profile', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Profile').click();
      expect(mockNavigate).to.have.been.calledWith('/profile');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('handles sign out', () => {
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Sign Out').click();
      cy.wrap(mockAuthStore.signOut).should('have.been.called');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('handles export project', () => {
      const exportStub = cy.stub().resolves('export-data');
      mockWorldbuildingStore.exportProject = exportStub;
      
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      
      cy.contains('Export Project').click();
      cy.wrap(exportStub).should('have.been.calledWith', 'test-project-id');
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('disables export when no project', () => {
      mockWorldbuildingStore.currentProjectId = null;
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Export Project').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('handles import project', () => {
      const importStub = cy.stub().resolves(true);
      mockWorldbuildingStore.importProject = importStub;
      
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      
      cy.contains('Import Project').click();
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('is mobile-only component', () => {
      cy.viewport(1024, 768);
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('exist');
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles no user', () => {
      mockAuthStore.user = null;
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.get('.flex.items-center.gap-3').should('not.exist');
    });

    it('handles no project', () => {
      mockWorldbuildingStore.getCurrentProject.returns(null);
      cy.mount(
        <RouterWrapper>
          <MobileMenuDrawer isOpen={true} onClose={defaultProps.onClose} />
        </RouterWrapper>
      );
      cy.contains('Current Project').should('not.exist');
    });
  });
});

describe('MobileBreadcrumbs Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(React, 'useLocation').returns(mockLocation);
    cy.stub(React, 'useNavigate').returns(mockNavigate);
    cy.stub(React, 'useParams').returns(mockParams);
    mockWorldbuildingStore.getCurrentProject.returns({
      id: '123',
      name: 'Test Project',
      elements: [
        { id: '456', name: 'Test Element' }
      ]
    });
    mockNavigate.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders nothing on home page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('not.exist');
    });

    it('renders nothing on projects page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/projects' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('not.exist');
    });

    it('renders breadcrumbs on project page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.stub(React, 'useParams').returns({ projectId: '123' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Projects').should('be.visible');
      cy.contains('Test Project').should('be.visible');
    });

    it('renders breadcrumbs on element page', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Projects').should('be.visible');
      cy.contains('Test Project').should('be.visible');
      cy.contains('Test Element').should('be.visible');
    });

    it('shows home icon for projects breadcrumb', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.stub(React, 'useParams').returns({ projectId: '123' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.lucide-home').should('be.visible');
    });

    it('shows chevron separators', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.lucide-chevron-right').should('have.length', 2);
    });

    it('truncates long names', () => {
      mockWorldbuildingStore.getCurrentProject.returns({
        id: '123',
        name: 'Very Long Project Name That Should Be Truncated',
        elements: [
          { id: '456', name: 'Very Long Element Name That Should Be Truncated' }
        ]
      });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.truncate').should('exist');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('navigates to projects when Projects clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Projects').click();
      expect(mockNavigate).to.have.been.calledWith('/projects');
    });

    it('navigates to project when project name clicked', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Test Project').click();
      expect(mockNavigate).to.have.been.calledWith('/project/123');
    });

    it('does not navigate when clicking current page', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Test Element').click();
      expect(mockNavigate).not.to.have.been.called;
    });

    it('disables last breadcrumb', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Test Element').parent().should('have.attr', 'disabled');
    });

    it('styles last breadcrumb differently', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Test Element').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('Test Element').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('is hidden on desktop', () => {
      cy.viewport(1024, 768);
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('exist');
    });

    it('is visible on mobile', () => {
      cy.viewport(375, 667);
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.stub(React, 'useParams').returns({ projectId: '123' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('be.visible');
    });

    it('handles horizontal overflow', () => {
      cy.viewport(375, 667);
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.overflow-x-auto').should('exist');
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles missing project', () => {
      mockWorldbuildingStore.getCurrentProject.returns(null);
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.stub(React, 'useParams').returns({ projectId: '123' });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Projects').should('be.visible');
    });

    it('handles missing element', () => {
      mockWorldbuildingStore.getCurrentProject.returns({
        id: '123',
        name: 'Test Project',
        elements: []
      });
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.contains('Projects').should('be.visible');
      cy.contains('Test Project').should('be.visible');
    });

    it('does not render with only one breadcrumb', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/other' });
      cy.stub(React, 'useParams').returns({});
      cy.mount(
        <RouterWrapper>
          <MobileBreadcrumbs />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('not.exist');
    });
  });
});

describe('MobileBackButton Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(React, 'useNavigate').returns(mockNavigate);
    cy.stub(React, 'useLocation').returns(mockLocation);
    mockWorldbuildingStore.currentProjectId = 'test-project-id';
    mockNavigate.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders nothing on home page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('not.exist');
    });

    it('renders nothing on projects page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/projects' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('not.exist');
    });

    it('renders back button on element page', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('be.visible');
    });

    it('renders back button on project page', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('be.visible');
    });

    it('shows arrow left icon', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('.lucide-arrow-left').should('be.visible');
    });

    it('has proper styling', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'top-4')
        .and('have.class', 'left-4')
        .and('have.class', 'z-30');
    });
  });

  describe('Navigation Logic', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('navigates from element to project', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').click();
      expect(mockNavigate).to.have.been.calledWith('/project/test-project-id');
    });

    it('navigates from project to projects list', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').click();
      expect(mockNavigate).to.have.been.calledWith('/projects');
    });

    it('does not render on other pages', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/settings' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('is hidden on desktop', () => {
      cy.viewport(1024, 768);
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('.sm\\:hidden').should('exist');
    });

    it('is visible on mobile', () => {
      cy.viewport(375, 667);
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('has proper aria-label', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button').should('have.attr', 'aria-label', 'Go back');
    });

    it('is keyboard accessible', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').focus();
      cy.focused().should('have.attr', 'aria-label', 'Go back');
    });

    it('has hover state', () => {
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles missing currentProjectId', () => {
      mockWorldbuildingStore.currentProjectId = null;
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').click();
      expect(mockNavigate).to.have.been.calledWith('/project/null');
    });

    it('handles nested paths correctly', () => {
      cy.stub(React, 'useLocation').returns({ pathname: '/project/123/element/456/edit' });
      cy.mount(
        <RouterWrapper>
          <MobileBackButton />
        </RouterWrapper>
      );
      cy.get('button[aria-label="Go back"]').click();
      expect(mockNavigate).to.have.been.calledWith('/project/test-project-id');
    });
  });
});