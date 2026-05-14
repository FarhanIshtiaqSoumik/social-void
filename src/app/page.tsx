'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ViewMode } from '@/stores/app-store'
import { LandingPage } from '@/components/social/landing-page'
import { AuthModal } from '@/components/auth/auth-modal'
import { Sidebar } from '@/components/social/sidebar'
import { MobileNav } from '@/components/social/mobile-nav'
import { LegalView } from '@/components/legal/legal-view'
import { ProfileView } from '@/components/profile/profile-view'
import { SettingsView } from '@/components/profile/settings-view'
import { FeedView } from '@/components/feed/feed-view'
import { DiscoverView } from '@/components/feed/discover-view'
import { CreatePostModal } from '@/components/feed/create-post-modal'
import { ChatView } from '@/components/chat/chat-view'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoadingAuth, user, currentView, setUser } = useAppStore()

  // On mount, check localStorage for existing auth and validate
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('void-token')
      const storedUser = localStorage.getItem('void-user')

      if (!token || !storedUser) {
        setUser(null, null)
        return
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'me' }),
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user, token)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('void-token')
          localStorage.removeItem('void-user')
          setUser(null, null)
        }
      } catch {
        // Network error, try using stored user as fallback
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser, token)
        } catch {
          localStorage.removeItem('void-token')
          localStorage.removeItem('void-user')
          setUser(null, null)
        }
      }
    }

    validateAuth()
  }, [setUser])

  // Show loading while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="Social Void" className="w-12 h-12" />
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Not authenticated - show landing page
  if (!isAuthenticated || !user) {
    return (
      <>
        <LandingPage />
        <AuthModal />
      </>
    )
  }

  // Authenticated - show main app shell
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ViewRenderer view={currentView} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Auth Modal (for re-auth scenarios) */}
      <AuthModal />

      {/* Create Post Modal */}
      <CreatePostModal />
    </div>
  )
}

function ViewRenderer({ view }: { view: ViewMode }) {
  // Home view
  if (view === 'home') {
    return <FeedView />
  }

  // People view
  if (view === 'people') {
    return <DiscoverView />
  }

  // Legal view has its own complete renderer
  if (view === 'legal') {
    return <LegalView />
  }

  // Profile view
  if (view === 'profile') {
    return <ProfileView />
  }

  // Settings view
  if (view === 'settings') {
    return <SettingsView />
  }

  // Chat view
  if (view === 'chat') {
    return <ChatView />
  }

  // Notifications view
  if (view === 'notifications') {
    return <NotificationsView />
  }

  // Fallback
  return null
}
