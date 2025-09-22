/**
 * @fileoverview Sync Queue And Conflict Component Tests
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
import { SyncQueueStatus } from '../../../src/components/SyncQueueStatus';
import { ConflictResolver, SyncConflict } from '../../../src/components/ConflictResolver';
import { AutoSyncStatus } from '../../../src/components/AutoSyncStatus';

// * Mock the sync queue manager
const mockSyncQueueManager = {
  getQueueStatus: cy.stub().resolves({
    total: 5,
    byPriority: { high: 1, normal: 3, low: 1 },
    byEntity: { project: 2, element: 3 }
  }),
  clearQueue: cy.stub().resolves()
};

jest.mock('../../src/services/syncQueue', () => ({
  syncQueueManager: mockSyncQueueManager
}));

// * Mock the auto sync service
const mockAutoSyncService = {
  getState: cy.stub().returns({
    status: 'idle' as 'idle' | 'syncing' | 'offline' | 'error',
    pendingOperations: 0,
    lastSyncTime: new Date('2024-01-15T10:30:00'),
    errors: []
  }),
  subscribe: cy.stub().returns(() => {}),
  retry: cy.stub().resolves()
};

jest.mock('../../src/services/autoSync', () => ({
  autoSyncService: mockAutoSyncService
}));

// ! SECURITY: * Mock auth store
const mockAuthStore = {
  isAuthenticated: true,
  isOfflineMode: false
};

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: () => mockAuthStore
}));

// * Mock toast store
let mockAddToast: any;

beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

  mockAddToast = cy.stub();
  // Note: jest.mock doesn't work in Cypress
  // TODO: You'll need to mock useToastStore differently
});

// * Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: cy.stub().returns('5 minutes')
}));

describe('SyncQueueStatus Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    mockSyncQueueManager.getQueueStatus.resetHistory();
    mockSyncQueueManager.clearQueue.resetHistory();
    
    // * Reset to default queue status
    mockSyncQueueManager.getQueueStatus.resolves({
      total: 5,
      byPriority: { high: 1, normal: 3, low: 1 },
      byEntity: { project: 2, element: 3 }
    });
  });

  it('renders null when queue is empty', () => {
    mockSyncQueueManager.getQueueStatus.resolves({
      total: 0,
      byPriority: {},
      byEntity: {}
    });
    
    cy.mount(<SyncQueueStatus />);
    
    cy.get('button').should('not.exist');
  });

  it('shows pending count button when items in queue', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.wrap(null).then(() => {
      expect(mockSyncQueueManager.getQueueStatus).to.have.been.called;
    });
    
    cy.contains('5 pending').should('be.visible');
    cy.get('[data-cy*="metals-gold"]').should('exist');
  });

  it('opens dropdown on click', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    cy.contains('Sync Queue').should('be.visible');
    cy.contains('By Priority').should('be.visible');
    cy.contains('By Type').should('be.visible');
  });

  it('displays priority breakdown with icons', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    
    // * Check priority items
    cy.contains('high').should('be.visible');
    cy.contains('normal').should('be.visible');
    cy.contains('low').should('be.visible');
    
    // * Check counts
    cy.contains('high').parent().contains('1');
    cy.contains('normal').parent().contains('3');
    cy.contains('low').parent().contains('1');
  });

  it('displays entity type breakdown', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    
    cy.contains('project').should('be.visible');
    cy.contains('element').should('be.visible');
    cy.contains('project').parent().contains('2');
    cy.contains('element').parent().contains('3');
  });

  it('clears queue with confirmation', () => {
    cy.stub(window, 'confirm').returns(true);
    
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    cy.contains('Clear Queue').click();
    
    cy.wrap(null).then(() => {
      expect(window.confirm).to.have.been.calledWith('Clear all pending sync operations? This cannot be undone.');
      expect(mockSyncQueueManager.clearQueue).to.have.been.called;
    });
  });

  it('cancels clear when user declines confirmation', () => {
    cy.stub(window, 'confirm').returns(false);
    
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    cy.contains('Clear Queue').click();
    
    cy.wrap(null).then(() => {
      expect(mockSyncQueueManager.clearQueue).not.to.have.been.called;
    });
  });

  it('animates dropdown entrance', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    cy.get('.absolute').should('have.css', 'opacity') // CSS properties work in React Native Web;
  });

  it('updates status every 5 seconds', () => {
    cy.clock();
    cy.mount(<SyncQueueStatus />);
    
    cy.wrap(null).then(() => {
      expect(mockSyncQueueManager.getQueueStatus).to.have.been.calledOnce;
    });
    
    cy.tick(5000);
    
    cy.wrap(null).then(() => {
      expect(mockSyncQueueManager.getQueueStatus).to.have.been.calledTwice;
    });
  });

  it('handles different priority icons', () => {
    cy.mount(<SyncQueueStatus />);
    
    cy.contains('5 pending').click();
    
    // * Check for different colored icons
    cy.get('.text-blood-400').should('exist'); // high priority
    cy.get('.text-flame-400').should('exist'); // normal priority
    cy.get('.text-forest-400').should('exist'); // low priority
  });
});

describe('ConflictResolver Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  
  const mockConflict: SyncConflict = {
    projectId: 'proj-123',
    projectName: 'Fantasy World',
    localVersion: {
      data: { name: 'Fantasy World - Local' },
      modifiedAt: new Date('2024-01-15T10:00:00'),
      elements: 25,
      relationships: 10
    },
    cloudVersion: {
      data: { name: 'Fantasy World - Cloud' },
      modifiedAt: new Date('2024-01-15T09:30:00'),
      elements: 20,
      relationships: 8
    }
  };
  
  const onResolve = cy.stub();
  const onCancel = cy.stub();

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onResolve.resetHistory();
    onCancel.resetHistory();
  });

  it('renders conflict modal with project info', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Sync Conflict Detected').should('be.visible');
    cy.contains('Project "Fantasy World"').should('be.visible');
  });

  it('displays local version details', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Local Version').should('be.visible');
    cy.contains('Elements:').parent().contains('25');
    cy.contains('Relationships:').parent().contains('10');
    cy.contains('Use this version and discard cloud changes').should('be.visible');
  });

  it('displays cloud version details', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Cloud Version').should('be.visible');
    cy.contains('Elements:').parent().contains('20');
    cy.contains('Relationships:').parent().contains('8');
    cy.contains('Use this version and discard local changes').should('be.visible');
  });

  it('displays merge option', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Merge Changes').should('be.visible');
    cy.contains('Attempt to merge both versions').should('be.visible');
  });

  it('selects local version on click', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Local Version').parent().parent().click();
    cy.contains('Local Version').parent().contains('Selected').should('be.visible');
    cy.get('.border-metals-gold').should('have.length', 1);
  });

  it('selects cloud version on click', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Cloud Version').parent().parent().click();
    cy.contains('Cloud Version').parent().contains('Selected').should('be.visible');
    cy.get('.border-metals-gold').should('have.length', 1);
  });

  it('selects merge option on click', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Merge Changes').parent().click();
    cy.contains('Merge Changes').parent().contains('Selected').should('be.visible');
    cy.get('.border-metals-gold').should('have.length', 1);
  });

  it('disables Apply button when no selection', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Apply Resolution').should('be.disabled');
  });

  it('enables Apply button after selection', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Local Version').parent().parent().click();
    cy.contains('Apply Resolution').should('not.be.disabled');
  });

  it('calls onResolve with selected resolution', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Local Version').parent().parent().click();
    cy.contains('Apply Resolution').click();
    
    cy.wrap(null).then(() => {
      expect(onResolve).to.have.been.calledWith('local');
    });
  });

  it('calls onCancel when Cancel clicked', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Cancel').click();
    
    cy.wrap(null).then(() => {
      expect(onCancel).to.have.been.called;
    });
  });

  it('shows resolving state during resolution', () => {
    const slowResolve = cy.stub().callsFake(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={slowResolve}
        onCancel={onCancel}
      />
    );
    
    cy.contains('Merge Changes').parent().click();
    cy.contains('Apply Resolution').click();
    cy.contains('Resolving...').should('be.visible');
  });

  it('formats dates correctly', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    // * Check that dates are displayed
    cy.contains('Modified:').should('exist');
    // * Date formatting will vary based on locale
  });

  it('animates modal entrance', () => {
    cy.mount(
      <ConflictResolver
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={onCancel}
      />
    );
    
    cy.get('.fixed').should('have.css', 'opacity') // CSS properties work in React Native Web;
  });
});

describe('AutoSyncStatus Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    mockAuthStore.isAuthenticated = true;
    mockAuthStore.isOfflineMode = false;
    mockAutoSyncService.getState.resetHistory();
    mockAutoSyncService.subscribe.resetHistory();
    mockAutoSyncService.retry.resetHistory();
    mockAddToast.resetHistory();
    
    // * Reset to default state
    mockAutoSyncService.getState.returns({
      status: 'idle',
      pendingOperations: 0,
      lastSyncTime: new Date('2024-01-15T10:30:00'),
      errors: []
    });
  });

  it('renders null when not authenticated', () => {
    mockAuthStore.isAuthenticated = false;
    
    cy.mount(<AutoSyncStatus />);
    
    cy.get('div').should('not.exist');
  });

  it('shows offline mode when in offline mode', () => {
    mockAuthStore.isOfflineMode = true;
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Offline Mode').should('be.visible');
    cy.get('svg').should('exist'); // CloudOff icon
  });

  it('shows idle state with last sync time', () => {
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('All changes saved').should('be.visible');
    cy.get('[title*="Last synced"]').should('exist');
  });

  it('shows syncing state with spinner', () => {
    mockAutoSyncService.getState.returns({
      status: 'syncing',
      pendingOperations: 3,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Syncing (3)...').should('be.visible');
    cy.get('.animate-spin').should('exist');
  });

  it('shows pending operations in idle state', () => {
    mockAutoSyncService.getState.returns({
      status: 'idle',
      pendingOperations: 7,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('7 pending').should('be.visible');
    cy.get('.text-flame-400').should('exist');
  });

  it('shows offline state', () => {
    mockAutoSyncService.getState.returns({
      status: 'offline',
      pendingOperations: 0,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Offline - changes will sync when online').should('be.visible');
    cy.get('.text-flame-400').should('exist');
  });

  it('shows error state with retry button', () => {
    mockAutoSyncService.getState.returns({
      status: 'error',
      pendingOperations: 0,
      lastSyncTime: null,
      errors: ['Network timeout', 'Server error']
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Sync error - click to retry').should('be.visible');
    cy.get('.text-blood-400').should('exist');
    cy.get('button[title*="Network timeout"]').should('exist');
  });

  it('handles retry click in error state', () => {
    mockAutoSyncService.getState.returns({
      status: 'error',
      pendingOperations: 0,
      lastSyncTime: null,
      errors: ['Network error']
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Sync error - click to retry').click();
    
    cy.wrap(null).then(() => {
      expect(mockAddToast).to.have.been.calledWith({
        type: 'info',
        title: 'Retrying Sync',
        message: 'Attempting to sync your changes...'
      });
      expect(mockAutoSyncService.retry).to.have.been.called;
    });
  });

  it('shows badge for many pending operations', () => {
    mockAutoSyncService.getState.returns({
      status: 'idle',
      pendingOperations: 15,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.get('[data-cy*="flame-"]600').contains('15').should('be.visible');
  });

  it('shows 99+ for over 99 pending operations', () => {
    mockAutoSyncService.getState.returns({
      status: 'idle',
      pendingOperations: 150,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.get('[data-cy*="flame-"]600').contains('99+').should('be.visible');
  });

  it('subscribes to sync state changes', () => {
    cy.mount(<AutoSyncStatus />);
    
    cy.wrap(null).then(() => {
      expect(mockAutoSyncService.subscribe).to.have.been.called;
    });
  });

  it('shows hover effect on cloud icon', () => {
    cy.mount(<AutoSyncStatus />);
    
    cy.get('.group').trigger('mouseenter');
    cy.get('.group-hover\\:text-ink-light').should('exist');
  });

  it('handles ready state without last sync time', () => {
    mockAutoSyncService.getState.returns({
      status: 'idle',
      pendingOperations: 0,
      lastSyncTime: null,
      errors: []
    });
    
    cy.mount(<AutoSyncStatus />);
    
    cy.contains('Ready').should('be.visible');
  });
});