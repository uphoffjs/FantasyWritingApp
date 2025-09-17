import React from 'react';
import { KeyboardShortcutsHelp } from '../../src/components/KeyboardShortcutsHelp';
import { EmailVerificationBanner } from '../../src/components/EmailVerificationBanner';
import { MigrationPrompt } from '../../src/components/MigrationPrompt';
import { AccountMenu } from '../../src/components/AccountMenu';
import { AuthGuard } from '../../src/components/AuthGuard';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock stores
const mockAuthStore = {
  user: { email: 'test@example.com' },
  profile: { display_name: 'Test User' },
  syncStatus: 'synced',
  isOfflineMode: false,
  isEmailVerified: false,
  isAuthenticated: true,
  isLoading: false,
  signOut: cy.stub(),
  resendVerificationEmail: cy.stub(),
  initialize: cy.stub().resolves()
};

const mockWorldbuildingStore = {
  projects: [
    { id: '1', name: 'Project 1', elements: [{ id: 'e1' }, { id: 'e2' }] },
    { id: '2', name: 'Project 2', elements: [{ id: 'e3' }] }
  ]
};

const mockToastStore = {
  addToast: cy.stub()
};

const mockMigrationService = {
  onProgress: cy.stub(),
  migrateAllProjects: cy.stub(),
  resetProgress: cy.stub()
};

// Mock navigate
let mockNavigate: any;

// Router wrapper for components that need it
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

beforeEach(() => {
  mockNavigate = cy.stub();
});

describe('KeyboardShortcutsHelp Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: cy.stub()
  };

  beforeEach(() => {
    defaultProps.onClose.reset();
  });

  describe('Rendering', () => {
    it('does not render when closed', () => {
      cy.mount(<KeyboardShortcutsHelp {...defaultProps} />);
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('renders modal when open', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Keyboard Shortcuts').should('be.visible');
      cy.get('.lucide-keyboard').should('be.visible');
    });

    it('displays all shortcut sections', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Navigation').should('be.visible');
      cy.contains('Element Operations').should('be.visible');
      cy.contains('General').should('be.visible');
    });

    it('shows individual shortcuts', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Go to home').should('be.visible');
      cy.contains('New element').should('be.visible');
      cy.contains('Save').should('be.visible');
    });

    it('displays keyboard keys properly', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('H').should('be.visible');
      cy.get('kbd').contains('Esc').should('be.visible');
      cy.get('kbd').contains('Ctrl').should('be.visible');
    });

    it('shows context hints for shortcuts', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('(On project page)').should('be.visible');
      cy.contains('(On element page)').should('be.visible');
      cy.contains('(Anywhere)').should('be.visible');
    });

    it('displays tip at the bottom', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.contains('Keyboard shortcuts are disabled when typing in input fields').should('be.visible');
    });

    it('shows + between key combinations', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('.mx-1').contains('+').should('be.visible');
    });
  });

  describe('Platform Detection', () => {
    it('shows Cmd instead of Ctrl on Mac', () => {
      cy.stub(navigator, 'platform').value('MacIntel');
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('Cmd').should('be.visible');
    });

    it('shows Ctrl on Windows/Linux', () => {
      cy.stub(navigator, 'platform').value('Win32');
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').contains('Ctrl').should('be.visible');
    });
  });

  describe('Interactions', () => {
    it('closes when X [data-cy*="button"] clicked', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('[data-cy*="button"][aria-label="Close"]').click();
      expect(defaultProps.onClose).to.have.been.called;
    });

    it('has scrollable content area', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('.overflow-y-auto').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on close [data-cy*="button"]', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('[data-cy*="button"][aria-label="Close"]').should('exist');
    });

    it('uses semantic HTML for keyboard keys', () => {
      cy.mount(<KeyboardShortcutsHelp isOpen={true} onClose={defaultProps.onClose} />);
      cy.get('kbd').should('have.length.greaterThan', 0);
    });
  });
});

