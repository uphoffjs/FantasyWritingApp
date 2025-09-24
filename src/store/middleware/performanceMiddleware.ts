import { StateCreator } from 'zustand';
import { performanceMonitor } from '../../utils/performanceMonitor';

type PerformanceMiddlewareImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
  options?: {
    enablePerformanceTracking?: boolean;
    performanceThreshold?: number;
  }
) => StateCreator<T, [], []>;

export const performanceMiddleware: PerformanceMiddlewareImpl = (
  config,
  options = {}
) => {
  const { enablePerformanceTracking = true, performanceThreshold = 50 } = options;

  return (set, get, api) =>
    config(
      (args) => {
        if (!enablePerformanceTracking) {
          set(args);
          return;
        }

        // ! PERFORMANCE: * Start performance measurement
        const startTime = performance.now();
        const actionName = getActionName(args);

        // * Perform the state update
        set(args);

        // ! PERFORMANCE: * End performance measurement
        const duration = performance.now() - startTime;

        // * Record the metric
        performanceMonitor.recordMetric('store_update', duration, 'ms', {
          action: actionName,
          threshold: performanceThreshold,
        });

        // // DEPRECATED: * Log warning if over threshold
        if (duration > performanceThreshold) {
          console.warn(
            `Store update took ${duration.toFixed(2)}ms (action: ${actionName}, threshold: ${performanceThreshold}ms)`
          );
        }
      },
      get,
      api
    );
};

/**
 * Extract action name from state update
 */
function getActionName(update: any): string {
  if (typeof update === 'function') {
    // * Try to get function name or use 'anonymous'
    const fnString = update.toString();
    const match = fnString.match(/function\s*(\w+)/);
    return match ? match[1] : 'anonymous_action';
  }
  
  // * For object updates, find the keys being updated
  if (typeof update === 'object' && update !== null) {
    const keys = Object.keys(update);
    return keys.length > 0 ? `update_${keys.join('_')}` : 'update_state';
  }
  
  return 'unknown_action';
}