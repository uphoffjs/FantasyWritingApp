import { StateCreator } from 'zustand';
import { /* AsyncState, createAsyncState, */ AsyncOperation, createCancellableAsync, isCancelledError } from '../../utils/async';
import { getUserFriendlyMessage } from '../../utils/errorHandling';
import { useNotificationStore } from '../../store/notificationStore';
import { errorLoggingService } from '../../services/errorLogging';

/**
 * Base async store slice providing consistent async operation handling
 */
export interface AsyncSlice {
  // * Loading states for different operations
  loadingStates: Record<string, boolean>;
  
  // * Error states for different operations
  errors: Record<string, Error | null>;
  
  // * Active operations that can be cancelled
  activeOperations: Map<string, AsyncOperation<any>>;
  
  // Actions
  setLoading: (operationId: string, loading: boolean) => void;
  setError: (operationId: string, error: Error | null) => void;
  clearError: (operationId: string) => void;
  clearAllErrors: () => void;
  
  // * Async operation wrapper
  executeAsync: <T>(
    operationId: string,
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      cancelPrevious?: boolean;
    }
  ) => Promise<T>;
  
  // * Cancel an active operation
  cancelOperation: (operationId: string) => void;
  
  // * Cancel all active operations
  cancelAllOperations: () => void;
  
  // * Get loading state for an operation
  isLoading: (operationId: string) => boolean;
  
  // * Get error for an operation
  getError: (operationId: string) => Error | null;
}

export const createAsyncSlice: StateCreator<
  AsyncSlice,
  [],
  [],
  AsyncSlice
> = (set, get) => ({
  loadingStates: {},
  errors: {},
  activeOperations: new Map(),
  
  setLoading: (operationId, loading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [operationId]: loading,
      },
    }));
  },
  
  setError: (operationId, error) => {
    set((state) => ({
      errors: {
        ...state.errors,
        [operationId]: error,
      },
    }));
  },
  
  clearError: (operationId) => {
    set((state) => {
      const { [operationId]: _, ...rest } = state.errors;
      return { errors: rest };
    });
  },
  
  clearAllErrors: () => {
    set({ errors: {} });
  },
  
  executeAsync: async (operationId, asyncFn, options = {}) => {
    const { onSuccess, onError, cancelPrevious = true } = options;
    const { setLoading, setError, activeOperations } = get();
    
    // * Cancel previous operation if requested
    if (cancelPrevious && activeOperations.has(operationId)) {
      const prevOperation = activeOperations.get(operationId);
      prevOperation?.cancel();
    }
    
    // * Set loading state
    setLoading(operationId, true);
    setError(operationId, null);
    
    // * Create cancellable operation
    const operation = createCancellableAsync(asyncFn)();
    activeOperations.set(operationId, operation);
    
    try {
      const result = await operation.promise;
      
      // * Clear from active operations
      activeOperations.delete(operationId);
      
      // * Clear loading state
      setLoading(operationId, false);
      
      // * Call success callback
      onSuccess?.(result);
      
      return result;
    } catch (error) {
      // * Clear from active operations
      activeOperations.delete(operationId);
      
      // * Clear loading state
      setLoading(operationId, false);
      
      // Don't set error if cancelled
      if (!isCancelledError(error)) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setError(operationId, errorObj);
        
        // * Log the error
        errorLoggingService.logError({
          error: errorObj,
          errorInfo: { 
            componentStack: `Async operation: ${operationId}`
          },
          level: 'async',
          metadata: {
            operationId
          }
        });
        
        // ? * Show user-friendly notification
        const { showError } = useNotificationStore.getState();
        const userFriendlyMessage = getUserFriendlyMessage(errorObj);
        showError('Operation Failed', userFriendlyMessage);
        
        onError?.(errorObj);
      }
      
      throw error;
    }
  },
  
  cancelOperation: (operationId) => {
    const { activeOperations } = get();
    const operation = activeOperations.get(operationId);
    if (operation) {
      operation.cancel();
      activeOperations.delete(operationId);
    }
  },
  
  cancelAllOperations: () => {
    const { activeOperations } = get();
    activeOperations.forEach((operation) => operation.cancel());
    activeOperations.clear();
  },
  
  isLoading: (operationId) => {
    return get().loadingStates[operationId] || false;
  },
  
  getError: (operationId) => {
    return get().errors[operationId] || null;
  },
});

/**
 * Helper to create async action IDs with namespacing
 */
export function createAsyncActionId(namespace: string, action: string): string {
  return `${namespace}.${action}`;
}

/**
 * Async action types for common operations
 */
export const AsyncActionTypes = {
  // * Project operations
  CREATE_PROJECT: 'project.create',
  UPDATE_PROJECT: 'project.update',
  DELETE_PROJECT: 'project.delete',
  DUPLICATE_PROJECT: 'project.duplicate',
  EXPORT_PROJECT: 'project.export',
  IMPORT_PROJECT: 'project.import',
  
  // * Element operations
  CREATE_ELEMENT: 'element.create',
  UPDATE_ELEMENT: 'element.update',
  DELETE_ELEMENT: 'element.delete',
  
  // TODO: * Template operations
  CREATE_TEMPLATE: 'template.create',
  DELETE_TEMPLATE: 'template.delete',
  EXPORT_TEMPLATE: 'template.export',
  IMPORT_TEMPLATE: 'template.import',
  
  // * Sync operations
  SYNC_PROJECT: 'sync.project',
  SYNC_ALL: 'sync.all',
  
  // * Search operations
  SEARCH_ELEMENTS: 'search.elements',
  BUILD_INDEX: 'search.buildIndex',
} as const;