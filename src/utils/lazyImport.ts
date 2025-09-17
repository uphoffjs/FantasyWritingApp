import { ComponentType, lazy } from 'react';

/**
 * Named export lazy loading utility
 * This allows us to lazy load components that use named exports
 */
export function lazyImport<
  T extends ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I,
>(
  factory: () => Promise<I>,
  name: K
): I {
  return Object.create({
    [name]: lazy(() => factory().then((module) => ({ default: module[name] })))
  });
}

/**
 * Retry mechanism for lazy imports
 * This helps with network issues and ensures components load eventually
 */
export function lazyImportWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user's internet connection is back online,
        // refresh the page so they have the latest assets
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null } as any;
      }

      // The page has already been force refreshed,
      // so throw the original error
      throw error;
    }
  });
}