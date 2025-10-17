import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type AuthUser } from '../services/auth'
import type { Profile } from '../types/supabase'
import type { User } from '@supabase/supabase-js'

// * Sync status types for offline/online state management
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline'

interface AuthStore {
  // ! SECURITY: * Authentication state properties
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isOfflineMode: boolean
  isEmailVerified: boolean
  authError: string | null  // * Authentication error message for UI display

  // * Synchronization state tracking
  syncStatus: SyncStatus
  lastSyncedAt: Date | null
  syncError: string | null
  
  // ! SECURITY: * Authentication action methods
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
  checkEmailVerification: () => Promise<void>
  
  // * User profile management actions
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>

  // * Error management
  clearAuthError: () => void

  // * Application mode toggles
  setOfflineMode: (offline: boolean) => void
  
  // * Synchronization control actions
  setSyncStatus: (status: SyncStatus, error?: string) => void
  updateLastSyncedAt: () => void
  
  // ! INTERNAL: Direct state setters - avoid using externally
  _setUser: (user: User | null) => void
  _setProfile: (profile: Profile | null) => void
  _setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ! SECURITY: * Initial authentication state
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      // ! SECURITY: ! SECURITY: Storing offline mode preference in localStorage
      isOfflineMode: // ! SECURITY: Using localStorage
      localStorage.getItem('fantasy-element-builder-offline-mode') === 'true',
      isEmailVerified: false,
      authError: null,  // * Authentication error message

      // * Initial sync state
      syncStatus: 'offline',
      lastSyncedAt: null,
      syncError: null,
      
      // ! SECURITY: * Initialize auth state on app start - critical startup flow
      initialize: async () => {
        set({ isLoading: true })

        try {
          // * Handle offline mode initialization
          if (get().isOfflineMode) {
            set({
              isLoading: false,
              isAuthenticated: false,
              syncStatus: 'offline'
            })
            return
          }

          // ! SECURITY: * Fetch current authenticated user from Supabase
          const user = await authService.getCurrentUser()
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })
            
            // * Load profile
            await get().loadProfile()
            
            // * Check email verification status
            await get().checkEmailVerification()
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              syncStatus: 'offline',
              isEmailVerified: false
            })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ 
            syncStatus: 'error',
            syncError: error instanceof Error ? error.message : 'Failed to initialize auth'
          })
        } finally {
          set({ isLoading: false })
        }
        
        // ! SECURITY: * Set up auth state change listener
        authService.onAuthStateChange((user) => {
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })
            get().loadProfile()
            get().checkEmailVerification()
          } else {
            set({ 
              user: null,
              profile: null,
              isAuthenticated: false,
              syncStatus: 'offline',
              isEmailVerified: false
            })
          }
        })
      },
      
      // ! SECURITY: * Sign in with email and password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, authError: null })  // * Clear any previous auth errors

        try {
          const data = await authService.signIn(email, password)
          const user = data.user

          if (user) {
            set({
              user,
              isAuthenticated: true,
              syncStatus: 'synced',
              authError: null  // * Clear error on success
            })

            // * Load profile
            await get().loadProfile()

            // * Check email verification status
            await get().checkEmailVerification()

            // * Update last synced time
            get().updateLastSyncedAt()

            return { success: true }
          } else {
            // * No user returned - authentication failed
            const errorMessage = 'Invalid email or password'
            set({ authError: errorMessage })  // * Set error in store
            return {
              success: false,
              error: errorMessage
            }
          }
        } catch (error) {
          // * Handle authentication errors thrown by authService
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
          set({ authError: errorMessage })  // * Set error in store
          return {
            success: false,
            error: errorMessage
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // ! SECURITY: * Sign up with email and password
      signUp: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          const data = await authService.signUp(email, password)
          const user = data.user

          if (user) {
            set({
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })

            // * Profile is created automatically in the service
            await get().loadProfile()

            // * Check email verification status
            await get().checkEmailVerification()
          }

          return { success: true }
        } catch (error) {
          // * Handle authentication errors thrown by authService
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
          return {
            success: false,
            error: errorMessage
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // * Sign out
      signOut: async () => {
        set({ isLoading: true })
        
        try {
          const { error } = await authService.signOut()
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          set({ 
            user: null,
            profile: null,
            isAuthenticated: false,
            syncStatus: 'offline',
            lastSyncedAt: null
          })
          
          return { success: true }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // ! SECURITY: * Reset password
      resetPassword: async (email: string) => {
        try {
          const { error } = await authService.resetPassword(email)
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to reset password'
          }
        }
      },
      
      // * Resend verification email
      resendVerificationEmail: async () => {
        const { user } = get()
        
        if (!user || !user.email) {
          return { 
            success: false, 
            error: 'No user email found' 
          }
        }
        
        try {
          const { error } = await authService.resendVerificationEmail(user.email)
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to resend verification email'
          }
        }
      },
      
      // * Check email verification status
      checkEmailVerification: async () => {
        const isVerified = await authService.isEmailVerified()
        set({ isEmailVerified: isVerified })
      },
      
      // * Load user profile
      loadProfile: async () => {
        const { user } = get()
        
        if (!user) return
        
        try {
          const profile = await authService.getProfile(user.id)
          
          if (profile) {
            set({ profile })
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      },
      
      // * Update user profile
      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get()
        
        if (!user) {
          return { 
            success: false, 
            error: 'No authenticated user' 
          }
        }
        
        try {
          const { profile, error } = await authService.updateProfile(user.id, updates)
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          if (profile) {
            set({ profile })
          }
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update profile'
          }
        }
      },
      
      // * Set offline mode
      // * Clear authentication error
      clearAuthError: () => {
        set({ authError: null })
      },

      setOfflineMode: (offline: boolean) => {
        localStorage.setItem('fantasy-element-builder-offline-mode', offline.toString())
        set({
          isOfflineMode: offline,
          syncStatus: offline ? 'offline' : 'synced'
        })
      },
      
      // * Set sync status
      setSyncStatus: (status: SyncStatus, error?: string) => {
        set({ 
          syncStatus: status,
          syncError: error || null
        })
      },
      
      // * Update last synced timestamp
      updateLastSyncedAt: () => {
        set({ lastSyncedAt: new Date() })
      },
      
      // * Internal actions
      _setUser: (user: User | null) => set({ user }),
      _setProfile: (profile: Profile | null) => set({ profile }),
      _setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      // * Persist user session data for seamless experience across browser sessions
      // * This follows best practices for creative workspace apps (like Google Docs, Notion)
      // * Security: Token expiration + HTTPS + explicit logout button
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        // ! IMPORTANT: Do NOT persist isAuthenticated - it should be derived from user/session
        // isAuthenticated: state.isAuthenticated,
        isOfflineMode: state.isOfflineMode,
        lastSyncedAt: state.lastSyncedAt
      }),
      // * Validate session on rehydration from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ! SECURITY: Set isAuthenticated based on user/session presence
          // This ensures isAuthenticated is always in sync with actual auth data
          if (!state.user || !state.session) {
            // Session is invalid or expired
            state.isAuthenticated = false
            state.user = null
            state.session = null
          } else {
            // Valid session exists
            state.isAuthenticated = true
          }
        }
      }
    }
  )
)