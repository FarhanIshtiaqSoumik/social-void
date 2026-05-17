# Task: schema-api - Add Notification, FriendRequest, UserBlock Prisma Models and API Routes

## Agent: Schema & API Agent

## Summary
Added 3 new Prisma models (Notification, FriendRequest, UserBlock) with corresponding User relations, synced the database, and created 3 complete API route files.

## Files Modified
1. `prisma/schema.prisma` — Added Notification, FriendRequest, UserBlock models + 6 new User relation fields

## Files Created
1. `src/app/api/notifications/route.ts` — GET (unread notifications with ping filter), POST (create notification), PATCH (mark as read/delete)
2. `src/app/api/friends/route.ts` — GET (sent/received/friends), POST (send request + notification), PATCH (accept/reject + DM chat creation)
3. `src/app/api/blocks/route.ts` — GET (blocked users), POST (block user), DELETE (unblock user)

## Database Changes
- New table: `notifications` (id, userId, fromUserId, type, title, content, relatedId, relatedType, isRead, createdAt)
- New table: `friend_requests` (id, senderId, receiverId, status, createdAt, updatedAt) with unique [senderId, receiverId]
- New table: `user_blocks` (id, blockerId, blockedId, createdAt) with unique [blockerId, blockedId]
- User model: added notifications, sentNotifications, sentFriendRequests, receivedFriendRequests, blocks, blockedBy relations

## Key Implementation Details
- Notifications GET filters "ping" type by chat membership (checks chat_members table)
- Friend request accept auto-creates DM chat (only if one doesn't exist with exactly 2 members)
- Friend request reject allows re-sending by deleting the old rejected request
- All mark-as-read operations delete notifications (read = removed pattern)
- All routes use Bearer token auth via verifyToken from @/lib/auth
- All routes use db from @/lib/db

## Verification
- `bun run db:push` — successful
- `bun run lint` — 0 errors
- Dev server compiles successfully
