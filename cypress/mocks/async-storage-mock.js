/* eslint-disable */
/**
 * AsyncStorage Mock for Cypress E2E Tests
 *
 * This mock prevents webpack compilation errors when React Native modules
 * are inadvertently included in the E2E test bundle.
 *
 * E2E tests should use localStorage directly or cy.window().its('localStorage')
 * instead of AsyncStorage.
 */

const AsyncStorageMock = {
  setItem: (key, value) => {
    console.warn('AsyncStorage.setItem called in E2E test - use localStorage instead');
    return Promise.resolve();
  },

  getItem: (key) => {
    console.warn('AsyncStorage.getItem called in E2E test - use localStorage instead');
    return Promise.resolve(null);
  },

  removeItem: (key) => {
    console.warn('AsyncStorage.removeItem called in E2E test - use localStorage instead');
    return Promise.resolve();
  },

  clear: () => {
    console.warn('AsyncStorage.clear called in E2E test - use localStorage instead');
    return Promise.resolve();
  },

  getAllKeys: () => {
    console.warn('AsyncStorage.getAllKeys called in E2E test - use localStorage instead');
    return Promise.resolve([]);
  },

  multiGet: (keys) => {
    console.warn('AsyncStorage.multiGet called in E2E test - use localStorage instead');
    return Promise.resolve([]);
  },

  multiSet: (keyValuePairs) => {
    console.warn('AsyncStorage.multiSet called in E2E test - use localStorage instead');
    return Promise.resolve();
  },

  multiRemove: (keys) => {
    console.warn('AsyncStorage.multiRemove called in E2E test - use localStorage instead');
    return Promise.resolve();
  }
};

// Export both default and named exports for compatibility
module.exports = AsyncStorageMock;
module.exports.default = AsyncStorageMock;
module.exports.AsyncStorage = AsyncStorageMock;