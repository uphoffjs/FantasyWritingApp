/**
 * SyncQueueStatus.tsx
 * * Enhanced sync status component with visual feedback and conflict resolution
 * * Displays sync queue, offline status, and handles conflicts
 * ! IMPORTANT: Critical for data integrity and user experience
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../providers/ThemeProvider';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { ContentReveal } from './animations/ContentReveal';

// * Types for sync queue items
export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'element' | 'template';
  entityId: string;
  entityName: string;
  timestamp: Date;
  retryCount: number;
  error?: string;
  conflictData?: {
    localVersion: any;
    remoteVersion: any;
    conflictType: 'version' | 'delete' | 'merge';
  };
}

interface SyncQueueStatusProps {
  // * Position on screen
  position?: 'top' | 'bottom' | 'floating';
  // * Compact mode for minimal UI
  compact?: boolean;
  // * Auto-hide after successful sync
  autoHide?: boolean;
  // * Auto-hide delay in ms
  autoHideDelay?: number;
  // * Show detailed queue items
  showDetails?: boolean;
  // * Enable conflict resolution UI
  enableConflictResolution?: boolean;
  // * Test ID for testing
  testID?: string;
}

export const SyncQueueStatus: React.FC<SyncQueueStatusProps> = ({
  position = 'bottom',
  compact = false,
  autoHide = true,
  autoHideDelay = 3000,
  showDetails = false,
  enableConflictResolution = true,
  testID = 'sync-queue-status',
}) => {
  const { theme } = useTheme();
  const { manualSync, lastSyncAttempt } = useSupabaseSync();
  const { syncMetadata, projects } = useWorldbuildingStore();

  // * State
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [conflicts, setConflicts] = useState<SyncQueueItem[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<SyncQueueItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // * Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // * Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // * Build sync queue from metadata
  useEffect(() => {
    const queue: SyncQueueItem[] = [];
    const conflictItems: SyncQueueItem[] = [];

    Object.values(syncMetadata).forEach(metadata => {
      if (metadata.syncStatus === 'offline' || metadata.syncStatus === 'error') {
        const project = projects.find(p => p.id === metadata.projectId);
        if (project) {
          const queueItem: SyncQueueItem = {
            id: `sync-${metadata.projectId}`,
            type: metadata.cloudId ? 'update' : 'create',
            entity: 'project',
            entityId: metadata.projectId,
            entityName: project.name,
            timestamp: metadata.lastModified || new Date(),
            retryCount: 0,
          };

          if (metadata.syncStatus === 'error') {
            queueItem.error = 'Sync failed';
          }

          queue.push(queueItem);
        }
      }
    });

    setSyncQueue(queue);
    setConflicts(conflictItems);
  }, [syncMetadata, projects]);

  // * Auto-hide logic
  useEffect(() => {
    if (autoHide && syncQueue.length === 0 && !isSyncing && !syncError) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [syncQueue.length, isSyncing, syncError, autoHide, autoHideDelay]);

  // * Sync animation
  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isSyncing]);

  // * Handle manual sync
  const handleSync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('No internet connection');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await manualSync();

      // * Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      setSyncError('Sync failed. Please try again.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, manualSync]);

  // * Handle conflict resolution
  const handleResolveConflict = useCallback((conflict: SyncQueueItem, resolution: 'local' | 'remote' | 'merge') => {
    // TODO: Implement actual conflict resolution logic
    setConflicts(prev => prev.filter(c => c.id !== conflict.id));
    setShowConflictModal(false);
    setSelectedConflict(null);

    // * Trigger sync after resolution
    handleSync();
  }, [handleSync]);

  // * Get status color
  const getStatusColor = () => {
    if (syncError) return theme.colors.semantic.danger;
    if (!isOnline) return theme.colors.text.secondary;
    if (isSyncing) return theme.colors.accent.swiftness;
    if (syncQueue.length > 0) return theme.colors.semantic.dragonfire;
    if (conflicts.length > 0) return theme.colors.semantic.danger;
    return theme.colors.accent.vitality;
  };

  // * Get status text
  const getStatusText = () => {
    if (!isOnline) return 'Offline Mode';
    if (isSyncing) return 'Syncing...';
    if (syncError) return 'Sync Error';
    if (conflicts.length > 0) return `${conflicts.length} Conflict${conflicts.length > 1 ? 's' : ''}`;
    if (syncQueue.length > 0) return `${syncQueue.length} Pending`;
    return 'All Synced';
  };

  // * Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // * Render compact mode
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: theme.colors.surface.card,
            borderColor: getStatusColor(),
          },
          position === 'floating' && styles.floating,
        ]}
        testID={testID}
      >
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.compactContent}
          testID={`${testID}-toggle`}
        >
          <View style={styles.statusIndicator}>
            {isSyncing ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Text style={styles.syncIcon}>🔄</Text>
              </Animated.View>
            ) : !isOnline ? (
              <Text style={styles.statusIcon}>📴</Text>
            ) : syncQueue.length > 0 ? (
              <Text style={styles.statusIcon}>📤</Text>
            ) : conflicts.length > 0 ? (
              <Text style={styles.statusIcon}>⚠️</Text>
            ) : (
              <Text style={styles.statusIcon}>✅</Text>
            )}
          </View>

          <Text
            style={[styles.statusText, { color: theme.colors.text.primary }]}
            testID={`${testID}-status-text`}
          >
            {getStatusText()}
          </Text>

          {syncQueue.length > 0 && !isSyncing && isOnline && (
            <TouchableOpacity
              onPress={handleSync}
              style={[styles.syncButton, { backgroundColor: theme.colors.primary.DEFAULT }]}
              testID={`${testID}-sync-button`}
            >
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // * Render full mode
  return (
    <ContentReveal animation="fade">
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            backgroundColor: theme.colors.surface.card,
          },
          position === 'floating' && styles.floating,
        ]}
        testID={testID}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.primary.borderLight }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Sync Status
            </Text>
          </View>

          <View style={styles.headerRight}>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>OFFLINE</Text>
              </View>
            )}

            {isOnline && !isSyncing && (syncQueue.length > 0 || syncError) && (
              <TouchableOpacity
                onPress={handleSync}
                style={[styles.syncButton, { backgroundColor: theme.colors.primary.DEFAULT }]}
                testID={`${testID}-sync-button`}
              >
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </TouchableOpacity>
            )}

            {isSyncing && (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary.DEFAULT}
                testID={`${testID}-spinner`}
              />
            )}
          </View>
        </View>

        {/* Error Message */}
        {syncError && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.semantic.danger + '20' }]}>
            <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
              {syncError}
            </Text>
            <TouchableOpacity onPress={handleSync} testID={`${testID}-retry`}>
              <Text style={[styles.retryText, { color: theme.colors.semantic.danger }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && enableConflictResolution && (
          <View style={[styles.conflictsContainer, { backgroundColor: theme.colors.semantic.dragonfire + '10' }]}>
            <Text style={[styles.conflictsTitle, { color: theme.colors.semantic.dragonfire }]}>
              ⚠️ Conflicts Detected
            </Text>
            {conflicts.map(conflict => (
              <TouchableOpacity
                key={conflict.id}
                onPress={() => {
                  setSelectedConflict(conflict);
                  setShowConflictModal(true);
                }}
                style={styles.conflictItem}
                testID={`${testID}-conflict-${conflict.id}`}
              >
                <Text style={[styles.conflictName, { color: theme.colors.text.primary }]}>
                  {conflict.entityName}
                </Text>
                <Text style={[styles.conflictType, { color: theme.colors.text.secondary }]}>
                  {conflict.conflictData?.conflictType || 'Version conflict'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Queue Items */}
        {showDetails && syncQueue.length > 0 && (
          <ScrollView style={styles.queueContainer}>
            {syncQueue.map(item => (
              <View
                key={item.id}
                style={[styles.queueItem, { borderBottomColor: theme.colors.primary.borderLight }]}
                testID={`${testID}-queue-item-${item.id}`}
              >
                <View style={styles.queueItemLeft}>
                  <Text style={[styles.queueItemName, { color: theme.colors.text.primary }]}>
                    {item.entityName}
                  </Text>
                  <Text style={[styles.queueItemMeta, { color: theme.colors.text.secondary }]}>
                    {item.type} • {formatRelativeTime(item.timestamp)}
                  </Text>
                </View>

                {item.error && (
                  <Text style={[styles.queueItemError, { color: theme.colors.semantic.danger }]}>
                    Failed
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Last Sync */}
        {lastSyncAttempt && (
          <View style={[styles.footer, { borderTopColor: theme.colors.primary.borderLight }]}>
            <Text style={[styles.lastSyncText, { color: theme.colors.text.secondary }]}>
              Last sync: {formatRelativeTime(lastSyncAttempt)}
            </Text>
          </View>
        )}

        {/* Conflict Resolution Modal */}
        {showConflictModal && selectedConflict && (
          <Modal
            visible={showConflictModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowConflictModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface.card }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                  Resolve Conflict
                </Text>

                <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
                  {selectedConflict.entityName} has conflicting changes
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => handleResolveConflict(selectedConflict, 'local')}
                    style={[styles.modalButton, { backgroundColor: theme.colors.accent.vitality }]}
                    testID={`${testID}-keep-local`}
                  >
                    <Text style={styles.modalButtonText}>Keep Local</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleResolveConflict(selectedConflict, 'remote')}
                    style={[styles.modalButton, { backgroundColor: theme.colors.accent.swiftness }]}
                    testID={`${testID}-keep-remote`}
                  >
                    <Text style={styles.modalButtonText}>Keep Remote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowConflictModal(false)}
                    style={[styles.modalButton, { backgroundColor: theme.colors.text.secondary }]}
                    testID={`${testID}-cancel`}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </Animated.View>
    </ContentReveal>
  );
};

const styles = StyleSheet.create({
  // * Container styles
  container: {
    borderRadius: 8,
    margin: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      } as any,
    }),
  },

  compactContainer: {
    borderRadius: 20,
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },

  floating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },

  // * Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // * Compact styles
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIndicator: {
    marginRight: 8,
  },

  syncIcon: {
    fontSize: 16,
  },

  statusIcon: {
    fontSize: 16,
  },

  statusText: {
    fontSize: 14,
    flex: 1,
  },

  // * Sync button
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // * Offline badge
  offlineBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  offlineText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // * Error styles
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },

  errorText: {
    fontSize: 14,
    flex: 1,
  },

  retryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },

  // * Conflicts styles
  conflictsContainer: {
    padding: 12,
  },

  conflictsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  conflictItem: {
    paddingVertical: 8,
  },

  conflictName: {
    fontSize: 14,
  },

  conflictType: {
    fontSize: 12,
    marginTop: 2,
  },

  // * Queue styles
  queueContainer: {
    maxHeight: 200,
  },

  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },

  queueItemLeft: {
    flex: 1,
  },

  queueItemName: {
    fontSize: 14,
  },

  queueItemMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  queueItemError: {
    fontSize: 12,
    fontWeight: '600',
  },

  // * Footer styles
  footer: {
    padding: 8,
    borderTopWidth: 1,
  },

  lastSyncText: {
    fontSize: 12,
    textAlign: 'center',
  },

  // * Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
  },

  modalActions: {
    gap: 8,
  },

  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SyncQueueStatus;