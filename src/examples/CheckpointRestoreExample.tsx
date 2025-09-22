/**
 * Checkpoint Restore Example
 *
 * This example demonstrates how to use the memory checkpoint system
 * to save and restore application state
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { memoryHelpers, useMemoryStore } from '../store/memoryStore';

export const CheckpointRestoreExample: React.FC = () => {
  const store = useMemoryStore();
  const [inputText, setInputText] = useState('');
  const [counter, setCounter] = useState(0);

  // * Save current state to memory and create checkpoint
  const saveState = () => {
    // Save application state to memory
    memoryHelpers.remember('example_text', inputText);
    memoryHelpers.remember('example_counter', counter);
    memoryHelpers.remember('example_timestamp', new Date().toISOString());

    // Create a checkpoint
    const checkpointId = memoryHelpers.checkpoint('Example State Checkpoint');

    Alert.alert(
      'State Saved',
      `Checkpoint created with ID: ${checkpointId}\n\nText: "${inputText}"\nCounter: ${counter}`,
      [{ text: 'OK' }]
    );
  };

  // * Restore state from the most recent checkpoint
  const restoreState = () => {
    const checkpoints = store.checkpoints;

    if (checkpoints.length === 0) {
      Alert.alert('No Checkpoints', 'Create a checkpoint first by saving state');
      return;
    }

    // Get the most recent checkpoint
    const latestCheckpoint = checkpoints[checkpoints.length - 1];

    try {
      // Restore the checkpoint
      memoryHelpers.restore(latestCheckpoint.id);

      // Retrieve the restored values
      const restoredText = memoryHelpers.recall('example_text') || '';
      const restoredCounter = memoryHelpers.recall('example_counter') || 0;
      const restoredTimestamp = memoryHelpers.recall('example_timestamp');

      // Update the component state
      setInputText(restoredText);
      setCounter(restoredCounter);

      Alert.alert(
        'State Restored',
        `Restored from checkpoint "${latestCheckpoint.name}"\n` +
        `Created at: ${new Date(restoredTimestamp).toLocaleString()}\n\n` +
        `Text: "${restoredText}"\nCounter: ${restoredCounter}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to restore: ${error.message}`);
    }
  };

  // * List all available checkpoints
  const listCheckpoints = () => {
    const checkpoints = store.checkpoints;

    if (checkpoints.length === 0) {
      Alert.alert('No Checkpoints', 'No checkpoints available');
      return;
    }

    const list = checkpoints.map((cp, index) =>
      `${index + 1}. ${cp.name}\n   Created: ${new Date(cp.timestamp).toLocaleString()}`
    ).join('\n\n');

    Alert.alert('Available Checkpoints', list, [{ text: 'OK' }]);
  };

  // * Clear all data and start fresh
  const clearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will reset everything. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            store.reset();
            setInputText('');
            setCounter(0);
            Alert.alert('Cleared', 'All data has been reset');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container} testID="checkpoint-restore-example">
      <Text style={styles.title}>Checkpoint Restore Example</Text>

      <View style={styles.stateContainer}>
        <Text style={styles.label}>Text Input:</Text>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter some text..."
          testID="example-text-input"
        />

        <Text style={styles.label}>Counter: {counter}</Text>
        <View style={styles.counterButtons}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setCounter(c => c - 1)}
            testID="decrement-counter"
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setCounter(c => c + 1)}
            testID="increment-counter"
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveState}
          testID="save-state-button"
        >
          <Text style={styles.buttonText}>💾 Save State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.restoreButton]}
          onPress={restoreState}
          testID="restore-state-button"
        >
          <Text style={styles.buttonText}>↻ Restore State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.listButton]}
          onPress={listCheckpoints}
          testID="list-checkpoints-button"
        >
          <Text style={styles.buttonText}>📋 List Checkpoints</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearAll}
          testID="clear-all-button"
        >
          <Text style={styles.buttonText}>🗑 Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How to Use:</Text>
        <Text style={styles.infoText}>
          1. Enter text and adjust the counter{'\n'}
          2. Click "Save State" to create a checkpoint{'\n'}
          3. Change the values{'\n'}
          4. Click "Restore State" to restore from checkpoint{'\n'}
          5. Use "List Checkpoints" to see all saved states
        </Text>

        <Text style={styles.codeExample}>
          {`// In your code:\nmemoryHelpers.restore(checkpointId)`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  stateContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#34495e',
    color: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  counterButton: {
    backgroundColor: '#3498db',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  restoreButton: {
    backgroundColor: '#3498db',
  },
  listButton: {
    backgroundColor: '#9b59b6',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#95a5a6',
    lineHeight: 20,
    marginBottom: 10,
  },
  codeExample: {
    backgroundColor: '#1a1a2e',
    padding: 10,
    borderRadius: 5,
    color: '#3498db',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});