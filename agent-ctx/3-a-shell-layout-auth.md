# Task 3-a: App Shell Layout, Sidebar Navigation, and Authentication Modals

**Agent:** Shell Layout & Auth Agent
**Date:** 2026-05-11

## Work Completed

### Files Modified

1. **`src/app/layout.tsx`** — Updated with:
   - Title changed to "Social Void"
   - Description updated to match the platform
   - Icons changed to use `/logo.svg`
   - Added `ThemeProvider` from `next-themes` with `attribute="class"`, `defaultTheme="light"`, `enableSystem`, and `disableTransitionOnChange`
   - Kept Geist fonts and Toaster

2. **`src/app/page.tsx`** — Complete rewrite as client component:
   - On mount, validates auth from localStorage against `/api/auth` (action: me)
   - Falls back to stored user on network error
   - Clears invalid tokens from localStorage
   - Shows loading spinner during auth check (`isLoadingAuth` state)
   - Unauthenticated: renders `LandingPage` + `AuthModal`
   - Authenticated: renders app shell with `Sidebar`, content area, and `MobileNav`
   - Content area uses `AnimatePresence` for smooth view transitions
   - `ViewRenderer` placeholder component for all 8 view modes (feed, discover, chat, profile, admin, legal, settings, notifications)
   - Sticky footer pattern with `min-h-screen flex flex-col`

### Files Created

3. **`src/components/auth/auth-modal.tsx`** — Authentication modal:
   - Uses shadcn `Dialog` component
   - Two-tab interface: Login and Sign Up
   - Login form: email + password with show/hide toggle
   - Sign Up form: name + email + password with show/hide toggle
   - "Admin Login" link that switches to admin form (email + password)
   - Framer Motion `AnimatePresence` for smooth tab transitions
   - Red (primary) accent on submit buttons
   - Password visibility toggle on all password fields
   - Error handling with toast notifications via `useToast`
   - On success: stores token + user in localStorage AND Zustand store
   - Closes modal and resets forms on success
   - Loading state with spinner on submit buttons
   - Divider with "or" text between login and admin login

4. **`src/components/social/landing-page.tsx`** — Landing page for unauthenticated users:
   - Large "SOCIAL VOID" title with red "VOID" accent
   - Tagline: "Enter the Void. Share your world."
   - Animated red pulsing circle (the "Void") with orbiting rings
   - "Join the Void" (primary) and "Sign In" (outline) CTA buttons
   - Three feature highlight cards: Feed, Messenger, Discovery
   - Framer Motion entrance animations with staggered delays
   - Background gradient orbs for visual depth
   - Mobile responsive design
   - Bottom gradient fade

5. **`src/components/social/sidebar.tsx`** — Desktop sidebar navigation:
   - Fixed left sidebar, 240px (w-60) on desktop, xl:w-64
   - Social Void logo + name at top with red "V" circle
   - Nav items with Lucide icons: Home/Feed, Compass/Discover, MessageSquare/Chat, User/Profile, Shield/Admin (conditional on isAdmin), FileText/Legal, Settings/Settings
   - "Create Post" button (red, rounded-full, prominent)
   - User avatar + name + username at bottom
   - Logout button with destructive hover effect
   - Dark/Light theme toggle
   - Active state with red accent bar (animated with Framer Motion `layoutId`)
   - `Separator` components between sections
   - Custom scrollbar styling
   - Hidden on mobile (`hidden lg:flex`)

6. **`src/components/social/mobile-nav.tsx`** — Mobile bottom navigation:
   - Fixed bottom bar (`fixed bottom-0`)
   - 4 main nav items (5 if admin): Feed, Discover, Chat, Profile, Admin
   - Red active indicator bar at top (animated with `layoutId`)
   - Floating "Create Post" button (red circle, bottom-right)
   - iOS safe area padding (`pb-[env(safe-area-inset-bottom)]`)
   - Hidden on desktop (`lg:hidden`)
   - Touch-friendly tap targets

## Technical Decisions

- Used `layoutId` from Framer Motion for smooth active state animations in both sidebar and mobile nav
- Auth validation runs on mount with server-side token verification, falls back to localStorage on network error
- All forms use controlled state with proper loading/error handling
- Theme toggle integrated into sidebar for desktop, no mobile theme toggle (can be added in settings view)
- View transitions use `AnimatePresence` with opacity + y-axis animation for smooth switching

## Verification

- ESLint passes with no errors
- Dev server compiles successfully (HTTP 200)
- All files use proper TypeScript typing
- No indigo or blue colors used - only primary (red #FF0000) accent
