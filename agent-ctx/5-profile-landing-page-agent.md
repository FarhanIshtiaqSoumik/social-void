# Task 5 - Profile + Landing Page Agent

## Summary
Fixed and enhanced the profile page and landing page for Social Void.

## Changes Made

### 1. Avatar Selection Grid (`edit-profile-modal.tsx`)
- Replaced URL input with a visual grid of 24 DiceBear avatars
- 9 avatar styles × 3 seeds = 27 generated, sliced to 24
- Grid: 6 cols mobile, 8 cols desktop, ~40-48px each
- Selected avatar highlighted with primary ring + offset
- "Remove avatar" link when avatar selected

### 2. Removed Text-Only View (`profile-view.tsx`)
- Removed `viewMode` state, Grid/List toggle buttons
- Removed `ProfileList` import, `Grid3X3`/`List` imports
- Always shows ProfileGrid
- Kept "Void History" header with dot indicator

### 3. Added Settings/Legal/Logout (`profile-view.tsx`)
- Settings button → setCurrentView('settings')
- Legal button → setViewingLegalPage('privacy')
- Logout button → AlertDialog confirmation → logout() + toast
- All buttons in row below "Edit Profile", rounded-full, min-h-[44px]

### 4. Fixed Like/Comment in Profile Posts
- **profile-grid.tsx**: Click opens fullscreen overlay with post detail, working like (optimistic + echo pulse), working comment (inline CommentsSection), close via X button or backdrop click
- **profile-list.tsx**: Like button does optimistic toggle via POST /api/posts/likes, comment button toggles inline CommentsSection, caption uses ReactMarkdown

### 5. Fixed Landing Page V Logo on Mobile (`landing-page.tsx`)
- Main circle: `w-24 h-24 sm:w-36 sm:h-36` (was `w-28 h-28 sm:w-36 sm:h-36`)
- Pulse: `20px` max (was `30px`)
- Inner ring: `inset-[-8px] sm:inset-[-12px]` (was `inset-[-12px]`)
- Outer ring: `inset-[-16px] sm:inset-[-28px]` (was `inset-[-28px]`)
- Container: `pt-8 sm:pt-0`, Void circle: `mt-4 sm:mt-0`

## Lint Status
0 errors, dev server compiles successfully
