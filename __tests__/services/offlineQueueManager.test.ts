/**
 * @fileoverview Unit tests for offlineQueueManager
 * Tests offline queue management, retry logic, and prioritization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineQueueManager } from '../../src/services/offlineQueueManager';
import { deltaSyncService } from '../../src/services/deltaSyncService';
import type { QueueItem, QueueConfig } from '../../src/services/offlineQueueManager';

// * Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// * Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// * Mock deltaSyncService
jest.mock('../../src/services/deltaSyncService', () => ({
  deltaSyncService: {
    trackCreate: jest.fn(),
    trackUpdate: jest.fn(),
    trackDelete: jest.fn(),
  },
}));

describe('OfflineQueueManager', () => {
  let networkListener: ((state: NetInfoState) => void) | null = null;

  beforeEach(() => {
    // * Clear all mocks
    jest.clearAllMocks();

    // * Reset storage mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // * Mock network listener setup
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      networkListener = callback;
      return jest.fn(); // Return unsubscribe function
    });

    // * Default to online state
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  afterEach(() => {
    networkListener = null;
  });

  describe('Initialization', () => {
    it('should set up network listener on initialization', async () => {
      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should load configuration from storage', async () => {
      const storedConfig = {
        maxRetries: 5,
        retryDelay: 10000,
        batchSize: 20,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:queueConfig') {
          return JSON.stringify(storedConfig);
        }
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const config = offlineQueueManager.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.batchSize).toBe(20);
    });

    it('should load existing queue from storage', async () => {
      const storedQueue: QueueItem[] = [
        {
          id: 'stored-1',
          action: 'update',
          entityType: 'project',
          entityId: 'proj-1',
          payload: { name: 'Stored Project' },
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'normal',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:offlineQueue') {
          return JSON.stringify(storedQueue);
        }
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = offlineQueueManager.getStatus();
      expect(status.pending).toBe(1);
      expect(status.items[0].id).toBe('stored-1');
    });

    it('should load failed queue from storage', async () => {
      const failedQueue: QueueItem[] = [
        {
          id: 'failed-1',
          action: 'create',
          entityType: 'element',
          entityId: 'elem-1',
          payload: {},
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          priority: 'high',
          error: 'Network timeout',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:failedQueue') {
          return JSON.stringify(failedQueue);
        }
        return null;
      });

      // * Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = offlineQueueManager.getStatus();
      expect(status.failed).toBe(1);
      expect(status.failedItems[0].id).toBe('failed-1');
    });
  });

  describe('Queue Operations', () => {
    describe('enqueue', () => {
      it('should add items to queue with correct structure', async () => {
        const itemId = await offlineQueueManager.enqueue(
          'create',
          'project',
          'proj-1',
          { name: 'New Project' },
          'normal'
        );

        expect(itemId).toMatch(/^queue-\d+-[a-z0-9]{9}$/);

        const status = offlineQueueManager.getStatus();
        expect(status.pending).toBe(1);
        expect(status.items[0]).toMatchObject({
          action: 'create',
          entityType: 'project',
          entityId: 'proj-1',
          payload: { name: 'New Project' },
          priority: 'normal',
          retryCount: 0,
        });
      });

      it('should track changes in delta sync service', async () => {
        await offlineQueueManager.enqueue(
          'create',
          'element',
          'elem-1',
          { name: 'Character' },
          'high'
        );

        expect(deltaSyncService.trackCreate).toHaveBeenCalledWith(
          'element',
          { name: 'Character' }
        );
      });

      it('should handle update tracking with field detection', async () => {
        const payload = { name: 'Updated', description: 'New Desc' };
        await offlineQueueManager.enqueue(
          'update',
          'project',
          'proj-1',
          payload,
          'normal'
        );

        expect(deltaSyncService.trackUpdate).toHaveBeenCalledWith(
          'project',
          'proj-1',
          ['name', 'description'],
          {},
          payload
        );
      });

      it('should handle delete tracking', async () => {
        await offlineQueueManager.enqueue(
          'delete',
          'template',
          'template-1',
          null,
          'low'
        );

        expect(deltaSyncService.trackDelete).toHaveBeenCalledWith(
          'template',
          'template-1'
        );
      });

      it('should save queue to storage', async () => {
        await offlineQueueManager.enqueue(
          'create',
          'project',
          'proj-1',
          { name: 'Test' }
        );

        // * Wait for async save
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@FantasyWritingApp:offlineQueue',
          expect.stringContaining('proj-1')
        );
      });

      it('should handle dependencies correctly', async () => {
        const parentId = await offlineQueueManager.enqueue(
          'create',
          'project',
          'proj-1',
          { name: 'Parent' }
        );

        const childId = await offlineQueueManager.enqueue(
          'create',
          'element',
          'elem-1',
          { projectId: 'proj-1' },
          'normal',
          [parentId]
        );

        const status = offlineQueueManager.getStatus();
        const childItem = status.items.find(item => item.id === childId);

        expect(childItem?.dependencies).toContain(parentId);
      });
    });

    describe('processQueue', () => {
      it('should process queue items in priority order', async () => {
        // * Add items with different priorities
        await offlineQueueManager.enqueue('update', 'element', 'low-1', {}, 'low');
        await offlineQueueManager.enqueue('create', 'project', 'high-1', {}, 'high');
        await offlineQueueManager.enqueue('update', 'element', 'normal-1', {}, 'normal');

        const result = await offlineQueueManager.processQueue();

        // * High priority should be processed first
        expect(result.successful[0].priority).toBe('high');
      });

      it('should respect batch size configuration', async () => {
        // * Update config
        offlineQueueManager.updateConfig({ batchSize: 2 });

        // * Add more items than batch size
        for (let i = 0; i < 5; i++) {
          await offlineQueueManager.enqueue(
            'create',
            'element',
            `elem-${i}`,
            { name: `Element ${i}` }
          );
        }

        const result = await offlineQueueManager.processQueue();

        // * Should only process batch size items
        expect(result.successful.length + result.failed.length + result.retrying.length).toBeLessThanOrEqual(2);
      });

      it('should handle failed items with retry', async () => {
        // * Add item that will fail
        const itemId = await offlineQueueManager.enqueue(
          'create',
          'project',
          'fail-proj',
          { willFail: true }
        );

        // * Mock processItem to fail
        const originalProcessItem = (offlineQueueManager as any).processItem;
        (offlineQueueManager as any).processItem = jest.fn()
          .mockRejectedValue(new Error('Network error'));

        const result = await offlineQueueManager.processQueue();

        // * Restore original method
        (offlineQueueManager as any).processItem = originalProcessItem;

        expect(result.retrying).toHaveLength(1);
        expect(result.retrying[0].retryCount).toBe(1);
      });

      it('should move items to failed queue after max retries', async () => {
        // * Create item at max retries
        const itemId = await offlineQueueManager.enqueue(
          'create',
          'element',
          'elem-fail',
          {}
        );

        // * Get the item and set it to max retries
        const status = offlineQueueManager.getStatus();
        const item = status.items[0];
        item.retryCount = item.maxRetries - 1;

        // * Mock processItem to fail
        (offlineQueueManager as any).processItem = jest.fn()
          .mockRejectedValue(new Error('Permanent failure'));

        await offlineQueueManager.processQueue();

        const newStatus = offlineQueueManager.getStatus();
        expect(newStatus.failed).toBe(1);
        expect(newStatus.pending).toBe(0);
      });

      it('should not process when already processing', async () => {
        // * Start first process
        const firstProcess = offlineQueueManager.processQueue();

        // * Try to start second process
        const secondProcess = offlineQueueManager.processQueue();

        const [firstResult, secondResult] = await Promise.all([firstProcess, secondProcess]);

        // * Second should return empty result
        expect(secondResult.successful).toHaveLength(0);
        expect(secondResult.failed).toHaveLength(0);
        expect(secondResult.retrying).toHaveLength(0);
      });

      it('should not process when offline', async () => {
        // * Simulate offline state
        if (networkListener) {
          networkListener({ isConnected: false } as NetInfoState);
        }

        await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

        const result = await offlineQueueManager.processQueue();

        expect(result.successful).toHaveLength(0);
      });

      it('should check dependencies before processing', async () => {
        const parentId = await offlineQueueManager.enqueue(
          'create',
          'project',
          'parent',
          {}
        );

        const childId = await offlineQueueManager.enqueue(
          'create',
          'element',
          'child',
          {},
          'normal',
          [parentId]
        );

        // * Mock processItem to track call order
        const processedOrder: string[] = [];
        (offlineQueueManager as any).processItem = jest.fn()
          .mockImplementation((item: QueueItem) => {
            processedOrder.push(item.entityId);
            return Promise.resolve();
          });

        await offlineQueueManager.processQueue();

        // * Parent should be processed before child
        expect(processedOrder.indexOf('parent')).toBeLessThan(processedOrder.indexOf('child'));
      });
    });

    describe('retryFailed', () => {
      it('should reset retry counts and move back to queue', async () => {
        // * Create failed items
        const failedItem: QueueItem = {
          id: 'failed-1',
          action: 'update',
          entityType: 'project',
          entityId: 'proj-1',
          payload: {},
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          priority: 'normal',
          error: 'Previous failure',
        };

        // * Add to failed queue directly
        (offlineQueueManager as any).failedQueue.set(failedItem.id, failedItem);

        await offlineQueueManager.retryFailed();

        const status = offlineQueueManager.getStatus();
        expect(status.failed).toBe(0);
        expect(status.pending).toBeGreaterThan(0);

        const retriedItem = status.items.find(item => item.id === 'failed-1');
        expect(retriedItem?.retryCount).toBe(0);
        expect(retriedItem?.error).toBeUndefined();
      });
    });
  });

  describe('Network Handling', () => {
    it('should detect network changes', async () => {
      // * Start online
      expect(offlineQueueManager.getStatus().isOnline).toBe(true);

      // * Go offline
      if (networkListener) {
        networkListener({ isConnected: false } as NetInfoState);
      }

      expect(offlineQueueManager.getStatus().isOnline).toBe(false);

      // * Come back online
      if (networkListener) {
        networkListener({ isConnected: true } as NetInfoState);
      }

      expect(offlineQueueManager.getStatus().isOnline).toBe(true);
    });

    it('should auto-process queue when coming online', async () => {
      // * Add items while offline
      if (networkListener) {
        networkListener({ isConnected: false } as NetInfoState);
      }

      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

      // * Mock processQueue
      const processQueueSpy = jest.spyOn(offlineQueueManager, 'processQueue');

      // * Come back online
      if (networkListener) {
        networkListener({ isConnected: true } as NetInfoState);
      }

      // * Should trigger processing
      expect(processQueueSpy).toHaveBeenCalled();
    });
  });

  describe('Queue Management', () => {
    describe('clearItem', () => {
      it('should remove specific item from queue', async () => {
        const itemId = await offlineQueueManager.enqueue(
          'create',
          'project',
          'proj-1',
          {}
        );

        await offlineQueueManager.clearItem(itemId);

        const status = offlineQueueManager.getStatus();
        expect(status.pending).toBe(0);
        expect(status.items.find(item => item.id === itemId)).toBeUndefined();
      });

      it('should remove item from failed queue', async () => {
        // * Add to failed queue
        const failedItem: QueueItem = {
          id: 'failed-clear',
          action: 'update',
          entityType: 'element',
          entityId: 'elem-1',
          payload: {},
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          priority: 'normal',
        };

        (offlineQueueManager as any).failedQueue.set(failedItem.id, failedItem);

        await offlineQueueManager.clearItem('failed-clear');

        const status = offlineQueueManager.getStatus();
        expect(status.failed).toBe(0);
      });

      it('should save after clearing', async () => {
        const itemId = await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

        jest.clearAllMocks();

        await offlineQueueManager.clearItem(itemId);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@FantasyWritingApp:offlineQueue',
          expect.any(String)
        );
      });
    });

    describe('clearAll', () => {
      it('should clear all queues', async () => {
        // * Add items to both queues
        await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});
        await offlineQueueManager.enqueue('update', 'element', 'elem-1', {});

        // * Add to failed queue
        const failedItem: QueueItem = {
          id: 'failed-1',
          action: 'delete',
          entityType: 'template',
          entityId: 'template-1',
          payload: {},
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          priority: 'low',
        };
        (offlineQueueManager as any).failedQueue.set(failedItem.id, failedItem);

        await offlineQueueManager.clearAll();

        const status = offlineQueueManager.getStatus();
        expect(status.pending).toBe(0);
        expect(status.failed).toBe(0);
        expect(status.items).toHaveLength(0);
        expect(status.failedItems).toHaveLength(0);
      });

      it('should save empty queues', async () => {
        await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

        jest.clearAllMocks();

        await offlineQueueManager.clearAll();

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@FantasyWritingApp:offlineQueue',
          '[]'
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@FantasyWritingApp:failedQueue',
          '[]'
        );
      });
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig: Partial<QueueConfig> = {
        maxRetries: 5,
        retryDelay: 10000,
        batchSize: 20,
        priorityWeights: {
          high: 5,
          normal: 3,
          low: 1,
        },
      };

      offlineQueueManager.updateConfig(newConfig);

      const config = offlineQueueManager.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.retryDelay).toBe(10000);
      expect(config.batchSize).toBe(20);
      expect(config.priorityWeights.high).toBe(5);
    });

    it('should save configuration changes', async () => {
      jest.clearAllMocks();

      offlineQueueManager.updateConfig({ maxRetries: 7 });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@FantasyWritingApp:queueConfig',
        expect.stringContaining('"maxRetries":7')
      );
    });

    it('should not modify original config object', () => {
      const config1 = offlineQueueManager.getConfig();
      config1.maxRetries = 999;

      const config2 = offlineQueueManager.getConfig();
      expect(config2.maxRetries).not.toBe(999);
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers on queue changes', async () => {
      const listener = jest.fn();
      const unsubscribe = offlineQueueManager.subscribe(listener);

      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

      // * Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            entityId: 'proj-1',
          }),
        ])
      );

      unsubscribe();
    });

    it('should allow unsubscribe', async () => {
      const listener = jest.fn();
      const unsubscribe = offlineQueueManager.subscribe(listener);

      unsubscribe();

      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

      // * Wait to ensure no notification
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      offlineQueueManager.subscribe(listener1);
      offlineQueueManager.subscribe(listener2);

      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

      // * Wait for notifications
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Export and Debug', () => {
    it('should export queue for debugging', async () => {
      // * Add various items
      await offlineQueueManager.enqueue('create', 'project', 'proj-1', { name: 'Project' });
      await offlineQueueManager.enqueue('update', 'element', 'elem-1', { status: 'active' });

      // * Add failed item
      const failedItem: QueueItem = {
        id: 'failed-export',
        action: 'delete',
        entityType: 'template',
        entityId: 'template-1',
        payload: {},
        timestamp: new Date(),
        retryCount: 3,
        maxRetries: 3,
        priority: 'low',
        error: 'Export test',
      };
      (offlineQueueManager as any).failedQueue.set(failedItem.id, failedItem);

      const exported = offlineQueueManager.exportQueue();

      expect(exported).toHaveProperty('queue');
      expect(exported).toHaveProperty('failed');
      expect(exported).toHaveProperty('config');
      expect(exported.queue).toHaveLength(2);
      expect(exported.failed).toHaveLength(1);
      expect(exported.config).toHaveProperty('maxRetries');
    });
  });

  describe('Edge Cases', () => {
    it('should handle storage errors gracefully', async () => {
      // * Mock storage error
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      // * Should not throw
      await expect(
        offlineQueueManager.enqueue('create', 'project', 'proj-1', {})
      ).resolves.toMatch(/^queue-/);
    });

    it('should handle missing network module', async () => {
      // * Remove network listener
      networkListener = null;

      // * Should still work without network detection
      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});

      const status = offlineQueueManager.getStatus();
      expect(status.pending).toBe(1);
    });

    it('should handle corrupt storage data', async () => {
      // * Mock corrupt data
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@FantasyWritingApp:offlineQueue') {
          return 'corrupt-json-{invalid}';
        }
        return null;
      });

      // * Should not crash on initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // * Should still be functional
      await offlineQueueManager.enqueue('create', 'project', 'proj-1', {});
      const status = offlineQueueManager.getStatus();
      expect(status.pending).toBeGreaterThan(0);
    });

    it('should handle circular dependencies gracefully', async () => {
      const item1 = await offlineQueueManager.enqueue(
        'create',
        'project',
        'proj-1',
        {},
        'normal',
        ['queue-2'] // Depends on item that doesn't exist yet
      );

      const item2 = await offlineQueueManager.enqueue(
        'create',
        'project',
        'proj-2',
        {},
        'normal',
        [item1] // Circular dependency
      );

      // * Should handle processing without infinite loop
      const result = await offlineQueueManager.processQueue();

      // * Should process at least one item
      expect(result.successful.length).toBeGreaterThan(0);
    });

    it('should handle extremely large queues', async () => {
      // * Add many items
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          offlineQueueManager.enqueue(
            'create',
            'element',
            `elem-${i}`,
            { index: i }
          )
        );
      }

      await Promise.all(promises);

      const status = offlineQueueManager.getStatus();
      expect(status.pending).toBe(100);

      // * Should handle export without issues
      const exported = offlineQueueManager.exportQueue();
      expect(exported.queue).toHaveLength(100);
    });
  });
});