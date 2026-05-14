import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

// ============================================================
// Types & Interfaces
// ============================================================

type PresenceStatus = 'online' | 'offline' | 'idle'

interface UserPresence {
  userId: string
  username: string
  status: PresenceStatus
  socketId: string
  lastHeartbeat: number
  currentRooms: Set<string>
}

interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  timestamp: number
  voidMode: boolean
  voidExpiresAt?: number // timestamp when message is voided
  readBy: string[]
}

interface TypingState {
  userId: string
  username: string
  chatId: string
}

interface ReadReceiptPayload {
  chatId: string
  userId: string
  username: string
  messageIds: string[]
}

// ============================================================
// In-Memory State
// ============================================================

const presenceMap = new Map<string, UserPresence>()       // socketId -> presence
const userIndex = new Map<string, string>()                // userId -> socketId
const roomMessages = new Map<string, ChatMessage[]>()      // chatId -> messages
const typingUsers = new Map<string, Map<string, TypingState>>() // chatId -> (userId -> state)

// Void Mode: auto-expire timers per message
const voidTimers = new Map<string, ReturnType<typeof setTimeout>>() // messageId -> timer

// Heartbeat tracking
const HEARTBEAT_INTERVAL = 30_000   // 30 seconds
const HEARTBEAT_TIMEOUT = 90_000    // 3 missed heartbeats = idle
const IDLE_TIMEOUT = 120_000        // 2 minutes idle -> offline

const heartbeatChecker = setInterval(() => {
  const now = Date.now()
  for (const [socketId, presence] of presenceMap.entries()) {
    const elapsed = now - presence.lastHeartbeat
    if (elapsed > IDLE_TIMEOUT && presence.status !== 'offline') {
      // Mark as offline
      presence.status = 'offline'
      io.emit('user-offline', { userId: presence.userId, username: presence.username })
      io.emit('presence-change', { userId: presence.userId, username: presence.username, status: 'offline' })
    } else if (elapsed > HEARTBEAT_TIMEOUT && presence.status === 'online') {
      // Mark as idle
      presence.status = 'idle'
      io.emit('presence-change', { userId: presence.userId, username: presence.username, status: 'idle' })
    }
  }
}, HEARTBEAT_INTERVAL)

// ============================================================
// Utility Functions
// ============================================================

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

const getMessagesForRoom = (chatId: string): ChatMessage[] => {
  if (!roomMessages.has(chatId)) {
    roomMessages.set(chatId, [])
  }
  return roomMessages.get(chatId)!
}

const addMessageToRoom = (message: ChatMessage): void => {
  const msgs = getMessagesForRoom(message.chatId)
  msgs.push(message)
  // Keep last 500 messages per room
  if (msgs.length > 500) {
    msgs.splice(0, msgs.length - 500)
  }
}

const removeTypingForUser = (socketId: string, chatId?: string): void => {
  const presence = presenceMap.get(socketId)
  if (!presence) return

  const rooms = chatId ? [chatId] : Array.from(presence.currentRooms)
  for (const roomId of rooms) {
    const roomTyping = typingUsers.get(roomId)
    if (roomTyping) {
      roomTyping.delete(presence.userId)
      if (roomTyping.size === 0) {
        typingUsers.delete(roomId)
      }
    }
  }
}

const scheduleVoidMessage = (message: ChatMessage, ttlMs: number): void => {
  const timer = setTimeout(() => {
    message.content = '[void]'
    message.voidExpiresAt = Date.now()
    // Notify room that message was voided
    io.to(message.chatId).emit('new-message', {
      ...message,
      voided: true,
    })
    // Clean up timer reference
    voidTimers.delete(message.id)
  }, ttlMs)

  voidTimers.set(message.id, timer)
}

// ============================================================
// Socket.io Server Setup
// ============================================================

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ============================================================
// Connection Handler
// ============================================================

