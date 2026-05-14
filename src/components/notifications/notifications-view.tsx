'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  CheckCheck,
  BadgeCheck,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/stores/app-store'
import { toast } from 'sonner'

interface NotificationUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
}

interface NotificationItem {
  id: string
  type: string
  title: string
  content: string | null
  relatedId: string | null
  relatedType: string | null
  isRead: boolean
  createdAt: string
  fromUser: NotificationUser
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'like':
      return <Heart className="size-4 text-red-500 fill-red-500" />
    case 'comment':
      return <MessageCircle className="size-4 text-blue-500" />
    case 'follow':
      return <UserPlus className="size-4 text-green-500" />
    case 'mention':
      return <AtSign className="size-4 text-purple-500" />
    case 'friend_request':
      return <UserPlus className="size-4 text-primary" />
    case 'ping':
      return <Bell className="size-4 text-amber-500" />
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

function getNotificationActionText(type: string, content: string | null): string {
  if (content) return content
  switch (type) {
    case 'like':
      return 'liked your post'
    case 'comment':
      return 'commented on your post'
    case 'follow':
      return 'started following you'
    case 'mention':
      return 'mentioned you in a post'
    case 'friend_request':
      return 'sent you a friend request'
    case 'ping':
      return 'pinged you in a chat'
    default:
      return 'interacted with you'
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationsView() {
  const { token, setViewingUserId, setCurrentView, setViewingChatId } = useAppStore()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAllRead = useCallback(async () => {
    if (!token) return
    setIsMarkingAll(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true }),
      })
      if (res.ok) {
        setNotifications([])
        toast.success('All notifications cleared')
      } else {
        toast.error('Failed to clear notifications')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsMarkingAll(false)
    }
  }, [token])

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      if (notification.relatedType === 'post') {
        // Navigate to home to see the post
        setCurrentView('home')
      } else if (notification.relatedType === 'user') {
        setViewingUserId(notification.fromUser.id)
      } else if (notification.relatedType === 'chat' && notification.relatedId) {
        setViewingChatId(notification.relatedId)
      } else if (notification.type === 'follow') {
        setViewingUserId(notification.fromUser.id)
      } else if (notification.type === 'friend_request') {
        setViewingUserId(notification.fromUser.id)
      }
    },
    [setCurrentView, setViewingUserId, setViewingChatId]
  )

  return (
    <div className="max-w-[640px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h1 className="text-xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary gap-1.5 min-h-[36px]"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <RefreshCw className="size-3 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              Mark all as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-primary"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <BellOff className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            When people interact with your content, you&apos;ll see it here.
          </p>
        </motion.div>
      ) : (
        /* Notifications List */
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.button
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
                onClick={() => handleNotificationClick(notification)}
                className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left group"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="size-10">
                    {notification.fromUser.avatar && (
                      <AvatarImage src={notification.fromUser.avatar} alt={notification.fromUser.username} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {(notification.fromUser.name || notification.fromUser.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {notification.fromUser.name || notification.fromUser.username}
                    </span>
                    {notification.fromUser.isVerified && (
                      <BadgeCheck className="size-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {getNotificationActionText(notification.type, notification.content)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Unread indicator */}
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-48 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  )
}
