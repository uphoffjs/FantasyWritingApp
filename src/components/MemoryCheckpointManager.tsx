/* eslint-disable react-native/no-color-literals */
/**
 * Memory Checkpoint Manager
 *
 * Advanced UI for managing memory checkpoints
 * Provides detailed view and restore capabilities
 *
 * ! Note: This is a utility/debug component with custom styling
 */

import React, { useState } from 'react';
import { fantasyTomeColors } from '../constants/fantasyTomeColors';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useMemoryStore, memoryHelpers } from '../store/memoryStore';

import { getTestProps } from '../utils/react-native-web-polyfills';
export const MemoryCheckpointManager: React.FC = () => {
  const store = useMemoryStore();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);

  const handleRestore = (checkpointId: string) => {
    Alert.alert(
      'Confirm Restore',
      'This will restore the selected checkpoint. Current unsaved changes will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            try {
              memoryHelpers.restore(checkpointId);
              Alert.alert('Success', 'Checkpoint restored successfully');
              setIsVisible(false);
            } catch (error) {
              Alert.alert('Error', `Failed to restore: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleDelete = (checkpointId: string) => {
    Alert.alert(
      'Delete Checkpoint',
      'Are you sure you want to delete this checkpoint?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            store.deleteCheckpoint(checkpointId);
            Alert.alert('Deleted', 'Checkpoint deleted successfully');
          }
        }
      ]
    );
  };

  const handleExport = (checkpointId: string) => {
    try {
      const data = store.exportCheckpoint(checkpointId);
      // ! In a real app, you'd save this to a file or share it
      // * For now, we'll just show it in an alert (truncated)
      Alert.alert(
        'Export Data',
        data.substring(0, 200) + '...\n\n(Full data logged to console)',
        [{ text: 'OK' }]
      );
      console.log('Exported checkpoint data:', data);
    } catch (error) {
      Alert.alert('Error', `Failed to export: ${error.message}`);
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getCheckpointDetails = (checkpointId: string) => {
    const checkpoint = store.checkpoints.find(c => c.id === checkpointId);
    if (!checkpoint) return null;

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Checkpoint Details</Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Name:</Text> {checkpoint.name}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Created:</Text> {formatTimestamp(checkpoint.timestamp)}
        </Text>
        {checkpoint.description && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Description:</Text> {checkpoint.description}
          </Text>
        )}
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Completed Tasks:</Text> {checkpoint.state.completedTasks.length}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Pending Tasks:</Text> {checkpoint.state.pendingTasks.length}
        </Text>
        {checkpoint.state.blockedTasks && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Blocked Tasks:</Text> {checkpoint.state.blockedTasks.length}
          </Text>
        )}
      </View>
    );
  };

  if (__DEV__ === false) {
    return null;
  }

  return (
    <>
      {/* Floating button to open manager */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
        {...getTestProps('open-checkpoint-manager')}
      >
        <Text style={styles.floatingButtonText}>💾</Text>
      </TouchableOpacity>

      {/* Modal for checkpoint management */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Memory Checkpoints</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                {...getTestProps('close-checkpoint-manager')}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const id = memoryHelpers.checkpoint('Manual checkpoint');
                  Alert.alert('Created', `Checkpoint created: ${id}`);
                }}
                {...getTestProps('create-new-checkpoint')}
              >
                <Text style={styles.actionButtonText}>📸 New Checkpoint</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const summary = memoryHelpers.summary();
                  Alert.alert('Summary', summary);
                }}
                {...getTestProps('show-memory-summary')}
              >
                <Text style={styles.actionButtonText}>📊 Summary</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.checkpointList}>
              {store.checkpoints.length === 0 ? (
                <Text style={styles.emptyText}>No checkpoints yet</Text>
              ) : (
                store.checkpoints.map((checkpoint) => (
                  <View key={checkpoint.id} style={styles.checkpointItem}>
                    <TouchableOpacity
                      style={styles.checkpointInfo}
                      onPress={() => setSelectedCheckpoint(
                        selectedCheckpoint === checkpoint.id ? null : checkpoint.id
                      )}
                      {...getTestProps(`checkpoint-${checkpoint.id}`)}
                    >
                      <Text style={styles.checkpointName}>{checkpoint.name}</Text>
                      <Text style={styles.checkpointTime}>
                        {formatTimestamp(checkpoint.timestamp)}
                      </Text>
                      {checkpoint.id === store.currentCheckpoint && (
                        <Text style={styles.currentBadge}>CURRENT</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.checkpointActions}>
                      <TouchableOpacity
                        style={[styles.iconButton, styles.restoreButton]}
                        onPress={() => handleRestore(checkpoint.id)}
                        {...getTestProps(`restore-${checkpoint.id}`)}
                      >
                        <Text style={styles.iconButtonText}>↻</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.iconButton, styles.exportButton]}
                        onPress={() => handleExport(checkpoint.id)}
                        {...getTestProps(`export-${checkpoint.id}`)}
                      >
                        <Text style={styles.iconButtonText}>↓</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.iconButton, styles.deleteButton]}
                        onPress={() => handleDelete(checkpoint.id)}
                        {...getTestProps(`delete-${checkpoint.id}`)}
                      >
                        <Text style={styles.iconButtonText}>🗑</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedCheckpoint === checkpoint.id && getCheckpointDetails(checkpoint.id)}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Auto-checkpoint: {store.autoCheckpoint ? 'ON' : 'OFF'} |
                Interval: {store.checkpointInterval}min |
                Max: {store.maxCheckpoints}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: fantasyTomeColors.elements.magic.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: fantasyTomeColors.ink.scribe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 9998,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: Platform.OS === 'web' ? '90%' : '95%',
    maxWidth: 600,
    height: '80%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    padding: 5,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkpointList: {
    flex: 1,
  },
  checkpointItem: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  checkpointTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  checkpointActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  restoreButton: {
    backgroundColor: fantasyTomeColors.elements.magic.primary,
  },
  exportButton: {
    backgroundColor: '#9b59b6',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  detailsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 16,
    marginTop: 50,
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
});