'use client'

import { motion } from 'framer-motion'
import { Home, Users, MessageSquare, User } from 'lucide-react'
import { useAppStore, type ViewMode } from '@/stores/app-store'

interface MobileNavItem {
  icon: React.ElementType
  label: string
  view: ViewMode
}

const mobileNavItems: MobileNavItem[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Users, label: 'People', view: 'people' },
  { icon: MessageSquare, label: 'Chat', view: 'chat' },
  { icon: User, label: 'Profile', view: 'profile' },
]

export function MobileNav() {
  const { user, currentView, setCurrentView } = useAppStore()

  if (!user) return null

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <li key={item.view} className="flex-1">
              <button
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex flex-col items-center justify-center gap-1 py-2 relative transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
