/**
 * Cross-platform storage adapter for Zustand
 * Works with both React Native (AsyncStorage) and Web (localStorage)
 */

import { Platform } from 'react-native';

// * Define the storage interface
export interface CrossPlatformStorage {
  getItem: (name: string) => Promise<string | null> | string | null;
  setItem: (name: string, value: string) => Promise<void> | void;
  removeItem: (name: string) => Promise<void> | void;
}

// * Dynamically import AsyncStorage only for native platforms
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

/**
 * Creates a cross-platform storage adapter
 * Uses localStorage for web and AsyncStorage for native
 */
export const createCrossPlatformStorage = (): CrossPlatformStorage => {
  // * Check if we're running on web or native
  if (Platform.OS === 'web') {
    // * Web environment - use localStorage
    return {
      getItem: (name: string) => {
        try {
          return // ! SECURITY: Using localStorage
      localStorage.getItem(name);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (name: string, value: string) => {
        try {
          localStorage.setItem(name, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      },
    };
  } else {
    // * Native environment - use AsyncStorage
    return {
      getItem: async (name: string) => {
        try {
          return await AsyncStorage.getItem(name);
        } catch (error) {
          console.error('Error reading from AsyncStorage:', error);
          return null;
        }
      },
      setItem: async (name: string, value: string) => {
        try {
          await AsyncStorage.setItem(name, value);
        } catch (error) {
          console.error('Error writing to AsyncStorage:', error);
        }
      },
      removeItem: async (name: string) => {
        try {
          await AsyncStorage.removeItem(name);
        } catch (error) {
          console.error('Error removing from AsyncStorage:', error);
        }
      },
    };
  }
};

// * Create a single instance of the storage
const storageInstance = createCrossPlatformStorage();

/**
 * Storage adapter for Zustand persist middleware
 * Handles both sync (web) and async (native) storage operations
 */
export const crossPlatformStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = storageInstance.getItem(name);
    
    // * Handle both sync and async returns
    if (result instanceof Promise) {
      return result;
    }
    return Promise.resolve(result);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const result = storageInstance.setItem(name, value);
    
    // * Handle both sync and async returns
    if (result instanceof Promise) {
      return result;
    }
    return Promise.resolve();
  },
  removeItem: async (name: string): Promise<void> => {
    const result = storageInstance.removeItem(name);
    
    // * Handle both sync and async returns
    if (result instanceof Promise) {
      return result;
    }
    return Promise.resolve();
  },
};

/**
 * Migration helper to transfer data from old storage to new storage
 * Useful when transitioning from web app to native app
 */
export const migrateStorageData = async (
  storageKey: string,
  oldData?: string
): Promise<boolean> => {
  try {
    const storage = createCrossPlatformStorage();
    
    // * Check if data already exists in new storage
    const existingData = await crossPlatformStorage.getItem(storageKey);
    
    if (!existingData && oldData) {
      // // DEPRECATED: * Migrate old data to new storage
      await crossPlatformStorage.setItem(storageKey, oldData);
      return true;
    }
    
    if (existingData) {
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error migrating storage data:', error);
    return false;
  }
};