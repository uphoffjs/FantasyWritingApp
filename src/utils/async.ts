/**
 * Async operation utilities for consistent promise handling, loading states, and cancellation
 */

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch?: Date;
}

export interface AsyncOperation<T> {
  promise: Promise<T>;
  cancel: () => void;
}

/**
 * Creates an initial async state
 */
export function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
  return {
    data: initialData,
    loading: false,
    error: null,
  };
}

/**
 * Wraps an async function with cancellation support
 */
export function createCancellableAsync<TArgs extends unknown[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => AsyncOperation<TResult> {
  return (...args: TArgs) => {
    let cancelled = false;
    
    const promise = asyncFn(...args).then(
      (result) => {
        if (cancelled) {
          throw new Error('Operation cancelled');
        }
        return result;
      },
      (error) => {
        if (cancelled) {
          throw new Error('Operation cancelled');
        }
        throw error;
      }
    );

    return {
      promise,
      cancel: () => {
        cancelled = true;
      },
    };
  };
}

/**
 * Error class for cancelled operations
 */
export class CancelledError extends Error {
  constructor(message = 'Operation cancelled') {
    super(message);
    this.name = 'CancelledError';
  }
}

/**
 * Checks if an error is a cancellation error
 */
export function isCancelledError(error: unknown): error is CancelledError {
  return error instanceof CancelledError || (error as Error)?.message === 'Operation cancelled';
}

/**
 * Creates a debounced async function that cancels previous calls
 */
export function createDebouncedAsync<TArgs extends unknown[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
  delay: number
): (...args: TArgs) => AsyncOperation<TResult> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentOperation: AsyncOperation<TResult> | null = null;

  return (...args: TArgs) => {
    // * Cancel previous operation
    if (currentOperation) {
      currentOperation.cancel();
    }

    // * Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    let cancelled = false;

    const promise = new Promise<TResult>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          if (cancelled) {
            throw new CancelledError();
          }
          const result = await asyncFn(...args);
          if (cancelled) {
            throw new CancelledError();
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });

    currentOperation = {
      promise,
      cancel: () => {
        cancelled = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
    };

    return currentOperation;
  };
}

/**
 * Retries an async operation with exponential backoff
 */
export async function retryAsync<T>(
  asyncFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // * Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Creates an optimistic update wrapper
 */
export function createOptimisticUpdate<T, TResult>(
  optimisticUpdate: (current: T) => T,
  asyncFn: () => Promise<TResult>,
  rollback: (current: T, original: T) => T
): (currentState: T) => {
  promise: Promise<TResult>;
  optimisticState: T;
  rollback: () => T;
} {
  return (currentState: T) => {
    const originalState = currentState;
    const optimisticState = optimisticUpdate(currentState);

    const promise = asyncFn().catch((error) => {
      // TODO: * On error, we'll need to rollback
      throw error;
    });

    return {
      promise,
      optimisticState,
      rollback: () => rollback(optimisticState, originalState),
    };
  };
}