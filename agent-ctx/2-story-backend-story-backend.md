# Task 2-story-backend - Story Backend Agent

## Summary
Implemented the complete Story system backend for Social Void.

## Files Modified
- `prisma/schema.prisma` — Added Story model and `stories Story[]` to User
- `src/app/api/friends/route.ts` — Added `type=list` and `type=check` GET endpoints

## Files Created
- `src/app/api/stories/route.ts` — GET/POST/DELETE for stories feed
- `src/app/api/stories/[id]/route.ts` — GET specific user's stories

## API Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/stories | Active stories from friends (mutual follows) |
| POST | /api/stories | Create story (max 5 active, 1-48h duration) |
| DELETE | /api/stories?storyId=xxx | Delete own story |
| GET | /api/stories/[id] | Specific user's active stories |
| GET | /api/friends?type=list | List mutual follow friends + pending count |
| GET | /api/friends?type=check&userId=xxx | Check friendship status |

## Database Changes
- Story table: id, authorId, mediaUrl, mediaType, caption, duration, expiresAt, createdAt
- Ran `bun run db:push` successfully

## Status
- 0 lint errors
- Dev server compiles successfully
