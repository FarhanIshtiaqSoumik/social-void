# Task 23 - Home & People Pages Rebuild

## Work Summary

Rebuilt the Home page (was Feed) with search functionality and created the People page (was Discover) with mutual friends algorithm.

## Files Modified

1. **`src/components/feed/feed-view.tsx`** - Rebuilt as "Home" page
   - Changed title from "Your Feed" to "Home"
   - Added search bar with debounced (300ms) search for both users and posts
   - Search users via `/api/users?type=search&q=xxx`
   - Search posts via `/api/posts?type=search&q=xxx&limit=5`
   - Search results show "People" section with avatar + name + username + blue verified badge + follow icon
   - Search results show "Posts" section with PostCard components
   - Clicking a user navigates to their profile (`setViewingUserId`)
   - Clear search button (X icon) resets to normal feed
   - When search active, show results; when empty, show normal feed
   - Updated empty state CTA from "Explore the Void" to "Find People" navigating to 'people' view

2. **`src/components/feed/discover-view.tsx`** - Completely rewritten as "People" page
   - Title: "People" with Users icon and subtitle "People you may know based on mutual friends"
   - Fetches from `/api/users/follows?type=suggestions` — returns users with `mutualCount` and `mutualFriends`
   - Each person card shows: Avatar (large), Name + Username + Blue verified badge, Bio (truncated), Mutual friends info with small avatars + count, Follow/Unfollow button (red primary), Message button (outline)
   - Search bar to filter suggestions by name/username
   - Filter tabs: "All", "Suggested", "Most Mutual Friends"
   - Loading: Skeleton cards in grid
   - Empty state: "You're connected with everyone! 🎉" or "No matching people"
   - Grid layout: 2 columns on mobile, 3 on desktop
   - Message button creates DM chat via `/api/chats` and navigates to it

3. **`src/components/social/sidebar.tsx`** - Updated navigation
   - Changed `Compass` import to `Users` from lucide-react
   - `{ icon: Home, label: 'Home', view: 'home' }` (was 'Feed')
   - `{ icon: Users, label: 'People', view: 'people' }` (was 'Discover' with Compass)

4. **`src/components/social/mobile-nav.tsx`** - Updated mobile navigation
   - Changed `Compass` import to `Users` from lucide-react
   - `{ icon: Home, label: 'Home', view: 'home' }` (was 'Feed')
   - `{ icon: Users, label: 'People', view: 'people' }` (was 'Discover' with Compass)

5. **`src/app/page.tsx`** - Updated ViewRenderer
   - `if (view === 'home')` → renders `<FeedView />`
   - `if (view === 'people')` → renders `<DiscoverView />`
   - Removed old 'feed' and 'discover' references

6. **`src/app/api/posts/route.ts`** - Added search API endpoint
   - New `type=search` with `q` query parameter
   - Searches posts by caption, tags, author username, and author name

## Verification
- ESLint passes with 0 errors
- Dev server compiles successfully
- All API routes verified: search posts and user suggestions working
