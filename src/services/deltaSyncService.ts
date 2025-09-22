/**
 * deltaSyncService.ts
 * * Service for efficient delta syncing - only sync changes, not full data
 * * Tracks changes and creates minimal update payloads
 * ! IMPORTANT: Critical for performance and bandwidth optimization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, WorldElement, Template } from '../types/models';

// * Types for tracking changes
export interface DeltaChange {
  id: string;
  entityType: 'project' | 'element' | 'template';
  entityId: string;
  changeType: 'create' | 'update' | 'delete';
  timestamp: Date;
  fields?: string[]; // * Specific fields that changed (for updates)
  oldValue?: any; // * Previous value (for conflict resolution)
  newValue?: any; // * New value
  checksum?: string; // * For integrity verification
}

export interface DeltaSyncPayload {
  changes: DeltaChange[];
  lastSyncTimestamp: Date;
  deviceId: string;
  checksum: string;
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge' | 'manual';
  resolver?: (local: any, remote: any) => any;
}

// * Storage keys
const DELTA_CHANGES_KEY = '@FantasyWritingApp:deltaChanges';
const LAST_SYNC_TIMESTAMP_KEY = '@FantasyWritingApp:lastSyncTimestamp';
const DEVICE_ID_KEY = '@FantasyWritingApp:deviceId';

class DeltaSyncService {
  private changes: Map<string, DeltaChange> = new Map();
  private deviceId: string = '';
  private lastSyncTimestamp: Date | null = null;

  constructor() {
    this.initialize();
  }

  // * Initialize the service
  private async initialize() {
    await this.loadDeviceId();
    await this.loadChanges();
    await this.loadLastSyncTimestamp();
  }

  // * Load or generate device ID
  private async loadDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      this.deviceId = deviceId;
    } catch (error) {
      console.error('Error loading device ID:', error);
      this.deviceId = this.generateDeviceId();
    }
  }

  // * Generate unique device ID
  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // * Load pending changes from storage
  private async loadChanges() {
    try {
      const stored = await AsyncStorage.getItem(DELTA_CHANGES_KEY);
      if (stored) {
        const changes = JSON.parse(stored);
        this.changes = new Map(changes.map((c: DeltaChange) => [c.id, c]));
      }
    } catch (error) {
      console.error('Error loading delta changes:', error);
    }
  }

  // * Save changes to storage
  private async saveChanges() {
    try {
      const changes = Array.from(this.changes.values());
      await AsyncStorage.setItem(DELTA_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error('Error saving delta changes:', error);
    }
  }

  // * Load last sync timestamp
  private async loadLastSyncTimestamp() {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
      if (timestamp) {
        this.lastSyncTimestamp = new Date(timestamp);
      }
    } catch (error) {
      console.error('Error loading last sync timestamp:', error);
    }
  }

  // * Save last sync timestamp
  private async saveLastSyncTimestamp(timestamp: Date) {
    try {
      this.lastSyncTimestamp = timestamp;
      await AsyncStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, timestamp.toISOString());
    } catch (error) {
      console.error('Error saving last sync timestamp:', error);
    }
  }

  // * Track a create operation
  public trackCreate(entityType: 'project' | 'element' | 'template', entity: any) {
    const change: DeltaChange = {
      id: `${entityType}-create-${entity.id}-${Date.now()}`,
      entityType,
      entityId: entity.id,
      changeType: 'create',
      timestamp: new Date(),
      newValue: entity,
      checksum: this.calculateChecksum(entity),
    };

    this.changes.set(change.id, change);
    this.saveChanges();
  }

  // * Track an update operation
  public trackUpdate(
    entityType: 'project' | 'element' | 'template',
    entityId: string,
    fields: string[],
    oldValue: any,
    newValue: any
  ) {
    // * Check if we already have a pending change for this entity
    const existingChange = this.findExistingChange(entityType, entityId);

    if (existingChange) {
      // * Merge with existing change
      if (existingChange.changeType === 'create') {
        // * If it was created locally, just update the newValue
        existingChange.newValue = { ...existingChange.newValue, ...newValue };
        existingChange.timestamp = new Date();
        existingChange.checksum = this.calculateChecksum(existingChange.newValue);
      } else if (existingChange.changeType === 'update') {
        // * Merge the field changes
        existingChange.fields = [...new Set([...(existingChange.fields || []), ...fields])];
        existingChange.newValue = { ...existingChange.newValue, ...newValue };
        existingChange.timestamp = new Date();
        existingChange.checksum = this.calculateChecksum(existingChange.newValue);
      }
    } else {
      // * Create new change
      const change: DeltaChange = {
        id: `${entityType}-update-${entityId}-${Date.now()}`,
        entityType,
        entityId,
        changeType: 'update',
        timestamp: new Date(),
        fields,
        oldValue,
        newValue,
        checksum: this.calculateChecksum(newValue),
      };

      this.changes.set(change.id, change);
    }

    this.saveChanges();
  }

  // * Track a delete operation
  public trackDelete(entityType: 'project' | 'element' | 'template', entityId: string) {
    // * Remove any pending creates/updates for this entity
    const existingChange = this.findExistingChange(entityType, entityId);

    if (existingChange) {
      if (existingChange.changeType === 'create') {
        // * If it was created locally and then deleted, just remove it
        this.changes.delete(existingChange.id);
        this.saveChanges();
        return;
      }
      // * Remove the update change
      this.changes.delete(existingChange.id);
    }

    // * Add delete change
    const change: DeltaChange = {
      id: `${entityType}-delete-${entityId}-${Date.now()}`,
      entityType,
      entityId,
      changeType: 'delete',
      timestamp: new Date(),
    };

    this.changes.set(change.id, change);
    this.saveChanges();
  }

  // * Find existing change for an entity
  private findExistingChange(entityType: string, entityId: string): DeltaChange | undefined {
    for (const change of this.changes.values()) {
      if (change.entityType === entityType && change.entityId === entityId) {
        return change;
      }
    }
    return undefined;
  }

  // * Calculate checksum for data integrity
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // * Get pending changes for sync
  public getPendingChanges(): DeltaChange[] {
    return Array.from(this.changes.values()).sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  // * Build sync payload
  public buildSyncPayload(): DeltaSyncPayload {
    const changes = this.getPendingChanges();
    const payload: DeltaSyncPayload = {
      changes,
      lastSyncTimestamp: this.lastSyncTimestamp || new Date(0),
      deviceId: this.deviceId,
      checksum: this.calculateChecksum(changes),
    };
    return payload;
  }

  // * Apply remote changes
  public async applyRemoteChanges(
    remoteChanges: DeltaChange[],
    conflictResolution: ConflictResolution = { strategy: 'remote' }
  ): Promise<{ applied: DeltaChange[]; conflicts: DeltaChange[] }> {
    const applied: DeltaChange[] = [];
    const conflicts: DeltaChange[] = [];

    for (const remoteChange of remoteChanges) {
      const localChange = this.findExistingChange(
        remoteChange.entityType,
        remoteChange.entityId
      );

      if (localChange) {
        // * Conflict detected
        const resolution = await this.resolveConflict(
          localChange,
          remoteChange,
          conflictResolution
        );

        if (resolution) {
          applied.push(resolution);
        } else {
          conflicts.push(remoteChange);
        }
      } else {
        // * No conflict, apply remote change
        applied.push(remoteChange);
      }
    }

    return { applied, conflicts };
  }

  // * Resolve conflicts between local and remote changes
  private async resolveConflict(
    local: DeltaChange,
    remote: DeltaChange,
    resolution: ConflictResolution
  ): Promise<DeltaChange | null> {
    switch (resolution.strategy) {
      case 'local':
        return local;

      case 'remote':
        return remote;

      case 'merge':
        if (resolution.resolver) {
          const merged = resolution.resolver(local.newValue, remote.newValue);
          return {
            ...remote,
            newValue: merged,
            checksum: this.calculateChecksum(merged),
          };
        }
        // * Default merge: combine fields
        if (local.changeType === 'update' && remote.changeType === 'update') {
          return {
            ...remote,
            newValue: { ...local.newValue, ...remote.newValue },
            fields: [...new Set([...(local.fields || []), ...(remote.fields || [])])],
            checksum: this.calculateChecksum({ ...local.newValue, ...remote.newValue }),
          };
        }
        return remote;

      case 'manual':
        // * Return null to indicate manual resolution needed
        return null;

      default:
        return remote;
    }
  }

  // * Clear changes after successful sync
  public clearSyncedChanges(syncedChangeIds: string[]) {
    for (const id of syncedChangeIds) {
      this.changes.delete(id);
    }
    this.saveChanges();
    this.saveLastSyncTimestamp(new Date());
  }

  // * Get change count
  public getChangeCount(): number {
    return this.changes.size;
  }

  // * Check if there are pending changes
  public hasPendingChanges(): boolean {
    return this.changes.size > 0;
  }

  // * Export changes for debugging
  public exportChanges(): DeltaChange[] {
    return Array.from(this.changes.values());
  }

  // * Clear all changes (use with caution)
  public async clearAllChanges() {
    this.changes.clear();
    await this.saveChanges();
  }
}

// * Export singleton instance
export const deltaSyncService = new DeltaSyncService();

export default deltaSyncService;