import { create } from 'zustand'

export type ViewMode = 'home' | 'people' | 'chat' | 'profile' | 'legal' | 'settings' | 'notifications'

interface User {
  id: string
  email: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
  isVerified: boolean
  isAdmin: boolean
  isPrivate: boolean
}

interface AppState {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoadingAuth: boolean

  // Navigation
  currentView: ViewMode
  viewingUserId: string | null
  viewingChatId: string | null
  viewingLegalPage: string | null

  // UI State
  showAuthModal: boolean
  authModalTab: 'login' | 'signup'
  showCreatePost: boolean
  showOnboarding: boolean
  sidebarCollapsed: boolean

  // Feed refresh
  feedRefreshKey: number

  // Actions
  setUser: (user: User | null, token?: string | null) => void
  setCurrentView: (view: ViewMode) => void
  setViewingUserId: (id: string | null) => void
  setViewingChatId: (id: string | null) => void
  setViewingLegalPage: (page: string | null) => void
  setShowAuthModal: (show: boolean, tab?: 'login' | 'signup') => void
  setShowCreatePost: (show: boolean) => void
  setShowOnboarding: (show: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  incrementFeedRefreshKey: () => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  currentView: 'home',
  viewingUserId: null,
  viewingChatId: null,
  viewingLegalPage: null,
  showAuthModal: false,
  authModalTab: 'login',
  showCreatePost: false,
  showOnboarding: false,
  sidebarCollapsed: false,
  feedRefreshKey: 0,

  setUser: (user, token) => set({
    user,
    token: token !== undefined ? token : null,
    isAuthenticated: !!user,
    isLoadingAuth: false,
  }),

  setCurrentView: (view) => set({ currentView: view }),

  setViewingUserId: (id) => set({ viewingUserId: id, currentView: id ? 'profile' : 'home' }),

  setViewingChatId: (id) => set({ viewingChatId: id, currentView: 'chat' }),

  setViewingLegalPage: (page) => set({ viewingLegalPage: page, currentView: page ? 'legal' : 'home' }),

  setShowAuthModal: (show, tab = 'login') => set({ showAuthModal: show, authModalTab: tab }),

  setShowCreatePost: (show) => set({ showCreatePost: show }),

  setShowOnboarding: (show) => set({ showOnboarding: show }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  incrementFeedRefreshKey: () => set((state) => ({ feedRefreshKey: state.feedRefreshKey + 1 })),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('void-token')
      localStorage.removeItem('void-user')
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentView: 'home',
    })
  },
}))
