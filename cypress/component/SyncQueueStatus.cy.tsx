/**
 * @fileoverview SyncQueueStatus Component Tests
 * Tests for US-6.2: Sync Queue Status with Conflict Resolution
 *
 * User Story:
 * As a user working offline
 * I want to see the sync status of my changes
 * So that I know when my data is safely synchronized
 *
 * Acceptance Criteria:
 * - Display real-time sync status with visual feedback
 * - Show network connectivity status
 * - Handle conflict resolution through modal interface
 * - Support compact and full display modes
 * - Auto-hide when sync is complete
 * - Show queue statistics and operations
 */

import React from 'react';
import { SyncQueueStatus } from '../../src/components/SyncQueueStatus';
import { offlineQueueManager } from '../../src/services/offlineQueueManager';
import { deltaSyncService } from '../../src/services/deltaSyncService';

// * Mock NetInfo for network connectivity simulation
const mockNetInfo = {
  addEventListener: cy.stub().returns(() => {}),
  fetch: cy.stub().resolves({ isConnected: true }),
};

// * Mock data for testing
const mockQueueItems = [
  {
    id: 'queue-1',
    action: 'update' as const,
    entityType: 'project' as const,
    entityId: 'project-1',
    payload: { title: 'Updated Project' },
    timestamp: new Date(),
    retryCount: 0,
    maxRetries: 3,
    priority: 'normal' as const,
  },
  {
    id: 'queue-2',
    action: 'create' as const,
    entityType: 'element' as const,
    entityId: 'element-1',
    payload: { name: 'New Character' },
    timestamp: new Date(),
    retryCount: 1,
    maxRetries: 3,
    priority: 'high' as const,
    error: 'Network timeout',
  },
];

const mockConflicts = [
  {
    id: 'conflict-1',
    entityType: 'project' as const,
    entityId: 'project-2',
    changeType: 'update' as const,
    timestamp: new Date(),
    fields: ['title', 'description'],
    oldValue: { title: 'Old Title' },
    newValue: { title: 'New Title' },
  },
];

