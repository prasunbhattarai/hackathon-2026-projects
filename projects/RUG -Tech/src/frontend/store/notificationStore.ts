import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'error' | 'success' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

let notifCounter = 0

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 'mock-1',
      type: 'error',
      title: 'Case Processing Failed',
      message: 'Case CLN-00445 encountered a quality check failure.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
    },
    {
      id: 'mock-2',
      type: 'success',
      title: 'Report Ready',
      message: 'Dr. Patel — Analysis complete for patient Ram Bahadur.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: 'mock-3',
      type: 'warning',
      title: 'High Priority Case',
      message: 'Critical triage case requires immediate review.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
    },
  ],
  unreadCount: 3,

  addNotification: (n) => {
    notifCounter++
    const notification: Notification = {
      ...n,
      id: `notif-${Date.now()}-${notifCounter}`,
      read: false,
      createdAt: new Date(),
    }
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markRead: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === id)
      const wasUnread = target && !target.read
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
        unreadCount: wasUnread
          ? state.unreadCount - 1
          : state.unreadCount,
      }
    }),
}))
