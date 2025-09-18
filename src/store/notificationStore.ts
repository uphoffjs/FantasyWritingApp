import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Notification } from '../components/ErrorNotification';

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // * Helper methods
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const DEFAULT_DURATION = 5000; // 5 seconds

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notifications: [],
    
    addNotification: (notification) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? DEFAULT_DURATION,
      };
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));
    },
    
    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
    
    clearNotifications: () => {
      set({ notifications: [] });
    },
    
    showSuccess: (title, message, duration) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification({ type: 'success', title, message, duration });
    },
    
    showError: (title, message, duration = 0) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification({ type: 'error', title, message, duration });
    },
    
    showWarning: (title, message, duration) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification({ type: 'warning', title, message, duration });
    },
    
    showInfo: (title, message, duration) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification({ type: 'info', title, message, duration });
    },
  }), { name: 'notification-store' })
);