'use client'

import { motion } from 'framer-motion'
import {
  Home,
  Users,
  MessageSquare,
  User,
  FileText,
  Settings,
  Plus,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ViewMode } from '@/stores/app-store'

interface NavItem {
  icon: React.ElementType
  label: string
  view: ViewMode
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Users, label: 'People', view: 'people' },
  { icon: MessageSquare, label: 'Chat', view: 'chat' },
  { icon: User, label: 'Profile', view: 'profile' },
  { icon: FileText, label: 'Legal', view: 'legal' },
  { icon: Settings, label: 'Settings', view: 'settings' },
]

export function Sidebar() {
  const { user, currentView, setCurrentView, setShowCreatePost, logout } = useAppStore()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 h-screen sticky top-0 border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="Social Void" className="h-9 w-9 rounded-full shrink-0" />
        <span className="text-lg font-bold tracking-tight">
          Social <span className="text-primary">Void</span>
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 custom-scrollbar overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view
            const Icon = item.icon

            return (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="size-[18px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Create Post Button */}
        <div className="mt-4 px-1">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-10"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="size-4 mr-2" />
            Create Post
          </Button>
        </div>
      </nav>

      <Separator />

      {/* Theme Toggle + User */}
      <div className="p-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <Avatar className="size-8 shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
