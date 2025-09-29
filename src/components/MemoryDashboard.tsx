/**
 * Memory Dashboard Component
 *
 * Provides a visual interface for the memory system including:
 * - Session management
 * - Checkpoint creation/restoration
 * - Task tracking
 * - Memory analysis
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useMemorySystem } from '../hooks/useMemory';

import { getTestProps } from '../utils/react-native-web-polyfills';
export const MemoryDashboard: React.FC = () => {
  const { checkpoints, tasks, session, analysis } = useMemorySystem();
  const [newGoal, setNewGoal] = useState('');
  const [newTask, setNewTask] = useState('');
  const [checkpointName, setCheckpointName] = useState('');

  // * Session management
  const handleStartSession = () => {
    if (newGoal.trim()) {
      session.start([newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end the current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          onPress: () => session.end(),
          style: 'destructive',
        },
      ]
    );
  };

  // * Checkpoint management
  const handleCreateCheckpoint = () => {
    const name = checkpointName.trim() || `Checkpoint ${new Date().toLocaleTimeString()}`;
    checkpoints.create(name, 'Manual checkpoint from dashboard');
    setCheckpointName('');
  };

  const handleRestoreCheckpoint = (checkpointId: string) => {
    Alert.alert(
      'Restore Checkpoint',
      'This will restore the selected checkpoint. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            const result = checkpoints.restore(checkpointId);
            if (result.success) {
              Alert.alert('Success', 'Checkpoint restored successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to restore checkpoint');
            }
          },
        },
      ]
    );
  };

  // * Task management
  const handleAddTask = () => {
    if (newTask.trim()) {
      tasks.createTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete' | 'block') => {
    switch (action) {
      case 'start':
        tasks.startTask(taskId);
        break;
      case 'complete':
        tasks.finishTask(taskId);
        break;
      case 'block':
        Alert.prompt?.(
          'Block Task',
          'Enter the reason for blocking:',
          (reason) => tasks.blockTask(taskId, reason)
        );
        break;
    }
  };

  return (
    <ScrollView style={styles.container} {...getTestProps('memory-dashboard')}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memory System Dashboard</Text>
      </View>

      {/* Session Section */}
      <View style={styles.section} {...getTestProps('session-section')}>
        <Text style={styles.sectionTitle}>Current Session</Text>
        {session.isSessionActive ? (
          <View>
            <Text style={styles.infoText}>
              Session Active: {Math.floor(session.sessionDuration / 60000)} minutes
            </Text>
            {session.currentSession?.goals.map((goal, index) => (
              <Text key={index} style={styles.goalText}>
                Goal: {goal}
              </Text>
            ))}
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleEndSession}
              {...getTestProps('end-session-button')}
            >
              <Text style={styles.buttonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter session goal..."
              value={newGoal}
              onChangeText={setNewGoal}
              {...getTestProps('session-goal-input')}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleStartSession}
              {...getTestProps('start-session-button')}
            >
              <Text style={styles.buttonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Analysis */}
      <View style={styles.section} {...getTestProps('progress-section')}>
        <Text style={styles.sectionTitle}>Progress Analysis</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {analysis.progress.completionRate.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.inProgressTasks.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analysis.progress.blockedCount}</Text>
            <Text style={styles.statLabel}>Blocked</Text>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          {analysis.getInsights().map((insight, index) => (
            <Text key={index} style={styles.insightText}>{insight}</Text>
          ))}
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.section} {...getTestProps('tasks-section')}>
        <Text style={styles.sectionTitle}>Tasks</Text>

        {/* Add new task */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="Add new task..."
            value={newTask}
            onChangeText={setNewTask}
            {...getTestProps('new-task-input')}
          />
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddTask}
            {...getTestProps('add-task-button')}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Task lists */}
        {tasks.inProgressTasks.length > 0 && (
          <View style={styles.taskGroup}>
            <Text style={styles.taskGroupTitle}>In Progress</Text>
            {tasks.inProgressTasks.map((task) => (
              <View key={task.id} style={styles.taskItem} {...getTestProps(`task-${task.id}`)}>
                <Text style={styles.taskContent}>{task.content}</Text>
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={[styles.taskButton, styles.completeButton]}
                    onPress={() => handleTaskAction(task.id, 'complete')}
                  >
                    <Text style={styles.taskButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.taskButton, styles.blockButton]}
                    onPress={() => handleTaskAction(task.id, 'block')}
                  >
                    <Text style={styles.taskButtonText}>⊘</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {tasks.pendingTasks.length > 0 && (
          <View style={styles.taskGroup}>
            <Text style={styles.taskGroupTitle}>Pending</Text>
            {tasks.pendingTasks.slice(0, 5).map((task) => (
              <View key={task.id} style={styles.taskItem} {...getTestProps(`task-${task.id}`)}>
                <Text style={styles.taskContent}>{task.content}</Text>
                <TouchableOpacity
                  style={[styles.taskButton, styles.startButton]}
                  onPress={() => handleTaskAction(task.id, 'start')}
                >
                  <Text style={styles.taskButtonText}>▶</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tasks.blockedTasks.length > 0 && (
          <View style={styles.taskGroup}>
            <Text style={styles.taskGroupTitle}>Blocked</Text>
            {tasks.blockedTasks.map((task) => (
              <View key={task.id} style={styles.taskItem} {...getTestProps(`task-${task.id}`)}>
                <Text style={[styles.taskContent, styles.blockedText]}>
                  {task.content}
                </Text>
                {task.blockedBy && (
                  <Text style={styles.blockedReason}>Reason: {task.blockedBy}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Checkpoints Section */}
      <View style={styles.section} {...getTestProps('checkpoints-section')}>
        <Text style={styles.sectionTitle}>Checkpoints</Text>

        {/* Create checkpoint */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="Checkpoint name (optional)..."
            value={checkpointName}
            onChangeText={setCheckpointName}
            {...getTestProps('checkpoint-name-input')}
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCreateCheckpoint}
            {...getTestProps('create-checkpoint-button')}
          >
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Checkpoint list */}
        {checkpoints.checkpoints.length > 0 ? (
          <View style={styles.checkpointList}>
            {checkpoints.checkpoints.slice(-5).reverse().map((checkpoint) => (
              <View
                key={checkpoint.id}
                style={[
                  styles.checkpointItem,
                  checkpoint.id === checkpoints.currentCheckpoint && styles.activeCheckpoint,
                ]}
                {...getTestProps(`checkpoint-${checkpoint.id}`)}
              >
                <View style={styles.checkpointInfo}>
                  <Text style={styles.checkpointName}>{checkpoint.name}</Text>
                  <Text style={styles.checkpointTime}>
                    {new Date(checkpoint.timestamp).toLocaleString()}
                  </Text>
                  {checkpoint.description && (
                    <Text style={styles.checkpointDescription}>
                      {checkpoint.description}
                    </Text>
                  )}
                </View>
                <View style={styles.checkpointActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.restoreButton]}
                    onPress={() => handleRestoreCheckpoint(checkpoint.id)}
                    {...getTestProps(`restore-${checkpoint.id}`)}
                  >
                    <Text style={styles.buttonText}>Restore</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'web' && (
                    <TouchableOpacity
                      style={[styles.button, styles.exportButton]}
                      onPress={() => checkpoints.export(checkpoint.id)}
                      {...getTestProps(`export-${checkpoint.id}`)}
                    >
                      <Text style={styles.buttonText}>Export</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No checkpoints yet</Text>
        )}
      </View>

      {/* Summary Section */}
      <View style={styles.section} {...getTestProps('summary-section')}>
        <Text style={styles.sectionTitle}>System Summary</Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => {
            const summary = analysis.getSummary();
            Alert.alert('Memory System Summary', summary);
          }}
          {...getTestProps('generate-summary-button')}
        >
          <Text style={styles.buttonText}>Generate Summary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  flexInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
  },
  restoreButton: {
    backgroundColor: '#9b59b6',
    marginRight: 5,
  },
  exportButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  goalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2c3e50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  insightsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
  },
  insightText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#2c3e50',
  },
  taskGroup: {
    marginBottom: 15,
  },
  taskGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    marginBottom: 5,
  },
  taskContent: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  blockedText: {
    color: '#e74c3c',
    textDecorationLine: 'line-through',
  },
  blockedReason: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  taskActions: {
    flexDirection: 'row',
  },
  taskButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: '#3498db',
  },
  completeButton: {
    backgroundColor: '#27ae60',
  },
  blockButton: {
    backgroundColor: '#e74c3c',
  },
  taskButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  checkpointList: {
    marginTop: 10,
  },
  checkpointItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#95a5a6',
  },
  activeCheckpoint: {
    borderLeftColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  checkpointTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  checkpointDescription: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  checkpointActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
});