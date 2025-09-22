/**
 * @fileoverview Unit tests for deltaSyncService
 * Tests delta synchronization functionality for efficient data syncing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deltaSyncService } from '../../src/services/deltaSyncService';
import type { DeltaChange, ConflictResolution } from '../../src/services/deltaSyncService';

// * Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('DeltaSyncService', () => {
  beforeEach(() => {
    // * Clear all mocks before each test
    jest.clearAllMocks();

    // * Reset the service state
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should generate a device ID if none exists', async () => {
      // * Mock no existing device ID
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:deviceId') return null;
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // * Should have generated and saved a device ID
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@FantasyWritingApp:deviceId',
        expect.stringMatching(/^device-\d+-[a-z0-9]{9}$/)
      );
    });

    it('should load existing device ID', async () => {
      const existingId = 'device-123-abc123xyz';

      // * Mock existing device ID
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:deviceId') return existingId;
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // * Should not generate a new ID
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
        '@FantasyWritingApp:deviceId',
        expect.anything()
      );
    });

    it('should load existing changes from storage', async () => {
      const existingChanges = [
        {
          id: 'change-1',
          entityType: 'project',
          entityId: 'project-1',
          changeType: 'update',
          timestamp: new Date().toISOString(),
        },
      ];

      // * Mock existing changes
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:deltaChanges') {
          return JSON.stringify(existingChanges);
        }
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // * Changes should be loaded
      const pendingChanges = deltaSyncService.getPendingChanges();
      expect(pendingChanges).toHaveLength(1);
      expect(pendingChanges[0].id).toBe('change-1');
    });

    it('should load last sync timestamp', async () => {
      const lastSync = new Date('2025-01-01T00:00:00Z');

      // * Mock existing timestamp
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:lastSyncTimestamp') {
          return lastSync.toISOString();
        }
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // * Build payload should include the timestamp
      const payload = deltaSyncService.buildSyncPayload();
      expect(payload.lastSyncTimestamp).toEqual(lastSync);
    });
  });

  describe('Change Tracking', () => {
    describe('trackCreate', () => {
      it('should track create operations correctly', () => {
        const entity = {
          id: 'element-1',
          name: 'Dragon',
          type: 'creature',
        };

        deltaSyncService.trackCreate('element', entity);

        const changes = deltaSyncService.getPendingChanges();
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({
          entityType: 'element',
          entityId: 'element-1',
          changeType: 'create',
          newValue: entity,
        });
      });

      it('should generate checksum for created entity', () => {
        const entity = {
          id: 'project-1',
          name: 'Fantasy World',
          description: 'A magical realm',
        };

        deltaSyncService.trackCreate('project', entity);

        const changes = deltaSyncService.getPendingChanges();
        expect(changes[0].checksum).toBeDefined();
        expect(typeof changes[0].checksum).toBe('string');
      });

      it('should persist changes to storage', async () => {
        const entity = { id: 'test-1', name: 'Test' };

        deltaSyncService.trackCreate('project', entity);

        // * Wait for async save
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@FantasyWritingApp:deltaChanges',
          expect.stringContaining('test-1')
        );
      });
    });

    describe('trackUpdate', () => {
      it('should track update operations with field changes', () => {
        const oldValue = { name: 'Old Name', description: 'Old Desc' };
        const newValue = { name: 'New Name', description: 'New Desc' };
        const fields = ['name', 'description'];

        deltaSyncService.trackUpdate('project', 'project-1', fields, oldValue, newValue);

        const changes = deltaSyncService.getPendingChanges();
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({
          entityType: 'project',
          entityId: 'project-1',
          changeType: 'update',
          fields,
          oldValue,
          newValue,
        });
      });

      it('should merge updates for the same entity', () => {
        // * First update
        deltaSyncService.trackUpdate(
          'element',
          'elem-1',
          ['name'],
          { name: 'Old' },
          { name: 'New' }
        );

        // * Second update to same entity
        deltaSyncService.trackUpdate(
          'element',
          'elem-1',
          ['description'],
          { description: 'Old Desc' },
          { description: 'New Desc' }
        );

        const changes = deltaSyncService.getPendingChanges();

        // * Should have merged into single change
        expect(changes).toHaveLength(1);
        expect(changes[0].fields).toContain('name');
        expect(changes[0].fields).toContain('description');
        expect(changes[0].newValue).toEqual({
          name: 'New',
          description: 'New Desc',
        });
      });

      it('should update existing create operations', () => {
        // * Track initial create
        deltaSyncService.trackCreate('project', {
          id: 'proj-1',
          name: 'Initial Name',
        });

        // * Update the same entity
        deltaSyncService.trackUpdate(
          'project',
          'proj-1',
          ['name'],
          { name: 'Initial Name' },
          { name: 'Updated Name' }
        );

        const changes = deltaSyncService.getPendingChanges();

        // * Should still be a create, but with updated value
        expect(changes).toHaveLength(1);
        expect(changes[0].changeType).toBe('create');
        expect(changes[0].newValue.name).toBe('Updated Name');
      });
    });

    describe('trackDelete', () => {
      it('should track delete operations', () => {
        deltaSyncService.trackDelete('element', 'elem-1');

        const changes = deltaSyncService.getPendingChanges();
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({
          entityType: 'element',
          entityId: 'elem-1',
          changeType: 'delete',
        });
      });

      it('should remove pending creates when entity is deleted', () => {
        // * Create then delete same entity
        deltaSyncService.trackCreate('project', {
          id: 'proj-1',
          name: 'To Delete',
        });

        deltaSyncService.trackDelete('project', 'proj-1');

        const changes = deltaSyncService.getPendingChanges();

        // * Should have no changes (create canceled by delete)
        expect(changes).toHaveLength(0);
      });

      it('should replace updates with delete', () => {
        // * Update then delete
        deltaSyncService.trackUpdate(
          'element',
          'elem-1',
          ['name'],
          { name: 'Old' },
          { name: 'New' }
        );

        deltaSyncService.trackDelete('element', 'elem-1');

        const changes = deltaSyncService.getPendingChanges();

        // * Should only have delete
        expect(changes).toHaveLength(1);
        expect(changes[0].changeType).toBe('delete');
      });
    });
  });

  describe('Checksum Calculation', () => {
    it('should generate consistent checksums for same data', () => {
      const data = { id: '1', name: 'Test', values: [1, 2, 3] };

      // * Track same data twice
      deltaSyncService.trackCreate('project', data);
      deltaSyncService.trackCreate('element', data);

      const changes = deltaSyncService.getPendingChanges();

      // * Checksums should be identical
      expect(changes[0].checksum).toBe(changes[1].checksum);
    });

    it('should generate different checksums for different data', () => {
      const data1 = { id: '1', name: 'Test1' };
      const data2 = { id: '2', name: 'Test2' };

      deltaSyncService.trackCreate('project', data1);
      deltaSyncService.trackCreate('project', data2);

      const changes = deltaSyncService.getPendingChanges();

      // * Checksums should be different
      expect(changes[0].checksum).not.toBe(changes[1].checksum);
    });
  });

  describe('Sync Payload', () => {
    it('should build complete sync payload', () => {
      // * Add some changes
      deltaSyncService.trackCreate('project', { id: '1', name: 'Project' });
      deltaSyncService.trackUpdate('element', 'elem-1', ['name'], { name: 'Old' }, { name: 'New' });

      const payload = deltaSyncService.buildSyncPayload();

      expect(payload).toHaveProperty('changes');
      expect(payload).toHaveProperty('lastSyncTimestamp');
      expect(payload).toHaveProperty('deviceId');
      expect(payload).toHaveProperty('checksum');
      expect(payload.changes).toHaveLength(2);
    });

    it('should sort changes by timestamp', () => {
      // * Create changes with different timestamps
      const oldChange = {
        id: 'old',
        entityType: 'project' as const,
        entityId: 'proj-1',
        changeType: 'update' as const,
        timestamp: new Date('2025-01-01'),
      };

      const newChange = {
        id: 'new',
        entityType: 'project' as const,
        entityId: 'proj-2',
        changeType: 'update' as const,
        timestamp: new Date('2025-01-02'),
      };

      // * Add in reverse order
      // We need to directly manipulate the internal map for this test
      // Since the service doesn't expose a direct way to set timestamps
      deltaSyncService.trackUpdate('project', 'proj-2', ['name'], {}, {});
      deltaSyncService.trackUpdate('project', 'proj-1', ['name'], {}, {});

      const changes = deltaSyncService.getPendingChanges();

      // * Should be sorted by timestamp (oldest first)
      expect(changes[0].timestamp.getTime()).toBeLessThanOrEqual(changes[1].timestamp.getTime());
    });
  });

  describe('Conflict Resolution', () => {
    const localChange: DeltaChange = {
      id: 'local-1',
      entityType: 'project',
      entityId: 'proj-1',
      changeType: 'update',
      timestamp: new Date(),
      fields: ['name'],
      oldValue: { name: 'Original' },
      newValue: { name: 'Local Update' },
      checksum: 'local-checksum',
    };

    const remoteChange: DeltaChange = {
      id: 'remote-1',
      entityType: 'project',
      entityId: 'proj-1',
      changeType: 'update',
      timestamp: new Date(),
      fields: ['name'],
      oldValue: { name: 'Original' },
      newValue: { name: 'Remote Update' },
      checksum: 'remote-checksum',
    };

    describe('applyRemoteChanges', () => {
      it('should apply remote changes when no conflicts', async () => {
        const remoteChanges = [
          {
            id: 'remote-1',
            entityType: 'element' as const,
            entityId: 'elem-new',
            changeType: 'create' as const,
            timestamp: new Date(),
            newValue: { id: 'elem-new', name: 'Remote Element' },
          },
        ];

        const result = await deltaSyncService.applyRemoteChanges(remoteChanges);

        expect(result.applied).toHaveLength(1);
        expect(result.conflicts).toHaveLength(0);
      });

      it('should detect conflicts for same entity', async () => {
        // * Create local change
        deltaSyncService.trackUpdate('project', 'proj-1', ['name'], { name: 'Original' }, { name: 'Local' });

        // * Try to apply conflicting remote change
        const result = await deltaSyncService.applyRemoteChanges([remoteChange]);

        expect(result.applied).toHaveLength(0);
        expect(result.conflicts).toHaveLength(1);
      });

      it('should resolve conflicts with local strategy', async () => {
        // * Create local change
        deltaSyncService.trackUpdate('project', 'proj-1', ['name'], { name: 'Original' }, { name: 'Local' });

        const resolution: ConflictResolution = { strategy: 'local' };
        const result = await deltaSyncService.applyRemoteChanges([remoteChange], resolution);

        // * Local change should be preserved
        expect(result.applied).toHaveLength(1);
        expect(result.applied[0].newValue.name).toBe('Local');
      });

      it('should resolve conflicts with remote strategy', async () => {
        // * Create local change
        deltaSyncService.trackUpdate('project', 'proj-1', ['name'], { name: 'Original' }, { name: 'Local' });

        const resolution: ConflictResolution = { strategy: 'remote' };
        const result = await deltaSyncService.applyRemoteChanges([remoteChange], resolution);

        // * Remote change should be applied
        expect(result.applied).toHaveLength(1);
        expect(result.applied[0].newValue.name).toBe('Remote Update');
      });

      it('should resolve conflicts with merge strategy', async () => {
        // * Create local change with multiple fields
        deltaSyncService.trackUpdate(
          'project',
          'proj-1',
          ['name', 'description'],
          { name: 'Original', description: 'Original Desc' },
          { name: 'Local Name', description: 'Local Desc' }
        );

        // * Remote change with different fields
        const remoteWithDesc: DeltaChange = {
          ...remoteChange,
          fields: ['description', 'status'],
          newValue: { description: 'Remote Desc', status: 'active' },
        };

        const resolution: ConflictResolution = { strategy: 'merge' };
        const result = await deltaSyncService.applyRemoteChanges([remoteWithDesc], resolution);

        // * Should merge both changes
        expect(result.applied).toHaveLength(1);
        expect(result.applied[0].newValue).toMatchObject({
          name: 'Local Name',
          description: 'Remote Desc',
          status: 'active',
        });
      });

      it('should use custom resolver for merge strategy', async () => {
        deltaSyncService.trackUpdate('project', 'proj-1', ['data'], {}, { data: 'local' });

        const resolution: ConflictResolution = {
          strategy: 'merge',
          resolver: (local, remote) => ({
            ...local,
            ...remote,
            merged: true,
          }),
        };

        const result = await deltaSyncService.applyRemoteChanges([remoteChange], resolution);

        expect(result.applied[0].newValue).toHaveProperty('merged', true);
      });

      it('should return null for manual resolution strategy', async () => {
        deltaSyncService.trackUpdate('project', 'proj-1', ['name'], {}, { name: 'Local' });

        const resolution: ConflictResolution = { strategy: 'manual' };
        const result = await deltaSyncService.applyRemoteChanges([remoteChange], resolution);

        // * Manual resolution returns conflicts, not applied
        expect(result.applied).toHaveLength(0);
        expect(result.conflicts).toHaveLength(1);
      });
    });
  });

  describe('Data Management', () => {
    it('should clear synced changes', () => {
      // * Add multiple changes
      deltaSyncService.trackCreate('project', { id: '1' });
      deltaSyncService.trackCreate('project', { id: '2' });
      deltaSyncService.trackCreate('project', { id: '3' });

      const changes = deltaSyncService.getPendingChanges();
      const changeIds = changes.slice(0, 2).map(c => c.id);

      // * Clear first two
      deltaSyncService.clearSyncedChanges(changeIds);

      const remaining = deltaSyncService.getPendingChanges();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toMatchObject({
        entityId: '3',
      });
    });

    it('should update last sync timestamp when clearing', async () => {
      deltaSyncService.trackCreate('project', { id: '1' });
      const changes = deltaSyncService.getPendingChanges();

      deltaSyncService.clearSyncedChanges([changes[0].id]);

      // * Wait for async save
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@FantasyWritingApp:lastSyncTimestamp',
        expect.any(String)
      );
    });

    it('should report change count', () => {
      expect(deltaSyncService.getChangeCount()).toBe(0);

      deltaSyncService.trackCreate('project', { id: '1' });
      expect(deltaSyncService.getChangeCount()).toBe(1);

      deltaSyncService.trackCreate('element', { id: '2' });
      expect(deltaSyncService.getChangeCount()).toBe(2);
    });

    it('should check for pending changes', () => {
      expect(deltaSyncService.hasPendingChanges()).toBe(false);

      deltaSyncService.trackCreate('project', { id: '1' });
      expect(deltaSyncService.hasPendingChanges()).toBe(true);
    });

    it('should export changes for debugging', () => {
      deltaSyncService.trackCreate('project', { id: '1', name: 'Debug Test' });
      deltaSyncService.trackUpdate('element', 'elem-1', ['status'], {}, { status: 'active' });

      const exported = deltaSyncService.exportChanges();

      expect(Array.isArray(exported)).toBe(true);
      expect(exported).toHaveLength(2);
      expect(exported[0]).toHaveProperty('entityType');
      expect(exported[0]).toHaveProperty('changeType');
    });

    it('should clear all changes', async () => {
      // * Add multiple changes
      deltaSyncService.trackCreate('project', { id: '1' });
      deltaSyncService.trackCreate('element', { id: '2' });
      deltaSyncService.trackDelete('template', 'template-1');

      expect(deltaSyncService.getChangeCount()).toBe(3);

      await deltaSyncService.clearAllChanges();

      expect(deltaSyncService.getChangeCount()).toBe(0);
      expect(deltaSyncService.hasPendingChanges()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty payload gracefully', () => {
      const payload = deltaSyncService.buildSyncPayload();

      expect(payload.changes).toEqual([]);
      expect(payload.checksum).toBeDefined();
    });

    it('should handle storage errors gracefully', async () => {
      // * Mock storage error
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      // * Should not throw
      expect(() => {
        deltaSyncService.trackCreate('project', { id: '1' });
      }).not.toThrow();

      // * Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should handle invalid data gracefully', () => {
      // * Track with undefined/null values
      expect(() => {
        deltaSyncService.trackUpdate('project', 'proj-1', ['field'], null, undefined);
      }).not.toThrow();

      const changes = deltaSyncService.getPendingChanges();
      expect(changes).toHaveLength(1);
    });

    it('should handle circular references in checksums', () => {
      const circular: any = { id: '1' };
      circular.self = circular;

      // * Should not throw on circular reference
      expect(() => {
        deltaSyncService.trackCreate('project', circular);
      }).not.toThrow();
    });
  });
});