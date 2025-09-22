/**
 * Memory System Store
 *
 * This store provides a comprehensive memory system for:
 * - Session state management
 * - Checkpoint creation and restoration
 * - Task tracking and progress
 * - Development context preservation
 * - Cross-session continuity
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// * Types for the memory system
export interface MemoryEntry {
  id: string;
  key: string;
  value: any;
  timestamp: Date;
  category: 'checkpoint' | 'task' | 'context' | 'decision' | 'blocker' | 'session';
  tags?: string[];
  description?: string;
  expiresAt?: Date;
}

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: Date;
  description?: string;
  state: {
    // Current work context
    currentProject?: string;
    currentElement?: string;
    currentScreen?: string;

    // Task progress
    completedTasks: string[];
    pendingTasks: string[];
    blockedTasks?: string[];

    // Session info
    sessionDuration?: number;
    lastActivity?: Date;

    // Custom state snapshot
    customData?: Record<string, any>;
  };
  metadata?: {
    appVersion?: string;
    platform?: string;
    environment?: string;
  };
}

export interface TaskMemory {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  phase?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startedAt?: Date;
  completedAt?: Date;
  blockedBy?: string;
  dependencies?: string[];
  outcomes?: string[];
  notes?: string;
}

export interface SessionMemory {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  goals: string[];
  achievements: string[];
  decisions: { timestamp: Date; description: string; rationale?: string }[];
  blockers: { timestamp: Date; description: string; resolved?: boolean }[];
  insights: string[];
  nextSteps?: string[];
}

// * Store interface
interface MemoryStore {
  // Core memory entries
  memories: Map<string, MemoryEntry>;

  // Checkpoints
  checkpoints: Checkpoint[];
  currentCheckpoint?: string;

  // Tasks
  tasks: Map<string, TaskMemory>;
  taskHierarchy: { phases: string[]; currentPhase?: string };

  // Current session
  currentSession?: SessionMemory;
  sessionHistory: SessionMemory[];

  // Settings
  autoCheckpoint: boolean;
  checkpointInterval: number; // minutes
  maxCheckpoints: number;

  // * Memory operations
  writeMemory: (key: string, value: any, category?: MemoryEntry['category'], description?: string) => void;
  readMemory: (key: string) => any;
  deleteMemory: (key: string) => void;
  listMemories: (category?: MemoryEntry['category']) => MemoryEntry[];
  searchMemories: (query: string) => MemoryEntry[];

  // * Checkpoint operations
  createCheckpoint: (name: string, description?: string) => string;
  restoreCheckpoint: (checkpointId: string) => void;
  deleteCheckpoint: (checkpointId: string) => void;
  exportCheckpoint: (checkpointId: string) => string;
  importCheckpoint: (data: string) => void;

  // * Task operations
  addTask: (task: Omit<TaskMemory, 'id'>) => string;
  updateTask: (taskId: string, updates: Partial<TaskMemory>) => void;
  completeTask: (taskId: string, outcomes?: string[]) => void;
  blockTask: (taskId: string, reason: string) => void;
  getTasksByStatus: (status: TaskMemory['status']) => TaskMemory[];
  getTasksByPhase: (phase: string) => TaskMemory[];

  // * Session operations
  startSession: (goals: string[]) => void;
  endSession: (nextSteps?: string[]) => void;
  addDecision: (description: string, rationale?: string) => void;
  addBlocker: (description: string) => void;
  resolveBlocker: (description: string) => void;
  addInsight: (insight: string) => void;
  addAchievement: (achievement: string) => void;

  // * Analysis operations
  thinkAboutProgress: () => {
    completionRate: number;
    blockedCount: number;
    averageTaskDuration: number;
    currentFocus?: string;
  };
  thinkAboutContext: () => {
    recentDecisions: string[];
    activeBlockers: string[];
    upcomingTasks: string[];
  };
  generateSummary: () => string;

  // * Cleanup operations
  pruneOldCheckpoints: () => void;
  cleanExpiredMemories: () => void;
  reset: () => void;
}

// * Platform-specific storage
const storage = Platform.OS === 'web'
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => AsyncStorage);

// * Create the memory store
export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      memories: new Map(),
      checkpoints: [],
      currentCheckpoint: undefined,
      tasks: new Map(),
      taskHierarchy: { phases: [] },
      currentSession: undefined,
      sessionHistory: [],
      autoCheckpoint: true,
      checkpointInterval: 30, // 30 minutes default
      maxCheckpoints: 10,

      // * Memory operations
      writeMemory: (key, value, category = 'context', description) => {
        const entry: MemoryEntry = {
          id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          key,
          value,
          timestamp: new Date(),
          category,
          description,
        };

        set((state) => {
          const newMemories = new Map(state.memories);
          newMemories.set(key, entry);
          return { memories: newMemories };
        });
      },

      readMemory: (key) => {
        const memory = get().memories.get(key);
        return memory?.value;
      },

      deleteMemory: (key) => {
        set((state) => {
          const newMemories = new Map(state.memories);
          newMemories.delete(key);
          return { memories: newMemories };
        });
      },

      listMemories: (category) => {
        const memories = Array.from(get().memories.values());
        if (category) {
          return memories.filter(m => m.category === category);
        }
        return memories;
      },

      searchMemories: (query) => {
        const memories = Array.from(get().memories.values());
        const lowerQuery = query.toLowerCase();
        return memories.filter(m =>
          m.key.toLowerCase().includes(lowerQuery) ||
          m.description?.toLowerCase().includes(lowerQuery) ||
          JSON.stringify(m.value).toLowerCase().includes(lowerQuery)
        );
      },

      // * Checkpoint operations
      createCheckpoint: (name, description) => {
        const state = get();
        const checkpoint: Checkpoint = {
          id: `chk_${Date.now()}`,
          name,
          timestamp: new Date(),
          description,
          state: {
            currentProject: state.readMemory('current_project'),
            currentElement: state.readMemory('current_element'),
            currentScreen: state.readMemory('current_screen'),
            completedTasks: Array.from(state.tasks.values())
              .filter(t => t.status === 'completed')
              .map(t => t.id),
            pendingTasks: Array.from(state.tasks.values())
              .filter(t => t.status === 'pending')
              .map(t => t.id),
            blockedTasks: Array.from(state.tasks.values())
              .filter(t => t.status === 'blocked')
              .map(t => t.id),
            sessionDuration: state.currentSession
              ? Date.now() - state.currentSession.startedAt.getTime()
              : undefined,
            lastActivity: new Date(),
            customData: Object.fromEntries(
              Array.from(state.memories.entries())
                .filter(([_, m]) => m.category === 'context')
            ),
          },
          metadata: {
            appVersion: '1.0.0',
            platform: Platform.OS,
            environment: __DEV__ ? 'development' : 'production',
          },
        };

        set((state) => {
          const newCheckpoints = [...state.checkpoints, checkpoint];
          // Prune old checkpoints if exceeding max
          if (newCheckpoints.length > state.maxCheckpoints) {
            newCheckpoints.shift();
          }
          return {
            checkpoints: newCheckpoints,
            currentCheckpoint: checkpoint.id,
          };
        });

        return checkpoint.id;
      },

      restoreCheckpoint: (checkpointId) => {
        const checkpoint = get().checkpoints.find(c => c.id === checkpointId);
        if (!checkpoint) {
          throw new Error(`Checkpoint ${checkpointId} not found`);
        }

        set((state) => {
          // Restore memories
          const restoredMemories = new Map();
          if (checkpoint.state.customData) {
            Object.entries(checkpoint.state.customData).forEach(([key, value]) => {
              restoredMemories.set(key, value);
            });
          }

          // Restore tasks
          const restoredTasks = new Map(state.tasks);
          checkpoint.state.completedTasks.forEach(id => {
            const task = restoredTasks.get(id);
            if (task) task.status = 'completed';
          });
          checkpoint.state.pendingTasks.forEach(id => {
            const task = restoredTasks.get(id);
            if (task) task.status = 'pending';
          });
          checkpoint.state.blockedTasks?.forEach(id => {
            const task = restoredTasks.get(id);
            if (task) task.status = 'blocked';
          });

          return {
            memories: restoredMemories,
            tasks: restoredTasks,
            currentCheckpoint: checkpointId,
          };
        });
      },

      deleteCheckpoint: (checkpointId) => {
        set((state) => ({
          checkpoints: state.checkpoints.filter(c => c.id !== checkpointId),
          currentCheckpoint: state.currentCheckpoint === checkpointId
            ? undefined
            : state.currentCheckpoint,
        }));
      },

      exportCheckpoint: (checkpointId) => {
        const checkpoint = get().checkpoints.find(c => c.id === checkpointId);
        if (!checkpoint) {
          throw new Error(`Checkpoint ${checkpointId} not found`);
        }
        return JSON.stringify(checkpoint, null, 2);
      },

      importCheckpoint: (data) => {
        try {
          const checkpoint = JSON.parse(data) as Checkpoint;
          set((state) => ({
            checkpoints: [...state.checkpoints, checkpoint],
          }));
        } catch (error) {
          throw new Error(`Failed to import checkpoint: ${error}`);
        }
      },

      // * Task operations
      addTask: (task) => {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTask: TaskMemory = {
          ...task,
          id,
          startedAt: task.status === 'in_progress' ? new Date() : undefined,
        };

        set((state) => {
          const newTasks = new Map(state.tasks);
          newTasks.set(id, newTask);
          return { tasks: newTasks };
        });

        return id;
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(taskId);
          if (task) {
            Object.assign(task, updates);
            if (updates.status === 'in_progress' && !task.startedAt) {
              task.startedAt = new Date();
            }
            if (updates.status === 'completed' && !task.completedAt) {
              task.completedAt = new Date();
            }
          }
          return { tasks: newTasks };
        });
      },

      completeTask: (taskId, outcomes) => {
        get().updateTask(taskId, {
          status: 'completed',
          completedAt: new Date(),
          outcomes,
        });
      },

      blockTask: (taskId, reason) => {
        get().updateTask(taskId, {
          status: 'blocked',
          blockedBy: reason,
        });
      },

      getTasksByStatus: (status) => {
        return Array.from(get().tasks.values()).filter(t => t.status === status);
      },

      getTasksByPhase: (phase) => {
        return Array.from(get().tasks.values()).filter(t => t.phase === phase);
      },

      // * Session operations
      startSession: (goals) => {
        const session: SessionMemory = {
          id: `session_${Date.now()}`,
          startedAt: new Date(),
          goals,
          achievements: [],
          decisions: [],
          blockers: [],
          insights: [],
        };

        set({ currentSession: session });
      },

      endSession: (nextSteps) => {
        const session = get().currentSession;
        if (session) {
          session.endedAt = new Date();
          session.nextSteps = nextSteps;

          set((state) => ({
            sessionHistory: [...state.sessionHistory, session],
            currentSession: undefined,
          }));
        }
      },

      addDecision: (description, rationale) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.decisions.push({
              timestamp: new Date(),
              description,
              rationale,
            });
          }
          return { currentSession: state.currentSession };
        });
      },

      addBlocker: (description) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.blockers.push({
              timestamp: new Date(),
              description,
              resolved: false,
            });
          }
          return { currentSession: state.currentSession };
        });
      },

      resolveBlocker: (description) => {
        set((state) => {
          if (state.currentSession) {
            const blocker = state.currentSession.blockers.find(
              b => b.description === description && !b.resolved
            );
            if (blocker) {
              blocker.resolved = true;
            }
          }
          return { currentSession: state.currentSession };
        });
      },

      addInsight: (insight) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.insights.push(insight);
          }
          return { currentSession: state.currentSession };
        });
      },

      addAchievement: (achievement) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.achievements.push(achievement);
          }
          return { currentSession: state.currentSession };
        });
      },

      // * Analysis operations
      thinkAboutProgress: () => {
        const tasks = Array.from(get().tasks.values());
        const completed = tasks.filter(t => t.status === 'completed').length;
        const blocked = tasks.filter(t => t.status === 'blocked').length;

        const completedWithDuration = tasks
          .filter(t => t.status === 'completed' && t.startedAt && t.completedAt)
          .map(t => t.completedAt!.getTime() - t.startedAt!.getTime());

        const averageDuration = completedWithDuration.length > 0
          ? completedWithDuration.reduce((a, b) => a + b, 0) / completedWithDuration.length
          : 0;

        const inProgress = tasks.find(t => t.status === 'in_progress');

        return {
          completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
          blockedCount: blocked,
          averageTaskDuration: averageDuration,
          currentFocus: inProgress?.content,
        };
      },

      thinkAboutContext: () => {
        const state = get();
        const recentDecisions = state.currentSession?.decisions
          .slice(-5)
          .map(d => d.description) || [];

        const activeBlockers = state.currentSession?.blockers
          .filter(b => !b.resolved)
          .map(b => b.description) || [];

        const upcomingTasks = Array.from(state.tasks.values())
          .filter(t => t.status === 'pending')
          .slice(0, 5)
          .map(t => t.content);

        return {
          recentDecisions,
          activeBlockers,
          upcomingTasks,
        };
      },

      generateSummary: () => {
        const state = get();
        const progress = state.thinkAboutProgress();
        const context = state.thinkAboutContext();
        const session = state.currentSession;

        let summary = `## Memory System Summary\n\n`;

        if (session) {
          summary += `### Current Session\n`;
          summary += `Started: ${session.startedAt.toLocaleString()}\n`;
          summary += `Goals: ${session.goals.join(', ')}\n`;
          summary += `Achievements: ${session.achievements.join(', ')}\n\n`;
        }

        summary += `### Progress\n`;
        summary += `Completion Rate: ${progress.completionRate.toFixed(1)}%\n`;
        summary += `Blocked Tasks: ${progress.blockedCount}\n`;
        if (progress.currentFocus) {
          summary += `Current Focus: ${progress.currentFocus}\n`;
        }
        summary += `\n`;

        if (context.activeBlockers.length > 0) {
          summary += `### Active Blockers\n`;
          context.activeBlockers.forEach(b => {
            summary += `- ${b}\n`;
          });
          summary += `\n`;
        }

        if (context.upcomingTasks.length > 0) {
          summary += `### Upcoming Tasks\n`;
          context.upcomingTasks.forEach(t => {
            summary += `- ${t}\n`;
          });
          summary += `\n`;
        }

        summary += `### Checkpoints\n`;
        summary += `Total: ${state.checkpoints.length}\n`;
        if (state.currentCheckpoint) {
          const current = state.checkpoints.find(c => c.id === state.currentCheckpoint);
          if (current) {
            summary += `Current: ${current.name} (${current.timestamp.toLocaleString()})\n`;
          }
        }

        return summary;
      },

      // * Cleanup operations
      pruneOldCheckpoints: () => {
        set((state) => {
          let checkpoints = [...state.checkpoints];
          if (checkpoints.length > state.maxCheckpoints) {
            checkpoints = checkpoints.slice(-state.maxCheckpoints);
          }
          return { checkpoints };
        });
      },

      cleanExpiredMemories: () => {
        set((state) => {
          const now = new Date();
          const memories = new Map(state.memories);

          memories.forEach((memory, key) => {
            if (memory.expiresAt && memory.expiresAt < now) {
              memories.delete(key);
            }
          });

          return { memories };
        });
      },

      reset: () => {
        set({
          memories: new Map(),
          checkpoints: [],
          currentCheckpoint: undefined,
          tasks: new Map(),
          taskHierarchy: { phases: [] },
          currentSession: undefined,
          sessionHistory: [],
        });
      },
    }),
    {
      name: 'fantasy-writing-memory-store',
      storage,
      // Custom serialization for Maps
      partialize: (state) => ({
        ...state,
        memories: Array.from(state.memories.entries()),
        tasks: Array.from(state.tasks.entries()),
      }),
      // Custom deserialization for Maps
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.memories = new Map(state.memories as any);
          state.tasks = new Map(state.tasks as any);
        }
      },
    }
  )
);

// * Auto-checkpoint functionality
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useMemoryStore.getState();
    if (store.autoCheckpoint) {
      store.createCheckpoint('Auto checkpoint', 'Automatic checkpoint created');
      store.pruneOldCheckpoints();
    }
  }, useMemoryStore.getState().checkpointInterval * 60 * 1000);
}

// * Export helper functions
export const memoryHelpers = {
  // Quick access functions
  remember: (key: string, value: any) =>
    useMemoryStore.getState().writeMemory(key, value),

  recall: (key: string) =>
    useMemoryStore.getState().readMemory(key),

  forget: (key: string) =>
    useMemoryStore.getState().deleteMemory(key),

  checkpoint: (name?: string) =>
    useMemoryStore.getState().createCheckpoint(
      name || `Checkpoint ${new Date().toLocaleTimeString()}`,
      'Manual checkpoint'
    ),

  restore: (checkpointId: string) =>
    useMemoryStore.getState().restoreCheckpoint(checkpointId),

  // Analysis shortcuts
  progress: () =>
    useMemoryStore.getState().thinkAboutProgress(),

  context: () =>
    useMemoryStore.getState().thinkAboutContext(),

  summary: () =>
    useMemoryStore.getState().generateSummary(),
};