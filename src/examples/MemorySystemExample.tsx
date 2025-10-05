/**
 * Example: How to Use the Memory System
 *
 * This file demonstrates all the features of the memory system
 * and how to integrate it into your components.
 */

import React, { useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { useMemorySystem, useMemoryPersistence } from '../hooks/useMemory';
import { memoryHelpers } from '../store/memoryStore';

// * Example 1: Basic Memory Operations
export const BasicMemoryExample = () => {
  const { remember, recall, forget } = useMemorySystem();

  const saveData = () => {
    // Save any data to memory
    remember('user_preference', { theme: 'dark', language: 'en' });
    remember('current_project', 'fantasy-novel-001');
    remember('last_edited_character', { name: 'Aragorn', id: 'char_123' });
  };

  const loadData = () => {
    // Retrieve data from memory
    const prefs = recall('user_preference');
    const project = recall('current_project');
    console.log('Loaded:', { prefs, project });
  };

  const clearData = () => {
    // Remove specific memory
    forget('user_preference');
  };

  return (
    <View>
      <Button title="Save Data" onPress={saveData} />
      <Button title="Load Data" onPress={loadData} />
      <Button title="Clear Data" onPress={clearData} />
    </View>
  );
};

// * Example 2: Session Management
export const SessionExample = () => {
  const { session } = useMemorySystem();

  useEffect(() => {
    // Start a new session when component mounts
    session.start([
      'Write chapter 5',
      'Develop antagonist backstory',
      'Review world-building elements',
    ]);

    return () => {
      // End session when component unmounts
      session.end(['Continue with chapter 6', 'Finalize magic system']);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recordImportantDecision = () => {
    session.recordDecision(
      'Changed main character motivation',
      'Previous motivation was too generic, needed more personal stakes'
    );
  };

  const recordBlocker = () => {
    session.recordBlocker('Inconsistency in timeline between chapters 3 and 4');
  };

  const addAchievement = () => {
    session.addAchievement('Completed 5000 words today!');
  };

  return (
    <View>
      <Text>Session Duration: {session.sessionDuration / 60000} minutes</Text>
      <Button title="Record Decision" onPress={recordImportantDecision} />
      <Button title="Record Blocker" onPress={recordBlocker} />
      <Button title="Add Achievement" onPress={addAchievement} />
    </View>
  );
};

// * Example 3: Task Management
export const TaskManagementExample = () => {
  const { tasks } = useMemorySystem();

  const createWritingTasks = () => {
    // Create tasks with different priorities
    tasks.createTask('Write opening scene', {
      phase: 'drafting',
      priority: 'high',
      notes: 'Focus on establishing tone and hook',
    });

    tasks.createTask('Research medieval weaponry', {
      phase: 'research',
      priority: 'medium',
      dependencies: ['library_visit'],
    });

    tasks.createTask('Revise dialogue in chapter 2', {
      phase: 'revision',
      priority: 'low',
    });
  };

  const workOnTask = (taskId: string) => {
    // Mark task as in progress
    tasks.startTask(taskId);

    // Simulate work
    setTimeout(() => {
      // Complete task with outcomes
      tasks.finishTask(taskId, [
        'Scene written: 1500 words',
        'Established protagonist voice',
      ]);
    }, 2000);
  };

  const blockTask = (taskId: string) => {
    tasks.blockTask(taskId, 'Waiting for beta reader feedback');
  };

  return (
    <View>
      <Text>Pending Tasks: {tasks.pendingTasks.length}</Text>
      <Text>In Progress: {tasks.inProgressTasks.length}</Text>
      <Text>Completed: {tasks.completedTasks.length}</Text>
      <Text>Blocked: {tasks.blockedTasks.length}</Text>

      <Button title="Create Tasks" onPress={createWritingTasks} />

      {tasks.pendingTasks.map(task => (
        <View key={task.id}>
          <Text>{task.content}</Text>
          <Button title="Start" onPress={() => workOnTask(task.id)} />
          <Button title="Block" onPress={() => blockTask(task.id)} />
        </View>
      ))}
    </View>
  );
};

// * Example 4: Checkpoint System
export const CheckpointExample = () => {
  const { checkpoints } = useMemorySystem();

  const createCheckpoint = () => {
    // Create a checkpoint with current state
    const checkpointId = checkpoints.create(
      'Before major plot change',
      'Saving state before introducing new conflict'
    );
    console.log('Created checkpoint:', checkpointId);
  };

  const restoreLastCheckpoint = () => {
    // Restore the most recent checkpoint
    if (checkpoints.latestCheckpoint) {
      const result = checkpoints.restore(checkpoints.latestCheckpoint.id);
      if (result.success) {
        console.log('Restored successfully');
      } else {
        console.error('Restore failed:', result.error);
      }
    }
  };

  const exportCheckpoint = () => {
    // Export checkpoint for backup
    if (checkpoints.latestCheckpoint) {
      checkpoints.export(checkpoints.latestCheckpoint.id);
    }
  };

  return (
    <View>
      <Text>Total Checkpoints: {checkpoints.checkpoints.length}</Text>
      <Text>
        Current: {checkpoints.currentCheckpoint || 'None'}
      </Text>

      <Button title="Create Checkpoint" onPress={createCheckpoint} />
      <Button title="Restore Last" onPress={restoreLastCheckpoint} />
      <Button title="Export Backup" onPress={exportCheckpoint} />

      {checkpoints.checkpoints.map(cp => (
        <View key={cp.id}>
          <Text>{cp.name} - {new Date(cp.timestamp).toLocaleString()}</Text>
          <Button
            title="Restore"
            onPress={() => checkpoints.restore(cp.id)}
          />
        </View>
      ))}
    </View>
  );
};

// * Example 5: Memory Analysis
export const AnalysisExample = () => {
  const { analysis } = useMemorySystem();

  const showProgress = () => {
    const progress = analysis.progress;
    console.log('Progress Report:', {
      completionRate: `${progress.completionRate}%`,
      blockedTasks: progress.blockedCount,
      averageTaskDuration: `${progress.averageTaskDuration / 60000} minutes`,
      currentFocus: progress.currentFocus,
    });
  };

  const showContext = () => {
    const context = analysis.context;
    console.log('Current Context:', {
      recentDecisions: context.recentDecisions,
      activeBlockers: context.activeBlockers,
      upcomingTasks: context.upcomingTasks,
    });
  };

  const generateReport = () => {
    const summary = analysis.getSummary();
    console.log('Full Summary:\n', summary);
  };

  const getInsights = () => {
    const insights = analysis.getInsights();
    insights.forEach(insight => console.log(insight));
  };

  return (
    <View>
      <Text>Completion: {analysis.progress.completionRate.toFixed(1)}%</Text>
      <Text>Blocked: {analysis.progress.blockedCount} tasks</Text>

      <Button title="Show Progress" onPress={showProgress} />
      <Button title="Show Context" onPress={showContext} />
      <Button title="Generate Report" onPress={generateReport} />
      <Button title="Get Insights" onPress={getInsights} />

      {analysis.getInsights().map((insight, i) => (
        <Text key={i}>{insight}</Text>
      ))}
    </View>
  );
};

// * Example 6: Auto-Persistence Hook
export const AutoPersistenceExample = () => {
  const [storyContent, setStoryContent] = React.useState('');

  // Automatically save story content to memory with debouncing
  useMemoryPersistence(
    'draft_content',
    storyContent,
    {
      debounceMs: 2000, // Save after 2 seconds of no changes
      category: 'context',
      description: 'Auto-saved story draft',
    }
  );

  return (
    <View>
      <TextInput
        value={storyContent}
        onChangeText={setStoryContent}
        placeholder="Type your story..."
        multiline
      />
      <Text>Auto-saving enabled (2s delay)</Text>
    </View>
  );
};

// * Example 7: Quick Helper Functions
export const QuickHelpersExample = () => {
  const demonstrateHelpers = () => {
    // Direct helper functions for quick operations
    memoryHelpers.remember('quick_note', 'This is a quick note');

    const note = memoryHelpers.recall('quick_note');
    console.log('Retrieved:', note);

    memoryHelpers.checkpoint('Quick save');

    const progress = memoryHelpers.progress();
    console.log('Quick progress:', progress);

    const context = memoryHelpers.context();
    console.log('Quick context:', context);

    const summary = memoryHelpers.summary();
    console.log('Quick summary:', summary);
  };

  return (
    <View>
      <Button title="Test Quick Helpers" onPress={demonstrateHelpers} />
    </View>
  );
};

// * Example 8: Search and Query Memory
export const SearchMemoryExample = () => {
  const { searchMemories, getMemoriesByCategory } = useMemorySystem();

  const searchExample = () => {
    // Search for memories containing specific text
    const results = searchMemories('character');
    console.log('Search results for "character":', results);
  };

  const getCategoryExample = () => {
    // Get all memories of a specific category
    const contextMemories = getMemoriesByCategory('context');
    const checkpointMemories = getMemoriesByCategory('checkpoint');

    console.log('Context memories:', contextMemories.length);
    console.log('Checkpoint memories:', checkpointMemories.length);
  };

  return (
    <View>
      <Button title="Search Memory" onPress={searchExample} />
      <Button title="Get by Category" onPress={getCategoryExample} />
    </View>
  );
};

// * Complete Integration Example
export const CompleteIntegrationExample: React.FC = () => {
  const memorySystem = useMemorySystem();

  useEffect(() => {
    // Initialize session on mount
    memorySystem.session.start(['Work on fantasy writing app']);

    // Set up auto-checkpoint
    const interval = setInterval(() => {
      memorySystem.checkpoints.create('Auto-save', 'Periodic checkpoint');
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => {
      clearInterval(interval);
      // Save session summary on unmount
      memorySystem.session.end(['Continue tomorrow']);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _handleProjectChange = (projectId: string) => {
    // Remember current context
    memorySystem.remember('current_project', projectId);
    memorySystem.session.recordDecision(
      `Switched to project ${projectId}`,
      'User selected from project list'
    );
  };

  const _handleError = (error: Error) => {
    // Record errors as blockers
    memorySystem.session.recordBlocker(`Error: ${error.message}`);
  };

  const _handleMilestone = (milestone: string) => {
    // Record achievements
    memorySystem.session.addAchievement(milestone);
    // Create checkpoint for important milestones
    memorySystem.checkpoints.create(
      `Milestone: ${milestone}`,
      'Important progress checkpoint'
    );
  };

  return (
    <View>
      <Text>Memory System Active</Text>
      <Text>Session: {memorySystem.session.isSessionActive ? 'Active' : 'Inactive'}</Text>
      <Text>Tasks: {memorySystem.tasks.tasks.length}</Text>
      <Text>Checkpoints: {memorySystem.checkpoints.checkpoints.length}</Text>

      {/* Your app components here */}
    </View>
  );
};

// * Usage in Claude/AI Development Sessions
export const ClaudeIntegrationExample = () => {
  const memory = useMemorySystem();

  // Claude can use these patterns to maintain context:

  // 1. At session start
  const _initializeSession = () => {
    memory.session.start(['Implement authentication', 'Fix navigation bugs']);
    const lastContext = memory.recall('last_working_context');
    console.log('Resuming from:', lastContext);
  };

  // 2. During development
  const _recordProgress = () => {
    memory.remember('current_file', 'src/components/Auth.tsx');
    memory.remember('implementation_notes', {
      approach: 'Using JWT tokens',
      dependencies: ['jsonwebtoken', 'bcrypt'],
      considerations: ['Security', 'Performance'],
    });
    memory.tasks.createTask('Add password reset flow', {
      priority: 'high',
      phase: 'implementation',
    });
  };

  // 3. When encountering issues
  const _recordIssue = () => {
    memory.session.recordBlocker('TypeScript error in auth middleware');
    memory.session.recordDecision(
      'Use type assertion for now',
      'Temporary fix until proper types are defined'
    );
  };

  // 4. Before ending session
  const _saveSessionState = () => {
    memory.checkpoints.create('End of session checkpoint');
    const summary = memory.analysis.getSummary();
    memory.remember('session_summary', summary);
    memory.session.end(['Review auth implementation', 'Deploy to staging']);
  };

  return null; // This is just for demonstration
};