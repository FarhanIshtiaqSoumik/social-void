'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Inbox, Search, X, BadgeCheck, UserPlus, Plus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { PostCard, PostCardSkeleton, type PostData } from './post-card'
import { useAppStore } from '@/stores/app-store'
import { StoryCircles } from '@/components/stories/story-circles'

interface SearchResultUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
  bio: string | null
}

interface SearchResults {
  users: SearchResultUser[]
  posts: PostData[]
}

export function FeedView() {
  const { token, setViewingUserId, feedRefreshKey } = useAppStore()
  const [posts, setPosts] = useState<PostData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults>({ users: [], posts: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Notification count state
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchPosts = useCallback(
    async (currentCursor?: string | null, isRefresh = false) => {
      if (!token) return

      const loadingSetter = isRefresh || !currentCursor ? setIsLoading : setIsLoadingMore

      try {
        loadingSetter(true)
        const params = new URLSearchParams({
          type: 'feed',
          limit: '10',
        })
        if (currentCursor) {
          params.set('cursor', currentCursor)
        }

        const res = await fetch(`/api/posts?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          const newPosts = data.posts || []

          if (isRefresh || !currentCursor) {
            setPosts(newPosts)
          } else {
            setPosts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id))
              const filtered = newPosts.filter((p: PostData) => !existingIds.has(p.id))
              return [...prev, ...filtered]
            })
          }

          setCursor(data.nextCursor)
          setHasMore(!!data.nextCursor && newPosts.length > 0)
        }
      } catch {
        // Silently fail
      } finally {
        loadingSetter(false)
      }
    },
    [token]
  )

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotificationCount((data.notifications || []).length)
      }
    } catch {
      // Silently fail
    }
  }, [token])

  // Search handler with debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (!query.trim()) {
        setIsSearchActive(false)
        setSearchResults({ users: [], posts: [] })
        return
      }

      setIsSearchActive(true)
      setIsSearching(true)

      debounceRef.current = setTimeout(async () => {
        try {
          const [usersRes, postsRes] = await Promise.all([
            fetch(`/api/users?type=search&q=${encodeURIComponent(query)}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/posts?type=search&q=${encodeURIComponent(query)}&limit=5`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ])

          const usersData = usersRes.ok ? await usersRes.json() : { users: [] }
          const postsData = postsRes.ok ? await postsRes.json() : { posts: [] }

          setSearchResults({
            users: usersData.users || [],
            posts: postsData.posts || [],
          })
        } catch {
          // Silently fail
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [token]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setIsSearchActive(false)
    setSearchResults({ users: [], posts: [] })
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Initial fetch + feedRefreshKey dependency
  useEffect(() => {
    if (token) {
      fetchPosts()
    }
  }, [token, fetchPosts, feedRefreshKey])

  // Fetch notification count on mount and every 30 seconds
  useEffect(() => {
    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [fetchNotificationCount])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchPosts(cursor)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, isLoading, cursor, fetchPosts])

  const handlePostUpdate = useCallback((updatedPost: PostData) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    )
  }, [])

  const handlePostDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  const handleRefresh = useCallback(() => {
    setCursor(null)
    setHasMore(true)
    fetchPosts(null, true)
  }, [fetchPosts])

  // Loading state (initial)
  if (isLoading) {
    return (
      <div className="max-w-[640px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <HomeHeader onRefresh={handleRefresh} isRefreshing={false} notificationCount={notificationCount} />
        <SearchBar
          query={searchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSearching={false}
        />
        <StoryCircles />
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Search results view
  if (isSearchActive) {
    return (
      <div className="max-w-[640px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <HomeHeader onRefresh={handleRefresh} isRefreshing={isLoading} notificationCount={notificationCount} />
        <SearchBar
          query={searchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSearching={isSearching}
        />
        <StoryCircles />

        {isSearching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SearchResultsList
            results={searchResults}
            onUserClick={(userId) => setViewingUserId(userId)}
          />
        )}
      </div>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="max-w-[640px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <HomeHeader onRefresh={handleRefresh} isRefreshing={false} notificationCount={notificationCount} />
        <SearchBar
          query={searchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSearching={false}
        />
        <StoryCircles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your feed is empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Follow people to see their posts here, or explore the People page to find new connections.
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => useAppStore.getState().setCurrentView('people')}
          >
            Find People
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-[640px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <HomeHeader onRefresh={handleRefresh} isRefreshing={isLoading} notificationCount={notificationCount} />
      <SearchBar
        query={searchQuery}
        onSearch={handleSearch}
        onClear={clearSearch}
        isSearching={isSearching}
      />
      <StoryCircles />

      {/* Posts */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
        >
          <PostCard
            post={post}
            onUpdate={handlePostUpdate}
            onDelete={handlePostDelete}
          />
        </motion.div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-muted-foreground py-4">
            You&apos;ve reached the end of the void.
          </p>
        )}
      </div>
    </div>
  )
}

function HomeHeader({
  onRefresh,
  isRefreshing,
  notificationCount,
}: {
  onRefresh: () => void
  isRefreshing: boolean
  notificationCount: number
}) {
  const { setShowCreatePost, setCurrentView } = useAppStore()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-primary relative"
          onClick={() => setCurrentView('notifications')}
        >
          <Bell className="size-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-primary"
          onClick={() => setShowCreatePost(true)}
        >
          <Plus className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-primary"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}

function SearchBar({
  query,
  onSearch,
  onClear,
  isSearching,
}: {
  query: string
  onSearch: (q: string) => void
  onClear: () => void
  isSearching: boolean
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search people and posts..."
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-9 pr-9 h-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-colors"
      />
      {query && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
        >
          <X className="size-3 text-muted-foreground" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <RefreshCw className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

function SearchResultsList({
  results,
  onUserClick,
}: {
  results: SearchResults
  onUserClick: (userId: string) => void
}) {
  const { users, posts } = results
  const hasResults = users.length > 0 || posts.length > 0

  if (!hasResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try searching for different keywords or usernames.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Users Section */}
      {users.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            People
          </h3>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {users.map((user, index) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onUserClick(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="size-10 shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {(user.name || user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">
                      {user.name || user.username}
                    </span>
                    {user.isVerified && (
                      <BadgeCheck className="size-4 text-blue-500 fill-blue-500/10 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.bio}
                    </p>
                  )}
                </div>
                <UserPlus className="size-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Posts
          </h3>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
