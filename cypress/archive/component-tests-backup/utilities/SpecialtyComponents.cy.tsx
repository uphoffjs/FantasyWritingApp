/**
 * @fileoverview Specialty Components Component Tests
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
import { KeyboardShortcutsHelp } from '../../../src/components/KeyboardShortcutsHelp';
// ! Component not yet implemented - EmailVerificationBanner missing
// import { EmailVerificationBanner } from '../../../src/components/EmailVerificationBanner';
// ! Component not yet implemented - MigrationPrompt missing
// import { MigrationPrompt } from '../../../src/components/MigrationPrompt';
// ! Component not yet implemented - AccountMenu missing
// import { AccountMenu } from '../../../src/components/AccountMenu';
import AuthGuard from '../../../src/components/AuthGuard';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// * Mock stores
const mockAuthStore = {
  user: { email: 'test@example.com' },
  profile: { display_name: 'Test User' },
  syncStatus: 'synced',
  isOfflineMode: false,
  isEmailVerified: false,
  isAuthenticated: true,
  isLoading: false,
  signOut: () => {},
  resendVerificationEmail: () => Promise.resolve({ success: true }),
  initialize: () => Promise.resolve()
};

const mockWorldbuildingStore = {
  projects: [
    { id: '1', name: 'Project 1', elements: [{ id: 'e1' }, { id: 'e2' }] },
    { id: '2', name: 'Project 2', elements: [{ id: 'e3' }] }
  ]
};

const mockToastStore = {
  addToast: () => {}
};

const mockMigrationService = {
  onProgress: () => () => {},
  migrateAllProjects: () => Promise.resolve({ success: true }),
  resetProgress: () => {}
};

// * Mock navigate
let mockNavigate = () => {};

// * Router wrapper for components that need it
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

  mockNavigate = cy.stub();
});

describe('KeyboardShortcutsHelp Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    isOpen: false,
    onClose: () => {}
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps.onClose.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('does not render when closed', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp {...defaultProps} />);
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('renders modal when open', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Keyboard Shortcuts').should('be.visible');
      cy.get('.lucide-keyboard').should('be.visible');
    });

    it('displays all shortcut sections', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Navigation').should('be.visible');
      cy.contains('Element Operations').should('be.visible');
      cy.contains('General').should('be.visible');
    });

    it('shows individual shortcuts', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Go to home').should('be.visible');
      cy.contains('New element').should('be.visible');
      cy.contains('Save').should('be.visible');
    });

    it('displays keyboard keys properly', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('H').should('be.visible');
      cy.get('kbd').contains('Esc').should('be.visible');
      cy.get('kbd').contains('Ctrl').should('be.visible');
    });

    it('shows context hints for shortcuts', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('(On project page)').should('be.visible');
      cy.contains('(On element page)').should('be.visible');
      cy.contains('(Anywhere)').should('be.visible');
    });

    it('displays tip at the bottom', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Keyboard shortcuts are disabled when typing in input fields').should('be.visible');
    });

    it('shows + between key combinations', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('.mx-1').contains('+').should('be.visible');
    });
  });

  describe('Platform Detection', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows Cmd instead of Ctrl on Mac', () => {
      cy.stub(navigator, 'platform').value('MacIntel');
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('Cmd').should('be.visible');
    });

    it('shows Ctrl on Windows/Linux', () => {
      cy.stub(navigator, 'platform').value('Win32');
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('Ctrl').should('be.visible');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('closes when X button clicked', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('button[aria-label="Close"]').click();
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('has scrollable content area', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('.overflow-y-auto').should('exist');
    });
  });

  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('has proper aria-label on close button', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('button[aria-label="Close"]').should('exist');
    });

    it('uses semantic HTML for keyboard keys', () => {
      cy.mountWithProviders(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').should('have.length.greaterThan', 0);
    });
  });
});

// ! SKIP: Component not yet implemented - EmailVerificationBanner missing
describe.skip('EmailVerificationBanner Component', () => {
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

    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(window, 'useToastStore').returns(mockToastStore);
    mockAuthStore.resendVerificationEmail.reset();
    mockToastStore.addToast.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('does not render when user is null', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, user: null });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('does not render when email is verified', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isEmailVerified: true });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('renders banner when email is unverified', () => {
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Please verify your email address').should('be.visible');
      cy.get('.lucide-alert-circle').should('be.visible');
    });

    it('shows resend button', () => {
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').should('be.visible');
      cy.get('.lucide-send').should('be.visible');
    });

    it('displays user email in success message', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.wrap(mockToastStore.addToast).should('have.been.calledWith', 
        Cypress.sinon.match({
          message: Cypress.sinon.match('test@example.com')
        })
      );
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('sends verification email when button clicked', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      expect(mockAuthStore.resendVerificationEmail).to.have.been.called;
    });

    it('shows loading state while sending', () => {
      mockAuthStore.resendVerificationEmail.returns(new Promise(() => {}));
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Sending...').should('be.visible');
      cy.get('.animate-spin').should('be.visible');
    });

    it('shows success state after sending', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Email sent! Check your inbox.').should('be.visible');
      cy.get('.lucide-check-circle').should('be.visible');
    });

    it('handles send error', () => {
      mockAuthStore.resendVerificationEmail.resolves({ 
        success: false, 
        error: 'Rate limit exceeded' 
      });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.wrap(mockToastStore.addToast).should('have.been.calledWith',
        Cypress.sinon.match({
          type: 'error',
          message: 'Rate limit exceeded'
        })
      );
    });

    it('dismisses banner when X clicked', () => {
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.get('button[aria-label="Dismiss banner"]').click();
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('disables button when already sent', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Email sent!').should('be.visible');
      // TODO: * Button should be replaced with success message
      cy.contains('Resend verification email').should('not.exist');
    });
  });

  describe('Animation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('animates entrance', () => {
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.get('motion.div').should('exist');
    });
  });

  describe('Error Handling', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles network error', () => {
      mockAuthStore.resendVerificationEmail.rejects(new Error('Network error'));
      // cy.mountWithProviders(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.wrap(mockToastStore.addToast).should('have.been.calledWith',
        Cypress.sinon.match({
          type: 'error',
          title: 'Error'
        })
      );
    });
  });
});

// ! SKIP: Component not yet implemented - MigrationPrompt missing
describe.skip('MigrationPrompt Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    isOpen: false,
    onClose: () => {},
    onComplete: () => {}
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(window, 'useWorldbuildingStore').returns(mockWorldbuildingStore);
    cy.stub(window, 'migrationService').value(mockMigrationService);
    defaultProps.onClose.reset();
    defaultProps.onComplete.reset();
    mockMigrationService.migrateAllProjects.reset();
    mockMigrationService.resetProgress.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('does not render when closed', () => {
      // cy.mountWithProviders(<MigrationPrompt {...defaultProps} />);
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('renders modal when open', () => {
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Sync Your Local Projects').should('be.visible');
      cy.contains('Upload your worldbuilding data to the cloud').should('be.visible');
    });

    it('displays project and element counts', () => {
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Projects').parent().contains('2').should('be.visible');
      cy.contains('Elements').parent().contains('3').should('be.visible');
    });

    it('shows benefits list', () => {
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Access from any device').should('be.visible');
      cy.contains('Automatic backups').should('be.visible');
      cy.contains('Keep local copy').should('be.visible');
    });

    it('displays action buttons', () => {
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').should('be.visible');
      cy.contains('Maybe Later').should('be.visible');
    });
  });

  describe('Migration Process', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('starts migration when button clicked', () => {
      mockMigrationService.onProgress.returns(() => {});
      mockMigrationService.migrateAllProjects.resolves({
        success: true,
        projectsMigrated: 2,
        elementsMigrated: 3,
        relationshipsMigrated: 5,
        templatesMigrated: 1
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      expect(mockMigrationService.migrateAllProjects).to.have.been.called;
    });

    it('shows progress during migration', () => {
      const progressCallback = cy.stub();
      mockMigrationService.onProgress.callsFake((cb) => {
        cb({
          status: 'migrating',
          current: 1,
          total: 5,
          currentItem: 'Project 1',
          errors: []
        });
        return () => {};
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      cy.contains('Uploading your projects...').should('be.visible');
      cy.contains('Project 1').should('be.visible');
      cy.contains('1 of 5').should('be.visible');
    });

    it('shows completion state', () => {
      mockMigrationService.onProgress.returns(() => {});
      mockMigrationService.migrateAllProjects.resolves({
        success: true,
        projectsMigrated: 2,
        elementsMigrated: 3,
        relationshipsMigrated: 5,
        templatesMigrated: 1
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      
      cy.contains('Upload Complete!').should('be.visible');
      cy.contains('Projects uploaded').parent().contains('2').should('be.visible');
      cy.contains('Elements uploaded').parent().contains('3').should('be.visible');
    });

    it('shows error state', () => {
      mockMigrationService.onProgress.callsFake((cb) => {
        cb({
          status: 'error',
          current: 1,
          total: 5,
          currentItem: '',
          errors: ['Network error', 'Server error']
        });
        return () => {};
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      
      cy.contains('Upload Failed').should('be.visible');
      cy.contains('Network error').should('be.visible');
      cy.contains('Server error').should('be.visible');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('closes when Maybe Later clicked', () => {
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Maybe Later').click();
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('prevents closing during migration', () => {
      mockMigrationService.onProgress.callsFake((cb) => {
        cb({
          status: 'migrating',
          current: 1,
          total: 5,
          currentItem: 'Project 1',
          errors: []
        });
        return () => {};
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      
      // TODO: X button should not be visible during migration
      cy.get('button').contains('×').should('not.exist');
    });

    it('calls onComplete when migration succeeds', () => {
      mockMigrationService.onProgress.callsFake((cb) => {
        cb({
          status: 'completed',
          current: 5,
          total: 5,
          currentItem: '',
          errors: []
        });
        return () => {};
      });
      mockMigrationService.migrateAllProjects.resolves({
        success: true,
        projectsMigrated: 2,
        elementsMigrated: 3,
        relationshipsMigrated: 5,
        templatesMigrated: 1
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      cy.contains('Continue').click();
      expect(defaultProps.onComplete).to.have.been.called;
    });

    it('allows retry on error', () => {
      mockMigrationService.onProgress.callsFake((cb) => {
        cb({
          status: 'error',
          current: 1,
          total: 5,
          currentItem: '',
          errors: ['Network error']
        });
        return () => {};
      });
      
      // cy.mountWithProviders(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      cy.contains('Try Again').click();
      
      // TODO: * Should reset to initial state
      cy.contains('Start Upload').should('be.visible');
    });
  });
});

// ! SKIP: Component not yet implemented - AccountMenu missing
describe.skip('AccountMenu Component', () => {
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

    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(React, 'useNavigate').returns(mockNavigate);
    mockAuthStore.signOut.reset();
    mockNavigate.reset();
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders avatar button with user initial', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').contains('T').should('be.visible');
    });

    it('shows sync status badge', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('.lucide-check').should('be.visible');
    });

    it('renders dropdown when clicked', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Test User').should('be.visible');
      cy.contains('test@example.com').should('be.visible');
    });

    it('displays sync status in dropdown', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Status').should('be.visible');
      cy.contains('Synced').should('be.visible');
    });

    it('shows menu items', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Go Offline').should('be.visible');
      cy.contains('Profile Settings').should('be.visible');
      cy.contains('Sync Settings').should('be.visible');
      cy.contains('Sign Out').should('be.visible');
    });
  });

  describe('Sync Status Display', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows syncing state', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, syncStatus: 'syncing' });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('.animate-spin').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Syncing...').should('be.visible');
    });

    it('shows error state', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, syncStatus: 'error' });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('.lucide-alert-circle').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Error').should('be.visible');
    });

    it('shows offline mode', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isOfflineMode: true });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('.lucide-wifi-off').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Offline Mode').should('be.visible');
      cy.contains('Go Online').should('be.visible');
    });
  });

  describe('Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('navigates to profile when clicked', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Profile Settings').click();
      expect(mockNavigate).to.have.been.calledWith('/profile');
    });

    it('navigates to settings when clicked', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Settings').click();
      expect(mockNavigate).to.have.been.calledWith('/settings');
    });

    it('signs out when clicked', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sign Out').click();
      expect(mockAuthStore.signOut).to.have.been.called;
      expect(mockNavigate).to.have.been.calledWith('/login');
    });

    it('closes dropdown when clicking outside', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          <div>
            {/* <AccountMenu /> */}
            <div data-cy="outside">Outside element</div>
          </div>
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Test User').should('be.visible');
      
      // * Simulate clicking outside
      cy.get('[data-cy="outside"]').click();
      cy.contains('Test User').should('not.exist');
    });

    it('hides sign out in offline mode', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isOfflineMode: true });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sign Out').should('not.exist');
    });
  });

  describe('Animation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('animates dropdown entrance', () => {
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.get('motion.div').should('exist');
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles missing profile name', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        profile: { display_name: null } 
      });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('User').should('be.visible');
    });

    it('uses email initial when no display name', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        profile: null 
      });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').contains('t').should('be.visible');
    });

    it('shows default initial when no user data', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        user: null,
        profile: null 
      });
      cy.mountWithProviders(
        <RouterWrapper>
          {/* <AccountMenu /> */}
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').contains('U').should('be.visible');
    });
  });
});