describe('EmailVerificationBanner Component', () => {
  beforeEach(() => {
    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(window, 'useToastStore').returns(mockToastStore);
    mockAuthStore.resendVerificationEmail.reset();
    mockToastStore.addToast.reset();
  });

  describe('Rendering', () => {
    it('does not render when user is null', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, user: null });
      cy.mount(<EmailVerificationBanner />);
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('does not render when email is verified', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isEmailVerified: true });
      cy.mount(<EmailVerificationBanner />);
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('renders banner when email is unverified', () => {
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Please verify your email address').should('be.visible');
      cy.get('.lucide-alert-circle').should('be.visible');
    });

    it('shows resend [data-cy*="button"]', () => {
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').should('be.visible');
      cy.get('.lucide-send').should('be.visible');
    });

    it('displays user email in success message', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.wrap(mockToastStore.addToast).should('have.been.calledWith', 
        Cypress.sinon.match({
          message: Cypress.sinon.match('test@example.com')
        })
      );
    });
  });

  describe('Interactions', () => {
    it('sends verification email when [data-cy*="button"] clicked', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      expect(mockAuthStore.resendVerificationEmail).to.have.been.called;
    });

    it('shows loading state while sending', () => {
      mockAuthStore.resendVerificationEmail.returns(new Promise(() => {}));
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Sending...').should('be.visible');
      cy.get('.animate-spin').should('be.visible');
    });

    it('shows success state after sending', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Email sent! Check your inbox.').should('be.visible');
      cy.get('.lucide-check-circle').should('be.visible');
    });

    it('handles send error', () => {
      mockAuthStore.resendVerificationEmail.resolves({ 
        success: false, 
        error: 'Rate limit exceeded' 
      });
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.wrap(mockToastStore.addToast).should('have.been.calledWith',
        Cypress.sinon.match({
          type: 'error',
          message: 'Rate limit exceeded'
        })
      );
    });

    it('dismisses banner when X clicked', () => {
      cy.mount(<EmailVerificationBanner />);
      cy.get('[data-cy*="button"][aria-label="Dismiss banner"]').click();
      cy.get('[data-cy*="flame-light"]').should('not.exist');
    });

    it('disables [data-cy*="button"] when already sent', () => {
      mockAuthStore.resendVerificationEmail.resolves({ success: true });
      cy.mount(<EmailVerificationBanner />);
      cy.contains('Resend verification email').click();
      cy.contains('Email sent!').should('be.visible');
      // Button should be replaced with success message
      cy.contains('Resend verification email').should('not.exist');
    });
  });

  describe('Animation', () => {
    it('animates entrance', () => {
      cy.mount(<EmailVerificationBanner />);
      cy.get('motion.div').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('handles network error', () => {
      mockAuthStore.resendVerificationEmail.rejects(new Error('Network error'));
      cy.mount(<EmailVerificationBanner />);
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

describe('MigrationPrompt Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: cy.stub(),
    onComplete: cy.stub()
  };

  beforeEach(() => {
    cy.stub(window, 'useWorldbuildingStore').returns(mockWorldbuildingStore);
    cy.stub(window, 'migrationService').value(mockMigrationService);
    defaultProps.onClose.reset();
    defaultProps.onComplete.reset();
    mockMigrationService.migrateAllProjects.reset();
    mockMigrationService.resetProgress.reset();
  });

  describe('Rendering', () => {
    it('does not render when closed', () => {
      cy.mount(<MigrationPrompt {...defaultProps} />);
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('renders modal when open', () => {
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Sync Your Local Projects').should('be.visible');
      cy.contains('Upload your worldbuilding data to the cloud').should('be.visible');
    });

    it('displays project and element counts', () => {
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Projects').parent().contains('2').should('be.visible');
      cy.contains('Elements').parent().contains('3').should('be.visible');
    });

    it('shows benefits list', () => {
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Access from any device').should('be.visible');
      cy.contains('Automatic backups').should('be.visible');
      cy.contains('Keep local copy').should('be.visible');
    });

    it('displays action [data-cy*="button"]s', () => {
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').should('be.visible');
      cy.contains('Maybe Later').should('be.visible');
    });
  });

  describe('Migration Process', () => {
    it('starts migration when [data-cy*="button"] clicked', () => {
      mockMigrationService.onProgress.returns(() => {});
      mockMigrationService.migrateAllProjects.resolves({
        success: true,
        projectsMigrated: 2,
        elementsMigrated: 3,
        relationshipsMigrated: 5,
        templatesMigrated: 1
      });
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      
      cy.contains('Upload Failed').should('be.visible');
      cy.contains('Network error').should('be.visible');
      cy.contains('Server error').should('be.visible');
    });
  });

  describe('Interactions', () => {
    it('closes when Maybe Later clicked', () => {
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      
      // X [data-cy*="button"] should not be visible during migration
      cy.get('[data-cy*="button"]').contains('×').should('not.exist');
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
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
      
      cy.mount(<MigrationPrompt isOpen={true} onClose={defaultProps.onClose} onComplete={defaultProps.onComplete} />);
      cy.contains('Start Upload').click();
      cy.contains('Try Again').click();
      
      // Should reset to initial state
      cy.contains('Start Upload').should('be.visible');
    });
  });
});

describe('AccountMenu Component', () => {
  beforeEach(() => {
    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(React, 'useNavigate').returns(mockNavigate);
    mockAuthStore.signOut.reset();
    mockNavigate.reset();
  });

  describe('Rendering', () => {
    it('renders avatar [data-cy*="button"] with user initial', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').contains('T').should('be.visible');
    });

    it('shows sync status badge', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('.lucide-check').should('be.visible');
    });

    it('renders dropdown when clicked', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Test User').should('be.visible');
      cy.contains('test@example.com').should('be.visible');
    });

    it('displays sync status in dropdown', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Status').should('be.visible');
      cy.contains('Synced').should('be.visible');
    });

    it('shows menu items', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
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
    it('shows syncing state', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, syncStatus: 'syncing' });
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('.animate-spin').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Syncing...').should('be.visible');
    });

    it('shows error state', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, syncStatus: 'error' });
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('.lucide-alert-circle').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Error').should('be.visible');
    });

    it('shows offline mode', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isOfflineMode: true });
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('.lucide-wifi-off').should('be.visible');
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Offline Mode').should('be.visible');
      cy.contains('Go Online').should('be.visible');
    });
  });

  describe('Interactions', () => {
    it('navigates to profile when clicked', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Profile Settings').click();
      expect(mockNavigate).to.have.been.calledWith('/profile');
    });

    it('navigates to settings when clicked', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sync Settings').click();
      expect(mockNavigate).to.have.been.calledWith('/settings');
    });

    it('signs out when clicked', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sign Out').click();
      expect(mockAuthStore.signOut).to.have.been.called;
      expect(mockNavigate).to.have.been.calledWith('/login');
    });

    it('closes dropdown when clicking outside', () => {
      cy.mount(
        <RouterWrapper>
          <div>
            <AccountMenu />
            <div data-cy="outside">Outside element</div>
          </div>
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Test User').should('be.visible');
      
      // Simulate clicking outside
      cy.get('[data-cy="outside"]').click();
      cy.contains('Test User').should('not.exist');
    });

    it('hides sign out in offline mode', () => {
      cy.stub(window, 'useAuthStore').returns({ ...mockAuthStore, isOfflineMode: true });
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.contains('Sign Out').should('not.exist');
    });
  });

  describe('Animation', () => {
    it('animates dropdown entrance', () => {
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').click();
      cy.get('motion.div').should('exist');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing profile name', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        profile: { display_name: null } 
      });
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
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
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
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
      cy.mount(
        <RouterWrapper>
          <AccountMenu />
        </RouterWrapper>
      );
      cy.get('[data-cy*="gradient-to-br"]').contains('U').should('be.visible');
    });
  });
});

