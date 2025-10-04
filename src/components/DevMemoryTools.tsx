/**
 * Developer Memory Tools
 *
 * Quick access component for memory system operations
 * Add this to your app during development for easy checkpoint management
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { memoryHelpers } from '../store/memoryStore';
import { useMemoryStore } from '../store/memoryStore';

import { getTestProps } from '../utils/react-native-web-polyfills';
export const DevMemoryTools: React.FC = () => {
  const store = useMemoryStore();

  const createCheckpoint = () => {
    const checkpointId = memoryHelpers.checkpoint("Session checkpoint");
    Alert.alert('Success', `Checkpoint created: ${checkpointId}`);
  };

  const showSummary = () => {
    const summary = memoryHelpers.summary();
    Alert.alert('Memory Summary', summary);
  };

  const showProgress = () => {
    const progress = memoryHelpers.progress();
    Alert.alert(
      'Progress',
      `Completion: ${progress.completionRate.toFixed(1)}%\n` +
      `Blocked: ${progress.blockedCount}\n` +
      `Current: ${progress.currentFocus || 'None'}`
    );
  };

  const quickSave = (key: string, value: any) => {
    memoryHelpers.remember(key, value);
    Alert.alert('Saved', `Memory saved: ${key}`);
  };

  const quickLoad = (key: string) => {
    const value = memoryHelpers.recall(key);
    Alert.alert('Memory', JSON.stringify(value, null, 2));
  };

  const listCheckpoints = () => {
    const checkpoints = store.checkpoints;

    if (checkpoints.length === 0) {
      Alert.alert('Checkpoints', 'No checkpoints yet');
      return;
    }

    // * Create list of checkpoints for display
    const checkpointList = checkpoints.map((cp, index) =>
      `${index + 1}. ${cp.name}\n   ${new Date(cp.timestamp).toLocaleString()}`
    ).join('\n\n');

    // * Show list with option to restore
    Alert.alert(
      '📋 Checkpoints',
      checkpointList + '\n\nTap "Restore" to select a checkpoint',
      [
        {
          text: 'Restore',
          onPress: () => selectCheckpointToRestore()
        },
        {
          text: 'Close',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  const selectCheckpointToRestore = () => {
    const checkpoints = store.checkpoints;

    if (checkpoints.length === 0) {
      return;
    }

    // * For simplicity, restore the most recent checkpoint
    // * In a production app, you'd want a proper picker UI
    const mostRecent = checkpoints[checkpoints.length - 1];

    Alert.alert(
      'Restore Checkpoint',
      `Restore "${mostRecent.name}"?\n${new Date(mostRecent.timestamp).toLocaleString()}`,
      [
        {
          text: 'Restore',
          onPress: () => restoreCheckpoint(mostRecent.id)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const restoreCheckpoint = (checkpointId: string) => {
    try {
      memoryHelpers.restore(checkpointId);
      Alert.alert('Success', `Checkpoint restored: ${checkpointId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to restore checkpoint: ${error.message}`);
    }
  };

  if (__DEV__ === false) {
    // Only show in development
    return null;
  }

  return (
    <View style={styles.container} {...getTestProps('dev-memory-tools')}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={createCheckpoint}
          {...getTestProps('create-checkpoint-quick')}
        >
          <Text style={styles.buttonText}>📸 Checkpoint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={showSummary}
          {...getTestProps('show-summary-quick')}
        >
          <Text style={styles.buttonText}>📊 Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={showProgress}
          {...getTestProps('show-progress-quick')}
        >
          <Text style={styles.buttonText}>📈 Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={listCheckpoints}
          {...getTestProps('list-checkpoints-quick')}
        >
          <Text style={styles.buttonText}>📋 List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => quickSave('quick_note', {
            timestamp: new Date().toISOString(),
            note: 'Quick save from dev tools'
          })}
          {...getTestProps('quick-save')}
        >
          <Text style={styles.buttonText}>💾 Quick Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => quickLoad('quick_note')}
          {...getTestProps('quick-load')}
        >
          <Text style={styles.buttonText}>📂 Quick Load</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    zIndex: 9999,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  successButton: {
    backgroundColor: '#27ae60',
  },
  infoButton: {
    backgroundColor: '#9b59b6',
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  secondaryButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});