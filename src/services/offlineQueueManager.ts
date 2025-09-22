/**
 * offlineQueueManager.ts
 * * Service for managing offline changes and queuing them for sync
 * * Handles retry logic, prioritization, and persistence
 * ! IMPORTANT: Ensures data isn't lost when working offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { deltaSyncService, DeltaChange } from './deltaSyncService';

// * Types for queue management
export interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'project' | 'element' | 'template';
  entityId: string;
  payload: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
  dependencies?: string[]; // * IDs of items that must sync first
  error?: string;
  lastAttempt?: Date;
}

export interface QueueConfig {
  maxRetries: number;
  retryDelay: number; // * milliseconds
  batchSize: number;
  priorityWeights: {
    high: number;
    normal: number;
    low: number;
  };
}

export interface SyncResult {
  successful: QueueItem[];
  failed: QueueItem[];
  retrying: QueueItem[];
}

// * Storage keys
const QUEUE_KEY = '@FantasyWritingApp:offlineQueue';
const FAILED_QUEUE_KEY = '@FantasyWritingApp:failedQueue';
const QUEUE_CONFIG_KEY = '@FantasyWritingApp:queueConfig';

class OfflineQueueManager {
  private queue: Map<string, QueueItem> = new Map();
  private failedQueue: Map<string, QueueItem> = new Map();
  private isProcessing: boolean = false;
  private isOnline: boolean = true;
  private config: QueueConfig = {
    maxRetries: 3,
    retryDelay: 5000,
    batchSize: 10,
    priorityWeights: {
      high: 3,
      normal: 2,
      low: 1,
    },
  };
  private listeners: Set<(queue: QueueItem[]) => void> = new Set();

  constructor() {
    this.initialize();
  }

  // * Initialize the queue manager
  private async initialize() {
    await this.loadConfig();
    await this.loadQueue();
    await this.loadFailedQueue();
    this.setupNetworkListener();
  }

  // * Setup network connectivity listener
  private setupNetworkListener() {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // * Auto-process queue when coming back online
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  // * Load configuration
  private async loadConfig() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_CONFIG_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading queue config:', error);
    }
  }

  // * Save configuration
  private async saveConfig() {
    try {
      await AsyncStorage.setItem(QUEUE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving queue config:', error);
    }
  }

  // * Load queue from storage
  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        this.queue = new Map(items.map((item: QueueItem) => [item.id, {
          ...item,
          timestamp: new Date(item.timestamp),
          lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
        }]));
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  // * Save queue to storage
  private async saveQueue() {
    try {
      const items = Array.from(this.queue.values());
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // * Load failed queue
  private async loadFailedQueue() {
    try {
      const stored = await AsyncStorage.getItem(FAILED_QUEUE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        this.failedQueue = new Map(items.map((item: QueueItem) => [item.id, {
          ...item,
          timestamp: new Date(item.timestamp),
          lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
        }]));
      }
    } catch (error) {
      console.error('Error loading failed queue:', error);
    }
  }

  // * Save failed queue
  private async saveFailedQueue() {
    try {
      const items = Array.from(this.failedQueue.values());
      await AsyncStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving failed queue:', error);
    }
  }

  // * Add item to queue
  public async enqueue(
    action: QueueItem['action'],
    entityType: QueueItem['entityType'],
    entityId: string,
    payload: any,
    priority: QueueItem['priority'] = 'normal',
    dependencies?: string[]
  ): Promise<string> {
    const item: QueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      payload,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority,
      dependencies,
    };

    // * Track in delta sync service
    switch (action) {
      case 'create':
        deltaSyncService.trackCreate(entityType, payload);
        break;
      case 'update':
        const fields = Object.keys(payload);
        deltaSyncService.trackUpdate(entityType, entityId, fields, {}, payload);
        break;
      case 'delete':
        deltaSyncService.trackDelete(entityType, entityId);
        break;
    }

    this.queue.set(item.id, item);
    await this.saveQueue();

    // * Try to process immediately if online
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }

    return item.id;
  }

  // * Process the queue
  public async processQueue(): Promise<SyncResult> {
    if (this.isProcessing || !this.isOnline) {
      return { successful: [], failed: [], retrying: [] };
    }

    this.isProcessing = true;
    const result: SyncResult = {
      successful: [],
      failed: [],
      retrying: [],
    };

    try {
      // * Get items sorted by priority and dependencies
      const sortedItems = this.getSortedQueueItems();
      const batch = sortedItems.slice(0, this.config.batchSize);

      for (const item of batch) {
        // * Check dependencies
        if (!this.areDependenciesSatisfied(item)) {
          continue;
        }

        try {
          // * Process the item
          await this.processItem(item);
          result.successful.push(item);
          this.queue.delete(item.id);
        } catch (error) {
          item.retryCount++;
          item.lastAttempt = new Date();
          item.error = error instanceof Error ? error.message : 'Unknown error';

          if (item.retryCount >= item.maxRetries) {
            // * Move to failed queue
            this.failedQueue.set(item.id, item);
            this.queue.delete(item.id);
            result.failed.push(item);
          } else {
            // * Keep in queue for retry
            result.retrying.push(item);
            // * Schedule retry
            setTimeout(() => {
              if (this.isOnline) {
                this.processQueue();
              }
            }, this.config.retryDelay * item.retryCount);
          }
        }
      }

      await this.saveQueue();
      await this.saveFailedQueue();
    } finally {
      this.isProcessing = false;
    }

    // * Continue processing if more items
    if (this.queue.size > 0 && this.isOnline) {
      setTimeout(() => this.processQueue(), 1000);
    }

    return result;
  }

  // * Process a single queue item
  private async processItem(item: QueueItem): Promise<void> {
    // * This is where you'd integrate with your actual sync API
    // * For now, this is a placeholder that simulates processing
    console.log(`Processing queue item: ${item.id}`, item);

    // * Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // * Simulate random success/failure for demonstration
        if (Math.random() > 0.2) {
          resolve();
        } else {
          reject(new Error('Simulated sync error'));
        }
      }, 500);
    });
  }

  // * Get sorted queue items
  private getSortedQueueItems(): QueueItem[] {
    const items = Array.from(this.queue.values());

    // * Sort by priority and timestamp
    return items.sort((a, b) => {
      // * Priority comparison
      const priorityDiff =
        this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // * Timestamp comparison (older first)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  // * Check if dependencies are satisfied
  private areDependenciesSatisfied(item: QueueItem): boolean {
    if (!item.dependencies || item.dependencies.length === 0) {
      return true;
    }

    // * Check if all dependencies are completed (not in queue)
    for (const depId of item.dependencies) {
      if (this.queue.has(depId)) {
        return false;
      }
    }

    return true;
  }

  // * Retry failed items
  public async retryFailed(): Promise<SyncResult> {
    const failedItems = Array.from(this.failedQueue.values());

    // * Reset retry count and move back to main queue
    for (const item of failedItems) {
      item.retryCount = 0;
      item.error = undefined;
      this.queue.set(item.id, item);
      this.failedQueue.delete(item.id);
    }

    await this.saveQueue();
    await this.saveFailedQueue();

    return this.processQueue();
  }

  // * Clear specific items
  public async clearItem(id: string) {
    this.queue.delete(id);
    this.failedQueue.delete(id);
    await this.saveQueue();
    await this.saveFailedQueue();
  }

  // * Clear all queues
  public async clearAll() {
    this.queue.clear();
    this.failedQueue.clear();
    await this.saveQueue();
    await this.saveFailedQueue();
  }

  // * Get queue status
  public getStatus() {
    return {
      pending: this.queue.size,
      failed: this.failedQueue.size,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
      items: Array.from(this.queue.values()),
      failedItems: Array.from(this.failedQueue.values()),
    };
  }

  // * Subscribe to queue changes
  public subscribe(callback: (queue: QueueItem[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // * Notify listeners
  private notifyListeners() {
    const items = Array.from(this.queue.values());
    this.listeners.forEach(listener => listener(items));
  }

  // * Update configuration
  public updateConfig(config: Partial<QueueConfig>) {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  // * Get configuration
  public getConfig(): QueueConfig {
    return { ...this.config };
  }

  // * Export queue for debugging
  public exportQueue() {
    return {
      queue: Array.from(this.queue.values()),
      failed: Array.from(this.failedQueue.values()),
      config: this.config,
    };
  }
}

// * Export singleton instance
export const offlineQueueManager = new OfflineQueueManager();

export default offlineQueueManager;