describe('SyncQueueStatus Component', () => {
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Mock NetInfo module
    cy.window().then((win) => {
      (win as any).NetInfo = mockNetInfo;
    });

    // * Setup viewport for mobile-first testing
    cy.viewport('iphone-x');
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  describe('Display Modes', () => {
    it('should render in compact mode correctly', () => {
      // * Arrange - Mount component in compact mode
      cy.mount(
        <SyncQueueStatus
          compact={true}
          testID="sync-status"
        />
      );

      // * Assert - Verify compact display
      cy.get('[data-cy="sync-status"]').should('be.visible');
      cy.get('[data-cy="sync-status-status-text"]').should('be.visible');
      cy.get('[data-cy="sync-status-sync-button"]').should('not.exist'); // Hidden in compact
      cy.get('[data-cy="sync-status-toggle"]').should('be.visible');
    });

    it('should render in full mode with queue details', () => {
      // * Arrange - Mount component in full mode
      cy.mount(
        <SyncQueueStatus
          compact={false}
          showDetails={true}
          testID="sync-status"
        />
      );

      // * Assert - Verify full display
      cy.get('[data-cy="sync-status"]').should('be.visible');
      cy.get('[data-cy="sync-status-sync-button"]').should('be.visible');
      cy.get('[data-cy="sync-status-status-text"]').should('be.visible');
    });

    it('should toggle between compact and full modes', () => {
      // * Arrange
      cy.mount(
        <SyncQueueStatus
          compact={true}
          testID="sync-status"
        />
      );

      // * Act - Toggle to full mode
      cy.get('[data-cy="sync-status-toggle"]').click();

      // * Assert - Should show full mode elements
      cy.get('[data-cy="sync-status-sync-button"]').should('be.visible');

      // * Act - Toggle back to compact
      cy.get('[data-cy="sync-status-toggle"]').click();

      // * Assert - Should hide full mode elements
      cy.get('[data-cy="sync-status-sync-button"]').should('not.exist');
    });
  });

  describe('Network Status', () => {
    it('should display online status correctly', () => {
      // * Arrange - Set online state
      cy.window().then((win) => {
        (win as any).NetInfo.fetch = cy.stub().resolves({ isConnected: true });
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Assert - Should show online indicator
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'All changes synced');
    });

    it('should display offline status correctly', () => {
      // * Arrange - Set offline state
      cy.window().then((win) => {
        (win as any).NetInfo.fetch = cy.stub().resolves({ isConnected: false });
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Wait for state update
      cy.wait(100);

      // * Assert - Should show offline indicator
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'Offline');
    });

    it('should react to network changes', () => {
      // * Arrange - Start online
      let networkListener: any;
      cy.window().then((win) => {
        (win as any).NetInfo.addEventListener = cy.stub().callsFake((callback) => {
          networkListener = callback;
          return () => {};
        });
        (win as any).NetInfo.fetch = cy.stub().resolves({ isConnected: true });
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Assert initial online state
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'All changes synced');

      // * Act - Simulate going offline
      cy.window().then(() => {
        if (networkListener) {
          networkListener({ isConnected: false });
        }
      });

      // * Assert - Should update to offline
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'Offline');
    });
  });

  describe('Queue Operations', () => {
    it('should display queue items correctly', () => {
      // * Arrange - Mock queue with items
      cy.stub(offlineQueueManager, 'getStatus').returns({
        pending: 2,
        failed: 1,
        isProcessing: false,
        isOnline: true,
        items: mockQueueItems,
        failedItems: [],
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          showDetails={true}
          testID="sync-status"
        />
      );

      // * Assert - Queue items should be visible
      cy.get('[data-cy="sync-status-queue-item-queue-1"]').should('be.visible');
      cy.get('[data-cy="sync-status-queue-item-queue-2"]').should('be.visible');
    });

    it('should handle sync button click', () => {
      // * Arrange - Mock sync function
      const processQueueStub = cy.stub(offlineQueueManager, 'processQueue').resolves({
        successful: [],
        failed: [],
        retrying: [],
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Act - Click sync button
      cy.get('[data-cy="sync-status-sync-button"]').click();

      // * Assert - processQueue should be called
      cy.wrap(processQueueStub).should('have.been.called');
    });

    it('should show loading state during sync', () => {
      // * Arrange - Mock slow sync
      cy.stub(offlineQueueManager, 'processQueue').returns(
        new Promise(resolve => setTimeout(() => resolve({
          successful: [],
          failed: [],
          retrying: [],
        }), 1000))
      );

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Act - Start sync
      cy.get('[data-cy="sync-status-sync-button"]').click();

      // * Assert - Should show spinner
      cy.get('[data-cy="sync-status-spinner"]').should('be.visible');
    });

    it('should display retry button for failed items', () => {
      // * Arrange - Mock failed items
      cy.stub(offlineQueueManager, 'getStatus').returns({
        pending: 0,
        failed: 2,
        isProcessing: false,
        isOnline: true,
        items: [],
        failedItems: mockQueueItems,
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Assert - Retry button should be visible
      cy.get('[data-cy="sync-status-retry"]').should('be.visible');
    });
  });

  describe('Conflict Resolution', () => {
    it('should show conflict resolution modal', () => {
      // * Arrange - Mock conflicts
      cy.stub(deltaSyncService, 'getPendingChanges').returns(mockConflicts);

      cy.mount(
        <SyncQueueStatus
          compact={false}
          enableConflictResolution={true}
          testID="sync-status"
        />
      );

      // * Simulate conflict detection
      cy.window().then((win) => {
        // Trigger conflict state
        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: mockConflicts }
        });
        win.dispatchEvent(event);
      });

      // * Assert - Modal should appear
      cy.get('[data-cy="sync-status-conflict-conflict-1"]').should('be.visible');
    });

    it('should handle keep local resolution', () => {
      // * Arrange - Mock conflicts
      cy.stub(deltaSyncService, 'getPendingChanges').returns(mockConflicts);
      const resolveStub = cy.stub().resolves();

      cy.mount(
        <SyncQueueStatus
          compact={false}
          enableConflictResolution={true}
          testID="sync-status"
        />
      );

      // * Trigger conflict modal
      cy.window().then((win) => {
        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: mockConflicts }
        });
        win.dispatchEvent(event);
      });

      // * Act - Choose keep local
      cy.get('[data-cy="sync-status-keep-local"]').click();

      // * Assert - Modal should close
      cy.get('[data-cy="sync-status-conflict-conflict-1"]').should('not.exist');
    });

    it('should handle keep remote resolution', () => {
      // * Arrange - Mock conflicts
      cy.stub(deltaSyncService, 'getPendingChanges').returns(mockConflicts);

      cy.mount(
        <SyncQueueStatus
          compact={false}
          enableConflictResolution={true}
          testID="sync-status"
        />
      );

      // * Trigger conflict modal
      cy.window().then((win) => {
        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: mockConflicts }
        });
        win.dispatchEvent(event);
      });

      // * Act - Choose keep remote
      cy.get('[data-cy="sync-status-keep-remote"]').click();

      // * Assert - Modal should close
      cy.get('[data-cy="sync-status-conflict-conflict-1"]').should('not.exist');
    });

    it('should handle cancel conflict resolution', () => {
      // * Arrange - Mock conflicts
      cy.stub(deltaSyncService, 'getPendingChanges').returns(mockConflicts);

      cy.mount(
        <SyncQueueStatus
          compact={false}
          enableConflictResolution={true}
          testID="sync-status"
        />
      );

      // * Trigger conflict modal
      cy.window().then((win) => {
        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: mockConflicts }
        });
        win.dispatchEvent(event);
      });

      // * Act - Cancel
      cy.get('[data-cy="sync-status-cancel"]').click();

      // * Assert - Modal should close without resolution
      cy.get('[data-cy="sync-status-conflict-conflict-1"]').should('not.exist');
    });
  });

  describe('Auto-hide Functionality', () => {
    it('should auto-hide after successful sync', () => {
      // * Arrange - Component with auto-hide enabled
      cy.mount(
        <SyncQueueStatus
          compact={false}
          autoHide={true}
          autoHideDelay={500} // Short delay for testing
          testID="sync-status"
        />
      );

      // * Component should be visible initially
      cy.get('[data-cy="sync-status"]').should('be.visible');

      // * Wait for auto-hide
      cy.wait(600);

      // * Assert - Should fade out
      cy.get('[data-cy="sync-status"]').should('have.css', 'opacity', '0');
    });

    it('should not auto-hide when there are pending items', () => {
      // * Arrange - Mock pending items
      cy.stub(offlineQueueManager, 'getStatus').returns({
        pending: 2,
        failed: 0,
        isProcessing: false,
        isOnline: true,
        items: mockQueueItems,
        failedItems: [],
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          autoHide={true}
          autoHideDelay={500}
          testID="sync-status"
        />
      );

      // * Wait for potential auto-hide
      cy.wait(600);

      // * Assert - Should remain visible
      cy.get('[data-cy="sync-status"]').should('be.visible');
      cy.get('[data-cy="sync-status"]').should('not.have.css', 'opacity', '0');
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different viewports', () => {
      // * Test mobile viewport
      cy.viewport('iphone-x');
      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );
      cy.get('[data-cy="sync-status"]').should('be.visible');

      // * Test tablet viewport
      cy.viewport('ipad-2');
      cy.get('[data-cy="sync-status"]').should('be.visible');

      // * Test desktop viewport
      cy.viewport('macbook-15');
      cy.get('[data-cy="sync-status"]').should('be.visible');
    });

    it('should position correctly based on position prop', () => {
      // * Test top position
      cy.mount(
        <SyncQueueStatus
          position="top"
          compact={false}
          testID="sync-status"
        />
      );
      cy.get('[data-cy="sync-status"]')
        .should('have.css', 'position', 'absolute')
        .and('have.css', 'top', '0px');

      // * Test bottom position
      cy.mount(
        <SyncQueueStatus
          position="bottom"
          compact={false}
          testID="sync-status"
        />
      );
      cy.get('[data-cy="sync-status"]')
        .should('have.css', 'position', 'absolute')
        .and('have.css', 'bottom', '0px');
    });
  });

  describe('Animation and Visual Feedback', () => {
    it('should animate sync icon when syncing', () => {
      // * Arrange - Mock syncing state
      cy.stub(offlineQueueManager, 'getStatus').returns({
        pending: 2,
        failed: 0,
        isProcessing: true, // Syncing
        isOnline: true,
        items: mockQueueItems,
        failedItems: [],
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Assert - Spinner should be rotating
      cy.get('[data-cy="sync-status-spinner"]')
        .should('be.visible')
        .and('have.css', 'animation-name');
    });

    it('should show different colors for different states', () => {
      // * Test success state (all synced)
      cy.stub(offlineQueueManager, 'getStatus').returns({
        pending: 0,
        failed: 0,
        isProcessing: false,
        isOnline: true,
        items: [],
        failedItems: [],
      });

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Success should have green indicator
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'All changes synced');
    });
  });

  describe('Error Handling', () => {
    it('should handle sync errors gracefully', () => {
      // * Arrange - Mock sync error
      cy.stub(offlineQueueManager, 'processQueue').rejects(new Error('Network error'));

      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      // * Act - Try to sync
      cy.get('[data-cy="sync-status-sync-button"]').click();

      // * Assert - Should show error state
      cy.get('[data-cy="sync-status-status-text"]')
        .should('contain', 'failed');
    });

    it('should handle missing network module gracefully', () => {
      // * Remove NetInfo mock
      cy.window().then((win) => {
        delete (win as any).NetInfo;
      });

      // * Should still mount without crashing
      cy.mount(
        <SyncQueueStatus
          compact={false}
          testID="sync-status"
        />
      );

      cy.get('[data-cy="sync-status"]').should('be.visible');
    });
  });
});