describe('AuthGuard Component', () => {
  const mockLocation = { pathname: '/projects', state: null };

  beforeEach(() => {
    cy.stub(window, 'useAuthStore').returns(mockAuthStore);
    cy.stub(React, 'useNavigate').returns(mockNavigate);
    cy.stub(React, 'useLocation').returns(mockLocation);
    mockAuthStore.initialize.reset();
    mockNavigate.reset();
  });

  describe('Loading State', () => {
    it('shows loading spinner while initializing', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isLoading: true 
      });
      cy.mount(
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
    it('renders children when authenticated', () => {
      cy.mount(
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
      cy.mount(
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
      cy.mount(
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
      cy.mount(
        <MemoryRouter initialEntries={['/login']}>
          <AuthGuard requireAuth={false}>
            <div>Login Page</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      // Should redirect after a small delay
      cy.tick(100);
      expect(mockNavigate).to.have.been.calledWith('/projects', { replace: true });
    });
  });

  describe('Initialization', () => {
    it('calls initialize on mount', () => {
      cy.mount(
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
      
      cy.mount(
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
    it('preserves location state when redirecting to login', () => {
      cy.stub(window, 'useAuthStore').returns({ 
        ...mockAuthStore, 
        isAuthenticated: false
      });
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/projects/123',
        state: null
      });
      
      cy.mount(
        <MemoryRouter initialEntries={['/projects/123']}>
          <AuthGuard>
            <div>Protected</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      // Component should redirect with location state
      cy.contains('Protected').should('not.exist');
    });

    it('redirects to saved location after login', () => {
      cy.clock();
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/login',
        state: { from: { pathname: '/projects/123' } }
      });
      
      cy.mount(
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
    it('handles missing from state gracefully', () => {
      cy.clock();
      cy.stub(React, 'useLocation').returns({ 
        pathname: '/login',
        state: null
      });
      
      cy.mount(
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
      
      cy.mount(
        <MemoryRouter>
          <AuthGuard>
            <div>Protected</div>
          </AuthGuard>
        </MemoryRouter>
      );
      
      cy.contains('Protected').should('not.exist');
      
      // Simulate auth state change
      authStore.isAuthenticated = true;
      cy.mount(
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