import React from 'react';
import { ElementBrowser } from '../../../src/components/ElementBrowser';

/**
 * Wrapper component for ElementBrowser that provides mock store context
 * This allows us to test ElementBrowser without the real Zustand store
 */
export const ElementBrowserWrapper: React.FC = () => {
  // The ElementBrowser will use the mock store provided by MockStoreProvider
  // in mount-helpers.tsx
  return <ElementBrowser />;
};