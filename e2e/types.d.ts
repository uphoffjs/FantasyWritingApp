/**
 * Detox Type Definitions for E2E Tests
 *
 * This file provides type definitions for Detox globals used in E2E tests.
 * It resolves ESLint 'no-undef' errors for Detox API methods.
 */

/// <reference types="detox" />

// * Detox globals are automatically available in test files
declare global {
  const device: Detox.Device;
  const element: Detox.Element;
  const by: Detox.Matchers;
  const waitFor: Detox.WaitFor;
  const expect: Detox.Expect<Detox.Expect<any>>;
}

export {};
