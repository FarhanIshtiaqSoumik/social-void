# Task 2-a: Void Chat Service

## Agent: Void Chat Service

## Summary
Created the Socket.io real-time chat mini-service at `/home/z/my-project/mini-services/void-chat/`.

## Files Created
- `package.json` - Independent bun project with socket.io dependency, dev command: `bun --hot index.ts`
- `index.ts` - Full Socket.io server implementation with all required features

## Features Implemented
1. **User Presence Tracking** - online/offline/idle status with automatic transitions
2. **Real-time Message Delivery** - Room-based broadcasting via `io.to(chatId).emit()`
3. **Typing Indicators** - Per-room tracking with start/stop events
4. **Read Receipts** - Per-message read-by tracking with acknowledgements
5. **Heartbeat System** - 30s interval, 90s idle detection, 120s offline detection
6. **Room-based Messaging** - Users can join multiple rooms, messages scoped to rooms
7. **Void Mode** - Messages auto-expire with configurable TTL, content replaced with `[void]`

## Socket Events Handled (8)
- `join-chat`, `leave-chat`, `send-message`, `typing`, `stop-typing`, `read-messages`, `presence-update`, `heartbeat`

## Socket Events Emitted (7)
- `new-message`, `user-typing`, `user-stopped-typing`, `messages-read`, `user-online`, `user-offline`, `presence-change`

## Configuration
- Port: 3003
- Socket.io path: `/` (for Caddy gateway)
- CORS: `*`
- pingTimeout: 60000, pingInterval: 25000

## Status
✅ Service created, dependencies installed, and verified running on port 3003.
