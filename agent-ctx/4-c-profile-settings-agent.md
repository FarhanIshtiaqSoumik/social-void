# Task 4-c: User Profile & Settings UI

## Agent: Profile & Settings Agent

## Files Created

### 1. `src/components/profile/profile-view.tsx`
Main user profile page component featuring:
- Fetches user data from `/api/users` based on `viewingUserId` from store (or current user if null)
- Profile header with large avatar, name, username, verified badge (BadgeCheck icon), bio, website link, join date
- Stats row with clickable Posts/Followers/Following counts with hover effects
- Action buttons: Follow/Unfollow (red primary color), Edit Profile (own profile), Message
- Grid/List view toggle with "Void History" section header
- Back navigation when viewing other user profiles
- Loading skeleton state
- User not found empty state
- Follow/unfollow toggle with real API integration (`/api/users/follow`)
- Optimistic follower count updates on follow/unfollow
- Smooth Framer Motion animations

### 2. `src/components/profile/profile-grid.tsx`
Instagram-style grid view for user posts:
- 3-column grid on desktop, 2-column on mobile (responsive with `grid-cols-3 gap-0.5 sm:gap-1`)
- Each item: thumbnail image with hover overlay showing like/comment counts
- Lazy loading with loading skeleton placeholders
- Failed image fallback with caption snippet
- Multi-image indicator (stacked bars icon) for posts with multiple media
- Click to view post detail (toast "coming soon")
- Empty state: "The Void is Empty" with icon and description
- Staggered entrance animations

### 3. `src/components/profile/profile-list.tsx`
List view for user posts:
- Card-based list layout similar to feed post cards
- Shows: author avatar + name, time ago, caption, media grid (1-4 images), tags as badges, engagement bar (likes + comments)
- Lazy loaded images with loading states
- Multi-image grid: 1 image full-width, 2 images side-by-side, 3 images with first spanning 2 cols, 4+ with "+N more" overlay
- Empty state: "The Void is Empty" with FileText icon
- Staggered entrance animations
- Time-ago formatting (now, Xm, Xh, Xd, or date)

### 4. `src/components/profile/edit-profile-modal.tsx`
Edit profile dialog:
- Fields: Display Name (input), Bio (textarea with 160 char counter), Website (input), Avatar URL (input with live preview), Private account toggle (Switch)
- Avatar preview updates in real-time as URL changes
- Save button (red primary) with loading spinner
- Cancel button
- Calls `/api/users/update` endpoint
- Updates both Zustand store and localStorage on success
- Toast notifications on success/failure
- Uses shadcn/ui Dialog, Input, Textarea, Switch, Label, Avatar, Separator

### 5. `src/components/profile/settings-view.tsx`
Full settings panel with sections:
- **Account**: View profile link, Email (read-only), Change password (placeholder), Delete account (placeholder, destructive hover)
- **Privacy**: Blocked users (placeholder)
- **Notifications**: Toggle switches for Likes, Comments, New Followers, Messages, Mentions
- **Appearance**: Dark/Light mode toggle (integrates with next-themes)
- **Legal**: Privacy Policy link, Terms of Service link, Credits (shows toast)
- **Logout**: Red destructive-styled button
- **Version info**: "Social Void v1.0"
- Clean sectioned layout with rounded card containers and dividers
- Framer Motion entrance animation

### 6. `src/app/page.tsx` (Updated)
- Added imports for `ProfileView` and `SettingsView`
- ViewRenderer now renders ProfileView for 'profile' view and SettingsView for 'settings' view
- Removed broken imports for components that don't exist yet (ChatView, AdminView)
- Kept placeholder rendering for feed, discover, chat, admin, notifications views

## Design Decisions
- Red (#FF0000) accent used for: Follow button, active grid/list toggle, save button, verification badge
- Avatar fallback: Red "V" letter on gray background when no avatar (per spec)
- Clean minimal design with proper spacing and visual hierarchy
- Mobile-first responsive with grid-cols-3/2 for grid view
- All API calls include Bearer token authorization
- Profile and posts are fetched separately with independent loading states

## Lint Status
All profile components pass lint cleanly. Pre-existing lint errors in other agents' files remain.
