'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Users,
  Flame,
  Check,
  CheckCheck,
  Smile,
  Loader2,
  ChevronUp,
  Pencil,
  Trash2,
  Copy,
  MessageCircle,
  Flag,
  X,
  Ban,
  Unlock,
  EyeOff,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { format, isToday, isYesterday } from 'date-fns'
import { EmojiPalette } from './emoji-palette'
import { renderTextWithCustomEmojis, CUSTOM_EMOJI_MAP } from './custom-emojis'

// Helper: render message content with [GIF: url] support
function renderMessageContent(content: string, emojiSize: number, onMentionClick?: (username: string) => void) {
  const gifPattern = /\[GIF:\s*(https?:\/\/[^\]]+)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = gifPattern.exec(content)) !== null) {
    // Text before the GIF
    if (match.index > lastIndex) {
      const textPart = content.slice(lastIndex, match.index)
      parts.push(
        <span key={`text-${key++}`}>
          {renderTextWithCustomEmojis(textPart, emojiSize, onMentionClick)}
        </span>
      )
    }
    // GIF image
    const gifUrl = match[1]
    parts.push(
      <img
        key={`gif-${key++}`}
        src={gifUrl}
        alt="GIF"
        className="max-w-[220px] rounded-lg mt-1"
        loading="lazy"
      />
    )
    lastIndex = gifPattern.lastIndex
  }

  // Remaining text after last GIF
  if (lastIndex < content.length) {
    const textPart = content.slice(lastIndex)
    parts.push(
      <span key={`text-${key++}`}>
        {renderTextWithCustomEmojis(textPart, emojiSize, onMentionClick)}
      </span>
    )
  }

  return parts.length > 0 ? <>{parts}</> : null
}
import type { ChatItem, ChatMember } from './chat-list'
import { getChatDisplayName } from './chat-list'
import { toast } from 'sonner'

export interface Message {
  id: string
  chatId: string
  content: string
  senderId: string
  senderName?: string
  senderAvatar?: string | null
  createdAt: string
  updatedAt?: string
  isRead?: boolean
  isVoided?: boolean
  isEdited?: boolean
}

interface TypingUser {
  userId: string
  username: string
}

interface Reaction {
  emoji: string
  userIds: string[]
}

interface ChatWindowProps {
  chat: ChatItem
  messages: Message[]
  onSendMessage: (content: string) => void
  onBack: () => void
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
  typingUsers: TypingUser[]
  socketEmit: (event: string, data: unknown) => void
  onlineUsers?: Set<string>
  onMessageEdited?: (messageId: string, content: string) => void
  onMessageDeleted?: (messageId: string) => void
}

// Quick reaction emojis for context menu
const QUICK_REACTIONS = [
  'void-grin',
  'void-love',
  'void-thumbs-up',
  'void-shock',
  'void-cry',
  'void-laugh',
]

