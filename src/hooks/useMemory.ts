/**
 * React Hooks for Memory System
 *
 * These hooks provide easy-to-use interfaces for components
 * to interact with the memory system.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMemoryStore, memoryHelpers, TaskMemory, MemoryEntry } from '../store/memoryStore';

/**
 * Main memory hook for general memory operations
 */
export const useMemory = () => {
  const store = useMemoryStore();

  // * Quick memory operations
  const remember = useCallback((key: string, value: any, description?: string) => {
    store.writeMemory(key, value, 'context', description);
  }, [store]);

  const recall = useCallback((key: string) => {
    return store.readMemory(key);
  }, [store]);

  const forget = useCallback((key: string) => {
    store.deleteMemory(key);
  }, [store]);

  const search = useCallback((query: string) => {
    return store.searchMemories(query);
  }, [store]);

  // * Get all memories by category
  const getMemoriesByCategory = useCallback((category?: MemoryEntry['category']) => {
    return store.listMemories(category);
  }, [store]);

  return {
    remember,
    recall,
    forget,
    search,
    getMemoriesByCategory,
    // Direct access to store methods
    writeMemory: store.writeMemory,
    readMemory: store.readMemory,
    deleteMemory: store.deleteMemory,
    listMemories: store.listMemories,
    searchMemories: store.searchMemories,
  };
};

/**
 * Hook for checkpoint management
 */
export const useCheckpoints = () => {
  const {
    checkpoints,
    currentCheckpoint,
    createCheckpoint,
    restoreCheckpoint,
    deleteCheckpoint,
    exportCheckpoint,
    importCheckpoint,
    autoCheckpoint,
    checkpointInterval,
  } = useMemoryStore();

  const create = useCallback((name?: string, description?: string) => {
    const defaultName = name || `Checkpoint ${new Date().toLocaleTimeString()}`;
    return createCheckpoint(defaultName, description);
  }, [createCheckpoint]);

  const restore = useCallback((checkpointId: string) => {
    try {
      restoreCheckpoint(checkpointId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [restoreCheckpoint]);

  const exportData = useCallback((checkpointId: string) => {
    try {
      const data = exportCheckpoint(checkpointId);
      // Create downloadable file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checkpoint_${checkpointId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [exportCheckpoint]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importCheckpoint(e.target?.result as string);
      } catch (error) {
        console.error('Failed to import checkpoint:', error);
      }
    };
    reader.readAsText(file);
  }, [importCheckpoint]);

  const latestCheckpoint = useMemo(() => {
    return checkpoints[checkpoints.length - 1];
  }, [checkpoints]);

  return {
    checkpoints,
    currentCheckpoint,
    latestCheckpoint,
    create,
    restore,
    delete: deleteCheckpoint,
    export: exportData,
    import: importData,
    autoCheckpoint,
    checkpointInterval,
  };
};

/**
 * Hook for task management
 */
export const useTasks = () => {
  const {
    tasks,
    addTask,
    updateTask,
    completeTask,
    blockTask,
    getTasksByStatus,
    getTasksByPhase,
  } = useMemoryStore();

  const taskList = useMemo(() => Array.from(tasks.values()), [tasks]);

  const pendingTasks = useMemo(
    () => taskList.filter(t => t.status === 'pending'),
    [taskList]
  );

  const inProgressTasks = useMemo(
    () => taskList.filter(t => t.status === 'in_progress'),
    [taskList]
  );

  const completedTasks = useMemo(
    () => taskList.filter(t => t.status === 'completed'),
    [taskList]
  );

  const blockedTasks = useMemo(
    () => taskList.filter(t => t.status === 'blocked'),
    [taskList]
  );

  const createTask = useCallback((
    content: string,
    options?: {
      phase?: string;
      priority?: TaskMemory['priority'];
      dependencies?: string[];
      notes?: string;
    }
  ) => {
    return addTask({
      content,
      status: 'pending',
      ...options,
    });
  }, [addTask]);

  const startTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'in_progress' });
  }, [updateTask]);

  const finishTask = useCallback((taskId: string, outcomes?: string[]) => {
    completeTask(taskId, outcomes);
  }, [completeTask]);

  const blockTaskWithReason = useCallback((taskId: string, reason: string) => {
    blockTask(taskId, reason);
  }, [blockTask]);

  const unblockTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'pending', blockedBy: undefined });
  }, [updateTask]);

  return {
    tasks: taskList,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    blockedTasks,
    createTask,
    startTask,
    finishTask,
    blockTask: blockTaskWithReason,
    unblockTask,
    updateTask,
    getTasksByStatus,
    getTasksByPhase,
  };
};

/**
 * Hook for session management
 */
