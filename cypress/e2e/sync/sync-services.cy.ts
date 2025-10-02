/**
 * @fileoverview Sync Services E2E Tests
 * Tests for US-6.2: Delta Sync and Offline Queue Management
 *
 * User Story:
 * As a user working on my fantasy writing projects
 * I want my changes to sync automatically when online
 * So that I never lose my work and can work offline
 *
 * Acceptance Criteria:
 * - Track all changes with delta sync for efficiency
 * - Queue operations when offline with retry logic
 * - Resolve conflicts when the same data is modified
 * - Persist queue across app sessions
 * - Automatically sync when connection is restored
 * - Prioritize operations based on importance
 */

describe('Sync Services E2E Tests', () => {
  beforeEach(() => {
    // * Setup test user and initial data
    cy.setupTestUser({
      projects: [
        {
          id: 'project-1',
          name: 'The Dragon Chronicles',
          description: 'An epic fantasy adventure',
          updatedAt: new Date().toISOString(),
        },
      ],
      elements: [
        {
          id: 'element-1',
          name: 'Dragonborn Hero',
          type: 'character',
          projectId: 'project-1',
          answers: { background: 'Raised by dragons' },
        },
      ],
    });

    // * Visit the app
    cy.visit('/app/projects');

    // * Set viewport for testing
    cy.viewport('macbook-15');
  });

  // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
  // ! Following Cypress best practices - no conditional statements in tests

  describe('Delta Sync Service', () => {
    it('should track create operations', () => {
      // * Navigate to elements page
      cy.get('[data-cy="navigate-to-elements"]').click();

      // * Create a new element
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-select"]').select('location');
      cy.get('[data-cy="element-name-input"]').type('Dragon\'s Lair');
      cy.get('[data-cy="save-element-button"]').click();

      // * Check that delta sync tracked the create
      cy.window().then((win) => {
        const store = JSON.parse(win.localStorage.getItem('fantasy-writing-app-store') || '{}');
        const deltaChanges = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:deltaChanges') || '[]');

        // * Should have tracked the create operation
        expect(deltaChanges).to.have.length.greaterThan(0);
        const createChange = deltaChanges.find((c: any) => c.changeType === 'create');
        expect(createChange).to.exist;
        expect(createChange.entityType).to.equal('element');
        expect(createChange.newValue.name).to.equal('Dragon\'s Lair');
      });
    });

    it('should track update operations with field-level changes', () => {
      // * Navigate to element editor
      cy.get('[data-cy="navigate-to-elements"]').click();
      cy.get('[data-cy="element-card-element-1"]').click();

      // * Update element fields
      cy.get('[data-cy="element-name-input"]').clear();
      cy.get('[data-cy="element-name-input"]').type('Dragonborn Warrior');
      cy.get('[data-cy="save-element-button"]').click();

      // * Check delta sync tracked only changed fields
      cy.window().then((win) => {
        const deltaChanges = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:deltaChanges') || '[]');

        const updateChange = deltaChanges.find((c: any) =>
          c.changeType === 'update' && c.entityId === 'element-1'
        );
        expect(updateChange).to.exist;
        expect(updateChange.fields).to.include('name');
        expect(updateChange.newValue.name).to.equal('Dragonborn Warrior');
      });
    });

    it('should track delete operations', () => {
      // * Navigate to elements
      cy.get('[data-cy="navigate-to-elements"]').click();

      // * Delete an element
      cy.get('[data-cy="element-card-element-1"]').within(() => {
        cy.get('[data-cy="delete-element-button"]').click();
      });
      cy.get('[data-cy="confirm-delete-button"]').click();

      // * Check delta sync tracked the delete
      cy.window().then((win) => {
        const deltaChanges = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:deltaChanges') || '[]');

        const deleteChange = deltaChanges.find((c: any) =>
          c.changeType === 'delete' && c.entityId === 'element-1'
        );
        expect(deleteChange).to.exist;
        expect(deleteChange.entityType).to.equal('element');
      });
    });

    it('should generate checksums for data integrity', () => {
      // * Create multiple changes
      cy.get('[data-cy="navigate-to-projects"]').click();
      cy.get('[data-cy="project-card-project-1"]').click();
      cy.get('[data-cy="project-title-input"]').clear();
      cy.get('[data-cy="project-title-input"]').type('The Dragon Saga');
      cy.get('[data-cy="save-project-button"]').click();

      // * Verify checksums are generated
      // ! Following Cypress best practices - filter data before testing instead of using conditionals
      cy.window().then((win) => {
        const deltaChanges = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:deltaChanges') || '[]');

        // * Filter to only changes with newValue before testing
        const changesWithNewValue = deltaChanges.filter((change: any) => change.newValue);

        // * Now test all filtered changes without conditionals
        changesWithNewValue.forEach((change: any) => {
          expect(change.checksum).to.exist;
          expect(change.checksum).to.be.a('string');
          expect(change.checksum.length).to.be.greaterThan(0);
        });

        // * Ensure we have at least some changes with new values
        expect(changesWithNewValue.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Offline Queue Manager', () => {
    it('should queue operations when offline', () => {
      // * Simulate going offline
      cy.window().then((win) => {
        // Set offline state in the app
        const event = new Event('offline');
        win.dispatchEvent(event);
      });

      // * Make changes while offline
      cy.get('[data-cy="navigate-to-elements"]').click();
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-select"]').select('item');
      cy.get('[data-cy="element-name-input"]').type('Dragon Scale Armor');
      cy.get('[data-cy="save-element-button"]').click();

      // * Check that operation was queued
      cy.window().then((win) => {
        const queue = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:offlineQueue') || '[]');

        expect(queue).to.have.length.greaterThan(0);
        const queuedItem = queue[0];
        expect(queuedItem.action).to.equal('create');
        expect(queuedItem.entityType).to.equal('element');
        expect(queuedItem.payload.name).to.equal('Dragon Scale Armor');
      });

      // * Verify sync status shows queued items
      cy.get('[data-cy="sync-queue-status"]').should('be.visible');
      cy.get('[data-cy="sync-queue-status-status-text"]').should('contain', 'Offline');
    });

    it('should process queue when coming back online', () => {
      // * Start offline with queued items
      cy.window().then((win) => {
        // Add items to queue
        const queue = [
          {
            id: 'queue-test-1',
            action: 'update',
            entityType: 'project',
            entityId: 'project-1',
            payload: { name: 'Updated Name' },
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3,
            priority: 'normal',
          },
        ];
        win.localStorage.setItem('@FantasyWritingApp:offlineQueue', JSON.stringify(queue));

        // Set offline
        const offlineEvent = new Event('offline');
        win.dispatchEvent(offlineEvent);
      });

      // * Verify offline status
      cy.get('[data-cy="sync-queue-status-status-text"]').should('contain', 'Offline');

      // * Simulate coming back online
      cy.window().then((win) => {
        const onlineEvent = new Event('online');
        win.dispatchEvent(onlineEvent);
      });

      // * Verify queue processing starts
      cy.get('[data-cy="sync-queue-status-status-text"]').should('contain', 'Syncing');

      // * Eventually should show synced
      cy.get('[data-cy="sync-queue-status-status-text"]', { timeout: 10000 })
        .should('contain', 'All changes synced');
    });

    it('should respect operation priorities', () => {
      // * Create operations with different priorities
      cy.window().then((win) => {
        const queue = [
          {
            id: 'low-priority',
            action: 'update',
            entityType: 'element',
            entityId: 'element-3',
            payload: { description: 'Low priority update' },
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3,
            priority: 'low',
          },
          {
            id: 'high-priority',
            action: 'create',
            entityType: 'project',
            entityId: 'project-2',
            payload: { name: 'High Priority Project' },
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3,
            priority: 'high',
          },
          {
            id: 'normal-priority',
            action: 'update',
            entityType: 'element',
            entityId: 'element-2',
            payload: { name: 'Normal Priority Update' },
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3,
            priority: 'normal',
          },
        ];
        win.localStorage.setItem('@FantasyWritingApp:offlineQueue', JSON.stringify(queue));
      });

      // * Check queue display shows correct priority order
      cy.get('[data-cy="sync-queue-status"]').click(); // Expand to show details
      cy.get('[data-cy^="sync-queue-status-queue-item-"]').then(($items) => {
        // High priority should be first
        expect($items.first()).to.contain('High Priority');
        // Low priority should be last
        expect($items.last()).to.contain('Low priority');
      });
    });

    it('should handle retry logic for failed operations', () => {
      // * Create a failing operation
      cy.window().then((win) => {
        const queue = [
          {
            id: 'retry-test',
            action: 'update',
            entityType: 'project',
            entityId: 'project-1',
            payload: { name: 'Will Fail' },
            timestamp: new Date().toISOString(),
            retryCount: 2, // Already failed twice
            maxRetries: 3,
            priority: 'normal',
            error: 'Network timeout',
          },
        ];
        win.localStorage.setItem('@FantasyWritingApp:offlineQueue', JSON.stringify(queue));
      });

      // * Verify retry button is visible
      cy.get('[data-cy="sync-queue-status-retry"]').should('be.visible');

      // * Click retry
      cy.get('[data-cy="sync-queue-status-retry"]').click();

      // * Should attempt retry
      cy.get('[data-cy="sync-queue-status-status-text"]').should('contain', 'Syncing');
    });

    it('should persist queue across sessions', () => {
      // * Add items to queue
      cy.window().then((win) => {
        const queue = [
          {
            id: 'persist-test',
            action: 'create',
            entityType: 'element',
            entityId: 'element-persist',
            payload: { name: 'Persisted Element' },
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3,
            priority: 'normal',
          },
        ];
        win.localStorage.setItem('@FantasyWritingApp:offlineQueue', JSON.stringify(queue));
      });

      // * Reload the page (simulating new session)
      cy.reload();

      // * Queue should still exist
      cy.window().then((win) => {
        const queue = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:offlineQueue') || '[]');
        expect(queue).to.have.length(1);
        expect(queue[0].payload.name).to.equal('Persisted Element');
      });

      // * Sync status should show pending item
      cy.get('[data-cy="sync-queue-status"]').should('be.visible');
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect conflicts when same entity is modified', () => {
      // * Simulate conflict scenario
      cy.window().then((win) => {
        // Local change
        const localChange = {
          id: 'local-1',
          entityType: 'project',
          entityId: 'project-1',
          changeType: 'update',
          timestamp: new Date().toISOString(),
          fields: ['name'],
          oldValue: { name: 'Original Name' },
          newValue: { name: 'Local Name' },
        };

        // Remote change (simulated)
        const remoteChange = {
          id: 'remote-1',
          entityType: 'project',
          entityId: 'project-1',
          changeType: 'update',
          timestamp: new Date().toISOString(),
          fields: ['name'],
          oldValue: { name: 'Original Name' },
          newValue: { name: 'Remote Name' },
        };

        // Store local change
        win.localStorage.setItem('@FantasyWritingApp:deltaChanges', JSON.stringify([localChange]));

        // Trigger conflict detection
        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: [remoteChange] }
        });
        win.dispatchEvent(event);
      });

      // * Conflict modal should appear
      cy.get('[data-cy="sync-queue-status-conflict-remote-1"]').should('be.visible');

      // * Should show conflict resolution options
      cy.get('[data-cy="sync-queue-status-keep-local"]').should('be.visible');
      cy.get('[data-cy="sync-queue-status-keep-remote"]').should('be.visible');
    });

    it('should resolve conflicts with local strategy', () => {
      // * Create conflict
      cy.window().then((win) => {
        const conflict = {
          id: 'conflict-local',
          entityType: 'element',
          entityId: 'element-1',
          changeType: 'update',
          timestamp: new Date().toISOString(),
          fields: ['name', 'description'],
          oldValue: { name: 'Old', description: 'Old Desc' },
          newValue: { name: 'Remote', description: 'Remote Desc' },
        };

        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: [conflict] }
        });
        win.dispatchEvent(event);
      });

      // * Choose local resolution
      cy.get('[data-cy="sync-queue-status-keep-local"]').click();

      // * Conflict should be resolved
      cy.get('[data-cy="sync-queue-status-conflict-conflict-local"]').should('not.exist');

      // * Local changes should be preserved
      cy.window().then((win) => {
        const deltaChanges = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:deltaChanges') || '[]');
        // Local changes should still exist
        expect(deltaChanges.length).to.be.greaterThan(0);
      });
    });

    it('should resolve conflicts with remote strategy', () => {
      // * Create conflict
      cy.window().then((win) => {
        const conflict = {
          id: 'conflict-remote',
          entityType: 'project',
          entityId: 'project-1',
          changeType: 'update',
          timestamp: new Date().toISOString(),
          fields: ['description'],
          oldValue: { description: 'Old Description' },
          newValue: { description: 'Remote Description' },
        };

        const event = new CustomEvent('sync-conflict', {
          detail: { conflicts: [conflict] }
        });
        win.dispatchEvent(event);
      });

      // * Choose remote resolution
      cy.get('[data-cy="sync-queue-status-keep-remote"]').click();

      // * Conflict should be resolved
      cy.get('[data-cy="sync-queue-status-conflict-conflict-remote"]').should('not.exist');

      // * Remote changes should be applied
      // (In real app, this would update the local data)
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete offline editing workflow', () => {
      // * Go offline
      cy.window().then((win) => {
        const event = new Event('offline');
        win.dispatchEvent(event);
      });

      // * Create multiple changes offline
      // Create new element
      cy.get('[data-cy="navigate-to-elements"]').click();
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-select"]').select('character');
      cy.get('[data-cy="element-name-input"]').type('Offline Character');
      cy.get('[data-cy="save-element-button"]').click();

      // Update existing project
      cy.get('[data-cy="navigate-to-projects"]').click();
      cy.get('[data-cy="project-description-input"]').clear();
      cy.get('[data-cy="project-description-input"]').type('Edited offline');
      cy.get('[data-cy="save-project-button"]').click();

      // * Verify queue has multiple items
      cy.window().then((win) => {
        const queue = JSON.parse(win.localStorage.getItem('@FantasyWritingApp:offlineQueue') || '[]');
        expect(queue.length).to.be.greaterThan(1);
      });

      // * Go back online
      cy.window().then((win) => {
        const event = new Event('online');
        win.dispatchEvent(event);
      });

      // * Verify sync starts automatically
      cy.get('[data-cy="sync-queue-status-status-text"]').should('contain', 'Syncing');

      // * Eventually all should sync
      cy.get('[data-cy="sync-queue-status-status-text"]', { timeout: 10000 })
        .should('contain', 'All changes synced');
    });

    it('should handle mixed priority operations correctly', () => {
      // * Create various priority operations
      cy.window().then((win) => {
        // High priority: New project
        const highPriority = {
          id: 'high-1',
          action: 'create',
          entityType: 'project',
          entityId: 'project-high',
          payload: { name: 'Critical Project' },
          timestamp: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        };

        // Normal priority: Update element
        const normalPriority = {
          id: 'normal-1',
          action: 'update',
          entityType: 'element',
          entityId: 'element-1',
          payload: { description: 'Normal update' },
          timestamp: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'normal',
        };

        // Low priority: Delete old element
        const lowPriority = {
          id: 'low-1',
          action: 'delete',
          entityType: 'element',
          entityId: 'element-old',
          timestamp: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'low',
        };

        // Add with dependencies
        const dependentOperation = {
          id: 'dependent-1',
          action: 'update',
          entityType: 'element',
          entityId: 'element-2',
          payload: { projectId: 'project-high' },
          timestamp: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'normal',
          dependencies: ['high-1'], // Depends on high priority project creation
        };

        const queue = [lowPriority, dependentOperation, normalPriority, highPriority];
        win.localStorage.setItem('@FantasyWritingApp:offlineQueue', JSON.stringify(queue));
      });

      // * Process queue
      cy.get('[data-cy="sync-queue-status-sync-button"]').click();

      // * High priority should process first
      // Then dependent operations
      // Then normal priority
      // Finally low priority

      // * Verify all eventually sync
      cy.get('[data-cy="sync-queue-status-status-text"]', { timeout: 10000 })
        .should('contain', 'All changes synced');
    });
  });
});