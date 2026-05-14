'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/stores/app-store'

const SOCKET_URL = '/?XTransformPort=3003'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, token } = useAppStore()
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token,
        userId: user.id,
        username: user.username,
      },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Void Messenger] Connected:', socket.id)
      setIsConnected(true)

      // Emit presence as online
      socket.emit('presence-update', {
        userId: user.id,
        username: user.username,
        status: 'online',
      })
    })

    socket.on('disconnect', (reason) => {
      console.log('[Void Messenger] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[Void Messenger] Connection error:', error.message)
      setIsConnected(false)
    })

    // Heartbeat every 30 seconds
    heartbeatRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat', { userId: user.id })
      }
    }, 30_000)

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }

      // Emit offline before disconnecting
      if (socket.connected) {
        socket.emit('presence-update', {
          userId: user.id,
          username: user.username,
          status: 'offline',
        })
      }

      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [user, token])

  const emit = useCallback((event: string, data: unknown) => {
    const socket = socketRef.current
    if (socket?.connected) {
      socket.emit(event, data)
    }
  }, [])

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    const socket = socketRef.current
    if (socket) {
      socket.on(event, callback as (...args: unknown[]) => void)
      return () => {
        socket.off(event, callback as (...args: unknown[]) => void)
      }
    }
    return () => {}
  }, [])

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    const socket = socketRef.current
    if (socket) {
      socket.off(event, callback as (...args: unknown[]) => void)
    }
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  return {
    getSocket,
    isConnected,
    emit,
    on,
    off,
  }
}