export const useSession = () => {
  const {
    currentSession,
    sessionHistory,
    startSession,
    endSession,
    addDecision,
    addBlocker,
    resolveBlocker,
    addInsight,
    addAchievement,
  } = useMemoryStore();

  const isSessionActive = useMemo(() => !!currentSession, [currentSession]);

  const sessionDuration = useMemo(() => {
    if (!currentSession) return 0;
    return Date.now() - currentSession.startedAt.getTime();
  }, [currentSession]);

  const start = useCallback((goals: string[]) => {
    if (currentSession) {
      console.warn('A session is already active. Ending current session...');
      endSession();
    }
    startSession(goals);
  }, [currentSession, startSession, endSession]);

  const end = useCallback((nextSteps?: string[]) => {
    if (!currentSession) {
      console.warn('No active session to end');
      return;
    }
    endSession(nextSteps);
  }, [currentSession, endSession]);

  const recordDecision = useCallback((description: string, rationale?: string) => {
    if (!currentSession) {
      console.warn('No active session. Starting a new session...');
      startSession(['General work session']);
    }
    addDecision(description, rationale);
  }, [currentSession, startSession, addDecision]);

  const recordBlocker = useCallback((description: string) => {
    if (!currentSession) {
      console.warn('No active session. Starting a new session...');
      startSession(['General work session']);
    }
    addBlocker(description);
  }, [currentSession, startSession, addBlocker]);

  return {
    currentSession,
    sessionHistory,
    isSessionActive,
    sessionDuration,
    start,
    end,
    recordDecision,
    recordBlocker,
    resolveBlocker,
    addInsight,
    addAchievement,
  };
};

/**
 * Hook for memory analysis and insights
 */
export const useMemoryAnalysis = () => {
  const {
    thinkAboutProgress,
    thinkAboutContext,
    generateSummary,
  } = useMemoryStore();

  const progress = useMemo(() => thinkAboutProgress(), [thinkAboutProgress]);
  const context = useMemo(() => thinkAboutContext(), [thinkAboutContext]);

  const getSummary = useCallback(() => {
    return generateSummary();
  }, [generateSummary]);

  const getInsights = useCallback(() => {
    const p = thinkAboutProgress();
    const c = thinkAboutContext();

    const insights = [];

    // * Progress insights
    if (p.completionRate > 80) {
      insights.push('🎯 Excellent progress! Over 80% tasks completed.');
    } else if (p.completionRate < 30) {
      insights.push('⚠️ Progress is slow. Consider breaking down tasks.');
    }

    if (p.blockedCount > 3) {
      insights.push(`🚧 ${p.blockedCount} tasks blocked. Focus on unblocking.`);
    }

    if (p.averageTaskDuration > 3600000) { // 1 hour
      insights.push('⏱️ Tasks taking long. Consider smaller chunks.');
    }

    // * Context insights
    if (c.activeBlockers.length > 0) {
      insights.push(`🛑 ${c.activeBlockers.length} active blockers need attention.`);
    }

    if (c.upcomingTasks.length === 0) {
      insights.push('📝 No pending tasks. Time to plan next steps.');
    }

    if (c.recentDecisions.length > 5) {
      insights.push('💭 Many recent decisions. Consider documenting rationale.');
    }

    return insights;
  }, [thinkAboutProgress, thinkAboutContext]);

  return {
    progress,
    context,
    getSummary,
    getInsights,
  };
};

/**
 * Hook for auto-save and persistence
 */
export const useMemoryPersistence = (
  key: string,
  value: any,
  options?: {
    debounceMs?: number;
    category?: MemoryEntry['category'];
    description?: string;
  }
) => {
  const { writeMemory } = useMemoryStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      writeMemory(
        key,
        value,
        options?.category || 'context',
        options?.description
      );
    }, options?.debounceMs || 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, writeMemory, options]);
};

/**
 * Hook for memory cleanup
 */
export const useMemoryCleanup = () => {
  const {
    pruneOldCheckpoints,
    cleanExpiredMemories,
    reset,
  } = useMemoryStore();

  useEffect(() => {
    // Run cleanup on mount
    pruneOldCheckpoints();
    cleanExpiredMemories();

    // Set up periodic cleanup
    const interval = setInterval(() => {
      cleanExpiredMemories();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [pruneOldCheckpoints, cleanExpiredMemories]);

  return {
    pruneOldCheckpoints,
    cleanExpiredMemories,
    reset,
  };
};

// * Export a combined hook for convenience
export const useMemorySystem = () => {
  const memory = useMemory();
  const checkpoints = useCheckpoints();
  const tasks = useTasks();
  const session = useSession();
  const analysis = useMemoryAnalysis();
  const cleanup = useMemoryCleanup();

  return {
    ...memory,
    checkpoints,
    tasks,
    session,
    analysis,
    cleanup,
    // Quick access helpers
    helpers: memoryHelpers,
  };
};