const GROUPING_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onBack,
  onLoadMore,
  hasMore,
  isLoadingMore,
  typingUsers,
  socketEmit,
  onlineUsers,
  onMessageEdited,
  onMessageDeleted,
}: ChatWindowProps) {
  const { user, token } = useAppStore()
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPalette, setShowEmojiPalette] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    messageId: string
    x: number
    y: number
  } | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [showReactionBar, setShowReactionBar] = useState<string | null>(null)

  // Blocked users state
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [revealedBlockedMessages, setRevealedBlockedMessages] = useState<Set<string>>(new Set())

  // Fetch blocked users on mount
  useEffect(() => {
    if (!token) return
    const fetchBlocked = async () => {
      try {
        const res = await fetch('/api/blocks', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const ids = new Set((data.blockedUsers || []).map((b: { user: { id: string } }) => b.user.id))
          setBlockedUserIds(ids)
        }
      } catch {
        // Silently fail
      }
    }
    fetchBlocked()
  }, [token])

  // Unblock from chat
  const handleUnblockFromChat = useCallback(async (userId: string) => {
    if (!token) return
    try {
      const res = await fetch('/api/blocks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setBlockedUserIds((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
        toast.success('User unblocked')
      } else {
        toast.error('Failed to unblock user')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }, [token])

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionResults, setMentionResults] = useState<Array<{ id: string; username: string; name: string | null; avatar: string | null }>>([])
  const [mentionLoading, setMentionLoading] = useState(false)
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const mentionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const prevMessageCountRef = useRef(messages.length)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const displayName = getChatDisplayName(chat, user?.id)
  const partner = chat.isGroup
    ? null
    : chat.members.find((m) => m.user.id !== user?.id)?.user
  const isPartnerOnline = partner ? onlineUsers?.has(partner.id) : false

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  // Focus input on chat change
  useEffect(() => {
    inputRef.current?.focus()
    setShowEmojiPalette(false)
    setContextMenu(null)
    setEditingMessageId(null)
    setShowReactionBar(null)
  }, [chat.id])

  // Close context menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null)
        setShowReactionBar(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null)
        setShowReactionBar(null)
      }
    }
    if (contextMenu || showReactionBar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu, showReactionBar])

  // Emit typing events + mention detection
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)

      // Detect @mentions
      const atMatch = value.match(/@([a-zA-Z0-9_]*)$/)
      if (atMatch) {
        const query = atMatch[1]
        setMentionQuery(query)
        setMentionSelectedIndex(0)

        if (mentionDebounceRef.current) {
          clearTimeout(mentionDebounceRef.current)
        }

        if (query.length > 0) {
          setMentionLoading(true)
          mentionDebounceRef.current = setTimeout(async () => {
            try {
              const res = await fetch(`/api/users?type=search&q=${encodeURIComponent(query)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              })
              if (res.ok) {
                const data = await res.json()
                setMentionResults((data.users || []).slice(0, 6))
              }
            } catch {
              // Silently fail
            } finally {
              setMentionLoading(false)
            }
          }, 300)
        } else {
          // Show recent chat members when just @ is typed
          const chatUsers = chat.members
            .filter(m => m.user.id !== user?.id)
            .map(m => ({ id: m.user.id, username: m.user.username, name: m.user.name, avatar: m.user.avatar }))
            .slice(0, 6)
          setMentionResults(chatUsers)
          setMentionLoading(false)
        }
      } else {
        setMentionQuery(null)
        setMentionResults([])
        setMentionLoading(false)
      }

      if (!user) return

      if (value.trim() && !isTypingRef.current) {
        isTypingRef.current = true
        socketEmit('typing', {
          chatId: chat.id,
          userId: user.id,
          username: user.username,
        })
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        socketEmit('stop-typing', {
          chatId: chat.id,
          userId: user.id,
        })
      }, 2000)
    },
    [chat.id, user, socketEmit, chat.members, token]
  )

  // Insert mention into input
  const insertMention = useCallback(
    (username: string) => {
      const currentValue = inputValue
      const atMatch = currentValue.match(/@([a-zA-Z0-9_]*)$/)
      if (atMatch) {
        const before = currentValue.slice(0, currentValue.length - atMatch[0].length)
        setInputValue(`${before}@${username} `)
      }
      setMentionQuery(null);
      setMentionResults([]);
      inputRef.current?.focus();
    },
    [inputValue]
  )

  // Handle mention click in messages
  const handleMentionClick = useCallback(
    async (username: string) => {
      try {
        const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.id) {
            const { setViewingUserId } = useAppStore.getState()
            setViewingUserId(data.id)
          }
        }
      } catch {
        // Silently fail
      }
    },
    [token]
  )

  // Send message
  const handleSend = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || isSending) return

    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    setIsSending(true)
    setShowEmojiPalette(false)
    try {
      onSendMessage(content)
      setInputValue('')

      // Stop typing
      isTypingRef.current = false
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      socketEmit('stop-typing', {
        chatId: chat.id,
        userId: user?.id,
      })
    } finally {
      setIsSending(false)
    }
  }, [inputValue, isSending, onSendMessage, chat.id, user?.id, socketEmit])

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [])

  // Handle Enter key + mention navigation (Discord-style)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Mention dropdown navigation takes priority
      if (mentionQuery !== null && mentionResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setMentionSelectedIndex(prev => Math.min(prev + 1, mentionResults.length - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setMentionSelectedIndex(prev => Math.max(prev - 1, 0))
          return
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          const selected = mentionResults[mentionSelectedIndex]
          if (selected) {
            insertMention(selected.username)
          }
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setMentionQuery(null)
          setMentionResults([])
          return
        }
      }
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift+Enter: allow default (new line) on all devices
          return
        }
        // Detect mobile: on mobile, Enter creates new line (send button is always visible)
        const isMobile = typeof window !== 'undefined' &&
          (window.innerWidth < 1024 || 'ontouchstart' in window)
        if (isMobile) {
          // On mobile: Enter creates new line
          return
        }
        // On desktop: Enter sends the message
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend, mentionQuery, mentionResults, mentionSelectedIndex, insertMention]
  )

  // Emoji select handler
  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputValue((prev) => prev + emoji)
    inputRef.current?.focus()
  }, [])

  // GIF select handler
  const handleGifSelect = useCallback((gifUrl: string) => {
    setInputValue((prev) => prev + `[GIF: ${gifUrl}]`)
    setShowEmojiPalette(false)
    inputRef.current?.focus()
  }, [])

  // Toggle emoji palette
  const toggleEmojiPalette = useCallback(() => {
    setShowEmojiPalette((prev) => !prev)
  }, [])

  // Context menu handlers
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, messageId: string) => {
      e.preventDefault()
      setContextMenu({ messageId, x: e.clientX, y: e.clientY })
      setShowReactionBar(null)
    },
    []
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, messageId: string) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      longPressTimerRef.current = setTimeout(() => {
        setContextMenu({ messageId, x: touch.clientX, y: touch.clientY })
        setShowReactionBar(null)
      }, 500)
    },
    []
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return
      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartRef.current.y
      if (deltaY > 50) {
        // Swipe down - close menu
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
        }
        setContextMenu(null)
        setShowReactionBar(null)
        return
      }
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const totalDelta = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY
      )
      if (totalDelta > 10) {
        // Moved too much, cancel long press
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
        }
      }
    },
    []
  )

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    touchStartRef.current = null
  }, [])

  // Copy text
  const handleCopyText = useCallback(
    async (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        try {
          await navigator.clipboard.writeText(message.content)
          toast.success('Text copied to clipboard')
        } catch {
          toast.error('Failed to copy text')
        }
      }
      setContextMenu(null)
    },
    [messages]
  )

  // Edit message
  const handleEditStart = useCallback((messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      setEditingMessageId(messageId)
      setEditContent(message.content)
      setContextMenu(null)
      setTimeout(() => {
        editInputRef.current?.focus()
        editInputRef.current?.select()
      }, 50)
    }
  }, [messages])

  const handleEditSave = useCallback(async () => {
    if (!editingMessageId || !editContent.trim() || !token) return
    setIsEditing(true)
    try {
      const res = await fetch('/api/chats/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messageId: editingMessageId,
          content: editContent.trim(),
        }),
      })
      if (res.ok) {
        toast.success('Message edited')
        onMessageEdited?.(editingMessageId, editContent.trim())
      } else {
        toast.error('Failed to edit message')
      }
    } catch {
      toast.error('Failed to edit message')
    } finally {
      setIsEditing(false)
      setEditingMessageId(null)
      setEditContent('')
    }
  }, [editingMessageId, editContent, token, onMessageEdited])

  const handleEditCancel = useCallback(() => {
    setEditingMessageId(null)
    setEditContent('')
  }, [])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleEditSave()
      } else if (e.key === 'Escape') {
        handleEditCancel()
      }
    },
    [handleEditSave, handleEditCancel]
  )

  // Delete message
  const handleDelete = useCallback(
    async (messageId: string) => {
      setContextMenu(null)
      if (!token) return
      try {
        const res = await fetch(
          `/api/chats/messages?messageId=${messageId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          toast.success('Message voided')
          onMessageDeleted?.(messageId)
        } else {
          toast.error('Failed to void message')
        }
      } catch {
        toast.error('Failed to void message')
      }
    },
    [token, onMessageDeleted]
  )

  // React to message
  const handleReact = useCallback(
    (messageId: string, emojiName: string) => {
      if (!user) return
      setReactions((prev) => {
        const current = prev[messageId] || []
        const existing = current.find((r) => r.emoji === emojiName)
        if (existing) {
          if (existing.userIds.includes(user.id)) {
            // Remove own reaction
            const newUserIds = existing.userIds.filter((id) => id !== user.id)
            if (newUserIds.length === 0) {
              return {
                ...prev,
                [messageId]: current.filter((r) => r.emoji !== emojiName),
              }
            }
            return {
              ...prev,
              [messageId]: current.map((r) =>
                r.emoji === emojiName ? { ...r, userIds: newUserIds } : r
              ),
            }
          }
          // Add own reaction
          return {
            ...prev,
            [messageId]: current.map((r) =>
              r.emoji === emojiName
                ? { ...r, userIds: [...r.userIds, user.id] }
                : r
            ),
          }
        }
        // New reaction
        return {
          ...prev,
          [messageId]: [...current, { emoji: emojiName, userIds: [user.id] }],
        }
      })
      setShowReactionBar(null)
      setContextMenu(null)
    },
    [user]
  )

  // Reply (placeholder - just shows toast for now)
  const handleReply = useCallback((messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      toast.info(`Reply to: ${message.content.substring(0, 30)}...`)
    }
    setContextMenu(null)
  }, [messages])

  // Report (placeholder)
  const handleReport = useCallback((_messageId: string) => {
    toast.info('Message reported')
    setContextMenu(null)
  }, [])

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages)

  // Scroll to bottom on initial load
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }, 100)
  }, [chat.id])

  // Handle mobile keyboard - scroll to bottom when visual viewport changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const vv = window.visualViewport
    const handleResize = () => {
      // When keyboard appears, viewport height shrinks
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }

    vv.addEventListener('resize', handleResize)
    return () => vv.removeEventListener('resize', handleResize)
  }, [])

  // Get context menu items based on message ownership
  const contextMenuMessage = contextMenu
    ? messages.find((m) => m.id === contextMenu.messageId)
    : null
  const isOwnMessage =
    contextMenuMessage?.senderId === user?.id

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Avatar */}
        <div className="relative">
          {chat.isGroup ? (
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">
                {(chat.name || 'G').charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <Avatar className="size-10">
              {partner?.avatar && <AvatarImage src={partner.avatar} alt={displayName} />}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          {!chat.isGroup && isPartnerOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{displayName}</h3>
            {chat.voidMode && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary gap-1">
                <Flame className="size-3" />
                Void
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {chat.isGroup
              ? `${chat.members.length} members`
              : isPartnerOnline
                ? 'Online'
                : 'Offline'}
          </p>
        </div>

        {/* Members count icon (group) */}
        {chat.isGroup && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs">{chat.members.length}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 sm:p-4 space-y-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="text-xs text-muted-foreground min-h-[44px]"
                >
                  {isLoadingMore ? (
                    <Loader2 className="size-3 mr-1 animate-spin" />
                  ) : (
                    <ChevronUp className="size-3 mr-1" />
                  )}
                  Load older messages
                </Button>
              </div>
            )}

            {/* Message groups by date */}
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateSeparator date={group.date} />
                <div className="space-y-0.5">
                  {group.messages.map((message, idx) => {
                    const isOwn = message.senderId === user?.id
                    const prevMessage = idx > 0 ? group.messages[idx - 1] : null
                    const nextMessage =
                      idx < group.messages.length - 1
                        ? group.messages[idx + 1]
                        : null

                    // Discord-style grouping: same sender within 5 minutes
                    const isFirstInGroup =
                      !prevMessage ||
                      prevMessage.senderId !== message.senderId ||
                      new Date(message.createdAt).getTime() -
                        new Date(prevMessage.createdAt).getTime() >
                        GROUPING_THRESHOLD_MS

                    const isLastInGroup =
                      !nextMessage ||
                      nextMessage.senderId !== message.senderId ||
                      new Date(nextMessage.createdAt).getTime() -
                        new Date(message.createdAt).getTime() >
                        GROUPING_THRESHOLD_MS

                    const showAvatar =
                      !isOwn && isFirstInGroup
                    const showName =
                      chat.isGroup && !isOwn && isFirstInGroup

                    const isBlockedSender = !isOwn && blockedUserIds.has(message.senderId)

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        showAvatar={showAvatar}
                        showName={showName}
                        chatMembers={chat.members}
                        currentUserId={user?.id}
                        onContextMenu={handleContextMenu}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        isEditing={editingMessageId === message.id}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onEditSave={handleEditSave}
                        onEditCancel={handleEditCancel}
                        onEditKeyDown={handleEditKeyDown}
                        editInputRef={editInputRef}
                        isEditingLoading={isEditing}
                        messageReactions={reactions[message.id] || []}
                        onReact={handleReact}
                        showReactionBar={showReactionBar === message.id}
                        onToggleReactionBar={(msgId) =>
                          setShowReactionBar((prev) =>
                            prev === msgId ? null : msgId
                          )
                        }
                        onMentionClick={handleMentionClick}
                        isBlockedSender={isBlockedSender}
                        isRevealed={revealedBlockedMessages.has(message.id)}
                        onReveal={() => setRevealedBlockedMessages((prev) => new Set(prev).add(message.id))}
                        onUnblockSender={() => handleUnblockFromChat(message.senderId)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center gap-2 px-2 pt-1"
                >
                  <div className="flex gap-1">
                    <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {typingUsers.map((u) => u.username).join(', ')}{' '}
                    {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-[180px] overflow-hidden"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              top: Math.min(contextMenu.y, window.innerHeight - 300),
            }}
          >
            {/* Quick reaction row */}
            <div className="flex items-center justify-center gap-1 px-2 py-2 border-b border-border">
              {QUICK_REACTIONS.map((emojiName) => {
                const emojiItem = CUSTOM_EMOJI_MAP.get(emojiName)
                if (!emojiItem) return null
                const EmojiSvg = emojiItem.svg
                return (
                  <button
                    key={emojiName}
                    onClick={() => handleReact(contextMenu.messageId, emojiName)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    type="button"
                  >
                    <EmojiSvg size={22} />
                  </button>
                )
              })}
            </div>

            {isOwnMessage ? (
              <>
                <ContextMenuItem
                  icon={<Pencil className="size-4" />}
                  label="Edit Message"
                  onClick={() => handleEditStart(contextMenu.messageId)}
                />
                <ContextMenuItem
                  icon={<Trash2 className="size-4" />}
                  label="Delete Message"
                  onClick={() => handleDelete(contextMenu.messageId)}
                  destructive
                />
                <ContextMenuItem
                  icon={<Copy className="size-4" />}
                  label="Copy Text"
                  onClick={() => handleCopyText(contextMenu.messageId)}
                />
              </>
            ) : (
              <>
                <ContextMenuItem
                  icon={<MessageCircle className="size-4" />}
                  label="Reply"
                  onClick={() => handleReply(contextMenu.messageId)}
                />
                <ContextMenuItem
                  icon={<Copy className="size-4" />}
                  label="Copy Text"
                  onClick={() => handleCopyText(contextMenu.messageId)}
                />
                <ContextMenuItem
                  icon={<Flag className="size-4" />}
                  label="Report"
                  onClick={() => handleReport(contextMenu.messageId)}
                  destructive
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="p-2 sm:p-3 border-t border-border bg-background relative" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}>
        {/* Emoji Palette */}
        <AnimatePresence>
          {showEmojiPalette && (
            <EmojiPalette
              onEmojiSelect={handleEmojiSelect}
              onGifSelect={handleGifSelect}
              onClose={() => setShowEmojiPalette(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="icon"
            className={`shrink-0 h-10 w-10 min-w-[44px] min-h-[44px] ${showEmojiPalette ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={toggleEmojiPalette}
            aria-label="Emoji palette"
            type="button"
          >
            <Smile className="size-5" />
          </Button>

          {/* Text input with mention autocomplete */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                handleInputChange(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (use @ to mention)"
              className="w-full min-h-[44px] max-h-[120px] bg-muted/50 border-0 focus-visible:ring-1 text-base resize-none whitespace-pre-wrap overflow-y-auto rounded-md px-3 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={1}
              disabled={isSending}
            />
            {/* Mention dropdown */}
            <AnimatePresence>
              {mentionQuery !== null && (mentionResults.length > 0 || mentionLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {mentionLoading && mentionResults.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">Searching...</div>
                    )}
                    {mentionResults.map((u, idx) => (
                      <button
                        key={u.id}
                        type="button"
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors min-h-[44px] ${
                          idx === mentionSelectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => insertMention(u.username)}
                      >
                        <Avatar className="size-7 shrink-0">
                          {u.avatar && <AvatarImage src={u.avatar} alt={u.username} />}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {(u.name || u.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{u.name || u.username}</p>
                          <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            size="icon"
            className="shrink-0 size-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 min-w-[44px] min-h-[44px]"
            aria-label="Send message"
            type="button"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Context Menu Item component
function ContextMenuItem({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm min-h-[44px] transition-colors ${
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted'
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  )
}

function MessageBubble({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
  showAvatar,
  showName,
  chatMembers,
  currentUserId,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isEditing,
  editContent,
  onEditContentChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
  editInputRef,
  isEditingLoading,
  messageReactions,
  onReact,
  showReactionBar,
  onToggleReactionBar,
  onMentionClick,
  isBlockedSender,
  isRevealed,
  onReveal,
  onUnblockSender,
}: {
  message: Message
  isOwn: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
  showAvatar: boolean
  showName: boolean
  chatMembers: ChatMember[]
  currentUserId?: string
  onContextMenu: (e: React.MouseEvent, messageId: string) => void
  onTouchStart: (e: React.TouchEvent, messageId: string) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  isEditing: boolean
  editContent: string
  onEditContentChange: (val: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  onEditKeyDown: (e: React.KeyboardEvent) => void
  editInputRef: React.RefObject<HTMLInputElement | null>
  isEditingLoading: boolean
  messageReactions: Reaction[]
  onReact: (messageId: string, emoji: string) => void
  showReactionBar: boolean
  onToggleReactionBar: (messageId: string) => void
  onMentionClick?: (username: string) => void
  isBlockedSender?: boolean
  isRevealed?: boolean
  onReveal?: () => void
  onUnblockSender?: () => void
}) {
  const sender = chatMembers.find((m) => m.user.id === message.senderId)?.user
  const senderName = sender?.name || sender?.username || message.senderName || 'Unknown'
  const senderAvatar = sender?.avatar || message.senderAvatar

  const timeStr = formatTime(message.createdAt)

  // Detect if message was edited (updatedAt differs from createdAt)
  const isEdited =
    message.isEdited ||
    (message.updatedAt &&
      message.createdAt &&
      new Date(message.updatedAt).getTime() -
        new Date(message.createdAt).getTime() >
        1000)

  // Check if message is voided
  if (message.isVoided || message.content === '[void]') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 ${isFirstInGroup ? 'pt-1' : 'pt-0.5'}`}>
        <div className="px-3 py-1.5 rounded-lg bg-muted/30 text-muted-foreground italic text-xs">
          This message has been voided
        </div>
      </div>
    )
  }

  // Check if message is from a blocked user
  if (isBlockedSender) {
    if (isRevealed) {
      // Revealed blocked message - show content with unblock option
      return (
        <div
          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 px-2 ${isFirstInGroup ? 'pt-2' : 'pt-0.5'}`}
        >
          {!isOwn && (
            <div className="w-8 shrink-0">
              {showAvatar && (
                <Avatar className="size-8">
                  {senderAvatar && <AvatarImage src={senderAvatar} alt={senderName} />}
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                    {senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            {showName && (
              <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{senderName}</span>
            )}
            <div className="relative group">
              <div className="px-3 py-1.5 rounded-2xl text-sm break-words bg-muted/30 text-muted-foreground rounded-bl-md border border-destructive/20">
                <p className="whitespace-pre-wrap">{renderMessageContent(message.content, 20)}</p>
              </div>
              <button
                onClick={onUnblockSender}
                className="mt-1 flex items-center gap-1 text-[10px] text-destructive hover:text-destructive/80 transition-colors px-1"
                type="button"
              >
                <Unlock className="size-3" />
                Unblock user
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Hidden blocked message - click to reveal
    return (
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 ${isFirstInGroup ? 'pt-2' : 'pt-0.5'}`}
      >
        <button
          onClick={onReveal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 text-muted-foreground italic text-xs hover:bg-muted/50 transition-colors border border-dashed border-border"
          type="button"
        >
          <EyeOff className="size-3" />
          Blocked message · Click to reveal
        </button>
      </div>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2`}>
        <div className="max-w-[70%] flex flex-col gap-1.5">
          <Input
            ref={editInputRef}
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            className="h-9 bg-background border focus-visible:ring-1 text-sm"
            disabled={isEditingLoading}
          />
          <div className="flex gap-1.5 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditCancel}
              className="h-7 text-xs min-h-[36px]"
              disabled={isEditingLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onEditSave}
              className="h-7 text-xs bg-primary text-primary-foreground min-h-[36px]"
              disabled={!editContent.trim() || isEditingLoading}
              type="button"
            >
              {isEditingLoading ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 px-2 ${
        isFirstInGroup ? 'pt-2' : 'pt-0.5'
      }`}
      onContextMenu={(e) => onContextMenu(e, message.id)}
      onTouchStart={(e) => onTouchStart(e, message.id)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Avatar for others */}
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar && (
            <Avatar className="size-8">
              {senderAvatar && <AvatarImage src={senderAvatar} alt={senderName} />}
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                {senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name for group chats */}
        {showName && (
          <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{senderName}</span>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div
            className={`px-3 py-1.5 rounded-2xl text-sm break-words ${
              isOwn
                ? 'bg-[#1a1a2e] text-white rounded-br-md'
                : 'bg-[#f0f0f5] text-foreground dark:bg-muted rounded-bl-md'
            } ${!isFirstInGroup ? (isOwn ? 'rounded-tr-md' : 'rounded-tl-md') : ''}`}
          >
            <p className="whitespace-pre-wrap">{renderMessageContent(message.content, 20, onMentionClick)}</p>
          </div>

          {/* Reaction bar - shown on hover or tap */}
          {showReactionBar && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-popover border border-border rounded-full shadow-lg px-1.5 py-1 z-10">
              {QUICK_REACTIONS.map((emojiName) => {
                const emojiItem = CUSTOM_EMOJI_MAP.get(emojiName)
                if (!emojiItem) return null
                const EmojiSvg = emojiItem.svg
                return (
                  <button
                    key={emojiName}
                    onClick={() => onReact(message.id, emojiName)}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                    type="button"
                  >
                    <EmojiSvg size={18} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Reactions */}
        {messageReactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {messageReactions.map((reaction) => {
              const emojiItem = CUSTOM_EMOJI_MAP.get(reaction.emoji)
              if (!emojiItem) return null
              const EmojiSvg = emojiItem.svg
              const hasOwnReaction = currentUserId
                ? reaction.userIds.includes(currentUserId)
                : false
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                    hasOwnReaction
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/50 border-border hover:bg-muted'
                  }`}
                  type="button"
                >
                  <EmojiSvg size={14} />
                  <span className="text-muted-foreground">{reaction.userIds.length}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Timestamp + read receipt - only show on last in group */}
        {isLastInGroup && (
          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] text-muted-foreground">{timeStr}</span>
            {isEdited && (
              <span className="text-[10px] text-muted-foreground italic">(edited)</span>
            )}
            {isOwn && (
              message.isRead ? (
                <CheckCheck className="size-3 text-primary" />
              ) : (
                <Check className="size-3 text-muted-foreground" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] text-muted-foreground font-medium shrink-0">{date}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return format(date, 'h:mm a')
  } catch {
    return ''
  }
}

interface MessageGroup {
  date: string
  messages: Message[]
}

function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null

  for (const message of messages) {
    const date = new Date(message.createdAt)
    let dateLabel: string
    if (isNaN(date.getTime())) {
      dateLabel = 'Unknown'
    } else if (isToday(date)) {
      dateLabel = 'Today'
    } else if (isYesterday(date)) {
      dateLabel = 'Yesterday'
    } else {
      dateLabel = format(date, 'MMMM d, yyyy')
    }

    if (!currentGroup || currentGroup.date !== dateLabel) {
      currentGroup = { date: dateLabel, messages: [message] }
      groups.push(currentGroup)
    } else {
      currentGroup.messages.push(message)
    }
  }

  return groups
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <Skeleton
              className={`h-10 rounded-2xl ${
                i % 2 === 0 ? 'w-48' : 'w-36'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-3 border-t border-border">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}