io.on('connection', (socket: Socket) => {
  console.log(`[Void Chat] Connected: ${socket.id}`)

  // ----------------------------------------------------------
  // join-chat: User joins a chat room
  // ----------------------------------------------------------
  socket.on('join-chat', (data: { userId: string; username: string; chatId: string }) => {
    const { userId, username, chatId } = data

    // Leave previous rooms for this socket (optional: user in multiple rooms)
    // For now, allow multiple rooms per user
    socket.join(chatId)

    // Track presence
    userIndex.set(userId, socket.id)

    const existing = presenceMap.get(socket.id)
    if (existing) {
      existing.currentRooms.add(chatId)
      existing.lastHeartbeat = Date.now()
    } else {
      presenceMap.set(socket.id, {
        userId,
        username,
        status: 'online',
        socketId: socket.id,
        lastHeartbeat: Date.now(),
        currentRooms: new Set([chatId]),
      })
      // Broadcast user online
      io.emit('user-online', { userId, username })
      io.emit('presence-change', { userId, username, status: 'online' })
    }

    // Send recent messages to the joining user
    const recentMessages = getMessagesForRoom(chatId).slice(-50)
    socket.emit('chat-history', { chatId, messages: recentMessages })

    // Notify room about user joining
    socket.to(chatId).emit('user-joined-room', { userId, username, chatId })

    console.log(`[Void Chat] ${username} (${userId}) joined chat ${chatId}`)
  })

  // ----------------------------------------------------------
  // leave-chat: User leaves a chat room
  // ----------------------------------------------------------
  socket.on('leave-chat', (data: { userId: string; chatId: string }) => {
    const { userId, chatId } = data

    socket.leave(chatId)

    // Remove typing state for this user in this room
    removeTypingForUser(socket.id, chatId)

    // Remove room from presence tracking
    const presence = presenceMap.get(socket.id)
    if (presence) {
      presence.currentRooms.delete(chatId)

      // Notify room
      socket.to(chatId).emit('user-left-room', {
        userId,
        username: presence.username,
        chatId,
      })
    }

    console.log(`[Void Chat] User ${userId} left chat ${chatId}`)
  })

  // ----------------------------------------------------------
  // send-message: Send a message to a chat room
  // ----------------------------------------------------------
  socket.on(
    'send-message',
    (data: {
      chatId: string
      senderId: string
      senderName: string
      content: string
      voidMode?: boolean
      voidTtlMs?: number
    }) => {
      const { chatId, senderId, senderName, content, voidMode = false, voidTtlMs = 60000 } = data

      const message: ChatMessage = {
        id: generateId(),
        chatId,
        senderId,
        senderName,
        content,
        timestamp: Date.now(),
        voidMode,
        readBy: [senderId],
      }

      // If void mode, set expiry and schedule auto-void
      if (voidMode) {
        message.voidExpiresAt = Date.now() + voidTtlMs
        scheduleVoidMessage(message, voidTtlMs)
      }

      // Store message
      addMessageToRoom(message)

      // Broadcast to room (including sender for confirmation)
      io.to(chatId).emit('new-message', message)

      // Clear any typing state for sender in this chat
      const roomTyping = typingUsers.get(chatId)
      if (roomTyping) {
        roomTyping.delete(senderId)
        if (roomTyping.size === 0) {
          typingUsers.delete(chatId)
        }
      }

      console.log(`[Void Chat] Message in ${chatId} from ${senderName}: ${content.substring(0, 50)}${voidMode ? ' [VOID]' : ''}`)
    }
  )

  // ----------------------------------------------------------
  // typing: User is typing in a chat
  // ----------------------------------------------------------
  socket.on('typing', (data: { userId: string; username: string; chatId: string }) => {
    const { userId, username, chatId } = data

    // Track typing state
    if (!typingUsers.has(chatId)) {
      typingUsers.set(chatId, new Map())
    }
    typingUsers.get(chatId)!.set(userId, { userId, username, chatId })

    // Broadcast to others in the room
    socket.to(chatId).emit('user-typing', { userId, username, chatId })
  })

  // ----------------------------------------------------------
  // stop-typing: User stopped typing
  // ----------------------------------------------------------
  socket.on('stop-typing', (data: { userId: string; chatId: string }) => {
    const { userId, chatId } = data

    // Remove typing state
    const roomTyping = typingUsers.get(chatId)
    if (roomTyping) {
      roomTyping.delete(userId)
      if (roomTyping.size === 0) {
        typingUsers.delete(chatId)
      }
    }

    // Broadcast to others in the room
    socket.to(chatId).emit('user-stopped-typing', { userId, chatId })
  })

  // ----------------------------------------------------------
  // read-messages: Mark messages as read
  // ----------------------------------------------------------
  socket.on(
    'read-messages',
    (data: { chatId: string; userId: string; username: string; messageIds: string[] }) => {
      const { chatId, userId, username, messageIds } = data

      // Update read receipts on stored messages
      const msgs = getMessagesForRoom(chatId)
      for (const msgId of messageIds) {
        const msg = msgs.find((m) => m.id === msgId)
        if (msg && !msg.readBy.includes(userId)) {
          msg.readBy.push(userId)
        }
      }

      // Broadcast read receipt to room
      const receipt: ReadReceiptPayload = { chatId, userId, username, messageIds }
      io.to(chatId).emit('messages-read', receipt)
    }
  )

  // ----------------------------------------------------------
  // presence-update: Update user's presence status
  // ----------------------------------------------------------
  socket.on(
    'presence-update',
    (data: { userId: string; username: string; status: PresenceStatus }) => {
      const { userId, username, status } = data

      const presence = presenceMap.get(socket.id)
      if (presence) {
        presence.status = status
        presence.lastHeartbeat = Date.now()
      }

      // Broadcast presence change
      io.emit('presence-change', { userId, username, status })

      if (status === 'online') {
        io.emit('user-online', { userId, username })
      } else if (status === 'offline') {
        io.emit('user-offline', { userId, username })
      }

      console.log(`[Void Chat] ${username} is now ${status}`)
    }
  )

  // ----------------------------------------------------------
  // heartbeat: Client heartbeat
  // ----------------------------------------------------------
  socket.on('heartbeat', (data: { userId: string }) => {
    const presence = presenceMap.get(socket.id)
    if (presence) {
      presence.lastHeartbeat = Date.now()
      // If user was idle, bring back to online
      if (presence.status === 'idle') {
        presence.status = 'online'
        io.emit('presence-change', {
          userId: presence.userId,
          username: presence.username,
          status: 'online',
        })
      }
    }

    // Acknowledge heartbeat
    socket.emit('heartbeat-ack', { timestamp: Date.now() })
  })

  // ----------------------------------------------------------
  // disconnect: User disconnected
  // ----------------------------------------------------------
  socket.on('disconnect', (reason) => {
    const presence = presenceMap.get(socket.id)

    if (presence) {
      const { userId, username, currentRooms } = presence

      // Remove typing state from all rooms
      for (const roomId of currentRooms) {
        const roomTyping = typingUsers.get(roomId)
        if (roomTyping) {
          roomTyping.delete(userId)
          if (roomTyping.size === 0) {
            typingUsers.delete(roomId)
          }
        }
      }

      // Clean up presence
      presenceMap.delete(socket.id)
      userIndex.delete(userId)

      // Broadcast offline status
      io.emit('user-offline', { userId, username })
      io.emit('presence-change', { userId, username, status: 'offline' })

      console.log(`[Void Chat] ${username} (${userId}) disconnected. Reason: ${reason}`)
    } else {
      console.log(`[Void Chat] Socket ${socket.id} disconnected. Reason: ${reason}`)
    }
  })

  // ----------------------------------------------------------
  // error handling
  // ----------------------------------------------------------
  socket.on('error', (error) => {
    console.error(`[Void Chat] Socket error (${socket.id}):`, error)
  })
})

// ============================================================
// Start Server
// ============================================================

const PORT = 3003

httpServer.listen(PORT, () => {
  console.log(`[Void Chat] 🔴 Void Messenger service running on port ${PORT}`)
})

// ============================================================
// Graceful Shutdown
// ============================================================

const shutdown = () => {
  console.log('[Void Chat] Shutting down...')

  clearInterval(heartbeatChecker)

  // Clear all void timers
  for (const [msgId, timer] of voidTimers.entries()) {
    clearTimeout(timer)
    voidTimers.delete(msgId)
  }

  io.close(() => {
    httpServer.close(() => {
      console.log('[Void Chat] Server closed')
      process.exit(0)
    })
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
