import { useNotificationStore } from '../store/notificationStore';
import { errorLoggingService, ErrorSeverity } from '../services/errorLogging';

export interface ErrorContext {
  operation: string;
  details?: Record<string, unknown>;
}

// User-friendly error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  // * Network errors
  'NetworkError': 'Unable to connect to the server. Please check your internet connection.',
  'Failed to fetch': 'Connection failed. Please check your internet connection.',
  'ERR_NETWORK': 'Network connection lost. Your changes will be saved when you reconnect.',
  
  // ! SECURITY: * Auth errors
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'User already registered': 'An account with this email already exists.',
  'Token expired': 'Your session has expired. Please log in again.',
  'Unauthorized': 'You don\'t have permission to perform this action.',
  
  // * Validation errors
  'ValidationError': 'Please check your input and try again.',
  'Required field missing': 'Please fill in all required fields.',
  'Invalid email format': 'Please enter a valid email address.',

  // * Database errors
  'UniqueConstraintError': 'This item already exists. Please use a different name.',
  'ForeignKeyConstraintError': 'Cannot delete this item because it\'s being used elsewhere.',
  'DatabaseError': 'A database error occurred. Please try again later.',
  
  // * File errors
  'File too large': 'The file is too large. Please choose a file under 10MB.',
  'Invalid file type': 'This file type is not supported.',
  'Upload failed': 'Failed to upload the file. Please try again.',
  
  // * Generic errors
  'Internal server error': 'Something went wrong on our end. Please try again later.',
  'Request timeout': 'The request took too long. Please try again.',
  'Invalid request': 'The request was invalid. Please refresh and try again.',
  
  // * Sync errors
  'SyncError': 'Failed to sync your changes. They\'ll be synced when you reconnect.',
  'MergeConflict': 'There\'s a conflict with changes from another device. Please review and merge.',
  'OfflineError': 'This action requires an internet connection.',
};

/**
 * Get a user-friendly error message from an error object
 */
export function getUserFriendlyMessage(error: unknown): string {
  // * Check for specific error messages
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message;
      }
    }
  }

  // * Check error type/name
  if (error && typeof error === 'object' && 'name' in error && typeof error.name === 'string' && ERROR_MESSAGES[error.name]) {
    return ERROR_MESSAGES[error.name];
  }

  // * Check error code
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // * Default message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle async operations with error handling and notifications
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  _context: ErrorContext,
  options: {
    showSuccessNotification?: boolean;
    successMessage?: string;
    showErrorNotification?: boolean;
    errorTitle?: string;
    rethrow?: boolean;
  } = {}
): Promise<T | null> {
  const {
    showSuccessNotification = false,
    successMessage = 'Operation completed successfully',
    showErrorNotification = true,
    errorTitle = 'Operation Failed',
    rethrow = false,
  } = options;
  
  const { showError, showSuccess } = useNotificationStore.getState();
  
  try {
    const result = await operation();
    
    if (showSuccessNotification) {
      showSuccess(successMessage);
    }
    
    return result;
  } catch (error: unknown) {
    // * Log the error
    const err = error instanceof Error ? error : new Error(String(error));
    errorLoggingService.logError(err, {
      severity: ErrorSeverity.HIGH
    });
    
    // ? * Show user-friendly notification
    if (showErrorNotification) {
      const message = getUserFriendlyMessage(error);
      showError(errorTitle, message);
    }
    
    // * Rethrow if needed
    if (rethrow) {
      throw error;
    }
    
    return null;
  }
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context: string,
  options: Parameters<typeof handleAsyncOperation>[2] = {}
): (...args: TArgs) => Promise<TReturn | null> {
  return async (...args: TArgs) => {
    return handleAsyncOperation(
      () => fn(...args),
      { operation: context, details: { args } },
      options
    );
  };
}

/**
 * React hook for handling async operations with loading state
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  options: Parameters<typeof handleAsyncOperation>[2] = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await handleAsyncOperation(operation, context, {
        ...options,
        rethrow: true,
      });
      return result;
    } catch (err: unknown) {
      const caughtError = err instanceof Error ? err : new Error(String(err));
      setError(caughtError);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, [operation, context, options]);
  
  return { execute, isLoading, error };
}

import { useState, useCallback } from 'react';

/**
 * Validate common input types
 */
export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },
  
  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min;
  },
  
  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max;
  },
  
  pattern: (pattern: RegExp) => (value: string): boolean => {
    return pattern.test(value);
  },
};