describe('AuthGuard Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const mockLocation = { pathname: '/projects', state: null };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(React, 'useNavigate').returns(mockNavigate);
    cy.stub(React, 'useLocation').returns(mockLocation);
    mockAuthStore.initialize.reset();
    mockNavigate.reset();
  });

  describe('Loading State', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows loading spinner while initializing', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isLoading: true 
      });
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      cy.get('.animate-spin').should('be.visible');
      cy.contains('Loading...').should('be.visible');
      cy.contains('Protected Content').should('not.exist');
    });
  });

  describe('Authentication Flow', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders children when authenticated', () => {
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      cy.contains('Protected Content').should('be.visible');
    });

    it('redirects to login when not authenticated', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isAuthenticated: false,
        isOfflineMode: false
      });
      cy.mountWithProviders(
        <MemoryRouter initialEntries={['/projects']}>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      cy.contains('Protected Content').should('not.exist');
    });

    it('allows access in offline mode', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isAuthenticated: false,
        isOfflineMode: true
      });
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      cy.contains('Protected Content').should('be.visible');
    });

    it('redirects from login when already authenticated', () => {
      cy.clock();
      cy.mountWithProviders(
        <MemoryRouter initialEntries={['/login']}>
          <AuthGuard requireAuth={false}>
            <div>Login Page</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      // TODO: * Should redirect after a small delay
      cy.tick(100);
      expect(mockNavigate).to.have.been.calledWith('/projects', { replace: true });
    });
  });

  describe('Initialization', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('calls initialize on mount', () => {
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      expect(mockAuthStore.initialize).to.have.been.called;
    });

    it('waits for initialization before rendering', () => {
      const initPromise = new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      mockAuthStore.initialize.returns(initPromise);
      
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Content</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.contains('Loading...').should('be.visible');
      cy.contains('Content').should('not.exist');
      
      cy.wait(150);
      cy.contains('Content').should('be.visible');
    });
  });

  describe('Navigation State', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('preserves location state when redirecting to login', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isAuthenticated: false
      });
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/projects/123',
        state: null
      });
      
      cy.mountWithProviders(
        <MemoryRouter initialEntries={['/projects/123']}>
          <AuthGuard>
            <div>Protected</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      // TODO: * Component should redirect with location state
      cy.contains('Protected').should('not.exist');
    });

    it('redirects to saved location after login', () => {
      cy.clock();
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/login',
        state: { from: { pathname: '/projects/123' } }
      });
      
      cy.mountWithProviders(
        <MemoryRouter initialEntries={['/login']}>
          <AuthGuard requireAuth={false}>
            <div>Login</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.tick(100);
      expect(mockNavigate).to.have.been.calledWith('/projects/123', { replace: true });
    });
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles missing from state gracefully', () => {
      cy.clock();
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/login',
        state: null
      });
      
      cy.mountWithProviders(
        <MemoryRouter initialEntries={['/login']}>
          <AuthGuard requireAuth={false}>
            <div>Login</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.tick(100);
      expect(mockNavigate).to.have.been.calledWith('/projects', { replace: true });
    });

    it('handles rapid auth state changes', () => {
      const authStore = { 
        ...mockAuthStore, 
        isAuthenticated: false 
      };
      cy.stub(window, 'useAuthStore').returns(authStore);
      
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.contains('Protected').should('not.exist');
      
      // ! SECURITY: * Simulate auth state change
      authStore.isAuthenticated = true;
      cy.mountWithProviders(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.contains('Protected').should('be.visible');
    });
  });
});