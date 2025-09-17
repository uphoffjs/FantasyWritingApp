import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: ToastAction
  duration?: number // ms, 0 = persistent
  createdAt: Date
}

export interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string // Alias for addToast
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toastData) => {
    const id = uuidv4()
    const toast: Toast = {
      ...toastData,
      id,
      createdAt: new Date(),
      duration: toastData.duration ?? (toastData.type === 'error' ? 0 : 3000)
    }
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }))
    
    // Auto-remove non-persistent toasts
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, toast.duration)
    }
    
    return id
  },
  
  // Alias for addToast for backward compatibility
  showToast: (toastData): string => {
    return useToastStore.getState().addToast(toastData)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },
  
  clearAllToasts: () => {
    set({ toasts: [] })
  }
}))

// Helper functions for common toast types
export const showSuccessToast = (title: string, message?: string) => {
  return useToastStore.getState().addToast({
    type: 'success',
    title,
    message
  })
}

export const showErrorToast = (title: string, message?: string, action?: ToastAction) => {
  return useToastStore.getState().addToast({
    type: 'error',
    title,
    message,
    action,
    duration: 0 // Errors persist until dismissed
  })
}

export const showInfoToast = (title: string, message?: string) => {
  return useToastStore.getState().addToast({
    type: 'info',
    title,
    message
  })
}

export const showWarningToast = (title: string, message?: string) => {
  return useToastStore.getState().addToast({
    type: 'warning',
    title,
    message
  })
}

// Specific toast helpers for sync operations
export const showSyncSuccessToast = () => {
  return showSuccessToast('Changes saved to cloud', 'All your projects are backed up')
}

export const showSyncErrorToast = (retry: () => void) => {
  return showErrorToast(
    'Failed to save changes',
    'Your work is safe locally.',
    { label: 'Retry', onClick: retry }
  )
}

export const showOfflineToast = () => {
  return showInfoToast(
    'Working offline',
    'Changes will sync when connection is restored'
  )
}