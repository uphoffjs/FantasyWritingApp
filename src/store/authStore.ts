import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type AuthUser } from '../services/auth'
import type { Profile } from '../types/supabase'
import type { User } from '@supabase/supabase-js'

// Sync status types
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline'

interface AuthStore {
  // Auth state
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isOfflineMode: boolean
  isEmailVerified: boolean
  
  // Sync state
  syncStatus: SyncStatus
  lastSyncedAt: Date | null
  syncError: string | null
  
  // Auth actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
  checkEmailVerification: () => Promise<void>
  
  // Profile actions
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  
  // Mode actions
  setOfflineMode: (offline: boolean) => void
  
  // Sync actions
  setSyncStatus: (status: SyncStatus, error?: string) => void
  updateLastSyncedAt: () => void
  
  // Internal actions
  _setUser: (user: User | null) => void
  _setProfile: (profile: Profile | null) => void
  _setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isOfflineMode: localStorage.getItem('fantasy-element-builder-offline-mode') === 'true',
      isEmailVerified: false,
      
      // Sync state
      syncStatus: 'offline',
      lastSyncedAt: null,
      syncError: null,
      
      // Initialize auth state on app start
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // Check if user is in offline mode
          if (get().isOfflineMode) {
            set({ 
              isLoading: false,
              isAuthenticated: false,
              syncStatus: 'offline'
            })
            return
          }
          
          // Get current user from Supabase
          const user = await authService.getCurrentUser()
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })
            
            // Load profile
            await get().loadProfile()
            
            // Check email verification status
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
        
        // Set up auth state change listener
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
      
      // Sign in with email and password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const { user, error } = await authService.signIn(email, password)
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })
            
            // Load profile
            await get().loadProfile()
            
            // Check email verification status
            await get().checkEmailVerification()
            
            // Update last synced time
            get().updateLastSyncedAt()
          }
          
          return { success: true }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Sign up with email and password
      signUp: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const { user, error } = await authService.signUp(email, password)
          
          if (error) {
            return { 
              success: false, 
              error: error.message 
            }
          }
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              syncStatus: 'synced'
            })
            
            // Profile is created automatically in the service
            await get().loadProfile()
            
            // Check email verification status
            await get().checkEmailVerification()
          }
          
          return { success: true }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Sign out
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
      
      // Reset password
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
      
      // Resend verification email
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
      
      // Check email verification status
      checkEmailVerification: async () => {
        const isVerified = await authService.isEmailVerified()
        set({ isEmailVerified: isVerified })
      },
      
      // Load user profile
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
      
      // Update user profile
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
      
      // Set offline mode
      setOfflineMode: (offline: boolean) => {
        localStorage.setItem('fantasy-element-builder-offline-mode', offline.toString())
        set({ 
          isOfflineMode: offline,
          syncStatus: offline ? 'offline' : 'synced'
        })
      },
      
      // Set sync status
      setSyncStatus: (status: SyncStatus, error?: string) => {
        set({ 
          syncStatus: status,
          syncError: error || null
        })
      },
      
      // Update last synced timestamp
      updateLastSyncedAt: () => {
        set({ lastSyncedAt: new Date() })
      },
      
      // Internal actions
      _setUser: (user: User | null) => set({ user }),
      _setProfile: (profile: Profile | null) => set({ profile }),
      _setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'fantasy-element-builder-auth-store',
      // Only persist offline mode preference and sync status
      partialize: (state) => ({ 
        isOfflineMode: state.isOfflineMode,
        lastSyncedAt: state.lastSyncedAt
      })
    }
  )
)