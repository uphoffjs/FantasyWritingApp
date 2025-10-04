/**
 * AuthStore Tests
 * Tests for authentication store with AsyncStorage integration
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../../src/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../src/services/auth';

// * Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
}));

// * Mock auth service
jest.mock('../../src/services/auth', () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    verifyEmail: jest.fn(),
  }
}));

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // * Reset store state
    const store = useAuthStore.getState();
    act(() => {
      store.user = null;
      store.isAuthenticated = false;
      store.isLoading = false;
      store.error = null;
    });
  });

  describe('Store Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('has all required auth methods', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
    });
  });

  describe('Authentication Actions', () => {
    it('handles successful sign in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: mockUser
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password123');
        expect(response.success).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('handles sign in failure', async () => {
      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Invalid credentials'
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('wrong@example.com', 'wrongpass');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid credentials');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('handles successful sign up', async () => {
      const mockUser = {
        id: 'new-user-456',
        email: 'newuser@example.com',
        displayName: 'New User'
      };

      (authService.signUp as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: mockUser
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('newuser@example.com', 'password123');
        expect(response.success).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('handles sign out', async () => {
      // * First sign in
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: mockUser
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // * Then sign out
      (authService.signOut as jest.Mock).mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Loading States', () => {
    it('sets loading state during authentication', async () => {
      (authService.signIn as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          user: { id: '1', email: 'test@example.com' }
        }), 100))
      );

      const { result } = renderHook(() => useAuthStore());

      const signInPromise = act(async () => {
        const promise = result.current.signIn('test@example.com', 'password');
        expect(result.current.isLoading).toBe(true);
        return promise;
      });

      await signInPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('AsyncStorage Integration', () => {
    it('persists user data to AsyncStorage on sign in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: mockUser,
        token: 'auth-token-123'
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth-token', 'auth-token-123');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('clears AsyncStorage on sign out', async () => {
      const { result } = renderHook(() => useAuthStore());

      (authService.signOut as jest.Mock).mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.signOut();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('initializes auth state from AsyncStorage', async () => {
      const storedUser = {
        id: 'stored-user',
        email: 'stored@example.com',
        displayName: 'Stored User'
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('stored-token')
        .mockResolvedValueOnce(JSON.stringify(storedUser));

      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(storedUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toEqual(storedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('handles missing stored auth data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('handles corrupted stored user data', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('token')
        .mockResolvedValueOnce('invalid-json');

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Profile Management', () => {
    it('updates user profile', async () => {
      const initialUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const updatedUser = {
        ...initialUser,
        displayName: 'Updated Name'
      };

      // * Set initial user
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        useAuthStore.setState({
          user: initialUser,
          isAuthenticated: true
        });
      });

      (authService.updateProfile as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: updatedUser
      });

      await act(async () => {
        await result.current.updateProfile({ displayName: 'Updated Name' });
      });

      expect(result.current.user?.displayName).toBe('Updated Name');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
    });

    it('handles profile update failure', async () => {
      const initialUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const { result } = renderHook(() => useAuthStore());
      act(() => {
        useAuthStore.setState({
          user: initialUser,
          isAuthenticated: true
        });
      });

      (authService.updateProfile as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Update failed'
      });

      await act(async () => {
        const response = await result.current.updateProfile({ displayName: 'New Name' });
        expect(response.success).toBe(false);
      });

      // * User should remain unchanged
      expect(result.current.user?.displayName).toBe('Test User');
    });
  });

  describe('Password Reset', () => {
    it('handles password reset request', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValueOnce({
        success: true
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response.success).toBe(true);
      });

      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('handles password reset failure', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Email not found'
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.resetPassword('unknown@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Email not found');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      (authService.signIn as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password');
        expect(response.success).toBe(false);
        expect(response.error).toContain('error');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('clears error state on successful action', async () => {
      const { result } = renderHook(() => useAuthStore());

      // * Set initial error state
      act(() => {
        useAuthStore.setState({ error: 'Previous error' });
      });

      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: { id: '1', email: 'test@example.com' }
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('stores and retrieves auth token', async () => {
      const token = 'jwt-token-12345';

      (authService.signIn as jest.Mock).mockResolvedValueOnce({
        success: true,
        user: { id: '1', email: 'test@example.com' },
        token
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth-token', token);
    });

    it('removes token on sign out', async () => {
      const { result } = renderHook(() => useAuthStore());

      (authService.signOut as jest.Mock).mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.signOut();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
    });
  });

  describe('Session Persistence', () => {
    it('restores session from AsyncStorage', async () => {
      const storedUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('stored-token')
        .mockResolvedValueOnce(JSON.stringify(storedUser));

      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(storedUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(storedUser);
    });

    it('handles expired session', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce(JSON.stringify({ id: '1', email: 'test@example.com' }));

      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
});