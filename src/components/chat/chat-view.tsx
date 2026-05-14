'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSocket } from '@/hooks/use-socket'
import { ChatList, type ChatItem } from './chat-list'
import { ChatWindow, type Message, MessagesSkeleton } from './chat-window'
import { NewChatModal } from './new-chat-modal'
import { MailboxPanel, type MailboxEntry } from './mailbox-panel'
import { toast } from 'sonner'

export function ChatView() {
  const { user, token, viewingChatId, setViewingChatId } = useAppStore()
  const { getSocket, isConnected, emit } = useSocket()

  const [chats, setChats] = useState<ChatItem[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [messageCursor, setMessageCursor] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<
    { userId: string; username: string; chatId: string }[]
  >([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showNewChat, setShowNewChat] = useState(false)

  // Mailbox state
  const [mailbox, setMailbox] = useState<MailboxEntry[]>([])
  const [isLoadingMailbox, setIsLoadingMailbox] = useState(false)
  const [isMailboxOpen, setIsMailboxOpen] = useState(false)
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())

  // Mobile: show chat window or list
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const activeChatId = viewingChatId

  // Fetch friend IDs (mutual follows)
  const fetchFriendIds = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/friends?type=list', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const ids = new Set<string>(data.friends.map((f: { id: string }) => f.id))
        setFriendIds(ids)
      }
    } catch (err) {
      console.error('Fetch friend IDs error:', err)
    }
  }, [token])

  // Fetch mailbox
  const fetchMailbox = useCallback(async () => {
    if (!token) return
    setIsLoadingMailbox(true)
    try {
      const res = await fetch('/api/chats/mailbox', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMailbox(data.mailbox as MailboxEntry[])
      }
    } catch (err) {
      console.error('Fetch mailbox error:', err)
    } finally {
      setIsLoadingMailbox(false)
    }
  }, [token])

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!token) return
    setIsLoadingChats(true)
    try {
      const res = await fetch('/api/chats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setChats(data.chats as ChatItem[])
      }
    } catch (err) {
      console.error('Fetch chats error:', err)
    } finally {
      setIsLoadingChats(false)
    }
  }, [token])

  // Filter chats: hide non-friend DMs (they go to mailbox instead)
  const filteredChats = chats.filter((chat) => {
    // Group chats always show
    if (chat.isGroup) return true

    // For DMs, check if the other user is a friend
    if (!user) return true
    const otherMember = chat.members.find((m) => m.user.id !== user.id)
    if (!otherMember) return true

    // If the other user is a friend, show in main list
    if (friendIds.has(otherMember.user.id)) return true

    // If not a friend, hide from main list (shown in mailbox instead)
    return false
  })

  // Fetch messages
  const fetchMessages = useCallback(
    async (chatId: string, cursor?: string) => {
      if (!token) return

      if (!cursor) {
        setIsLoadingMessages(true)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const params = new URLSearchParams({
          chatId,
          limit: '50',
        })
        if (cursor) {
          params.set('cursor', cursor)
        }

        const res = await fetch(`/api/chats/messages?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          const newMessages: Message[] = data.messages.map(
            (m: {
              id: string
              chatId: string
              content: string
              senderId: string
              sender: { username: string; name: string; avatar: string | null }
              createdAt: string
              updatedAt?: string
              isVoided?: boolean
            }) => ({
              id: m.id,
              chatId: m.chatId,
              content: m.content,
              senderId: m.senderId,
              senderName: m.sender?.username || m.sender?.name || 'Unknown',
              senderAvatar: m.sender?.avatar,
              createdAt: m.createdAt,
              updatedAt: m.updatedAt,
              isVoided: m.isVoided,
            })
          )

          if (cursor) {
            // Prepend older messages
            setMessages((prev) => [...newMessages, ...prev])
          } else {
            setMessages(newMessages)
          }

          setHasMoreMessages(!!data.nextCursor && newMessages.length >= 50)
          setMessageCursor(data.nextCursor || null)
        }
      } catch (err) {
        console.error('Fetch messages error:', err)
      } finally {
        setIsLoadingMessages(false)
        setIsLoadingMore(false)
      }
    },
    [token]
  )

  // Load chats, friend IDs, and mailbox on mount
  useEffect(() => {
    fetchChats()
    fetchFriendIds()
    fetchMailbox()
  }, [fetchChats, fetchFriendIds, fetchMailbox])

  // Periodically refresh mailbox (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMailbox()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchMailbox])

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      setMessages([])
      setMessageCursor(null)
      setTypingUsers([])
      fetchMessages(activeChatId)

      // Join socket room
      if (isConnected && user) {
        emit('join-chat', {
          chatId: activeChatId,
          userId: user.id,
          username: user.username,
        })
      }
    }

    return () => {
      // Leave socket room when switching chats
      if (activeChatId && isConnected && user) {
        emit('leave-chat', {
          chatId: activeChatId,
          userId: user.id,
        })
      }
    }
  }, [activeChatId, isConnected, user, emit, fetchMessages])

  // Socket.io event listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !isConnected) return

    const handleNewMessage = (data: {
      id: string
      chatId: string
      content: string
      senderId: string
      senderName?: string
      senderAvatar?: string
      timestamp?: number
      createdAt?: string
      voided?: boolean
    }) => {
      const newMsg: Message = {
        id: data.id,
        chatId: data.chatId,
        content: data.content,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        createdAt: data.createdAt || (data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString()),
        isVoided: data.voided,
      }

      // Add message if it belongs to active chat
      if (data.chatId === activeChatId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === data.id)) return prev
          return [...prev, newMsg]
        })

        // Mark as read
        if (user && data.senderId !== user.id) {
          emit('read-messages', {
            chatId: data.chatId,
            userId: user.id,
            username: user.username,
            messageIds: [data.id],
          })
        }
      }

      // Update chat list (move to top, update last message)
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                lastMessage: {
                  content: data.content,
                  createdAt: newMsg.createdAt,
                  sender: { username: data.senderName || 'Unknown' },
                },
              }
            : chat
        ).sort((a, b) => {
          // Sort by last message time (most recent first)
          const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
          const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
          return bTime - aTime
        })
      )

      // Refresh mailbox when receiving a message from a non-friend
      if (data.senderId !== user?.id) {
        fetchMailbox()
      }
    }

    const handleUserTyping = (data: { chatId: string; userId: string; username: string }) => {
      if (data.chatId === activeChatId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          if (prev.some((t) => t.userId === data.userId && t.chatId === data.chatId)) return prev
          return [...prev, { userId: data.userId, username: data.username, chatId: data.chatId }]
        })
      }
    }

    const handleUserStoppedTyping = (data: { chatId: string; userId: string }) => {
      if (data.chatId === activeChatId) {
        setTypingUsers((prev) => prev.filter((t) => !(t.userId === data.userId && t.chatId === data.chatId)))
      }
    }

    const handleMessagesRead = (data: { chatId: string; userId: string; messageIds: string[] }) => {
      if (data.chatId === activeChatId) {
        setMessages((prev) =>
          prev.map((m) =>
            data.messageIds.includes(m.id) ? { ...m, isRead: true } : m
          )
        )
      }
    }

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId))
    }

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    }

    const handlePresenceChange = (data: { userId: string; status: string }) => {
      if (data.status === 'online') {
        setOnlineUsers((prev) => new Set(prev).add(data.userId))
      } else {
        setOnlineUsers((prev) => {
          const next = new Set(prev)
          next.delete(data.userId)
          return next
        })
      }
    }

    // Register listeners
    socket.on('new-message', handleNewMessage as (...args: unknown[]) => void)
    socket.on('user-typing', handleUserTyping as (...args: unknown[]) => void)
    socket.on('user-stopped-typing', handleUserStoppedTyping as (...args: unknown[]) => void)
    socket.on('messages-read', handleMessagesRead as (...args: unknown[]) => void)
    socket.on('user-online', handleUserOnline as (...args: unknown[]) => void)
    socket.on('user-offline', handleUserOffline as (...args: unknown[]) => void)
    socket.on('presence-change', handlePresenceChange as (...args: unknown[]) => void)

    return () => {
      socket.off('new-message', handleNewMessage as (...args: unknown[]) => void)
      socket.off('user-typing', handleUserTyping as (...args: unknown[]) => void)
      socket.off('user-stopped-typing', handleUserStoppedTyping as (...args: unknown[]) => void)
      socket.off('messages-read', handleMessagesRead as (...args: unknown[]) => void)
      socket.off('user-online', handleUserOnline as (...args: unknown[]) => void)
      socket.off('user-offline', handleUserOffline as (...args: unknown[]) => void)
      socket.off('presence-change', handlePresenceChange as (...args: unknown[]) => void)
    }
  }, [getSocket, isConnected, activeChatId, user, emit, fetchMailbox])

  // Select a chat
  const handleSelectChat = useCallback(
    (chatId: string) => {
      setViewingChatId(chatId)
      setMobileShowChat(true)
    },
    [setViewingChatId]
  )

  // Send message via API + socket
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeChatId || !token || !user) return

      // Find active chat for void mode
      const activeChat = chats.find((c) => c.id === activeChatId)

      // Send via socket for real-time
      emit('send-message', {
        chatId: activeChatId,
        senderId: user.id,
        senderName: user.username,
        senderAvatar: user.avatar,
        content,
        voidMode: activeChat?.voidMode || false,
      })

      // Also persist to database via API
      try {
        await fetch('/api/chats/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: activeChatId,
            content,
          }),
        })
      } catch (err) {
        console.error('Send message API error:', err)
      }

      // Refresh chat list to update last message
      fetchChats()
    },
    [activeChatId, token, user, emit, chats, fetchChats]
  )

  // Handle message edited
  const handleMessageEdited = useCallback(
    (messageId: string, content: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content, isEdited: true, updatedAt: new Date().toISOString() }
            : m
        )
      )
    },
    []
  )

  // Handle message deleted
  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: '[void]', isVoided: true }
          : m
      )
    )
  }, [])

  // Handle back on mobile
  const handleBack = useCallback(() => {
    setMobileShowChat(false)
    setViewingChatId(null)
  }, [setViewingChatId])

  // Load more messages
  const handleLoadMore = useCallback(() => {
    if (activeChatId && messageCursor && hasMoreMessages) {
      fetchMessages(activeChatId, messageCursor)
    }
  }, [activeChatId, messageCursor, hasMoreMessages, fetchMessages])

  // New chat created
  const handleChatCreated = useCallback(
    (chatId: string) => {
      fetchChats()
      fetchFriendIds()
      setViewingChatId(chatId)
      setMobileShowChat(true)
    },
    [fetchChats, fetchFriendIds, setViewingChatId]
  )

  // Mailbox: accept a DM request
  const handleAcceptMailbox = useCallback(
    async (chatId: string) => {
      if (!token) return
      try {
        const res = await fetch('/api/chats/mailbox', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatId, action: 'accept' }),
        })
        if (res.ok) {
          toast.success('DM request accepted! User added as friend.')
          // Refresh all data
          fetchChats()
          fetchFriendIds()
          fetchMailbox()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to accept DM request')
        }
      } catch {
        toast.error('Failed to accept DM request')
      }
    },
    [token, fetchChats, fetchFriendIds, fetchMailbox]
  )

  // Mailbox: reject a DM request
  const handleRejectMailbox = useCallback(
    async (chatId: string) => {
      if (!token) return
      try {
        const res = await fetch('/api/chats/mailbox', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatId, action: 'reject' }),
        })
        if (res.ok) {
          toast.success('DM request rejected.')
          // Refresh data
          fetchChats()
          fetchMailbox()
          // If we were viewing this chat, close it
          if (viewingChatId === chatId) {
            setViewingChatId(null)
            setMobileShowChat(false)
          }
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to reject DM request')
        }
      } catch {
        toast.error('Failed to reject DM request')
      }
    },
    [token, fetchChats, fetchMailbox, viewingChatId, setViewingChatId]
  )

  // Mailbox: open a chat from mailbox (allows viewing the message)
  const handleOpenMailboxChat = useCallback(
    (chatId: string) => {
      setViewingChatId(chatId)
      setMobileShowChat(true)
      setIsMailboxOpen(false)
    },
    [setViewingChatId]
  )

  // Toggle mailbox
  const handleToggleMailbox = useCallback(() => {
    setIsMailboxOpen((prev) => !prev)
    if (!isMailboxOpen) {
      fetchMailbox()
    }
  }, [isMailboxOpen, fetchMailbox])

  // Close mailbox
  const handleCloseMailbox = useCallback(() => {
    setIsMailboxOpen(false)
  }, [])

  // Get active chat from the unfiltered list (so we can view mailbox chats too)
  const activeChat = chats.find((c) => c.id === activeChatId) || null

  // Mailbox count
  const mailboxCount = mailbox.length

  // Empty state
  if (!isLoadingChats && filteredChats.length === 0 && !activeChatId && mailboxCount === 0) {
    return (
      <div className="h-full flex flex-col">
        <NewChatModal
          open={showNewChat}
          onOpenChange={setShowNewChat}
          onChatCreated={handleChatCreated}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a new conversation to begin messaging
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            New Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-screen flex overflow-hidden">
      <NewChatModal
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onChatCreated={handleChatCreated}
      />

      {/* Chat List Panel */}
      <div
        className={`${
          mobileShowChat ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-80 xl:w-96 flex-col border-r border-border bg-background relative`}
      >
        <ChatList
          chats={filteredChats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onCreateChat={() => setShowNewChat(true)}
          isLoading={isLoadingChats}
          onlineUsers={onlineUsers}
          mailboxCount={mailboxCount}
          onToggleMailbox={handleToggleMailbox}
          isMailboxOpen={isMailboxOpen}
        />

        {/* Mailbox Panel - overlaid below the header */}
        {isMailboxOpen && (
          <MailboxPanel
            mailbox={mailbox}
            isLoading={isLoadingMailbox}
            onAccept={handleAcceptMailbox}
            onReject={handleRejectMailbox}
            onOpenChat={handleOpenMailboxChat}
            onClose={handleCloseMailbox}
          />
        )}
      </div>

      {/* Chat Window Panel */}
      <div
        className={`${
          !mobileShowChat ? 'hidden lg:flex' : 'flex'
        } flex-1 flex-col min-w-0`}
      >
        {activeChat ? (
          isLoadingMessages && messages.length === 0 ? (
            <MessagesSkeleton />
          ) : (
            <ChatWindow
              chat={activeChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              onLoadMore={handleLoadMore}
              hasMore={hasMoreMessages}
              isLoadingMore={isLoadingMore}
              typingUsers={typingUsers}
              socketEmit={emit}
              onlineUsers={onlineUsers}
              onMessageEdited={handleMessageEdited}
              onMessageDeleted={handleMessageDeleted}
            />
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded-full bg-primary/30" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a chat from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
