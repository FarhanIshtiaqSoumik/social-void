'use client'

import { useState } from 'react'
import { Check, X, Mail } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

export interface MailboxEntry {
  chatId: string
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
  lastMessage: {
    content: string
    createdAt: string
  } | null
  unreadCount: number
}

interface MailboxPanelProps {
  mailbox: MailboxEntry[]
  isLoading: boolean
  onAccept: (chatId: string) => void
  onReject: (chatId: string) => void
  onOpenChat: (chatId: string) => void
  onClose: () => void
}

export function MailboxPanel({
  mailbox,
  isLoading,
  onAccept,
  onReject,
  onOpenChat,
  onClose,
}: MailboxPanelProps) {
  const [actioningChatId, setActioningChatId] = useState<string | null>(null)

  const handleAccept = async (chatId: string) => {
    setActioningChatId(chatId)
    await onAccept(chatId)
    setActioningChatId(null)
  }

  const handleReject = async (chatId: string) => {
    setActioningChatId(chatId)
    await onReject(chatId)
    setActioningChatId(null)
  }

  const totalUnread = mailbox.reduce((sum, entry) => sum + entry.unreadCount, 0)

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-b-lg shadow-lg max-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          <span className="text-sm font-semibold">DM Mailbox</span>
          {totalUnread > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
              {totalUnread}
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <MailboxItemSkeleton key={i} />
            ))}
          </div>
        ) : mailbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No pending DM requests</p>
            <p className="text-xs text-muted-foreground mt-1">
              Messages from non-friends will appear here
            </p>
          </div>
        ) : (
          <div className="py-1">
            {mailbox.map((entry) => (
              <MailboxItem
                key={entry.chatId}
                entry={entry}
                isActioning={actioningChatId === entry.chatId}
                onAccept={handleAccept}
                onReject={handleReject}
                onClick={() => onOpenChat(entry.chatId)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function MailboxItem({
  entry,
  isActioning,
  onAccept,
  onReject,
  onClick,
}: {
  entry: MailboxEntry
  isActioning: boolean
  onAccept: (chatId: string) => void
  onReject: (chatId: string) => void
  onClick: () => void
}) {
  const displayName = entry.user.name || entry.user.username
  const messagePreview = entry.lastMessage
    ? entry.lastMessage.content.length > 50
      ? entry.lastMessage.content.substring(0, 50) + '...'
      : entry.lastMessage.content
    : 'No message'
  const timeAgo = entry.lastMessage
    ? formatDistanceToNow(new Date(entry.lastMessage.createdAt), { addSuffix: true })
    : ''

  return (
    <div className="px-3 py-2.5 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <button onClick={onClick} className="shrink-0">
          <Avatar className="size-10">
            {entry.user.avatar && <AvatarImage src={entry.user.avatar} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClick}
              className="text-sm font-semibold truncate hover:underline"
            >
              {displayName}
            </button>
            {entry.user.isVerified && (
              <svg className="size-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {entry.unreadCount > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[9px] bg-primary text-primary-foreground shrink-0">
                {entry.unreadCount}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{messagePreview}</p>
          {timeAgo && (
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Button
              size="sm"
              variant="default"
              className="h-7 px-2.5 text-xs gap-1 bg-primary hover:bg-primary/90"
              onClick={() => onAccept(entry.chatId)}
              disabled={isActioning}
            >
              <Check className="size-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={() => onReject(entry.chatId)}
              disabled={isActioning}
            >
              <X className="size-3" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MailboxItemSkeleton() {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1.5">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  )
}
