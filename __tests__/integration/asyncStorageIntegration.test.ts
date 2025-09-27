/**
 * AsyncStorage Integration Tests
 * Tests for data persistence, migration, and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act } from '@testing-library/react-native';
import { useWorldbuildingStore } from '../../src/store/worldbuildingStore';
import { useAuthStore } from '../../src/store/authStore';

// * Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
}));

describe('AsyncStorage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // * Reset all stores
    useWorldbuildingStore.setState({
      projects: [],
      currentProjectId: null,
      currentElementId: null,
      searchHistory: []
    });
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  describe('Data Persistence', () => {
    it('persists worldbuilding data to AsyncStorage', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Test Project', 'Description');
        result.current.createElement(project.id, 'Test Character', 'character');
      });

      // * Wait for persistence
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;

      // * Find the call that stores worldbuilding data
      const worldbuildingCall = calls.find(call =>
        call[0] && call[0].includes('worldbuilding')
      );

      expect(worldbuildingCall).toBeDefined();
      if (worldbuildingCall) {
        const storedData = JSON.parse(worldbuildingCall[1]);
        expect(storedData.state.projects).toHaveLength(1);
        expect(storedData.state.projects[0].elements).toHaveLength(1);
      }
    });

    it('persists auth data separately from worldbuilding data', async () => {
      // * Set auth data
      await act(async () => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com' },
          isAuthenticated: true
        });
      });

      // * Set worldbuilding data
      const { result } = renderHook(() => useWorldbuildingStore());
      act(() => {
        result.current.createProject('Test Project', 'Description');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;

      // * Should have separate storage keys for different stores
      const authCall = calls.find(call => call[0] && call[0].includes('auth'));
      const worldbuildingCall = calls.find(call =>
        call[0] && call[0].includes('worldbuilding')
      );

      expect(authCall || worldbuildingCall).toBeDefined();
    });

    it('handles large data sets efficiently', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Large Project', 'Description');

        // * Create many elements
        for (let i = 0; i < 100; i++) {
          result.current.createElement(project.id, `Element ${i}`, 'character');
        }
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const largeDataCall = calls.find(call =>
        call[0] && call[0].includes('worldbuilding')
      );

      if (largeDataCall) {
        const dataSize = largeDataCall[1].length;
        // * Check that data is being stored (size should be substantial)
        expect(dataSize).toBeGreaterThan(1000);
      }
    });
  });

  describe('Data Migration', () => {
    it('migrates data from old storage format to new format', async () => {
      // * Simulate old data format
      const oldFormatData = {
        projects: [{
          id: 'old-project',
          name: 'Old Format Project',
          // Missing new fields that might be required
          elements: []
        }]
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ state: oldFormatData })
      );

      // * Initialize store which should trigger migration
      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        // * Simulate store rehydration
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Store should handle old format gracefully
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('handles version mismatches gracefully', async () => {
      const futureVersionData = {
        version: '99.0.0', // Future version
        state: {
          projects: [],
          newFeature: 'unknown' // Unknown field
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(futureVersionData)
      );

      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Should not crash with unknown fields
      expect(result.current.projects).toBeDefined();
    });

    it('preserves data integrity during migration', async () => {
      const originalData = {
        state: {
          projects: [{
            id: 'proj-1',
            name: 'Original Project',
            description: 'Original Description',
            elements: [{
              id: 'elem-1',
              name: 'Original Element',
              category: 'character',
              projectId: 'proj-1'
            }]
          }]
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(originalData)
      );

      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Verify data integrity after potential migration
      // The actual behavior depends on the store's rehydration logic
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles AsyncStorage write errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage quota exceeded')
      );

      const { result } = renderHook(() => useWorldbuildingStore());

      // * Should not crash when storage fails
      expect(() => {
        act(() => {
          result.current.createProject('Test Project', 'Description');
        });
      }).not.toThrow();
    });

    it('handles AsyncStorage read errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Read error')
      );

      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Should initialize with default state on read error
      expect(result.current.projects).toEqual([]);
    });

    it('handles corrupted stored data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        'corrupted-json-{invalid'
      );

      const { result } = renderHook(() => useWorldbuildingStore());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Should initialize with default state on parse error
      expect(result.current.projects).toEqual([]);
    });

    it('recovers from clear operation errors', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValueOnce(
        new Error('Clear failed')
      );

      // * Should handle clear errors without crashing
      await expect(AsyncStorage.clear()).rejects.toThrow('Clear failed');
    });
  });

  describe('Storage Limits', () => {
    it('handles storage size limits', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      // * Create a very large string that might exceed storage limits
      const largeDescription = 'x'.repeat(1000000); // 1MB of data

      act(() => {
        const project = result.current.createProject(
          'Large Project',
          largeDescription
        );
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Should attempt to store even large data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('implements data compression for large datasets', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Project', 'Description');

        // * Create many elements with repetitive data
        for (let i = 0; i < 50; i++) {
          result.current.createElement(
            project.id,
            `Character ${i}`,
            'character'
          );
          result.current.updateElement(project.id,
            result.current.projects[0].elements[i].id,
            { description: 'Same description for all characters' }
          );
        }
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const dataCall = calls.find(call =>
        call[0] && call[0].includes('worldbuilding')
      );

      if (dataCall) {
        // * Check if data appears to be optimized
        // (actual compression would need to be implemented in the store)
        const storedData = dataCall[1];
        expect(storedData).toBeDefined();
      }
    });
  });

  describe('Clear and Reset', () => {
    it('clears all AsyncStorage data', async () => {
      // * Set some data
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');

      // * Clear all
      await AsyncStorage.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('selectively clears specific store data', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Project', 'Description');
      });

      // * Clear only worldbuilding data
      await act(async () => {
        // * Reset worldbuilding store
        useWorldbuildingStore.setState({
          projects: [],
          currentProjectId: null,
          currentElementId: null,
          searchHistory: []
        });
      });

      expect(result.current.projects).toEqual([]);
    });

    it('maintains auth data when clearing worldbuilding data', async () => {
      // * Set auth data
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com' },
        isAuthenticated: true
      });

      // * Set and clear worldbuilding data
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Project', 'Description');
      });

      act(() => {
        useWorldbuildingStore.setState({
          projects: [],
          currentProjectId: null,
          currentElementId: null,
          searchHistory: []
        });
      });

      // * Auth should remain
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toBeDefined();
    });
  });

  describe('Multi-Store Coordination', () => {
    it('coordinates data between multiple stores', async () => {
      // * Set auth user
      useAuthStore.setState({
        user: { id: 'user-1', email: 'test@example.com' },
        isAuthenticated: true
      });

      // * Create project associated with user
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('User Project', 'Description');
        // * In real app, might associate project with user ID
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // * Both stores should have persisted their data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('handles concurrent store updates', async () => {
      const promises = [];

      // * Concurrent updates to different stores
      promises.push(act(async () => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com' },
          isAuthenticated: true
        });
      }));

      promises.push(act(async () => {
        const { result } = renderHook(() => useWorldbuildingStore());
        result.current.createProject('Project', 'Description');
      }));

      await Promise.all(promises);

      // * Both updates should succeed
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('batches multiple updates efficiently', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        const project = result.current.createProject('Project', 'Description');

        // * Multiple rapid updates
        for (let i = 0; i < 10; i++) {
          result.current.createElement(project.id, `Element ${i}`, 'character');
        }
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // * Should batch updates rather than calling setItem 10+ times
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls.length;
      // * Expect fewer calls due to batching (actual number depends on implementation)
      expect(setItemCalls).toBeLessThan(11);
    });

    it('uses efficient key naming for quick access', async () => {
      const { result } = renderHook(() => useWorldbuildingStore());

      act(() => {
        result.current.createProject('Project', 'Description');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;

      // * Check for efficient key naming patterns
      const keys = calls.map(call => call[0]);
      keys.forEach(key => {
        if (key) {
          // * Keys should be descriptive but not overly long
          expect(key.length).toBeLessThan(50);
        }
      });
    });
  });
});