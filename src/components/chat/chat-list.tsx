'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Plus, Flame, Inbox } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/stores/app-store'
import { formatDistanceToNow } from 'date-fns'

export interface ChatMember {
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
  role: string
}

export interface ChatItem {
  id: string
  name: string | null
  isGroup: boolean
  avatar: string | null
  voidMode: boolean
  members: ChatMember[]
  lastMessage: {
    content: string
    createdAt: string
    sender: { username: string }
  } | null
  role: string
  unreadCount?: number
}

interface ChatListProps {
  chats: ChatItem[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onCreateChat: () => void
  isLoading?: boolean
  onlineUsers?: Set<string>
  mailboxCount?: number
  onToggleMailbox?: () => void
  isMailboxOpen?: boolean
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  isLoading,
  onlineUsers,
  mailboxCount = 0,
  onToggleMailbox,
  isMailboxOpen = false,
}: ChatListProps) {
  const { user } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const q = searchQuery.toLowerCase()
    return chats.filter((chat) => {
      const chatName = getChatDisplayName(chat, user?.id)
      return chatName.toLowerCase().includes(q)
    })
  }, [chats, searchQuery, user?.id])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h2 className="text-lg font-bold">Messages</h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Mailbox button */}
            <button
              onClick={onToggleMailbox}
              className={`relative p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isMailboxOpen
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground hover:text-primary'
              }`}
              aria-label="DM Mailbox"
            >
              <Inbox className="size-5" />
              {mailboxCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
                  {mailboxCount > 99 ? '99+' : mailboxCount}
                </span>
              )}
            </button>
            {/* New chat button */}
            <button
              onClick={onCreateChat}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="New chat"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChatItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateChat}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                currentUserId={user?.id}
                onlineUsers={onlineUsers}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function ChatListItem({
  chat,
  isActive,
  currentUserId,
  onlineUsers,
  onClick,
}: {
  chat: ChatItem
  isActive: boolean
  currentUserId?: string
  onlineUsers?: Set<string>
  onClick: () => void
}) {
  const displayName = getChatDisplayName(chat, currentUserId)
  const partner = chat.isGroup ? null : chat.members.find((m) => m.user.id !== currentUserId)?.user
  const isPartnerOnline = partner ? onlineUsers?.has(partner.id) : false

  const lastMessagePreview = chat.lastMessage
    ? chat.lastMessage.content.length > 40
      ? chat.lastMessage.content.substring(0, 40) + '...'
      : chat.lastMessage.content
    : 'No messages yet'

  const lastMessageTime = chat.lastMessage
    ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })
    : ''

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors ${
        isActive
          ? 'bg-primary/10 border-l-2 border-primary'
          : 'hover:bg-muted/50 border-l-2 border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {chat.isGroup ? (
          <div className="size-11 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {(chat.name || 'G').charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <Avatar className="size-11">
            {partner?.avatar && <AvatarImage src={partner.avatar} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        {/* Online indicator */}
        {!chat.isGroup && isPartnerOnline && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-background" />
        )}
        {/* Void mode indicator */}
        {chat.voidMode && (
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-primary flex items-center justify-center">
            <Flame className="size-2 text-white" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : ''}`}>
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {chat.lastMessage && chat.isGroup && (
            <span className="text-xs text-muted-foreground shrink-0">
              {chat.lastMessage.sender.username}:
            </span>
          )}
          <p className="text-xs text-muted-foreground truncate">
            {chat.voidMode && chat.lastMessage ? '🔴 ' : ''}
            {lastMessagePreview}
          </p>
        </div>
        {/* Unread badge */}
        {chat.unreadCount && chat.unreadCount > 0 && (
          <Badge className="mt-1 h-5 min-w-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
            {chat.unreadCount}
          </Badge>
        )}
      </div>
    </button>
  )
}

function ChatItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-3 py-3">
      <Skeleton className="size-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}

export function getChatDisplayName(chat: ChatItem, currentUserId?: string): string {
  if (chat.isGroup) return chat.name || 'Group Chat'
  if (!currentUserId) return chat.name || 'Direct Message'

  const partner = chat.members.find((m) => m.user.id !== currentUserId)
  return partner?.user.name || partner?.user.username || 'Direct Message'
}
