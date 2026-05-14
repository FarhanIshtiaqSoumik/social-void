'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Mail,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Moon,
  Sun,
  Shield,
  FileText,
  HeartHandshake,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'

export function SettingsView() {
  const { user, token, logout, setCurrentView, setViewingUserId } = useAppStore()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Notification toggles
  const [notifLikes, setNotifLikes] = useState(true)
  const [notifComments, setNotifComments] = useState(true)
  const [notifFollows, setNotifFollows] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifMentions, setNotifMentions] = useState(false)

  const handleLogout = () => {
    logout()
    toast({ title: 'Logged Out', description: 'You have been signed out of the Void.' })
  }

  const handleChangePassword = () => {
    toast({ title: 'Coming Soon', description: 'Password change feature is not yet available.' })
  }

  const handleDeleteAccount = () => {
    toast({ title: 'Coming Soon', description: 'Account deletion feature is not yet available.' })
  }

  const handleBlockedUsers = () => {
    toast({ title: 'Coming Soon', description: 'Blocked users management is not yet available.' })
  }

  const handleViewProfile = () => {
    setViewingUserId(null)
    setCurrentView('profile')
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Account
          </h2>
          <div className="rounded-xl border border-border divide-y divide-border">
            {/* View Profile */}
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary font-mono">V</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.name || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            {/* Email */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Read-only
              </span>
            </div>

            {/* Change Password */}
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Change Password</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            {/* Delete Account */}
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-destructive/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                <span className="text-sm font-medium group-hover:text-destructive transition-colors">
                  Delete Account
                </span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </button>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Privacy
          </h2>
          <div className="rounded-xl border border-border divide-y divide-border">
            <button
              onClick={handleBlockedUsers}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Blocked Users</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Notifications
          </h2>
          <div className="rounded-xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Heart className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Likes</span>
              </div>
              <Switch checked={notifLikes} onCheckedChange={setNotifLikes} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <MessageCircle className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Comments</span>
              </div>
              <Switch checked={notifComments} onCheckedChange={setNotifComments} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <UserPlus className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Followers</span>
              </div>
              <Switch checked={notifFollows} onCheckedChange={setNotifFollows} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Messages</span>
              </div>
              <Switch checked={notifMessages} onCheckedChange={setNotifMessages} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Eye className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mentions</span>
              </div>
              <Switch checked={notifMentions} onCheckedChange={setNotifMentions} />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Appearance
          </h2>
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="size-4 text-muted-foreground" />
                ) : (
                  <Sun className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </section>

        {/* Legal Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Legal
          </h2>
          <div className="rounded-xl border border-border divide-y divide-border">
            <button
              onClick={() => {
                setCurrentView('legal')
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                setCurrentView('legal')
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Terms of Service</span>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                toast({ title: 'Credits', description: 'Built with Next.js, Prisma, and shadcn/ui' })
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HeartHandshake className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Credits</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <section className="mb-8">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="size-4 mr-2" />
            Log Out
          </Button>
        </section>

        {/* Version */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground">
            Social Void <span className="font-mono">v1.0</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
