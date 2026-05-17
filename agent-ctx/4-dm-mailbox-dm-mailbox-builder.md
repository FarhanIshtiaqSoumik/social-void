# Task 4-dm-mailbox: DM Mailbox Builder

## Work Summary
Added DM Mailbox system to the Social Void chat page. This works like Discord's DM filter — messages from non-friends go to a mailbox where users can accept or reject them.

## Files Created
1. `src/app/api/chats/mailbox/route.ts` — Mailbox API (GET + POST)
2. `src/components/chat/mailbox-panel.tsx` — Mailbox panel UI component

## Files Modified
1. `src/components/chat/chat-list.tsx` — Added Inbox icon with red badge, mailbox props
2. `src/components/chat/chat-view.tsx` — Integrated mailbox state, friend filtering, accept/reject logic

## Key Implementation Details
- **Friend detection**: Fetches friend IDs from `/api/friends?type=list` (mutual follows)
- **Chat filtering**: DMs with non-friends are hidden from main chat list, shown in mailbox
- **Accept**: Creates bidirectional Follow records + marks messages as read
- **Reject**: Removes current user's ChatMember record (leaves the chat)
- **Periodic refresh**: Mailbox refreshes every 30 seconds
- **Socket.io integration**: Mailbox refreshes when receiving message from non-friend

## Status
- Complete
- 0 lint errors in new/modified files
- Dev server compiles successfully
